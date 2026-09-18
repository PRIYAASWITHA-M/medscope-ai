"""
MedScope AI — PDF Text Extractor
Supports:
  1. Text-based PDFs  → PyMuPDF direct extraction
  2. Scanned PDFs     → PyMuPDF renders page as image → Tesseract OCR
  3. Fallback         → pdfplumber
"""

import os
import io


def extract_text_from_pdf(file_path: str) -> str:
    """
    Extract all text from a PDF. Automatically uses OCR for scanned pages.
    Returns full extracted text as a string.
    """
    if not os.path.exists(file_path):
        raise FileNotFoundError(f"PDF not found: {file_path}")

    # ── Primary: PyMuPDF with OCR fallback per page ───────────────
    try:
        import fitz  # PyMuPDF

        text_parts = []
        with fitz.open(file_path) as doc:
            for page_num, page in enumerate(doc, start=1):
                # Try direct text extraction first
                page_text = page.get_text("text").strip()

                # If page has very little text → likely scanned → use OCR
                if len(page_text) < 50:
                    page_text = _ocr_page(page, page_num)

                if page_text.strip():
                    text_parts.append(f"--- Page {page_num} ---\n{page_text}")

        extracted = "\n".join(text_parts)
        if extracted.strip():
            return extracted

    except ImportError:
        pass
    except Exception as e:
        print(f"[pdf_extractor] PyMuPDF error: {e}")

    # ── Fallback: pdfplumber ──────────────────────────────────────
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

    return ""


def _ocr_page(page, page_num: int) -> str:
    """
    Render a PDF page as image and run Tesseract OCR on it.
    Requires: pip install pytesseract Pillow
    Also requires Tesseract binary: https://github.com/UB-Mannheim/tesseract/wiki
    """
    try:
        import pytesseract
        from PIL import Image

        # Render page at 2x resolution for better OCR accuracy
        mat  = page.get_pixmap(matrix=page.transformation_matrix * 2)  # type: ignore
        img  = Image.open(io.BytesIO(mat.tobytes("png")))

        # Run OCR — supports English + Tamil + Hindi
        ocr_text = pytesseract.image_to_string(
            img,
            lang="eng+tam+hin",   # install: tesseract-ocr-tam tesseract-ocr-hin
            config="--psm 6"
        )
        print(f"[pdf_extractor] OCR applied to page {page_num}")
        return ocr_text

    except ImportError:
        print("[pdf_extractor] pytesseract not installed — skipping OCR for scanned page")
        return ""
    except Exception as e:
        print(f"[pdf_extractor] OCR error on page {page_num}: {e}")
        return ""
