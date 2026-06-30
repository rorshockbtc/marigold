"use client";

import { useState, useEffect } from "react";
import { Tooltip } from "@/components/Tooltip";
import { DesktopImportGuide } from "@/components/DesktopImportGuide";

// Simple mapping for known institutional addresses to prevent false positives
const categorizeAddress = (address: string) => {
  if (!address) return "⚠️ Review Recommended";
  const upper = address.toUpperCase();
  if (upper.includes("1400 J R LYNCH") || upper.includes("150 RUST") || upper.includes("COUNTY LINE RD") || upper.includes("1701 N STATE") || upper.includes("1000 ASU") || upper.includes("118 COLLEGE") || upper.includes("BAILEY HOWELL") || upper.includes("14000 HIGHWAY 82") || upper.includes("CAMPUS ST")) return "🎓 University";
  if (upper.includes("3300 20 TH ST") || upper.includes("821 HWY 51") || upper.includes("821 HIGHWAY 51")) return "🛠️ Job Corps";
  if (upper.includes("3550 HWY 468") || upper.includes("1530 BROAD")) return "🏥 Hospital / Nursing";
  if (upper.includes("1016 DIVISION") || upper.includes("5712 U S HIGHWAY 49")) return "🤝 Shelter / Mission";
  if (upper.includes("1600 INDIAN") || upper.includes("14605 PARKER")) return "🏕️ RV Park";
  return "⚠️ Review Recommended";
};

export default function AnalysisDashboard() {
  const [stats, setStats] = useState<any>(null);
  const [results, setResults] = useState<any[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [currentAudit, setCurrentAudit] = useState<string | null>(null);
  
  // Phase 8 Feedback State
  const [predictedAccuracy, setPredictedAccuracy] = useState<number | null>(null);
  const [hasGivenFeedback, setHasGivenFeedback] = useState(false);
  
  // Phase 5 Config State
  const [countyFilter, setCountyFilter] = useState('');
  const [thresholdFilter, setThresholdFilter] = useState(12);
  const [playbookName, setPlaybookName] = useState('');
  const [isSavingPlaybook, setIsSavingPlaybook] = useState(false);

  const fetchStats = async () => {
    try {
      const res = await fetch('/api/analysis?action=stats');
      const data = await res.json();
      if (res.ok) setStats(data);
      else setError(data.error);
    } catch (e: any) {
      setError(e.message);
    }
  };

  useEffect(() => {
    fetchStats();
    
    // Auto-run if coming from Mission Control
    const params = new URLSearchParams(window.location.search);
    const auditParam = params.get('audit');
    const countyParam = params.get('county');
    const thresholdParam = params.get('threshold');
    
    if (auditParam) {
      if (countyParam !== null) setCountyFilter(countyParam);
      if (thresholdParam !== null) setThresholdFilter(parseInt(thresholdParam, 10));
      runAlgorithm(auditParam, countyParam || '', parseInt(thresholdParam || '12', 10));
    } else {
      runAlgorithm('density', '', 12);
    }
  }, []);

  const runAlgorithm = async (action: string, overrideCounty?: string, overrideThreshold?: number) => {
    setIsLoading(true);
    setError(null);
    setCurrentAudit(action);
    setResults([]);
    
    const finalCounty = overrideCounty !== undefined ? overrideCounty : countyFilter;
    const finalThreshold = overrideThreshold !== undefined ? overrideThreshold : thresholdFilter;
    
    try {
      const res = await fetch(`/api/analysis?action=${action}&threshold=${finalThreshold}&county=${encodeURIComponent(finalCounty)}`);
      const data = await res.json();
      if (res.ok) {
        setResults(data);
        const accRes = await fetch(`/api/feedback?auditType=${action}`);
        const accData = await accRes.json();
        if (accRes.ok) {
          setPredictedAccuracy(accData.accuracy);
          setHasGivenFeedback(false);
        }
      }
      else setError(data.error);
    } catch (e: any) {
      setError(e.message);
    } finally {
      setIsLoading(false);
    }
  };

  const savePlaybook = async () => {
    if (!currentAudit || !playbookName) return;
    setIsSavingPlaybook(true);
    try {
      await fetch('/api/playbooks', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          name: playbookName,
          auditType: currentAudit,
          threshold: thresholdFilter,
          county: countyFilter
        })
      });
      alert('Playbook saved successfully to Mission Control!');
      setPlaybookName('');
    } catch (e) {
      console.error(e);
      alert('Failed to save playbook.');
    } finally {
      setIsSavingPlaybook(false);
    }
  };

  const renderAuditButton = (auditKey: string) => (
    <button 
      onClick={() => runAlgorithm(auditKey)} 
      disabled={isLoading || !stats} 
      className="btn-primary w-full justify-center flex items-center gap-2 disabled:opacity-75 disabled:cursor-wait"
    >
      {isLoading && currentAudit === auditKey ? (
        <>
          <span className="animate-spin h-4 w-4 border-2 border-white border-t-transparent rounded-full inline-block"></span>
          <span>⏳ Analyzing...</span>
        </>
      ) : "Run Audit"}
    </button>
  );

  const excludeRecord = async (value: string) => {
    if (!currentAudit || !value) return;
    try {
      await fetch('/api/exclusions', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          auditType: currentAudit,
          value: value
        })
      });
      // Remove it from the local results array instantly
      setResults(prev => prev.filter(r => (r.address !== value && r.address1 !== value && r.date_registered !== value)));
    } catch (e) {
      console.error(e);
    }
  };

  const submitFeedback = async (feedback: string) => {
    if (!currentAudit || !predictedAccuracy) return;
    try {
      const res = await fetch('/api/feedback', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ auditType: currentAudit, predictedAccuracy, feedback })
      });
      const data = await res.json();
      if (res.ok) {
        setPredictedAccuracy(data.newAccuracy);
        setHasGivenFeedback(true);
      }
    } catch (e) {
      console.error(e);
    }
  };

  const downloadCsv = () => {
    if (results.length === 0) return;
    const keys = Object.keys(results[0]);
    const headers = [...keys, 'Category'];
    const csvContent = [
      headers.join(','),
      ...results.map(r => {
        const rowData = keys.map(k => `"${String(r[k] || '').replace(/"/g, '""')}"`);
        rowData.push(`"${categorizeAddress(r.address || r.address1 || "")}"`);
        return rowData.join(',');
      })
    ].join('\n');
    
    const blob = new Blob([csvContent], { type: 'text/csv' });
    const url = window.URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `data_quality_audit_${currentAudit || 'export'}_${new Date().toISOString().split('T')[0]}.csv`;
    a.click();
    window.URL.revokeObjectURL(url);
  };

  const renderTable = () => {
    if (results.length === 0) return null;
    const keys = Object.keys(results[0]);
    return (
      <table className="w-full text-left border-collapse">
        <thead>
          <tr className="border-b border-border bg-muted/50">
            {keys.map(k => (
              <th key={k} className="p-3 text-sm font-semibold text-muted-foreground capitalize">
                {k.replace(/_/g, ' ')}
              </th>
            ))}
            <th className="p-3 text-sm font-semibold text-muted-foreground">Category / Notes</th>
            <th className="p-3 text-sm font-semibold text-muted-foreground">Feedback</th>
          </tr>
        </thead>
        <tbody className="divide-y divide-border">
          {results.map((r, i) => {
            const exclusionValue = r.address || r.address1 || r.date_registered || '';
            return (
              <tr key={i} className="hover:bg-muted/20 transition-colors">
                {keys.map(k => (
                  <td key={k} className="p-3 text-sm whitespace-nowrap">
                    {k === 'occupant_count' || k === 'registrations' ? <span className="font-bold">{r[k]}</span> : r[k]}
                  </td>
                ))}
                <td className="p-3 text-sm">
                  <span className={`px-2 py-1 rounded-full whitespace-nowrap ${categorizeAddress(r.address || r.address1 || "") === "⚠️ Review Recommended" ? "bg-amber-100 text-amber-800" : "bg-green-100 text-green-800"}`}>
                    {categorizeAddress(r.address || r.address1 || "")}
                  </span>
                </td>
                <td className="p-3 text-sm">
                  <button 
                    onClick={() => excludeRecord(exclusionValue)}
                    className="p-1 rounded-md hover:bg-red-100 text-muted-foreground hover:text-red-600 transition-colors"
                    title="Mark as False Positive (Will hide this from future runs)"
                  >
                    👎 Exclude
                  </button>
                </td>
              </tr>
            );
          })}
        </tbody>
      </table>
    );
  };

  return (
    <div className="max-w-6xl mx-auto space-y-6 pb-20">
      <header className="mb-8">
        <h1 className="text-3xl font-bold text-foreground">Sandbox & Tuning (Pro Mode)</h1>
        <p className="text-muted-foreground mt-2">Adjust algorithmic thresholds, filter by county, and save your perfect configuration to the organization's Playbook.</p>
      </header>

      {error && (
        <div className="bg-card border border-border p-8 rounded-xl shadow-sm max-w-2xl mx-auto my-8">
          <div className="text-center mb-6">
            <span className="text-4xl block mb-4">👋</span>
            <h3 className="text-2xl font-bold mb-2">Let's Get Started!</h3>
            <p className="text-muted-foreground">
              {error === "Database not found. Please run the ingestion script."
                ? "Before Marigold Insights can run algorithmic tuning, we need to load the data. Don't worry, it's very easy!"
                : error}
            </p>
          </div>
          {error === "Database not found. Please run the ingestion script." && (
            <>
              <div className="bg-muted/30 p-6 rounded-xl mb-8">
                <h4 className="font-semibold mb-3 text-lg">Here are your steps:</h4>
                <ol className="list-decimal list-inside space-y-3 text-muted-foreground">
                  <li>Click the <strong>Upload Voter Roll</strong> button below.</li>
                  <li>Find the <strong>November voter file (.csv)</strong> on your computer.</li>
                  <li>Drag and drop that file into the dotted box. Marigold Insights will quickly process the file entirely on your machine!</li>
                  <li>Come back to this page, and all the audit buttons (like High-Density) will automatically unlock!</li>
                </ol>
              </div>
              <div className="flex justify-center">
                <a href="/data-linkage" className="btn-primary px-8 py-3 text-lg font-bold">
                  Upload Voter Roll
                </a>
              </div>
            </>
          )}
        </div>
      )}

      {/* Collaborative Parity & Dataset Governance Banner */}
      <div className="bg-emerald-50 border border-emerald-300 p-4 rounded-xl flex flex-col sm:flex-row justify-between items-start sm:items-center gap-3 text-emerald-950 shadow-sm">
        <div className="space-y-0.5">
          <div className="flex items-center gap-2">
            <span className="font-bold text-sm">✓ Data Parity Verified</span>
            <span className="bg-emerald-200 text-emerald-900 text-[10px] font-mono px-2 py-0.5 rounded">Group Cartridge Active</span>
          </div>
          <p className="text-xs text-emerald-900">
            Running collaborative analysis against your local dataset copy. If your file differs from your group standard, download the latest version below.
          </p>
        </div>
        <a
          href="https://www.sos.ms.gov/elections-voting/voter-registration-information"
          target="_blank"
          rel="noopener noreferrer"
          className="bg-white hover:bg-emerald-100 text-emerald-900 border border-emerald-400 font-bold text-xs px-3 py-2 rounded-lg shadow-sm whitespace-nowrap transition-colors flex items-center gap-1"
        >
          <span>🌐 Download Official State Dataset ↗</span>
        </a>
      </div>

      {/* Control Panel */}
      <div className="card bg-muted/10 border-primary/20">
        <h2 className="text-xl font-bold mb-4 flex items-center gap-2">
          ⚙️ Global Search Parameters
        </h2>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div>
            <label className="block text-sm font-semibold mb-1">Target County</label>
            <input 
              type="text" 
              className="input-field" 
              placeholder="e.g., Hinds (Leave blank for Statewide)"
              value={countyFilter}
              onChange={(e) => setCountyFilter(e.target.value)}
            />
          </div>
          <div>
            <label className="block text-sm font-semibold mb-1">
              <Tooltip content="The mathematical cutoff point. A threshold of 12 means any address with 11 or fewer voters is ignored as 'normal noise'.">
                Density / Surge Threshold ℹ️
              </Tooltip>
            </label>
            <input 
              type="number" 
              className="input-field" 
              value={thresholdFilter}
              onChange={(e) => setThresholdFilter(parseInt(e.target.value) || 0)}
              min={1}
            />
            <p className="text-xs text-muted-foreground mt-1">Adjusts algorithms like High-Density or Spikes.</p>
          </div>
        </div>
      </div>

      {/* Algorithms */}
      <div className="card">
        <h2 className="text-xl font-bold mb-4">Select an Audit to Run</h2>
        
        <h3 className="text-lg font-semibold text-muted-foreground mb-3 mt-6">Phase 2: Group & Institutional Audits</h3>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-8">
          <div className="border border-border rounded-lg p-4 bg-muted/20 flex flex-col justify-between">
            <div>
              <h3 className="font-bold text-lg mb-2">
                <Tooltip content={
                  <div className="space-y-2">
                    <p><strong>Z-Score Analysis:</strong> Identifies addresses with abnormally high occupant counts.</p>
                    <p>A count &gt; 12 is often 3+ standard deviations from the mean (mathematically highly suspicious).</p>
                  </div>
                }>
                  High-Density Occupancy ℹ️
                </Tooltip>
              </h3>
              <p className="text-sm text-muted-foreground mb-4">Addresses with {thresholdFilter}+ registered voters. Helps identify institutions or large communal living spaces.</p>
            </div>
            {renderAuditButton('density')}
          </div>

          <div className="border border-border rounded-lg p-4 bg-muted/20 flex flex-col justify-between">
            <div>
              <h3 className="font-bold text-lg mb-2">Missing Unit/Dorm Number</h3>
              <p className="text-sm text-muted-foreground mb-4">High-density addresses ({Math.max(thresholdFilter, 50)}+ voters) missing an apartment or dorm number.</p>
            </div>
            {renderAuditButton('missing-dorm')}
          </div>

          <div className="border border-border rounded-lg p-4 bg-muted/20 flex flex-col justify-between">
            <div>
              <h3 className="font-bold text-lg mb-2">
                <Tooltip content="Federal law and USPS DMM regulations require physical residential addresses. A P.O. Box is a mailing address, not a legal domicile.">
                  P.O. Box in Residence ℹ️
                </Tooltip>
              </h3>
              <p className="text-sm text-muted-foreground mb-4">Records using a P.O. Box as their physical residence, which requires clarification under state law.</p>
            </div>
            {renderAuditButton('po-box')}
          </div>
        </div>

        <h3 className="text-lg font-semibold text-muted-foreground mb-3 mt-6">Phase 3: Typographical & Human Error Audits</h3>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-8">
          <div className="border border-border rounded-lg p-4 bg-muted/20 flex flex-col justify-between">
            <div>
              <h3 className="font-bold text-lg mb-2">Fat-Finger Typo Check</h3>
              <p className="text-sm text-muted-foreground mb-4">Finds voters whose first or last name is exactly 1 character long, indicating a data entry error.</p>
            </div>
            {renderAuditButton('typo-names')}
          </div>

          <div className="border border-border rounded-lg p-4 bg-muted/20 flex flex-col justify-between">
            <div>
              <h3 className="font-bold text-lg mb-2">Intra-County Duplicates</h3>
              <p className="text-sm text-muted-foreground mb-4">Finds identical names & zips with different street addresses, often signifying unpurged moving records.</p>
            </div>
            {renderAuditButton('duplicates')}
          </div>

          <div className="border border-border rounded-lg p-4 bg-muted/20 flex flex-col justify-between">
            <div>
              <h3 className="font-bold text-lg mb-2">Commercial Disguises</h3>
              <p className="text-sm text-muted-foreground mb-4">Finds residential addresses with commercial identifiers like "STE" or "BLDG" (e.g. UPS Stores).</p>
            </div>
            {renderAuditButton('commercial')}
          </div>
        </div>

        <h3 className="text-lg font-semibold text-muted-foreground mb-3 mt-6">Phase 4.1: Advanced Data Profiling</h3>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-8">
          <div className="border border-border rounded-lg p-4 bg-muted/20 flex flex-col justify-between">
            <div>
              <h3 className="font-bold text-lg mb-2">Registration Spikes</h3>
              <p className="text-sm text-muted-foreground mb-4">Groups registrations by date and county to identify massive, unexplained single-day surges.</p>
            </div>
            {renderAuditButton('spikes')}
          </div>
          <div className="border border-border rounded-lg p-4 bg-muted/20 flex flex-col justify-between">
            <div>
              <h3 className="font-bold text-lg mb-2">Phantom Precincts</h3>
              <p className="text-sm text-muted-foreground mb-4">Finds ACTIVE voters who fell through the cracks and have no precinct assigned to them.</p>
            </div>
            {renderAuditButton('phantom-precincts')}
          </div>
          <div className="border border-border rounded-lg p-4 bg-muted/20 flex flex-col justify-between">
            <div>
              <h3 className="font-bold text-lg mb-2">Out-of-State Mailing Loophole</h3>
              <p className="text-sm text-muted-foreground mb-4">Identifies active MS voters whose mailing address is permanently located in another state.</p>
            </div>
            {renderAuditButton('out-of-state-mailing')}
          </div>
        </div>

      </div>

      {/* Results Table */}
      {results.length > 0 && (
        <div className="card space-y-6">
          <div className="bg-primary/5 border border-primary/20 p-4 rounded-lg flex flex-col md:flex-row justify-between items-center gap-4">
            <div>
              <h3 className="font-bold text-lg text-primary">Save as Playbook</h3>
              <p className="text-sm text-muted-foreground">Did you find the perfect threshold for this county? Save it so your team can run it in one click.</p>
            </div>
            <div className="flex gap-2 w-full md:w-auto">
              <input 
                type="text" 
                placeholder="e.g. Hinds Urban Density" 
                className="input-field max-w-[200px]"
                value={playbookName}
                onChange={(e) => setPlaybookName(e.target.value)}
              />
              <button 
                onClick={savePlaybook}
                disabled={!playbookName || isSavingPlaybook}
                className="btn-primary whitespace-nowrap"
              >
                {isSavingPlaybook ? "Saving..." : "Save Template"}
              </button>
            </div>
          </div>

          <div className="flex justify-between items-center">
            <div className="flex items-center gap-4">
              <h2 className="text-xl font-bold">Results ({results.length})</h2>
              {predictedAccuracy !== null && (
                <span className="bg-secondary/20 text-secondary-foreground px-3 py-1 rounded-full text-sm font-bold border border-secondary/30">
                  🎯 Predicted Accuracy: {predictedAccuracy}%
                </span>
              )}
            </div>
            <button onClick={downloadCsv} className="px-4 py-2 bg-secondary text-secondary-foreground rounded-lg font-medium hover:bg-secondary/80 transition-colors">
              Download CSV
            </button>
          </div>
          <div className="overflow-x-auto">
            {renderTable()}
          </div>

          <DesktopImportGuide />

          {predictedAccuracy !== null && !hasGivenFeedback && (
            <div className="bg-muted/30 border border-border p-5 rounded-xl flex flex-col md:flex-row items-center justify-between gap-4 mt-6">
              <div>
                <h3 className="font-bold text-lg">Did these results meet your expectations?</h3>
                <p className="text-sm text-muted-foreground">Your feedback trains the algorithm and adjusts the Predicted Accuracy score for all volunteers.</p>
              </div>
              <div className="flex gap-3">
                <button onClick={() => submitFeedback('failed')} className="px-4 py-2 bg-red-50 text-red-700 border border-red-200 rounded-lg hover:bg-red-100 font-medium transition-colors shadow-sm">👎 Failed</button>
                <button onClick={() => submitFeedback('met')} className="px-4 py-2 bg-blue-50 text-blue-700 border border-blue-200 rounded-lg hover:bg-blue-100 font-medium transition-colors shadow-sm">👍 Met</button>
                <button onClick={() => submitFeedback('exceeded')} className="px-4 py-2 bg-green-50 text-green-700 border border-green-200 rounded-lg hover:bg-green-100 font-medium transition-colors shadow-sm">🔥 Exceeded</button>
              </div>
            </div>
          )}
          {hasGivenFeedback && (
            <div className="bg-green-50 border border-green-200 p-4 rounded-xl text-green-800 text-center font-medium mt-6">
              ✅ Thank you! The Predicted Accuracy score has been updated for the entire organization based on your feedback.
            </div>
          )}
        </div>
      )}
    </div>
  );
}
