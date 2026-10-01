import os
import re
import json
import time
import base64
import hashlib
from datetime import datetime
from dotenv import load_dotenv
import pdfplumber
import pymupdf

import database

# Load environment variables from .env
load_dotenv()

def calculate_file_hash(file_bytes):
    """Compute SHA-256 hash of the uploaded PDF file."""
    return hashlib.sha256(file_bytes).hexdigest()

def extract_text_and_check_type(file_bytes):
    """
    Extracts text from PDF.
    Returns (raw_text, is_scanned_or_image, first_page_png_bytes)
    """
    raw_text = ""
    try:
        import io
        with pdfplumber.open(io.BytesIO(file_bytes)) as pdf:
            for page in pdf.pages:
                page_text = page.extract_text()
                if page_text:
                    raw_text += page_text + "\n"
    except Exception as e:
        raw_text = ""

    # Check if text is sufficient or if it's a scanned/image PDF
    is_scanned = len(raw_text.strip()) < 40
    png_bytes = None

    if is_scanned:
        try:
            doc = pymupdf.open(stream=file_bytes, filetype="pdf")
            if len(doc) > 0:
                pix = doc[0].get_pixmap(dpi=150)
                png_bytes = pix.tobytes("png")
            doc.close()
        except Exception as e:
            pass

    return raw_text, is_scanned, png_bytes

def parse_with_heuristics(raw_text):
    """
    Robust deterministic fallback extractor if Groq API key is not configured
    or if API calls fail after retries. Guarantees 0 crashes.
    """
    extracted = {
        "vendor_name": None,
        "vendor_gstin": None,
        "invoice_number": None,
        "invoice_date": None,
        "po_number": None,
        "line_items": [],
        "subtotal": 0.0,
        "tax": 0.0,
        "total": 0.0,
        "bank_account": None,
        "confidences": {
            "vendor_name": 0.0,
            "vendor_gstin": 0.0,
            "invoice_number": 0.0,
            "invoice_date": 0.0,
            "po_number": 0.0,
            "line_items": 0.0,
            "subtotal": 0.0,
            "tax": 0.0,
            "total": 0.0,
            "bank_account": 0.0
        }
    }

    if not raw_text:
        return extracted

    lines = [line.strip() for line in raw_text.splitlines() if line.strip()]

    # 1. Vendor Name
    # Check known registered vendors first or take first significant line
    known_vendors = ["Acme Tech Solutions", "Bharat Industrial Supplies", "Cybertron Logistics", "Zenith Stationery Ltd", "Deccan Office Systems"]
    for v in known_vendors:
        if v.lower() in raw_text.lower():
            extracted["vendor_name"] = v
            extracted["confidences"]["vendor_name"] = 0.98
            break
    if not extracted["vendor_name"] and lines:
        extracted["vendor_name"] = lines[0]
        extracted["confidences"]["vendor_name"] = 0.85

    # 2. GSTIN (15 character standard Indian GSTIN)
    gstin_match = re.search(r'\b[0-9]{2}[A-Z]{5}[0-9]{4}[A-Z]{1}[1-9A-Z]{1}Z[0-9A-Z]{1}\b', raw_text)
    if gstin_match:
        extracted["vendor_gstin"] = gstin_match.group(0)
        extracted["confidences"]["vendor_gstin"] = 0.99

    # 3. Invoice Number
    inv_match = re.search(r'(?:Invoice\s*(?:Number|No\.?)|INV-)\s*[:#]?\s*([A-Za-z0-9\-]+)', raw_text, re.IGNORECASE)
    if inv_match:
        extracted["invoice_number"] = inv_match.group(1).strip()
        extracted["confidences"]["invoice_number"] = 0.96
    else:
        inv_match2 = re.search(r'\b(INV-[0-9]{4}-[0-9A-Za-z]+)\b', raw_text)
        if inv_match2:
            extracted["invoice_number"] = inv_match2.group(1).strip()
            extracted["confidences"]["invoice_number"] = 0.95

    # 4. Invoice Date
    date_match = re.search(r'\b(20[2-3][0-9]-[0-1][0-9]-[0-3][0-9])\b', raw_text)
    if date_match:
        extracted["invoice_date"] = date_match.group(1)
        extracted["confidences"]["invoice_date"] = 0.97
    else:
        date_match2 = re.search(r'\b([0-3]?[0-9][/-][0-1]?[0-9][/-]20[2-3][0-9])\b', raw_text)
        if date_match2:
            extracted["invoice_date"] = date_match2.group(1)
            extracted["confidences"]["invoice_date"] = 0.90

    # 5. PO Number
    po_match = re.search(r'\b(PO-[0-9]{4}-[0-9]{3,4})\b', raw_text, re.IGNORECASE)
    if po_match:
        extracted["po_number"] = po_match.group(1).upper()
        extracted["confidences"]["po_number"] = 0.97
    else:
        po_match2 = re.search(r'PO\s*Number\s*[:#]?\s*([A-Za-z0-9\-]+)', raw_text, re.IGNORECASE)
        if po_match2:
            extracted["po_number"] = po_match2.group(1).strip()
            extracted["confidences"]["po_number"] = 0.92

    # 6. Bank Account
    bank_match = re.search(r'(?:Bank\s*Account|Account|Acc(?:\s*No\.?)?)\s*[:#]?\s*([A-Za-z0-9]{9,18})', raw_text, re.IGNORECASE)
    if bank_match:
        extracted["bank_account"] = bank_match.group(1).strip()
        extracted["confidences"]["bank_account"] = 0.95

    # 7. Subtotal, Tax, Total with strict word boundaries
    subtotal_match = re.search(r'\bSubtotal\s*[:]?\s*(?:Rs\.?|INR)?\s*([0-9,]+(?:\.[0-9]{2})?)', raw_text, re.IGNORECASE)
    if subtotal_match:
        try:
            val = float(subtotal_match.group(1).replace(",", ""))
            extracted["subtotal"] = val
            extracted["confidences"]["subtotal"] = 0.96
        except Exception:
            pass

    tax_match = re.search(r'\b(?:Tax\s*(?:\(GST\))?|GST)\s*[:]?\s*(?:Rs\.?|INR)?\s*([0-9,]+(?:\.[0-9]{2})?)', raw_text, re.IGNORECASE)
    if tax_match:
        try:
            val = float(tax_match.group(1).replace(",", ""))
            extracted["tax"] = val
            extracted["confidences"]["tax"] = 0.96
        except Exception:
            pass

    total_match = re.search(r'\bTotal(?:\s*Amount)?\s*[:]?\s*(?:Rs\.?|INR)?\s*([0-9,]+(?:\.[0-9]{2})?)', raw_text, re.IGNORECASE)
    if total_match:
        try:
            val = float(total_match.group(1).replace(",", ""))
            extracted["total"] = val
            extracted["confidences"]["total"] = 0.98
        except Exception:
            pass

    # 8. Line Items
    for line in lines:
        item_m = re.search(r'(?:^[0-9]{1,3}\s+)?([A-Za-z\s]{3,50})\s+([0-9]{1,4})\s+(?:Rs\.?\s*)?([0-9,]+(?:\.[0-9]{2})?)\s+(?:Rs\.?\s*)?([0-9,]+(?:\.[0-9]{2})?)', line)
        if item_m:
            desc = item_m.group(1).strip()
            qty = float(item_m.group(2))
            price = float(item_m.group(3).replace(",", ""))
            if desc.lower() not in ["item description", "qty", "amount", "total amount", "tax"]:
                extracted["line_items"].append({
                    "description": desc,
                    "qty": qty,
                    "unit_price": price
                })
    if extracted["line_items"]:
        extracted["confidences"]["line_items"] = 0.96
    else:
        # Fallback single item from subtotal
        if extracted["subtotal"] > 0:
            extracted["line_items"].append({
                "description": "General Invoiced Goods / Services",
                "qty": 1.0,
                "unit_price": extracted["subtotal"]
            })
            extracted["confidences"]["line_items"] = 0.75

    return extracted

def extract_with_groq(file_bytes, raw_text, is_scanned, png_bytes, api_key):
    """
    Extracts invoice metadata using the Groq SDK with JSON mode and temperature 0.
    Retries up to 3 times on 429 rate limit.
    """
    from groq import Groq

    client = Groq(api_key=api_key)

    system_prompt = """You are an elite automated invoice extraction system.
Extract the structured data from the invoice into valid JSON matching this schema exactly:
{
  "vendor_name": "string",
  "vendor_gstin": "string or null",
  "invoice_number": "string or null",
  "invoice_date": "YYYY-MM-DD or null",
  "po_number": "string or null",
  "line_items": [
    {"description": "string", "qty": 0.0, "unit_price": 0.0}
  ],
  "subtotal": 0.0,
  "tax": 0.0,
  "total": 0.0,
  "bank_account": "string or null",
  "confidences": {
    "vendor_name": 0.99,
    "vendor_gstin": 0.99,
    "invoice_number": 0.99,
    "invoice_date": 0.99,
    "po_number": 0.95,
    "line_items": 0.95,
    "subtotal": 0.99,
    "tax": 0.99,
    "total": 0.99,
    "bank_account": 0.95
  }
}
Notes:
- Numerical values must be floats or ints without currency symbols.
- Confidence must be between 0.0 and 1.0. If a field cannot be found or is ambiguous, set confidence to 0.0.
- Return ONLY valid JSON. No other text."""

    user_prompt = f"Extract all invoice fields from this document:\n\n{raw_text}"

    # Select model based on PDF type
    model_name = "meta-llama/llama-4-scout-17b-16e-instruct" if is_scanned else "llama-3.3-70b-versatile"

    messages = [{"role": "system", "content": system_prompt}]

    if is_scanned and png_bytes:
        base64_img = base64.b64encode(png_bytes).decode("utf-8")
        messages.append({
            "role": "user",
            "content": [
                {"type": "text", "text": "Extract all invoice fields from this scanned invoice image in JSON mode."},
                {"type": "image_url", "image_url": {"url": f"data:image/png;base64,{base64_img}"}}
            ]
        })
    else:
        messages.append({
            "role": "user",
            "content": user_prompt
        })

    # Retry up to 3 times on 429
    max_retries = 3
    for attempt in range(max_retries + 1):
        try:
            response = client.chat.completions.create(
                model=model_name,
                messages=messages,
                temperature=0.0,
                response_format={"type": "json_object"}
            )
            content = response.choices[0].message.content
            parsed = json.loads(content)
            return parsed
        except Exception as e:
            err_str = str(e).lower()
            if ("429" in err_str or "rate limit" in err_str) and attempt < max_retries:
                wait_time = 2 ** attempt
                time.sleep(wait_time)
                continue
            else:
                # If error on final attempt, re-raise to trigger heuristic fallback
                raise e

def extract_invoice_data(file_bytes, filename="uploaded.pdf"):
    """
    Main extraction pipeline:
    1. Checks cache by SHA-256 file hash.
    2. Identifies text vs scanned.
    3. Calls Groq with model llama-3.3-70b-versatile or meta-llama/llama-4-scout-17b-16e-instruct.
    4. Handles 429 retries and missing fields with 0 confidence.
    5. Caches and returns normalized dictionary.
    """
    file_hash = calculate_file_hash(file_bytes)

    # 1. Check cache in SQLite
    cached = database.get_cached_extraction(file_hash)
    if cached:
        cached["file_hash"] = file_hash
        cached["from_cache"] = True
        return cached

    # 2. Extract raw text and detect scanned
    raw_text, is_scanned, png_bytes = extract_text_and_check_type(file_bytes)

    # Required fields and default confidence dict
    required_fields = ["vendor_name", "vendor_gstin", "invoice_number", "invoice_date", "po_number", "line_items", "subtotal", "tax", "total", "bank_account"]
    extracted = None

    # 3. Check for GROQ_API_KEY
    groq_api_key = os.getenv("GROQ_API_KEY", "").strip()

    if groq_api_key:
        try:
            extracted = extract_with_groq(file_bytes, raw_text, is_scanned, png_bytes, groq_api_key)
        except Exception as groq_err:
            database.add_audit_log(
                stage="EXTRACTION",
                action="GROQ_API_FALLBACK",
                details=f"Groq API call encountered an error: {str(groq_err)[:150]}. Falling back to deterministic parser.",
                actor="System"
            )
            extracted = None

    # Fallback heuristic parser if Groq was not available or failed
    if not extracted:
        extracted = parse_with_heuristics(raw_text)

    # Guarantee all required fields exist and validate confidences
    if "confidences" not in extracted or not isinstance(extracted["confidences"], dict):
        extracted["confidences"] = {}

    for f in required_fields:
        if f not in extracted or extracted[f] is None or extracted[f] == "":
            extracted["confidences"][f] = 0.0
        else:
            # Ensure confidence is a float between 0 and 1
            cur_conf = extracted["confidences"].get(f, 0.95)
            try:
                cur_conf = float(cur_conf)
                cur_conf = max(0.0, min(1.0, cur_conf))
            except Exception:
                cur_conf = 0.0
            extracted["confidences"][f] = cur_conf

    # Ensure numeric types
    for num_col in ["subtotal", "tax", "total"]:
        try:
            extracted[num_col] = float(extracted.get(num_col) or 0.0)
        except Exception:
            extracted[num_col] = 0.0
            extracted["confidences"][num_col] = 0.0

    # Ensure line items is a list
    if not isinstance(extracted.get("line_items"), list):
        extracted["line_items"] = []
        extracted["confidences"]["line_items"] = 0.0

    extracted["raw_text"] = raw_text
    extracted["file_hash"] = file_hash
    extracted["from_cache"] = False
    extracted["is_scanned"] = is_scanned

    # Cache result in SQLite
    database.set_cached_extraction(file_hash, extracted)

    return extracted
