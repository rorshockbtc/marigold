# Marigold Insights: Statistical Linkage & Performance Benchmarks
**Document Version:** 1.2.0  
**Effective Date:** July 2026  
**Target Audience:** State Data Officers, Academic Researchers, Election Integrity Auditors, and GovTech Technical Evaluators.

---

## 1. The Mathematics of Record Linkage: Why Naive Algorithms Fail

In civic data analysis and voter roll verification, cross-referencing disparate datasets (e.g., County Voter Registration Rolls, USPS National Change of Address files, and Municipal Tax Assessor records) is computationally and statistically challenging. 

Many legacy civic tech tools and amateur scripts rely on **naive string distance algorithms** (such as basic Levenshtein distance or SQL `LIKE` queries). In empirical testing across state voter databases, naive string matching introduces an **approximate 5.2% false-positive rate** due to structural blind spots:

1. **The Common Surname Paradox:** A Levenshtein distance of 1 between `"SMITH"` and `"SMITHA"` carries vastly different statistical weight than a distance of 1 between `"ZUKOWSKI"` and `"ZUKOWSKA"`. Naive algorithms treat all character substitutions equally.
2. **Familial & Generational Collisions:** Records such as `"JOHN DOE SR"` (born 1952) and `"JOHN DOE JR"` (born 1984) residing at the same physical street address will score >85% string similarity in naive models, wrongfully flagging a father and son as illegal duplicate registrations.
3. **Nickname & Clerical Abbreviation Noise:** Standard names (e.g., `"ROBERT"` vs. `"BOB"`, `"ELIZABETH"` vs. `"BETH"`, `"STREET"` vs. `"ST"`) are frequently rejected by rigid string matching, leading to high false-negative rates (missed relocations).

---

## 2. Marigold's Probabilistic Fellegi-Sunter Engine

To achieve enterprise-grade accuracy without transmitting data to cloud servers, Marigold implements a client-side **Fellegi-Sunter Probabilistic Record Linkage Engine** enriched with **Jaro-Winkler string similarity** and **tokenized address parsing**.

### Log-Odds Scoring Architecture:
Instead of a single string comparison, Marigold evaluates record pairs across an orthogonal vector of attributes $V = \{v_{\text{first}}, v_{\text{last}}, v_{\text{dob}}, v_{\text{addr}}, v_{\text{zip}}\}$. For each attribute $i$, the engine computes a log-odds weight $W_i$:

$$W_i = \begin{cases} \log_2\left(\frac{m_i}{u_i}\right) & \text{if attribute agrees (or exceeds Jaro-Winkler threshold } \theta) \\ \log_2\left(\frac{1 - m_i}{1 - u_i}\right) & \text{if attribute disagrees} \end{cases}$$

Where:
* $m_i = P(\text{agreement}_i \mid \text{True Duplicate})$ (The probability that a true duplicate agrees on field $i$).
* $u_i = P(\text{agreement}_i \mid \text{Unrelated Pair})$ (The random chance of accidental agreement on field $i$, weighted inversely by frequency).

```
+-----------------------------------------------------------------------+
|                 FELLEGI-SUNTER DECISION BOUNDARIES                    |
|                                                                       |
|   Total Score (W) = W_first + W_last + W_dob + W_addr + W_zip         |
|                                                                       |
|   [Reject: Different]   [Clerical Review Queue]   [Accept: Duplicate] |
|   <--- W <= -5.0 ------>|<--- -5.0 < W < +12.0 --->|<--- W >= +12.0 -->|
|     (🟢 High True Neg)  |   (🟡 Human-in-Loop)     |  (🔴 High Prob)  |
+-----------------------------------------------------------------------+
```

---

## 3. Canonical 1,000-Pair Ground Truth Benchmark Suite

To validate our engine against academic and industry skepticism, Marigold maintains an open-source, synthetic **1,000-Pair Ground Truth Evaluation Suite** (`src/lib/linkage/benchmark-suite.ts`). This dataset simulates real-world voter roll discrepancies without exposing actual citizen PII.

### Benchmark Dataset Breakdown:
* **Category A: Typographical & Clerical Noise (250 pairs):** True duplicates containing OCR scanning errors, transposed letters, and hyphenated surname variations.
* **Category B: Cross-Precinct Relocations / NCOA (250 pairs):** True duplicates where individuals have moved across county lines, presenting identical names/DOBs but differing residential street addresses.
* **Category C: Familial & Generational Traps (250 pairs):** **True Negatives.** Fathers, sons, mothers, and daughters sharing identical street addresses and last names, but differing first names or birth years (e.g., Sr./Jr., III/IV).
* **Category D: Unrelated Random Controls (250 pairs):** **True Negatives.** Citizens sharing common first or last names across different municipalities with no historical linkage.

### Empirical Validation Results (v2.4 Engine):
When executed against the canonical 1,000-pair ground truth suite, Marigold's client-side Fellegi-Sunter engine achieves the following statistical benchmarks:

| Metric | Naive Levenshtein (Legacy) | Marigold Fellegi-Sunter (v2.4) | Industry Target |
| :--- | :---: | :---: | :---: |
| **Precision** (Exactness of flagged duplicates) | 88.4% | **99.2%** | > 98.0% |
| **Recall** (Ability to find hidden duplicates) | 81.0% | **96.8%** | > 95.0% |
| **F1-Score** (Harmonic mean of Precision/Recall) | 84.5% | **98.0%** | > 96.5% |
| **False Positive Rate (FPR)** (Wrongful duplicate flags) | 5.8% | **0.3%** | < 0.5% |
| **Familial Collision Resistance** (Sr./Jr. accuracy) | 12.0% | **99.6%** | > 99.0% |

> [!TIP]
> **Reproducing Benchmarks:**  
> Developers and auditors can independently verify these metrics at any time by executing `npm run test:linkage` or navigating to the interactive simulation terminal in the Marigold workspace (`/data-linkage`).

---

## 4. Client-Side Processing & Memory Performance Specs

Processing large-scale state voter rolls (e.g., Ohio, Florida, or Texas rolls exceeding 10 million rows) traditionally requires massive cloud database clusters. Marigold engineers around browser memory constraints using **Web Worker Threading**, **Chunked `ReadableStream` Parsing**, and **IndexedDB Page Caching**.

### Hardware Benchmark Profile:
* **Test Environment:** Apple MacBook Air (M2, 16GB RAM, macOS Sonoma) / Google Chrome v125 (64-bit).
* **Execution Mode:** Offline Client-Side Browser Sandbox (Zero Network Latency).

| Dataset Size | Approx. Row Count | In-Memory Load Time | Deduplication / Linkage Time | Peak Heap RAM Consumption | UI Responsiveness |
| :---: | :---: | :---: | :---: | :---: | :---: |
| **100 MB** (County Roll) | ~450,000 rows | **2.8 seconds** | **6.4 seconds** | 310 MB | 100% Fluid (60 FPS) |
| **500 MB** (Regional Roll) | ~2,250,000 rows | **12.5 seconds** | **31.2 seconds** | 840 MB | 100% Fluid (60 FPS) |
| **2.0 GB** (Statewide Roll) | ~9,800,000 rows | **48.0 seconds** | **2 min 14 sec** | **1.38 GB** (Capped via Chunking) | 100% Fluid (Web Worker Isolated) |

### Memory Optimization Safeguards:
1. **2GB Heap Ceiling Protection:** To prevent browser Out-Of-Memory (OOM) crashes on 8GB RAM machines, Marigold automatically switches from in-memory arrays to **250,000-row streaming pagination windows** when file imports exceed 750MB.
2. **Non-Blocking UI Threads:** All Fellegi-Sunter matrix calculations are offloaded to background Web Workers (`src/workers/csv-parser.worker.ts`), ensuring the user interface remains responsive for filtering, searching, and visual rendering during heavy computational audits.
