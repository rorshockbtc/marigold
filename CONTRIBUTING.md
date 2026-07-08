# Contributing to Marigold Insights 🌻

We welcome contributions from civic technologists, data scientists, election integrity researchers, and frontend engineers! Marigold Insights is built on an **Open-Core / Commercial IP boundary**, designed to make citizen data collaboration transparent, accessible, and mathematically rigorous.

---

## 1. Local Development Setup

To get started with local development:

```bash
# 1. Clone the repository
git clone https://github.com/rorshockbtc/marigold.git
cd marigold

# 2. Install dependencies (requires Node.js v20+)
npm install

# 3. Copy environment variables
cp .env.example .env.local

# 4. Start the local Next.js development server
npm run dev
```

Navigate to `http://localhost:3000` to access the local development workspace!

---

## 2. Running Automated Tests & Linkage Benchmarks

Before submitting any code changes or adjusting algorithmic matching logic, you **must verify that our canonical 1,003-pair statistical test suite passes**:

```bash
# Execute the automated Fellegi-Sunter statistical benchmark suite
npm test
```

All contributions must maintain **>98.0% Precision**, **>95.0% Recall**, and **<0.5% False Positive Rate** across our synthetic ground truth dataset.

---

## 3. Contributing Playbook Cartridges (The Marketplace)

One of the most impactful ways to contribute without writing TypeScript code is by designing standardized **Audit Playbook Cartridges** (`.json` files) for our National Marketplace!

### Cartridge Submission Guidelines:
1. Create a new JSON cartridge file inside `/src/lib/playbooks/` following our standard schema.
2. Ensure your cartridge relies strictly on publicly accessible or certified government data sources (e.g., USPS NCOA, County Tax Assessor Rolls, Municipal Zoning registries).
3. **No Malicious Regex:** All custom matching rules must execute in linear time to prevent ReDoS browser freezes.
4. Submit a Pull Request with the label `cartridge-submission`. Once reviewed by our engineering team, your playbook will be assigned an official **SHA-256 cryptographic signature** and published to the live Marigold Store!

---

## 4. Pull Request Workflow & Coding Standards

* **Zero Cloud PII Rule:** **CRITICAL.** Never introduce API routes, third-party analytics hooks, or database queries that transmit or log citizen names, addresses, or voter IDs to external servers. All data processing must remain inside client-side Web Workers.
* **TypeScript & Style:** Maintain strict TypeScript typing (`noImplicitAny`). Follow our Terracotta & Warm Editorial UI/UX design system defined in `UI_UX_DESIGN_SYSTEM.md`.
* **Commit Signing:** Please sign your Git commits using SSH or GPG keys to support our SOC 2 logical access compliance ledger.
