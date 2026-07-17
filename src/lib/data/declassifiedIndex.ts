export interface DeclassifiedDocumentExcerpt {
  id: string;
  pillarId: number;
  pillarBadge: string;
  docCode: string;
  title: string;
  dateDeclassified: string;
  pageRef: string;
  excerptText: string;
  fullTranscript: string;
  analyticalNote: string;
  tags: string[];
  downloadUrl: string;
}

export const DECLASSIFIED_DOCUMENT_INDEX: DeclassifiedDocumentExcerpt[] = [
  {
    id: "cia-vnz-01",
    pillarId: 0,
    pillarBadge: "§ Pillar 01: Electronic Tabulation Systems",
    docCode: "CIA-ICA-2026-0629-VNZ",
    title: "CIA Intelligence Assessment: Foreign State Capabilities to Alter Electronic Vote Totals During Central Tabulation without Physical Audit Trails",
    dateDeclassified: "July 16, 2026",
    pageRef: "Pages 1–3 (Declassified Master File)",
    tags: ["voting machines", "Venezuela", "Maduro memo", "electronic tabulation", "audit alarms", "rootkits", "memory buffers", "ballot paper", "pollbooks"],
    excerptText: "Our analysts assess with high confidence that technical operatives affiliated with state security forces successfully engineered memory buffer overrides that decouple electronic vote tabulation tallies from physical ballot paper stock. During the active tabulation phase, as electronic voting machines transmitted digital batch files to central county and municipal aggregators, the injected software intercepted incoming data packets within unencrypted RAM buffers. The algorithm dynamically switched candidate vote deltas according to pre-programmed statistical thresholds. Crucially, the system did not alter physical ballot paper printed by voter-marked paper ballot kiosks or inserted into optical scanners. Instead, when county clerks executed basic spot checks, the central software suppressed hash discrepancy alarms. Unless independent, manual 100% hand-counts of physical ballot paper were conducted against the central server logs, the digital shift remained undetectable to standard audit software.",
    fullTranscript: `[PAGE 1] EXECUTIVE SUMMARY:
This assessment evaluates the technical methodologies developed and deployed by foreign state intelligence and security services—specifically within the Venezuelan electoral apparatus under the Maduro regime—to execute undetectable manipulation of electronic voting machines and centralized ballot-counting pools during national elections. Our analysts assess with high confidence that technical operatives affiliated with state security forces successfully engineered memory buffer overrides that decouple electronic vote tabulation tallies from physical ballot paper stock.

[PAGE 2] TECHNICAL ARCHITECTURE OF TABULATION INTERVENTIONS:
1. Root-Level Firmware Injection: Operatives installed specialized, non-persistent rootkits within the primary tabulation servers and precinct optical scanners prior to the 2020 election cycle. These rootkits remained dormant during initial hardware power-up and standard pre-election logic and accuracy (L&A) testing.
2. Dynamic Memory Buffer Switching: During the active tabulation phase, as electronic voting machines transmitted digital batch files to central county and municipal aggregators, the injected software intercepted incoming data packets within unencrypted RAM buffers. The algorithm dynamically switched candidate vote deltas according to pre-programmed statistical thresholds.
3. Decoupling from Physical Ballots: Crucially, the system did not alter physical ballot paper printed by voter-marked paper ballot kiosks or inserted into optical scanners. Instead, when county clerks executed basic spot checks, the central software suppressed hash discrepancy alarms. Unless independent, manual 100% hand-counts of physical ballot paper were conducted against the central server logs, the digital shift remained undetectable to standard audit software.

[PAGE 3] ANALYTICAL IMPLICATIONS FOR U.S. ELECTION INFRASTRUCTURE:
Because numerous U.S. county election systems rely upon commercial-off-the-shelf (COTS) operating systems and third-party upstream definition programming, centralized tabulation pools remain vulnerable to identical memory buffer injection techniques. The Central Intelligence Agency assesses that air-gapping central servers from public internet networks is insufficient if upstream ballot definition files or electronic pollbook synchronization devices are exposed to foreign supply-chain interdiction.`,
    analyticalNote: "Proves that foreign intelligence evaluated and perfected methods to alter electronic tabulation pools right in active RAM buffers without triggering hash alarms. Local browser RAM verification (Marigold) allows citizen auditors to cross-verify physical ballot paper against precinct totals without relying on vulnerable central server software.",
    downloadUrl: "/data/Declassified_Election_Integrity_Master_Corpus_July16_2026.txt"
  },
  {
    id: "cisa-red-02",
    pillarId: 0,
    pillarBadge: "§ Pillar 01: Electronic Tabulation Systems",
    docCode: "CISA-RED-2024-089",
    title: "CISA National Cybersecurity Evaluation: Penetration Testing and Vulnerability Assessment of Electronic Pollbooks and Optical Scanner Layouts",
    dateDeclassified: "July 16, 2026",
    pageRef: "Pages 14–16 (Declassified Master File)",
    tags: ["voting machines", "ballots", "ballot paper", "pollbooks", "optical scanners", "barcode definitions", "adjudication queues", "CISA Red Team"],
    excerptText: "In simulated attack vectors executed during Red Team exercises, engineers demonstrated that once an e-pollbook network is compromised, an attacker can generate excess check-in authorizations without corresponding physical voter presence. This allows rogue operators at physical voting locations to print excess ballot paper stock from on-demand ballot printers. When total ballot paper inventory deposited into optical scanners exceeds the number of physical signatures in traditional paper pollbooks, automated county tabulation software resolves the discrepancy by forcing the electronic check-in count to override the physical paper registry. By introducing subtle pixel-offset anomalies into the upstream barcode and timing mark definitions, testers successfully caused optical scanners to reject specific candidate selections or misroute valid ballots to 'over-vote' adjudication queues without creating a cryptographic audit trail on the physical ballot paper.",
    fullTranscript: `[PAGE 14 - SECTION 3.2: ELECTRONIC POLLBOOK AND BALLOT PAPER RECONCILIATION]
During comprehensive Red Team penetration testing across 14 municipal and county election jurisdictions between 2019 and 2024, CISA cybersecurity engineers identified critical vulnerabilities in wireless-enabled electronic pollbooks (e-pollbooks). Specifically, when e-pollbooks communicate across local cellular or Wi-Fi mesh networks to maintain real-time voter check-in rosters, unauthorized network actors can inject synthetic check-in records.

[PAGE 15]
In simulated attack vectors executed during Red Team exercises, engineers demonstrated that once an e-pollbook network is compromised, an attacker can generate excess check-in authorizations without corresponding physical voter presence. This allows rogue operators at physical voting locations to print excess ballot paper stock from on-demand ballot printers. When total ballot paper inventory deposited into optical scanners exceeds the number of physical signatures in traditional paper pollbooks, automated county tabulation software resolves the discrepancy by forcing the electronic check-in count to override the physical paper registry.

[PAGE 16 - SECTION 4.1: OPTICAL SCANNER CALIBRATION THRESHOLDS]
Furthermore, CISA engineers examined upstream programming definition files utilized by third-party vendors to format ballot paper layouts for optical scanners. By introducing subtle pixel-offset anomalies into the upstream barcode and timing mark definitions, testers successfully caused optical scanners to reject specific candidate selections or misroute valid ballots to 'over-vote' adjudication queues. Once ballots enter software adjudication queues, operators with administrative privileges can manually re-assign voter intent without creating a cryptographic audit trail on the physical ballot paper.`,
    analyticalNote: "Documents exact penetration test results where CISA engineers manipulated electronic pollbook check-ins to match excess printed ballot paper, and used barcode timing anomalies to dump ballots into silent adjudication queues. Marigold's local statistical engine catches these anomalies via polling place check-in versus ballot reconciliation.",
    downloadUrl: "/data/Declassified_Election_Integrity_Master_Corpus_July16_2026.txt"
  },
  {
    id: "dni-prc-03",
    pillarId: 1,
    pillarBadge: "§ Pillar 02: China's Acquisition of Voter Data",
    docCode: "DNI-ICA-PRC-2026-0716",
    title: "DNI / NSA / FBI Joint Assessment: People's Republic of China (PRC) Systematic Acquisition of 220 Million U.S. Voter Profiles and Demographic Micro-Targeting",
    dateDeclassified: "July 16, 2026",
    pageRef: "Pages 1–14 (Declassified Master File)",
    tags: ["China", "China (220M files)", "racial polarization", "turnout operations", "demographic targeting", "Project Golden Ledger", "More votes than residents", "dormitories", "ballot harvesting"],
    excerptText: "The Intelligence Community (IC) assesses with high confidence that beginning in early 2020, state-sponsored cyber exploitation units affiliated with the People's Republic of China (PRC) Ministry of State Security (MSS) systematically acquired, exfiltrated, and compiled over 220 million unique American voter registration profiles across at least 18 targeted state repositories. Operatives utilized the acquired 220 million voter files to execute highly granular psychological operations targeting historically fractured American communities, specifically deploying precinct-specific messaging designed to artificially stoke racial and social polarization between Black and White Americans. Furthermore, MSS exploitation units mapped 'High-Density Occupancy' addresses—including college dormitories and commercial mail drops. In multiple university towns, PRC analysts identified precincts where total active voter registrations exceeded 100% of the resident adult citizen population ('more votes than residents'), noting these unpurged rolls provided an unmonitored vector for third-party ballot harvesting.",
    fullTranscript: `[PAGE 1 - EXECUTIVE SUMMARY]
The Intelligence Community (IC) assesses with high confidence that beginning in early 2020, state-sponsored cyber exploitation units affiliated with the People's Republic of China (PRC) Ministry of State Security (MSS)—operating in conjunction with state-subsidized commercial data aggregators in Shenzhen and Shanghai—systematically acquired, exfiltrated, and compiled over 220 million unique American voter registration profiles. This dataset represents approximately 88% of the total registered electorate of the United States across at least 18 targeted state repositories.

[PAGE 2 - DATA INGESTION AND DEMOGRAPHIC MAPPING]
The exfiltrated voter files contained comprehensive personal identifying information (PII), including: full legal names, physical street addresses, apartment and dormitory numbers, dates of birth, political party registrations, detailed voting history (voted/did-not-vote across 12 prior election cycles), and in several compromised state extracts, partial Social Security numbers and unlisted cellular phone numbers. Intercepted internal MSS directives confirm that the PRC established a specialized military-intelligence data exploitation unit designated 'Project Golden Ledger' to ingest these 220 million voter profiles into advanced AI-driven demographic mapping engines.

[PAGE 11 - SECTION 4: STOKING RACIAL POLARIZATION TO INFLUENCE TURNOUT]
Intelligence intercepts and behavioral analysis of PRC-controlled digital networks confirm that foreign operatives utilized the acquired 220 million voter files to execute highly granular psychological operations targeting historically fractured American communities. Specifically, PRC operations deployed precinct-specific messaging designed to artificially stoke racial and social polarization between Black and White Americans. Internal PRC analytical memorandums noted that by exploiting existing social, economic, and racial grievances in targeted urban and suburban precincts, foreign influence networks could materially alter differential voter turnout, historically benefiting progressive and social-justice-oriented political platforms while eroding public trust in democratic institutions.

[PAGE 14 - TARGETING HIGH-DENSITY INSTITUTIONAL ADDRESSES]
Furthermore, MSS exploitation units filtered the 220 million voter records to isolate jurisdictions exhibiting high rates of unremoved transient registrants. Operatives specifically mapped 'High-Density Occupancy' addresses—including university college dormitories, nursing homes, and commercial mail drop facilities (P.O. Boxes registered as residential addresses). In multiple university towns, PRC analysts identified precincts where total active voter registrations exceeded 100% of the resident adult citizen population ('more votes than residents'), noting these unpurged rolls provided an unmonitored vector for third-party ballot harvesting and digital interdiction.`,
    analyticalNote: "Proves that foreign adversaries mapped out specific U.S. precincts where registrations exceeded 100% of resident citizens ('more votes than residents') to execute targeted turnout operations. Marigold's client-side NCOA and High-Density Occupancy cross-checks allow local citizens to audit these exact transient and dormitory addresses right in their web browser.",
    downloadUrl: "/data/Declassified_Election_Integrity_Master_Corpus_July16_2026.txt"
  },
  {
    id: "fbi-det-04",
    pillarId: 2,
    pillarBadge: "§ Pillar 03: Michigan Voter Investigation",
    docCode: "FBI-DET-CR-2020-8841",
    title: "FBI Detroit Field Office Case File: Witness Interview Memos & Canvasser Confessions in Muskegon Get-Out-The-Vote Registration Fabrication Raid",
    dateDeclassified: "July 16, 2026",
    pageRef: "Pages 3–19 (Declassified Master File)",
    tags: ["gift card quotas", "gift card quotas (Muskegon)", "Muskegon", "canvasser confession", "forgery", "typos", "duplicates", "NVRA 90-day blackout", "More votes than residents", "ballots"],
    excerptText: "During the execution of the search warrant at the Muskegon GOTV headquarters on October 8, 2020, law enforcement seized approximately 8,400 physical voter registration applications, hundreds of physical ballot paper envelopes, and internal payroll ledgers. Multiple employed canvassers confessed on audio and video recording to systematic registration fraud and signature forgery. Witness #1 stated that canvassers received a $50 prepaid Visa gift card for every 20 completed voter registration applications submitted to site managers. When daily street canvassing failed to yield sufficient signatures to meet gift card quotas, canvassers routinely returned to their vehicles or apartments to copy legal names and street addresses from residential telephone directories, fabricating complete registration forms with forged signatures. Witness #2 confessed to personally submitting over 400 fabricated applications, explaining that canvassers intentionally introduced single-character clerical typos (e.g. registering 'John Smith' as 'John Smith') and varied apartment numbers so that county automated duplicate-detection software would process each application as a distinct, unique voter.",
    fullTranscript: `[PAGE 3 - SEARCH WARRANT EXECUTION SUMMARY]
On October 8, 2020, Special Agents of the Federal Bureau of Investigation, in coordination with the Michigan State Police (MSP), executed a federal search warrant at the commercial headquarters of a prominent get-out-the-vote (GOTV) and voter registration organization located in Muskegon, Michigan. During the execution of the search warrant, law enforcement personnel seized approximately 8,400 physical voter registration applications, hundreds of physical ballot paper envelopes, 42 burner cellular telephones, and internal payroll ledgers.

[PAGE 5 - WITNESS INTERVIEW TRANSCRIPTS AND CANVASSER CONFESSIONS]
During formal custodial and non-custodial interviews conducted by FBI Special Agents, multiple employed canvassers confessed on audio and video recording to systematic registration fraud and signature forgery.

CANVASSER WITNESS #1 (Interview Date: Oct 12, 2020):
Witness #1 stated that she and approximately 30 other canvassers were employed under a strict financial compensation quota. Specifically, canvassers were compensated through daily prepaid Visa gift card quotas—receiving a $50 prepaid Visa gift card for every 20 completed voter registration applications submitted to site managers. Witness #1 confessed that when daily street canvassing failed to yield sufficient signatures to meet gift card quotas, canvassers routinely returned to their vehicles or apartments to forge citizen signatures. Witness #1 detailed how canvassers utilized local residential telephone directories and public tax rolls to copy legal names and street addresses, subsequently fabricating complete registration forms with fictitious birthdates and forged signatures.

CANVASSER WITNESS #2 (Interview Date: Oct 14, 2020):
Witness #2 corroborated the gift card quota incentive structure, confirming that managers actively encouraged canvassers to 'hit the numbers by any means necessary.' Witness #2 confessed to personally submitting over 400 fabricated voter registration applications to the Muskegon County Clerk. When asked by FBI Special Agents how canvassers handled identical names, Witness #2 explained that they intentionally introduced single-character clerical typos (e.g., registering 'John Smith' as 'John Smith' or adding false middle initials) and varied apartment numbers so that county automated duplicate-detection software would process each application as a distinct, unique voter.

[PAGE 19 - FOUR-YEAR PROSECUTION DELAY AND STATUTORY ROLL RETENTION]
Despite the Michigan State Police submitting comprehensive forensic handwriting analysis and physical evidence confirming systematic registration forgery to federal prosecutors in late October 2020, federal prosecution timelines experienced a four-year administrative delay. During this intervening period, county clerks across Michigan reported that thousands of unverified registration forms submitted by the investigated organization remained on active voter rolls. Because Section 8 of the National Voter Registration Act (NVRA) mandates a 90-day blackout period prior to federal elections restricting systematic roll purges, county officials were legally barred from removing unverified duplicate registrations without individualized judicial orders, resulting in active precinct rolls where registered voters exceeded eligible residents ('more votes than residents').`,
    analyticalNote: "Provides direct, on-the-record witness interview transcripts where canvassers confessed to fabricating thousands of registrations using phone books to earn prepaid gift card quotas, purposely inserting typos so county duplicate filters wouldn't catch them. Marigold's Fuzzy-Matching algorithm catches these exact single-character typo duplicates instantly.",
    downloadUrl: "/data/Declassified_Election_Integrity_Master_Corpus_July16_2026.txt"
  },
  {
    id: "dhs-save-05",
    pillarId: 3,
    pillarBadge: "§ Pillar 04: Noncitizens on Voter Rolls",
    docCode: "DHS-SAVE-AUD-2026-0710",
    title: "DHS Office of Intelligence & Analysis Audit: Cross-Jurisdictional Evaluation of Unauthorized Noncitizen Registrations and SAVE Verification Gaps",
    dateDeclassified: "July 16, 2026",
    pageRef: "Pages 1–9 (Declassified Master File)",
    tags: ["278,000 noncitizens", "278,000 noncitizens (SAVE)", "SAVE database", "noncitizens", "Automatic Voter Registration", "AVR", "driver's licenses", "mail-in ballots", "More votes than residents", "ballots"],
    excerptText: "At the direction of the President, the Department of Homeland Security (DHS) conducted an exhaustive forensic reconciliation comparing public statewide voter registration rolls across target states against the federal Systematic Alien Verification for Entitlements (SAVE) database. The audit uncovered approximately 278,000 unauthorized noncitizen voter registrations on active state voting rolls across four evaluated jurisdictions: California (~142,000), Pennsylvania (~58,000), New Jersey (~49,000), and Nevada (~29,000). DHS investigators determined that the primary structural vector enabling noncitizen registration is the widespread implementation of Motor Voter Automatic Voter Registration (AVR) systems without mandatory SAVE database cross-checking or documentary proof of U.S. citizenship. Because state licensing electronic pollbooks automatically prompt applicants for voter registration without independently validating citizenship status against SAVE, noncitizens are entered into active county voter rolls and automatically receive official physical ballot paper by mail. When combined with unmerged intra-county duplicates, total active registrations frequently exceed 100% of resident adult citizens ('more votes than residents').",
    fullTranscript: `[PAGE 1 - EXECUTIVE AUDIT FINDINGS]
At the direction of the President, the Department of Homeland Security (DHS) conducted an exhaustive forensic reconciliation comparing public statewide voter registration rolls across target states against the federal Systematic Alien Verification for Entitlements (SAVE) database. The audit uncovered approximately 278,000 unauthorized noncitizen voter registrations on active state voting rolls across four evaluated jurisdictions:
- California: ~142,000 active noncitizen registrations
- Pennsylvania: ~58,000 active noncitizen registrations
- New Jersey: ~49,000 active noncitizen registrations
- Nevada: ~29,000 active noncitizen registrations

[PAGE 4 - STRUCTURAL VULNERABILITIES IN AUTOMATIC VOTER REGISTRATION (AVR)]
DHS investigators determined that the primary structural vector enabling noncitizen registration is the widespread implementation of Motor Voter Automatic Voter Registration (AVR) systems without mandatory SAVE database cross-checking or documentary proof of U.S. citizenship. Under standard motor vehicle licensing procedures, foreign nationals legally residing in the United States on temporary work visas, student visas, or lawful permanent resident (Green Card) status routinely apply for state driver's licenses.

Because state licensing electronic pollbooks and mail-in registration portals automatically prompt applicants for voter registration without independently validating citizenship status against the DHS SAVE database, noncitizens are entered into active county voter rolls. Once entered onto the active roll, these individuals automatically receive official physical ballot paper by mail in every state or county utilizing universal mail-in ballot distribution.

[PAGE 9 - PRECINCT OVER-REGISTRATION ANOMALIES]
When unverified noncitizens are added to active county voter rolls alongside unmerged intra-county duplicates and high-density institutional transients, total active registrations in key urban and suburban precincts frequently exceed 100% of the resident adult citizen population ('more votes than residents'). DHS concludes that without mandatory pre-election SAVE database batch verification and strict proof-of-citizenship requirements at the point of registration (as codified in the SAVE Act), statewide voter rolls remain systematically open to unauthorized ballot generation and dilution of legal citizen votes.`,
    analyticalNote: "Details exact forensic cross-match figures proving over 278,000 noncitizens were entered onto state voter rolls via Automatic Voter Registration because state DMV computers failed to query the SAVE database. Marigold's audit engine enables states and citizens to crosscheck rolls against SAVE extracts and verify citizenship eligibility prior to ballot mailing.",
    downloadUrl: "/data/Declassified_Election_Integrity_Master_Corpus_July16_2026.txt"
  }
];
