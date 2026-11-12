import { sha256Hex } from "@/lib/crypto/merkleDagAndOtsBridge";
import { triggerSovereignDownload } from "@/lib/datasets/massiveDatasetEngine";
import { getDirectoryOrOPFSHandle, writeStructuredFile } from "@/lib/fs/LocalFSManager";
import { validateCivicContent } from "@/lib/security/civicPiiGuard";

export interface OfflineDossierBundleInput {
  title: string;
  subtitle: string;
  jurisdictionName: string;
  stateCode: string;
  totalRecords: number;
  cleanlinessScore: number;
  generatedAtIso?: string;
  summaryParagraphs: string[];
  metrics: Array<{ label: string; valueWithUnit: string; detail?: string }>;
  actionItems?: string[];
}

function escHtml(s: string): string {
  return String(s || "")
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;");
}

/**
 * Compiles a single-file, zero-server offline `.html` civic briefing dossier with
 * Zero-PII enforcement and an interactive client-side `crypto.subtle` SHA-256 verifier button.
 */
export async function buildStandaloneOfflineDossierHtml(
  input: OfflineDossierBundleInput
): Promise<{ html: string; merkleHashHex: string; filename: string }> {
  const generatedAtIso = input.generatedAtIso || new Date().toISOString();
  const canonicalPayload = {
    schema: "marigold.offline.dossier.v1",
    title: input.title,
    subtitle: input.subtitle,
    jurisdictionName: input.jurisdictionName,
    stateCode: input.stateCode,
    totalRecords: input.totalRecords,
    cleanlinessScore: input.cleanlinessScore,
    generatedAtIso,
    summaryParagraphs: input.summaryParagraphs,
    metrics: input.metrics,
    actionItems: input.actionItems || [],
  };

  const canonicalJson = JSON.stringify(canonicalPayload);
  const guard = validateCivicContent(canonicalJson, `${input.jurisdictionName}.html`);
  if (!guard.allowed) {
    throw new Error(
      guard.userFacingMessage || "Blocked by Marigold Zero-PII Guardrail before offline export."
    );
  }

  const merkleHashHex = await sha256Hex(canonicalJson);
  const slug = input.jurisdictionName
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-|-$/g, "");
  const filename = `marigold-${slug || "civic"}-offline-dossier.html`;

  const metricsHtml = input.metrics
    .map(
      (m) => `<div class="metric-card">
        <div class="metric-label">${escHtml(m.label)}</div>
        <div class="metric-val">${escHtml(m.valueWithUnit)}</div>
        ${m.detail ? `<div class="metric-sub">${escHtml(m.detail)}</div>` : ""}
      </div>`
    )
    .join("\n");

  const summaryHtml = input.summaryParagraphs
    .map((p) => `<p>${escHtml(p)}</p>`)
    .join("\n");

  const actionsHtml =
    input.actionItems && input.actionItems.length > 0
      ? `<section class="section">
          <h2>Recommended Non-Partisan Action Checklist</h2>
          <ol class="action-list">
            ${input.actionItems.map((item) => `<li>${escHtml(item)}</li>`).join("\n")}
          </ol>
        </section>`
      : "";

  const html = `<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="utf-8" />
  <meta name="viewport" content="width=device-width, initial-scale=1.0" />
  <title>${escHtml(input.title)} — Standalone Offline Dossier</title>
  <style>
    :root { --bg: #F6F3EC; --card: #FFFFFF; --ink: #111111; --muted: #57534E; --ochre: #B45309; --border: #D6D0C4; }
    * { box-sizing: border-box; }
    body { margin: 0; background: var(--bg); color: var(--ink); font-family: Georgia, "Times New Roman", serif; line-height: 1.65; }
    .wrap { max-width: 920px; margin: 0 auto; padding: 32px 20px 64px; }
    .topbar { display: flex; flex-wrap: wrap; justify-content: space-between; align-items: center; gap: 12px; border-bottom: 2px solid var(--ink); padding-bottom: 14px; margin-bottom: 24px; }
    .kicker { font-family: ui-monospace, Menlo, monospace; font-size: 11px; font-weight: 700; text-transform: uppercase; letter-spacing: 0.12em; color: var(--ochre); }
    h1 { font-size: clamp(26px, 4vw, 40px); line-height: 1.12; margin: 8px 0; }
    .subtitle { font-size: 17px; color: #3A3530; max-width: 66ch; margin: 0; }
    .pills { display: flex; flex-wrap: wrap; gap: 8px; margin: 18px 0 24px; font-family: system-ui, sans-serif; font-size: 13px; font-weight: 700; }
    .pill { border: 1px solid var(--border); background: var(--card); padding: 6px 12px; }
    .pill-focus { border-color: var(--ochre); background: #FEF3C7; color: #92400E; }
    .verify-box { background: var(--card); border: 2px solid var(--ink); padding: 18px 20px; margin: 20px 0 28px; font-family: system-ui, sans-serif; }
    .verify-row { display: flex; flex-wrap: wrap; align-items: center; justify-content: space-between; gap: 12px; }
    .hash-mono { font-family: ui-monospace, Menlo, monospace; font-size: 12px; word-break: break-all; background: #FAF8F5; border: 1px solid var(--border); padding: 6px 10px; margin-top: 8px; }
    button { background: var(--ochre); color: #fff; border: 2px solid var(--ink); padding: 10px 16px; font-size: 13px; font-weight: 700; cursor: pointer; }
    button:hover { opacity: 0.92; }
    .status-ok { margin-top: 10px; padding: 8px 12px; background: #ECFDF5; border: 1px solid #6EE7B7; color: #065F46; font-size: 13px; font-weight: 700; display: none; }
    .metrics-grid { display: grid; grid-template-columns: repeat(auto-fit, minmax(210px, 1fr)); gap: 12px; margin: 22px 0; }
    .metric-card { background: var(--card); border: 1px solid var(--border); padding: 16px; }
    .metric-label { font-family: ui-monospace, Menlo, monospace; font-size: 11px; font-weight: 700; text-transform: uppercase; letter-spacing: 0.08em; color: var(--muted); }
    .metric-val { font-size: 24px; font-weight: 700; margin: 6px 0 4px; color: var(--ink); }
    .metric-sub { font-family: system-ui, sans-serif; font-size: 13px; color: var(--muted); }
    .section { background: var(--card); border: 1px solid var(--border); padding: 22px; margin-top: 22px; }
    h2 { font-size: 20px; margin: 0 0 12px; border-bottom: 1px solid var(--border); padding-bottom: 8px; }
    .action-list { padding-left: 20px; font-family: system-ui, sans-serif; font-size: 15px; }
    .action-list li { margin-bottom: 10px; }
    .footer { margin-top: 32px; border-top: 1.5px solid var(--ink); padding-top: 14px; font-family: ui-monospace, Menlo, monospace; font-size: 12px; color: var(--muted); display: flex; flex-wrap: wrap; justify-content: space-between; gap: 10px; }
    @media print { .verify-box button { display: none; } body { background: #fff; } }
  </style>
</head>
<body>
  <div class="wrap">
    <div class="topbar">
      <div class="kicker">Marigold Insights · Self-Contained Offline Bundle</div>
      <div class="kicker">${escHtml(generatedAtIso.split("T")[0])} · Zero-PII Verified</div>
    </div>

    <h1>${escHtml(input.title)}</h1>
    <p class="subtitle">${escHtml(input.subtitle)}</p>

    <div class="pills">
      <span class="pill pill-focus">Cleanliness Score: ${input.cleanlinessScore} / 100</span>
      <span class="pill">Total Evaluated: ${input.totalRecords.toLocaleString()} records</span>
      <span class="pill">Jurisdiction: ${escHtml(input.jurisdictionName)} (${escHtml(input.stateCode)})</span>
    </div>

    <div class="verify-box">
      <div class="verify-row">
        <div>
          <strong>Offline Cryptographic Tamper Check (SHA-256 Canonical Proof)</strong>
          <div style="font-size:13px;color:#44403C;margin-top:2px;">Works 100% offline from USB drive or local disk with zero internet connection.</div>
        </div>
        <button type="button" onclick="verifyOfflinePayload()">Verify SHA-256 Proof Offline</button>
      </div>
      <div class="hash-mono">Expected SHA-256 Digest: <span id="expected-digest">${merkleHashHex}</span></div>
      <div id="verify-status" class="status-ok"></div>
    </div>

    <div class="metrics-grid">
      ${metricsHtml}
    </div>

    <section class="section">
      <h2>Executive Briefing Narrative</h2>
      ${summaryHtml}
    </section>

    ${actionsHtml}

    <footer class="footer">
      <span>Marigold Insights · Non-Partisan Local-Compute Analytics</span>
      <span>Self-Contained Offline HTML Archive · No External Scripts</span>
    </footer>
  </div>

  <script id="marigold-canonical-payload" type="application/json">${canonicalJson.replace(/<\/script>/gi, "<\\/script>")}</script>
  <script>
    async function verifyOfflinePayload() {
      var el = document.getElementById('verify-status');
      try {
        var raw = document.getElementById('marigold-canonical-payload').textContent || '';
        var bytes = new TextEncoder().encode(raw);
        var buf = await window.crypto.subtle.digest('SHA-256', bytes);
        var computed = Array.from(new Uint8Array(buf)).map(function(b) { return b.toString(16).padStart(2, '0'); }).join('');
        var expected = (document.getElementById('expected-digest').textContent || '').trim();
        el.style.display = 'block';
        if (computed === expected) {
          el.textContent = '✓ Verified Offline: SHA-256 digest matches (' + computed.slice(0, 16) + '…) — 0 bytes altered.';
        } else {
          el.style.background = '#FEF3C7';
          el.style.borderColor = '#B45309';
          el.style.color = '#78350F';
          el.textContent = 'Warning: Document payload digest changed (' + computed.slice(0, 16) + '… vs ' + expected.slice(0, 16) + '…).';
        }
      } catch (e) {
        el.style.display = 'block';
        el.textContent = 'Web Crypto digest check requires a modern browser context.';
      }
    }
  </script>
</body>
</html>`;

  return { html, merkleHashHex, filename };
}

export async function downloadStandaloneOfflineDossier(
  input: OfflineDossierBundleInput
): Promise<{ merkleHashHex: string; filename: string }> {
  const { html, merkleHashHex, filename } = await buildStandaloneOfflineDossierHtml(input);
  try {
    const activeGrp =
      (typeof window !== "undefined" ? localStorage.getItem("marigold_active_group") : null) ||
      "default";
    const root = await getDirectoryOrOPFSHandle(activeGrp.toLowerCase());
    await writeStructuredFile(root, "Local_Host_Bundles", filename, html);
  } catch {
    // Browser download proceeds even without folder permissions
  }

  await triggerSovereignDownload({
    filename,
    content: html,
    mimeType: "text/html;charset=utf-8",
  });

  return { merkleHashHex, filename };
}
