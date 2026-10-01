"""
styles.py — Modern premium dark-tech AI SaaS dashboard design system.
Inspired by futuristic developer tools (Linear, Vercel, Raycast, Cursor).
Colors: #080B12 / #0B1020, #111827, #151B2B, #2563EB, #3B82F6, #7C3AED, #F8FAFC, #94A3B8.
Usage: st.markdown(get_css(), unsafe_allow_html=True)
"""


def get_css() -> str:
    return """
<style>
@import url('https://fonts.googleapis.com/css2?family=Inter:wght@300;400;500;600;700;800&family=JetBrains+Mono:wght@400;500;600&display=swap');

:root {
  --bg-base:        #080B12;
  --bg-surface:     #0B1020;
  --bg-card:        #111827;
  --bg-card-sec:    #151B2B;
  --bg-input:       #151B2B;
  --border:         rgba(255, 255, 255, 0.08);
  --border-hover:   rgba(59, 130, 246, 0.35);
  --border-glow:    rgba(124, 58, 237, 0.3);

  --primary-blue:   #2563EB;
  --bright-blue:    #3B82F6;
  --purple-accent:  #7C3AED;
  --indigo-mid:     #6366F1;

  --text-main:      #F8FAFC;
  --text-sec:       #94A3B8;
  --text-muted:     #64748B;

  --green-glow:     #10B981;
  --amber-glow:     #F59E0B;
  --red-glow:       #EF4444;

  --radius-sm:      10px;
  --radius-card:    16px;
  --radius-lg:      20px;

  --shadow-card:    0 4px 20px -2px rgba(0, 0, 0, 0.6), inset 0 1px 0 rgba(255, 255, 255, 0.06);
  --shadow-glow:    0 0 24px rgba(37, 99, 235, 0.25);
  --shadow-purple:  0 0 28px rgba(124, 58, 237, 0.3);
}

/* Global resets & typography */
html, body, [class*="css"], [data-testid="stAppViewContainer"] {
  font-family: 'Inter', -apple-system, BlinkMacSystemFont, sans-serif !important;
  background-color: var(--bg-base) !important;
  background-image: 
    radial-gradient(at 10% 10%, rgba(37, 99, 235, 0.07) 0px, transparent 50%),
    radial-gradient(at 90% 15%, rgba(124, 58, 237, 0.06) 0px, transparent 50%),
    radial-gradient(at 50% 90%, rgba(15, 23, 42, 0.8) 0px, transparent 50%) !important;
  background-attachment: fixed !important;
  color: var(--text-main) !important;
}

#MainMenu, footer, .stDeployButton, header[data-testid="stHeader"] { 
  display: none !important; 
}

.block-container {
  padding-top: 1.5rem !important;
  padding-bottom: 2.5rem !important;
  max-width: 1260px !important;
}

/* Modern Left Sidebar */
section[data-testid="stSidebar"] {
  background: var(--bg-surface) !important;
  border-right: 1px solid var(--border) !important;
  box-shadow: 4px 0 24px rgba(0, 0, 0, 0.4) !important;
}
section[data-testid="stSidebar"] > div:first-child { 
  padding: 24px 16px !important; 
}
section[data-testid="stSidebar"] .stRadio > div { 
  gap: 5px !important; 
}
section[data-testid="stSidebar"] .stRadio label {
  display: flex !important;
  align-items: center !important;
  padding: 11px 15px !important;
  border-radius: var(--radius-sm) !important;
  font-size: 13.5px !important;
  font-weight: 500 !important;
  color: var(--text-sec) !important;
  cursor: pointer !important;
  transition: all 0.2s cubic-bezier(0.4, 0, 0.2, 1) !important;
  border: 1px solid transparent !important;
  background: transparent !important;
}
section[data-testid="stSidebar"] .stRadio label:hover {
  background: var(--bg-card-sec) !important;
  color: var(--text-main) !important;
  border-color: rgba(59, 130, 246, 0.2) !important;
  transform: translateX(2px) !important;
}
section[data-testid="stSidebar"] .stRadio input[type="radio"]:checked + div,
section[data-testid="stSidebar"] .stRadio [data-checked="true"] {
  background: linear-gradient(135deg, rgba(37, 99, 235, 0.2), rgba(124, 58, 237, 0.2)) !important;
  border: 1px solid var(--bright-blue) !important;
  color: #FFFFFF !important;
  font-weight: 600 !important;
  border-radius: var(--radius-sm) !important;
  box-shadow: 0 0 16px rgba(59, 130, 246, 0.25) !important;
}
section[data-testid="stSidebar"] .stRadio input[type="radio"] { 
  display: none !important; 
}

/* Brand Logo */
.logo-wrap {
  display: flex;
  align-items: center;
  gap: 12px;
  padding-bottom: 22px;
  border-bottom: 1px solid var(--border);
  margin-bottom: 22px;
}
.logo-icon {
  width: 42px;
  height: 42px;
  border-radius: 12px;
  background: linear-gradient(135deg, var(--primary-blue) 0%, var(--purple-accent) 100%);
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 18px;
  color: #FFFFFF;
  font-weight: 800;
  box-shadow: 0 0 20px rgba(124, 58, 237, 0.45);
  flex-shrink: 0;
}
.logo-name {
  font-size: 19px;
  font-weight: 800;
  color: #FFFFFF;
  letter-spacing: -0.5px;
  background: linear-gradient(90deg, #FFFFFF, #E2E8F0);
  -webkit-background-clip: text;
  -webkit-text-fill-color: transparent;
}
.logo-tag {
  font-size: 10px;
  font-weight: 700;
  color: var(--bright-blue);
  text-transform: uppercase;
  letter-spacing: 1px;
}

/* Status Chips */
.chip {
  display: inline-flex;
  align-items: center;
  gap: 6px;
  padding: 6px 12px;
  border-radius: 999px;
  font-size: 11.5px;
  font-weight: 600;
  letter-spacing: 0.2px;
}
.chip-online {
  background: rgba(16, 185, 129, 0.12);
  color: #34D399;
  border: 1px solid rgba(16, 185, 129, 0.35);
  box-shadow: 0 0 12px rgba(16, 185, 129, 0.15);
}
.chip-offline {
  background: rgba(148, 163, 184, 0.1);
  color: #94A3B8;
  border: 1px solid rgba(148, 163, 184, 0.2);
}
.chip-db {
  background: rgba(59, 130, 246, 0.12);
  color: #93C5FD;
  border: 1px solid rgba(59, 130, 246, 0.35);
  box-shadow: 0 0 12px rgba(59, 130, 246, 0.15);
}

/* Top Section: Futuristic Dark Hero */
.hero {
  background: linear-gradient(135deg, rgba(17, 24, 39, 0.95) 0%, rgba(21, 27, 43, 0.95) 100%);
  border: 1px solid var(--border);
  border-radius: var(--radius-card);
  padding: 28px 32px;
  margin-bottom: 24px;
  position: relative;
  overflow: hidden;
  box-shadow: var(--shadow-card);
}
.hero::after {
  content: '';
  position: absolute;
  top: -80px;
  right: -60px;
  width: 260px;
  height: 260px;
  background: radial-gradient(circle, rgba(124, 58, 237, 0.18), transparent 70%);
  pointer-events: none;
}
.hero-tag {
  display: inline-flex;
  align-items: center;
  gap: 6px;
  padding: 4px 10px;
  background: rgba(59, 130, 246, 0.12);
  border: 1px solid rgba(59, 130, 246, 0.3);
  border-radius: 999px;
  font-size: 11px;
  font-weight: 700;
  color: #93C5FD;
  text-transform: uppercase;
  letter-spacing: 0.8px;
  margin-bottom: 12px;
}
.hero-title {
  font-size: 26px;
  font-weight: 800;
  color: #FFFFFF;
  margin: 0 0 8px 0;
  letter-spacing: -0.6px;
}
.hero-sub {
  font-size: 14.5px;
  color: var(--text-sec);
  margin: 0;
  line-height: 1.6;
  max-width: 860px;
}

/* Dark Glass Cards */
.card, .kpi-card, .result-card, .inbox-card {
  background: linear-gradient(180deg, var(--bg-card) 0%, #0D131F 100%);
  border: 1px solid var(--border);
  border-radius: var(--radius-card);
  padding: 22px 24px;
  box-shadow: var(--shadow-card);
  transition: all 0.25s cubic-bezier(0.4, 0, 0.2, 1);
  position: relative;
}
.card:hover, .kpi-card:hover, .inbox-card:hover {
  transform: translateY(-2px);
  border-color: var(--border-hover);
  box-shadow: 0 8px 30px -4px rgba(0, 0, 0, 0.8), 0 0 20px rgba(59, 130, 246, 0.15);
}

/* KPI Cards */
.kpi-label {
  font-size: 11px;
  font-weight: 700;
  color: var(--text-muted);
  text-transform: uppercase;
  letter-spacing: 1px;
  margin-bottom: 8px;
}
.kpi-value {
  font-size: 28px;
  font-weight: 800;
  color: #FFFFFF;
  line-height: 1.15;
}
.kpi-value.green { color: #34D399; text-shadow: 0 0 16px rgba(16, 185, 129, 0.3); }
.kpi-value.amber { color: #FBBF24; text-shadow: 0 0 16px rgba(245, 158, 11, 0.3); }
.kpi-value.red   { color: #F87171; text-shadow: 0 0 16px rgba(239, 68, 68, 0.3); }
.kpi-value.blue  { color: #60A5FA; text-shadow: 0 0 16px rgba(59, 130, 246, 0.3); }
.kpi-sub {
  font-size: 12px;
  color: var(--text-muted);
  margin-top: 6px;
}

/* Decision Badges with Soft Glow */
.badge {
  display: inline-flex;
  align-items: center;
  gap: 7px;
  padding: 6px 14px;
  border-radius: 999px;
  font-weight: 700;
  font-size: 12px;
  letter-spacing: 0.4px;
}
.badge-approved {
  background: rgba(16, 185, 129, 0.14);
  color: #34D399;
  border: 1px solid rgba(16, 185, 129, 0.38);
  box-shadow: 0 0 14px rgba(16, 185, 129, 0.2);
}
.badge-review {
  background: rgba(245, 158, 11, 0.14);
  color: #FBBF24;
  border: 1px solid rgba(245, 158, 11, 0.38);
  box-shadow: 0 0 14px rgba(245, 158, 11, 0.2);
}
.badge-blocked {
  background: rgba(239, 68, 68, 0.14);
  color: #F87171;
  border: 1px solid rgba(239, 68, 68, 0.38);
  box-shadow: 0 0 14px rgba(239, 68, 68, 0.2);
}

/* Result Reason Block */
.result-reason {
  background: rgba(37, 99, 235, 0.08);
  border-left: 3px solid var(--bright-blue);
  border-radius: 0 8px 8px 0;
  padding: 14px 18px;
  font-size: 14px;
  color: var(--text-main);
  line-height: 1.65;
  margin-top: 16px;
  border: 1px solid rgba(59, 130, 246, 0.2);
  border-left-width: 4px;
}

/* Pipeline Progress Tracker */
.tracker {
  display: flex;
  align-items: flex-start;
  margin: 22px 0 28px 0;
  background: var(--bg-card-sec);
  border: 1px solid var(--border);
  border-radius: var(--radius-card);
  padding: 18px 24px;
  box-shadow: var(--shadow-card);
}
.tracker-step {
  display: flex;
  flex-direction: column;
  align-items: center;
  flex: 1;
}
.tracker-dot {
  width: 34px;
  height: 34px;
  border-radius: 50%;
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 13px;
  font-weight: 700;
  border: 2px solid rgba(255, 255, 255, 0.15);
  background: var(--bg-card);
  color: var(--text-muted);
  position: relative;
  z-index: 2;
  transition: all 0.2s ease;
}
.tracker-dot.active {
  background: linear-gradient(135deg, var(--primary-blue), var(--purple-accent));
  border-color: transparent;
  color: #FFFFFF;
  box-shadow: 0 0 20px rgba(124, 58, 237, 0.6);
}
.tracker-dot.done {
  background: rgba(16, 185, 129, 0.2);
  border-color: #10B981;
  color: #34D399;
  box-shadow: 0 0 12px rgba(16, 185, 129, 0.3);
}
.tracker-label {
  font-size: 11px;
  font-weight: 700;
  color: var(--text-muted);
  margin-top: 8px;
  text-transform: uppercase;
  letter-spacing: 0.6px;
}
.tracker-label.active { color: #93C5FD; text-shadow: 0 0 8px rgba(59, 130, 246, 0.4); }
.tracker-label.done   { color: #34D399; }
.tracker-line {
  flex: 1;
  height: 2px;
  background: rgba(255, 255, 255, 0.1);
  margin-top: 16px;
  z-index: 1;
}
.tracker-line.done { background: #10B981; box-shadow: 0 0 8px rgba(16, 185, 129, 0.4); }

/* Confidence Scores */
.conf-row {
  display: flex;
  align-items: center;
  gap: 12px;
  margin-bottom: 11px;
}
.conf-name {
  font-size: 13px;
  color: var(--text-sec);
  font-weight: 500;
  width: 135px;
  flex-shrink: 0;
}
.conf-bar-bg {
  flex: 1;
  height: 7px;
  background: rgba(255, 255, 255, 0.05);
  border-radius: 999px;
  overflow: hidden;
  border: 1px solid rgba(255, 255, 255, 0.05);
}
.conf-bar-fill { height: 100%; border-radius: 999px; }
.conf-bar-green { background: linear-gradient(90deg, #059669, #10B981); box-shadow: 0 0 10px rgba(16, 185, 129, 0.4); }
.conf-bar-amber { background: linear-gradient(90deg, #D97706, #F59E0B); box-shadow: 0 0 10px rgba(245, 158, 11, 0.4); }
.conf-bar-red   { background: linear-gradient(90deg, #DC2626, #EF4444); box-shadow: 0 0 10px rgba(239, 68, 68, 0.4); }
.conf-pct {
  font-size: 12px;
  font-weight: 700;
  width: 40px;
  text-align: right;
}
.conf-pct.green { color: #34D399; }
.conf-pct.amber { color: #FBBF24; }
.conf-pct.red   { color: #F87171; }

/* Findings Cards */
.finding {
  display: flex;
  align-items: flex-start;
  gap: 12px;
  padding: 13px 16px;
  border-radius: 12px;
  margin-bottom: 9px;
  border: 1px solid;
  transition: all 0.2s ease;
}
.finding-pass {
  background: rgba(16, 185, 129, 0.07);
  border-color: rgba(16, 185, 129, 0.25);
}
.finding-review {
  background: rgba(245, 158, 11, 0.07);
  border-color: rgba(245, 158, 11, 0.25);
}
.finding-block {
  background: rgba(239, 68, 68, 0.09);
  border-color: rgba(239, 68, 68, 0.3);
}
.finding-icon  { font-size: 15px; flex-shrink: 0; margin-top: 1px; }
.finding-title {
  font-size: 13.5px;
  font-weight: 700;
  color: var(--text-main);
  margin-bottom: 3px;
}
.finding-msg {
  font-size: 12.5px;
  color: var(--text-sec);
  line-height: 1.55;
}

/* Email Block */
.email-block {
  background: rgba(11, 16, 32, 0.95);
  border: 1px solid var(--border);
  border-radius: var(--radius-sm);
  padding: 18px 20px;
  font-family: 'JetBrains Mono', monospace !important;
  font-size: 12.5px;
  color: #CBD5E1;
  white-space: pre-wrap;
  line-height: 1.7;
  box-shadow: inset 0 2px 6px rgba(0, 0, 0, 0.4);
}

/* Inbox Card */
.inbox-vendor { font-size: 17px; font-weight: 700; color: #FFFFFF; }
.inbox-meta   { font-size: 13px; color: var(--text-sec); margin-top: 4px; }
.inbox-amount {
  font-size: 22px;
  font-weight: 800;
  color: #FFFFFF;
  font-family: 'JetBrains Mono', monospace;
}

/* Modern Dark-Tech Buttons */
.stButton > button {
  border-radius: var(--radius-sm) !important;
  font-weight: 600 !important;
  font-size: 13.5px !important;
  padding: 8px 18px !important;
  transition: all 0.2s cubic-bezier(0.4, 0, 0.2, 1) !important;
  border: 1px solid var(--border) !important;
  background: var(--bg-card-sec) !important;
  color: var(--text-main) !important;
  box-shadow: var(--shadow-card) !important;
}
.stButton > button:hover {
  border-color: var(--bright-blue) !important;
  color: #FFFFFF !important;
  background: rgba(37, 99, 235, 0.15) !important;
  transform: translateY(-1px) !important;
  box-shadow: 0 4px 14px rgba(37, 99, 235, 0.3) !important;
}
.stButton > button[kind="primary"] {
  background: linear-gradient(135deg, var(--primary-blue) 0%, var(--purple-accent) 100%) !important;
  border: none !important;
  color: #FFFFFF !important;
  font-weight: 700 !important;
  box-shadow: 0 0 20px rgba(124, 58, 237, 0.4) !important;
}
.stButton > button[kind="primary"]:hover {
  background: linear-gradient(135deg, #1D4ED8 0%, #6D28D9 100%) !important;
  transform: translateY(-1px) !important;
  box-shadow: 0 0 28px rgba(124, 58, 237, 0.65) !important;
}

/* Form Controls */
.stSelectbox > div > div,
.stTextInput > div > div > input,
.stTextArea > div > div > textarea {
  background: var(--bg-input) !important;
  border: 1px solid var(--border) !important;
  border-radius: var(--radius-sm) !important;
  color: #FFFFFF !important;
  font-size: 13.5px !important;
  transition: all 0.2s ease !important;
}
.stSelectbox > div > div:focus-within,
.stTextInput > div > div > input:focus,
.stTextArea > div > div > textarea:focus {
  border-color: var(--bright-blue) !important;
  box-shadow: 0 0 0 3px rgba(59, 130, 246, 0.25) !important;
}

/* File Uploader */
[data-testid="stFileUploader"] {
  background: var(--bg-card) !important;
  border: 2px dashed rgba(59, 130, 246, 0.35) !important;
  border-radius: var(--radius-card) !important;
  padding: 18px !important;
  transition: all 0.2s ease !important;
}
[data-testid="stFileUploader"]:hover {
  border-color: var(--bright-blue) !important;
  background: rgba(37, 99, 235, 0.08) !important;
  box-shadow: 0 0 24px rgba(37, 99, 235, 0.15) !important;
}

/* Tabs */
.stTabs [data-baseweb="tab-list"] {
  gap: 6px;
  background: transparent !important;
  border-bottom: 1px solid var(--border) !important;
}
.stTabs [data-baseweb="tab"] {
  background: transparent !important;
  color: var(--text-sec) !important;
  border: none !important;
  font-size: 13.5px !important;
  font-weight: 500 !important;
  padding: 10px 18px !important;
  border-radius: 8px 8px 0 0 !important;
  transition: all 0.15s ease !important;
}
.stTabs [data-baseweb="tab"]:hover {
  color: #FFFFFF !important;
  background: rgba(255, 255, 255, 0.04) !important;
}
.stTabs [aria-selected="true"] {
  color: #FFFFFF !important;
  background: rgba(37, 99, 235, 0.15) !important;
  border-bottom: 2px solid var(--bright-blue) !important;
  font-weight: 700 !important;
  box-shadow: 0 0 12px rgba(59, 130, 246, 0.25) !important;
}
.stTabs [data-baseweb="tab-panel"] {
  background: var(--bg-card) !important;
  border: 1px solid var(--border) !important;
  border-top: none !important;
  border-radius: 0 0 var(--radius-card) var(--radius-card) !important;
  padding: 24px !important;
  box-shadow: var(--shadow-card);
}

/* Metrics */
[data-testid="stMetric"] {
  background: linear-gradient(180deg, var(--bg-card) 0%, #0D131F 100%) !important;
  border: 1px solid var(--border) !important;
  border-radius: var(--radius-card) !important;
  padding: 16px 20px !important;
  box-shadow: var(--shadow-card) !important;
}
[data-testid="stMetric"] label {
  color: var(--text-muted) !important;
  font-size: 11px !important;
  text-transform: uppercase !important;
  letter-spacing: 0.8px !important;
  font-weight: 700 !important;
}
[data-testid="stMetric"] [data-testid="stMetricValue"] {
  color: #FFFFFF !important;
  font-weight: 800 !important;
  font-size: 26px !important;
}

/* Section Header */
.sh {
  font-size: 11px;
  font-weight: 800;
  color: var(--text-muted);
  text-transform: uppercase;
  letter-spacing: 1.1px;
  margin-bottom: 14px;
  padding-bottom: 8px;
  border-bottom: 1px solid var(--border);
}

/* Empty State */
.empty-state {
  text-align: center;
  padding: 56px 24px;
  background: var(--bg-card);
  border: 1px solid var(--border);
  border-radius: var(--radius-card);
  box-shadow: var(--shadow-card);
}
.empty-icon  { font-size: 38px; margin-bottom: 14px; color: var(--bright-blue); }
.empty-title { font-size: 17px; font-weight: 700; color: #FFFFFF; margin-bottom: 6px; }
.empty-hint  { font-size: 13px; color: var(--text-muted); }

/* Processing Time Chip */
.proc-time {
  display: inline-flex;
  align-items: center;
  gap: 5px;
  padding: 4px 11px;
  border-radius: 999px;
  background: rgba(59, 130, 246, 0.12);
  border: 1px solid rgba(59, 130, 246, 0.3);
  font-size: 12px;
  font-weight: 600;
  color: #93C5FD;
}

hr { border-color: var(--border) !important; }
.stMarkdown p { color: var(--text-sec) !important; font-size: 14px !important; }
a { color: var(--bright-blue) !important; text-decoration: none !important; font-weight: 600 !important; }
a:hover { text-decoration: underline !important; color: #93C5FD !important; }

::-webkit-scrollbar { width: 6px; height: 6px; }
::-webkit-scrollbar-track { background: var(--bg-base); }
::-webkit-scrollbar-thumb { background: rgba(255, 255, 255, 0.15); border-radius: 99px; }
::-webkit-scrollbar-thumb:hover { background: rgba(255, 255, 255, 0.3); }
</style>
"""
