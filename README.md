# Marigold Insights

**Non-Partisan Civic Data Traversal Engineered for Zero-PII Cloud Compliance & Local Memory Execution.**

Architected & Built by **[Colon Hyphen Bracket, a Wyoming LLC](https://colonhyphenbracket.pink)**.  
Architect Portfolio: **[https://hire.colonhyphenbracket.pink](https://hire.colonhyphenbracket.pink)**

---

## 🏛️ Executive Overview
Marigold Insights is an open-source, local-compute analytical execution engine designed for civic organizations, state emergency management agencies, and volunteer data auditors. 

Instead of requiring jurisdictions to upload sensitive citizen voter rolls containing Personally Identifiable Information (PII) to centralized cloud servers—which triggers severe data residency liabilities, HIPAA/Privacy audits, and automated AI scraping guardrails—Marigold operates as a **Query Package Manager** (similar to NPM). The server hosts only lightweight JSON/SQL algorithm templates ("Audit Playbooks" or "Cartridges"), while all CSV file parsing and high-speed analytical queries execute **100% inside local browser memory** or local SQLite instances.

### Aligned with FY26 FEMA HSGP Mandates
Marigold qualifies as an allowable voter list maintenance expenditure under the mandatory **3% National Priority Area spending requirement for Election Security** under the Homeland Security Grant Program (HSGP) Notice of Funding Opportunity.

---

## 🚀 Key Features
1. **Public Sandbox vs. SPA Workspace:** Unauthenticated visitors can freely test sample datasets in the Public Sandbox. Authenticated users access an intuitive SPA dashboard with a streamlined 1-2-3 guided workflow ("The Happy Path").
2. **Principle of Least Privilege:** When users create new Audit Playbooks, templates default to **🔒 Private (Only Me)** until explicitly upgraded to **👥 Share with Group** or **🌍 Publish to National Store**.
3. **Smart Duplicate Finder (Phase 2 Preview):** Employs probabilistic record linkage (Fellegi-Sunter / Levenshtein algorithms) inside client memory to resolve cross-precinct typos and NCOA address mismatches without third-party APIs.
4. **National Cartridge Store:** A crowdsourced public repository where data scientists across America can download standalone `.cartridge.json` files to run against their local state exports.

---

## 🛠️ Forking & User Management Guide

### Security & API Key Privacy
**CRITICAL:** Never commit secret API keys, OAuth client secrets, or real voter databases (`*.db`, `*.csv`) to version control. The repository includes strict `.gitignore` rules shielding local databases.

1. **Environment Configuration:**
   Copy `.env.example` to `.env.local`:
   ```bash
   cp .env.example .env.local
   ```
   * Configure your Gemini API Key (`GEMINI_API_KEY`). **Note:** Ensure all AI assistant interactions utilize free-tier endpoints (`gemini-2.5-flash`) to prevent billing exhaustion.
   * Configure OAuth / Clerk client keys if implementing full multi-tenant backend auth.

2. **User Management Privacy:**
   By default, the open-source release utilizes a decoupled client-side Auth Context (`src/lib/auth/AuthContext.tsx`) supporting localized group membership and admin transfer. If deploying to production with live user authentication:
   * Store user session tokens in secure HTTP-only cookies or Clerk/Firebase managed instances.
   * Never store user passwords or raw PII in public database collections.

3. **Local Development:**
   ```bash
   npm install
   npm run dev -- -p 3001
   ```
   Open `http://localhost:3001` to launch the suite.

---

## ⚖️ License & Attribution
All rights reserved by **Colon Hyphen Bracket, a Wyoming LLC**.  
For statewide contracting, procurement inquiries, or custom cartridge development, visit [https://colonhyphenbracket.pink](https://colonhyphenbracket.pink).
