# Marigold Insights: Security Architecture & Compliance Whitepaper
**Document Version:** 2.4.0  
**Effective Date:** July 2026  
**Target Audience:** State State Administering Agencies (SAAs), County Election Commissioners, CJIS Compliance Officers, and Foundation Grant Evaluators.

---

## 1. Executive Summary & Core Security Posture

Marigold Insights is fundamentally different from legacy civic data platforms and enterprise GovTech vendors. While traditional platforms rely on centralizing sensitive citizen voter rolls, change-of-address records, and municipal assessor files into proprietary cloud databases (e.g., AWS RDS, Snowflake, or Azure SQL), **Marigold executes as an offline-first, client-side browser utility**.

```
+-------------------------------------------------------------------------+
|                      LOCAL AGENCY ENDPOINT (CJIS-Compliant)             |
|                                                                         |
|   +-----------------------------------------------------------------+   |
|   |                  BETA / ALPHA BROWSER SANDBOX                   |   |
|   |                                                                 |   |
|   |   +---------------------+        +--------------------------+   |   |
|   |   |  Local CSV / NCOA   | =====> | In-Memory Web Workers    |   |   |
|   |   |  File Input (2GB+)  |        | (Fellegi-Sunter Engine)  |   |   |
|   |   +---------------------+        +--------------------------+   |   |
|   |                                                ||               |   |
|   |                                                \/               |   |
|   |                                  +--------------------------+   |   |
|   |                                  | Local Audit Visualizer   |   |   |
|   |                                  +--------------------------+   |   |
|   +-----------------------------------------------------------------+   |
|                                                                         |
+-------------------------------------------------------------------------+
       ||
       ||  [NO PII TRANSMITTED]
       \/
+-------------------------------------------------------------------------+
|                  MARIGOLD CLOUD (Vercel Edge Network)                   |
|   * Serves Static HTML/CSS/JS Assets Only                               |
|   * Zero Database Schema Access | Zero PII Storage                      |
+-------------------------------------------------------------------------+
```

### Key Architectural Tenets:
1. **Zero-Cloud PII Footprint:** Citizen records, National Change of Address (NCOA) files, and voter rolls **never leave the user's local machine**. All data parsing, deduplication, and Fellegi-Sunter probabilistic matching occur in-memory within the browser's isolated Web Worker threads.
2. **Zero Schema Modification:** Marigold does not connect to or alter state or county database servers. It is a non-destructive read-only analytical workspace.
3. **Immutable Sandbox Execution:** Memory allocated during an audit session is completely purged upon browser tab closure or explicit session reset.

---

## 2. CJIS (Criminal Justice Information Services) Compliance Posture

State and municipal employees frequently operate on endpoints governed by **FBI CJIS Security Policy (Version 5.9+)**. A major barrier for traditional GovTech software is the requirement to undergo extensive cloud CJIS certification, vendor background checks, and data center auditing.

### Why Marigold Bypasses Cloud CJIS Bottlenecks:
Because Marigold operates as a **Zero-PII Local Endpoint Utility**, it does not store, process, or transmit Criminal Justice Information (CJI) across external networks or third-party cloud servers. 

* **Endpoint Responsibility Model:** Compliance is inherited directly from the agency's existing endpoint security infrastructure (e.g., Wazuh, CrowdStrike, Microsoft Defender, and local File Integrity Monitoring).
* **No Remote Access to CJI:** Marigold servers have no network path or administrative capability to access local files residing on state computers.
* **Audit Trail Compatibility:** Agency endpoint monitoring systems can log all local file access by browser processes without interference from Marigold.

> [!IMPORTANT]
> **CJIS Safe-Harbor Statement for IT Directors:**  
> *"Marigold Insights is classified as a local software client utility (analogous to Microsoft Excel or Adobe Reader). Installing or executing Marigold in a web browser does not expand an agency's network threat surface or violate CJIS cloud data residency controls."*

---

## 3. Playbook Cartridge Security & Cryptographic Signing

Marigold introduces a modular **Playbook Marketplace**, allowing researchers and election integrity volunteers to share standardized audit checklists (e.g., *"NCOA Out-of-State Relocation Audit"*, *"Commercial Zoning Cross-Reference"*). 

To prevent **"Poison Pill" attacks**—where a malicious actor uploads an intentionally corrupted playbook containing ReDoS (Regular Expression Denial of Service) patterns, misleading parameter thresholds, or social engineering prompts—Marigold enforces strict cartridge verification.

### Cartridge Signing & Verification Protocol:
1. **SHA-256 Cryptographic Hashes:** Every official playbook published to the Marigold Store is compiled with an immutable SHA-256 checksum generated against Marigold's canonical signing key.
2. **Local Web Crypto API Verification:** When a user loads a playbook `.json` file into the sandbox, the browser's native `window.crypto.subtle` API recalculates the hash before execution.
3. **Tamper Detection & Sandbox Isolation:**
   * If a loaded cartridge matches the trusted Marigold signature registry, it executes in **Verified Mode** (🟢).
   * If a cartridge is modified by even a single byte or imported from an unverified third-party source, the UI flags an immediate security interlock: **`⚠️ UNVERIFIED PLAYBOOK: Untrusted Signature. Execute in Isolated Sandbox Only.`**
   * Unverified cartridges are strictly barred from executing automated batch exports or modifying default anomaly thresholds without explicit user override.

---

## 4. Threat Model & Browser Sandbox Defense

While Marigold eliminates cloud network threats, client-side execution requires robust defense against browser-based attack vectors.

| Threat Vector | Mitigation Strategy | Implementation Details |
| :--- | :--- | :--- |
| **Cross-Site Scripting (XSS)** | Strict Content Security Policy (CSP) & React DOM Sanitization | Zero `eval()` or `innerHTML` usage. All CSV cell values are escaped as raw text strings during DOM rendering. |
| **Memory Exhaustion / OOM** | Web Worker Streaming & Chunked Parsing | CSV files up to 2GB are streamed via `ReadableStream` into isolated Web Workers, preventing UI thread freezing or browser crashes. |
| **ReDoS (Regex Denial of Service)** | Linear-Time String Matching Algorithms | All fuzzy matching (Levenshtein, Jaro-Winkler) enforces strict string length bounds (`maxLen <= 100`) and avoids backtracking regular expressions. |
| **Local Exfiltration via Extensions** | CSP Form-Action & Connect-Src Restrictions | CSP headers prevent third-party browser extensions or injected scripts from exfiltrating in-memory voter rows to external endpoints. |

---

## 5. SOC 2 Type I & Type II Readiness Roadmap

To support future procurement by major philanthropic foundations (e.g., Knight Foundation, Google.org) and state contracts, Marigold has initiated a **Bootstrapping SOC 2 Compliance Program**. 

While formal Type I/II CPA audits require dedicated annual funding ($40,000–$70,000), Marigold maintains institutional readiness through an active **Manual Audit Ledger** located in our source repository (`/compliance/evidence/audit-ledger.md`).

### Evidence Collection Controls:
* **CC6.1 (Logical Access):** All code modifications require two-factor authentication (2FA) and cryptographic Git commit signing via GitHub Enterprise/SSH keys.
* **CC6.8 (Unauthorized Software):** All NPM dependency additions undergo automated CVE vulnerability scanning via GitHub Dependabot and audit review before merge.
* **CC7.2 (Anomalies & Security Events):** Any reported anomaly or security edge case is logged with root-cause analysis and remediation commit hashes in our permanent audit ledger.

---

## 6. Service Level Agreement (SLA) & Insurance Strategy

For pilot deployments (including the **Mississippi Fair Elections Pilot**), Marigold operates under a risk-mitigated B2B framework designed to protect institutional integrity while ensuring responsive developer support.

### Alpha/Beta Pilot Support SLA:
* **Critical Severity (System Blocker / Core Engine Failure):** Acknowledged within **24 hours**; patch deployed within **48 hours**.
* **Standard Severity (UI Glitch / Export Formatting):** Acknowledged within **72 hours**; resolved in standard bi-weekly release cycle.
* **Data Calibration Assistance:** Direct developer consultation available via scheduled office hours for pilot coordinators.

### Insurance & Liability Protection:
1. **Technology Errors & Omissions (E&O):** Marigold prioritizes Technology E&O insurance prior to executing paid municipal commercial contracts. E&O mitigates liability arising from algorithmic discrepancies or misinterpretation of probabilistic matching results.
2. **Cyber Liability Exemption:** Because Marigold does not host, store, or transmit citizen PII on cloud infrastructure, enterprise Cyber Liability insurance requirements are systematically reduced or waived by municipal procurement officers.
3. **Safe Harbor Disclaimer:** All pilot agreements include explicit terms stating that Marigold is an exploratory statistical collaboration tool. Final voter roll maintenance decisions remain the sole statutory responsibility of certified election officials.
