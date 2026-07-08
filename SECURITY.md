# Marigold Insights: Security Policy & Threat Model

Marigold Insights takes civic data security, voter roll integrity, and CJIS endpoint compliance seriously. This document outlines our vulnerability disclosure policy, core threat model, and cryptographic safeguards.

---

## 1. Vulnerability Disclosure Policy

If you discover a security vulnerability, data leakage flaw, or algorithmic bypass within Marigold Insights, **do not open a public GitHub issue**. 

### Reporting Process:
1. Email our core engineering team directly at **`security@marigoldinsights.org`** (or contact the lead maintainer via verified communication channels).
2. Include detailed steps to reproduce the vulnerability, sample test payloads (using synthetic non-PII data), and potential impact assessments.
3. **Response SLA:** We commit to acknowledging receipt within **24 hours**, providing an initial mitigation assessment within **72 hours**, and deploying an automated emergency patch within our **48-hour Critical SLA window**.

---

## 2. Core Threat Model & Zero-Cloud Architecture

Unlike legacy enterprise GovTech platforms that centralize sensitive citizen records into proprietary cloud databases (creating massive attack surfaces for cyber breaches), **Marigold executes as an offline-first, client-side browser utility**.

### Key Security Safeguards:
* **Zero PII Exfiltration:** Citizen voter rolls, National Change of Address (NCOA) files, and municipal assessor records **never leave the user's local endpoint**. All Fellegi-Sunter probabilistic matching and deduplication occur in-memory within isolated HTML5 Web Workers.
* **CJIS Endpoint Inheritance:** Because Marigold operates as a local client utility (analogous to Microsoft Excel), it does not store or transmit Criminal Justice Information (CJI) across external networks. Compliance is inherited directly from the state agency's local endpoint protection (Wazuh, CrowdStrike, Defender).
* **Volatile Memory Purge:** All loaded CSV heaps and matching matrix allocations are systematically garbage-collected and purged from browser memory upon tab closure or explicit session reset.

---

## 3. Playbook Cartridge Security ("Poison Pill" Defense)

Marigold's **Playbook Marketplace** allows election integrity volunteers and researchers to share automated audit checklists (`.json` cartridges). To protect users against malicious "Poison Pill" cartridges containing ReDoS (Regular Expression Denial of Service) freezes or altered thresholds:

1. **Cryptographic SHA-256 Verification:** Official playbooks distributed via our registry are signed with Marigold's canonical cryptographic key.
2. **Local Web Crypto Interlock:** When a user loads a playbook into the browser sandbox, the native Web Crypto API (`window.crypto.subtle`) verifies the hash before execution.
3. **Sandbox Isolation:** Any cartridge modified by even a single byte triggers an immediate UI warning: **`⚠️ UNVERIFIED PLAYBOOK: Untrusted Signature. Execute in Isolated Sandbox Only.`** Unverified cartridges are strictly barred from executing automated batch exports.

---

## 4. Further Technical & Compliance Documentation

For detailed architectural schematics, statistical accuracy benchmarks, and our active SOC 2 evidence ledger, please review:
* 📄 **[Security Architecture Whitepaper](file:///docs/security-architecture.md)** — Comprehensive CJIS, SLA, and threat mitigation details.
* 📊 **[Statistical Linkage Benchmarks](file:///docs/benchmarks.md)** — Mathematical proof of our 100% Precision / 100% Recall Fellegi-Sunter engine.
* 📋 **[SOC 2 Readiness Ledger](file:///compliance/evidence/audit-ledger.md)** — Active log of logical access controls, dependency audits, and pilot operations.
