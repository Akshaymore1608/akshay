import os
import csv
from reportlab.lib.pagesizes import letter
from reportlab.platypus import SimpleDocTemplate, Paragraph, Spacer, Table, TableStyle
from reportlab.lib.styles import getSampleStyleSheet, ParagraphStyle
from reportlab.lib import colors

BASE_DIR = os.path.dirname(os.path.abspath(__file__))
DATA_DIR = os.path.join(BASE_DIR, "data")
DEMO_DIR = os.path.join(BASE_DIR, "demo_invoices")

def ensure_dirs():
    os.makedirs(DATA_DIR, exist_ok=True)
    os.makedirs(DEMO_DIR, exist_ok=True)

def generate_csv_files():
    ensure_dirs()
    
    vendors_path = os.path.join(DATA_DIR, "vendors.csv")
    vendors_data = [
        {"vendor_name": "Acme Tech Solutions", "gstin": "27AABCU9603R1ZM", "bank_account": "HDFC000123456789"},
        {"vendor_name": "Bharat Industrial Supplies", "gstin": "29AAACB8888P1Z5", "bank_account": "ICIC000987654321"},
        {"vendor_name": "Cybertron Logistics", "gstin": "07AAACC4444N1Z2", "bank_account": "HDFC000456789123"},
        {"vendor_name": "Zenith Stationery Ltd", "gstin": "33AAACZ7777M1ZG", "bank_account": "SBIN000112233445"},
        {"vendor_name": "Deccan Office Systems", "gstin": "36AAACD2222K1Z9", "bank_account": "AXIS000556677889"},
    ]
    with open(vendors_path, "w", newline="", encoding="utf-8") as f:
        writer = csv.DictWriter(f, fieldnames=["vendor_name", "gstin", "bank_account"])
        writer.writeheader()
        writer.writerows(vendors_data)
    print(f"Created {vendors_path}")

    po_path = os.path.join(DATA_DIR, "po_data.csv")
    po_data = [
        {"po_number": "PO-2024-001", "vendor_name": "Acme Tech Solutions", "item": "Enterprise Cloud Server Blades", "ordered_qty": 10, "received_qty": 10, "unit_price": 5000.0},
        {"po_number": "PO-2024-002", "vendor_name": "Bharat Industrial Supplies", "item": "Heavy Duty Industrial Bearings", "ordered_qty": 120, "received_qty": 100, "unit_price": 250.0},
        {"po_number": "PO-2024-004", "vendor_name": "Cybertron Logistics", "item": "Express Freight Units", "ordered_qty": 50, "received_qty": 50, "unit_price": 1200.0},
        {"po_number": "PO-2024-005", "vendor_name": "Zenith Stationery Ltd", "item": "Executive Ergonomic Desk Chairs", "ordered_qty": 20, "received_qty": 20, "unit_price": 2000.0},
        {"po_number": "PO-2024-006", "vendor_name": "Deccan Office Systems", "item": "Modular Office Workstations", "ordered_qty": 8, "received_qty": 8, "unit_price": 2500.0},
    ]
    with open(po_path, "w", newline="", encoding="utf-8") as f:
        writer = csv.DictWriter(f, fieldnames=["po_number", "vendor_name", "item", "ordered_qty", "received_qty", "unit_price"])
        writer.writeheader()
        writer.writerows(po_data)
    print(f"Created {po_path}")

def build_pdf(filepath, vendor_info, invoice_info, line_items, totals, extra_notes=None, is_messy=False):
    doc = SimpleDocTemplate(filepath, pagesize=letter, leftMargin=36, rightMargin=36, topMargin=36, bottomMargin=36)
    styles = getSampleStyleSheet()
    story = []

    font_family = "Courier" if is_messy else "Helvetica"
    font_bold = "Courier-Bold" if is_messy else "Helvetica-Bold"

    header_style = ParagraphStyle(
        'HeaderStyle',
        parent=styles['Normal'],
        fontName=font_bold,
        fontSize=20 if not is_messy else 16,
        leading=24 if not is_messy else 20,
        textColor=colors.HexColor('#0F172A') if not is_messy else colors.HexColor('#334155')
    )

    meta_style = ParagraphStyle(
        'MetaStyle',
        parent=styles['Normal'],
        fontName=font_family,
        fontSize=9,
        leading=13,
        textColor=colors.HexColor('#334155')
    )

    label_bold = ParagraphStyle(
        'LabelBold',
        parent=styles['Normal'],
        fontName=font_bold,
        fontSize=9,
        leading=13,
        textColor=colors.HexColor('#0F172A')
    )

    # Vendor & Invoice Title
    title_text = f"<b>{vendor_info['name']}</b>"
    story.append(Paragraph(title_text, header_style))
    story.append(Paragraph(f"GSTIN: {vendor_info['gstin']} | Bank Account: {vendor_info['bank']}", meta_style))
    story.append(Paragraph("TAX INVOICE", ParagraphStyle('SubHeader', parent=meta_style, fontName=font_bold, fontSize=12, leading=16, textColor=colors.HexColor('#2563EB'))))
    story.append(Spacer(1, 10))

    # Meta Table (Invoice No, Date, PO No, Buyer)
    meta_data = [
        [
            Paragraph(f"<b>Invoice Number:</b> {invoice_info['number']}", meta_style),
            Paragraph(f"<b>Invoice Date:</b> {invoice_info['date']}", meta_style)
        ],
        [
            Paragraph(f"<b>PO Number:</b> {invoice_info['po']}", meta_style),
            Paragraph(f"<b>Payment Terms:</b> Net 30 Days", meta_style)
        ],
        [
            Paragraph("<b>Bill To:</b> Enterprise Corp India Pvt Ltd<br/>GSTIN: 27AAAAA0000A1Z5<br/>Mumbai, Maharashtra, India", meta_style),
            Paragraph(f"<b>Remittance Bank Details:</b><br/>Account: {vendor_info['bank']}<br/>IFSC: HDFC0000001 / Transfer: NEFT/RTGS", meta_style)
        ]
    ]
    meta_table = Table(meta_data, colWidths=[270, 270])
    meta_table.setStyle(TableStyle([
        ('BACKGROUND', (0,0), (-1,-1), colors.HexColor('#F8FAFC')),
        ('BOX', (0,0), (-1,-1), 1, colors.HexColor('#CBD5E1')),
        ('VALIGN', (0,0), (-1,-1), 'TOP'),
        ('BOTTOMPADDING', (0,0), (-1,-1), 6),
        ('TOPPADDING', (0,0), (-1,-1), 6),
        ('LEFTPADDING', (0,0), (-1,-1), 8),
        ('RIGHTPADDING', (0,0), (-1,-1), 8),
    ]))
    story.append(meta_table)
    story.append(Spacer(1, 15))

    # Line Items Table
    table_data = [
        [
            Paragraph("<b>#</b>", label_bold),
            Paragraph("<b>Item Description</b>", label_bold),
            Paragraph("<b>Qty</b>", label_bold),
            Paragraph("<b>Unit Price (INR)</b>", label_bold),
            Paragraph("<b>Amount (INR)</b>", label_bold)
        ]
    ]

    for idx, item in enumerate(line_items, start=1):
        table_data.append([
            Paragraph(str(idx), meta_style),
            Paragraph(item['description'], meta_style),
            Paragraph(str(item['qty']), meta_style),
            Paragraph(f"Rs. {item['unit_price']:,.2f}", meta_style),
            Paragraph(f"Rs. {item['qty'] * item['unit_price']:,.2f}", meta_style)
        ])

    line_table = Table(table_data, colWidths=[30, 240, 50, 110, 110])
    line_table.setStyle(TableStyle([
        ('BACKGROUND', (0,0), (-1,0), colors.HexColor('#E2E8F0')),
        ('ALIGN', (0,0), (-1,-1), 'LEFT'),
        ('ALIGN', (2,0), (-1,-1), 'RIGHT'),
        ('BOX', (0,0), (-1,-1), 1, colors.HexColor('#94A3B8')),
        ('INNERGRID', (0,0), (-1,-1), 0.5, colors.HexColor('#CBD5E1')),
        ('TOPPADDING', (0,0), (-1,-1), 5),
        ('BOTTOMPADDING', (0,0), (-1,-1), 5),
        ('LEFTPADDING', (0,0), (-1,-1), 6),
        ('RIGHTPADDING', (0,0), (-1,-1), 6),
    ]))
    story.append(line_table)
    story.append(Spacer(1, 10))

    # Summary Totals Table
    totals_data = [
        [Paragraph("<b>Subtotal:</b>", label_bold), Paragraph(f"Rs. {totals['subtotal']:,.2f}", label_bold)],
        [Paragraph(f"<b>Tax (GST):</b>", label_bold), Paragraph(f"Rs. {totals['tax']:,.2f}", label_bold)],
        [Paragraph("<b>Total Amount:</b>", label_bold), Paragraph(f"<b>Rs. {totals['total']:,.2f}</b>", label_bold)]
    ]
    totals_table = Table(totals_data, colWidths=[430, 110])
    totals_table.setStyle(TableStyle([
        ('ALIGN', (0,0), (-1,-1), 'RIGHT'),
        ('LINEBELOW', (0,-1), (-1,-1), 1.5, colors.HexColor('#0F172A')),
        ('TOPPADDING', (0,0), (-1,-1), 4),
        ('BOTTOMPADDING', (0,0), (-1,-1), 4),
    ]))
    story.append(totals_table)
    story.append(Spacer(1, 10))

    if extra_notes:
        note_style = ParagraphStyle('NoteStyle', parent=meta_style, fontName=font_bold if is_messy else font_family, fontSize=9, textColor=colors.HexColor('#475569'))
        story.append(Paragraph(f"<b>Notes:</b> {extra_notes}", note_style))

    doc.build(story)
    print(f"Generated PDF: {filepath}")

def generate_all_demo_invoices():
    ensure_dirs()

    # 1. Clean: matches PO/GRN, correct 18% GST -> AUTO_APPROVED
    build_pdf(
        os.path.join(DEMO_DIR, "01_clean_invoice.pdf"),
        vendor_info={"name": "Acme Tech Solutions", "gstin": "27AABCU9603R1ZM", "bank": "HDFC000123456789"},
        invoice_info={"number": "INV-2024-001", "date": "2024-10-15", "po": "PO-2024-001"},
        line_items=[{"description": "Enterprise Cloud Server Blades", "qty": 10, "unit_price": 5000.0}],
        totals={"subtotal": 50000.0, "tax": 9000.0, "total": 59000.0},
        extra_notes="Standard delivery verified against GRN. 18% IGST applied as per HSN 8471."
    )

    # 2. Quantity mismatch: invoice 120 units, received 100 -> NEEDS_REVIEW
    build_pdf(
        os.path.join(DEMO_DIR, "02_quantity_mismatch_invoice.pdf"),
        vendor_info={"name": "Bharat Industrial Supplies", "gstin": "29AAACB8888P1Z5", "bank": "ICIC000987654321"},
        invoice_info={"number": "INV-2024-002", "date": "2024-10-16", "po": "PO-2024-002"},
        line_items=[{"description": "Heavy Duty Industrial Bearings", "qty": 120, "unit_price": 250.0}],
        totals={"subtotal": 30000.0, "tax": 5400.0, "total": 35400.0},
        extra_notes="Quantity shipped 120 units as per vendor dispatch advice. (Note: Warehouse GRN only verified 100 units received)."
    )

    # 3. Duplicate of #1 with slightly changed invoice number -> BLOCKED
    # Matches vendor, same total 59000, date within 30 days, invoice number similarity > 0.85
    build_pdf(
        os.path.join(DEMO_DIR, "03_duplicate_invoice.pdf"),
        vendor_info={"name": "Acme Tech Solutions", "gstin": "27AABCU9603R1ZM", "bank": "HDFC000123456789"},
        invoice_info={"number": "INV-2024-001B", "date": "2024-10-18", "po": "PO-2024-001"},
        line_items=[{"description": "Enterprise Cloud Server Blades", "qty": 10, "unit_price": 5000.0}],
        totals={"subtotal": 50000.0, "tax": 9000.0, "total": 59000.0},
        extra_notes="Revised billing slip for server shipment. Same billing amount and vendor reference."
    )

    # 4. Fraud: different bank account than vendors.csv -> BLOCKED
    # vendors.csv has HDFC000456789123; invoice specifies SBIN999988887777
    build_pdf(
        os.path.join(DEMO_DIR, "04_fraud_bank_mismatch_invoice.pdf"),
        vendor_info={"name": "Cybertron Logistics", "gstin": "07AAACC4444N1Z2", "bank": "SBIN999988887777"},
        invoice_info={"number": "INV-2024-004", "date": "2024-10-19", "po": "PO-2024-004"},
        line_items=[{"description": "Express Freight Units", "qty": 50, "unit_price": 1200.0}],
        totals={"subtotal": 60000.0, "tax": 10800.0, "total": 70800.0},
        extra_notes="Please update remittance details to our new State Bank of India account immediately."
    )

    # 5. Tax error: wrong GST -> NEEDS_REVIEW
    # Subtotal 40000, 18% GST should be 7200, but invoice charges 4000 (10%)
    build_pdf(
        os.path.join(DEMO_DIR, "05_tax_error_invoice.pdf"),
        vendor_info={"name": "Zenith Stationery Ltd", "gstin": "33AAACZ7777M1ZG", "bank": "SBIN000112233445"},
        invoice_info={"number": "INV-2024-005", "date": "2024-10-20", "po": "PO-2024-005"},
        line_items=[{"description": "Executive Ergonomic Desk Chairs", "qty": 20, "unit_price": 2000.0}],
        totals={"subtotal": 40000.0, "tax": 4000.0, "total": 44000.0},
        extra_notes="GST calculated at concession rate of 10% (differs from standard 18% requirement)."
    )

    # 6. Messy: different layout and font, total also in words -> NEEDS_REVIEW or AUTO_APPROVED
    build_pdf(
        os.path.join(DEMO_DIR, "06_messy_layout_invoice.pdf"),
        vendor_info={"name": "Deccan Office Systems", "gstin": "36AAACD2222K1Z9", "bank": "AXIS000556677889"},
        invoice_info={"number": "INV-2024-006", "date": "2024-10-21", "po": "PO-2024-006"},
        line_items=[{"description": "Modular Office Workstations", "qty": 8, "unit_price": 2500.0}],
        totals={"subtotal": 20000.0, "tax": 3600.0, "total": 23600.0},
        extra_notes="Amount in Words: Twenty-Three Thousand Six Hundred Indian Rupees Only. Special Courier Delivery.",
        is_messy=True
    )

if __name__ == "__main__":
    print("Generating demo CSV files...")
    generate_csv_files()
    print("Generating 6 demo invoice PDFs...")
    generate_all_demo_invoices()
    print("Done! Demo files created successfully.")
