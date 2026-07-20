# Marigold Insights

**Analyze any spreadsheet—right on your computer. No cloud. No data uploads. No privacy risks.**

- ✅ **County clerks:** catch voter roll errors in 3 minutes
- ✅ **Citizen volunteers:** audit public lists without coding skills
- ✅ **State agencies:** comply with FEMA security mandates locally

**[Try the Live Sandbox →](https://elly-assistant-production.up.railway.app/sandbox)**

---

## 🏛️ Executive Overview
Marigold Insights is an open-source, local-compute analytical execution engine designed for civic organizations, state emergency management agencies, and volunteer data auditors. 

Instead of uploading sensitive citizen voter rolls containing Personally Identifiable Information (PII) to the cloud—which triggers severe data residency liabilities and security risks—Marigold processes everything **100% inside your local computer's memory**. 

We host the audit rules (what we call "Checklists" or "Playbooks"), but your data never leaves your desk.

### Aligned with FY26 FEMA HSGP Mandates
Marigold qualifies as an allowable voter list maintenance expenditure under the mandatory **3% National Priority Area spending requirement for Election Security** under the Homeland Security Grant Program (HSGP) Notice of Funding Opportunity.

---

## 🚀 Quick Start (For Non-Technical Users)

1. **Download a Checklist:** Browse the National Audit Checklist Store and download a ruleset (e.g., "Find duplicate P.O. boxes").
2. **Open Your Spreadsheet:** Launch the Marigold workspace and select your local CSV file.
3. **See Results Instantly:** The local engine highlights errors in seconds.

---

## 💻 For Developers (Technical Deep Dive)

While the interface is simple, the underlying engine is engineered for Series-C scale throughput.

1. **Zero-Trust Architecture:** By offloading CSV parsing to the client browser (utilizing local SQLite and Web Workers), we bypass standard REST API bottlenecks and eliminate SOC2/FedRAMP compliance friction regarding PII.
2. **Probabilistic Linkage:** Employs in-memory Fellegi-Sunter and Levenshtein algorithms to resolve cross-precinct typos and NCOA address mismatches without third-party APIs.
3. **Cryptographic Handshakes:** For enterprise state deployments, Marigold supports AES-GCM encrypted flagging where only the local instance holds the decryption keys.

📖 **For detailed systems engineering, prior art synthesis, and open-core boundaries, read our complete [Architectural Specification (ARCHITECTURE.md)](./ARCHITECTURE.md).**

### Local Development
```bash
cp .env.example .env.local
npm install
npm run dev -- -p 3001
```
Open `http://localhost:3001` to launch the suite. Ensure all AI assistant interactions utilize free-tier endpoints (`gemini-2.5-flash`) to prevent billing exhaustion.

---

## 💰 Commercial & Open Source Licensing

The core Marigold data-processing engine is open-source and free for public use. 

For state agencies, enterprises, or high-volume civic networks:
- **Free:** Open-source core engine and public sandbox.
- **Pro:** Custom private playbooks, isolated team workspaces.
- **Enterprise:** Full state-wide procurement, FEMA compliance support, and dedicated SLA.

All commercial rights reserved by **Colon Hyphen Bracket, a Wyoming LLC**.  
For statewide contracting, procurement inquiries, or custom cartridge development, visit [https://colonhyphenbracket.pink](https://colonhyphenbracket.pink).
