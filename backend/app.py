"""
MedScope AI — Flask Backend
Handles: PDF upload → text extraction → AI processing → structured JSON response
"""

from flask import Flask, request, jsonify
from flask_cors import CORS
import os

from services.pdf_extractor import extract_text_from_pdf
from services.ai_processor import process_medical_text

# ── App setup ────────────────────────────────────────────────────
app = Flask(__name__)
CORS(app, origins=["http://localhost:5173", "http://127.0.0.1:5173"])

UPLOAD_FOLDER = os.path.join(os.path.dirname(__file__), "uploads")
os.makedirs(UPLOAD_FOLDER, exist_ok=True)
app.config["UPLOAD_FOLDER"] = UPLOAD_FOLDER
app.config["MAX_CONTENT_LENGTH"] = 16 * 1024 * 1024  # 16 MB limit


# ── Health check ─────────────────────────────────────────────────
@app.route("/")
def home():
    return jsonify({"status": "ok", "message": "MedScope AI Backend is Running!"})


# ── Upload + Process ─────────────────────────────────────────────
@app.route("/upload", methods=["POST"])
def upload_document():
    """
    Accepts a PDF file, extracts text, runs AI processing,
    and returns structured medical data as JSON.
    """

    # 1. Validate file presence
    if "file" not in request.files:
        return jsonify({"success": False, "message": "No file uploaded"}), 400

    file = request.files["file"]

    if file.filename == "":
        return jsonify({"success": False, "message": "No file selected"}), 400

    if not file.filename.lower().endswith(".pdf"):
        return jsonify({"success": False, "message": "Only PDF files are allowed"}), 400

    # 2. Save the file
    safe_filename = os.path.basename(file.filename)  # prevent path traversal
    file_path = os.path.join(app.config["UPLOAD_FOLDER"], safe_filename)
    file.save(file_path)

    # 3. Extract text from PDF
    extracted_text = extract_text_from_pdf(file_path)

    if not extracted_text.strip():
        return jsonify({
            "success": False,
            "message": "Could not extract text from the PDF. The file may be scanned or image-based."
        }), 422

    # 4. AI processing — structure the medical data
    structured_result = process_medical_text(extracted_text, filename=safe_filename)

    return jsonify({
        "success":  True,
        "message":  "Document processed successfully",
        "filename": safe_filename,
        "result":   structured_result
    })


# ── Error handlers ────────────────────────────────────────────────
@app.errorhandler(413)
def too_large(e):
    return jsonify({"success": False, "message": "File too large. Maximum size is 16 MB."}), 413

@app.errorhandler(500)
def server_error(e):
    return jsonify({"success": False, "message": "Internal server error. Please try again."}), 500


if __name__ == "__main__":
    app.run(debug=True, port=5000)
