"""
MedScope AI — PDF Text Extractor
Uses PyMuPDF (fitz) as primary extractor with pdfplumber as fallback.
Both libraries handle text-based PDFs well; scanned PDFs require OCR (not included here).
"""

import os


def extract_text_from_pdf(file_path: str) -> str:
    """
    Extract all text from a PDF file.

    Tries PyMuPDF first (faster), falls back to pdfplumber.
    Returns extracted text as a single string.
    """

    if not os.path.exists(file_path):
        raise FileNotFoundError(f"PDF not found: {file_path}")

    # ── Primary: PyMuPDF ─────────────────────────────────────────
    try:
        import fitz  # PyMuPDF

        text_parts = []
        with fitz.open(file_path) as doc:
            for page_num, page in enumerate(doc, start=1):
                page_text = page.get_text("text")
                if page_text.strip():
                    text_parts.append(f"--- Page {page_num} ---\n{page_text}")

        extracted = "\n".join(text_parts)
        if extracted.strip():
            return extracted

    except ImportError:
        pass  # PyMuPDF not installed — try fallback
    except Exception as e:
        print(f"[pdf_extractor] PyMuPDF error: {e}")

    # ── Fallback: pdfplumber ─────────────────────────────────────
    try:
        import pdfplumber

        text_parts = []
        with pdfplumber.open(file_path) as pdf:
            for page_num, page in enumerate(pdf.pages, start=1):
                page_text = page.extract_text() or ""
                if page_text.strip():
                    text_parts.append(f"--- Page {page_num} ---\n{page_text}")

        extracted = "\n".join(text_parts)
        if extracted.strip():
            return extracted

    except ImportError:
        pass
    except Exception as e:
        print(f"[pdf_extractor] pdfplumber error: {e}")

    # ── Nothing worked ────────────────────────────────────────────
    return ""
