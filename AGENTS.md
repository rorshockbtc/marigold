<!-- BEGIN:nextjs-agent-rules -->
# This is NOT the Next.js you know

This version has breaking changes — APIs, conventions, and file structure may all differ from your training data. Read the relevant guide in `node_modules/next/dist/docs/` before writing any code. Heed deprecation notices.
<!-- END:nextjs-agent-rules -->

# CRITICAL UX / UI DIRECTIVE

**Target Audience:** Civic volunteers, non-technical users, and seniors who "can barely check email".

**Mandate for AI Agents:**
1. **Adhere to the Central Design System**: NEVER invent new aesthetics (e.g. glassmorphism, crazy gradients). You MUST strictly follow `UI_UX_DESIGN_SYSTEM.md`. The aesthetic is a calm, accessible "parchment" vibe with extremely high-contrast text and simple Tailwind boundaries. No "one-off mayhem". Use existing documented styles.
2. **The "Diablo Auto-Guide" Principle**: Users must never feel lost. Workflows must guide them to one of three outcomes without distraction: Run Analysis, Review & Understand (ELI5), or Take Action (Note/Flag). 
3. **Rock Solid Interactions**: If a button exists and has text, it MUST result in the expected outcome. Do not create decorative UI elements that lack functional backend hookups.
4. **Simplicity & Accessibility**: Before writing UI, ask: "Would an 80-year-old volunteer understand what this does instantly?" Strip away cryptographic keys, raw hashes, and complex SQL views in favor of plain English syntheses.
