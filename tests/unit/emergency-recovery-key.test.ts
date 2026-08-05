import { describe, it, expect, beforeEach } from 'vitest';
import { EmergencyKeyManager } from '@/lib/security/EmergencyKeyManager';

describe('Emergency Recovery Key Suite', () => {
  beforeEach(() => {
    localStorage.clear();
  });

  it('should generate valid 24-character Zero-Knowledge Recovery Key starting with MRGLD-', () => {
    const key = EmergencyKeyManager.generateRecoveryKey();
    expect(key).toBeDefined();
    expect(key.startsWith("MRGLD-")).toBe(true);
    expect(key.split("-").length).toBe(6);
  });

  it('should verify matching Emergency Recovery Key correctly', () => {
    const key = EmergencyKeyManager.generateRecoveryKey();
    const isValid = EmergencyKeyManager.verifyRecoveryKey(key);
    expect(isValid).toBe(true);
  });

  it('should reject invalid Emergency Recovery Key', () => {
    EmergencyKeyManager.generateRecoveryKey();
    const isValid = EmergencyKeyManager.verifyRecoveryKey("MRGLD-XXXX-XXXX-XXXX-XXXX");
    expect(isValid).toBe(false);
  });
});
