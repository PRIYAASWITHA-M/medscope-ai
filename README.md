# MedScope AI — React + Tailwind Frontend

## Quick Start

### 1. Frontend (React + Vite + Tailwind)

Open a terminal, go to the project folder, and run:

```bash
cd "c:\Users\sathy\OneDrive\Desktop\MedScope AI\medscope-react"
npm install
npm run dev
```

Then open: **http://localhost:5173**

---

### 2. Backend (Flask)

Open a second terminal:

```bash
cd "c:\Users\sathy\OneDrive\Desktop\MedScope AI\medscope-react\backend"
pip install -r requirements.txt
python app.py
```

Backend runs at: **http://127.0.0.1:5000**

---

### 3. AI API Key (Optional)

Copy `.env.example` to `.env` and add your key:

```bash
# For Gemini (recommended — free tier)
GEMINI_API_KEY=your_key_here
```

If no key is set, the backend uses the built-in rule-based extractor (demo mode — works without any API).

---

## Routes

| Route | Page |
|---|---|
| `/` | → redirects to Patient Landing |
| `/patient` | Patient Portal Landing |
| `/patient/login` | Patient Login |
| `/patient/register` | Patient Register |
| `/patient/dashboard` | Patient Dashboard |
| `/patient/appointments` | Appointments |
| `/patient/documents` | My Documents |
| `/upload` | Upload Medical Document |
| `/ai-results` | AI Analysis Results |
| `/timeline` | Medical Timeline |
| `/timeline/event` | Event Details |
| `/timeline/graph` | Medical Graph |
| `/doctor` | Doctor Dashboard |

---

## Project Structure

```
medscope-react/
├── src/
│   ├── App.jsx                        ← All routes
│   ├── main.jsx                       ← Entry point
│   ├── index.css                      ← Tailwind imports
│   ├── components/
│   │   └── PatientNav.jsx
│   └── pages/
│       ├── patient/
│       │   ├── PatientLanding.jsx
│       │   ├── PatientLogin.jsx
│       │   ├── PatientRegister.jsx
│       │   ├── PatientDashboard.jsx
│       │   ├── PatientAppointments.jsx
│       │   └── PatientDocuments.jsx
│       ├── documents/
│       │   ├── UploadDocuments.jsx    ← Member 2
│       │   └── AIResults.jsx          ← Member 2
│       ├── timeline/
│       │   ├── MedicalTimeline.jsx
│       │   ├── EventDetails.jsx
│       │   └── MedicalGraph.jsx
│       └── doctor/
│           └── DoctorDashboard.jsx
├── backend/
│   ├── app.py                         ← Flask server
│   ├── requirements.txt
│   ├── .env.example
│   └── services/
│       ├── pdf_extractor.py           ← PyMuPDF + pdfplumber
│       └── ai_processor.py            ← Gemini / OpenAI / rules
├── index.html
├── package.json
├── vite.config.js
├── tailwind.config.js
└── postcss.config.js
```
