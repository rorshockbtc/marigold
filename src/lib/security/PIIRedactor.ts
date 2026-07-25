export class PIIRedactor {
  private static readonly SSN_REGEX = /\b\d{3}[-.]?\d{2}[-.]?\d{4}\b/g;
  private static readonly EMAIL_REGEX = /\b[A-Za-z0-9._%+-]+@[A-Za-z0-9.-]+\.[A-Z|a-z]{2,}\b/g;
  private static readonly PHONE_REGEX = /\b(?:\+?1[-.]?)?\(?([0-9]{3})\)?[-.]?([0-9]{3})[-.]?([0-9]{4})\b/g;
  
  // Basic heuristic for US physical addresses (e.g., 123 Main St)
  private static readonly ADDRESS_REGEX = /\b\d{1,5}\s(?:[A-Za-z0-9#-]+\s){1,4}(?:Street|St|Avenue|Ave|Boulevard|Blvd|Road|Rd|Lane|Ln|Drive|Dr|Court|Ct|Way|Circle|Cir|Trail|Trl|Place|Pl|Square|Sq|Parkway|Pkwy)\b/gi;

  // Extremely basic heuristic for 2-word Capitalized Names (e.g., John Doe) 
  // Excludes common non-PII capitalized words (this is a simplified heuristic for safety)
  private static readonly NAME_REGEX = /\b([A-Z][a-z]+)\s([A-Z][a-z]+)\b/g;

  /**
   * Scrubs a string for common PII patterns and replaces them with [REDACTED] tokens.
   */
  public static scrub(text: string): string {
    if (!text) return text;
    
    let scrubbed = text;
    
    scrubbed = scrubbed.replace(this.SSN_REGEX, '[REDACTED_SSN]');
    scrubbed = scrubbed.replace(this.EMAIL_REGEX, '[REDACTED_EMAIL]');
    scrubbed = scrubbed.replace(this.PHONE_REGEX, '[REDACTED_PHONE]');
    scrubbed = scrubbed.replace(this.ADDRESS_REGEX, '[REDACTED_ADDRESS]');
    
    // We don't apply the Name regex by default as it's too broad and destroys normal sentence structure
    // (e.g., "The Dog" would become [REDACTED_NAME]).
    // For voter rolls, preventing exact Addresses and SSN/Phones is the primary layer of air-gapping.
    
    return scrubbed;
  }
}
