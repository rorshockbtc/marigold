import { chromium } from 'playwright';
import * as fs from 'fs';
import * as path from 'path';

const auditDataPath = path.resolve(__dirname, '../src/data/mississippi_audit_results.json');
const auditData = JSON.parse(fs.readFileSync(auditDataPath, 'utf-8'));

async function generateMississippiPdf() {
  console.log('🚀 Launching Google Chrome for 10-Page Accént Editorial (Ink-Saving Draft 2) PDF Generation...');

  const browser = await chromium.launch({
    headless: true,
    channel: 'chrome',
  });

  const page = await browser.newPage({
    viewport: { width: 1275, height: 1650 },
    deviceScaleFactor: 2,
  });

  const { metadata, votingHistoryAudit, threatManifold, playbooks } = auditData;
  const correlations = threatManifold.correlations || [];
  const toolkit = threatManifold.commissionerToolkit || { peerTiers: [], evangelismSteps: [] };
  const vectorsPage9 = threatManifold.countyVectors.slice(0, 41);
  const vectorsPage10 = threatManifold.countyVectors.slice(41, 82);

  const htmlContent = `<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8" />
  <title>Mississippi 82-County Voter Roll & 25.91M Voting History Audit — Accént Edition (Draft 2)</title>
  <link rel="preconnect" href="https://fonts.googleapis.com">
  <link rel="preconnect" href="https://fonts.gstatic.com" crossorigin>
  <link href="https://fonts.googleapis.com/css2?family=Inter:wght@400;500;600;700&family=JetBrains+Mono:wght@400;500;600;700&family=Newsreader:ital,opsz,wght@0,6..72,400;0,6..72,600;0,6..72,700;1,6..72,400&family=Playfair+Display:wght@700;800&display=swap" rel="stylesheet">
  <style>
    * {
      box-sizing: border-box;
      margin: 0;
      padding: 0;
      -webkit-print-color-adjust: exact !important;
      print-color-adjust: exact !important;
    }
    @page {
      size: letter portrait;
      margin: 0;
    }
    html, body {
      background-color: #FFFFFF;
      color: #111111;
      font-family: 'Inter', -apple-system, sans-serif;
      font-size: 10.2px;
      line-height: 1.42;
    }
    .serif { font-family: 'Newsreader', Georgia, serif; }
    .display { font-family: 'Playfair Display', Georgia, serif; }
    .mono { font-family: 'JetBrains Mono', monospace; }

    .accent-page {
      width: 8.5in;
      height: 11in;
      padding: 0.44in 0.52in;
      background-color: #FFFFFF;
      color: #111111;
      page-break-after: always;
      break-after: page;
      position: relative;
      display: flex;
      flex-direction: column;
      justify-content: space-between;
      overflow: hidden;
    }
    .accent-page:last-of-type {
      page-break-after: auto;
      break-after: auto;
    }
    .masthead {
      border-top: 3px solid #111111;
      border-bottom: 1px solid #111111;
      padding: 6px 0;
      margin-bottom: 12px;
      display: flex;
      justify-content: space-between;
      align-items: center;
      font-family: 'JetBrains Mono', monospace;
      font-size: 8.5px;
      letter-spacing: 0.1em;
      text-transform: uppercase;
      color: #333333;
    }
    .kicker {
      font-family: 'JetBrains Mono', monospace;
      font-size: 8.8px;
      text-transform: uppercase;
      letter-spacing: 0.14em;
      color: #D9381E;
      font-weight: 700;
      margin-bottom: 3px;
    }
    h1 {
      font-family: 'Playfair Display', Georgia, serif;
      font-size: 27px;
      line-height: 1.08;
      font-weight: 800;
      color: #111111;
      letter-spacing: -0.02em;
    }
    h2 {
      font-family: 'Playfair Display', Georgia, serif;
      font-size: 17.5px;
      line-height: 1.15;
      font-weight: 700;
      color: #111111;
      margin-bottom: 4px;
    }
    h3 {
      font-family: 'Newsreader', Georgia, serif;
      font-size: 13px;
      font-weight: 700;
      color: #111111;
      margin-bottom: 3px;
    }
    p {
      color: #2A2927;
    }
    .kpi-strip {
      display: grid;
      grid-template-columns: repeat(6, 1fr);
      border-top: 2px solid #111111;
      border-bottom: 2px solid #111111;
      padding: 8px 0;
      margin: 10px 0;
      gap: 8px;
    }
    .kpi-item {
      border-right: 1px solid #D8D4CC;
      padding-right: 6px;
    }
    .kpi-item:last-child {
      border-right: none;
    }
    .kpi-label {
      font-family: 'JetBrains Mono', monospace;
      font-size: 7.8px;
      text-transform: uppercase;
      color: #66635E;
      letter-spacing: 0.06em;
    }
    .kpi-val {
      font-family: 'Playfair Display', Georgia, serif;
      font-size: 16.5px;
      font-weight: 800;
      color: #111111;
      margin-top: 1px;
    }
    .kpi-sub {
      font-family: 'JetBrains Mono', monospace;
      font-size: 7.8px;
      color: #4A4845;
    }
    table {
      width: 100%;
      border-collapse: collapse;
      border-top: 1.5px solid #111111;
      border-bottom: 1.5px solid #111111;
      font-size: 9.2px;
    }
    th {
      font-family: 'JetBrains Mono', monospace;
      font-size: 7.8px;
      text-transform: uppercase;
      letter-spacing: 0.06em;
      color: #4A4845;
      text-align: left;
      padding: 4.5px 5px;
      border-bottom: 1px solid #111111;
      background-color: #FAF9F6;
    }
    td {
      padding: 4px 5px;
      border-bottom: 1px solid #E6E2DA;
      color: #111111;
      vertical-align: top;
    }
    tr:last-child td {
      border-bottom: none;
    }
    .num {
      text-align: right;
      font-family: 'JetBrains Mono', monospace;
    }
    .accent-red { color: #D9381E; font-weight: 700; }
    .accent-green { color: #15803D; font-weight: 700; }
    .callout-hairline {
      border-top: 1.5px solid #111111;
      border-bottom: 1px solid #D8D4CC;
      padding: 8px 0;
      margin: 8px 0;
    }
    .two-col {
      display: grid;
      grid-template-columns: 1fr 1fr;
      gap: 16px;
    }
    .three-col {
      display: grid;
      grid-template-columns: 1fr 1fr 1fr;
      gap: 12px;
    }
    .footer {
      border-top: 1px solid #111111;
      padding-top: 5px;
      display: flex;
      justify-content: space-between;
      font-family: 'JetBrains Mono', monospace;
      font-size: 8px;
      color: #55524D;
    }
  </style>
</head>
<body>

  <!-- PAGE 1: COVER & EXECUTIVE SUMMARY -->
  <div class="accent-page">
    <div>
      <div class="masthead">
        <span>MARIGOLD ELECTION HYGIENE PUBLICATIONS · ACCÉNT EDITORIAL EDITION (DRAFT 2)</span>
        <span class="accent-red">100% ZERO-PII · INK-SAVING COMMISSIONER EDITION</span>
      </div>

      <div class="kicker">STATE OF MISSISSIPPI · 82-COUNTY VOTER ROLL &amp; 25.91 MILLION BALLOT HISTORY AUDIT</div>
      <h1>Mississippi Voter Roll &amp; Voting History Forensic Analysis</h1>
      <p class="serif" style="font-size: 13.5px; color: #333; margin-top: 6px; line-height: 1.45;">
        A plain-English guide for County Election Commissioners, Circuit Clerks, and citizens—using 3D vector geometry, calculus variable isolation, and statistical correlations across <strong>2,112,460 voter roll records</strong> and <strong>25,911,640 historical ballots</strong> to separate harmless building quirks from real list-maintenance priorities.
      </p>

      <div class="kpi-strip">
        <div class="kpi-item">
          <div class="kpi-label">Voter Roll Audited</div>
          <div class="kpi-val">${metadata.totalRecords.toLocaleString()}</div>
          <div class="kpi-sub">${metadata.activeVoters.toLocaleString()} Act · ${metadata.inactiveVoters.toLocaleString()} Inact</div>
        </div>
        <div class="kpi-item">
          <div class="kpi-label">Ballot History Joined</div>
          <div class="kpi-val">${votingHistoryAudit.totalHistoryRowsScanned.toLocaleString()}</div>
          <div class="kpi-sub accent-green">100.00% Match (0 Orphans)</div>
        </div>
        <div class="kpi-item">
          <div class="kpi-label">2024 General Voters</div>
          <div class="kpi-val">${votingHistoryAudit.unique2024GeneralVoters.toLocaleString()}</div>
          <div class="kpi-sub">${votingHistoryAudit.duplicate2024SameDayCreditRows} Dup Credit Rows</div>
        </div>
        <div class="kpi-item">
          <div class="kpi-label">Healthy Baseline</div>
          <div class="kpi-val">66 / 82</div>
          <div class="kpi-sub">Counties on Normal Sheet</div>
        </div>
        <div class="kpi-item">
          <div class="kpi-label">False Alarms Removed</div>
          <div class="kpi-val accent-red">18,093</div>
          <div class="kpi-sub">Dorms, Jr/Sr &amp; Street Names</div>
        </div>
        <div class="kpi-item">
          <div class="kpi-label">Privacy Standard</div>
          <div class="kpi-val accent-green">Zero-PII</div>
          <div class="kpi-sub">0 Names · 100-Block Mask</div>
        </div>
      </div>

      <div class="two-col" style="margin-top: 8px;">
        <div>
          <h3>1. Why Traditional Voter Roll Audits Cause False Alarms</h3>
          <p style="margin-top: 3px;">
            When an uncalibrated computer script scans a voter file, it flags every nursing home, university dormitory, apartment complex, father-and-son pair sharing a family name, and residential street named <em>"Marshall Place"</em> or <em>"Halls Ferry Road"</em> as a suspected anomaly. That buries County Election Commissioners under thousands of false positives.
          </p>
          <p style="margin-top: 5px;">
            In this Draft 2 edition, every playbook applies deterministic mathematical filters: whole-word regular expressions, facility classification, Active-vs-Inactive status separation, and a full join against all 25,911,640 historical ballots cast.
          </p>
        </div>
        <div>
          <h3>2. How 3D Variable Isolation Helps Commissioners Collaborate</h3>
          <p style="margin-top: 3px;">
            A single 1-to-100 score hides whether a county needs to append apartment unit numbers (like Oktibbeha and Lafayette Counties), process out-of-state mail forwardings (like Harrison and Hinds Counties), or split overcrowded 6,000-voter precincts (like DeSoto and Madison Counties).
          </p>
          <p style="margin-top: 5px;">
            By plotting each county along three independent axes—<strong>X (Address Crowding)</strong>, <strong>Y (Mail &amp; Duplicate Drift)</strong>, and <strong>Z (Polling Place Strain)</strong>—every Election Commissioner can see their county's exact maintenance recipe.
          </p>
        </div>
      </div>

      <div style="margin-top: 10px;">
        <div class="kicker">EXECUTIVE SCORECARD · ALL 10 MISSISSIPPI PLAYBOOKS AT A GLANCE</div>
        <table>
          <thead>
            <tr>
              <th>Playbook</th>
              <th>Audit Dimension</th>
              <th class="num">Raw / All-Status</th>
              <th class="num">Verified Actionable</th>
              <th>Plain-English Finding for Election Commissioners</th>
            </tr>
          </thead>
          <tbody>
            <tr>
              <td class="mono">PB-01</td>
              <td><strong>High-Density Parcels (≥8 Voters)</strong></td>
              <td class="num">1,598 Addrs (24,905)</td>
              <td class="num accent-red">1,070 Active Addrs</td>
              <td>56 Nursing/Campus hubs (6,788 voters) &amp; 103 Apt complexes separated from 1,439 single-family homes.</td>
            </tr>
            <tr>
              <td class="mono">PB-02</td>
              <td><strong>Missing Dorm / Multi-Unit #</strong></td>
              <td class="num">5,028 Keyword Hits</td>
              <td class="num accent-red">682 (502 Active)</td>
              <td>Whole-word regex removed 4,346 street-name false alarms (<em>Marshall Pl</em>, <em>Halls Ferry Rd</em>, <em>University Ave</em>).</td>
            </tr>
            <tr>
              <td class="mono">PB-03</td>
              <td><strong>Out-of-State Mail Forwardings</strong></td>
              <td class="num">13,622 All-Status</td>
              <td class="num accent-red">2,444 Active</td>
              <td>82.1% (11,178) are already marked Inactive waiting on their 2-cycle federal NVRA removal clock.</td>
            </tr>
            <tr>
              <td class="mono">PB-04</td>
              <td><strong>P.O. Box in Residence Field</strong></td>
              <td class="num">339 Total</td>
              <td class="num accent-red">186 Active</td>
              <td>337 P.O. Boxes and 2 Private Mail Boxes typed into physical residence field instead of mailing field.</td>
            </tr>
            <tr>
              <td class="mono">PB-05</td>
              <td><strong>Clerical &amp; Legacy Dates</strong></td>
              <td class="num">5,607 Records</td>
              <td class="num">5,607 Clerical</td>
              <td>3,804 1-letter names, 1,271 Year 1801, 206 Year 0001, and 113 <code>DATAMIGRATION</code> legacy imports.</td>
            </tr>
            <tr>
              <td class="mono">PB-06</td>
              <td><strong>Suffix-Protected Duplicates</strong></td>
              <td class="num">5,430 Name Pairs</td>
              <td class="num accent-red">818 Active Intra-ZIP</td>
              <td>4,404 Jr/Sr father-son pairs protected; 185 Active-Inactive move trails; 19,122 cross-county matches.</td>
            </tr>
            <tr>
              <td class="mono">PB-07</td>
              <td><strong>Statutory Registration Spikes</strong></td>
              <td class="num">15 Peak Dates</td>
              <td class="num accent-green">100% Statutory</td>
              <td>Peaks on 10/05/2020 (13,731) and 10/07/2024 (7,867) align with MS 30-day mail-in registration deadlines.</td>
            </tr>
            <tr>
              <td class="mono">PB-08</td>
              <td><strong>Mega-Precinct Capacity (&gt;3k)</strong></td>
              <td class="num">1,742 Precincts</td>
              <td class="num accent-red">123 Over-Capacity</td>
              <td>123 precincts exceed 3,000 voters (27 exceed 5,000 voters, led by Madison, DeSoto, Harrison, and Rankin).</td>
            </tr>
            <tr>
              <td class="mono">PB-09</td>
              <td><strong>First-Digit Benford's Law</strong></td>
              <td class="num">1,742 Precincts</td>
              <td class="num accent-green">χ² = 6.94 (PASS)</td>
              <td>Total registration passes cleanly (&lt;15.51); 2024 turnout (χ² = 71.15) reflects 1,500–3,000 precinct sizing.</td>
            </tr>
            <tr>
              <td class="mono">PB-10</td>
              <td><strong>25.91M Voting History Join</strong></td>
              <td class="num">25,911,640 Ballots</td>
              <td class="num accent-red">88 Dup Credits</td>
              <td>100.00% matched to Voter Roll IDs (0 orphans); 88 duplicate same-day 2024 general credit rows isolated.</td>
            </tr>
          </tbody>
        </table>
      </div>
    </div>

    <div class="footer">
      <span>MARIGOLD ELECTION HYGIENE · STATE OF MISSISSIPPI FORENSIC MONOGRAPH (DRAFT 2)</span>
      <span>PAGE 01 OF 10</span>
    </div>
  </div>

  <!-- PAGE 2: 3D THREAT MANIFOLD & VARIABLE ISOLATION -->
  <div class="accent-page">
    <div>
      <div class="masthead">
        <span>SECTION 02 · 3D VECTOR GEOMETRY &amp; CALCULUS VARIABLE ISOLATION</span>
        <span>STATE VECTOR: r(c) = &lt; X_DOMICILE, Y_MOBILITY, Z_VELOCITY &gt;</span>
      </div>

      <div class="kicker">HOW 3D GEOMETRY SEPARATES NORMAL POPULATION GROWTH FROM REAL OUTLIERS</div>
      <h2>The Mississippi 3D Threat Manifold &amp; Partial Derivative Isolation</h2>
      <p style="margin-bottom: 8px;">
        Think of a healthy voter roll like a smooth, gently sloped sheet (<strong>Z_eq(X, Y) = 8.5 + 0.34X + 0.29Y + 0.14(XY/100)</strong>). As a county's population grows, its housing density (X), mail forwardings (Y), and polling-place load (Z) rise together along that smooth sheet. Using calculus partial derivatives—holding two axes steady while measuring the rate of change along the third—we isolate which exact variable pulls a county above the normal baseline.
      </p>

      <!-- Ink-Saving High-Contrast Vector Canvas Diagram of the 3D Manifold -->
      <div style="border: 1px solid #111111; padding: 8px; margin-bottom: 10px; background: #FFFFFF;">
        <div style="display: flex; justify-content: space-between; font-family: 'JetBrains Mono', monospace; font-size: 8px; color: #4A4845; margin-bottom: 4px;">
          <span>ISOMETRIC 3D PROJECTION · 82 MISSISSIPPI COUNTIES ON EQUILIBRIUM SURFACE Z_eq(X, Y)</span>
          <span>66 BASELINE COUNTIES (GREEN) · 16 DETACHED PRIORITY COUNTIES (RED/AMBER/PURPLE/BLUE)</span>
        </div>
        <canvas id="manifold-3d-canvas" width="1100" height="270" style="width: 100%; height: 175px; display: block;"></canvas>
      </div>

      <div class="kicker">TABLE 2.1 · THE 16 MISSISSIPPI COUNTIES DETACHING ABOVE THE EQUILIBRIUM SURFACE</div>
      <table>
        <thead>
          <tr>
            <th>Rank &amp; County</th>
            <th class="num">Total Roll</th>
            <th class="num">X (Address)</th>
            <th class="num">Y (Mail/Dup)</th>
            <th class="num">Z (Precinct)</th>
            <th class="num">Z_eq Sheet</th>
            <th class="num">Signal</th>
            <th>Calculus Share (X / Y / Z)</th>
            <th>Primary Commissioner Focus</th>
          </tr>
        </thead>
        <tbody>
          ${threatManifold.countyVectors
            .slice(0, 16)
            .map(
              (c: Record<string, unknown>, idx: number) => `
            <tr>
              <td><span class="mono" style="color:#666;">${String(idx + 1).padStart(2, '0')}</span> <strong>${c.county}</strong></td>
              <td class="num">${(c.total as number).toLocaleString()}</td>
              <td class="num">${c.x}</td>
              <td class="num">${c.y}</td>
              <td class="num">${c.z}</td>
              <td class="num">${c.manifoldZ}</td>
              <td class="num accent-red">${c.threatEnergy}</td>
              <td class="mono" style="font-size:8.2px;">${c.partialX}% X · ${c.partialY}% Y · ${c.partialZ}% Z</td>
              <td>${c.dominantDriver}</td>
            </tr>`
            )
            .join('')}
        </tbody>
      </table>
    </div>

    <div class="footer">
      <span>SECTION 02 · 3D THREAT MANIFOLD &amp; VARIABLE ISOLATION</span>
      <span>PAGE 02 OF 10</span>
    </div>
  </div>

  <!-- PAGE 3: MATHEMATICAL CORRELATIONS & COMMISSIONER EVANGELISM GUIDE -->
  <div class="accent-page">
    <div>
      <div class="masthead">
        <span>SECTION 03 &amp; 04 · STATEWIDE MATHEMATICAL CORRELATIONS &amp; COMMISSIONER EVANGELISM TOOLKIT</span>
        <span>PEARSON r · SPEARMAN ρ · RATE OF CHANGE</span>
      </div>

      <div class="kicker">STATEWIDE STATISTICAL CORRELATIONS EXPLAINED IN PLAIN ENGLISH</div>
      <h2>How Voter Roll Issues Connect Across All 82 Counties</h2>
      <p style="margin-bottom: 8px;">
        We computed exact Pearson linear correlations (<em>r</em>), Spearman rank correlations (<em>ρ</em>), and calculus rates of change across all 82 counties so Election Commissioners can see which list-maintenance steps solve multiple problems at the same time:
      </p>

      <table>
        <thead>
          <tr>
            <th>Correlation Pair &amp; Strength</th>
            <th class="num">Pearson r</th>
            <th class="num">Spearman ρ</th>
            <th>Rate of Change (Calculus Slope)</th>
            <th>Plain-English Takeaway for Election Commissioners</th>
          </tr>
        </thead>
        <tbody>
          ${correlations
            .map(
              (corr: Record<string, unknown>) => `
            <tr>
              <td style="width: 22%;">
                <div class="mono accent-red" style="font-size: 8px;">${corr.id} · ${corr.strength}</div>
                <strong>${corr.plainTitle}</strong>
              </td>
              <td class="num"><strong>+${(corr.pearsonR as number).toFixed(3)}</strong></td>
              <td class="num">+${(corr.spearmanRho as number).toFixed(3)}</td>
              <td style="width: 25%;">${corr.rateOfChange}</td>
              <td>${corr.commonManTakeaway}</td>
            </tr>`
            )
            .join('')}
        </tbody>
      </table>

      <div style="margin-top: 14px;">
        <div class="kicker">COUNTY-TO-COUNTY EVANGELISM · HOW COMMISSIONERS SHARE THIS AUDIT WITH NEIGHBORING COUNTIES</div>
        <h2>${toolkit.headline}</h2>
        <p style="margin-bottom: 8px;">${toolkit.subheadline}</p>

        <div class="three-col" style="border-top: 1.5px solid #111111; border-bottom: 1.5px solid #111111; padding: 8px 0; margin-bottom: 10px;">
          ${toolkit.evangelismSteps
            .map(
              (st: Record<string, unknown>) => `
            <div style="border-right: 1px solid #D8D4CC; padding-right: 8px;">
              <div class="mono accent-red" style="font-size: 8.5px;">STEP ${st.step}</div>
              <h3 style="margin-top: 2px;">${st.title}</h3>
              <p style="font-size: 9px; margin-top: 3px;">${st.detail}</p>
            </div>`
            )
            .join('')}
        </div>

        <div class="kicker">TABLE 4.1 · MISSISSIPPI COUNTY PEER BENCHMARKING TIERS</div>
        <table>
          <thead>
            <tr>
              <th>Peer Group Tier</th>
              <th>Representative Mississippi Counties</th>
              <th>Group Benchmark</th>
              <th>Recommended Commissioner Action Recipe</th>
            </tr>
          </thead>
          <tbody>
            ${toolkit.peerTiers
              .map(
                (t: Record<string, unknown>) => `
              <tr>
                <td><strong>${t.tier}</strong></td>
                <td class="mono" style="font-size: 8.2px;">${(t.counties as string[]).join(', ')}</td>
                <td>${t.benchmarkMetric}</td>
                <td>${t.primaryFocus}</td>
              </tr>`
              )
              .join('')}
          </tbody>
        </table>
      </div>
    </div>

    <div class="footer">
      <span>SECTION 03 &amp; 04 · MATHEMATICAL CORRELATIONS &amp; COMMISSIONER EVANGELISM GUIDE</span>
      <span>PAGE 03 OF 10</span>
    </div>
  </div>

  <!-- PAGE 4: 25.91 MILLION VOTING HISTORY FORENSICS -->
  <div class="accent-page">
    <div>
      <div class="masthead">
        <span>SECTION 05 · 25,911,640 VOTING HISTORY CROSS-TABLE REFERENTIAL AUDIT</span>
        <span>SOURCE: WEEKLY DISTRIBUTION VOTINGHISTORY.CSV (1.38 GB)</span>
      </div>

      <div class="kicker">100.00% REFERENTIAL INTEGRITY ACROSS 25.91 MILLION BALLOTS CAST</div>
      <h2>Cross-Table Join: Statewide Voting History vs. Master Voter Roll</h2>
      <p style="margin-bottom: 8px;">
        Every single record in the 25,911,640-row statewide Voting History table was joined against the 2,112,460-row Master Voter Roll by unique Voter ID. Not a single orphaned ballot exists anywhere in the file.
      </p>

      <div class="kpi-strip" style="grid-template-columns: repeat(4, 1fr);">
        <div class="kpi-item">
          <div class="kpi-label">Total Ballots Scanned</div>
          <div class="kpi-val">${votingHistoryAudit.totalHistoryRowsScanned.toLocaleString()}</div>
          <div class="kpi-sub accent-green">0 Orphaned Rows (100% Match)</div>
        </div>
        <div class="kpi-item">
          <div class="kpi-label">Voters With Ballot History</div>
          <div class="kpi-val">${votingHistoryAudit.uniqueVotersWithHistory.toLocaleString()}</div>
          <div class="kpi-sub">79.92% of Registered Roll</div>
        </div>
        <div class="kpi-item">
          <div class="kpi-label">Zero-Vote-History Roll</div>
          <div class="kpi-val">${votingHistoryAudit.votersWithZeroHistory.toLocaleString()}</div>
          <div class="kpi-sub">20.08% Never Cast a Ballot</div>
        </div>
        <div class="kpi-item">
          <div class="kpi-label">2024 Same-Day Dup Credits</div>
          <div class="kpi-val accent-red">${votingHistoryAudit.duplicate2024SameDayCreditRows}</div>
          <div class="kpi-sub">Across ${votingHistoryAudit.unique2024GeneralVoters.toLocaleString()} 2024 Voters</div>
        </div>
      </div>

      <div class="kicker" style="margin-top: 8px;">TABLE 5.1 · VERIFIED STATEWIDE GENERAL ELECTION TURNOUT LEDGER (2008–2024)</div>
      <table>
        <thead>
          <tr>
            <th>Election Date</th>
            <th>Statewide General Election Cycle</th>
            <th class="num">Verified Ballots Recorded</th>
            <th>Roll Referential Integrity Status</th>
          </tr>
        </thead>
        <tbody>
          ${votingHistoryAudit.majorElections
            .map(
              (el: Record<string, unknown>) => `
            <tr>
              <td class="mono"><strong>${el.date}</strong></td>
              <td><strong>${el.label}</strong></td>
              <td class="num"><strong>${(el.ballotsRecorded as number).toLocaleString()}</strong></td>
              <td class="mono accent-green">100.00% Matched to Registered Voter ID</td>
            </tr>`
            )
            .join('')}
        </tbody>
      </table>

      <div class="two-col" style="margin-top: 12px;">
        <div>
          <div class="kicker">BALLOT EVENT CLASSIFICATION BREAKDOWN</div>
          <table>
            <thead>
              <tr>
                <th>Election Event Category</th>
                <th class="num">Historical Ballots</th>
              </tr>
            </thead>
            <tbody>
              ${Object.entries(votingHistoryAudit.electionTypeBreakdown)
                .slice(0, 7)
                .map(
                  ([k, v]) => `
                <tr>
                  <td>${k}</td>
                  <td class="num">${(v as number).toLocaleString()}</td>
                </tr>`
                )
                .join('')}
            </tbody>
          </table>
        </div>
        <div>
          <div class="kicker">PLAIN-ENGLISH INTERPRETATION OF THE 88 DUPLICATE CREDITS</div>
          <div class="callout-hairline">
            <h3>What Are the 88 Duplicate Same-Day Credit Rows on 11/05/2024?</h3>
            <p style="margin-top: 4px;">
              Out of <strong>1,213,364 unique citizens</strong> credited with voting in the November 5, 2024 Presidential General Election, exactly <strong>87 Voter IDs (88 excess rows, 0.007%)</strong> were logged twice on the same election date in the history table.
            </p>
            <p style="margin-top: 5px;">
              In SEMS administration, this occurs when a county scans a pollbook barcode batch and also manually posts an absentee or affidavit credit batch for the same voter ID. Isolating those 87 IDs lets Circuit Clerks deduplicate the credit log in minutes.
            </p>
          </div>
        </div>
      </div>
    </div>

    <div class="footer">
      <span>SECTION 05 · 25.91 MILLION VOTING HISTORY FORENSICS</span>
      <span>PAGE 04 OF 10</span>
    </div>
  </div>

  <!-- PAGE 5: PLAYBOOKS 01 & 02 (HIGH-DENSITY PARCELS & MISSING DORM UNITS) -->
  <div class="accent-page">
    <div>
      <div class="masthead">
        <span>SECTION 06 &amp; 07 · PLAYBOOK 01 (HIGH-DENSITY PARCELS) &amp; PLAYBOOK 02 (MISSING DORM/UNIT #)</span>
        <span>AXIS X · SPATIAL DOMICILE COMPRESSION</span>
      </div>

      <div class="kicker">PLAYBOOK 01 · SEPARATING UNIVERSITIES &amp; NURSING HOMES FROM SINGLE-FAMILY HOUSES</div>
      <h2>1,598 High-Density Addresses (≥8 Voters) Stratified by Facility Type</h2>
      <p style="margin-bottom: 6px;">
        After normalizing whitespace across street strings, 1,598 parcels carry 8+ voters (24,905 total; 1,070 parcels with ≥8 Active voters). Separating <strong>56 Institutional/University hubs (6,788 voters)</strong> and <strong>103 Apartment complexes (2,555 voters)</strong> isolates the <strong>1,439 Single-Family houses (15,562 voters)</strong> where prior tenants moved without updating their registration.
      </p>

      <div class="two-col">
        <div>
          <div class="kicker">TABLE 6.1 · TOP INSTITUTIONAL &amp; UNIVERSITY HUBS</div>
          <table>
            <thead>
              <tr>
                <th>Address &amp; City</th>
                <th>County</th>
                <th class="num">Total (Act)</th>
              </tr>
            </thead>
            <tbody>
              ${playbooks.highDensity.topClusters
                .slice(0, 8)
                .map(
                  (c: Record<string, unknown>) => `
                <tr>
                  <td class="mono" style="font-size:8.2px;">${c.address}, ${c.city}</td>
                  <td>${c.county}</td>
                  <td class="num"><strong>${c.occupantCount}</strong> (${c.activeOccupantCount})</td>
                </tr>`
                )
                .join('')}
            </tbody>
          </table>
        </div>
        <div>
          <div class="kicker">TABLE 6.2 · SINGLE-FAMILY ANOMALIES (100-BLOCK MASKED)</div>
          <table>
            <thead>
              <tr>
                <th>Anonymized Residential Block</th>
                <th>County</th>
                <th class="num">Act / Inact</th>
              </tr>
            </thead>
            <tbody>
              ${playbooks.highDensity.topSingleFamilyAnomalies
                .slice(0, 8)
                .map(
                  (c: Record<string, unknown>) => `
                <tr>
                  <td class="mono" style="font-size:8.2px;">${c.address}, ${c.city}</td>
                  <td>${c.county}</td>
                  <td class="num accent-red">${c.occupantCount} (${c.activeOccupantCount}/${c.inactiveOccupantCount})</td>
                </tr>`
                )
                .join('')}
            </tbody>
          </table>
        </div>
      </div>

      <div style="margin-top: 12px;">
        <div class="kicker">PLAYBOOK 02 · WHOLE-WORD REGEX ELIMINATES 4,346 FALSE ALARMS ON "HALL" &amp; "UNIVERSITY" STREETS</div>
        <h2>682 Verified Campus &amp; Multi-Unit Records Missing Room or Apt Numbers</h2>
        <p style="margin-bottom: 6px;">
          Substring matching for <code>"HALL"</code> or <code>"UNIVERSITY"</code> falsely flags homes on <em>Marshall Pl</em>, <em>Halls Ferry Rd</em>, and <em>University Ave</em>. Enforcing whole-word regex boundaries (<code>\b(HALL|DORM|...)\b</code>) and separating college towns from street names eliminated <strong>4,346 false positives</strong>, leaving <strong>682 verified records (502 Active)</strong>:
        </p>

        <table>
          <thead>
            <tr>
              <th>Verified Campus / Dormitory / Multi-Unit Address</th>
              <th>Municipality</th>
              <th>County</th>
              <th class="num">Voters Missing Unit #</th>
            </tr>
          </thead>
          <tbody>
            ${playbooks.missingDorm.campusBreakdown
              .slice(0, 8)
              .map(
                (item: Record<string, unknown>) => `
              <tr>
                <td class="mono"><strong>${item.address}</strong></td>
                <td>${item.city}</td>
                <td>${item.county}</td>
                <td class="num accent-red">${item.voterCount}</td>
              </tr>`
              )
              .join('')}
          </tbody>
        </table>
      </div>
    </div>

    <div class="footer">
      <span>SECTION 06 &amp; 07 · PLAYBOOK 01 (HIGH-DENSITY) &amp; PLAYBOOK 02 (MISSING DORM/UNIT)</span>
      <span>PAGE 05 OF 10</span>
    </div>
  </div>

  <!-- PAGE 6: PLAYBOOKS 03, 04 & 05 (NCOA DRIFT, PO BOXES, CLERICAL ARTIFACTS) -->
  <div class="accent-page">
    <div>
      <div class="masthead">
        <span>SECTION 08, 09 &amp; 10 · NCOA OUT-OF-STATE DRIFT (PB-03), P.O. BOXES (PB-04) &amp; CLERICAL ARTIFACTS (PB-05)</span>
        <span>AXIS Y · IDENTITY &amp; INTERSTATE DRIFT</span>
      </div>

      <div class="two-col">
        <div>
          <div class="kicker">PLAYBOOK 03 · OUT-OF-STATE MAIL FORWARDINGS</div>
          <h2>2,444 Active Voters With Out-of-State Mail</h2>
          <p style="margin-bottom: 6px;">
            While 13,622 total records have an out-of-state mailing address, <strong>11,178 (82.1%) are already marked Inactive</strong> awaiting NVRA removal. Only <strong>2,444 Active voters</strong> require an address confirmation card:
          </p>
          <table>
            <thead>
              <tr>
                <th>Destination State</th>
                <th class="num">Total Roll Records</th>
                <th>Primary Corridor</th>
              </tr>
            </thead>
            <tbody>
              ${Object.entries(playbooks.ncoaRelocations.stateBreakdown)
                .slice(0, 8)
                .map(
                  ([st, cnt]) => `
                <tr>
                  <td class="mono"><strong>${st}</strong></td>
                  <td class="num">${(cnt as number).toLocaleString()}</td>
                  <td>${['TN', 'AL', 'LA', 'AR'].includes(st) ? 'Border Commuter State' : 'Interstate / Military'}</td>
                </tr>`
                )
                .join('')}
            </tbody>
          </table>
        </div>

        <div>
          <div class="kicker">PLAYBOOK 04 · P.O. BOX IN PHYSICAL RESIDENCE LINE</div>
          <h2>339 Non-Physical Residence Entries (186 Active)</h2>
          <p style="margin-bottom: 6px;">
            Only 339 records statewide (337 P.O. Boxes, 2 PMBs) have a post office box typed into the physical residence field instead of the mailing address field:
          </p>
          <table>
            <thead>
              <tr>
                <th>Zero-PII Token</th>
                <th>Recorded Address</th>
                <th>County</th>
                <th class="num">Status</th>
              </tr>
            </thead>
            <tbody>
              ${playbooks.commercialPOBox.samples
                .slice(0, 8)
                .map(
                  (s: Record<string, unknown>) => `
                <tr>
                  <td class="mono">${s.recordToken}</td>
                  <td class="mono" style="font-size:8px;">${s.address}, ${s.city}</td>
                  <td>${s.county}</td>
                  <td class="num mono">${s.status}</td>
                </tr>`
                )
                .join('')}
            </tbody>
          </table>
        </div>
      </div>

      <div style="margin-top: 14px;">
        <div class="kicker">PLAYBOOK 05 · LEGACY DATABASE MIGRATION &amp; CLERICAL TYPOS</div>
        <h2>5,607 Pre-Electronic Date Placeholders (1801 / 0001) &amp; Truncated Name Fields</h2>
        <p style="margin-bottom: 6px;">
          When paper county pollbooks were imported into electronic SEMS records in the early 2000s, missing registration dates were assigned default placeholders (<code>01/01/1801</code> or <code>01/01/0001</code>) or the street placeholder <code>DATAMIGRATION</code> (113 rows in Warren and Simpson Counties):
        </p>
        <table>
          <thead>
            <tr>
              <th>Clerical Artifact Category / Year</th>
              <th class="num">Statewide Record Count</th>
              <th>Plain-English Administrative Explanation &amp; Cleanup Action</th>
            </tr>
          </thead>
          <tbody>
            ${Object.entries(playbooks.clericalTypos.yearBreakdown)
              .slice(0, 7)
              .map(
                ([k, v]) => `
              <tr>
                <td class="mono"><strong>${k}</strong></td>
                <td class="num"><strong>${(v as number).toLocaleString()}</strong></td>
                <td>${
                  k === 'TRUNCATED_NAME_1CHAR'
                    ? 'First or Last name recorded as a single initial; verify against scanned voter registration card.'
                    : k === 'DATAMIGRATION_ADDR'
                    ? 'Legacy county import placeholder string; cross-match against mailing address or 911 parcel table.'
                    : 'Default date assigned during legacy paper-to-digital conversion when original registration year was illegible.'
                }</td>
              </tr>`
              )
              .join('')}
          </tbody>
        </table>
      </div>
    </div>

    <div class="footer">
      <span>SECTION 08, 09 &amp; 10 · PLAYBOOKS 03, 04 &amp; 05</span>
      <span>PAGE 06 OF 10</span>
    </div>
  </div>

  <!-- PAGE 7: PLAYBOOK 06 (SUFFIX-DISAMBIGUATED DUPLICATES) -->
  <div class="accent-page">
    <div>
      <div class="masthead">
        <span>SECTION 11 · PLAYBOOK 06 — GENERATIONAL SUFFIX PROTECTION &amp; DUPLICATE DISAMBIGUATION</span>
        <span>4,404 JR/SR PAIRS PROTECTED · 818 ACTIVE INTRA-ZIP CLUSTERS</span>
      </div>

      <div class="kicker">PROTECTING FATHERS &amp; SONS WHILE ISOLATING TRUE DUPLICATE REGISTRATIONS</div>
      <h2>How Generational Suffix Logic Eliminates 81% of False Duplicate Flags</h2>
      <p style="margin-bottom: 8px;">
        In rural and suburban Mississippi counties, fathers and sons frequently share the exact same First, Middle, and Last name at the same family address—distinguished only by <strong>JR, SR, II, III, or IV</strong>. Marigold explicitly protects <strong>4,404 generational family pairs</strong> before testing for duplicates.
      </p>

      <div class="kpi-strip" style="grid-template-columns: repeat(5, 1fr);">
        <div class="kpi-item">
          <div class="kpi-label">Jr/Sr Pairs Protected</div>
          <div class="kpi-val accent-green">${playbooks.duplicates.generationalPairs.toLocaleString()}</div>
          <div class="kpi-sub">Distinct Family Members</div>
        </div>
        <div class="kpi-item">
          <div class="kpi-label">Intra-ZIP Clusters</div>
          <div class="kpi-val">${playbooks.duplicates.trueDuplicates.toLocaleString()}</div>
          <div class="kpi-sub">Same Name+Suffix+ZIP</div>
        </div>
        <div class="kpi-item">
          <div class="kpi-label">Active–Active Intra-ZIP</div>
          <div class="kpi-val accent-red">${playbooks.duplicates.activeActiveDuplicates}</div>
          <div class="kpi-sub">Priority Clerk Merge</div>
        </div>
        <div class="kpi-item">
          <div class="kpi-label">Active–Inactive Trail</div>
          <div class="kpi-val">${playbooks.duplicates.activeInactiveMoveTrails}</div>
          <div class="kpi-sub">Old Address Already Inact</div>
        </div>
        <div class="kpi-item">
          <div class="kpi-label">Cross-County Active</div>
          <div class="kpi-val">${playbooks.duplicates.crossCountyActiveDuplicates.toLocaleString()}</div>
          <div class="kpi-sub">Verify DOB in SEMS</div>
        </div>
      </div>

      <div class="kicker" style="margin-top: 8px;">TABLE 11.1 · SAMPLE ZERO-PII INTRA-ZIP DUPLICATE CLUSTERS (REDACTED TOKENS)</div>
      <table>
        <thead>
          <tr>
            <th>Cluster ID</th>
            <th>Redacted Identity Token</th>
            <th>Suffix</th>
            <th>County &amp; ZIP</th>
            <th class="num">Records (Act/Inact)</th>
            <th class="num">Addrs</th>
            <th>Forensic Classification</th>
          </tr>
        </thead>
        <tbody>
          ${playbooks.duplicates.sampleClusters
            .slice(0, 12)
            .map(
              (d: Record<string, unknown>) => `
            <tr>
              <td class="mono"><strong>${d.clusterId}</strong></td>
              <td class="mono" style="font-size:8px;">${d.name}</td>
              <td class="mono">${d.suffix}</td>
              <td>${d.county} (${d.zip})</td>
              <td class="num mono">${d.recordCount} (${d.activeRecords}/${d.inactiveRecords})</td>
              <td class="num">${d.distinctAddresses}</td>
              <td>${d.classification}</td>
            </tr>`
            )
            .join('')}
        </tbody>
      </table>

      <div class="callout-hairline" style="margin-top: 10px;">
        <h3>Commissioner Action Guide: Intra-ZIP vs. Cross-County Duplicate Resolution</h3>
        <p style="margin-top: 3px;">
          <strong>1. Intra-ZIP Active–Active (${playbooks.duplicates.activeActiveDuplicates} clusters):</strong> Same First, Middle, Last, and Suffix registered Active at two different street addresses in the same ZIP code (often caused by a voter re-registering after moving across town). Circuit Clerks can verify Date of Birth in SEMS and merge the older record.
        </p>
        <p style="margin-top: 4px;">
          <strong>2. Intra-ZIP Active–Inactive Move Trails (${playbooks.duplicates.activeInactiveMoveTrails} clusters):</strong> The voter's previous address is already marked Inactive while their current address is Active—proving that routine county list maintenance is already working.
        </p>
      </div>
    </div>

    <div class="footer">
      <span>SECTION 11 · PLAYBOOK 06 (SUFFIX-DISAMBIGUATED DUPLICATES)</span>
      <span>PAGE 07 OF 10</span>
    </div>
  </div>

  <!-- PAGE 8: PLAYBOOKS 07, 08 & 09 (SPIKES, PRECINCT CAPACITY & BENFORD'S LAW) -->
  <div class="accent-page">
    <div>
      <div class="masthead">
        <span>SECTION 12 &amp; 13 · REGISTRATION SPIKES (PB-07), MEGA-PRECINCTS (PB-08) &amp; BENFORD'S LAW (PB-09)</span>
        <span>AXIS Z · TEMPORAL SURGE &amp; POLLING PLACE STRAIN</span>
      </div>

      <div class="two-col">
        <div>
          <div class="kicker">PLAYBOOK 07 · STATUTORY REGISTRATION DEADLINES</div>
          <h2>Batch Spikes Match 30-Day Cutoff Dates</h2>
          <p style="margin-bottom: 6px;">
            Mississippi's largest single-day registration volumes occur exactly on the statutory 30-day mail-in cutoff prior to Presidential General Elections:
          </p>
          <table>
            <thead>
              <tr>
                <th>Registration Date</th>
                <th class="num">Registrations</th>
                <th>Statutory Cycle</th>
              </tr>
            </thead>
            <tbody>
              ${playbooks.registrationSpikes.peakDates
                .slice(0, 8)
                .map(
                  (pk: Record<string, unknown>) => `
                <tr>
                  <td class="mono"><strong>${pk.date}</strong></td>
                  <td class="num"><strong>${(pk.count as number).toLocaleString()}</strong></td>
                  <td>${
                    String(pk.date).endsWith('2020') || String(pk.date).endsWith('2008') || String(pk.date).endsWith('2016') || String(pk.date).endsWith('2024') || String(pk.date).endsWith('2012')
                      ? 'Presidential 30-Day Cutoff'
                      : 'SEMS Legacy / Gubernatorial Batch'
                  }</td>
                </tr>`
                )
                .join('')}
            </tbody>
          </table>
        </div>

        <div>
          <div class="kicker">PLAYBOOK 08 · MEGA-PRECINCT CAPACITY (&gt;3,000 VOTERS)</div>
          <h2>123 Precincts Exceed 3,000 Voters (27 &gt; 5,000)</h2>
          <p style="margin-bottom: 6px;">
            Suburban growth in Madison, DeSoto, Harrison, and Rankin Counties has pushed 123 polling places above the 3,000-voter benchmark:
          </p>
          <table>
            <thead>
              <tr>
                <th>Precinct</th>
                <th>County</th>
                <th class="num">Total (Active)</th>
              </tr>
            </thead>
            <tbody>
              ${playbooks.precinctCapacity.topOverCapacity
                .slice(0, 8)
                .map(
                  (p: Record<string, unknown>) => `
                <tr>
                  <td class="mono" style="font-size:8px;">${p.precinctCode} ${p.precinctName}</td>
                  <td>${p.county}</td>
                  <td class="num accent-red">${(p.voterCount as number).toLocaleString()} (${(p.activeVoterCount as number).toLocaleString()})</td>
                </tr>`
                )
                .join('')}
            </tbody>
          </table>
        </div>
      </div>

      <div style="margin-top: 14px;">
        <div class="kicker">PLAYBOOK 09 · NEWCOMB-BENFORD FIRST-DIGIT DISTRIBUTION (TOTAL ROLL VS. 2024 TURNOUT)</div>
        <h2>Why Total Precinct Roll Passes (χ² = 6.94) While Turnout Clusters at Digits 2, 3, and 4</h2>
        <p style="margin-bottom: 6px;">
          Across all 1,742 precincts, total voter registration spans four orders of magnitude (from 10 to 9,105 voters) and conforms closely to Benford's Law (<strong>χ² = 6.94 &lt; 15.51 critical value — PASS</strong>). By contrast, 2024 General Election precinct turnout yields <strong>χ² = 71.15</strong> because County Election Commissions intentionally size precincts to hold 1,000–2,500 voters, causing Election Day turnout to cluster naturally between 200 and 499 ballots (leading digits 2, 3, and 4).
        </p>

        <table>
          <thead>
            <tr>
              <th>Leading Digit d</th>
              <th class="num">Benford Theoretical %</th>
              <th class="num">Total Roll Observed %</th>
              <th class="num">Total Roll Precincts</th>
              <th class="num">2024 Turnout Observed %</th>
              <th>Mathematical Interpretation</th>
            </tr>
          </thead>
          <tbody>
            ${[1, 2, 3, 4, 5, 6, 7, 8, 9]
              .map((d) => {
                const k = String(d);
                return `
              <tr>
                <td class="mono"><strong>Digit ${d}</strong></td>
                <td class="num">${playbooks.benfordsLaw.expected[k]}%</td>
                <td class="num accent-green">${playbooks.benfordsLaw.observedPct[k]}%</td>
                <td class="num">${playbooks.benfordsLaw.digits[k]}</td>
                <td class="num">${playbooks.benfordsLaw.turnout2024.observedPct[k]}%</td>
                <td>${
                  d === 1
                    ? 'Natural scale-invariant anchor for total registration roll'
                    : d >= 2 && d <= 4
                    ? 'Statutory precinct sizing sweet spot (200–499 ballots cast)'
                    : 'Tail distribution conforms smoothly across rural precincts'
                }</td>
              </tr>`;
              })
              .join('')}
          </tbody>
        </table>
      </div>
    </div>

    <div class="footer">
      <span>SECTION 12 &amp; 13 · PLAYBOOKS 07, 08 &amp; 09</span>
      <span>PAGE 08 OF 10</span>
    </div>
  </div>

  <!-- PAGE 9: PLAYBOOK 10 — 82-COUNTY MASTER BENCHMARK LEDGER (PART 1: COUNTIES 01–41) -->
  <div class="accent-page">
    <div>
      <div class="masthead">
        <span>SECTION 14 · PLAYBOOK 10 — COMPLETE 82-COUNTY MASTER LEDGER (PART 1: RANK 01 TO 41)</span>
        <span>SORTED BY 3D MANIFOLD SIGNAL ENERGY</span>
      </div>

      <div class="kicker">STATEWIDE PEER BENCHMARKING LEDGER · COUNTIES 01–41</div>
      <h2>Mississippi 82-County Master Hygiene &amp; 3D Manifold Index (Part I)</h2>

      <table style="font-size: 8.3px; margin-top: 4px;">
        <thead>
          <tr>
            <th>#</th>
            <th>County</th>
            <th class="num">Total Roll</th>
            <th class="num">Active</th>
            <th class="num">2024 Votes</th>
            <th class="num">PB-01 HD</th>
            <th class="num">PB-02 Dorm</th>
            <th class="num">PB-03 NCOA</th>
            <th class="num">PB-06 Dup</th>
            <th class="num">PB-08 &gt;3k</th>
            <th class="num">3D &lt;X,Y,Z&gt;</th>
            <th class="num">Signal</th>
            <th>Manifold Regime</th>
          </tr>
        </thead>
        <tbody>
          ${vectorsPage9
            .map(
              (c: Record<string, unknown>, idx: number) => `
            <tr>
              <td class="mono">${String(idx + 1).padStart(2, '0')}</td>
              <td><strong>${c.county}</strong></td>
              <td class="num">${(c.total as number).toLocaleString()}</td>
              <td class="num">${(c.active as number).toLocaleString()}</td>
              <td class="num">${(c.votes2024General as number).toLocaleString()}</td>
              <td class="num">${c.highDensityCount}</td>
              <td class="num">${c.missingDormCount}</td>
              <td class="num">${c.ncoaCount}</td>
              <td class="num">${c.duplicateCount}</td>
              <td class="num">${c.overCapacityPrecincts}</td>
              <td class="num">&lt;${c.x},${c.y},${c.z}&gt;</td>
              <td class="num ${(c.threatEnergy as number) >= 52 ? 'accent-red' : 'accent-green'}">${c.threatEnergy}</td>
              <td>${c.regime}</td>
            </tr>`
            )
            .join('')}
        </tbody>
      </table>
    </div>

    <div class="footer">
      <span>SECTION 14 · PLAYBOOK 10 — 82-COUNTY MASTER BENCHMARK LEDGER (COUNTIES 01–41)</span>
      <span>PAGE 09 OF 10</span>
    </div>
  </div>

  <!-- PAGE 10: PLAYBOOK 10 — 82-COUNTY MASTER BENCHMARK LEDGER (PART 2: COUNTIES 42–82) -->
  <div class="accent-page">
    <div>
      <div class="masthead">
        <span>SECTION 14 · PLAYBOOK 10 — COMPLETE 82-COUNTY MASTER LEDGER (PART 2: RANK 42 TO 82)</span>
        <span>100% ZERO-PII COMPLIANCE ATTESTATION</span>
      </div>

      <div class="kicker">STATEWIDE PEER BENCHMARKING LEDGER · COUNTIES 42–82</div>
      <h2>Mississippi 82-County Master Hygiene &amp; 3D Manifold Index (Part II)</h2>

      <table style="font-size: 8.3px; margin-top: 4px;">
        <thead>
          <tr>
            <th>#</th>
            <th>County</th>
            <th class="num">Total Roll</th>
            <th class="num">Active</th>
            <th class="num">2024 Votes</th>
            <th class="num">PB-01 HD</th>
            <th class="num">PB-02 Dorm</th>
            <th class="num">PB-03 NCOA</th>
            <th class="num">PB-06 Dup</th>
            <th class="num">PB-08 &gt;3k</th>
            <th class="num">3D &lt;X,Y,Z&gt;</th>
            <th class="num">Signal</th>
            <th>Manifold Regime</th>
          </tr>
        </thead>
        <tbody>
          ${vectorsPage10
            .map(
              (c: Record<string, unknown>, idx: number) => `
            <tr>
              <td class="mono">${String(idx + 42).padStart(2, '0')}</td>
              <td><strong>${c.county}</strong></td>
              <td class="num">${(c.total as number).toLocaleString()}</td>
              <td class="num">${(c.active as number).toLocaleString()}</td>
              <td class="num">${(c.votes2024General as number).toLocaleString()}</td>
              <td class="num">${c.highDensityCount}</td>
              <td class="num">${c.missingDormCount}</td>
              <td class="num">${c.ncoaCount}</td>
              <td class="num">${c.duplicateCount}</td>
              <td class="num">${c.overCapacityPrecincts}</td>
              <td class="num">&lt;${c.x},${c.y},${c.z}&gt;</td>
              <td class="num accent-green">${c.threatEnergy}</td>
              <td>${c.regime}</td>
            </tr>`
            )
            .join('')}
        </tbody>
      </table>

      <div class="callout-hairline" style="margin-top: 8px;">
        <div style="display:flex; justify-content:space-between; align-items:center;">
          <div>
            <div class="kicker" style="margin-bottom:1px;">METHODOLOGY &amp; PRIVACY ATTESTATION</div>
            <p style="font-size: 8.8px;">
              <strong>Zero-PII Guarantee:</strong> All 2,112,460 Voter Roll rows and 25,911,640 Voting History rows were processed using deterministic mathematical algorithms. Zero personal names, birth dates, unmasked Voter IDs, or private single-family street numbers appear in this publication. Interactive Three.js 3D Manifold available at <strong>marigoldinsights.org/manifold</strong>.
            </p>
          </div>
          <div class="mono" style="text-align:right; font-size:8px; color:#333; min-width: 190px;">
            <div>EDITION: ACCÉNT DRAFT 2</div>
            <div>RECORDS: 28,024,100 TOTAL</div>
            <div>COUNTIES: ALL 82 MS COUNTIES</div>
          </div>
        </div>
      </div>
    </div>

    <div class="footer">
      <span>MARIGOLD ELECTION HYGIENE · ACCÉNT EDITORIAL EDITION (DRAFT 2 · INK-SAVING PRINT)</span>
      <span>PAGE 10 OF 10</span>
    </div>
  </div>

  <script>
    // Draw Ink-Saving High-Contrast Isometric 3D Manifold Diagram on Page 2
    (function() {
      const canvas = document.getElementById('manifold-3d-canvas');
      if (!canvas) return;
      const ctx = canvas.getContext('2d');
      const w = canvas.width;
      const h = canvas.height;
      ctx.fillStyle = '#FFFFFF';
      ctx.fillRect(0, 0, w, h);

      const vectors = ${JSON.stringify(threatManifold.countyVectors)};
      const grid = ${JSON.stringify(threatManifold.surfaceGrid)};

      function project(x, y, z) {
        const nx = (x - 50) / 50;
        const ny = (y - 50) / 50;
        const nz = (z - 35) / 50;
        const angleZ = 0.68;
        const angleX = 1.12;
        const rx = nx * Math.cos(angleZ) - ny * Math.sin(angleZ);
        const ry = nx * Math.sin(angleZ) + ny * Math.cos(angleZ);
        const py = ry * Math.cos(angleX) - nz * Math.sin(angleX);
        return {
          sx: w * 0.48 + rx * 310,
          sy: h * 0.62 + py * 115
        };
      }

      // Draw Equilibrium Surface Wireframe Grid (Clean Sage Hairlines on White)
      ctx.strokeStyle = '#94A39B';
      ctx.lineWidth = 1;
      for (let i = 0; i < grid.length; i++) {
        ctx.beginPath();
        for (let j = 0; j < grid[i].length; j++) {
          const p = project(grid[i][j].x, grid[i][j].y, grid[i][j].z);
          if (j === 0) ctx.moveTo(p.sx, p.sy);
          else ctx.lineTo(p.sx, p.sy);
        }
        ctx.stroke();
      }
      for (let j = 0; j < grid[0].length; j++) {
        ctx.beginPath();
        for (let i = 0; i < grid.length; i++) {
          const p = project(grid[i][j].x, grid[i][j].y, grid[i][j].z);
          if (i === 0) ctx.moveTo(p.sx, p.sy);
          else ctx.lineTo(p.sx, p.sy);
        }
        ctx.stroke();
      }

      // Draw County Vectors & Vertical Residual Stems
      vectors.slice().reverse().forEach((c) => {
        const pt = project(c.x, c.y, c.z);
        const base = project(c.x, c.y, c.manifoldZ);
        const isDetached = c.threatEnergy >= 52 || c.geodesicDistance >= 18;

        if (isDetached) {
          ctx.strokeStyle = '#D9381E';
          ctx.lineWidth = 1.2;
          ctx.beginPath();
          ctx.moveTo(base.sx, base.sy);
          ctx.lineTo(pt.sx, pt.sy);
          ctx.stroke();
        }

        ctx.beginPath();
        ctx.arc(pt.sx, pt.sy, isDetached ? 5.5 : 3.2, 0, Math.PI * 2);
        ctx.fillStyle = isDetached ? '#D9381E' : '#15803D';
        ctx.fill();
        ctx.strokeStyle = '#FFFFFF';
        ctx.lineWidth = 1;
        ctx.stroke();

        if (c.threatEnergy >= 55) {
          ctx.fillStyle = '#111111';
          ctx.font = 'bold 11px "JetBrains Mono", monospace';
          ctx.fillText(c.county + ' (' + c.threatEnergy + ')', pt.sx + 8, pt.sy + 3);
        }
      });

      // Axis Callouts
      ctx.fillStyle = '#111111';
      ctx.font = 'bold 11px "JetBrains Mono", monospace';
      ctx.fillText('AXIS X: ADDRESS CROWDING (d_rho/dx) ->', 24, h - 16);
      ctx.fillText('AXIS Y: OUT-OF-STATE & DUPLICATE DRIFT (dS/dy) ->', w - 380, h - 16);
      ctx.fillText('^ AXIS Z: POLLING PLACE STRAIN (d2V/dt2)', 24, 22);
    })();
  </script>
</body>
</html>`;

  await page.setContent(htmlContent, { waitUntil: 'networkidle', timeout: 30000 });
  await page.evaluate(() => document.fonts.ready);
  await page.waitForTimeout(500);

  const pdfBuffer = await page.pdf({
    format: 'Letter',
    printBackground: true,
    preferCSSPageSize: true,
    margin: { top: 0, bottom: 0, left: 0, right: 0 },
  });

  const destDownloads = '/Users/kendallkylecyree/Downloads/Marigold-Mississippi-Playbook-Analysis.pdf';
  const destPublic = path.resolve(__dirname, '../public/Marigold-Mississippi-Playbook-Analysis.pdf');
  const destDevPublic = '/Users/kendallkylecyree/Developer/marigold/public/Marigold-Mississippi-Playbook-Analysis.pdf';

  fs.writeFileSync(destDownloads, pdfBuffer);
  fs.writeFileSync(destPublic, pdfBuffer);
  if (fs.existsSync('/Users/kendallkylecyree/Developer/marigold/public')) {
    fs.writeFileSync(destDevPublic, pdfBuffer);
  }

  const pageMatches = pdfBuffer.toString('latin1').match(/\/Type\s*\/Page\b/g) || [];
  console.log(`✅ Generated 10-Page Accént Editorial (Draft 2 Ink-Saving) PDF (${(pdfBuffer.length / 1024).toFixed(1)} KB, ${pageMatches.length} pages):`);
  console.log(`   1. ${destDownloads}`);
  console.log(`   2. ${destPublic}`);

  await browser.close();
}

generateMississippiPdf().catch((err) => {
  console.error('❌ PDF generation failed:', err);
  process.exit(1);
});
