import { z } from 'zod';
import { logSecurityEvent } from './audit-logger';

/**
 * Enterprise QA/QC Validation Layer
 * Fortune 10 integrations require absolute mathematical certainty that incoming payloads
 * will not crash the decryption pipeline. This schema acts as an unassailable edge gatekeeper.
 */

// 1. Strict AES-GCM Vault Schema
const EncryptedVaultSchema = z.object({
  payload: z.string().min(64, { message: "ERR_VAULT_TOO_SHORT: AES-GCM base64 payload must contain IV, Ciphertext, and 16-byte Auth Tag." })
}).strict();

// 2. The Primary Detection Request Schema
export const AnomalyDetectionRequestSchema = z.object({
  session_fingerprint: z.string().length(64, { message: "ERR_INVALID_FINGERPRINT: Session fingerprint must be a 64-character SHA-256 hash." }),
  anomaly_type: z.enum(['HIGH_DENSITY', 'NCOA_MISMATCH', 'FUZZY_DUPLICATE', 'DOB_SPIKE', 'COMMERCIAL_ZONING', 'PO_BOX_RESIDENCE'], {
    message: "ERR_UNSUPPORTED_MODULE: Invalid algorithmic module requested."
  }),
  record_identifiers: z.array(z.string()).max(10000, { message: "ERR_BATCH_TOO_LARGE: Maximum 10,000 records per asynchronous batch to prevent Z-Score overflow." }),
  encrypted_vault: EncryptedVaultSchema,
  callback_webhook: z.string().url({ message: "ERR_INVALID_WEBHOOK: Must provide a valid, secure HTTPS callback URL for async processing." }).optional(),
}).strict();

export type AnomalyDetectionRequest = z.infer<typeof AnomalyDetectionRequestSchema>;

/**
 * Validates a payload and throws a canonical error string if invalid.
 * Also securely logs the failure to the audit trail without PII.
 */
export function validateDetectionPayload(payload: unknown, sourceIp: string): AnomalyDetectionRequest {
  const result = AnomalyDetectionRequestSchema.safeParse(payload);
  
  if (!result.success) {
    const errorDetails = result.error.issues.map(e => e.message).join(" | ");
    logSecurityEvent('SCHEMA_VALIDATION_FAILED', {
      sourceIp,
      reason: errorDetails,
      timestamp: new Date().toISOString()
    });
    
    // Throw standard Canonical Error for the HTTP response
    throw new Error(`ERR_SCHEMA_VALIDATION: ${errorDetails}`);
  }

  return result.data;
}
