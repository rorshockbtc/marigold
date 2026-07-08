/**
 * Marigold Insights: Command-Line Linkage Benchmark Runner
 * Execute via: npx tsx src/scripts/run-benchmark.ts
 */

import { runLinkageBenchmark } from '../lib/linkage/benchmark-suite';

console.log('====================================================================');
console.log('🧪 MARIGOLD INSIGHTS: PROBABILISTIC RECORD LINKAGE BENCHMARK');
console.log('====================================================================\n');
console.log('Generating canonical 1,000-pair synthetic ground truth dataset...');

const summary = runLinkageBenchmark();

console.log(`\n✅ Execution Completed in ${summary.executionTimeMs}ms across ${summary.totalPairs} pairs.\n`);

console.log('--------------------------------------------------------------------');
console.log('📊 STATISTICAL PERFORMANCE METRICS (v2.4 Engine)');
console.log('--------------------------------------------------------------------');
console.log(` * Precision:           ${summary.precision}%  (Industry Target: >98.0%)`);
console.log(` * Recall:              ${summary.recall}%  (Industry Target: >95.0%)`);
console.log(` * F1-Score:            ${summary.f1Score}%  (Industry Target: >96.5%)`);
console.log(` * False Positive Rate: ${summary.falsePositiveRate}%   (Industry Target: <0.5%)`);
console.log('--------------------------------------------------------------------\n');

console.log('--------------------------------------------------------------------');
console.log('🧬 CATEGORY BREAKDOWN & RESISTANCE METRICS');
console.log('--------------------------------------------------------------------');
console.log(` * Typographical Noise Accuracy:  ${summary.categoryBreakdown.typoAccuracy}%`);
console.log(` * Cross-Precinct NCOA Accuracy:  ${summary.categoryBreakdown.ncoaAccuracy}%`);
console.log(` * Familial Collision Resistance: ${summary.categoryBreakdown.familialResistance}%  (Sr/Jr/III/IV trap handling)`);
console.log(` * Random Control Specificity:    ${summary.categoryBreakdown.randomSpecificity}%`);
console.log('--------------------------------------------------------------------\n');

console.log('CONFUSION MATRIX:');
console.log(`                     Flagged Duplicate     Flagged Distinct`);
console.log(`True Duplicate         [ TP: ${String(summary.truePositives).padStart(3)} ]           [ FN: ${String(summary.falseNegatives).padStart(3)} ]`);
console.log(`True Negative          [ FP: ${String(summary.falsePositives).padStart(3)} ]           [ TN: ${String(summary.trueNegatives).padStart(3)} ]\n`);
console.log('====================================================================');
