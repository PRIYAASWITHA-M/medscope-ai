"""
MedScope AI — AI / NLP Medical Text Processor

Strategy (in order):
  1. Google Gemini API  — if GEMINI_API_KEY env var is set
  2. OpenAI API         — if OPENAI_API_KEY env var is set
  3. Rule-based parser  — always available, no API key needed (demo/hackathon mode)

The output schema returned by all strategies is identical:
{
  "patient":   { "name", "id", "dob" },
  "events":    [ { "date", "event", "clinical" } ],
  "medicines": [ { "name", "dosage", "source" } ],
  "tests":     [ { "name", "date", "result" } ]
}
"""

import os
import json
import re


# ── Public entry point ───────────────────────────────────────────

def process_medical_text(text: str, filename: str = "document.pdf") -> dict:
    """
    Process extracted PDF text and return structured medical data.
    Automatically chooses the best available strategy.
    """
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
    import google.generativeai as genai  # pip install google-generativeai

    genai.configure(api_key=os.getenv("GEMINI_API_KEY"))
    model = genai.GenerativeModel("gemini-1.5-flash")

    prompt = _build_prompt(text, filename)
    response = model.generate_content(prompt)

    return _parse_json_response(response.text)


# ── Strategy 2: OpenAI ───────────────────────────────────────────

def _process_with_openai(text: str, filename: str) -> dict:
    from openai import OpenAI  # pip install openai

    client = OpenAI(api_key=os.getenv("OPENAI_API_KEY"))
    prompt = _build_prompt(text, filename)

    response = client.chat.completions.create(
        model="gpt-4o-mini",
        messages=[
            {"role": "system", "content": "You are a medical document AI assistant. Always respond with valid JSON only."},
            {"role": "user",   "content": prompt},
        ],
        temperature=0.1,
    )
    return _parse_json_response(response.choices[0].message.content)


# ── Strategy 3: Rule-based (no API key needed) ───────────────────

def _process_with_rules(text: str, filename: str) -> dict:
    """
    Lightweight regex + keyword parser for demo / hackathon use.
    Works without any external API.
    """
    lines  = [l.strip() for l in text.splitlines() if l.strip()]
    result = {
        "patient":   _extract_patient(lines, text),
        "events":    _extract_events(lines, text, filename),
        "medicines": _extract_medicines(lines, text, filename),
        "tests":     _extract_tests(lines, text),
    }
    return result


# ── Rule-based helpers ───────────────────────────────────────────

def _extract_patient(lines: list, text: str) -> dict:
    patient = {"name": "Not specified", "id": "Not specified", "dob": "Not specified"}

    for line in lines:
        ll = line.lower()
        if "patient name" in ll or "name:" in ll:
            val = re.split(r"[:\-]", line, 1)[-1].strip()
            if val:
                patient["name"] = val
        if "patient id" in ll or "id:" in ll or "mrn" in ll:
            val = re.split(r"[:\-]", line, 1)[-1].strip()
            if val:
                patient["id"] = val
        if "date of birth" in ll or "dob" in ll or "d.o.b" in ll:
            val = re.split(r"[:\-]", line, 1)[-1].strip()
            if val:
                patient["dob"] = val

    return patient


DATE_PATTERN = re.compile(
    r'\b(\d{1,2}[\s\-/]\w+[\s\-/]\d{4}|\w+\s+\d{1,2},?\s+\d{4}|\d{4}[\-/]\d{2}[\-/]\d{2})\b'
)

EVENT_KEYWORDS = [
    "consultation", "visit", "admitted", "discharge", "diagnosis",
    "checkup", "examination", "follow-up", "review", "surgery", "procedure"
]

def _extract_events(lines: list, text: str, filename: str) -> list:
    events = []
    dates  = DATE_PATTERN.findall(text)
    first_date = dates[0] if dates else "See document"

    for line in lines:
        ll = line.lower()
        if any(kw in ll for kw in EVENT_KEYWORDS):
            events.append({
                "date":     first_date,
                "event":    line[:120],
                "clinical": "Extracted from uploaded document — verify with original."
            })
        if len(events) >= 3:
            break

    if not events:
        events.append({
            "date":     first_date or "See document",
            "event":    "Medical event recorded in document",
            "clinical": "Please refer to the original uploaded document for full details."
        })

    return events


MEDICINE_KEYWORDS = [
    "tablet", "capsule", "syrup", "injection", "mg", "ml",
    "prescribed", "dose", "medicine", "drug", "medication"
]

def _extract_medicines(lines: list, text: str, filename: str) -> list:
    medicines = []
    for line in lines:
        ll = line.lower()
        if any(kw in ll for kw in MEDICINE_KEYWORDS):
            medicines.append({
                "name":   line[:80],
                "dosage": "As recorded in document",
                "source": filename
            })
        if len(medicines) >= 4:
            break

    if not medicines:
        medicines.append({
            "name":   "See uploaded document",
            "dosage": "As recorded in document",
            "source": filename
        })

    return medicines


TEST_KEYWORDS = [
    "blood test", "urine test", "x-ray", "xray", "mri", "ct scan",
    "ecg", "ekg", "biopsy", "pathology", "haemoglobin", "glucose",
    "cholesterol", "creatinine", "report", "result", "investigation"
]

def _extract_tests(lines: list, text: str) -> list:
    tests  = []
    dates  = DATE_PATTERN.findall(text)
    date   = dates[0] if dates else "See document"

    for line in lines:
        ll = line.lower()
        if any(kw in ll for kw in TEST_KEYWORDS):
            tests.append({
                "name":   line[:80],
                "date":   date,
                "result": "Recorded in uploaded document"
            })
        if len(tests) >= 4:
            break

    if not tests:
        tests.append({
            "name":   "See uploaded document",
            "date":   date,
            "result": "Recorded in uploaded document"
        })

    return tests


# ── Shared helpers ────────────────────────────────────────────────

def _build_prompt(text: str, filename: str) -> str:
    # Limit text to ~3000 chars to stay within token limits
    truncated = text[:3000] + ("..." if len(text) > 3000 else "")
    return f"""
You are a medical document AI. Extract structured information from the text below.

Return ONLY valid JSON with this exact schema (no markdown, no explanation):
{{
  "patient": {{
    "name": "string",
    "id": "string",
    "dob": "string"
  }},
  "events": [
    {{
      "date": "string",
      "event": "string",
      "clinical": "string"
    }}
  ],
  "medicines": [
    {{
      "name": "string",
      "dosage": "string",
      "source": "{filename}"
    }}
  ],
  "tests": [
    {{
      "name": "string",
      "date": "string",
      "result": "string"
    }}
  ]
}}

Document text:
{truncated}
"""


def _parse_json_response(raw: str) -> dict:
    """Strip markdown fences and parse JSON from AI response."""
    cleaned = re.sub(r"```(?:json)?|```", "", raw).strip()
    try:
        return json.loads(cleaned)
    except json.JSONDecodeError:
        # Try to extract the JSON object portion
        match = re.search(r"\{.*\}", cleaned, re.DOTALL)
        if match:
            return json.loads(match.group())
        raise ValueError(f"Could not parse AI response as JSON: {cleaned[:200]}")
