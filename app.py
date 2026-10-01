import os, time, glob, json
import pandas as pd
import plotly.graph_objects as go
import streamlit as st
from dotenv import load_dotenv
import database, extractor, decision_engine
from styles import get_css

st.set_page_config(page_title="InvoiceIQ", page_icon="⚡", layout="wide", initial_sidebar_state="expanded")
load_dotenv()
database.init_db()
st.markdown(get_css(), unsafe_allow_html=True)


def _badge(decision):
    d = (decision or "").upper()
    if d in ("AUTO_APPROVED", "POSTED", "APPROVED_BY_USER", "APPROVED"):
        return '<span class="badge badge-approved">✓ AUTO-APPROVED</span>'
    if d == "NEEDS_REVIEW":
        return '<span class="badge badge-review">⚠️ NEEDS REVIEW</span>'
    if d == "BLOCKED":
        return '<span class="badge badge-blocked">🛑 BLOCKED</span>'
    if d == "REJECTED":
        return '<span class="badge badge-blocked">✕ REJECTED</span>'
    return f'<span class="badge badge-review">{decision}</span>'


def _conf_bar(label, conf):
    pct = int(float(conf) * 100)
    cls = "green" if pct > 90 else ("amber" if pct >= 70 else "red")
    return (
        f'<div class="conf-row">'
        f'<div class="conf-name">{label}</div>'
        f'<div class="conf-bar-bg"><div class="conf-bar-fill conf-bar-{cls}" style="width:{pct}%"></div></div>'
        f'<div class="conf-pct {cls}">{pct}%</div></div>'
    )


def _finding(f):
    if f["status"] == "PASS":
        css, icon = "finding-pass", "✓"
    elif f["severity"] == "BLOCK":
        css, icon = "finding-block", "🛑"
    else:
        css, icon = "finding-review", "⚠️"
    return (
        f'<div class="finding {css}">'
        f'<div class="finding-icon">{icon}</div>'
        f'<div class="finding-body">'
        f'<div class="finding-title">{f["title"]} &nbsp;<span style="font-size:11px;font-weight:600;color:#64748B">[{f["check"]}]</span></div>'
        f'<div class="finding-msg">{f["message"]}</div>'
        f"</div></div>"
    )


def _tracker(step):
    steps = ["Extract", "Validate", "Match", "Decide"]
    parts = []
    for i, s in enumerate(steps):
        if i < step:
            dot_cls = lbl_cls = "done"
            sym = "✓"
        elif i == step:
            dot_cls = lbl_cls = "active"
            sym = str(i + 1)
        else:
            dot_cls = lbl_cls = ""
            sym = str(i + 1)
        parts.append(
            f'<div class="tracker-step">'
            f'<div class="tracker-dot {dot_cls}">{sym}</div>'
            f'<div class="tracker-label {lbl_cls}">{s}</div>'
            f"</div>"
        )
        if i < len(steps) - 1:
            line_cls = "done" if i < step else ""
            parts.append(f'<div class="tracker-line {line_cls}"></div>')
    return '<div class="tracker">' + "".join(parts) + "</div>"


def _kpi(label, value, color="", sub=""):
    sub_html = f'<div class="kpi-sub">{sub}</div>' if sub else ""
    return (
        f'<div class="kpi-card">'
        f'<div class="kpi-label">{label}</div>'
        f'<div class="kpi-value {color}">{value}</div>'
        f"{sub_html}</div>"
    )


def _empty(icon, title, hint):
    return (
        f'<div class="empty-state"><div class="empty-icon">{icon}</div>'
        f'<div class="empty-title">{title}</div>'
        f'<div class="empty-hint">{hint}</div></div>'
    )


def _html_table(df_or_records, cols=None, col_labels=None):
    if isinstance(df_or_records, list):
        df = pd.DataFrame(df_or_records)
    else:
        df = df_or_records.copy()
    if df.empty:
        return '<div style="padding:20px;text-align:center;color:#64748B;font-size:13px">No records found.</div>'
    if cols:
        existing = [c for c in cols if c in df.columns]
        df = df[existing]
    if col_labels and len(col_labels) == len(df.columns):
        df.columns = col_labels
    header = "".join(
        f'<th style="padding:12px 16px;text-align:left;font-size:11.5px;font-weight:700;'
        f'color:#94A3B8;text-transform:uppercase;letter-spacing:.8px;'
        f'border-bottom:1px solid rgba(255,255,255,0.1);background:#151B2B;white-space:nowrap">{c}</th>'
        for c in df.columns
    )
    rows_html = ""
    for _, row in df.iterrows():
        cells = "".join(
            f'<td style="padding:12px 16px;font-size:13px;color:#F8FAFC;'
            f'border-bottom:1px solid rgba(255,255,255,0.05);max-width:280px;'
            f'overflow:hidden;text-overflow:ellipsis;white-space:nowrap">{v}</td>'
            for v in row.values
        )
        rows_html += f'<tr style="transition:background .15s" onmouseover="this.style.background=\'rgba(37,99,235,0.12)\'" onmouseout="this.style.background=\'transparent\'">{cells}</tr>'
    return (
        f'<div style="overflow-x:auto;border-radius:14px;border:1px solid rgba(255,255,255,0.08);background:#111827;box-shadow:0 4px 20px rgba(0,0,0,0.5)">'
        f'<table style="width:100%;border-collapse:collapse;background:transparent">'
        f'<thead><tr>{header}</tr></thead>'
        f"<tbody>{rows_html}</tbody></table></div>"
    )


groq_key = os.getenv("GROQ_API_KEY", "").strip()

with st.sidebar:
    st.markdown(
        '<div class="logo-wrap">'
        '<div class="logo-icon">IQ</div>'
        "<div>"
        '<div class="logo-name">InvoiceIQ</div>'
        '<div class="logo-tag">AI AP Platform</div>'
        "</div></div>",
        unsafe_allow_html=True,
    )
    try:
        pending_count = len(database.get_pending_review_invoices())
    except Exception:
        pending_count = 0

    nav_pages = [
        "📂  Upload",
        "📥  Approver Inbox",
        "📑  ERP Ledger",
        "🔍  Audit Log",
        "📊  Dashboard",
    ]

    def _fmt(p):
        if "Approver Inbox" in p and pending_count > 0:
            return f"📥  Approver Inbox  ({pending_count})"
        return p

    page = st.radio("Navigation", nav_pages, format_func=_fmt, key="nav_page", label_visibility="collapsed")
    st.markdown('<div style="height:32px"></div>', unsafe_allow_html=True)
    ai_chip = (
        '<span class="chip chip-online">● AI engine: Online</span>'
        if groq_key
        else '<span class="chip chip-offline">○ AI engine: Offline (fallback)</span>'
    )
    db_chip = '<span class="chip chip-db">● Database: Online</span>'
    st.markdown(ai_chip + "<br><br>" + db_chip, unsafe_allow_html=True)


# ─── UPLOAD PAGE ────────────────────────────────────────────────────
if "Upload" in page:
    st.markdown(
        '<div class="hero">'
        '<div class="hero-tag">⚡ Autonomous Ingestion Pipeline</div>'
        '<div class="hero-title">Intelligent Invoice Processing</div>'
        '<div class="hero-sub">Upload vendor PDF invoices or select curated scenario files. Extract structured entities, run deterministic compliance checks, perform 3-way PO & GRN matching, and execute instant payment decisions.</div>'
        "</div>",
        unsafe_allow_html=True,
    )
    st.markdown(_tracker(-1), unsafe_allow_html=True)

    col_up, col_demo = st.columns([1, 1], gap="large")
    with col_up:
        st.markdown('<div class="sh">Upload Invoice Document</div>', unsafe_allow_html=True)
        uploaded_file = st.file_uploader(
            "Drag and drop a PDF, or click to browse",
            type=["pdf"],
            key="file_upload_input",
            label_visibility="collapsed",
        )
    with col_demo:
        st.markdown('<div class="sh">Curated Demo Scenarios</div>', unsafe_allow_html=True)
        demo_files = sorted(glob.glob("demo_invoices/*.pdf"))
        opts = ["-- Select a demo PDF --"] + [os.path.basename(f) for f in demo_files]
        selected_demo = st.selectbox("Demo invoice", opts, label_visibility="collapsed")

    file_bytes, file_name = None, None
    if uploaded_file:
        file_bytes = uploaded_file.read()
        file_name = uploaded_file.name
    elif selected_demo != opts[0]:
        p = os.path.join("demo_invoices", selected_demo)
        if os.path.exists(p):
            file_bytes = open(p, "rb").read()
            file_name = selected_demo

    if file_bytes and file_name:
        st.markdown('<hr style="margin:20px 0">', unsafe_allow_html=True)
        if st.button("🚀  Run AI Ingestion Pipeline", type="primary", use_container_width=False):
            st.session_state["last_result"] = None
            ph = st.empty()
            msgs = ["Analyzing PDF document layout...", "Running deterministic compliance & math checks...", "Performing 3-way PO & GRN matching...", "Executing autonomous decision matrix..."]
            for i, msg in enumerate(msgs):
                ph.markdown(
                    _tracker(i) + f'<p style="text-align:center;color:#93C5FD;font-size:13.5px;font-weight:600">⏳ {msg}</p>',
                    unsafe_allow_html=True,
                )
                if i < 3:
                    time.sleep(0.25)
            t0 = time.time()
            with st.spinner("Processing with AI..."):
                ext = extractor.extract_invoice_data(file_bytes, file_name)
                res = decision_engine.evaluate_and_decide(ext, file_name, ext["file_hash"], time.time() - t0)
            proc_time = time.time() - t0
            ph.markdown(_tracker(4), unsafe_allow_html=True)
            st.session_state["last_result"] = (ext, res, proc_time)

    if st.session_state.get("last_result"):
        ext, res, proc_time = st.session_state["last_result"]
        decision = res["decision"]
        reason = res["reason"]
        findings = res["findings"]
        email = res["vendor_email"]
        payment_ref = res.get("payment_ref")
        from_cache = ext.get("from_cache", False)

        cache_html = '<span class="chip chip-online" style="font-size:12px">⚡ Instant Cache</span>' if from_cache else ""
        ref_html = (
            f'<span class="chip chip-db" style="font-size:12px">💳 {payment_ref}</span>'
            if payment_ref
            else ""
        )

        st.markdown(
            f'<div class="result-card">'
            f'<div style="display:flex;align-items:center;gap:12px;flex-wrap:wrap">'
            f"{_badge(decision)}"
            f'<span class="proc-time">⏱️ {proc_time:.2f}s</span>'
            f"{cache_html}{ref_html}"
            f"</div>"
            f'<div class="result-reason"><strong>Decision Summary:</strong><br>{reason}</div>'
            f"</div>",
            unsafe_allow_html=True,
        )

        tab_data, tab_checks, tab_email = st.tabs(
            ["📋  Extracted Data", "🔍  Validation Findings", "✉️  Vendor Communication"]
        )

        with tab_data:
            confs = ext.get("confidences", {})
            field_map = [
                ("Vendor Name", "vendor_name"),
                ("Vendor GSTIN", "vendor_gstin"),
                ("Invoice Number", "invoice_number"),
                ("Invoice Date", "invoice_date"),
                ("PO Number", "po_number"),
                ("Subtotal", "subtotal"),
                ("Tax (GST)", "tax"),
                ("Total Amount", "total"),
                ("Bank Account", "bank_account"),
            ]
            col_a, col_b = st.columns([1, 1], gap="large")
            with col_a:
                st.markdown('<div class="sh">Entity Extraction</div>', unsafe_allow_html=True)
                rows = "".join(
                    f'<tr style="border-bottom:1px solid rgba(255,255,255,0.06)">'
                    f'<td style="padding:10px 14px;font-weight:600;color:#94A3B8;font-size:13px">{n}</td>'
                    f'<td style="padding:10px 14px;font-family:JetBrains Mono,monospace;font-size:13px;color:#F8FAFC;font-weight:600">{ext.get(k) or "---"}</td>'
                    f"</tr>"
                    for n, k in field_map
                )
                st.markdown(
                    f'<div style="border-radius:14px;border:1px solid rgba(255,255,255,0.08);background:#111827;overflow:hidden">'
                    f'<table style="width:100%;border-collapse:collapse">{rows}</table></div>',
                    unsafe_allow_html=True,
                )
            with col_b:
                st.markdown('<div class="sh">Confidence Metrics</div>', unsafe_allow_html=True)
                bars = "".join(_conf_bar(n, confs.get(k, 0)) for n, k in field_map)
                st.markdown(
                    f'<div style="padding:16px;border:1px solid rgba(255,255,255,0.08);border-radius:14px;background:#111827">{bars}</div>',
                    unsafe_allow_html=True,
                )

            items = ext.get("line_items", [])
            if items:
                st.markdown('<div class="sh" style="margin-top:22px">Line Items Breakdown</div>', unsafe_allow_html=True)
                df_items = pd.DataFrame(items)
                if {"qty", "unit_price"}.issubset(df_items.columns):
                    df_items["amount"] = df_items["qty"] * df_items["unit_price"]
                st.markdown(_html_table(df_items), unsafe_allow_html=True)

        with tab_checks:
            st.markdown('<div class="sh">Deterministic Compliance Results</div>', unsafe_allow_html=True)
            html_finds = "".join(_finding(f) for f in findings)
            st.markdown(html_finds, unsafe_allow_html=True)

        with tab_email:
            st.markdown('<div class="sh">Auto-Drafted Vendor Communication</div>', unsafe_allow_html=True)
            st.markdown(f'<div class="email-block">{email}</div>', unsafe_allow_html=True)

    elif not (file_bytes and file_name):
        st.markdown(
            _empty("📄", "No invoice loaded", "Upload a PDF above or pick one from the demo scenarios, then click Run AI Ingestion Pipeline."),
            unsafe_allow_html=True,
        )


# ─── APPROVER INBOX ─────────────────────────────────────────────────
elif "Approver Inbox" in page:
    st.markdown(
        '<div class="hero">'
        '<div class="hero-tag">📥 Human-In-The-Loop Review</div>'
        '<div class="hero-title">Approver Inbox</div>'
        '<div class="hero-sub">Invoices requiring human sign-off. Review flagged discrepancies, inspect itemized 3-way match exceptions, then approve to post or reject with a logged audit rationale.</div>'
        "</div>",
        unsafe_allow_html=True,
    )
    pending = database.get_pending_review_invoices()
    if not pending:
        st.markdown(
            _empty("🎉", "Inbox Zero", "All invoices are cleared. No items currently require human judgment."),
            unsafe_allow_html=True,
        )
    else:
        st.info(f"**{len(pending)}** invoice(s) waiting for human sign-off.")
        for inv in pending:
            inv_id = inv["id"]
            try:
                findings_list = json.loads(inv["findings_json"]) if inv["findings_json"] else []
            except Exception:
                findings_list = []
            fail_msgs = [f["message"] for f in findings_list if f.get("status") == "FAIL"]

            st.markdown(
                f'<div class="inbox-card">'
                f'<div style="display:flex;justify-content:space-between;align-items:flex-start;flex-wrap:wrap;gap:12px">'
                f"<div>"
                f'<div class="inbox-vendor">{inv["vendor_name"]}</div>'
                f'<div class="inbox-meta">Invoice #{inv["invoice_number"]} &nbsp;•&nbsp; PO {inv["po_number"]} &nbsp;•&nbsp; {inv["invoice_date"]}</div>'
                f"</div>"
                f'<div style="text-align:right">'
                f'<div class="inbox-amount">₹{float(inv["total"]):,.2f}</div>'
                f"{_badge('NEEDS_REVIEW')}"
                f"</div></div>"
                f'<div class="result-reason" style="margin-top:14px"><strong>Hold Reason:</strong><br>{inv["decision_reason"]}</div>'
                f"</div>",
                unsafe_allow_html=True,
            )

            if fail_msgs:
                with st.expander("View flagged discrepancies and draft vendor communication"):
                    for m in fail_msgs:
                        st.warning(m)
                    st.markdown('<div class="sh" style="margin-top:14px">Draft Vendor Email</div>', unsafe_allow_html=True)
                    st.markdown(f'<div class="email-block">{inv["draft_email"]}</div>', unsafe_allow_html=True)

            ac1, ac2, _ = st.columns([1, 1, 3])
            with ac1:
                if st.button("✅  Approve and Post", key=f"appr_{inv_id}", type="primary"):
                    database.approve_invoice_manual(inv_id)
                    st.success(f'Invoice #{inv["invoice_number"]} approved and posted to General Ledger!')
                    time.sleep(0.6)
                    st.rerun()
            with ac2:
                with st.popover("❌  Reject", use_container_width=True):
                    rej = st.text_area("Rejection reason", key=f"rej_{inv_id}")
                    if st.button("Confirm Reject", key=f"conf_{inv_id}"):
                        database.reject_invoice_manual(inv_id, reason=rej)
                        st.error("Invoice rejected.")
                        time.sleep(0.6)
                        st.rerun()
            st.markdown('<hr style="margin:12px 0">', unsafe_allow_html=True)


# ─── ERP LEDGER ─────────────────────────────────────────────────────
elif "ERP Ledger" in page:
    st.markdown(
        '<div class="hero">'
        '<div class="hero-tag">📑 General Ledger Settlement</div>'
        '<div class="hero-title">ERP General Ledger</div>'
        '<div class="hero-sub">Complete audit-compliant ledger of all auto-approved and human-approved invoices posted for settlement disbursement.</div>'
        "</div>",
        unsafe_allow_html=True,
    )
    records = database.get_erp_ledger_records()
    if not records:
        st.markdown(
            _empty("📒", "Ledger Empty", "No invoices have been posted yet. Process a clean invoice to get started."),
            unsafe_allow_html=True,
        )
    else:
        df = pd.DataFrame(records)
        m1, m2, m3 = st.columns(3)
        m1.metric("Posted Invoices", len(df))
        m2.metric("Total Ledger Value", f'₹{df["total"].astype(float).sum():,.0f}')
        m3.metric("Total GST Disbursed", f'₹{df["tax"].astype(float).sum():,.0f}')
        st.markdown('<hr style="margin:16px 0">', unsafe_allow_html=True)
        kw = st.text_input("🔍  Search ledger by vendor or invoice number", "", placeholder="e.g. Acme or INV-2024-001")
        if kw.strip():
            df = df[
                df["vendor_name"].str.contains(kw, case=False, na=False)
                | df["invoice_number"].str.contains(kw, case=False, na=False)
            ]
        cols_show = ["id", "invoice_number", "vendor_name", "invoice_date", "po_number",
                     "subtotal", "tax", "total", "status", "payment_reference", "posted_at"]
        col_labels = ["ID", "Invoice #", "Vendor", "Date", "PO #",
                      "Subtotal (₹)", "Tax (₹)", "Total (₹)", "Status", "Payment Ref", "Posted At"]
        st.markdown(_html_table(df, cols_show, col_labels), unsafe_allow_html=True)
        csv = df[[c for c in cols_show if c in df.columns]].to_csv(index=False).encode("utf-8")
        st.download_button("📥  Export to CSV", csv, "invoiceiq_ledger.csv", "text/csv")


# ─── AUDIT LOG ──────────────────────────────────────────────────────
elif "Audit Log" in page:
    st.markdown(
        '<div class="hero">'
        '<div class="hero-tag">🔍 Security & Compliance</div>'
        '<div class="hero-title">Immutable Audit Trail</div>'
        '<div class="hero-sub">Cryptographically ordered, timestamped compliance log capturing every extraction, validation, decision, approval, and ledger entry.</div>'
        "</div>",
        unsafe_allow_html=True,
    )
    logs = database.get_audit_logs(limit=300)
    if not logs:
        st.markdown(
            _empty("📋", "No Logs Yet", "Process an invoice to start generating audit events."),
            unsafe_allow_html=True,
        )
    else:
        df_log = pd.DataFrame(logs)
        fc1, fc2 = st.columns([1, 2])
        with fc1:
            stages = ["All"] + sorted(df_log["stage"].unique().tolist())
            sel_stage = st.selectbox("Filter by stage", stages)
        with fc2:
            kw_log = st.text_input("Search audit logs", "", placeholder="e.g. BLOCKED, invoice number, actor...")
        filt = df_log.copy()
        if sel_stage != "All":
            filt = filt[filt["stage"] == sel_stage]
        if kw_log.strip():
            filt = filt[
                filt["details"].str.contains(kw_log, case=False, na=False)
                | filt["action"].str.contains(kw_log, case=False, na=False)
            ]
        cols_log = ["timestamp", "stage", "action", "invoice_number", "actor", "details"]
        col_labels = ["Timestamp", "Stage", "Action", "Invoice #", "Actor", "Details"]
        st.markdown(_html_table(filt, cols_log, col_labels), unsafe_allow_html=True)


# ─── DASHBOARD ──────────────────────────────────────────────────────
elif "Dashboard" in page:
    st.markdown(
        '<div class="hero">'
        '<div class="hero-tag">📊 Operations & Financial Analytics</div>'
        '<div class="hero-title">Executive AP Performance Dashboard</div>'
        '<div class="hero-sub">Live telemetry of accounts payable automation: touchless velocity, fraud prevention metrics, and verified cost savings.</div>'
        "</div>",
        unsafe_allow_html=True,
        )
    stats = database.get_dashboard_metrics()
    all_inv = database.get_all_invoices()
    total = stats["total_invoices"]

    k1, k2, k3, k4, k5, k6 = st.columns(6)
    k1.markdown(_kpi("Processed", total), unsafe_allow_html=True)
    k2.markdown(_kpi("Touchless Rate", f'{stats["pct_touchless"]:.1f}%', "blue", "Auto-approved"), unsafe_allow_html=True)
    k3.markdown(_kpi("Blocked", stats["blocked"], "red", "Fraud / duplicate"), unsafe_allow_html=True)
    k4.markdown(_kpi("In Review", stats["needs_review"], "amber", "Awaiting humans"), unsafe_allow_html=True)
    k5.markdown(_kpi("Time Saved", f'{stats["time_saved_hours"]:.1f}h', "blue", "20 min vs 10 sec/inv"), unsafe_allow_html=True)
    k6.markdown(_kpi("Cost Saved", f'₹{stats["money_saved_rs"]:,.0f}', "green", "₹600 vs ₹40/inv"), unsafe_allow_html=True)
    st.markdown('<div style="height:24px"></div>', unsafe_allow_html=True)

    if all_inv:
        dec_counts = {}
        for inv in all_inv:
            dec_counts[inv["decision"]] = dec_counts.get(inv["decision"], 0) + 1
        colors_map = {
            "AUTO_APPROVED": "#10B981",
            "NEEDS_REVIEW": "#F59E0B",
            "BLOCKED": "#EF4444",
            "APPROVED_BY_USER": "#3B82F6",
            "REJECTED": "#7C3AED",
        }
        labels = list(dec_counts.keys())
        values = list(dec_counts.values())
        colors = [colors_map.get(l, "#3B82F6") for l in labels]

        ch1, ch2 = st.columns([1, 2], gap="large")
        with ch1:
            st.markdown('<div class="sh">Decision Distribution</div>', unsafe_allow_html=True)
            fig_d = go.Figure(
                go.Pie(
                    labels=labels, values=values, hole=0.68,
                    marker=dict(colors=colors, line=dict(color="#080B12", width=2)),
                    textfont=dict(size=12, color="#F8FAFC", family="Inter"),
                    hovertemplate="%{label}: %{value}<extra></extra>",
                )
            )
            fig_d.update_layout(
                margin=dict(t=10, b=10, l=10, r=10),
                paper_bgcolor="rgba(0,0,0,0)",
                plot_bgcolor="rgba(0,0,0,0)",
                legend=dict(font=dict(color="#94A3B8", size=12), bgcolor="rgba(0,0,0,0)"),
                showlegend=True, height=280,
            )
            st.plotly_chart(fig_d, use_container_width=True, config={"displayModeBar": False})

        with ch2:
            st.markdown('<div class="sh">Invoices by Decision Category</div>', unsafe_allow_html=True)
            fig_b = go.Figure(
                go.Bar(
                    x=labels, y=values, marker_color=colors,
                    text=values, textposition="auto",
                    textfont=dict(color="#FFFFFF", size=13, family="Inter"),
                    hovertemplate="%{x}: %{y}<extra></extra>",
                )
            )
            fig_b.update_layout(
                margin=dict(t=10, b=10, l=10, r=10),
                paper_bgcolor="rgba(0,0,0,0)",
                plot_bgcolor="rgba(0,0,0,0)",
                height=280,
                xaxis=dict(showgrid=False, color="#94A3B8"),
                yaxis=dict(showgrid=True, gridcolor="rgba(255, 255, 255, 0.06)", color="#94A3B8"),
            )
            st.plotly_chart(fig_b, use_container_width=True, config={"displayModeBar": False})
    else:
        st.markdown(
            _empty("📊", "No Data Yet", 'Click "Run Complete Demo Suite" below to trigger live analytics.'),
            unsafe_allow_html=True,
        )

    st.markdown('<hr style="margin:24px 0">', unsafe_allow_html=True)
    st.markdown('<div class="sh">Demo Simulation Engine</div>', unsafe_allow_html=True)
    dc1, dc2, _ = st.columns([1, 1, 2])
    with dc1:
        if st.button("🚀  Run Complete Demo Suite", type="primary", use_container_width=True):
            demo_pairs = [
                (1, "clean_invoice"),
                (2, "quantity_mismatch_invoice"),
                (3, "duplicate_invoice"),
                (4, "fraud_bank_mismatch_invoice"),
                (5, "tax_error_invoice"),
                (6, "messy_layout_invoice"),
            ]
            demo_list = [f"demo_invoices/0{i}_{n}.pdf" for i, n in demo_pairs]
            pb = st.progress(0)
            ph2 = st.empty()
            for idx, fp in enumerate(demo_list):
                ph2.markdown(
                    f'<p style="font-size:13px;color:#93C5FD;font-weight:600">Processing {idx+1}/{len(demo_list)}: {os.path.basename(fp)}...</p>',
                    unsafe_allow_html=True,
                )
                if os.path.exists(fp):
                    t0 = time.time()
                    b = open(fp, "rb").read()
                    ext = extractor.extract_invoice_data(b, fp)
                    decision_engine.evaluate_and_decide(ext, fp, ext["file_hash"], time.time() - t0)
                pb.progress((idx + 1) / len(demo_list))
            ph2.markdown(
                '<p style="color:#34D399;font-size:13px;font-weight:700">✓ All 6 demo invoices processed successfully!</p>',
                unsafe_allow_html=True,
            )
            time.sleep(0.8)
            st.rerun()
    with dc2:
        if st.button("🔄  Reset Demo Data", use_container_width=True):
            database.reset_all_data()
            st.warning("All records cleared. Reference datasets re-seeded.")
            time.sleep(0.8)
            st.rerun()
