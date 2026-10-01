import os
import sqlite3
import json
import csv
from datetime import datetime

BASE_DIR = os.path.dirname(os.path.abspath(__file__))
DATA_DIR = os.path.join(BASE_DIR, "data")
DB_PATH = os.path.join(DATA_DIR, "invoiceiq.db")
VENDORS_CSV = os.path.join(DATA_DIR, "vendors.csv")
PO_DATA_CSV = os.path.join(DATA_DIR, "po_data.csv")

def ensure_data_dir():
    os.makedirs(DATA_DIR, exist_ok=True)

def get_db_connection():
    ensure_data_dir()
    conn = sqlite3.connect(DB_PATH)
    conn.row_factory = sqlite3.Row
    return conn

def init_db():
    ensure_data_dir()
    conn = get_db_connection()
    cursor = conn.cursor()

    # Vendors table
    cursor.execute("""
        CREATE TABLE IF NOT EXISTS vendors (
            id INTEGER PRIMARY KEY AUTOINCREMENT,
            vendor_name TEXT UNIQUE NOT NULL,
            gstin TEXT NOT NULL,
            bank_account TEXT NOT NULL
        )
    """)

    # PO Data table (for 3-way matching)
    cursor.execute("""
        CREATE TABLE IF NOT EXISTS po_data (
            id INTEGER PRIMARY KEY AUTOINCREMENT,
            po_number TEXT NOT NULL,
            vendor_name TEXT NOT NULL,
            item TEXT NOT NULL,
            ordered_qty REAL NOT NULL,
            received_qty REAL NOT NULL,
            unit_price REAL NOT NULL
        )
    """)

    # Invoices table
    cursor.execute("""
        CREATE TABLE IF NOT EXISTS invoices (
            id INTEGER PRIMARY KEY AUTOINCREMENT,
            file_hash TEXT UNIQUE NOT NULL,
            filename TEXT NOT NULL,
            vendor_name TEXT,
            vendor_gstin TEXT,
            invoice_number TEXT,
            invoice_date TEXT,
            po_number TEXT,
            subtotal REAL,
            tax REAL,
            total REAL,
            bank_account TEXT,
            line_items_json TEXT,
            confidences_json TEXT,
            raw_text TEXT,
            decision TEXT,
            decision_reason TEXT,
            draft_email TEXT,
            findings_json TEXT,
            status TEXT DEFAULT 'PROCESSED',
            processing_time_sec REAL DEFAULT 0.0,
            created_at TEXT NOT NULL,
            updated_at TEXT NOT NULL
        )
    """)

    # ERP Ledger
    cursor.execute("""
        CREATE TABLE IF NOT EXISTS erp_ledger (
            id INTEGER PRIMARY KEY AUTOINCREMENT,
            invoice_id INTEGER,
            vendor_name TEXT NOT NULL,
            invoice_number TEXT NOT NULL,
            invoice_date TEXT,
            po_number TEXT,
            subtotal REAL,
            tax REAL,
            total REAL,
            status TEXT DEFAULT 'Posted',
            payment_reference TEXT UNIQUE,
            posted_at TEXT NOT NULL,
            FOREIGN KEY (invoice_id) REFERENCES invoices(id)
        )
    """)

    # Audit Log
    cursor.execute("""
        CREATE TABLE IF NOT EXISTS audit_log (
            id INTEGER PRIMARY KEY AUTOINCREMENT,
            invoice_id INTEGER,
            invoice_number TEXT,
            stage TEXT NOT NULL,
            action TEXT NOT NULL,
            details TEXT,
            actor TEXT DEFAULT 'System',
            timestamp TEXT NOT NULL
        )
    """)

    # Extraction Cache
    cursor.execute("""
        CREATE TABLE IF NOT EXISTS extraction_cache (
            file_hash TEXT PRIMARY KEY,
            extraction_json TEXT NOT NULL,
            cached_at TEXT NOT NULL
        )
    """)

    conn.commit()
    conn.close()

    # Seed data if empty
    seed_initial_data()

def seed_initial_data():
    ensure_data_dir()
    conn = get_db_connection()
    cursor = conn.cursor()

    # Check if vendors is empty
    cursor.execute("SELECT COUNT(*) FROM vendors")
    vendor_count = cursor.fetchone()[0]

    if vendor_count == 0 and os.path.exists(VENDORS_CSV):
        with open(VENDORS_CSV, mode="r", encoding="utf-8") as f:
            reader = csv.DictReader(f)
            for row in reader:
                cursor.execute("""
                    INSERT OR IGNORE INTO vendors (vendor_name, gstin, bank_account)
                    VALUES (?, ?, ?)
                """, (row["vendor_name"].strip(), row["gstin"].strip(), row["bank_account"].strip()))
        conn.commit()

    # Check if po_data is empty
    cursor.execute("SELECT COUNT(*) FROM po_data")
    po_count = cursor.fetchone()[0]

    if po_count == 0 and os.path.exists(PO_DATA_CSV):
        with open(PO_DATA_CSV, mode="r", encoding="utf-8") as f:
            reader = csv.DictReader(f)
            for row in reader:
                cursor.execute("""
                    INSERT INTO po_data (po_number, vendor_name, item, ordered_qty, received_qty, unit_price)
                    VALUES (?, ?, ?, ?, ?, ?)
                """, (
                    row["po_number"].strip(),
                    row["vendor_name"].strip(),
                    row["item"].strip(),
                    float(row["ordered_qty"]),
                    float(row["received_qty"]),
                    float(row["unit_price"])
                ))
        conn.commit()

    conn.close()

def reset_all_data():
    """Clear all invoices, ledger, audit log, and extraction cache, then reseed vendors and PO data."""
    ensure_data_dir()
    conn = get_db_connection()
    cursor = conn.cursor()

    cursor.execute("DELETE FROM invoices")
    cursor.execute("DELETE FROM erp_ledger")
    cursor.execute("DELETE FROM audit_log")
    cursor.execute("DELETE FROM extraction_cache")
    cursor.execute("DELETE FROM vendors")
    cursor.execute("DELETE FROM po_data")
    conn.commit()
    conn.close()

    # Re-seed vendors and PO data
    seed_initial_data()

    # Log the reset
    add_audit_log(
        stage="SYSTEM",
        action="RESET_DATABASE",
        details="All operational tables and caches were cleared. Reference vendors and PO datasets were re-seeded.",
        actor="System"
    )

def add_audit_log(stage, action, details, invoice_id=None, invoice_number=None, actor="System"):
    conn = get_db_connection()
    cursor = conn.cursor()
    now_str = datetime.now().strftime("%Y-%m-%d %H:%M:%S")
    cursor.execute("""
        INSERT INTO audit_log (invoice_id, invoice_number, stage, action, details, actor, timestamp)
        VALUES (?, ?, ?, ?, ?, ?, ?)
    """, (invoice_id, invoice_number, stage, action, details, actor, now_str))
    conn.commit()
    conn.close()

def get_cached_extraction(file_hash):
    conn = get_db_connection()
    cursor = conn.cursor()
    cursor.execute("SELECT extraction_json FROM extraction_cache WHERE file_hash = ?", (file_hash,))
    row = cursor.fetchone()
    conn.close()
    if row:
        try:
            return json.loads(row["extraction_json"])
        except Exception:
            return None
    return None

def set_cached_extraction(file_hash, extraction_dict):
    conn = get_db_connection()
    cursor = conn.cursor()
    now_str = datetime.now().strftime("%Y-%m-%d %H:%M:%S")
    cursor.execute("""
        INSERT OR REPLACE INTO extraction_cache (file_hash, extraction_json, cached_at)
        VALUES (?, ?, ?)
    """, (file_hash, json.dumps(extraction_dict), now_str))
    conn.commit()
    conn.close()

def save_invoice_record(file_hash, filename, extracted, decision, reason, email, findings, processing_time):
    conn = get_db_connection()
    cursor = conn.cursor()
    now_str = datetime.now().strftime("%Y-%m-%d %H:%M:%S")

    line_items_json = json.dumps(extracted.get("line_items", []))
    confidences_json = json.dumps(extracted.get("confidences", {}))
    findings_json = json.dumps(findings)

    # Check if already exists
    cursor.execute("SELECT id FROM invoices WHERE file_hash = ?", (file_hash,))
    existing = cursor.fetchone()

    status = "Posted" if decision == "AUTO_APPROVED" else decision

    if existing:
        invoice_id = existing["id"]
        cursor.execute("""
            UPDATE invoices SET
                filename = ?, vendor_name = ?, vendor_gstin = ?, invoice_number = ?,
                invoice_date = ?, po_number = ?, subtotal = ?, tax = ?, total = ?,
                bank_account = ?, line_items_json = ?, confidences_json = ?,
                raw_text = ?, decision = ?, decision_reason = ?, draft_email = ?,
                findings_json = ?, status = ?, processing_time_sec = ?, updated_at = ?
            WHERE id = ?
        """, (
            filename,
            extracted.get("vendor_name"),
            extracted.get("vendor_gstin"),
            extracted.get("invoice_number"),
            extracted.get("invoice_date"),
            extracted.get("po_number"),
            float(extracted.get("subtotal") or 0.0),
            float(extracted.get("tax") or 0.0),
            float(extracted.get("total") or 0.0),
            extracted.get("bank_account"),
            line_items_json,
            confidences_json,
            extracted.get("raw_text", ""),
            decision,
            reason,
            email,
            findings_json,
            status,
            float(processing_time),
            now_str,
            invoice_id
        ))
    else:
        cursor.execute("""
            INSERT INTO invoices (
                file_hash, filename, vendor_name, vendor_gstin, invoice_number,
                invoice_date, po_number, subtotal, tax, total, bank_account,
                line_items_json, confidences_json, raw_text, decision, decision_reason,
                draft_email, findings_json, status, processing_time_sec, created_at, updated_at
            ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
        """, (
            file_hash,
            filename,
            extracted.get("vendor_name"),
            extracted.get("vendor_gstin"),
            extracted.get("invoice_number"),
            extracted.get("invoice_date"),
            extracted.get("po_number"),
            float(extracted.get("subtotal") or 0.0),
            float(extracted.get("tax") or 0.0),
            float(extracted.get("total") or 0.0),
            extracted.get("bank_account"),
            line_items_json,
            confidences_json,
            extracted.get("raw_text", ""),
            decision,
            reason,
            email,
            findings_json,
            status,
            float(processing_time),
            now_str,
            now_str
        ))
        invoice_id = cursor.lastrowid

    conn.commit()
    conn.close()
    return invoice_id

def post_to_erp_ledger(invoice_id, payment_ref=None):
    conn = get_db_connection()
    cursor = conn.cursor()
    cursor.execute("SELECT * FROM invoices WHERE id = ?", (invoice_id,))
    inv = cursor.fetchone()
    if not inv:
        conn.close()
        return None

    # Check if already posted
    cursor.execute("SELECT * FROM erp_ledger WHERE invoice_id = ?", (invoice_id,))
    existing_ledger = cursor.fetchone()
    if existing_ledger:
        conn.close()
        return existing_ledger["payment_reference"]

    now_str = datetime.now().strftime("%Y-%m-%d %H:%M:%S")
    if not payment_ref:
        payment_ref = f"PAY-{datetime.now().strftime('%Y%m%d')}-{invoice_id:04d}"

    cursor.execute("""
        INSERT INTO erp_ledger (
            invoice_id, vendor_name, invoice_number, invoice_date,
            po_number, subtotal, tax, total, status, payment_reference, posted_at
        ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, 'Posted', ?, ?)
    """, (
        invoice_id,
        inv["vendor_name"] or "Unknown Vendor",
        inv["invoice_number"] or f"INV-{invoice_id}",
        inv["invoice_date"] or datetime.now().strftime("%Y-%m-%d"),
        inv["po_number"] or "N/A",
        inv["subtotal"],
        inv["tax"],
        inv["total"],
        payment_ref,
        now_str
    ))

    # Update invoice status
    cursor.execute("UPDATE invoices SET status = 'Posted', updated_at = ? WHERE id = ?", (now_str, invoice_id))
    conn.commit()
    conn.close()

    add_audit_log(
        stage="LEDGER",
        action="POSTED_TO_ERP",
        details=f"Invoice {inv['invoice_number']} posted to ERP ledger with payment ref {payment_ref}. Total: INR {inv['total']:,.2f}",
        invoice_id=invoice_id,
        invoice_number=inv["invoice_number"],
        actor="System"
    )
    return payment_ref

def approve_invoice_manual(invoice_id, approver_name="Approver", comments="Approved via Approver Inbox"):
    conn = get_db_connection()
    cursor = conn.cursor()
    cursor.execute("SELECT * FROM invoices WHERE id = ?", (invoice_id,))
    inv = cursor.fetchone()
    if not inv:
        conn.close()
        return False

    now_str = datetime.now().strftime("%Y-%m-%d %H:%M:%S")
    cursor.execute("""
        UPDATE invoices SET status = 'Approved', decision = 'APPROVED_BY_USER', updated_at = ?
        WHERE id = ?
    """, (now_str, invoice_id))
    conn.commit()
    conn.close()

    add_audit_log(
        stage="APPROVAL",
        action="MANUAL_APPROVAL",
        details=f"Invoice {inv['invoice_number']} manually approved by {approver_name}. Note: {comments}",
        invoice_id=invoice_id,
        invoice_number=inv["invoice_number"],
        actor=approver_name
    )

    # Post to ERP Ledger
    post_to_erp_ledger(invoice_id)
    return True

def reject_invoice_manual(invoice_id, reason, approver_name="Approver"):
    conn = get_db_connection()
    cursor = conn.cursor()
    cursor.execute("SELECT * FROM invoices WHERE id = ?", (invoice_id,))
    inv = cursor.fetchone()
    if not inv:
        conn.close()
        return False

    now_str = datetime.now().strftime("%Y-%m-%d %H:%M:%S")
    cursor.execute("""
        UPDATE invoices SET status = 'Rejected', decision = 'REJECTED', updated_at = ?
        WHERE id = ?
    """, (now_str, invoice_id))
    conn.commit()
    conn.close()

    add_audit_log(
        stage="APPROVAL",
        action="MANUAL_REJECTION",
        details=f"Invoice {inv['invoice_number']} rejected by {approver_name}. Reason: {reason}",
        invoice_id=invoice_id,
        invoice_number=inv["invoice_number"],
        actor=approver_name
    )
    return True

def get_all_invoices():
    conn = get_db_connection()
    cursor = conn.cursor()
    cursor.execute("SELECT * FROM invoices ORDER BY id DESC")
    rows = [dict(r) for r in cursor.fetchall()]
    conn.close()
    return rows

def get_pending_review_invoices():
    conn = get_db_connection()
    cursor = conn.cursor()
    cursor.execute("SELECT * FROM invoices WHERE decision = 'NEEDS_REVIEW' AND status = 'NEEDS_REVIEW' ORDER BY id DESC")
    rows = [dict(r) for r in cursor.fetchall()]
    conn.close()
    return rows

def get_erp_ledger_records():
    conn = get_db_connection()
    cursor = conn.cursor()
    cursor.execute("SELECT * FROM erp_ledger ORDER BY id DESC")
    rows = [dict(r) for r in cursor.fetchall()]
    conn.close()
    return rows

def get_audit_logs(limit=250):
    conn = get_db_connection()
    cursor = conn.cursor()
    cursor.execute("SELECT * FROM audit_log ORDER BY id DESC LIMIT ?", (limit,))
    rows = [dict(r) for r in cursor.fetchall()]
    conn.close()
    return rows

def get_registered_vendor(vendor_name):
    conn = get_db_connection()
    cursor = conn.cursor()
    # Case-insensitive substring/match
    cursor.execute("SELECT * FROM vendors WHERE LOWER(vendor_name) = LOWER(?)", (vendor_name.strip(),))
    row = cursor.fetchone()
    if not row:
        cursor.execute("SELECT * FROM vendors WHERE LOWER(?) LIKE '%' || LOWER(vendor_name) || '%'", (vendor_name.strip(),))
        row = cursor.fetchone()
    conn.close()
    return dict(row) if row else None

def get_all_registered_vendors():
    conn = get_db_connection()
    cursor = conn.cursor()
    cursor.execute("SELECT * FROM vendors ORDER BY vendor_name ASC")
    rows = [dict(r) for r in cursor.fetchall()]
    conn.close()
    return rows

def get_po_records(po_number):
    conn = get_db_connection()
    cursor = conn.cursor()
    cursor.execute("SELECT * FROM po_data WHERE LOWER(po_number) = LOWER(?)", (po_number.strip(),))
    rows = [dict(r) for r in cursor.fetchall()]
    conn.close()
    return rows

def get_all_existing_invoices():
    conn = get_db_connection()
    cursor = conn.cursor()
    cursor.execute("SELECT id, file_hash, vendor_name, invoice_number, invoice_date, total FROM invoices")
    rows = [dict(r) for r in cursor.fetchall()]
    conn.close()
    return rows

def get_dashboard_metrics():
    conn = get_db_connection()
    cursor = conn.cursor()

    cursor.execute("SELECT COUNT(*) FROM invoices")
    total_invoices = cursor.fetchone()[0]

    cursor.execute("SELECT COUNT(*) FROM invoices WHERE decision = 'AUTO_APPROVED'")
    auto_approved = cursor.fetchone()[0]

    cursor.execute("SELECT COUNT(*) FROM invoices WHERE decision = 'NEEDS_REVIEW'")
    needs_review = cursor.fetchone()[0]

    cursor.execute("SELECT COUNT(*) FROM invoices WHERE decision = 'BLOCKED'")
    blocked = cursor.fetchone()[0]

    cursor.execute("SELECT AVG(processing_time_sec) FROM invoices")
    avg_proc_time = cursor.fetchone()[0] or 0.0

    cursor.execute("SELECT COUNT(*) FROM erp_ledger")
    posted_count = cursor.fetchone()[0]

    cursor.execute("SELECT SUM(total) FROM erp_ledger")
    total_posted_value = cursor.fetchone()[0] or 0.0

    conn.close()

    pct_touchless = (auto_approved / total_invoices * 100.0) if total_invoices > 0 else 0.0

    # Assume 20 min and Rs 600 per manual invoice vs 10 sec and Rs 40 automated
    # Time saved = (20 min - 10 sec) * total_invoices = (1200 - 10)s = 1190 seconds per invoice
    # Money saved = (Rs 600 - Rs 40) * total_invoices = Rs 560 per invoice
    time_saved_minutes = total_invoices * (20.0 - (10.0 / 60.0))
    time_saved_hours = time_saved_minutes / 60.0
    money_saved_rs = total_invoices * (600.0 - 40.0)

    return {
        "total_invoices": total_invoices,
        "auto_approved": auto_approved,
        "needs_review": needs_review,
        "blocked": blocked,
        "posted_count": posted_count,
        "total_posted_value": total_posted_value,
        "pct_touchless": pct_touchless,
        "avg_proc_time": avg_proc_time,
        "time_saved_hours": time_saved_hours,
        "time_saved_minutes": time_saved_minutes,
        "money_saved_rs": money_saved_rs
    }
