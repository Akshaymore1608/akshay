import difflib
from datetime import datetime
import database

def parse_date(date_str):
    if not date_str:
        return None
    for fmt in ("%Y-%m-%d", "%d/%m/%Y", "%d-%m-%Y", "%m/%d/%Y"):
        try:
            return datetime.strptime(date_str.strip(), fmt)
        except Exception:
            pass
    return None

def validate_invoice(extracted_data, current_invoice_id=None):
    """
    Performs deterministic validation using pure Python logic:
    1. Duplicate check (same vendor + total + date within 30 days OR invoice_number difflib > 0.85)
    2. Tax check (recompute 18% GST on subtotal; flag difference > Rs 1)
    3. Vendor check (GSTIN and bank_account against vendors table)
    4. 3-way match (line item qty vs po_data ordered_qty and received_qty)
    5. Confidence threshold check (< 0.8)

    Returns a list of structured findings.
    """
    findings = []

    vendor_name = (extracted_data.get("vendor_name") or "").strip()
    vendor_gstin = (extracted_data.get("vendor_gstin") or "").strip().upper()
    invoice_number = (extracted_data.get("invoice_number") or "").strip()
    invoice_date_str = extracted_data.get("invoice_date")
    inv_date = parse_date(invoice_date_str)
    po_number = (extracted_data.get("po_number") or "").strip()
    subtotal = float(extracted_data.get("subtotal") or 0.0)
    tax = float(extracted_data.get("tax") or 0.0)
    total = float(extracted_data.get("total") or 0.0)
    bank_account = (extracted_data.get("bank_account") or "").strip()
    line_items = extracted_data.get("line_items") or []
    confidences = extracted_data.get("confidences") or {}

    # -------------------------------------------------------------
    # 1. DUPLICATE CHECK
    # -------------------------------------------------------------
    existing_invoices = database.get_all_existing_invoices()
    duplicate_detected = False
    current_hash = extracted_data.get("file_hash")

    for existing in existing_invoices:
        if current_invoice_id and existing["id"] == current_invoice_id:
            continue
        if current_hash and existing.get("file_hash") == current_hash:
            continue
        # Also ignore if exact same invoice number and vendor on same record
        existing_vendor = (existing["vendor_name"] or "").strip()
        existing_inv_num = (existing["invoice_number"] or "").strip()
        existing_total = float(existing["total"] or 0.0)
        existing_date = parse_date(existing["invoice_date"])

        # Check vendor match
        same_vendor = vendor_name.lower() == existing_vendor.lower() if (vendor_name and existing_vendor) else False

        if same_vendor:
            # Condition A: same vendor + same total + date within 30 days
            same_total = abs(total - existing_total) < 1.0 and total > 0
            within_30_days = False
            if inv_date and existing_date:
                days_diff = abs((inv_date - existing_date).days)
                if days_diff <= 30:
                    within_30_days = True

            # Condition B: invoice_number similarity > 0.85 for same vendor
            similarity = 0.0
            if invoice_number and existing_inv_num:
                similarity = difflib.SequenceMatcher(None, invoice_number.upper(), existing_inv_num.upper()).ratio()

            if (same_total and within_30_days) or (similarity > 0.85 and similarity < 1.0) or (similarity == 1.0):
                duplicate_detected = True
                reason_detail = []
                if same_total and within_30_days:
                    reason_detail.append(f"Identical total INR {total:,.2f} within 30 days of {existing_date.strftime('%Y-%m-%d') if existing_date else 'prior invoice'}")
                if similarity > 0.85:
                    reason_detail.append(f"Invoice number '{invoice_number}' has {similarity*100:.1f}% similarity with prior '{existing_inv_num}'")

                findings.append({
                    "check": "DUPLICATE",
                    "status": "FAIL",
                    "severity": "BLOCK",
                    "title": "Duplicate Invoice Detected",
                    "message": f"Potential duplicate of existing invoice '{existing_inv_num}' (Vendor: {existing_vendor}). " + "; ".join(reason_detail) + "."
                })
                break

    if not duplicate_detected:
        findings.append({
            "check": "DUPLICATE",
            "status": "PASS",
            "severity": "INFO",
            "title": "Duplicate Invoice Check",
            "message": "No duplicate invoices detected in ledger history or recent submissions."
        })

    # -------------------------------------------------------------
    # 2. TAX CHECK (Recompute 18% GST on subtotal, flag > Rs 1 difference)
    # -------------------------------------------------------------
    if subtotal > 0:
        expected_tax = round(subtotal * 0.18, 2)
        expected_total = round(subtotal + expected_tax, 2)
        diff = abs(tax - expected_tax)

        if diff > 1.0:
            findings.append({
                "check": "TAX",
                "status": "FAIL",
                "severity": "REVIEW",
                "title": "18% GST Calculation Variance",
                "message": f"Tax error: Invoiced GST is INR {tax:,.2f}, but standard 18% GST on subtotal INR {subtotal:,.2f} is INR {expected_tax:,.2f} (Difference of INR {diff:,.2f} exceeds Rs 1 threshold)."
            })
        else:
            findings.append({
                "check": "TAX",
                "status": "PASS",
                "severity": "INFO",
                "title": "GST Compliance Check",
                "message": f"Tax verified: Invoiced GST INR {tax:,.2f} precisely matches expected 18% GST (INR {expected_tax:,.2f})."
            })
    else:
        findings.append({
            "check": "TAX",
            "status": "FAIL",
            "severity": "REVIEW",
            "title": "Tax Subtotal Missing",
            "message": "Subtotal is zero or missing, unable to verify 18% GST computation."
        })

    # -------------------------------------------------------------
    # 3. VENDOR & BANK VERIFICATION
    # -------------------------------------------------------------
    reg_vendor = database.get_registered_vendor(vendor_name) if vendor_name else None

    if not reg_vendor:
        findings.append({
            "check": "VENDOR",
            "status": "FAIL",
            "severity": "REVIEW",
            "title": "Unregistered Vendor",
            "message": f"Vendor '{vendor_name}' was not found in the approved master vendor database."
        })
    else:
        # Check GSTIN
        reg_gstin = (reg_vendor["gstin"] or "").strip().upper()
        if vendor_gstin and reg_gstin and vendor_gstin != reg_gstin:
            findings.append({
                "check": "GSTIN",
                "status": "FAIL",
                "severity": "REVIEW",
                "title": "GSTIN Mismatch",
                "message": f"Invoiced GSTIN '{vendor_gstin}' does not match registered GSTIN '{reg_gstin}' for {vendor_name}."
            })
        else:
            findings.append({
                "check": "GSTIN",
                "status": "PASS",
                "severity": "INFO",
                "title": "GSTIN Verification",
                "message": f"GSTIN '{vendor_gstin}' confirmed against master vendor registry."
            })

        # Check Bank Account (CRITICAL: Mismatch is FRAUD / BLOCKED)
        reg_bank = (reg_vendor["bank_account"] or "").strip()
        # Clean alphanumeric
        clean_inv_bank = "".join(c for c in bank_account if c.isalnum()).upper()
        clean_reg_bank = "".join(c for c in reg_bank if c.isalnum()).upper()

        if clean_inv_bank and clean_reg_bank and clean_inv_bank != clean_reg_bank:
            findings.append({
                "check": "BANK_ACCOUNT",
                "status": "FAIL",
                "severity": "BLOCK",
                "title": "Bank Account Mismatch (Security Alert)",
                "message": f"Security Alert: Invoiced bank account '{bank_account}' does not match registered disbursement account '{reg_bank}' for {vendor_name}."
            })
        elif not clean_inv_bank:
            findings.append({
                "check": "BANK_ACCOUNT",
                "status": "FAIL",
                "severity": "BLOCK",
                "title": "Missing Remittance Account",
                "message": "No bank remittance account found on invoice."
            })
        else:
            findings.append({
                "check": "BANK_ACCOUNT",
                "status": "PASS",
                "severity": "INFO",
                "title": "Bank Account Verified",
                "message": f"Remittance bank account '{bank_account}' matches registered account on file."
            })

    # -------------------------------------------------------------
    # 4. 3-WAY MATCH (PO, GRN, INVOICE)
    # -------------------------------------------------------------
    if not po_number:
        findings.append({
            "check": "PO_MATCH",
            "status": "FAIL",
            "severity": "REVIEW",
            "title": "Missing Purchase Order",
            "message": "No Purchase Order number specified on invoice."
        })
    else:
        po_records = database.get_po_records(po_number)
        if not po_records:
            findings.append({
                "check": "PO_MATCH",
                "status": "FAIL",
                "severity": "REVIEW",
                "title": "PO Not Found",
                "message": f"Purchase order '{po_number}' was not found in open purchase order records."
            })
        else:
            # Check line items vs PO records
            match_failed = False
            for inv_item in line_items:
                inv_qty = float(inv_item.get("qty") or 0.0)
                inv_desc = inv_item.get("description", "")

                # Find best matching PO item
                best_po = po_records[0]
                if len(po_records) > 1:
                    best_ratio = 0.0
                    for po_row in po_records:
                        r = difflib.SequenceMatcher(None, inv_desc.lower(), po_row["item"].lower()).ratio()
                        if r > best_ratio:
                            best_ratio = r
                            best_po = po_row

                ordered_qty = float(best_po["ordered_qty"])
                received_qty = float(best_po["received_qty"])

                if inv_qty != received_qty:
                    match_failed = True
                    findings.append({
                        "check": "PO_MATCH",
                        "status": "FAIL",
                        "severity": "REVIEW",
                        "title": "Quantity Mismatch (3-Way Match)",
                        "message": f"Quantity variance for '{inv_desc}': Invoiced {inv_qty:g} units, but warehouse GRN recorded only {received_qty:g} units received (PO ordered: {ordered_qty:g} units)."
                    })
                    break

            if not match_failed:
                findings.append({
                    "check": "PO_MATCH",
                    "status": "PASS",
                    "severity": "INFO",
                    "title": "3-Way Match Confirmed",
                    "message": f"PO {po_number} validated: Invoiced line item quantities match warehouse Goods Received Note (GRN) records."
                })

    # -------------------------------------------------------------
    # 5. CONFIDENCE THRESHOLD CHECK (< 0.8 -> NEEDS_REVIEW)
    # -------------------------------------------------------------
    low_conf_fields = []
    for field, conf in confidences.items():
        if float(conf) < 0.8:
            low_conf_fields.append((field, float(conf)))

    if low_conf_fields:
        field_strs = [f"{f} ({c*100:.0f}%)" for f, c in low_conf_fields]
        findings.append({
            "check": "CONFIDENCE",
            "status": "FAIL",
            "severity": "REVIEW",
            "title": "Low AI Extraction Confidence",
            "message": f"Fields below 80% confidence threshold: {', '.join(field_strs)}. Human review required."
        })

    return findings
