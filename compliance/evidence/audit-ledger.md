# Marigold Insights: SOC 2 Readiness & Security Audit Ledger
**Status:** Active Bootstrapping Ledger (Pre-Type I Audit)  
**Maintenance Responsibility:** Core Engineering & DevOps  
**Purpose:** Demonstrates continuous compliance monitoring, logical access control, and dependency auditing to institutional foundations and SAAs prior to formal CPA audit funding.

---

## Section 1: Logical Access & Change Management (CC6.1 / CC8.1)

All source code modifications, release promotions, and infrastructure updates must adhere to strict logical access controls.

| Audit ID | Date | Control Area | Action / Verification Description | Verified By | Commit / Ref |
| :---: | :---: | :--- | :--- | :---: | :---: |
| **LOG-001** | 2026-06-15 | 2FA / Auth | Enforced mandatory two-factor authentication (2FA) and SSH key signing across all GitHub repository contributors. | Kyle (Admin) | `repo-settings` |
| **LOG-002** | 2026-06-25 | Branch Protection | Enabled `main` branch protection rules requiring pull request review and automated build check pass before merge. | Kyle (Admin) | `branch-rules` |
| **LOG-003** | 2026-07-01 | Deployment Auth | Verified Vercel Edge deployment integration is restricted to authenticated production deploy hooks. | Kyle (Admin) | `vercel-auth` |

---

## Section 2: Dependency & Vulnerability Management (CC6.8 / CC7.1)

Third-party packages and NPM dependencies are continuously monitored for CVE disclosures and supply-chain vulnerabilities.

| Audit ID | Date | Package / Target | Vulnerability / Check | Remediation / Action Taken | Status |
| :---: | :---: | :--- | :--- | :--- | :---: |
| **VUL-001** | 2026-06-20 | NPM Workspace | Automated Audit | Executed `npm audit` across core dependencies; 0 high/critical severity vulnerabilities found. | 🟢 PASSED |
| **VUL-002** | 2026-06-28 | `papaparse` / `csv-parser` | Memory Leak Review | Verified streaming Web Worker implementation prevents main thread OOM on >500MB CSV files. | 🟢 PASSED |
| **VUL-003** | 2026-07-07 | Web Crypto API | Playbook Cartridge | Implemented SHA-256 signature verification in sandbox to prevent ReDoS / Poison Pill cartridges. | 🟢 PASSED |

---

## Section 3: Data Protection & Privacy Controls (CC6.5)

Verification of client-side data isolation, Content Security Policy (CSP), and zero-cloud persistence.

| Audit ID | Date | Control Area | Verification Description | Result |
| :---: | :---: | :--- | :--- | :---: |
| **PRV-001** | 2026-06-22 | Zero Cloud Storage | Verified Vercel API routes and Edge Functions do not log, cache, or store citizen PII or NCOA records. | 🟢 VERIFIED |
| **PRV-002** | 2026-06-29 | CSP Headers | Confirmed Content-Security-Policy restricts unauthorized external script injection and form exfiltration. | 🟢 VERIFIED |
| **PRV-003** | 2026-07-05 | Memory Purge | Confirmed Web Worker termination and garbage collection purge loaded CSV heaps upon tab closure. | 🟢 VERIFIED |

---

## Section 4: Pilot Operations & Anomaly Tracking (CC7.2)

Log of operational events, security observations, and pilot onboarding (e.g., Mississippi Fair Elections Pilot).

| Event ID | Date | Pilot / Agency | Observation / Event | Response / Resolution | SLA Met |
| :---: | :---: | :--- | :--- | :--- | :---: |
| **OPS-001** | 2026-07-06 | MS Fair Elections | Initial Alpha Sandbox Setup | Configured local test case environment with synthetic CSV data to protect real voter roll privacy. | Yes (24h) |
| **OPS-002** | 2026-07-07 | DeepSeek Review | Algorithmic Audit Feedback | Initiated development of mathematical Fellegi-Sunter engine and 1,000-pair benchmark suite. | Yes (24h) |
