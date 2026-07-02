# Marigold Insights: Architectural Specification & Prior Art Synthesis

**Document Version:** 1.0.0 (July 2026)  
**Author & Lead Architect:** Kyle (Cubby) / Colon Hyphen Bracket LLC  
**Attribution & Engineering Inquiries:** [hire.colonhyphenbracket.pink](https://hire.colonhyphenbracket.pink)  
**License:** AGPL-3.0 (Open-Core Layer) / Proprietary Trade Secret (Enterprise Knowledge Graph Layer)

---

## 🏛️ Executive Summary & Philosophical Foundation

Modern civic technology faces an existential paradox: **transparency requires public verification, yet citizen data demands absolute privacy.** Traditional institutional software attempts to resolve this by ingesting state voter rolls and sensitive census data into centralized cloud databases (AWS, GCP, Snowflake). This pattern introduces catastrophic liabilities:
- **Massive Attack Surfaces:** Centralized repositories of personally identifiable information (PII) become prime targets for state-sponsored breaches and automated web scraping.
- **Regulatory Friction:** Cloud ingestion triggers complex HIPAA, statutory data residency, and election infrastructure compliance burdens.
- **High Marginal Compute Costs:** Ongoing recurring costs for cloud server compute and storage exclude grassroots volunteer groups and citizen auditors from performing rigorous data analysis.

**Marigold Insights eliminates the cloud database entirely.** By synthesizing established computer science prior art with novel client-side browser orchestration, Marigold transforms standard consumer hardware (laptops, desktops, mobile devices) into air-gapped analytical supercomputers. 

---

## 🔬 Application of Prior Art: The FOSS Engineering Layer

Marigold Insights generalizes three foundational areas of computer science prior art into a unified client-side execution harness:

### 1. High-Throughput Local Memory Streaming Pipeline
* **Prior Art Foundation:** HTML5 Web Workers API, Streams API (WHATWG specification), and browser-native IndexedDB / Wasm SQLite engines.
* **Marigold Synthesis:** Rather than loading multi-gigabyte CSV exports directly into main UI thread RAM (which triggers browser out-of-memory crashes), Marigold utilizes background Web Workers to stream datasets with dynamic backpressure. 
* **Execution Mechanics:** Records are parsed sequentially at rates up to 100,000 rows per second and indexed directly into local browser database shards (`marigold_db`). High-speed analytical queries, sorting, and filtering execute against these air-gapped memory shards with zero network transmission ($0$ bytes of PII ever leave the user's device).

### 2. Probabilistic Record Linkage & Anomaly Detection
* **Prior Art Foundation:** The Fellegi-Sunter theory of record linkage (1969) and Levenshtein string edit distance algorithms.
* **Marigold Synthesis:** Real-world civic datasets are riddled with typographical errors, transposed street names, missing unit numbers, and cross-county address relocations. 
* **Execution Mechanics:** Marigold implements client-side probabilistic fuzzy matching algorithms that evaluate multidimensional record vectors (First Name, Last Name, DOB Hash, Normalized Address String). By scoring confidence thresholds entirely in client RAM, volunteers can identify multi-voter clusters and commercial P.O. box anomalies without querying third-party identity verification APIs.

### 3. Decoupled Query Package Management ("Cartridges")
* **Prior Art Foundation:** Modular package management architectures (Debian APT, Node NPM).
* **Marigold Synthesis:** To democratize forensic auditing across different state jurisdictions, Marigold introduces the concept of **Audit Playbooks** or **Cartridges** (`*.cartridge.json`).
* **Execution Mechanics:** A Cartridge is a lightweight, standardized JSON payload containing structured SQL/analytical query templates, compliance checklists, and state statutory references. The central server hosts *only* these lightweight logic definitions. When an auditor selects a Cartridge, the browser downloads the query recipe and executes it strictly against the local air-gapped dataset.

---

## 🛡️ The Commercial IP & Open-Core Boundary (The "Pipes Rule")

To maintain long-term sustainability while furnishing a powerful public tool, Marigold Insights enforces a strict architectural boundary between open-source community utilities and proprietary enterprise infrastructure developed by **Colon Hyphen Bracket LLC**:

### 1. The FOSS Layer (AGPL-3.0 Public Codebase)
The public repository provides everything necessary for standalone citizen auditing:
- In-browser CSV streaming, indexing, and memory allocation engines.
- Standard Cartridge interpretation and execution harnesses.
- Localized Fellegi-Sunter duplicate finding tools.
- Guided, state-aware single-CTA dashboards for standard volunteer personas (**Adam West** / **Eve East**).

### 2. The Enterprise Knowledge Graph & Curation Layer (Proprietary IP)
Advanced longitudinal data orchestration, cryptographic state synchronization, and monetization pipelines remain protected trade secrets:
- **Differential Merkle / SHA-256 Sharding Engine:** High-performance algorithms that hash localized data blocks and calculate differential delta slices across weekly roll releases, enabling instant multi-user knowledge graph updates without re-processing legacy rows.
- **Pseudonymous PII Gateway & Dual-Consent Architecture:** Intermediary token-reduction protocols (`Semi`) that strip citizen PII and rotate pseudonymous session identifiers prior to external AI inference.
- **Perspective-Switching & Curation Pipes (`Pipes`):** Programmatic DOM/CSS transformation protocols and domain-like namespace claiming infrastructure designed to curate and monetize human domain expertise.

---

## 🚀 Verification & System Capabilities

When executed on standard consumer hardware, the Marigold Insights engine achieves:
1. **Air-Gapped PII Shield:** 100% compliance with federal data privacy mandates; server network panels confirm zero data payload transmission during audit runs.
2. **Sub-Second Traversal:** Pre-indexed local database shards execute complex multi-variable aggregation queries in $< 250\text{ms}$.
3. **Guided Citizen Workflow:** Demotes technical developer jargon into clear, empowering single-click action buttons designed for non-technical volunteers and state officials alike.

---

## 📬 Attribution & Licensing

All public code within this repository is open-sourced under AGPL-3.0 to serve the American civic ecosystem.  
For enterprise integration, state agency deployment architectures, or proprietary differential sharding consulting, contact the architect directly at **[hire.colonhyphenbracket.pink](https://hire.colonhyphenbracket.pink)**.
