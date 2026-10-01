# InvoiceIQ ⚡

> **Tagline:** *"Inbox to payment, with humans only where judgment is needed"*

InvoiceIQ is an autonomous accounts payable (AP) automation platform designed to ingest vendor invoices, perform deterministic 3-way matching and compliance checks, auto-post clean submissions to the ERP general ledger, and isolate high-risk or ambiguous invoices for human approval.

---

## 🏗️ Architecture & Technology Stack

- **Frontend & App Framework:** [Streamlit](https://streamlit.io/)
- **Database:** SQLite (`data/invoiceiq.db`) with relational integrity and audit trail
- **Data Manipulation:** Pandas
- **Document Ingestion & OCR/Parsing:** `pdfplumber` (text PDFs) & `PyMuPDF` (scanned/image rendering)
- **AI Extraction & Reasoning:** Groq SDK
  - Text PDFs: `llama-3.3-70b-versatile` in JSON mode, temperature 0
  - Scanned/Image PDFs: `meta-llama/llama-4-scout-17b-16e-instruct` in JSON mode, temperature 0
  - Decision Reasoning: 2-sentence plain-English explanations & tailored vendor communications
- **Invoice PDF Generation:** `reportlab`
- **Environment Management:** `python-dotenv`

---

## 🚀 Quickstart & Run Instructions

### 1. Prerequisites
- Python 3.10+ (Python 3.11 recommended)

### 2. Install Dependencies
```bash
pip install -r requirements.txt
```

### 3. Configure API Key
Create or edit `.env` in the root folder:
```env
GROQ_API_KEY=gsk_your_groq_api_key_here
```
*(Note: Never commit or hardcode API keys. If no key is set, the app will automatically use its internal high-fidelity deterministic fallback engine so all features remain testable.)*

### 4. Generate Demo Data (Invoices & Reference CSVs)
```bash
python generate_demo_data.py
```
This generates `data/vendors.csv`, `data/po_data.csv`, and 6 realistic test invoices in `/demo_invoices`.

### 5. Launch the Web Application
```bash
streamlit run app.py
```
Open your browser at `http://localhost:8501`.

---

## 📑 Application Pages

1. **📂 Upload:**
   - Drag-and-drop any vendor PDF or select any demo scenario.
   - Real-time extraction with color-coded confidence indicators (Green `>0.9`, Amber `0.7–0.9`, Red `<0.7`).
   - Displays Decision Badge, highlighted reason box, findings breakdown, and pre-composed vendor email.
   - SHA-256 caching ensures repeat uploads make 0 external API calls.

2. **📥 Approver Inbox:**
   - Human-in-the-loop review queue for invoices flagged as `NEEDS_REVIEW`.
   - Side-by-side discrepancy review with line-item 3-way match.
   - **Approve Button:** Posts directly to the ERP ledger with status "Posted".
   - **Reject Button:** Prompts for a reason and logs rejection to the audit trail.

3. **📑 ERP Ledger:**
   - Live General Ledger table of all posted invoices.
   - Displays payment references (`PAY-YYYYMMDD-XXXX`), line-item totals, and timestamps.
   - Search by vendor or invoice number with one-click CSV export.

4. **🔍 Audit Log:**
   - Immutable compliance trail recording every stage: `UPLOAD`, `EXTRACTION`, `VALIDATION`, `DECISION`, `APPROVAL`, `REJECTION`, and `LEDGER`.
   - Filterable by stage, invoice number, and actor.

5. **📊 Dashboard:**
   - Key operational metrics: Total Invoices Processed, % Touchless Rate, Blocked Count, Needs Review Count.
   - Average processing velocity (e.g. 0.05s cached / ~2s live).
   - Estimated **Time Saved** (assuming 20 min manual vs 10 sec automated) and **Money Saved** (Rs 600 manual vs Rs 40 automated).
   - Interactive bar chart of decision distributions.
   - **"Load demo invoices"** button: Automatically processes all 6 demo invoices in sequence.
   - **"Reset demo"** button: Clears operational tables and reseeds reference vendors and POs.

---

## 🧪 Demo Invoices Suite

| File | Scenario | Expected Outcome | Failure Reason / Note |
|---|---|---|---|
| `01_clean_invoice.pdf` | Clean Invoice | **AUTO_APPROVED** | 100% match on PO, GRN, 18% GST, and registered bank. Posted to ledger. |
| `02_quantity_mismatch_invoice.pdf` | Quantity Mismatch | **NEEDS_REVIEW** | Invoiced 120 units, but warehouse GRN recorded only 100 received. |
| `03_duplicate_invoice.pdf` | Duplicate Submission | **BLOCKED** | Same vendor, same total (INR 59,000), date within 30 days, invoice number similarity > 85%. |
| `04_fraud_bank_mismatch_invoice.pdf` | Bank Fraud Alert | **BLOCKED** | Invoiced bank account does not match registered master vendor bank. |
| `05_tax_error_invoice.pdf` | Tax Calculation Error | **NEEDS_REVIEW** | Invoiced GST is 10% instead of standard 18% GST (difference > Rs 1). |
| `06_messy_layout_invoice.pdf` | Messy Layout & Typography | **AUTO_APPROVED** | Different font/layout and total in words, but math and PO match cleanly. |
