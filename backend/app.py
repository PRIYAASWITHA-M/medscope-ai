"""
MedScope AI — Flask Backend (Production-ready)
Features:
  - SQLite persistent storage
  - JWT authentication (register / login)
  - PDF upload → OCR → AI processing
  - Patient CRUD, Documents, Appointments
  - CORS configured for Vite dev + Vercel prod
"""

import os, datetime, jwt
from functools import wraps
from flask import Flask, request, jsonify
from flask_cors import CORS
from werkzeug.security import generate_password_hash, check_password_hash
from dotenv import load_dotenv

import database as db
from services.pdf_extractor import extract_text_from_pdf
from services.ai_processor  import process_medical_text

load_dotenv()

# ── App setup ─────────────────────────────────────────────────────
app = Flask(__name__)
allowed_origins = [
    "http://localhost:5173",
    "http://127.0.0.1:5173",
    "https://medscope-ai-izd0.onrender.com",
]
if os.getenv("FRONTEND_URL"):
    allowed_origins.append(os.getenv("FRONTEND_URL").rstrip("/"))
CORS(app, origins=allowed_origins)

app.config["SECRET_KEY"]          = os.getenv("SECRET_KEY", "medscope-dev-secret-change-in-prod")
app.config["JWT_EXPIRY_HOURS"]    = 24
app.config["UPLOAD_FOLDER"]       = os.path.join(os.path.dirname(__file__), "uploads")
app.config["MAX_CONTENT_LENGTH"]  = 16 * 1024 * 1024  # 16 MB

os.makedirs(app.config["UPLOAD_FOLDER"], exist_ok=True)
db.init_db()


# ── JWT helpers ───────────────────────────────────────────────────
def make_token(patient_id: str, email: str) -> str:
    payload = {
        "patient_id": patient_id,
        "email":      email,
        "exp":        datetime.datetime.utcnow() + datetime.timedelta(hours=app.config["JWT_EXPIRY_HOURS"]),
    }
    return jwt.encode(payload, app.config["SECRET_KEY"], algorithm="HS256")


def require_auth(f):
    """Decorator — validates Bearer JWT token."""
    @wraps(f)
    def decorated(*args, **kwargs):
        auth = request.headers.get("Authorization", "")
        if not auth.startswith("Bearer "):
            return jsonify({"success": False, "message": "Missing token"}), 401
        token = auth.split(" ", 1)[1]
        try:
            payload = jwt.decode(token, app.config["SECRET_KEY"], algorithms=["HS256"])
            request.patient_id = payload["patient_id"]
            request.email      = payload["email"]
        except jwt.ExpiredSignatureError:
            return jsonify({"success": False, "message": "Token expired — please login again"}), 401
        except jwt.InvalidTokenError:
            return jsonify({"success": False, "message": "Invalid token"}), 401
        return f(*args, **kwargs)
    return decorated


# ── Health check ──────────────────────────────────────────────────
@app.route("/")
def home():
    return jsonify({"status": "ok", "message": "MedScope AI Backend Running", "version": "2.0"})


# ══════════════════════════════════════════════════════════════════
# AUTH
# ══════════════════════════════════════════════════════════════════

@app.route("/auth/register", methods=["POST"])
def register():
    data       = request.get_json() or {}
    email      = data.get("email", "").strip().lower()
    password   = data.get("password", "")
    patient_id = data.get("patient_id", "")

    if not email or not password or not patient_id:
        return jsonify({"success": False, "message": "email, password and patient_id required"}), 400

    if not db.get_patient(patient_id):
        return jsonify({"success": False, "message": "Patient ID not found"}), 404

    hashed = generate_password_hash(password)
    ok     = db.create_user(patient_id, email, hashed)
    if not ok:
        return jsonify({"success": False, "message": "Email already registered"}), 409

    token   = make_token(patient_id, email)
    patient = db.get_patient(patient_id)
    return jsonify({"success": True, "token": token, "patient": patient}), 201


@app.route("/auth/login", methods=["POST"])
def login():
    data     = request.get_json() or {}
    email    = data.get("email", "").strip().lower()
    password = data.get("password", "")

    if not email or not password:
        return jsonify({"success": False, "message": "Email and password required"}), 400

    user = db.get_user_by_email(email)
    if not user or not check_password_hash(user["password"], password):
        return jsonify({"success": False, "message": "Invalid email or password"}), 401

    token   = make_token(user["patient_id"], email)
    patient = db.get_patient(user["patient_id"])
    return jsonify({"success": True, "token": token, "patient": patient})


@app.route("/auth/me", methods=["GET"])
@require_auth
def me():
    patient = db.get_patient(request.patient_id)
    return jsonify({"success": True, "patient": patient})


# ══════════════════════════════════════════════════════════════════
# PATIENTS
# ══════════════════════════════════════════════════════════════════

@app.route("/patients", methods=["GET"])
def get_patients():
    patients = db.get_all_patients()
    return jsonify({"success": True, "patients": patients})


@app.route("/patients/<patient_id>", methods=["GET"])
def get_patient(patient_id):
    patient = db.get_patient(patient_id)
    if not patient:
        return jsonify({"success": False, "message": "Patient not found"}), 404
    docs     = db.get_documents(patient_id)
    timeline = _build_timeline(docs)
    return jsonify({"success": True, "patient": patient, "documents": docs, "timeline": timeline})


# ══════════════════════════════════════════════════════════════════
# UPLOAD
# ══════════════════════════════════════════════════════════════════

@app.route("/upload", methods=["POST"])
@require_auth
def upload_document():
    if "file" not in request.files:
        return jsonify({"success": False, "message": "No file uploaded"}), 400

    file       = request.files["file"]
    patient_id = request.form.get("patient_id", request.patient_id)

    if patient_id != request.patient_id:
        return jsonify({"success": False, "message": "You can only upload documents for your own account"}), 403

    if file.filename == "":
        return jsonify({"success": False, "message": "No file selected"}), 400
    if not file.filename.lower().endswith(".pdf"):
        return jsonify({"success": False, "message": "Only PDF files allowed"}), 400
    if not db.get_patient(patient_id):
        return jsonify({"success": False, "message": "Patient not found"}), 404

    safe_name = os.path.basename(file.filename)
    file_path = os.path.join(app.config["UPLOAD_FOLDER"], f"{patient_id}_{safe_name}")
    file.save(file_path)

    # Extract + AI process
    text = extract_text_from_pdf(file_path)
    if not text.strip():
        return jsonify({
            "success": False,
            "message": "Could not extract text. File may be scanned — install Tesseract for OCR support."
        }), 422

    result      = process_medical_text(text, filename=safe_name)
    uploaded_at = db.save_document(patient_id, safe_name, result)

    docs     = db.get_documents(patient_id)
    timeline = _build_timeline(docs)

    return jsonify({
        "success":    True,
        "message":    "Document processed successfully",
        "filename":   safe_name,
        "patient_id": patient_id,
        "uploaded_at":uploaded_at,
        "result":     result,
        "timeline":   timeline,
    })


# ══════════════════════════════════════════════════════════════════
# APPOINTMENTS
# ══════════════════════════════════════════════════════════════════

@app.route("/appointments", methods=["POST"])
@require_auth
def book_appointment():
    data = request.get_json() or {}
    for field in ["patient_id", "doctor", "date", "time", "reason"]:
        if not data.get(field):
            return jsonify({"success": False, "message": f"Missing: {field}"}), 400

    if data["patient_id"] != request.patient_id:
        return jsonify({"success": False, "message": "You can only book appointments for your own account"}), 403

    appt_id = db.save_appointment(
        data["patient_id"], data["doctor"],
        data.get("specialty", ""), data["date"],
        data["time"], data["reason"]
    )
    return jsonify({
        "success": True,
        "message": "Appointment booked",
        "appointment": {
            "id":         appt_id,
            "patient_id": data["patient_id"],
            "doctor":     data["doctor"],
            "specialty":  data.get("specialty", ""),
            "date":       data["date"],
            "time":       data["time"],
            "reason":     data["reason"],
            "status":     "Confirmed",
        }
    }), 201


@app.route("/appointments/<patient_id>", methods=["GET"])
@require_auth
def get_appointments(patient_id):
    if patient_id != request.patient_id:
        return jsonify({"success": False, "message": "You can only view your own appointments"}), 403
    appts = db.get_appointments(patient_id)
    return jsonify({"success": True, "appointments": appts})


@app.route("/appointments/<int:appt_id>/cancel", methods=["PATCH"])
@require_auth
def cancel_appointment(appt_id):
    appointment = db.get_appointment(appt_id)
    if not appointment or appointment["patient_id"] != request.patient_id:
        return jsonify({"success": False, "message": "Appointment not found"}), 404
    db.cancel_appointment(appt_id)
    return jsonify({"success": True, "message": "Appointment cancelled"})


# ══════════════════════════════════════════════════════════════════
# TIMELINE
# ══════════════════════════════════════════════════════════════════

@app.route("/patients/<patient_id>/timeline", methods=["GET"])
@require_auth
def get_timeline(patient_id):
    if patient_id != request.patient_id:
        return jsonify({"success": False, "message": "You can only view your own timeline"}), 403
    docs     = db.get_documents(patient_id)
    timeline = _build_timeline(docs)
    return jsonify({"success": True, "timeline": timeline})


# ── Timeline builder ──────────────────────────────────────────────
def _build_timeline(documents):
    timeline = []
    for doc in documents:
        r = doc.get("result", {})
        for ev in r.get("events", []):
            timeline.append({"date": ev.get("date"), "title": ev.get("event"), "type": "Event",
                              "source": doc["filename"], "clinical": ev.get("clinical",""), "icon": "🩺"})
        for d in r.get("diagnosis", []):
            if d and d != "See uploaded document":
                timeline.append({"date": doc["uploaded_at"], "title": f"Diagnosis: {d}",
                                  "type": "Diagnosis", "source": doc["filename"], "icon": "🏥"})
        meds = [m for m in r.get("medicines", []) if m.get("name") != "See document"]
        if meds:
            timeline.append({"date": doc["uploaded_at"],
                              "title": f"Prescribed: {', '.join(m['name'][:25] for m in meds[:2])}",
                              "type": "Medicine", "source": doc["filename"],
                              "clinical": r.get("follow_up",""), "icon": "💊"})
    return timeline


# ── Error handlers ────────────────────────────────────────────────
@app.errorhandler(413)
def too_large(e):
    return jsonify({"success": False, "message": "File too large. Max 16 MB."}), 413

@app.errorhandler(404)
def not_found(e):
    return jsonify({"success": False, "message": "Endpoint not found."}), 404

@app.errorhandler(500)
def server_error(e):
    return jsonify({"success": False, "message": "Server error. Please try again."}), 500


if __name__ == "__main__":
    port = int(os.getenv("PORT", 5000))
    app.run(debug=os.getenv("FLASK_ENV") != "production", host="0.0.0.0", port=port)
