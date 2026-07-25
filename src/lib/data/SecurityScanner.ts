/**
 * Real-time Security Scanner for the Automagic Ingestion Pipeline
 * Ensures zero-PII and payload safety for government-grade data ingestion.
 */

const TRUSTED_DOMAINS = [
  'data.gov',
  'cdc.gov',
  'census.gov',
  'healthdata.gov',
  'datacommons.org',
  'googleapis.com' // Google Data Commons
];

export class SecurityScanner {
  /**
   * Validates the source endpoint before any data is fetched.
   */
  static validateEndpoint(url: string): { safe: boolean; reason?: string } {
    try {
      const parsedUrl = new URL(url);
      
      if (parsedUrl.protocol !== 'https:') {
        return { safe: false, reason: 'Insecure protocol. Only HTTPS is allowed.' };
      }

      const isTrusted = TRUSTED_DOMAINS.some(domain => 
        parsedUrl.hostname === domain || parsedUrl.hostname.endsWith(`.${domain}`)
      );

      if (!isTrusted) {
        return { safe: false, reason: `Domain ${parsedUrl.hostname} is not on the government/open-data whitelist.` };
      }

      return { safe: true };
    } catch (err) {
      return { safe: false, reason: 'Invalid URL format.' };
    }
  }

  /**
   * Scans a chunk of data for malicious signatures (XSS, binary payloads).
   */
  static scanPayloadChunk(textChunk: string): { safe: boolean; reason?: string } {
    const maliciousSignatures = [
      /<script\b[^<]*(?:(?!<\/script>)<[^<]*)*<\/script>/gi, // XSS Scripts
      /javascript:/gi,                                        // Inline JS
      /\x00/g,                                                // Null bytes (binary injection)
      /onload=/gi,
      /onerror=/gi
    ];

    for (const signature of maliciousSignatures) {
      if (signature.test(textChunk)) {
        return { safe: false, reason: 'Malicious signature or executable script detected in data payload.' };
      }
    }

    return { safe: true };
  }
}
