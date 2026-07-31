/**
 * Marigold Insights: Canonical Linkage & Accuracy Test Suite
 * Executed via: npm test
 */

import { describe, it, expect } from 'vitest';
import { runLinkageBenchmark } from '../src/lib/linkage/benchmark-suite';
import { fellegiSunterScore } from '../src/lib/linkage/fellegi-sunter';

describe('Canonical Linkage & Accuracy Benchmark Suite', () => {

  it('Test 1: Exact Demographic Match', () => {
    const t1 = fellegiSunterScore(
      { first_name: 'JOHN', last_name: 'DOE', dob: '1980-01-01', address: '100 MAIN ST', zip: '39201' },
      { first_name: 'JOHN', last_name: 'DOE', dob: '1980-01-01', address: '100 MAIN ST', zip: '39201' }
    );
    expect(t1.verdict).toBe('MATCH_HIGH');
    expect(t1.totalScore).toBeGreaterThanOrEqual(15.0);
  });

  it('Test 2: Nickname & OCR Typo Tolerance', () => {
    const t2 = fellegiSunterScore(
      { first_name: 'ELIZABETH', last_name: 'ZUKOWSKI', dob: '1968-11-20', address: '450 OAK AVE', zip: '39501' },
      { first_name: 'BETH', last_name: 'ZUKOWSK', dob: '1968-11-20', address: '450 OAK AVENUE', zip: '39501' }
    );
    expect(t2.verdict).toBe('MATCH_HIGH');
  });

  it('Test 3: Familial Trap Interlock (Sr. vs Jr.)', () => {
    const t3 = fellegiSunterScore(
      { first_name: 'JOHN', last_name: 'DOE SR', dob: '1952-03-10', address: '500 CEDAR CT', zip: '38601' },
      { first_name: 'JOHN', last_name: 'DOE JR', dob: '1984-08-15', address: '500 CEDAR CT', zip: '38601' }
    );
    expect(t3.verdict).toBe('REJECT_LOW');
    expect(t3.totalScore).toBeLessThan(-10);
  });

  it('Test 4: Executing Canonical 1,000-Pair Ground Truth Benchmark', () => {
    const summary = runLinkageBenchmark();
    expect(summary.precision).toBeGreaterThanOrEqual(98.0);
    expect(summary.recall).toBeGreaterThanOrEqual(95.0);
    expect(summary.falsePositiveRate).toBeLessThanOrEqual(0.5);
  });
});
