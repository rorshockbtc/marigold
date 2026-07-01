# Marigold Insights: UI/UX Design System & Product Architecture Guide

This document is the authoritative style guide, interaction philosophy, and product architecture framework for **Marigold Insights**. Every screen, component, modal, and data visualization built across this platform must strictly adhere to these principles.

---

## 1. The Core User Profile & Emotional Journey

### Who We Are Designing For
Our primary user is **not** a data scientist, software engineer, or cyber-forensic specialist. 
Our primary user is a **civic volunteer**—often a retired community member, time-strapped local organizer, or public servant. 

### Their Emotional Reality
* **Motivation:** Deep civic patriotism. They want to ensure fair, transparent, and accurate public election rolls.
* **Internal Conflict:** They suspect or believe anomalies exist, but feel intimidated by massive raw spreadsheets (millions of rows, 100+ columns). They worry: *"I'm not technical enough to understand this data or prove what I'm looking at, but I really want to help!"*
* **The Risk:** If we present them with a dense, complex statistical workbench (like traditional enterprise GIS or database tools), they will feel overwhelmed, experience severe cognitive fatigue, and abandon the effort.

### The Core Design Directive: "The Diablo Auto-Guide Principle"
In video games like *Diablo Immortal*, if an NPC gives a player a quest to find an item across 50 sprawling maps without a guide, the player quits in frustration. But when **Auto-Guide Mode** is turned on, a glowing pathway illuminates, automatically guiding the player directly to the objective so they can take meaningful action.

**Marigold software must act as that Auto-Guide.** 
We handle all complex cryptography, multi-million row indexing, anomaly detection algorithms, and schema alignment silently in the backend. On the UI surface, we provide clear, step-by-step pathways that take the user directly from *"File Linked"* -> *"Here are the 3 critical areas requiring community review"* -> *"Here is your exact 1-click action."*

---

## 2. The Three Primary User Actions (The "Happy Path")

Every workflow on Marigold must streamline the user toward three core outcomes without distraction:

1. **Run Analysis (Guided Exploration):** Linking data chunks and letting the system highlight prioritized anomalies automatically.
2. **Review & Understand (Progressive Disclosure):** Viewing simplified summaries at the top level, with human-friendly ELI5 (Explain Like I'm 5) AI assistance available at every step.
3. **Take Action (Triage & Escalate):** 
   * **Note / Flag:** Add an observational field note in plain English.
   * **Group Mission:** Assign the record to a local volunteer group roster for discussion at the next community meeting.
   * **Download / Copy:** Export or copy anonymized, sanitized summaries for offline review or mapping.

---

## 3. Cognitive Load Reduction & Progressive Disclosure

### Rule 1: Zero Top-Level Clutter
* Top-level tables and dashboard views must present **no more than 4 primary columns**.
* **Column 1: Identity & Location Summary** (Clean resident name or explicit residential cluster title + readable street address).
* **Column 2: Signal Classification** (Plain-English category badge, e.g., `High-Density Institutional Cluster`, `Commercial Mailbox Rental`).
* **Column 3: Plain-English Anomaly Synthesis** (1–2 sentences describing *why* this flagged, e.g., *"+450 new registrations recorded at this single location within 30 days."*).
* **Column 4: Primary Action Bar** (A single primary CTA `[🔍 Review Findings]` + secondary quick-copy/note action).

### Rule 2: No Cryptographic Friction in Non-Technical Workflows
* **Never** display raw hexadecimal hashes, 32-character secret encryption keys, or complex AES-GCM technical specifications on primary action modals.
* If a note is encrypted before leaving the device, display a simple, friendly badge: **`🔒 Encrypted Community Note`**.
* Use automated group signing or simple 4-digit Volunteer PIN verification instead of password boxes.

### Rule 3: ELI5 AI Assistance Everywhere
* Any complex pattern, anomaly score, or statutory definition must feature a subtle question-mark or sparkle icon (`✨` / `❓`).
* Clicking this icon summons the integrated Gemini AI Assistant to provide a 2-sentence **"Explain Like I'm 5" (ELI5)** breakdown in reassuring, plain English.

### Rule 4: One Task Per Screen / Modal
* Avoid stacking modals over side sheets over tables.
* If a side sheet is open for forensic inspection, any note-taking or assignment action must happen **inline within that side sheet drawer** (via tabs or smooth expanders), preserving visual context.

---

## 4. Visual Standards & UI Rules

### Strict Theme Harmonization
* All drawers, side sheets, and modals **must inherit the active color theme** of the base workspace.
* **Light Mode:** Crisp white (`#ffffff` or `#f8fafc`) backgrounds with deep slate (`#0f172a` or `#1e293b`) primary text.
* **Dark Mode:** Deep navy/slate (`#0f172a`) backgrounds with clean white (`#ffffff` or `#f1f5f9`) text.
* **Never** render a dark theme modal over a bright light mode dashboard.

### High-Contrast Legibility (WCAG 2.1 AA Enforcement)
* We design for maximum accessibility (the "Helen Keller Principle"). If text is readable by our most visually impaired or senior volunteers on cheap laptop screens in daylight, it works for everyone.
* Secondary metadata (street addresses, timestamps, county labels) must use **at least medium-slate contrast** (`text-slate-700 dark:text-slate-300`).
* **Forbidden Utility Classes:** Never use unverified low-opacity classes like `text-muted-foreground` or `text-slate-300` on white backgrounds without explicit contrast validation.

### Data Hygiene & Artifact Prevention
* **Strict Column Extraction:** Never display raw street addresses or arbitrary substrings inside ID badges.
* If an individual record lacks a state SOS registration number, display a clean local reference tag (`REC-00124`) or suppress the badge entirely.
* If a row represents a multi-person address cluster, explicitly label it: **`Dormitory / Institutional Cluster`** rather than showing individual voter initials (`ID: J`).

---

## 5. Component Layout Architecture

```
+-----------------------------------------------------------------------+
| GLOBAL HEADER: Workspace Status | Active Dataset | Clear Breadcrumbs   |
+-----------------------------------------------------------------------+
| TOOLBAR: [View Switchers: Table/Map]   |   [Filters]   |   [Export]   |
+-----------------------------------------------------------------------+
| SIMPLIFIED TRIAGE TABLE (Max 4 Columns)                               |
| [ Location/Name ]  [ Plain-English Category ]  [ Synthesis ]  [ CTA ] |
+-----------------------------------------------------------------------+
                                  |
                   User clicks [🔍 Review Findings]
                                  v
+-----------------------------------------------------------------------+
| INLINE FORENSIC SIDE SHEET (Harmonized Theme, Full-Screen Height)     |
| + Header: Location Blueprint & Copy Button                            |
| + Tab 1: Actionable Intelligence (Occupant breakdown, property type)  |
| + Tab 2: Inline Community Note Writer (No modal popups, simple PIN)   |
| + Tab 3: Assign to Group Mission Roster                               |
+-----------------------------------------------------------------------+
```

---

## 6. Checklist for New Feature Contributions

Before pushing any UI change or component, verify:
- [ ] **Could a retired, non-technical volunteer understand what on this screen requires their attention within 5 seconds?**
- [ ] **Are all secondary text elements sharp and high-contrast in both Light and Dark modes?**
- [ ] **Is technical complexity (encryption protocols, SQL schemas, vector chunking) hidden behind simple, friendly metaphors?**
- [ ] **Does every workflow terminate in a clear happy-path action (Note, Download, or Add to Group Mission)?**
