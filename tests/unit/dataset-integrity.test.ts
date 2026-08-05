import { describe, it, expect, beforeEach } from 'vitest';
import { DatasetIntegrityChecker } from '@/lib/data/DatasetIntegrityChecker';

describe('Dataset Integrity Sanity Checker Suite', () => {
  beforeEach(() => {
    localStorage.clear();
    DatasetIntegrityChecker.resetBaseline();
  });

  it('should establish baseline on initial dataset check without anomaly warning', () => {
    const result = DatasetIntegrityChecker.checkDatasetIntegrity(800 * 1024 * 1024, 2002923);
    expect(result.hasAnomaly).toBe(false);
  });

  it('should detect abnormal file contraction (e.g. 800MB -> 523MB drop)', () => {
    // Initial 800MB export baseline
    DatasetIntegrityChecker.checkDatasetIntegrity(800 * 1024 * 1024, 2002923);

    // Contracted 523MB export
    const result = DatasetIntegrityChecker.checkDatasetIntegrity(523 * 1024 * 1024, 1300000);

    expect(result.hasAnomaly).toBe(true);
    expect(result.warningTitle).toContain("Dataset Contraction Alert");
    expect(result.warningMessage).toContain("pruned");
    expect(result.percentageDrop).toBeGreaterThanOrEqual(20);
  });

  it('should accept normal dataset growth without flagging anomaly', () => {
    // Initial 800MB export baseline
    DatasetIntegrityChecker.checkDatasetIntegrity(800 * 1024 * 1024, 2002923);

    // Growing 850MB export
    const result = DatasetIntegrityChecker.checkDatasetIntegrity(850 * 1024 * 1024, 2100000);

    expect(result.hasAnomaly).toBe(false);
  });
});
