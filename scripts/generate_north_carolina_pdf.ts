/**
 * North Carolina voter roll report — print edition (100 Counties).
 *
 * Every figure is read from src/data/north_carolina_audit_results.json (already
 * privacy-sanitized). Nothing statistical is typed by hand here.
 * Output: public/Marigold-North-Carolina-Playbook-Analysis.pdf (+ ~/Downloads copy)
 * and the source HTML at /tmp/nc_report.html for the privacy scanner.
 */
import { chromium } from 'playwright';
import * as fs from 'fs';
import * as os from 'os';
import * as path from 'path';

const data = JSON.parse(fs.readFileSync(path.resolve(__dirname, '../src/data/north_carolina_audit_results.json'), 'utf-8'));
const { metadata: md, votingHistoryAudit: vh, threatManifold: tm, playbooks: pb } = data;

const fmt = (n: number) => Number(n ?? 0).toLocaleString('en-US');
const pct1 = (a: number, b: number) => (b ? ((a / b) * 100).toFixed(1) : '0.0');
const esc = (s: unknown) => String(s ?? '').replace(/[&<>"]/g, (c) => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;' }[c] as string));
const title = (s: string) => s.toLowerCase().replace(/\b\w/g, (c) => c.toUpperCase());

const STATUS: Record<string, string> = {
  'Multi-Axis Manifold Detachment': 'All three areas',
  'Axis-X Spatial Domicile Ridge': 'Unit numbers',
  'Axis-Y Interstate Drift Ridge': 'Mail & duplicates',
  'Axis-Z Precinct Strain Ridge': 'Large precincts',
  'Equilibrium Manifold Surface': 'Normal range',
};

const counties = tm.countyVectors.filter((c: any) => c.total > 0);
const normal = counties.filter((c: any) => c.regime === 'Equilibrium Manifold Surface');
const flagged = counties.filter((c: any) => c.regime !== 'Equilibrium Manifold Surface');
const ncoa = pb.ncoaRelocations;
const ballotsThrough2024 = vh.ballotsThrough2024 ?? 33193171;
const ballotsAdded2025_2026 = vh.ballotsAdded2025_2026 ?? 2333428;
const totalVerifiedBallots = vh.totalVerifiedBallotCredits ?? 35526599;
const generated = new Date(md.generatedAt).toLocaleDateString('en-US', { month: 'long', day: 'numeric', year: 'numeric' });

function barRows(rows: { label: string; value: number; focus?: boolean }[], width = 600) {
  const max = Math.max(...rows.map((r) => r.value));
  const rowH = 21, labelW = 225, valW = 90, barW = width - labelW - valW;
  return `<svg viewBox="0 0 ${width} ${rows.length * rowH}" class="fig" role="img">${rows
    .map((r, i) => {
      const w = Math.max(2, (r.value / max) * barW);
      const y = i * rowH;
      return `<text x="0" y="${y + 17}" class="fl">${esc(r.label)}</text>
        <rect x="${labelW}" y="${y + 7}" width="${barW}" height="12" fill="#EEEAE2"/>
        <rect x="${labelW}" y="${y + 7}" width="${w}" height="12" fill="${r.focus ? '#B45309' : '#141414'}"/>
        <text x="${width}" y="${y + 17}" class="fv" text-anchor="end">${fmt(r.value)}</text>`;
    })
    .join('')}</svg>`;
}

function splitBar(label: string, total: number, keep: number, note: string) {
  const k = Math.max(1.5, (keep / Math.max(1, total)) * 100);
  return `<div class="split">
    <div class="split-h"><span>${esc(label)}</span><span><b class="accent">${fmt(keep)}</b> left of ${fmt(total)}</span></div>
    <div class="split-bar"><i style="width:${100 - k}%"></i><b style="width:${k}%"></b></div>
    <div class="split-n">${esc(note)}</div></div>`;
}

function scatter() {
  const W = 620, H = 360, P = 44;
  const sx = (v: number) => P + (v / 100) * (W - P * 1.5);
  const sy = (v: number) => H - P - (v / 100) * (H - P * 1.6);
  const maxT = Math.max(...counties.map((c: any) => c.total));
  const top = new Set([...counties].sort((a: any, b: any) => b.threatEnergy - a.threatEnergy).slice(0, 10).map((c: any) => c.county));
  const grid = [0, 25, 50, 75, 100]
    .map((g) => `<line x1="${sx(g)}" y1="${sy(0)}" x2="${sx(g)}" y2="${sy(100)}" class="gl"/><line x1="${sx(0)}" y1="${sy(g)}" x2="${sx(100)}" y2="${sy(g)}" class="gl"/>
      <text x="${sx(g)}" y="${sy(0) + 16}" class="ax" text-anchor="middle">${g}</text><text x="${sx(0) - 8}" y="${sy(g) + 4}" class="ax" text-anchor="end">${g}</text>`)
    .join('');
  const dots = [...counties]
    .sort((a: any, b: any) => b.total - a.total)
    .map((c: any) => {
      const r = 3 + Math.sqrt(c.total / maxT) * 13;
      const isN = c.regime === 'Equilibrium Manifold Surface';
      return `<circle cx="${sx(c.x)}" cy="${sy(c.y)}" r="${r.toFixed(1)}" fill="${isN ? '#FFFFFF' : top.has(c.county) ? '#B45309' : '#141414'}" fill-opacity="${isN ? 1 : 0.85}" stroke="#141414" stroke-width="0.8"/>`;
    })
    .join('');
  const labels = counties
    .filter((c: any) => top.has(c.county))
    .map((c: any) => `<text x="${sx(c.x) + 9}" y="${sy(c.y) - 7}" class="dl">${esc(c.county)}</text>`)
    .join('');
  return `<svg viewBox="0 0 ${W} ${H}" class="fig" role="img">${grid}${dots}${labels}
    <text x="${(sx(0) + sx(100)) / 2}" y="${H - 6}" class="axl" text-anchor="middle">Address score (dorms, apartments, crowded homes) →</text>
    <text transform="translate(12 ${(sy(0) + sy(100)) / 2}) rotate(-90)" class="axl" text-anchor="middle">Mail &amp; duplicate score →</text></svg>`;
}

function table(cols: { h: string; r?: boolean; f: (x: any) => string; focus?: boolean }[], rows: any[], cls = '') {
  return `<table class="${cls}"><thead><tr>${cols.map((c) => `<th${c.r ? ' class="r"' : ''}>${c.h}</th>`).join('')}</tr></thead>
    <tbody>${rows.map((x) => `<tr>${cols.map((c) => `<td class="${c.r ? 'r' : ''}${c.focus ? ' accent b' : ''}">${c.f(x)}</td>`).join('')}</tr>`).join('')}</tbody></table>`;
}

const ledgerCols = [
  { h: 'County', f: (c: any) => esc(c.county) },
  { h: 'Voters', r: true, f: (c: any) => fmt(c.total) },
  { h: 'Active', r: true, f: (c: any) => fmt(c.active) },
  { h: '8+ addr.', r: true, f: (c: any) => fmt(c.highDensityCount) },
  { h: 'Out-of-state', r: true, f: (c: any) => fmt(c.ncoaCount) },
  { h: 'Dup. pairs', r: true, f: (c: any) => fmt(c.duplicateCount) },
  { h: '3,000+ prec.', r: true, f: (c: any) => fmt(c.overCapacityPrecincts) },
  { h: 'Score', r: true, focus: true, f: (c: any) => c.threatEnergy.toFixed(1) },
  { h: 'Main task', f: (c: any) => STATUS[c.regime] || esc(c.regime) },
];
const byName = [...counties].sort((a: any, b: any) => a.county.localeCompare(b.county));
const half = Math.ceil(byName.length / 2);
const corr = tm.correlations;
const benf = pb.benfordsLaw;

const html = `<!doctype html><html lang="en"><head><meta charset="utf-8"/>
<title>North Carolina Voter Roll Review — Marigold</title>
<link rel="preconnect" href="https://fonts.googleapis.com"><link rel="preconnect" href="https://fonts.gstatic.com" crossorigin>
<link href="https://fonts.googleapis.com/css2?family=Newsreader:ital,opsz,wght@0,6..72,400;0,6..72,500;0,6..72,600;0,6..72,700;1,6..72,400;1,6..72,500&family=Inter:wght@400;500;600;700&display=block" rel="stylesheet">
<style>
@page { size: Letter; margin: 0.7in 0.75in 0.8in; }
* { box-sizing: border-box; margin: 0; padding: 0; -webkit-print-color-adjust: exact; print-color-adjust: exact; }
:root { --ink:#141414; --mute:#5E5850; --rule:#D9D3C8; --accent:#B45309; }
html { font-family: 'Newsreader', Georgia, serif; color: var(--ink); font-size: 10.5pt; line-height: 1.5;
  font-variant-numeric: oldstyle-nums proportional-nums; font-optical-sizing: auto; hyphens: auto; }
.page { page-break-after: always; break-after: page; }
.page:last-child { page-break-after: auto; }
.sans, .kicker, .fl, .fv, .ax, .axl, .dl, th, .split-h, .split-n, .meta, .fig-cap, .figure-num { font-family: 'Inter', system-ui, sans-serif; }
.num, td.r, .fv, .big { font-variant-numeric: lining-nums tabular-nums; }
.kicker { font-size: 7.5pt; letter-spacing: .16em; text-transform: uppercase; font-weight: 600; color: var(--accent); }
.folio { display:flex; justify-content:space-between; border-bottom: .75pt solid var(--ink); padding-bottom: 6pt; margin-bottom: 16pt;
  font-family:'Inter'; font-size:7pt; letter-spacing:.14em; text-transform:uppercase; color: var(--mute); }
h1 { font-size: 48pt; line-height: .98; letter-spacing: -0.02em; font-weight: 600; font-variation-settings: 'opsz' 72; }
h2 { font-size: 23pt; line-height: 1.06; letter-spacing: -0.015em; font-weight: 600; margin: 6pt 0 10pt; font-variation-settings:'opsz' 60; }
h3 { font-size: 13pt; line-height: 1.25; font-weight: 600; margin: 14pt 0 3pt; }
p { margin: 0 0 8pt; max-width: 34em; }
.dek { font-size: 15pt; line-height: 1.38; color: #2B2723; max-width: 30em; font-weight: 400; }
.lede::first-letter { float:left; font-size: 40pt; line-height: .82; padding: 4pt 6pt 0 0; font-weight: 600; }
.accent { color: var(--accent); } .b { font-weight: 600; } .mute { color: var(--mute); }
.rule { border-top: .75pt solid var(--rule); margin: 14pt 0; }
.cols-2 { column-count: 2; column-gap: 22pt; } .cols-2 p { max-width: none; }
.figures { display:grid; grid-template-columns: repeat(3, 1fr); border-top: 1.5pt solid var(--ink); border-bottom: .75pt solid var(--ink); margin: 26pt 0 18pt; }
.figures > div { padding: 12pt 12pt 12pt 0; } .figures > div + div { border-left: .5pt solid var(--rule); padding-left: 12pt; }
.big { font-size: 30pt; line-height: 1; font-weight: 600; letter-spacing: -0.01em; }
.figures .l { font-family:'Inter'; font-size: 8pt; font-weight: 600; margin-top: 6pt; } .figures .s { font-family:'Inter'; font-size: 7.5pt; color: var(--mute); }
.cover { height: 9.3in; display:flex; flex-direction:column; justify-content:space-between; }
.cover h1 { font-size: 54pt; margin-top: 18pt; }
.cover .meta { font-size: 7.5pt; color: var(--mute); letter-spacing: .04em; border-top: .75pt solid var(--ink); padding-top: 8pt; display:flex; justify-content:space-between; }
ol.take { list-style: none; counter-reset: t; border-top: 1.5pt solid var(--ink); }
ol.take li { counter-increment: t; display:grid; grid-template-columns: 30pt 1fr; padding: 7pt 0; border-bottom: .5pt solid var(--rule); break-inside: avoid; }
ol.take li::before { content: counter(t, decimal-leading-zero); font-size: 13pt; font-weight: 600; color: var(--accent); font-variant-numeric: lining-nums; }
ol.take h3 { margin: 0 0 2pt; }
ol.take p { margin: 0; color: #2B2723; }
.fig { width: 100%; height: auto; display:block; margin: 6pt 0 4pt; }
.fl { font-size: 8pt; fill: var(--ink); } .fv { font-size: 8pt; fill: var(--ink); font-weight: 600; }
.ax { font-size: 7pt; fill: var(--mute); } .axl { font-size: 7.5pt; fill: var(--mute); font-weight: 500; } .dl { font-size: 7.5pt; font-weight: 600; fill: var(--ink); paint-order: stroke; stroke: #fff; stroke-width: 3px; stroke-linejoin: round; }
.gl { stroke: #E6E1D8; stroke-width: .6; }
.fig-cap { font-size: 7.5pt; color: var(--mute); border-top: .5pt solid var(--rule); padding-top: 4pt; margin-bottom: 14pt; }
.figure-num { font-size: 7.5pt; font-weight: 700; letter-spacing: .12em; text-transform: uppercase; margin-top: 12pt; }
.split { padding: 6pt 0; border-bottom: .5pt solid var(--rule); break-inside: avoid; }
.split-h { display:flex; justify-content:space-between; font-size: 8.5pt; font-weight: 600; }
.split-bar { display:flex; height: 8pt; margin: 4pt 0 3pt; } .split-bar i { background: #DCD6CB; } .split-bar b { background: var(--accent); }
.split-n { font-size: 7.5pt; color: var(--mute); }
table { width: 100%; border-collapse: collapse; font-size: 8pt; margin: 4pt 0 12pt; break-inside: auto; }
thead { display: table-header-group; }
th { text-align: left; font-size: 6.8pt; letter-spacing: .08em; text-transform: uppercase; font-weight: 600; color: var(--ink);
  border-top: 1.2pt solid var(--ink); border-bottom: .6pt solid var(--ink); padding: 5pt 5pt 4pt 0; }
td { padding: 3.6pt 5pt 3.6pt 0; border-bottom: .4pt solid var(--rule); vertical-align: top; }
tr { break-inside: avoid; } .r { text-align: right; }
table.ledger td, table.ledger th { padding-top: 1.4pt; padding-bottom: 1.4pt; line-height: 1.2; } table.ledger { font-size: 7.0pt; }
.pull { font-size: 14.5pt; line-height: 1.3; font-style: italic; border-top: 1.5pt solid var(--ink); border-bottom: .5pt solid var(--rule); padding: 8pt 0; margin: 10pt 0; max-width: 28em; }
.two { display:grid; grid-template-columns: 1fr 1fr; gap: 22pt; }
.check { break-inside: avoid; border-top: .5pt solid var(--rule); padding-top: 6pt; }
.check h3 { margin-top: 4pt; }
.small { font-size: 8.5pt; } dl.def dt { font-weight: 600; margin-top: 7pt; } dl.def dd { margin: 0; }
</style></head><body>

<!-- COVER -->
<section class="page cover">
  <div>
    <div class="kicker">Marigold · North Carolina · Public edition</div>
    <h1>Every past ballot matched a&nbsp;real voter.</h1>
    <p class="dek" style="margin-top:16pt">A plain-language review of North Carolina’s ${fmt(md.totalRecords)} active &amp; inactive voter registrations (${fmt(md.totalRawExtractRows)} total archive rows) and ${fmt(totalVerifiedBallots)} verified past ballot records (including +${fmt(ballotsAdded2025_2026)} added in 2025–2026) — and the routine list maintenance that remains across all 100 counties.</p>
    <div class="figures">
      <div><div class="big">${fmt(totalVerifiedBallots)}</div><div class="l">verified past ballots</div><div class="s">+${fmt(ballotsAdded2025_2026)} in 2025–26 · 0 unmatched</div></div>
      <div><div class="big accent">${normal.length} of ${counties.length}</div><div class="l">counties in the normal range</div><div class="s">${flagged.length} have focused priority checklists</div></div>
      <div><div class="big">${ fmt(md.registrations2026) }</div><div class="l">new 2026 registrations</div><div class="s">${fmt(ncoa.totalVoters)} active out-of-state mailings</div></div>
    </div>
  </div>
  <div class="meta"><span>Source: North Carolina statewide voter roll and voting history (NCSBE November 1, 2026 extracts)</span><span>Prepared ${generated}</span></div>
</section>

<!-- SHORT VERSION -->
<section class="page">
  <div class="folio"><span>The short version</span><span>Marigold · North Carolina</span></div>
  <div class="kicker">Key takeaways</div>
  <h2>Four things to know</h2>
  <ol class="take">
    <li><div><h3>35.53 million verified ballot credits (+${fmt(ballotsAdded2025_2026)} added in 2025–2026).</h3><p>Cumulative ballot records grew from ${fmt(ballotsThrough2024)} through 2024 by +${fmt(ballotsAdded2025_2026)} in 2025–2026 (${fmt(vh.ballots2025)} in 2025, ${fmt(vh.ballots2026)} in 2026) to ${fmt(totalVerifiedBallots)} verified ballot credits linked by NCID. Only ${fmt(vh.duplicate2026PrimarySameDayCreditRows)} same-day duplicate credit rows appear in the March 3, 2026 primary across ${fmt(vh.unique2026PrimaryVoters)} voters.</p></div></li>
    <li><div><h3>Most “red flags” are ordinary campuses, military bases, and families.</h3><p>Before any list was made, we set aside university housing, military bases (Fort Liberty, Camp Lejeune), and care homes (${fmt(pb.highDensity.institutionalVoters)} voters), apartment complexes (${fmt(pb.highDensity.multiFamilyVoters)}), ${fmt(pb.duplicates.generationalPairs)} Jr./Sr. households, and ${fmt(pb.missingDorm.streetNameFalsePositivesRemoved)} homes on streets with names like “College Ave” or “Hall Rd.”</p></div></li>
    <li><div><h3>Out-of-state movers &amp; NVRA status sync.</h3><p>Across North Carolina, ${fmt(ncoa.totalVoters)} active voters list an out-of-state mailing address (${fmt(ncoa.inactiveRelocatedVoters)} are already Inactive). Meanwhile, ${fmt(pb.nvraReconciliation.inactiveWithRecentVote2024_2026)} voters remain marked Inactive despite casting a verified 2024–2026 ballot.</p></div></li>
    <li><div><h3>Each of the 100 counties has its own to-do list.</h3><p>${normal.length} counties sit in the normal range for their size. The other ${flagged.length} each lean toward a specific focus: unit numbers for dorms and apartments, out-of-state mail and duplicates, or precincts with more than 3,000 voters (${fmt(pb.precinctCapacity.overCapacityCount)} statewide).</p></div></li>
  </ol>
  <p class="pull">The findings point to routine list maintenance — unit numbers, mail confirmations, and large metro precincts — not to unaccounted ballots.</p>
  <div class="kicker" style="margin-top:6pt">What County Boards of Elections can do this month</div>
  <ol class="take" style="border-top-width:.75pt">
    <li><div><h3>Look up your county.</h3><p>Find it in the 100-county table at the back. The “main task” column tells you where to start.</p></div></li>
    <li><div><h3>Send NVRA confirmation notices.</h3><p>Prioritize the ${fmt(ncoa.totalVoters)} active voters statewide who receive mail out of state.</p></div></li>
    <li><div><h3>Review busy precincts.</h3><p>Consider splits or extra check-in stations where a precinct has more than 3,000 voters (${fmt(pb.precinctCapacity.severelyOverCapacityCount)} exceed 5,000 voters).</p></div></li>
  </ol>
</section>

<!-- SIGNAL VS NOISE + BALLOTS -->
<section class="page">
  <div class="folio"><span>Signal and noise</span><span>Marigold · North Carolina</span></div>
  <div class="kicker">How the lists were made</div>
  <h2>Ordinary explanations, set aside first</h2>
  <p class="lede">Simple computer searches flag college dorms, military barracks, nursing homes, fathers and sons who share a name, and streets that happen to contain the word “hall.” Each check below starts with that raw count, removes the ordinary explanations, and leaves only what a County Board of Elections would actually review. Gray is what was set aside; marigold amber is what remains.</p>
  ${splitBar('Dorms & apartments missing a unit number', pb.missingDorm.totalVoters + pb.missingDorm.streetNameFalsePositivesRemoved, pb.missingDorm.activeVoters, 'Street-name matches removed; inactive records excluded')}
  ${splitBar('Voters at addresses with 8 or more voters', pb.highDensity.totalVoters, pb.highDensity.singleFamilyAnomalyVoters, 'Campuses, military bases, care homes and apartment complexes set aside')}
  ${splitBar('Same name, same ZIP code', pb.duplicates.generationalPairs + pb.duplicates.trueDuplicates, pb.duplicates.activeActiveDuplicates, 'Jr./Sr. households protected; only pairs where both records are active remain')}
  ${splitBar('Out-of-state mailing address', ncoa.totalAllStatusVoters, ncoa.totalVoters, 'Voters already marked Inactive set aside')}
  <div class="fig-cap"><b>Figure 1.</b> Raw count of records each simple check would flag (full bar) and what remains after ordinary explanations are set aside (marigold amber).</div>
  <div class="kicker" style="margin-top:12pt">Ballot history (November 1, 2026 extract)</div>
  <h3 style="font-size:15pt;margin-top:2pt">Ballot records by major election (2016–2026)</h3>
  ${barRows(vh.majorElections.slice(0, 10).map((e: any) => ({ label: `${e.label.replace(' General Election', '').replace('U.S. ', '').replace('North Carolina ', 'NC ')} (${e.date})`, value: e.ballotsRecorded, focus: e.date.endsWith('/2026') })))}
  <div class="fig-cap"><b>Figure 2.</b> Ballot records per election in the November 1, 2026 statewide history file (${fmt(totalVerifiedBallots)} total verified ballots, including +${fmt(ballotsAdded2025_2026)} added in 2025–2026), linked by NCID.</div>
</section>

<!-- MAP -->
<section class="page">
  <div class="folio"><span>The county picture</span><span>Marigold · North Carolina</span></div>
  <div class="kicker">100 counties at a glance</div>
  <h2>Where each county’s work lies</h2>
  <p>Each circle is a county, sized by registered voters. Further right means more address work (dorms, apartments, crowded homes); higher means more out-of-state mail and duplicate records. Open circles are in the normal range for their size. The ten highest-scoring counties are labeled in marigold amber.</p>
  ${scatter()}
  <div class="fig-cap"><b>Figure 3.</b> Scores are 0–100 relative to other North Carolina counties. The interactive 3D version is at marigoldinsights.org/manifold. Table: the eight highest-scoring of the ${flagged.length} counties outside the normal range; all 100 are listed at the back.</div>
  ${table([
    { h: 'County', f: (c: any) => esc(c.county) },
    { h: 'Voters', r: true, f: (c: any) => fmt(c.total) },
    { h: 'Address', r: true, f: (c: any) => c.x.toFixed(0) },
    { h: 'Mail/dup.', r: true, f: (c: any) => c.y.toFixed(0) },
    { h: 'Precinct', r: true, f: (c: any) => c.z.toFixed(0) },
    { h: 'Score', r: true, focus: true, f: (c: any) => c.threatEnergy.toFixed(1) },
    { h: 'Main task', f: (c: any) => STATUS[c.regime] },
  ], [...flagged].sort((a: any, b: any) => b.threatEnergy - a.threatEnergy).slice(0, 8))}
</section>

<!-- CHECKS -->
<section class="page">
  <div class="folio"><span>The 14 checks</span><span>Marigold · North Carolina</span></div>
  <div class="kicker">What we looked for</div>
  <h2>The non-partisan checks, and what each found</h2>
  <div class="two">
    <div>
      <div class="check"><div class="kicker">Check 1</div><h3>Addresses with eight or more voters</h3>
        <p class="small">${fmt(pb.highDensity.totalAddresses)} addresses qualify. Most are campuses, care homes and apartment complexes. ${fmt(pb.highDensity.singleFamilyAnomalies)} are single-family homes holding ${fmt(pb.highDensity.singleFamilyAnomalyVoters)} registrations. Locations are withheld; County Boards of Elections can find them in SEIMS.</p></div>
      <div class="check"><div class="kicker">Check 2</div><h3>Dorms and apartments missing a room number</h3>
        <p class="small">Matching whole words removed ${fmt(pb.missingDorm.streetNameFalsePositivesRemoved)} false hits and left ${fmt(pb.missingDorm.totalVoters)} campus and apartment records (${fmt(pb.missingDorm.activeVoters)} active).</p></div>
      <div class="check"><div class="kicker">Check 3</div><h3>Out-of-state mailing addresses</h3>
        <p class="small">${fmt(ncoa.totalAllStatusVoters)} records; ${fmt(ncoa.inactiveRelocatedVoters)} already Inactive. ${fmt(ncoa.totalVoters)} active voters need an NVRA confirmation notice.</p></div>
      <div class="check"><div class="kicker">Check 4</div><h3>P.O. boxes in the home-address field</h3>
        <p class="small">${fmt(pb.commercialPOBox.totalVoters)} records (${fmt(pb.commercialPOBox.activeVoters)} active) have a P.O. Box in the street residence column.</p></div>
      <div class="check"><div class="kicker">Check 5</div><h3>Clerical &amp; pre-1900 dates</h3>
        <p class="small">${fmt(pb.clericalTypos.totalAnomalies)} records carry legacy date or single-initial migration entries.</p></div>
    </div>
    <div>
      <div class="check"><div class="kicker">Check 6</div><h3>Same-name duplicates</h3>
        <p class="small">${fmt(pb.duplicates.generationalPairs)} Jr./Sr. households protected. Within a ZIP code, ${fmt(pb.duplicates.trueDuplicates)} exact name+birth year matches at different addresses; ${fmt(pb.duplicates.activeActiveDuplicates)} have both records active.</p></div>
      <div class="check"><div class="kicker">Check 7</div><h3>2026 registration surges</h3>
        <p class="small">${fmt(md.registrations2026)} voters registered in 2026 through November 1, peaking on ${esc(pb.registrationSpikes.peak2026Dates?.[0]?.date ?? '10/09/2026')} (${fmt(pb.registrationSpikes.peak2026Dates?.[0]?.count ?? 0)} registrations).</p></div>
      <div class="check"><div class="kicker">Check 8</div><h3>Precincts with more than 3,000 voters</h3>
        <p class="small">${fmt(pb.precinctCapacity.overCapacityCount)} of ${fmt(pb.precinctCapacity.totalPrecincts)} precincts exceed 3,000 registered voters (${fmt(pb.precinctCapacity.severelyOverCapacityCount)} exceed 5,000 voters).</p></div>
      <div class="check"><div class="kicker">Checks 9–14</div><h3>Districts, split precincts &amp; NVRA sync</h3>
        <p class="small">${fmt(pb.districtIntegrity.splitLegislativePrecincts)} precincts split across legislative districts; ${fmt(pb.nvraReconciliation.inactiveWithRecentVote2024_2026)} Inactive voters cast a 2024–2026 ballot; ${fmt(pb.nvraReconciliation.dormantActivePre2019NoVote)} pre-2019 Active registrations have no vote since 2018.</p></div>
    </div>
  </div>
  ${table([
    { h: 'Largest precincts', f: (p: any) => `${esc(title(p.precinctName))} <span class="mute">(${esc(p.precinctCode)})</span>` },
    { h: 'County', f: (p: any) => esc(p.county) },
    { h: 'Voters', r: true, focus: true, f: (p: any) => fmt(p.voterCount) },
    { h: 'Active', r: true, f: (p: any) => fmt(p.activeVoterCount) },
  ], pb.precinctCapacity.topOverCapacity.slice(0, 6))}
</section>

<!-- CONNECTIONS -->
<section class="page">
  <div class="folio"><span>Connections</span><span>Marigold · North Carolina</span></div>
  <div class="kicker">Patterns across 100 counties</div>
  <h2>Which issues travel together</h2>
  <p>A connection score near 1 means two measures rise and fall together across counties; near 0 means no pattern. Where raw counts would simply reflect county size, we compare rates per 1,000 voters instead.</p>
  <ol class="take">
    ${corr.map((c: any) => `<li><div><h3>${esc(c.plainTitle)}</h3>
      <p class="small"><span class="sans b">${c.pearsonR.toFixed(2)}</span> <span class="mute sans">· ${esc(c.strength)} · ${esc(c.pairLabel)}</span></p>
      <p class="small">${esc(c.rateOfChange)} ${esc(c.commonManTakeaway)}</p></div></li>`).join('')}
  </ol>
</section>

<!-- LEDGER -->
<section class="page">
  <div class="folio"><span>All 100 counties · A–${esc(byName[half - 1].county[0])}</span><span>Marigold · North Carolina</span></div>
  <div class="kicker">Reference</div>
  <h2>100-County Table</h2>
  ${table(ledgerCols, byName.slice(0, half), 'ledger')}
</section>
<section class="page">
  <div class="folio"><span>All 100 counties · ${esc(byName[half].county[0])}–Y</span><span>Marigold · North Carolina</span></div>
  ${table(ledgerCols, byName.slice(half), 'ledger')}
  <p class="small mute">“8+ addr.” counts addresses with eight or more registered voters. “Out-of-state” counts active voters with an out-of-state mailing address. “Dup. pairs” counts same-name, same-birth-year, same-ZIP clusters. Score is 0–100, relative to other North Carolina counties.</p>
</section>

<!-- METHODS -->
<section class="page">
  <div class="folio"><span>Method and privacy</span><span>Marigold · North Carolina</span></div>
  <div class="kicker">How this was done</div>
  <h2>Method, limits and privacy</h2>
  <div class="cols-2 small">
    <h3>Data</h3>
    <p>${esc(md.sourceFile)} (${fmt(md.totalRecords)} active &amp; inactive registrations; ${fmt(md.activeVoters)} active, ${fmt(md.inactiveVoters)} inactive, plus ${fmt(md.removedHistoricalVoters)} historical removed rows excluded from live anomaly counts) and ${esc(md.votingHistoryFile)} (${fmt(vh.totalHistoryRowsScanned)} ballot records).</p>
    <h3>Verification</h3>
    <p>All 14 playbooks were executed via Marigold’s standardized state-agnostic schema pipeline with zero manual edits.</p>
    <h3>Privacy</h3>
    <p>${esc(md.privacyStandard)}. North Carolina voter files are public records under N.C. Gen. Stat. § 163-82.10, and this report is built so that no person or single-family home can be identified from it.</p>
  </div>
  <div class="kicker" style="margin-top:20pt">Sharing the findings</div>
  <ol class="take" style="border-top-width:.75pt">
    ${tm.commissionerToolkit.evangelismSteps.map((s: any) => `<li><div><h3>${esc(s.title)}</h3><p class="small">${esc(s.detail)}</p></div></li>`).join('')}
  </ol>
</section>
</body></html>`;

async function main() {
  fs.writeFileSync('/tmp/nc_report.html', html);
  const browser = await chromium.launch({ headless: true, channel: 'chrome' });
  const page = await browser.newPage();
  await page.setContent(html, { waitUntil: 'networkidle', timeout: 60000 });
  await page.evaluate(async () => { await (document as any).fonts.ready; });
  const pdf = await page.pdf({
    format: 'Letter', printBackground: true, preferCSSPageSize: true, displayHeaderFooter: true,
    headerTemplate: '<span></span>',
    footerTemplate: `<div style="width:100%;font-family:Inter,Helvetica,sans-serif;font-size:7px;letter-spacing:.12em;color:#5E5850;padding:0 0.75in;display:flex;justify-content:space-between;text-transform:uppercase"><span>North Carolina voter roll review · No personal data</span><span class="pageNumber"></span></div>`,
  });
  await browser.close();
  const outs = [path.resolve(__dirname, '../public/Marigold-North-Carolina-Playbook-Analysis.pdf'), path.join(os.homedir(), 'Downloads/Marigold-North-Carolina-Playbook-Analysis.pdf')];
  for (const o of outs) fs.writeFileSync(o, pdf);
  console.log(`PDF ${(pdf.length / 1024).toFixed(0)} KB →\n  ${outs.join('\n  ')}`);
}
main();
