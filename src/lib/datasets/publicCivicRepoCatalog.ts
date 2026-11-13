/**
 * EVALUATED KEYLESS PUBLIC CIVIC DATA REPOSITORIES & MOUNTABLE DATASETS
 * Zero-PII county aggregate benchmarks deterministically joined by 5-digit `county_fips`.
 */

export interface PublicDataRepoEvaluation {
  id: string;
  name: string;
  agencyOrMaintainer: string;
  url: string;
  sha256: string;
  license: string;
  joinKey: string;
  status: 'adopted' | 'excluded';
  summary: string;
  excludedReason?: string;
}

export interface MountablePublicDataset {
  id: 'usCountyAtlas' | 'msNcBenchmarks' | 'femaContinuity' | 'publicHealthAccess' | 'irsFdicFiscal';
  label: string;
  shortLabel: string;
  filename: string;
  publicPath: string;
  rows: number;
  sha256: string;
  parquetFilename: string;
  parquetPath: string;
  parquetSha256: string;
  primaryMetricCol: string;
  description: string;
  keyColumns: string[];
}

export interface CuratedPipeStoryStarter {
  id: string;
  title: string;
  subtitle: string;
  pipeSlug:
    | 'marigoldinsights'
    | 'civic-data-benchmarks'
    | 'disaster-continuity'
    | 'election-integrity'
    | 'public-health-benchmarks'
    | 'fiscal-migration';
  pipeLabel: string;
  pipeUrl: string;
  datasetId: MountablePublicDataset['id'];
  sql: string;
  chartType: 'bar' | 'line';
  xKey: string;
  yKey: string;
  chartTitle: string;
  hookTitle: string;
  hookNarrative: string;
  antithesisNarrative: string;
  synthesisNarrative: string;
}

export const EVALUATED_PUBLIC_DATA_REPOS: PublicDataRepoEvaluation[] = [
  {
    id: 'eac-eavs-2024-v2',
    name: 'U.S. EAC 2024 EAVS V2.0 (Feb 2026)',
    agencyOrMaintainer: 'U.S. Election Assistance Commission',
    url: 'https://www.eac.gov/sites/default/files/2026-02/2024_EAVS_for_Public_Release_nolabel_V2_csv.zip',
    sha256: '4073b9f48e1791d44a78ddc543379f6c040c31ce733dfa47676330b4d7f6d6df',
    license: '17 U.S.C. 105 Federal Public Domain',
    joinKey: '5-digit county_fips (6,461 jurisdictions rolled to 3,127 counties)',
    status: 'adopted',
    summary: 'Supplies Section A active/inactive registrations, A10a confirmation notices, A12a removals, Section C mail undeliverables, and Section E provisional rejections.',
  },
  {
    id: 'census-cvap-2020-2024',
    name: 'U.S. Census 2020-2024 ACS CVAP Special Tabulation',
    agencyOrMaintainer: 'U.S. Census Bureau',
    url: 'https://www2.census.gov/programs-surveys/decennial/rdo/datasets/2024/2024-cvap/CVAP_2020-2024_ACS_csv_files.zip',
    sha256: '0c67665c62de843de7a3521a8110de05b4aa158cdc2db304015380615941056c',
    license: '17 U.S.C. 105 Federal Public Domain',
    joinKey: '5-digit county_fips (240,833,718 citizen adults + 90% MOE)',
    status: 'adopted',
    summary: 'Provides county Citizen Voting Age Population denominators alongside explicit 90% confidence margins to separate growth lag from roll inflation.',
  },
  {
    id: 'census-popest-2024',
    name: 'U.S. Census 2020-2024 County Population Estimates',
    agencyOrMaintainer: 'U.S. Census Bureau Population Division',
    url: 'https://www2.census.gov/programs-surveys/popest/datasets/2020-2024/counties/totals/co-est2024-alldata.csv',
    sha256: 'abcc8720d669e793bbfdcd440eeec37a78db3b452adbe4ccd1eadf7c72b522b9',
    license: '17 U.S.C. 105 Federal Public Domain',
    joinKey: '5-digit county_fips (cumulative deaths & net domestic migration)',
    status: 'adopted',
    summary: 'Delivers 2020-2024 county DEATHS (13,988,011 national) and net DOMESTICMIG (+33,821 Brunswick NC; -17,670 Hinds MS) for roll churn baselines.',
  },
  {
    id: 'medsl-tonmcg-returns-2016-2024',
    name: 'MEDSL & tonmcg County Presidential Returns (2016-2024)',
    agencyOrMaintainer: 'MIT Election Data & Science Lab / tonmcg',
    url: 'https://raw.githubusercontent.com/tonmcg/US_County_Level_Election_Results_08-24/master/2024_US_County_Level_Presidential_Results.csv',
    sha256: '538a8fbe2d7a20524b049dd1b3b9ec7e215c4433d99f91fbd7b0dea05270136a',
    license: 'CC0 / Open Academic Public Data',
    joinKey: '5-digit county_fips (154,277,745 certified 2024 votes)',
    status: 'adopted',
    summary: 'Anchors certified county presidential turnout totals across 2016, 2020, and 2024 alongside official MEDSL 2024 state certification files.',
  },
  {
    id: 'openfema-disasters-2020-2026',
    name: 'OpenFEMA DisasterDeclarationsSummaries v2 (2020-2026)',
    agencyOrMaintainer: 'Federal Emergency Management Agency (FEMA)',
    url: 'https://www.fema.gov/api/open/v2/DisasterDeclarationsSummaries',
    sha256: '22f7e21e65e45d5d06e787669192a4251853f440dca8234402ab38fc367a2653',
    license: '17 U.S.C. 105 Federal Public Domain',
    joinKey: '5-digit county_fips (19,551 declarations across 3,238 FIPS)',
    status: 'adopted',
    summary: 'Keyless paginated disaster declarations tracking Hurricane Helene (DR-4827-NC, 39 NC counties) and multi-year stress counties like Washoe NV and coastal LA.',
  },
  {
    id: 'cdc-places-2024-county',
    name: 'CDC PLACES 2024 Release (County GIS-Friendly Format)',
    agencyOrMaintainer: 'Centers for Disease Control and Prevention (CDC)',
    url: 'https://data.cdc.gov/api/views/i46a-9kgh/rows.csv?accessType=DOWNLOAD',
    sha256: 'a47cad3a852c5b35a031d548bc6dd4e9b5f7836bb7c851b84382160beafe15ef',
    license: '17 U.S.C. 105 Federal Public Domain',
    joinKey: '5-digit county_fips (3,143 counties · 40 age-adjusted measures)',
    status: 'adopted',
    summary: 'Supplies county age-adjusted prevalence for disability, mobility, cognition, transportation insecurity, uninsured adults, diabetes, and food insecurity.',
  },
  {
    id: 'hhs-hospitals-nchs-mortality',
    name: 'HHS Registered Acute Hospital Counts & NCHS County Mortality',
    agencyOrMaintainer: 'U.S. HHS / CDC National Center for Health Statistics',
    url: 'https://healthdata.gov/api/views/vz64-k9wr/rows.csv?accessType=DOWNLOAD',
    sha256: '3edae9913b5081d4d77bdcead434641f4c4859a19d3fae879d94576a2ac433e7',
    license: '17 U.S.C. 105 Federal Public Domain',
    joinKey: '5-digit county_fips (6,732 hospitals across 2,528 counties + 659 hospital deserts)',
    status: 'adopted',
    summary: 'Aggregates facility counts cleanly onto county_fips (dropping facility street addresses) alongside NCHS model-based drug mortality across 3,136 counties.',
  },
  {
    id: 'irs-soi-migration-2022-2023',
    name: 'IRS SOI 2022-2023 County-to-County Migration',
    agencyOrMaintainer: 'Internal Revenue Service Statistics of Income',
    url: 'https://www.irs.gov/pub/irs-soi/countyinflow2223.csv',
    sha256: '813ba2ef550c6a598a5121ccf98edcc79f61f1af69eb495bf44cd830b1586745',
    license: '17 U.S.C. 105 Federal Public Domain',
    joinKey: '5-digit county_fips (Form 1040 returns, individuals, and net AGI in $1,000s)',
    status: 'adopted',
    summary: 'Measures annual household tax-return inflows, outflows, and Adjusted Gross Income shifts (e.g., +$502.07M Brunswick NC vs. -$133.79M Hinds MS).',
  },
  {
    id: 'fdic-sod-2024',
    name: 'FDIC 2024 Summary of Deposits (Bank Branches & Deposits)',
    agencyOrMaintainer: 'Federal Deposit Insurance Corporation',
    url: 'https://banks.data.fdic.gov/api/sod?filters=YEAR%3A2024&format=json',
    sha256: '9926d0c90217bbde8d23d05d4c59f5ea606e1104ce37bb4b15957007f375d4e0',
    license: '17 U.S.C. 105 Federal Public Domain',
    joinKey: '5-digit county_fips (76,727 branches · $17.40T deposits across 3,195 counties)',
    status: 'adopted',
    summary: 'Aggregates 2024 bank branches, unique FDIC charters (CERT), deposits ($M), and 38 banking-desert counties nationwide.',
  },
];

export const EXCLUDED_PUBLIC_DATA_REPOS: PublicDataRepoEvaluation[] = [
  {
    id: 'raw-voter-file-mirrors',
    name: 'Publicly Mirrored State Voter-File CSV Repos',
    agencyOrMaintainer: 'Third-Party Bucket Mirrors',
    url: 'https://marigoldinsights.org/privacy',
    sha256: 'excluded-zero-pii-policy',
    license: 'Excluded by Marigold Zero-PII Policy',
    joinKey: 'voter_id / residential street address',
    status: 'excluded',
    summary: 'Unconditionally excluded from Marigold redistribution because raw voter tables expose names, birth years, and home street addresses.',
    excludedReason: 'Violates Zero-PII Civic Guardrail — personal voter records must remain solely on user-supplied local compute.',
  },
  {
    id: 'openelections-2024-drafts',
    name: 'OpenElections 2024 MS/NC County Directories',
    agencyOrMaintainer: 'OpenElections Project',
    url: 'https://github.com/openelections',
    sha256: 'excluded-incomplete-2024-coverage',
    license: 'MIT Open Source',
    joinKey: 'County / precinct CSV drafts',
    status: 'excluded',
    summary: 'Selected 2024 MS and NC county folders currently contain partial PDF conversions or OCR runbooks without uniform 5-digit FIPS totals.',
    excludedReason: 'Superseded by certified MEDSL & tonmcg 2016-2024 county series with 100% 5-digit FIPS coverage.',
  },
  {
    id: 'census-api-key-rest',
    name: 'Authenticated api.census.gov REST API',
    agencyOrMaintainer: 'U.S. Census Bureau API Portal',
    url: 'https://api.census.gov/',
    sha256: 'excluded-requires-api-key',
    license: '17 U.S.C. 105 Federal Public Domain',
    joinKey: 'API query endpoints',
    status: 'excluded',
    summary: 'Requires manual developer API key registration for repeatable bulk queries and introduces rate-limit instability in CI or air-gapped workflows.',
    excludedReason: 'Replaced by zero-secret bulk downloads from www2.census.gov with pinned SHA-256 verification.',
  },
];

export const PUBLIC_CIVIC_DATASETS: Record<MountablePublicDataset['id'], MountablePublicDataset> = {
  usCountyAtlas: {
    id: 'usCountyAtlas',
    label: '3,222 U.S. Counties · EAVS 2024 + CVAP + MEDSL + FEMA Atlas',
    shortLabel: 'US County Atlas (3,222)',
    filename: 'us_county_election_admin_cvap_2024.csv',
    publicPath: '/datasets/civic/us_county_election_admin_cvap_2024.csv',
    rows: 3222,
    sha256: '0b32894e8244e488c65da48986e4ce4eb13f918cf9fd7aa5d36f53161e4ce7a6',
    parquetFilename: 'us_county_election_admin_cvap_2024.parquet',
    parquetPath: '/datasets/civic/us_county_election_admin_cvap_2024.parquet',
    parquetSha256: 'fe691795948c93d46a7d524ed7f46eee9037d003e8a2e51217eb60f6d1d9fe83',
    primaryMetricCol: 'eavs_removals_total',
    description: 'Nationwide Zero-PII county join across 240.8M CVAP citizens, 226.4M EAVS voters, 35.3M confirmation notices, 20.0M removals, 13.98M deaths, and 154.2M 2024 votes.',
    keyColumns: ['county_fips', 'state_abbr', 'county_name', 'cvap_2024', 'eavs_confirmation_notices', 'eavs_removals_total', 'eavs_mail_undeliverable', 'fema_disasters_2020_2026'],
  },
  msNcBenchmarks: {
    id: 'msNcBenchmarks',
    label: '182 MS & NC Counties · 2026 Audit vs. Federal Benchmarks',
    shortLabel: 'MS vs. NC (182)',
    filename: 'ms_nc_audit_vs_federal_benchmarks_2026.csv',
    publicPath: '/datasets/civic/ms_nc_audit_vs_federal_benchmarks_2026.csv',
    rows: 182,
    sha256: '8c3c387b9e6f923249b55ffc022a41e9fa0e4b4631b34c7f3ac9f1323aadf49a',
    parquetFilename: 'ms_nc_audit_vs_federal_benchmarks_2026.parquet',
    parquetPath: '/datasets/civic/ms_nc_audit_vs_federal_benchmarks_2026.parquet',
    parquetSha256: 'ac9abdfe1c6817235000b4c18f2d8e59808e0500d90143713b6322cffbfe2394',
    primaryMetricCol: 'marigold_active_to_cvap_pct',
    description: '1:1 join of Mississippi (82 counties) and North Carolina (100 counties) 2026 roll audits against Census CVAP 90% MOE bounds, net domestic migration, EAVS notices, and Helene DR-4827-NC.',
    keyColumns: ['county_fips', 'state_abbr', 'county_name', 'marigold_active_to_cvap_pct', 'exceeds_cvap_moe_flag', 'net_domestic_mig_2020_2024', 'eavs_2024_notices', 'eavs_2024_removals'],
  },
  femaContinuity: {
    id: 'femaContinuity',
    label: '3,210 Counties · OpenFEMA Election Continuity (2020-2026)',
    shortLabel: 'OpenFEMA (3,210)',
    filename: 'fema_county_election_continuity_2020_2026.csv',
    publicPath: '/datasets/civic/fema_county_election_continuity_2020_2026.csv',
    rows: 3210,
    sha256: '55a51720e644294e2cffea8645f03876843bd62fbac3ccd1031aaa1d75fc414e',
    parquetFilename: 'fema_county_election_continuity_2020_2026.parquet',
    parquetPath: '/datasets/civic/fema_county_election_continuity_2020_2026.parquet',
    parquetSha256: '5ecc2b7e5b26b6426acc33ad299023435f1f4496bb326e51a886e2178e18d413',
    primaryMetricCol: 'fema_disasters_2020_2026',
    description: 'County-level federal disaster declarations joined against 2020-to-2024 certified turnout change, undeliverable mail packets, and provisional ballots cast.',
    keyColumns: ['county_fips', 'state_abbr', 'county_name', 'fema_disasters_2020_2026', 'fema_2024_election_year_disasters', 'turnout_change_2020_to_2024_pct', 'eavs_mail_undeliverable'],
  },
  publicHealthAccess: {
    id: 'publicHealthAccess',
    label: '3,143 Counties · CDC PLACES + HHS Hospitals + NCHS Mortality',
    shortLabel: 'CDC Health + Hospitals',
    filename: 'us_county_public_health_access_2024.csv',
    publicPath: '/datasets/civic/us_county_public_health_access_2024.csv',
    rows: 3143,
    sha256: 'ed70d87f98f2ee32640eadd73796ad903f60c2c399e9c5625e03fc6a1ff472db',
    parquetFilename: 'us_county_public_health_access_2024.parquet',
    parquetPath: '/datasets/civic/us_county_public_health_access_2024.parquet',
    parquetSha256: '3b067fc311b31ccbff74352cccee82a0f9bb47ed14311b2ea5fd95f9457eae31',
    primaryMetricCol: 'eb_smoothed_disability_pct',
    description: 'CDC PLACES 2024 age-adjusted chronic & disability prevalence with Empirical Bayes state shrinkage, 6,732 HHS hospitals (659 desert counties), and 3,136 NCHS drug mortality counties.',
    keyColumns: ['county_fips', 'state_abbr', 'county_name', 'eb_smoothed_disability_pct', 'lack_transport_adj_prev', 'uninsured_adj_prev', 'hhs_hospitals_count', 'hospital_desert_flag', 'nchs_drug_mortality_rate', 'civic_health_barrier_z'],
  },
  irsFdicFiscal: {
    id: 'irsFdicFiscal',
    label: '3,219 Counties · IRS 2022-23 AGI Migration + FDIC Deposits',
    shortLabel: 'IRS AGI + FDIC Banks',
    filename: 'us_county_irs_migration_fdic_banking_2024.csv',
    publicPath: '/datasets/civic/us_county_irs_migration_fdic_banking_2024.csv',
    rows: 3219,
    sha256: '015c1c80c3c03648749b3377e2cd9bfd44886b60e47631caf3ee36e3888625f3',
    parquetFilename: 'us_county_irs_migration_fdic_banking_2024.parquet',
    parquetPath: '/datasets/civic/us_county_irs_migration_fdic_banking_2024.parquet',
    parquetSha256: '043189ebbdfc1d6a6c14cd909c105a6c62f8dc05c99099d3007bbd51921bb4da',
    primaryMetricCol: 'irs_net_agi_millions',
    description: 'IRS SOI 2022-2023 county tax-return & Adjusted Gross Income migration joined against 76,727 FDIC branches ($17.40T deposits) and Census CVAP active registration.',
    keyColumns: ['county_fips', 'state_abbr', 'county_name', 'irs_net_returns', 'irs_net_agi_millions', 'fdic_branches_2024', 'fdic_unique_banks_2024', 'fdic_deposits_millions_2024', 'banking_desert_flag'],
  },
};

export const CURATED_PIPE_STORY_STARTERS: CuratedPipeStoryStarter[] = [
  {
    id: 'ms-nc-cvap-moe-outliers',
    title: 'MS vs. NC 100%+ CVAP & Migration Outliers',
    subtitle: 'Join 2026 state voter rolls against Census 90% MOE bounds & net domestic migration across 182 counties.',
    pipeSlug: 'marigoldinsights',
    pipeLabel: 'pipe/marigoldinsights',
    pipeUrl: 'https://pipes.pink/explore/marigoldinsights',
    datasetId: 'msNcBenchmarks',
    sql: "SELECT (county_name || ', ' || state_abbr) AS x, ROUND(marigold_active_to_cvap_pct, 2) AS y, cvap_2024, marigold_active_2026, net_domestic_mig_2020_2024 FROM data_file WHERE exceeds_cvap_moe_flag = 1 OR marigold_active_to_cvap_pct > 95 ORDER BY y DESC LIMIT 12",
    chartType: 'bar',
    xKey: 'x',
    yKey: 'y',
    chartTitle: 'Active Voters as % of Census CVAP (Top MS & NC Counties)',
    hookTitle: 'Mississippi vs. North Carolina: Growth Lag vs. Out-Migration Roll Inertia',
    hookNarrative: '<p>Cross-referencing <strong>182 counties</strong> in DuckDB-Wasm isolates two opposite demographic forces behind 100%+ registration ratios. North Carolina logs only <strong>1</strong> county above its upper 90% CVAP margin of error—coastal <strong>Brunswick County (106.08%)</strong> fueled by <strong>+33,821</strong> net domestic in-migrants—whereas Mississippi logs <strong>7</strong> counties led by <strong>Humphreys (116.01%)</strong> and <strong>Hinds (100.25%)</strong> despite net domestic out-migration (<strong>-17,670</strong> in Hinds).</p>',
    antithesisNarrative: '<p>Five-year American Community Survey (ACS) CVAP tables pool 60 monthly interviews and carry wider 90% margins of error in rural counties. Under NVRA Section 8 waiting rules, departed residents in inactive/confirmation queues legitimately remain counted across two federal general cycles—meaning high ratios alone never establish unlawful casting.</p>',
    synthesisNarrative: '<p>Combine Census <code>net_domestic_mig_2020_2024</code> with EAVS <code>A10a</code> confirmation mailings to route clerk budgets accurately: add precinct capacity in high-growth NC coastal counties and trigger overdue confirmation sweeps in declining Delta counties. Read the full canon on <a href="https://pipes.pink/explore/marigoldinsights" target="_blank" rel="noopener noreferrer" class="underline text-amber-800">pipe/marigoldinsights</a>.</p>',
  },
  {
    id: 'national-eavs-removals-notices',
    title: 'EAVS 2024 List Maintenance & Undeliverable Mail',
    subtitle: 'Rank top U.S. counties by NVRA Section 8 voter removals (A12a) & confirmation notices (A10a) across 3,222 counties.',
    pipeSlug: 'civic-data-benchmarks',
    pipeLabel: 'pipe/civic-data-benchmarks',
    pipeUrl: 'https://pipes.pink/explore/civic-data-benchmarks',
    datasetId: 'usCountyAtlas',
    sql: "SELECT (county_name || ', ' || state_abbr) AS x, CAST(eavs_removals_total AS BIGINT) AS y, eavs_confirmation_notices, eavs_mail_undeliverable FROM data_file WHERE eavs_removals_total > 0 ORDER BY eavs_removals_total DESC LIMIT 12",
    chartType: 'bar',
    xKey: 'x',
    yKey: 'y',
    chartTitle: 'Top U.S. Counties by 2024 EAVS Voter Removals (A12a)',
    hookTitle: '20.02 Million Removals and 35.32 Million Confirmation Notices Nationwide',
    hookNarrative: '<p>Analyzing the Feb 2026 U.S. EAC 2024 EAVS V2.0 release across <strong>3,222 U.S. counties</strong> shows local boards processed <strong>20,021,606</strong> statutory removals (<code>A12a</code>), mailed <strong>35,328,942</strong> Section 8 confirmation notices (<code>A10a</code>), and tracked <strong>915,949</strong> undeliverable mail ballots out of <strong>66,149,059</strong> transmitted alongside <strong>13,988,011</strong> Census 2020-2024 deaths.</p>',
    antithesisNarrative: '<p>Unfiltered EAVS downloads embed negative sentinel flags (<code>-99</code>, <code>-88</code>, <code>-77</code>) and split New England and Wisconsin jurisdictions across 3,334 sub-county municipal rows. Summing raw CSV files without sentinel sanitization and California 10-digit FIPS zero-padding distorts state comparisons immediately.</p>',
    synthesisNarrative: '<p>Marigold normalizes sentinels and rolls all 6,461 EAVS jurisdictions cleanly onto 5-digit <code>county_fips</code> join keys inside local browser SQL. Inspect EAVS schema notes and methodology on <a href="https://pipes.pink/explore/civic-data-benchmarks" target="_blank" rel="noopener noreferrer" class="underline text-amber-800">pipe/civic-data-benchmarks</a>.</p>',
  },
  {
    id: 'openfema-helene-washoe-continuity',
    title: 'OpenFEMA Disaster Stress Test & Hurricane Helene',
    subtitle: 'Compare 3,210 FEMA-impacted counties on 2020-to-2024 certified turnout resilience & mail delivery.',
    pipeSlug: 'disaster-continuity',
    pipeLabel: 'pipe/disaster-continuity',
    pipeUrl: 'https://pipes.pink/explore/disaster-continuity',
    datasetId: 'femaContinuity',
    sql: "SELECT (county_name || ', ' || state_abbr) AS x, CAST(fema_disasters_2020_2026 AS BIGINT) AS y, fema_2024_election_year_disasters, turnout_change_2020_to_2024_pct FROM data_file WHERE fema_disasters_2020_2026 > 0 ORDER BY y DESC LIMIT 12",
    chartType: 'bar',
    xKey: 'x',
    yKey: 'y',
    chartTitle: 'Highest Cumulative FEMA Disaster Declarations (2020-2026)',
    hookTitle: 'Washoe NV (+4.60% Across 21 Events) & Hurricane Helene DR-4827-NC Resilience',
    hookNarrative: '<p>Joining <strong>19,551</strong> OpenFEMA disaster rows across <strong>3,210</strong> counties reveals stark operational contrast: wildfire-impacted <strong>Washoe County, NV</strong> endured <strong>21</strong> federal declarations (<strong>5</strong> in 2024) yet expanded certified turnout by <strong>+4.60%</strong>, whereas heavily declared Louisiana parishes (<strong>Lafourche 20</strong>, <strong>E. Baton Rouge 19</strong>, <strong>Jefferson 19</strong>, <strong>Orleans 19</strong>) contracted <strong>-5.60% to -10.51%</strong>. Separately, <strong>39 DR-4827-NC Helene counties</strong> increased certified votes from <strong>2,338,633</strong> (2020) to <strong>2,396,685</strong> (2024).</p>',
    antithesisNarrative: '<p>Declaration counts mix broad administrative emergencies and Fire Management Assistance Grants (FMAGs) with catastrophic coastal storm surges, and Louisiana turnout drops also reflect multi-year post-storm resident out-migration shrinking local voting-age populations.</p>',
    synthesisNarrative: '<p>Universal mail redundancies and pre-authorized emergency polling hubs protect turnout stability when infrastructure fails. Explore offline continuity checklists on <a href="https://pipes.pink/explore/disaster-continuity" target="_blank" rel="noopener noreferrer" class="underline text-amber-800">pipe/disaster-continuity</a>.</p>',
  },
  {
    id: 'nvra-removals-vs-notices-nc-ms',
    title: 'NVRA Section 8 List Velocity in MS & NC',
    subtitle: 'Inspect EAVS A12a removals alongside A10a notices, Census deaths & Priority Scores across 182 counties.',
    pipeSlug: 'election-integrity',
    pipeLabel: 'pipe/election-integrity',
    pipeUrl: 'https://pipes.pink/explore/election-integrity',
    datasetId: 'msNcBenchmarks',
    sql: "SELECT (county_name || ', ' || state_abbr) AS x, CAST(eavs_2024_removals AS BIGINT) AS y, eavs_2024_notices, deaths_2020_2024 FROM data_file WHERE eavs_2024_removals > 0 ORDER BY y DESC LIMIT 12",
    chartType: 'bar',
    xKey: 'x',
    yKey: 'y',
    chartTitle: 'Top MS & NC Counties by 2024 EAVS Voter Removals',
    hookTitle: 'Why North Carolina Cleared 971,554 Removals vs. Mississippi 148,200',
    hookNarrative: '<p>Benchmarking list maintenance velocity under <strong>52 U.S.C. 20507</strong> shows North Carolina issued <strong>707,618</strong> confirmation notices and executed <strong>971,554</strong> removals—led by <strong>Mecklenburg (122,082 removals; 88,480 notices; 31,883 deaths)</strong>, <strong>Wake (104,164 removals)</strong>, and <strong>Guilford (50,218 removals)</strong>—compared with <strong>100,185 notices</strong> and <strong>148,200 removals</strong> across Mississippi\'s 82 counties.</p>',
    antithesisNarrative: '<p>High raw removal volume does not automatically measure administrative fairness without checking Section C undeliverable rates and Section E provisional rejections, while vital-record deaths include non-registrants and minors inside county population denominators.</p>',
    synthesisNarrative: '<p>Pair Section 8 notice cadence with provisional cure outcomes and Census vital baselines locally inside DuckDB-Wasm. Read full statutory essays on <a href="https://pipes.pink/explore/election-integrity" target="_blank" rel="noopener noreferrer" class="underline text-amber-800">pipe/election-integrity</a>.</p>',
  },
  {
    id: 'public-health-disability-hospital-deserts',
    title: 'Disability, Transport Barriers & Hospital Deserts',
    subtitle: 'Join CDC PLACES 2024 Empirical Bayes rates, HHS acute hospital counts, and NCHS mortality across 3,143 counties.',
    pipeSlug: 'public-health-benchmarks',
    pipeLabel: 'pipe/public-health-benchmarks',
    pipeUrl: 'https://pipes.pink/explore/public-health-benchmarks',
    datasetId: 'publicHealthAccess',
    sql: "SELECT (county_name || ', ' || state_abbr) AS x, ROUND(eb_smoothed_disability_pct, 2) AS y, lack_transport_adj_prev, hhs_hospitals_count, hospital_desert_flag FROM data_file WHERE eb_smoothed_disability_pct IS NOT NULL ORDER BY civic_health_barrier_z DESC LIMIT 12",
    chartType: 'bar',
    xKey: 'x',
    yKey: 'y',
    chartTitle: 'Empirical Bayes Smoothed Disability Prevalence (%) in Top Barrier Counties',
    hookTitle: '659 U.S. Hospital Deserts & Why Physical Access Shapes Civic Continuity',
    hookNarrative: '<p>Joining CDC PLACES 2024 across <strong>3,143 counties</strong> with <strong>6,732 HHS acute hospitals</strong> reveals <strong>659 hospital-desert counties</strong> nationwide—including <strong>8</strong> in Mississippi and <strong>18</strong> in North Carolina. Mississippi averages <strong>39.00%</strong> age-adjusted disability and <strong>14.28%</strong> transportation barriers, led by hospital-desert <strong>Humphreys County (46.04% EB-smoothed disability; 23.00% lack transportation; 11 FEMA disasters)</strong>, while North Carolina averages <strong>33.35%</strong> led by <strong>Robeson County (41.15% EB-smoothed; 43.03 NCHS drug mortality rate; 1,167 provisional ballots)</strong>.</p>',
    antithesisNarrative: '<p>CDC PLACES relies on Behavioral Risk Factor Surveillance System (BRFSS) small-area multilevel regression rather than direct clinical censuses in every county, and HHS facility files count acute inpatient hubs without indexing freestanding rural clinics across neighboring county lines.</p>',
    synthesisNarrative: '<p>Use Empirical Bayes shrinkage and hospital-desert overlays to pre-position mobile polling, accessible curb-side assistance, and emergency medical capacity before November storms. Read the methodology on <a href="https://pipes.pink/explore/public-health-benchmarks" target="_blank" rel="noopener noreferrer" class="underline text-amber-800">pipe/public-health-benchmarks</a>.</p>',
  },
  {
    id: 'irs-agi-migration-fdic-deposits',
    title: 'IRS Net AGI Migration & FDIC County Banking Capacity',
    subtitle: 'Track Form 1040 household tax-base flows alongside 76,727 FDIC branches ($17.40T deposits) across 3,219 counties.',
    pipeSlug: 'fiscal-migration',
    pipeLabel: 'pipe/fiscal-migration',
    pipeUrl: 'https://pipes.pink/explore/fiscal-migration',
    datasetId: 'irsFdicFiscal',
    sql: "SELECT (county_name || ', ' || state_abbr) AS x, ROUND(irs_net_agi_millions, 2) AS y, irs_net_returns, fdic_branches_2024, fdic_deposits_millions_2024 FROM data_file WHERE state_abbr IN ('MS', 'NC') AND irs_net_agi_millions IS NOT NULL ORDER BY irs_net_agi_millions DESC LIMIT 12",
    chartType: 'bar',
    xKey: 'x',
    yKey: 'y',
    chartTitle: 'IRS 2022-2023 Net Adjusted Gross Income Migration ($M) — NC & MS Leaders',
    hookTitle: '+$3.90B Income Inflow in North Carolina vs. -$133.79M Outflow in Hinds MS',
    hookNarrative: '<p>IRS Statistics of Income (SOI) 2022-2023 return matching shows North Carolina gained <strong>+39,207 net tax returns</strong> and <strong>+$3,898.23M net AGI</strong>—led by coastal <strong>Brunswick County (+3,474 returns; +$502.07M AGI; 99.61% EAVS active/CVAP)</strong> and <strong>Wake County (+$363.56M AGI)</strong>—while Mississippi lost <strong>-3,094 returns</strong> (<strong>-$133.79M</strong> in <strong>Hinds County</strong> alone). Matched against <strong>76,727 FDIC branches</strong>, North Carolina holds <strong>$693.32B</strong> in deposits versus <strong>$77.82B</strong> across Mississippi and <strong>38</strong> banking-desert counties nationwide.</p>',
    antithesisNarrative: '<p>IRS migration totals capture tax filers claiming the same SSN across consecutive filing years, under-representing non-filers, institutional college populations, and within-year moves occurring after April filing deadlines.</p>',
    synthesisNarrative: '<p>Pair IRS annual return migration with FDIC branch deposits and Census 5-year CVAP to audit whether rising voter ratios reflect affluent taxpayer arrivals or unpurged departures. Explore fiscal briefs on <a href="https://pipes.pink/explore/fiscal-migration" target="_blank" rel="noopener noreferrer" class="underline text-amber-800">pipe/fiscal-migration</a>.</p>',
  },
];

export function resolvePublicDatasetForWebHunt(query: string): MountablePublicDataset {
  const q = (query || '').toLowerCase();
  if (/\b(health|hospital|disability|mobility|diabetes|hypertension|uninsured|mortality|overdose|transport|cdc|places|hhs|nchs)\b/.test(q)) {
    return PUBLIC_CIVIC_DATASETS.publicHealthAccess;
  }
  if (/\b(irs|agi|tax|fdic|bank|deposit|branch|income|wealth|inflow|outflow|credit|fiscal)\b/.test(q)) {
    return PUBLIC_CIVIC_DATASETS.irsFdicFiscal;
  }
  if (/\b(fema|disaster|helene|hurricane|wildfire|flood|storm|washoe|orleans|continuity)\b/.test(q)) {
    return PUBLIC_CIVIC_DATASETS.femaContinuity;
  }
  if (/\b(mississippi|north carolina|\bms\b|\bnc\b|brunswick|hinds|humphreys|mecklenburg|wake|yazoo|comparison)\b/.test(q)) {
    return PUBLIC_CIVIC_DATASETS.msNcBenchmarks;
  }
  return PUBLIC_CIVIC_DATASETS.usCountyAtlas;
}
