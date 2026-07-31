import { describe, it, expect } from 'vitest';
import { renderHook, act } from '@testing-library/react';
import { useGroupSync, scrubGeographicAndPII } from '@/hooks/useGroupSync';

describe('useGroupSync & Zero-PII Geographic Sanitizer', () => {
  it('should scrub PII and Geographic identifiers from raw payload objects', () => {
    const rawPayload = {
      rule_id: 'RULE-101',
      threshold: 12,
      // PII Fields
      first_name: 'JOHN',
      last_name: 'DOE',
      address: '123 MAIN ST',
      dob: '1975-04-12',
      ssn: '123-45-6789',
      // Geographic Fields
      county: 'Hinds County',
      state: 'MS',
      zip: '39201',
      precinct: 'Precinct 4B',
      city: 'Jackson',
    };

    const sanitized = scrubGeographicAndPII(rawPayload);

    // Rule metadata must survive
    expect(sanitized.rule_id).toBe('RULE-101');
    expect(sanitized.threshold).toBe(12);

    // PII fields must be deleted
    expect((sanitized as any).first_name).toBeUndefined();
    expect((sanitized as any).last_name).toBeUndefined();
    expect((sanitized as any).address).toBeUndefined();
    expect((sanitized as any).dob).toBeUndefined();
    expect((sanitized as any).ssn).toBeUndefined();

    // Geographic fields MUST be deleted
    expect((sanitized as any).county).toBeUndefined();
    expect((sanitized as any).state).toBeUndefined();
    expect((sanitized as any).zip).toBeUndefined();
    expect((sanitized as any).precinct).toBeUndefined();
    expect((sanitized as any).city).toBeUndefined();
  });

  it('should redact SSN and Email inline text patterns', () => {
    const textData = {
      details: 'Audited record with SSN 987-65-4321 and contact user@example.com for precinct review',
    };

    const sanitized = scrubGeographicAndPII(textData);
    expect(sanitized.details).not.toContain('987-65-4321');
    expect(sanitized.details).not.toContain('user@example.com');
    expect(sanitized.details).toContain('[REDACTED_SSN]');
    expect(sanitized.details).toContain('[REDACTED_EMAIL]');
  });

  it('should initialize group sync with default activities and playbooks', () => {
    const { result } = renderHook(() => useGroupSync());
    expect(result.current.activities.length).toBeGreaterThan(0);
    expect(result.current.sharedPlaybooks.length).toBeGreaterThan(0);
  });

  it('should publish new activity items with local author alias', () => {
    const { result } = renderHook(() => useGroupSync());
    const initialLength = result.current.activities.length;

    act(() => {
      result.current.publishActivity('Ran 360 Audit', 'Executed statewide audit');
    });

    expect(result.current.activities.length).toBe(initialLength + 1);
    expect(result.current.activities[0].action).toBe('Ran 360 Audit');
    expect(result.current.activities[0].authorAlias).toBe('You (Auditor-LOCAL)');
  });

  it('should share custom playbooks with group', () => {
    const { result } = renderHook(() => useGroupSync());

    act(() => {
      result.current.sharePlaybook({
        title: 'High-Risk Multi-State Registration',
        description: 'Flags registrations appearing across multiple state voter databases.',
        ruleType: 'MULTI_STATE',
        threshold: 15,
      });
    });

    expect(result.current.sharedPlaybooks[0].title).toBe('High-Risk Multi-State Registration');
    expect(result.current.sharedPlaybooks[0].ruleType).toBe('MULTI_STATE');
  });
});
