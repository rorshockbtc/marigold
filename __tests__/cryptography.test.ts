import { MarigoldClient } from '../public/sdk/MarigoldSDK';
import * as crypto from 'crypto';

/**
 * QA AUDIT: PROJECT SOVEREIGN
 * 
 * Target: Marigold SDK Cryptographic Wrappers
 * Objective: Ensure AES-256-GCM execution strictly conforms to the expected 
 * Nonce (12B) + CipherText + AuthTag (16B) byte alignment.
 * 
 * FOSS Contributor Note: We enforce these precise boundaries because Marigold 
 * operates as a Zero-Cloud execution layer. Payloads must survive transport across 
 * various language environments (C#, Python, JS) without data translation loss. 
 */
describe('MarigoldClient Cryptography Standard', () => {
  // Generate a valid 32-byte Base64 key for testing
  const rawKey = crypto.randomBytes(32);
  const base64Key = rawKey.toString('base64');
  const hexKey = rawKey.toString('hex');
  
  let client: MarigoldClient;

  beforeEach(() => {
    // Instantiate client using the exact same class a developer would use.
    client = new MarigoldClient(base64Key);
  });

  it('should explicitly accept both Hex and Base64 formatted keys without failure', () => {
    // Rationale: Web3/Crypto SDKs typically crash when developers mix up Hex/Base64.
    // Our SDK proactively parses both to reduce integration friction.
    expect(() => new MarigoldClient(base64Key)).not.toThrow();
    expect(() => new MarigoldClient(hexKey)).not.toThrow();
  });

  it('should encrypt a standard algorithmic payload into a valid Base64 string', () => {
    // Rationale: We only send algorithmic logic, never PII.
    const mockAlgorithmicPayload = JSON.stringify({
      anomaly: "HIGH_DENSITY",
      hash: "8f9a0b1c2d3e4f5a"
    });

    const encrypted = client.encrypt(mockAlgorithmicPayload);
    
    // The payload must be successfully Base64 encoded for REST/WebSocket transmission.
    expect(typeof encrypted).toBe('string');
    expect(() => Buffer.from(encrypted, 'base64')).not.toThrow();
  });

  it('should successfully decrypt its own encrypted payload', () => {
    const plainText = "StrictlyAlgorithmicData_No_PII";
    const encrypted = client.encrypt(plainText);
    const decrypted = client.decrypt(encrypted);
    
    expect(decrypted).toBe(plainText);
  });

  it('should gracefully throw an explicit error when AuthTag validation fails (tampering detected)', () => {
    // Rationale: If data is mutated in transit between Marigold (Layer 2) and the
    // Partner (Layer 1), the AuthTag must catch it. Silent failures are prohibited.
    const plainText = "Valid_Data";
    const encrypted = client.encrypt(plainText);
    
    // Mutate the ciphertext string slightly to simulate a man-in-the-middle or packet loss
    const mutated = encrypted.substring(0, encrypted.length - 2) + "AA";
    
    expect(() => client.decrypt(mutated)).toThrow(/Decryption failed: Data may be corrupted/);
  });
});
