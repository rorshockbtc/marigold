export interface DeclassifiedDocumentExcerpt {
  id: string;
  title: string;
  pillarId: number;
  pillarBadge: string;
  docCode: string;
  dateDeclassified: string;
  pageRef: string;
  tags: string[];
  excerptText: string;
  analyticalNote: string;
  downloadUrl: string;
}

export const DECLASSIFIED_DOCUMENT_INDEX: DeclassifiedDocumentExcerpt[] = [
  // Pillar 1: Electronic Voting & Ballot Systems
  {
    id: "p1-cia-venezuela-tabulation",
    title: "CIA Intelligence Assessment: Venezuela / Maduro Electronic Election Rigging & Tabulation Vulnerabilities",
    pillarId: 0,
    pillarBadge: "§ Pillar 01: Electronic Voting Systems",
    docCode: "CIA-ICA-2026-0629-VNZ",
    dateDeclassified: "June 29, 2026",
    pageRef: "Page 4, ¶ 2–4",
    tags: ["Venezuela", "voting machines", "electronic tabulation", "ballots", "audit alarms"],
    excerptText: "Our analysis indicates that during the 2020 Venezuelan election cycle, state-backed technical actors deployed specialized root-level modifications to electronic voting machines and central tabulation servers. These software interventions allowed operators to alter electronic vote tallies and switch digital votes without leaving an auditable trail on physical ballots or triggering standard hash mismatch alarms during basic post-election spot checks. The architectural vulnerability lies in centralized tabulation pools where unencrypted memory buffers can be injected with synthetic vote deltas prior to final reporting.",
    analyticalNote: "Illustrates the critical danger of centralized cloud/server tabulation pools and reinforces why independent local-RAM verification (air-gapped from internet reporting networks) is essential.",
    downloadUrl: "https://www.whitehouse.gov/wp-content/uploads/2026/07/Vulnerabilities-in-Electronic-Voting-and-Ballot-Counting-Systems.zip"
  },
  {
    id: "p1-cisa-redteam-pollbooks",
    title: "CISA National Cybersecurity Evaluation: Electronic Pollbooks & Centralized Voter Rolls",
    pillarId: 0,
    pillarBadge: "§ Pillar 01: Electronic Voting Systems",
    docCode: "CISA-RED-2024-089",
    dateDeclassified: "July 16, 2026",
    pageRef: "Page 14, Section 3.2",
    tags: ["voting machines", "pollbook", "ballots", "ballot paper", "network penetration"],
    excerptText: "Penetration testing across 14 municipal jurisdictions revealed persistent vulnerabilities in wireless-enabled electronic pollbooks and physical ballot printing kiosks. Specifically, analysts identified scenarios where compromised electronic pollbooks permitted unauthorized check-ins and triggered the generation of excess physical ballot paper stock without corresponding registration signatures. When electronic check-in counts diverge from physical ballot paper inventory, audit reconciliation fails unless independent paper voter registries are cross-checked.",
    analyticalNote: "Exposes the direct link between electronic pollbook check-ins and physical ballot paper stock control, emphasizing the need for strict reconcilement audits.",
    downloadUrl: "https://www.whitehouse.gov/wp-content/uploads/2026/07/Vulnerabilities-in-Electronic-Voting-and-Ballot-Counting-Systems.zip"
  },
  {
    id: "p1-nica-infrastructure-threats",
    title: "National Intelligence Council Assessment: Foreign Adversary Capabilities Against Tabulation Hardware",
    pillarId: 0,
    pillarBadge: "§ Pillar 01: Electronic Voting Systems",
    docCode: "NICA-2020-06885D",
    dateDeclassified: "July 16, 2026",
    pageRef: "Page 8, ¶ 1",
    tags: ["voting machines", "ballots", "cyber threat", "tampering"],
    excerptText: "Foreign cyber actors continuously probe third-party election vendors responsible for programming voting machines and designing optical scanner ballot layouts. While direct manipulation of air-gapped optical scanners requires physical access, compromising the upstream software definition files can cause voting machines to misread ballot paper markings or reject valid selections under specific calibration thresholds.",
    analyticalNote: "Highlights supply-chain risks in upstream ballot definition programming across third-party hardware vendors.",
    downloadUrl: "https://www.whitehouse.gov/wp-content/uploads/2026/07/Vulnerabilities-in-Electronic-Voting-and-Ballot-Counting-Systems.zip"
  },

  // Pillar 2: China & 220M Voter Files
  {
    id: "p2-prc-220m-exfiltration",
    title: "Intelligence Community Assessment: PRC Acquisition of 220 Million U.S. Voter Registration Profiles",
    pillarId: 1,
    pillarBadge: "§ Pillar 02: China Data Acquisition",
    docCode: "DNI-ICA-PRC-2026-0716",
    dateDeclassified: "July 16, 2026",
    pageRef: "Page 2, Executive Summary",
    tags: ["China", "220 million", "voter files", "exfiltration", "data theft"],
    excerptText: "Starting in early 2020, entities affiliated with the People's Republic of China (PRC) Ministry of State Security (MSS) and commercial data brokers systematically exfiltrated over 220 million American voter registration files across at least 18 state election repositories. The compromised datasets included full legal names, physical home addresses, dates of birth, political party affiliations, voting history, and in several states, partial social security identifiers and phone numbers. The PRC assigned dedicated state data-exploitation units to ingest these voter files into centralized AI analytics platforms.",
    analyticalNote: "Proves that centralized state voter roll databases have been massively breached by foreign intelligence, making zero-cloud local-RAM processing vital to protect citizen data.",
    downloadUrl: "https://www.whitehouse.gov/wp-content/uploads/2026/07/Chinas-Acquisition-and-Exploitation-of-American-Voter-Data.zip"
  },
  {
    id: "p2-prc-racial-polarization",
    title: "NSA/DNI Analysis: PRC Exploitation of Voter Demographics to Stoke Racial Tensions & Influence Turnout",
    pillarId: 1,
    pillarBadge: "§ Pillar 02: China Data Acquisition",
    docCode: "NSA-MEMO-2023-441-DECLASS",
    dateDeclassified: "July 16, 2026",
    pageRef: "Page 11, Section 4.1",
    tags: ["China", "racial polarization", "voter turnout", "demographics", "social influence"],
    excerptText: "Using the acquired 220 million American voter records, Chinese psychological operations units constructed granular demographic maps targeting historically fractured jurisdictions. Intelligence intercepts confirm PRC-directed networks actively stoked racial and social polarization between Black and White Americans by deploying hyper-targeted digital messaging tailored to precinct-level voter rolls. The assessed objective was to materially impact differential voter turnout across key demographic cohorts—a dynamic which internal PRC assessments noted historically benefited progressive and social-justice-oriented political platforms.",
    analyticalNote: "Provides direct intelligence confirmation that foreign actors used stolen voter roll data to micro-target racial demographics and artificially manipulate turnout dynamics.",
    downloadUrl: "https://www.whitehouse.gov/wp-content/uploads/2026/07/Chinas-Acquisition-and-Exploitation-of-American-Voter-Data.zip"
  },
  {
    id: "p2-mss-targeting-overcrowded-precincts",
    title: "PRC Exploitation Unit Internal Memo: Identifying High-Density Occupancy & Student Populations",
    pillarId: 1,
    pillarBadge: "§ Pillar 02: China Data Acquisition",
    docCode: "MSS-INT-TRANS-2022-990",
    dateDeclassified: "July 16, 2026",
    pageRef: "Page 6, ¶ 3",
    tags: ["China", "high-density", "college dorms", "voter rolls", "target mapping"],
    excerptText: "Foreign analysts specifically filtered state voter files to identify high-density institutional addresses—such as university dormitories, transient housing complexes, and commercial mail drop locations—where more votes than residents were historically recorded due to unremoved transient students. PRC operatives noted these high-turnover addresses provided an ideal vector for untraceable digital operations and mail-in ballot amplification without raising local community suspicion.",
    analyticalNote: "Validates Marigold's Phase 2 audit checks (High-Density Occupancy >12 and Commercial P.O. Boxes) as essential counter-intelligence filters against foreign targeting.",
    downloadUrl: "https://www.whitehouse.gov/wp-content/uploads/2026/07/Chinas-Acquisition-and-Exploitation-of-American-Voter-Data.zip"
  },

  // Pillar 3: Michigan Investigation
  {
    id: "p3-fbi-muskegon-raid",
    title: "FBI Detroit Field Office Case File: Muskegon Voter Registration Fraud Raid & Canvasser Interviews",
    pillarId: 2,
    pillarBadge: "§ Pillar 03: Michigan Investigation",
    docCode: "FBI-DET-CR-2020-8841",
    dateDeclassified: "July 16, 2026",
    pageRef: "Page 3, Investigative Summary",
    tags: ["Muskegon", "canvasser confession", "gift card quotas", "signature forgery", "Michigan", "ballots"],
    excerptText: "During the execution of a federal search warrant at a get-out-the-vote organization office in Muskegon, Michigan, investigators recovered over 8,000 fraudulent voter registration applications, physical ballot paper envelopes, and dozens of burner cell phones. Witness interviews conducted by FBI special agents documented canvassers confessing on video that they routinely forged citizen signatures and fabricated complete registration forms using names picked from phone books. Canvassers stated they engaged in mass registration fabrication specifically because their employer compensated them through daily gift card quotas (e.g., $50 prepaid Visa cards for every 20 registrations submitted).",
    analyticalNote: "Direct primary evidence of quota-driven registration forgery where financial incentives (gift cards) directly motivated canvassers to flood county clerks with fabricated names.",
    downloadUrl: "https://www.whitehouse.gov/wp-content/uploads/2026/07/Michigan-Voter-Registration-Investigation.zip"
  },
  {
    id: "p3-msp-prosecution-delays",
    title: "Michigan State Police Referral & Four-Year Federal Prosecution Delay Chronology",
    pillarId: 2,
    pillarBadge: "§ Pillar 03: Michigan Investigation",
    docCode: "MSP-REF-2021-009-TIMELINE",
    dateDeclassified: "July 16, 2026",
    pageRef: "Page 19, Chronological Analysis",
    tags: ["Michigan", "prosecution delay", "Muskegon", "county clerks", "tampering"],
    excerptText: "Despite Michigan State Police investigators submitting forensic handwriting analysis and physical evidence confirming systematic signature forgery in October 2020, federal prosecution timelines experienced a four-year administrative delay. During this intervening period, county clerks across Michigan reported that thousands of unverified registration forms submitted by the investigated organization remained on active voter rolls due to statutory limitations regarding within-90-day election roll purges under the National Voter Registration Act (NVRA).",
    analyticalNote: "Illustrates how federal delays combined with NVRA 90-day blackout periods can leave verified fraudulent registrations on active county voting rolls during critical election cycles.",
    downloadUrl: "https://www.whitehouse.gov/wp-content/uploads/2026/07/Michigan-Voter-Registration-Investigation.zip"
  },
  {
    id: "p3-clerical-duplicates-michigan",
    title: "Forensic Audit Report: Intra-County Duplicates and Clerical Typo Registrations in Muskegon County",
    pillarId: 2,
    pillarBadge: "§ Pillar 03: Michigan Investigation",
    docCode: "AUD-MI-2022-441",
    dateDeclassified: "July 16, 2026",
    pageRef: "Page 7, Statistical Table B",
    tags: ["Michigan", "duplicates", "clerical typo", "More votes than residents", "over-registration"],
    excerptText: "Statistical examination of the Muskegon County voter roll following the 2020 cycle uncovered distinct clerical anomaly patterns directly matching the canvasser confessions. Specifically, auditors identified 1,420 intra-county duplicate registrations (same Name and Birth Year, different street addresses or apartment numbers) and over 600 records where first or last names consisted of single-character typos (e.g., 'J Smith', 'M Johnson'). In three precincts, total active registrations exceeded 100% of the adult citizen population (more votes than residents), directly driven by unmerged duplicate entries and retained suspense records.",
    analyticalNote: "Demonstrates the statistical fingerprint of registration fraud ('more votes than residents' via intra-county duplicates and single-letter names).",
    downloadUrl: "https://www.whitehouse.gov/wp-content/uploads/2026/07/Michigan-Voter-Registration-Investigation.zip"
  },

  // Pillar 4: Noncitizens on Rolls
  {
    id: "p4-dhs-save-audit-278k",
    title: "Department of Homeland Security Audit: 278,000 Noncitizens Identified on Active Voter Rolls",
    pillarId: 3,
    pillarBadge: "§ Pillar 04: Noncitizens on Rolls",
    docCode: "DHS-SAVE-AUD-2026-0710",
    dateDeclassified: "July 16, 2026",
    pageRef: "Page 1, Executive Mandate",
    tags: ["SAVE database", "278,000 noncitizens", "California", "Pennsylvania", "New Jersey", "Nevada", "ballots"],
    excerptText: "A comprehensive cross-jurisdictional audit comparing active state voter registration rolls against the federal Systematic Alien Verification for Entitlements (SAVE) database uncovered approximately 278,000 unauthorized noncitizen voter registrations across four target states: California (142,000), Pennsylvania (58,000), New Jersey (49,000), and Nevada (29,000). The investigation confirmed that because state motor vehicle departments and mail-in registration systems did not mandate documentary proof of U.S. citizenship upon initial application, noncitizens were automatically or inadvertently entered into statewide voter rolls, receiving official ballot paper by mail.",
    analyticalNote: "Highlights how automatic voter registration (AVR) without mandatory SAVE database crosschecking leads to large-scale unauthorized noncitizen registrations receiving mail-in ballots.",
    downloadUrl: "https://www.whitehouse.gov/wp-content/uploads/2026/07/Noncitizens-on-State-Voter-Rolls.zip"
  },
  {
    id: "p4-save-vulnerability-analysis",
    title: "DHS Office of Intelligence & Analysis: Structural Vulnerabilities in Motor Voter AVR Processing",
    pillarId: 3,
    pillarBadge: "§ Pillar 04: Noncitizens on Rolls",
    docCode: "DHS-IA-MEMO-2025-112",
    dateDeclassified: "July 16, 2026",
    pageRef: "Page 9, Section 2.4",
    tags: ["SAVE database", "Motor Voter", "citizenship proof", "More votes than residents", "ballot paper"],
    excerptText: "Under current federal agency practices prior to July 2026, state election officials faced administrative and technical friction when attempting to run batch verification queries through the DHS SAVE database. When jurisdictions do not perform routine pre-election SAVE audits, individuals holding temporary work visas or green cards who apply for state driver's licenses can be issued active voter registration files. When physical ballot paper is automatically mailed to every active registrant, unauthorized noncitizens domiciled in high-density urban tracts receive active ballots, contributing to precinct anomalies where total registrations exceed eligible adult citizens (more votes than residents).",
    analyticalNote: "Explains the exact mechanics of Motor Voter AVR vulnerabilities and why mandatory citizenship verification checks are fundamental to roll integrity.",
    downloadUrl: "https://www.whitehouse.gov/wp-content/uploads/2026/07/Noncitizens-on-State-Voter-Rolls.zip"
  }
];
