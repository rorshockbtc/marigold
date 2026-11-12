/**
 * MARIGOLD × PIPES CIVIC PII & SENSITIVE CONTENT GUARDRAIL
 * ========================================================
 * Ported & unified with `pipes-unified/src/lib/security/civic-pii-guard.ts` and
 * `pipes-unified/src/lib/security/sensitive-content-guard.ts`.
 *
 * Ensures public reports, shared data stories, and Pipes profile mounts NEVER host
 * real individual voter records, residential street numbers, SSNs, VUIDs, PHI, or keys.
 */

export type SensitiveCategory =
  | 'medical'
  | 'financial'
  | 'civic_identity'
  | 'cryptographic_secret';

export interface SensitiveValidationResult {
  allowed: boolean;
  isSensitive: boolean;
  category?: SensitiveCategory;
  categoryLabel?: string;
  violationReason?: string;
  matchedPattern?: string;
  isSyntheticBenchmark: boolean;
  userFacingMessage: string;
  exceptionNotice: string;
  applyExceptionEmail: string;
}

export interface CivicValidationResult {
  allowed: boolean;
  violationReason?: string;
  isSyntheticBenchmark: boolean;
  isSensitive?: boolean;
  category?: string;
  userFacingMessage?: string;
  exceptionNotice?: string;
}

const SYNTHETIC_BENCHMARK_MARKERS = [
  /roosevelt\s+state/i,
  /state\s+of\s+roosevelt/i,
  /synthetic\s+patient/i,
  /synthea\s+benchmark/i,
  /synthetic\s+voter/i,
  /benchmark\s+harness/i,
  /homonym\s+disambiguation\s+test/i,
  /fellegi-sunter\s+benchmark/i,
  /duckdb-wasm\s+benchmark/i,
  /simulated\s+electorate/i,
  /mock\s+county\s+audit/i,
  /sample\s+test\s+data/i,
  /demo_roosevelt/i,
];

interface SensitivePattern {
  category: SensitiveCategory;
  categoryLabel: string;
  name: string;
  regex: RegExp;
  strictlyEnforcedAlways?: boolean;
}

const SENSITIVE_PATTERNS: SensitivePattern[] = [
  {
    category: 'medical',
    categoryLabel: 'Protected Health Information (PHI)',
    name: 'Medical Record Number (MRN) or Patient ID',
    regex: /\b(?:mrn|medical\s*record\s*(?:number|#|no)|patient\s*id)[:\s#]*[A-Z0-9-]{6,18}\b/gi,
  },
  {
    category: 'financial',
    categoryLabel: 'Financial & Cardholder Data',
    name: 'Credit or Debit Card Number',
    regex:
      /\b(?:4[0-9]{3}[- ]?[0-9]{4}[- ]?[0-9]{4}[- ]?[0-9]{4}|5[1-5][0-9]{2}[- ]?[0-9]{4}[- ]?[0-9]{4}[- ]?[0-9]{4}|3[47][0-9]{2}[- ]?[0-9]{6}[- ]?[0-9]{5}|6011[- ]?[0-9]{4}[- ]?[0-9]{4}[- ]?[0-9]{4})\b/g,
    strictlyEnforcedAlways: true,
  },
  {
    category: 'financial',
    categoryLabel: 'Financial & Cardholder Data',
    name: 'Bank Account & Routing Transit Number',
    regex:
      /\b(?:routing\s*(?:number|#|no)|aba\s*routing)[:\s#]*\d{9}\b[\s\S]*?\b(?:account\s*(?:number|#|no)|checking\s*account)[:\s#]*\d{6,17}\b/gi,
    strictlyEnforcedAlways: true,
  },
  {
    category: 'civic_identity',
    categoryLabel: 'Government & Civic Identity',
    name: 'Social Security Number (SSN)',
    regex: /\b(?:ssn[:\s#]*)?\d{3}-\d{2}-\d{4}\b/gi,
    strictlyEnforcedAlways: true,
  },
  {
    category: 'civic_identity',
    categoryLabel: 'Government & Civic Identity',
    name: "State Driver's License Number",
    regex: /\b(?:dl(?:n)?|driver'?s?\s*license\s*(?:number|#|no))[:\s#]*[A-Z0-9-]{6,16}\b/gi,
  },
  {
    category: 'civic_identity',
    categoryLabel: 'Government & Civic Identity',
    name: 'State Voter Unique Identifier (VUID / Voter ID / NCID)',
    regex: /\b(?:vuid|voter[_\s-]?id|ncid|mapping[_\s-]?value)[:\s#]*[A-Z]{0,3}\d{6,12}\b/gi,
  },
  {
    category: 'civic_identity',
    categoryLabel: 'Government & Civic Identity',
    name: 'Raw Voter Registry CSV Header',
    regex:
      /\b(?:voter_id|reg_num|vuid|ncid|mapping_value)[,\t|]+(?:first_name|fname)[,\t|]+(?:last_name|lname)/gi,
    strictlyEnforcedAlways: true,
  },
  {
    category: 'civic_identity',
    categoryLabel: 'Government & Civic Identity',
    name: 'Specific Residential Street Address with ZIP',
    regex:
      /\b\d{1,5}\s+[A-Za-z0-9.\s]{3,25}(?:Street|St|Avenue|Ave|Road|Rd|Drive|Dr|Lane|Ln|Boulevard|Blvd|Court|Ct|Way)\b.*?\b\d{5}(?:-\d{4})?\b/gi,
  },
  {
    category: 'cryptographic_secret',
    categoryLabel: 'Private Key or Master Secret',
    name: 'Bitcoin WIF or Extended Private Key',
    regex: /\b(?:xprv[a-zA-Z0-9]{100,}|[5KL][1-9A-HJ-NP-Za-km-z]{50,51})\b/g,
    strictlyEnforcedAlways: true,
  },
];

export function validateSensitiveContent(
  text: string,
  title: string = ''
): SensitiveValidationResult {
  const combined = `${title}\n${text}`;
  const applyEmail = 'support@marigoldinsights.org';
  const isSyntheticBenchmark = SYNTHETIC_BENCHMARK_MARKERS.some((m) => m.test(combined));

  for (const pattern of SENSITIVE_PATTERNS) {
    pattern.regex.lastIndex = 0;
    if (pattern.regex.test(combined)) {
      if (pattern.strictlyEnforcedAlways || !isSyntheticBenchmark) {
        return {
          allowed: false,
          isSensitive: true,
          category: pattern.category,
          categoryLabel: pattern.categoryLabel,
          violationReason: `${pattern.name} detected`,
          matchedPattern: pattern.name,
          isSyntheticBenchmark,
          userFacingMessage: `Sensitive civic or personal data detected (${pattern.categoryLabel}: ${pattern.name}). Public briefings and Pipes mounts strictly prohibit unredacted voter IDs, residential street numbers, or personal records.`,
          exceptionNotice: `Keep raw records inside your air-gapped Marigold_Local workspace or export an aggregated county summary instead.`,
          applyExceptionEmail: applyEmail,
        };
      }
    }
  }

  return {
    allowed: true,
    isSensitive: false,
    isSyntheticBenchmark,
    userFacingMessage: 'Content cleared Zero-PII civic data guardrails.',
    exceptionNotice: '',
    applyExceptionEmail: applyEmail,
  };
}

export function validateCivicContent(text: string, title: string = ''): CivicValidationResult {
  const result = validateSensitiveContent(text, title);
  return {
    allowed: result.allowed,
    violationReason: result.violationReason,
    isSyntheticBenchmark: result.isSyntheticBenchmark,
    isSensitive: result.isSensitive,
    category: result.category,
    userFacingMessage: result.userFacingMessage,
    exceptionNotice: result.exceptionNotice,
  };
}

export function scrubCivicPiiAndSecrets(text: string): { clean: string; scrubbedCount: number } {
  let clean = text;
  let scrubbedCount = 0;

  const rules: Array<[RegExp, string]> = [
    [
      /\b(sk-[a-zA-Z0-9]{20,}|ghp_[a-zA-Z0-9]{20,}|bearer\s+[a-zA-Z0-9_\-.]{20,}|pipes_sk_[a-zA-Z0-9]{24,})\b/gi,
      '[REDACTED_API_KEY]',
    ],
    [/\b([5KL][1-9A-HJ-NP-Za-km-z]{50,51}|xprv[a-zA-Z0-9]{100,})\b/g, '[REDACTED_PRIVATE_KEY]'],
    [/\b\d{3}-\d{2}-\d{4}\b/g, '[REDACTED_SSN]'],
    [/\b[A-Za-z0-9._%+-]+@[A-Za-z0-9.-]+\.[A-Za-z]{2,}\b/g, '[REDACTED_EMAIL]'],
    [/\b(\+?\d{1,3}[-.\s]?)?\(?\d{3}\)?[-.\s]?\d{3}[-.\s]?\d{4}\b/g, '[REDACTED_PHONE]'],
  ];

  for (const [regex, token] of rules) {
    if (regex.test(clean)) {
      regex.lastIndex = 0;
      clean = clean.replace(regex, token);
      scrubbedCount++;
    }
  }

  return { clean, scrubbedCount };
}
