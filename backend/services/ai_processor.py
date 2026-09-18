"""
MedScope AI — AI Medical Text Processor

Strategies (auto-selected):
  1. Google Gemini API  → if GEMINI_API_KEY set
  2. OpenAI API         → if OPENAI_API_KEY set
  3. Rule-based parser  → always works (demo mode)

Output schema (identical for all strategies):
{
  "patient":   { "name", "id", "dob", "age", "gender" },
  "events":    [ { "date", "event", "clinical" } ],
  "medicines": [ { "name", "dosage", "frequency", "source" } ],
  "tests":     [ { "name", "date", "value", "unit", "reference", "result" } ],
  "diagnosis": [ "string" ],
  "follow_up": "string",
  "summary":   "string"
}
"""

import os
import json
import re


# ── Public entry point ───────────────────────────────────────────

def process_medical_text(text: str, filename: str = "document.pdf") -> dict:
    """Auto-selects best available AI strategy."""

    if os.getenv("GEMINI_API_KEY"):
        try:
            return _process_with_gemini(text, filename)
        except Exception as e:
            print(f"[ai_processor] Gemini failed: {e} — falling back")

    if os.getenv("OPENAI_API_KEY"):
        try:
            return _process_with_openai(text, filename)
        except Exception as e:
            print(f"[ai_processor] OpenAI failed: {e} — falling back")

    return _process_with_rules(text, filename)


# ── Strategy 1: Google Gemini ────────────────────────────────────

def _process_with_gemini(text: str, filename: str) -> dict:
    import google.generativeai as genai
    genai.configure(api_key=os.getenv("GEMINI_API_KEY"))
    model    = genai.GenerativeModel("gemini-1.5-flash")
    prompt   = _build_prompt(text, filename)
    response = model.generate_content(prompt)
    result   = _parse_json_response(response.text)
    result["_source"] = "gemini"
    return result


# ── Strategy 2: OpenAI ───────────────────────────────────────────

def _process_with_openai(text: str, filename: str) -> dict:
    from openai import OpenAI
    client   = OpenAI(api_key=os.getenv("OPENAI_API_KEY"))
    prompt   = _build_prompt(text, filename)
    response = client.chat.completions.create(
        model="gpt-4o-mini",
        messages=[
            {"role": "system", "content": "You are a medical AI. Return valid JSON only."},
            {"role": "user",   "content": prompt},
        ],
        temperature=0.1,
    )
    result = _parse_json_response(response.choices[0].message.content)
    result["_source"] = "openai"
    return result


# ── Strategy 3: Rule-based ───────────────────────────────────────

def _process_with_rules(text: str, filename: str) -> dict:
    lines = [l.strip() for l in text.splitlines() if l.strip()]
    return {
        "patient":   _extract_patient(lines, text),
        "events":    _extract_events(lines, text),
        "medicines": _extract_medicines(lines, text, filename),
        "tests":     _extract_tests(lines, text),
        "diagnosis": _extract_diagnosis(lines, text),
        "follow_up": _extract_followup(lines, text),
        "summary":   _build_summary(lines, text),
        "_source":   "rules",
    }


# ── Rule-based helpers ────────────────────────────────────────────

DATE_RE = re.compile(
    r'\b(\d{1,2}[\s\-/]\w{3,9}[\s\-/]\d{4}|\w{3,9}\s+\d{1,2},?\s+\d{4}|\d{4}[\-/]\d{2}[\-/]\d{2}|\d{1,2}[\-/]\d{1,2}[\-/]\d{4})\b',
    re.IGNORECASE
)

def _extract_patient(lines, text):
    p = {"name": "Not found", "id": "Not found", "dob": "Not found", "age": "Not found", "gender": "Not found"}
    for line in lines:
        ll = line.lower()
        val = re.split(r'[:\-]', line, 1)[-1].strip()
        if not val:
            continue
        if any(k in ll for k in ["patient name", "name :"]):
            p["name"] = val
        if any(k in ll for k in ["patient id", "pid", "mrn", "op no", "uhid"]):
            p["id"] = val
        if any(k in ll for k in ["date of birth", "dob", "d.o.b"]):
            p["dob"] = val
        if "age" in ll and re.search(r'\d+', val):
            p["age"] = re.search(r'\d+', val).group() + " years"
        if "gender" in ll or "sex" in ll:
            p["gender"] = val
    return p


EVENT_KW = ["consultation", "visit", "admitted", "discharge", "diagnosis",
            "checkup", "examination", "follow-up", "review", "surgery", "procedure", "opd"]

def _extract_events(lines, text):
    events = []
    dates  = DATE_RE.findall(text)
    for i, line in enumerate(lines):
        ll = line.lower()
        if any(k in ll for k in EVENT_KW):
            date = dates[0] if dates else "See document"
            # Try to find date in nearby lines
            nearby = " ".join(lines[max(0,i-2):i+2])
            found  = DATE_RE.findall(nearby)
            if found:
                date = found[0]
            events.append({"date": date, "event": line[:120], "clinical": "Extracted from document."})
        if len(events) >= 5:
            break
    if not events:
        events.append({"date": dates[0] if dates else "See document",
                        "event": "Medical visit recorded", "clinical": "Refer to original document."})
    return events


MED_KW = ["tablet", "cap", "capsule", "syrup", "injection", "inj", "mg", "ml",
          "prescribed", "medicine", "drug", "rx", "tab ", "once", "twice", "daily"]

def _extract_medicines(lines, text, filename):
    meds = []
    for line in lines:
        ll = line.lower()
        if any(k in ll for k in MED_KW) and len(line) > 5:
            # Try to extract dosage (e.g., 500mg, 10ml)
            dosage_match = re.search(r'\d+\s*(?:mg|ml|mcg|IU|units?)', line, re.IGNORECASE)
            freq_match   = re.search(r'(?:once|twice|thrice|od|bd|tds|qid|daily|weekly|morning|night)', line, re.IGNORECASE)
            meds.append({
                "name":      line[:80],
                "dosage":    dosage_match.group() if dosage_match else "As prescribed",
                "frequency": freq_match.group() if freq_match else "As directed",
                "source":    filename
            })
        if len(meds) >= 6:
            break
    if not meds:
        meds.append({"name": "See document", "dosage": "As prescribed", "frequency": "As directed", "source": filename})
    return meds


TEST_KW = ["blood", "urine", "haemoglobin", "hb", "wbc", "rbc", "glucose", "sugar",
           "creatinine", "cholesterol", "bp", "pulse", "x-ray", "mri", "ct", "ecg",
           "bilirubin", "sgpt", "sgot", "sodium", "potassium", "platelet", "tsh"]

def _extract_tests(lines, text):
    tests  = []
    dates  = DATE_RE.findall(text)
    date   = dates[0] if dates else "See document"
    for line in lines:
        ll = line.lower()
        if any(k in ll for k in TEST_KW):
            val_match = re.search(r'[\d.]+\s*(?:mg/dL|g/dL|mmol/L|%|IU/L|mEq/L|cells/µL|/cmm)?', line, re.IGNORECASE)
            ref_match = re.search(r'(?:normal|ref(?:erence)?)[:\s]*([\d.\-\s]+)', line, re.IGNORECASE)
            tests.append({
                "name":      line[:60],
                "date":      date,
                "value":     val_match.group().strip() if val_match else "See report",
                "unit":      "",
                "reference": ref_match.group(1).strip() if ref_match else "See report",
                "result":    "Recorded in document"
            })
        if len(tests) >= 6:
            break
    if not tests:
        tests.append({"name": "See document", "date": date, "value": "—",
                       "unit": "", "reference": "—", "result": "Refer to original"})
    return tests


DIAG_KW = ["diagnosed", "diagnosis", "impression", "assessment", "condition", "suffering from"]

def _extract_diagnosis(lines, text):
    diags = []
    for line in lines:
        ll = line.lower()
        if any(k in ll for k in DIAG_KW):
            val = re.split(r'[:\-]', line, 1)[-1].strip()
            if val:
                diags.append(val[:100])
        if len(diags) >= 3:
            break
    return diags if diags else ["See uploaded document"]


FOLLOW_KW = ["follow.?up", "review after", "next visit", "come back", "return in"]

def _extract_followup(lines, text):
    for line in lines:
        if re.search("|".join(FOLLOW_KW), line, re.IGNORECASE):
            return line[:150]
    return "No specific follow-up mentioned"


def _build_summary(lines, text):
    dates  = DATE_RE.findall(text)
    date   = dates[0] if dates else "recent date"
    return (f"Medical document processed. Visit recorded on {date}. "
            f"Extracted {len(lines)} lines of medical data. "
            f"Please review full details in the sections below.")


# ── Shared AI helpers ─────────────────────────────────────────────

def _build_prompt(text: str, filename: str) -> str:
    truncated = text[:4000] + ("..." if len(text) > 4000 else "")
    return f"""
You are a medical document AI assistant for Indian healthcare.
Extract structured information from the medical document text below.

Return ONLY valid JSON matching this exact schema (no markdown, no extra text):
{{
  "patient": {{
    "name": "string",
    "id": "string",
    "dob": "string",
    "age": "string",
    "gender": "string"
  }},
  "events": [
    {{ "date": "string", "event": "string", "clinical": "string" }}
  ],
  "medicines": [
    {{ "name": "string", "dosage": "string", "frequency": "string", "source": "{filename}" }}
  ],
  "tests": [
    {{ "name": "string", "date": "string", "value": "string", "unit": "string", "reference": "string", "result": "string" }}
  ],
  "diagnosis": ["string"],
  "follow_up": "string",
  "summary": "2-3 sentence plain English summary of this document"
}}

Rules:
- If a field is not found, use "Not specified"
- Never guess or hallucinate values
- Extract ALL medicines and ALL lab test results
- For Indian reports: handle values in mg/dL, g/dL, IU/L etc.

Document filename: {filename}
Document text:
{truncated}
"""


def _parse_json_response(raw: str) -> dict:
    cleaned = re.sub(r"```(?:json)?|```", "", raw).strip()
    try:
        return json.loads(cleaned)
    except json.JSONDecodeError:
        match = re.search(r"\{.*\}", cleaned, re.DOTALL)
        if match:
            return json.loads(match.group())
        raise ValueError(f"Could not parse AI response: {cleaned[:300]}")
