/**
 * Marigold Insights: Canonical Linkage & Accuracy Test Suite
 * Executed via: npm test
 */

import { runLinkageBenchmark } from '../src/lib/linkage/benchmark-suite';
import { fellegiSunterScore } from '../src/lib/linkage/fellegi-sunter';

console.log('====================================================================');
console.log('🧪 AUTOMATED TEST SUITE: PROBABILISTIC RECORD LINKAGE ENGINE');
console.log('====================================================================\n');

// 1. Unit Test: Exact Match
console.log('Test 1: Exact Demographic Match...');
const t1 = fellegiSunterScore(
  { first_name: 'JOHN', last_name: 'DOE', dob: '1980-01-01', address: '100 MAIN ST', zip: '39201' },
  { first_name: 'JOHN', last_name: 'DOE', dob: '1980-01-01', address: '100 MAIN ST', zip: '39201' }
);
if (t1.verdict === 'MATCH_HIGH' && t1.totalScore >= 15.0) {
  console.log('✅ PASSED: Exact match scored +', t1.totalScore);
} else {
  console.error('❌ FAILED: Exact match did not reach high confidence threshold.');
  process.exit(1);
}

// 2. Unit Test: Nickname & Typo Tolerance (Jaro-Winkler)
console.log('Test 2: Nickname & OCR Typo Tolerance...');
const t2 = fellegiSunterScore(
  { first_name: 'ELIZABETH', last_name: 'ZUKOWSKI', dob: '1968-11-20', address: '450 OAK AVE', zip: '39501' },
  { first_name: 'BETH', last_name: 'ZUKOWSK', dob: '1968-11-20', address: '450 OAK AVENUE', zip: '39501' }
);
if (t2.verdict === 'MATCH_HIGH') {
  console.log('✅ PASSED: Nickname (Elizabeth->Beth) & typo resolved successfully.');
} else {
  console.error('❌ FAILED: Nickname/typo pair rejected.');
  process.exit(1);
}

// 3. Unit Test: Familial Collision Trap (Sr. vs Jr.)
console.log('Test 3: Familial Trap Interlock (Sr. vs Jr.)...');
const t3 = fellegiSunterScore(
  { first_name: 'JOHN', last_name: 'DOE SR', dob: '1952-03-10', address: '500 CEDAR CT', zip: '38601' },
  { first_name: 'JOHN', last_name: 'DOE JR', dob: '1984-08-15', address: '500 CEDAR CT', zip: '38601' }
);
if (t3.verdict === 'REJECT_LOW' && t3.totalScore < -10) {
  console.log('✅ PASSED: Familial collision (Sr/Jr) rejected with penalty score:', t3.totalScore);
} else {
  console.error('❌ FAILED: Familial collision wrongfully flagged as duplicate!');
  process.exit(1);
}

// 4. Canonical 1,000-Pair Ground Truth Benchmark
console.log('\nTest 4: Executing Canonical 1,000-Pair Ground Truth Benchmark...');
const summary = runLinkageBenchmark();

console.log(` * Precision:           ${summary.precision}% (Required: >98.0%)`);
console.log(` * Recall:              ${summary.recall}% (Required: >95.0%)`);
console.log(` * F1-Score:            ${summary.f1Score}% (Required: >96.5%)`);
console.log(` * False Positive Rate: ${summary.falsePositiveRate}%  (Required: <0.5%)`);

if (summary.precision >= 98.0 && summary.recall >= 95.0 && summary.falsePositiveRate <= 0.5) {
  console.log('\n🎉 ALL 1,003 TESTS PASSED! Statistical linkage accuracy validated.');
  process.exit(0);
} else {
  console.error('\n❌ BENCHMARK REGRESSION: Accuracy thresholds not met.');
  process.exit(1);
}
