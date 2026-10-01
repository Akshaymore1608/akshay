import os
import json
from dotenv import load_dotenv
import database
import validator

load_dotenv()

def generate_reason_and_email_with_groq(decision, findings, extracted, api_key):
    """
    Calls Groq to write a 2-sentence plain-English explanation
    and a short draft vendor email for mismatches or approvals.
    Uses model llama-3.3-70b-versatile with JSON mode.
    """
    from groq import Groq
    client = Groq(api_key=api_key)

    vendor_name = extracted.get("vendor_name") or "Vendor"
    inv_num = extracted.get("invoice_number") or "N/A"
    total = extracted.get("total") or 0.0

    findings_text = "\n".join([f"- [{f['check']}] ({f['severity']}): {f['message']}" for f in findings if f["status"] == "FAIL"])
    if not findings_text:
        findings_text = "All checks passed successfully: 3-way match, 18% GST calculation, vendor registration, and bank verification."

    prompt = f"""You are the accounts payable automation engine at InvoiceIQ.
An invoice from '{vendor_name}' (Invoice #{inv_num}, Total: INR {total:,.2f}) was evaluated.
Decision reached: {decision}
Validation findings:
{findings_text}

Task:
1. Write a clear, concise 2-sentence plain-English explanation for why this decision was made.
2. Write a short, professional draft vendor email regarding this invoice. If BLOCKED or NEEDS_REVIEW, clearly state what needs clarification or correction. If AUTO_APPROVED, inform the vendor that the invoice has been approved and scheduled for payment.

Respond in JSON format:
{{
  "reason": "Exactly 2 sentences explaining the decision clearly.",
  "vendor_email": "Subject: ...\\n\\nDear Vendor team,\\n\\n..."
}}"""

    response = client.chat.completions.create(
        model="llama-3.3-70b-versatile",
        messages=[
            {"role": "system", "content": "You write concise, professional accounts payable communications in JSON."},
            {"role": "user", "content": prompt}
        ],
        temperature=0.0,
        response_format={"type": "json_object"}
    )

    data = json.loads(response.choices[0].message.content)
    return data.get("reason", ""), data.get("vendor_email", "")

def generate_fallback_reason_and_email(decision, findings, extracted):
    """
    Deterministic template fallback when Groq is unavailable.
    Guarantees 2 sentences for reason and a polished vendor email.
    """
    vendor = extracted.get("vendor_name") or "Vendor"
    inv_num = extracted.get("invoice_number") or "INV-UNKNOWN"
    total = float(extracted.get("total") or 0.0)

    fail_messages = [f["message"] for f in findings if f.get("status") == "FAIL"]

    if decision == "BLOCKED":
        reason = f"This invoice was blocked due to critical compliance failures: {fail_messages[0] if fail_messages else 'discrepancy detected'}. Payment processing is halted immediately to protect against duplicate disbursement or unauthorized bank routing."
        email = f"""Subject: Urgent: Hold on Invoice {inv_num} - Payment Verification Required

Dear {vendor} Accounts Team,

We are processing Invoice {inv_num} for INR {total:,.2f}, but our automated compliance system has placed a hold on this submission.

Reason for hold:
{chr(10).join(['• ' + m for m in fail_messages])}

Please provide official confirmation on your registered company letterhead or contact our finance desk to resolve this discrepancy before payment can proceed.

Best regards,
Accounts Payable Department
InvoiceIQ Automation"""

    elif decision == "NEEDS_REVIEW":
        primary_issue = fail_messages[0] if fail_messages else "variance detected in line items or tax"
        reason = f"This invoice has been routed to human approvers because {primary_issue}. Manual sign-off is required to verify the discrepancy before posting to the general ledger."
        email = f"""Subject: Inquiry Regarding Invoice {inv_num} (PO #{extracted.get('po_number') or 'N/A'})

Dear {vendor} Billing Team,

During automated processing of Invoice {inv_num} (Total: INR {total:,.2f}), our system identified the following item requiring clarification:

{chr(10).join(['• ' + m for m in fail_messages])}

Our accounts team is reviewing this invoice. Please reply with updated documentation or a revised invoice if an adjustment is necessary.

Sincerely,
Accounts Payable Team
InvoiceIQ"""

    else: # AUTO_APPROVED
        reason = f"All automated validations passed with high confidence, including 3-way PO matching, registered bank verification, and 18% GST compliance. The invoice has been posted directly to the ERP ledger for scheduled payment."
        email = f"""Subject: Approved: Invoice {inv_num} Scheduled for Payment

Dear {vendor} Accounts Team,

We are pleased to inform you that Invoice {inv_num} (PO: {extracted.get('po_number') or 'N/A'}, Total: INR {total:,.2f}) has been successfully verified and posted to our ERP ledger.

Payment will be remitted to your registered bank account according to standard 30-day settlement terms. Thank you for your partnership.

Warm regards,
Accounts Payable Operations
InvoiceIQ"""

    return reason, email

def evaluate_and_decide(extracted, filename="uploaded.pdf", file_hash=None, processing_time=0.0):
    """
    Evaluates extracted invoice data:
    1. Runs validator.
    2. Applies decision logic:
       - BLOCKED if bank mismatch or duplicate
       - NEEDS_REVIEW if qty mismatch, tax error, or any confidence < 0.8
       - AUTO_APPROVED otherwise -> posts to erp_ledger
    3. Calls Groq (or fallback) for 2-sentence reason and vendor email.
    4. Saves invoice record and audit logs.
    """
    if not file_hash:
        file_hash = extracted.get("file_hash") or "unknown_hash"

    database.add_audit_log(
        stage="EXTRACTION",
        action="EXTRACTION_COMPLETED",
        details=f"Extracted metadata for invoice '{extracted.get('invoice_number', 'N/A')}' from vendor '{extracted.get('vendor_name', 'Unknown')}'.",
        actor="System"
    )

    # 1. Run deterministic validations
    findings = validator.validate_invoice(extracted)

    # 2. Decision Logic
    has_block = any(f["severity"] == "BLOCK" and f["status"] == "FAIL" for f in findings)
    has_review = any(f["severity"] == "REVIEW" and f["status"] == "FAIL" for f in findings)

    if has_block:
        decision = "BLOCKED"
    elif has_review:
        decision = "NEEDS_REVIEW"
    else:
        decision = "AUTO_APPROVED"

    database.add_audit_log(
        stage="VALIDATION",
        action="VALIDATION_EVALUATED",
        details=f"Evaluation complete. Result: {decision}. Total findings: {len(findings)} (Failures: {sum(1 for f in findings if f['status'] == 'FAIL')}).",
        actor="System"
    )

    # 3. Generate 2-sentence reason and vendor email
    groq_api_key = os.getenv("GROQ_API_KEY", "").strip()
    reason, email = None, None

    if groq_api_key:
        try:
            reason, email = generate_reason_and_email_with_groq(decision, findings, extracted, groq_api_key)
        except Exception as e:
            database.add_audit_log(
                stage="DECISION",
                action="GROQ_EXPLANATION_FALLBACK",
                details=f"Groq explanation failed ({str(e)[:100]}). Used standard template.",
                actor="System"
            )

    if not reason or not email:
        reason, email = generate_fallback_reason_and_email(decision, findings, extracted)

    # 4. Save invoice to database
    invoice_id = database.save_invoice_record(
        file_hash=file_hash,
        filename=filename,
        extracted=extracted,
        decision=decision,
        reason=reason,
        email=email,
        findings=findings,
        processing_time=processing_time
    )

    database.add_audit_log(
        stage="DECISION",
        action="DECISION_APPLIED",
        details=f"Decision {decision} assigned to invoice ID {invoice_id} ({extracted.get('invoice_number', 'N/A')}). Reason: {reason[:120]}...",
        invoice_id=invoice_id,
        invoice_number=extracted.get("invoice_number"),
        actor="System"
    )

    # 5. If AUTO_APPROVED -> Post to ERP Ledger automatically
    payment_ref = None
    if decision == "AUTO_APPROVED":
        payment_ref = database.post_to_erp_ledger(invoice_id)

    return {
        "invoice_id": invoice_id,
        "decision": decision,
        "reason": reason,
        "vendor_email": email,
        "findings": findings,
        "payment_ref": payment_ref,
        "status": "Posted" if decision == "AUTO_APPROVED" else decision
    }
