import os
import time
import database
import extractor
import validator
import decision_engine

def run_e2e_verification():
    print("=" * 70)
    print("RUNNING INVOICEIQ END-TO-END AUTOMATED VERIFICATION")
    print("=" * 70)

    # 1. Reset Database & Reseed
    print("\n[STEP 1] Initializing and Resetting SQLite Database...")
    database.reset_all_data()
    vendors = database.get_all_registered_vendors()
    po_recs = database.get_po_records("PO-2024-001")
    assert len(vendors) == 5, f"Expected 5 vendors, got {len(vendors)}"
    assert len(po_recs) == 1, f"Expected 1 PO-2024-001 record, got {len(po_recs)}"
    print(f"  [OK] Database initialized with {len(vendors)} vendors and PO reference datasets.")

    # 2. Process All 6 Demo Invoices in Sequence
    demo_files = [
        ("demo_invoices/01_clean_invoice.pdf", "AUTO_APPROVED"),
        ("demo_invoices/02_quantity_mismatch_invoice.pdf", "NEEDS_REVIEW"),
        ("demo_invoices/03_duplicate_invoice.pdf", "BLOCKED"),
        ("demo_invoices/04_fraud_bank_mismatch_invoice.pdf", "BLOCKED"),
        ("demo_invoices/05_tax_error_invoice.pdf", "NEEDS_REVIEW"),
        ("demo_invoices/06_messy_layout_invoice.pdf", "AUTO_APPROVED")
    ]

    print("\n[STEP 2] Processing 6 Demo Invoices Through Ingestion Pipeline...")
    results = {}
    for filepath, expected_decision in demo_files:
        assert os.path.exists(filepath), f"File {filepath} not found"
        t0 = time.time()
        with open(filepath, "rb") as f:
            pdf_bytes = f.read()
        extracted = extractor.extract_invoice_data(pdf_bytes, filepath)
        elapsed = time.time() - t0
        dec_res = decision_engine.evaluate_and_decide(extracted, filepath, extracted["file_hash"], elapsed)
        results[filepath] = dec_res

        print(f"\n  * Processed: {os.path.basename(filepath)}")
        print(f"    - Vendor: {extracted.get('vendor_name')}")
        print(f"    - Invoiced Total: INR {extracted.get('total'):,.2f}")
        print(f"    - Decision: {dec_res['decision']} (Expected: {expected_decision})")
        print(f"    - Payment Ref: {dec_res.get('payment_ref')}")
        print(f"    - Explanation: {dec_res['reason'][:110]}...")

        # Assert decision matches expected outcome
        assert dec_res["decision"] == expected_decision, f"Expected {expected_decision} for {filepath}, but got {dec_res['decision']}"
        print(f"    [OK] Decision MATCH: {expected_decision}")

    # 3. Verify SQLite Cache on repeat upload
    print("\n[STEP 3] Verifying SHA-256 SQLite Cache (0 API calls on repeat)...")
    with open("demo_invoices/01_clean_invoice.pdf", "rb") as f:
        clean_bytes = f.read()
    cached_res = extractor.extract_invoice_data(clean_bytes, "01_clean_invoice.pdf")
    assert cached_res.get("from_cache") is True, "Repeat upload should be loaded from cache!"
    print("  [OK] Repeat upload verified: loaded instantly from SQLite cache without reprocessing.")

    # 4. Verify ERP Ledger
    print("\n[STEP 4] Verifying ERP General Ledger...")
    ledger_records = database.get_erp_ledger_records()
    assert len(ledger_records) == 2, f"Expected 2 auto-approved invoices in ledger, got {len(ledger_records)}"
    for rec in ledger_records:
        assert rec["status"] == "Posted", f"Status should be 'Posted', got {rec['status']}"
        assert rec["payment_reference"].startswith("PAY-"), f"Invalid payment ref {rec['payment_reference']}"
        print(f"  [OK] Ledger Record: {rec['vendor_name']} | Inv #{rec['invoice_number']} | INR {rec['total']:,.2f} | Ref: {rec['payment_reference']}")

    # 5. Verify Approver Inbox (Human-in-the-Loop)
    print("\n[STEP 5] Testing Approver Inbox (Approve & Reject Workflows)...")
    pending = database.get_pending_review_invoices()
    assert len(pending) == 2, f"Expected 2 pending review invoices, got {len(pending)}"
    print(f"  [OK] Pending Invoices in Inbox: {len(pending)}")

    # Approve first pending invoice (Invoice #2)
    inv_to_approve = pending[0]
    appr_success = database.approve_invoice_manual(inv_to_approve["id"], approver_name="SeniorController", comments="Over-shipment approved per procurement waiver")
    assert appr_success is True
    print(f"  [OK] Approved Invoice #{inv_to_approve['invoice_number']} ({inv_to_approve['vendor_name']}) -> Posted to Ledger")

    # Reject second pending invoice (Invoice #5)
    remaining_pending = database.get_pending_review_invoices()
    assert len(remaining_pending) == 1
    inv_to_reject = remaining_pending[0]
    rej_success = database.reject_invoice_manual(inv_to_reject["id"], reason="Incorrect GST rate; vendor must reissue at 18%", approver_name="SeniorController")
    assert rej_success is True
    print(f"  [OK] Rejected Invoice #{inv_to_reject['invoice_number']} with logged audit reason.")

    # Final inbox check
    final_pending = database.get_pending_review_invoices()
    assert len(final_pending) == 0, f"Expected 0 pending, got {len(final_pending)}"
    print("  [OK] Inbox Zero confirmed: All reviews completed.")

    # 6. Verify Dashboard Metrics
    print("\n[STEP 6] Verifying Dashboard KPIs & Financial Metrics...")
    metrics = database.get_dashboard_metrics()
    print(f"  * Total Processed: {metrics['total_invoices']}")
    print(f"  * Touchless Rate: {metrics['pct_touchless']:.1f}%")
    print(f"  * Blocked Count: {metrics['blocked']}")
    print(f"  * Posted Ledger Count: {metrics['posted_count']}")
    print(f"  * Total Posted Amount: INR {metrics['total_posted_value']:,.2f}")
    print(f"  * Estimated Time Saved: {metrics['time_saved_hours']:.2f} hours")
    print(f"  * Estimated Cost Saved: INR {metrics['money_saved_rs']:,.2f}")
    assert metrics["total_invoices"] == 6
    assert metrics["blocked"] == 2
    assert metrics["posted_count"] == 3 # 2 auto-approved + 1 manually approved
    print("  [OK] Dashboard KPIs match system records accurately.")

    # 7. Verify Audit Log
    print("\n[STEP 7] Verifying Audit Log Trail...")
    audit_logs = database.get_audit_logs(limit=100)
    assert len(audit_logs) > 10, f"Expected rich audit log, got {len(audit_logs)} rows"
    stages_logged = set(log["stage"] for log in audit_logs)
    print(f"  * Stages Recorded: {', '.join(sorted(stages_logged))}")
    assert "EXTRACTION" in stages_logged
    assert "VALIDATION" in stages_logged
    assert "DECISION" in stages_logged
    assert "APPROVAL" in stages_logged
    assert "LEDGER" in stages_logged
    print("  [OK] Comprehensive compliance audit trail verified.")

    print("\n" + "=" * 70)
    print("ALL TESTS PASSED WITH 100% SUCCESS! INVOICEIQ IS FULLY OPERATIONAL.")
    print("=" * 70)

if __name__ == "__main__":
    run_e2e_verification()
