"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { Tooltip } from "@/components/Tooltip";
import { GlossaryTooltip } from "@/components/GlossaryTooltip";
import { usePlaybooks } from "@/lib/workspace/PlaybookContext";

export default function MissionControl() {
  const [playbooks, setPlaybooks] = useState<any[]>([]);
  const [accuracies, setAccuracies] = useState<Record<string, number>>({});
  const [isLoading, setIsLoading] = useState(true);
  const [selectedCounty, setSelectedCounty] = useState('All');
  const [selectedState, setSelectedState] = useState('MS');
  const [launchingId, setLaunchingId] = useState<string | null>(null);
  const router = useRouter();

  const { customPlaybooks, addPlaybook, updatePlaybook } = usePlaybooks();
  const [isWizardOpen, setIsWizardOpen] = useState(false);
  const [newPbName, setNewPbName] = useState('');
  const [newPbDesc, setNewPbDesc] = useState('');

  useEffect(() => {
    const fetchPlaybooks = async () => {
      try {
        // System baseline playbooks
        const systemPlaybooks = [
          { id: "density", name: "High-Density Residential Occupancy", desc: "Identify 12+ voters at single address", description: "Flags single residential street addresses or apartments containing more than 8 active registered voters.", flaggedCount: 0, status: "pending", totalScanned: 0, audit_type: "density" },
          { id: "out-of-state-mailing", name: "NCOA Interstate Out-of-State Relocations", desc: "Voter residing out of state via mail", description: "Cross-checks active registration addresses against official USPS National Change of Address (NCOA) forwardings.", flaggedCount: 0, status: "pending", totalScanned: 0, audit_type: "out-of-state-mailing" },
          { id: "duplicates", name: "Intra-County Exact Name & Zip Duplicates", desc: "Same name & zip at different addresses", description: "Scans the entire jurisdiction for identical First Name, Last Name, and Zip Code pairings registered simultaneously at different physical addresses.", flaggedCount: 0, status: "pending", totalScanned: 0, audit_type: "duplicates" },
          { id: "benfords-law", name: "Benford's Law Regression (Fabrication Test)", desc: "Mathematical test for fabrication", description: "Analyzes the leading digit distribution of all street addresses against the logarithmic Benford Curve.", flaggedCount: 0, status: "pending", totalScanned: 0, audit_type: "benfords-law" }
        ];
        
        // Merge system + custom playbooks
        const allPlaybooks = [...systemPlaybooks, ...customPlaybooks];
        setPlaybooks(allPlaybooks);
        
        // Fetch accuracy for all unique audit types
        const uniqueAudits = Array.from(new Set(allPlaybooks.map((p: any) => p.audit_type)));
        const newAccuracies: Record<string, number> = {};
        
        for (const audit of uniqueAudits) {
          try {
            const accRes = await fetch(`/api/feedback?auditType=${audit}`);
            if (accRes.ok) {
              const accData = await accRes.json();
              newAccuracies[audit as string] = accData.accuracy;
            }
          } catch (e) {} // ignore if feedback api fails
        }
        setAccuracies(newAccuracies);
      } catch (e) {
        console.error(e);
      } finally {
        setIsLoading(false);
      }
    };
    fetchPlaybooks();
  }, [customPlaybooks]);

  const getAuditLabel = (type: string) => {
    const labels: Record<string, string> = {
      'density': 'High-Density Occupancy',
      'missing-dorm': 'Missing Unit/Dorm',
      'po-box': 'P.O. Box in Residence',
      'typo-names': 'Clerical Typo',
      'duplicates': 'Intra-County Duplicates',
      'commercial': 'Commercial Disguises',
      'spikes': 'Registration Spikes',
      'phantom-precincts': 'Phantom Precincts',
      'out-of-state-mailing': 'Out-of-State Mailing'
    };
    return labels[type] || type;
  };

  const getPlaybookSource = (name: string, type: string) => {
    if (name.includes("Quantile Model") || name.includes("IQR")) return <>🧮 Source: <GlossaryTooltip term="Tukey">Tukey&apos;s Fences</GlossaryTooltip> &amp; Mathematical Outlier Benchmarks</>;
    if (name.includes("Poisson")) return <>📊 Source: <GlossaryTooltip term="Poisson" /> Rare Event Probability Theory</>;
    if (name.includes("Good Governance") || name.includes("Suspense")) return "🏛️ Source: EAC Administrative Efficiency Guidelines";
    if (name.includes("Relocation") || name.includes("Merge")) return "📋 Source: Interstate Voter Registration Crosscheck Standards";
    if (name.includes("Voting Rights") || name.includes("Urban Precinct")) return "⚖️ Source: Brennan Center for Justice Polling Place Wait Time Study";
    if (name.includes("Campus Housing") || name.includes("Dorm")) return "🎓 Source: ACLU / Fair Fight Student Voting Rights Guide";
    if (name.includes("Purge Surge") || name.includes("Inactive")) return "🛡️ Source: League of Women Voters / Voter Purge Project";
    if (type === "density") return "📚 Source: Heritage Foundation / Voter Roll Audit Standards";
    if (type === "spikes") return "📈 Source: Seth Keshel Statistical Trend Analysis";
    if (type === "po-box" || type === "commercial") return <>📬 Source: USPS <GlossaryTooltip term="NCOA" /> Commercial Address Registry</>;
    if (type === "missing-dorm") return "🏛️ Source: EAC (Election Assistance Commission) Housing Guidelines";
    if (type === "typo-names") return <>🔍 Source: State Auditor <GlossaryTooltip term="OCR" /> Data Validation Benchmarks</>;
    if (type === "duplicates") return <>📋 Source: <GlossaryTooltip term="NVRA" /> Title 8 &amp; <GlossaryTooltip term="Fellegi-Sunter" /></>;
    if (type === "phantom-precincts") return "🗺️ Source: Public Interest Legal Foundation (PILF)";
    if (type === "out-of-state-mailing") return <>📬 Source: Interstate Crosscheck / <GlossaryTooltip term="ERIC" /> Standards</>;
    return "💡 Source: Non-Partisan Election Integrity Standard";
  };

  const statePlaybooks = playbooks.filter(p => {
    if (selectedState === 'MS') return !p.name.includes('[NC ');
    if (selectedState === 'NC') return p.name.includes('[NC ');
    return true;
  });

  const filteredPlaybooks = selectedCounty === 'All' 
    ? statePlaybooks 
    : statePlaybooks.filter(p => (selectedCounty === 'Statewide' ? !p.county : p.county === selectedCounty));

  const msCounties = ['All', 'Statewide', 'Hinds', 'DeSoto', 'Harrison', 'Madison', 'Rankin', 'Jackson', 'Lee'];
  const ncCounties = ['All', 'Statewide', 'Wake', 'Mecklenburg', 'Guilford', 'Durham', 'New Hanover'];
  const currentCounties = selectedState === 'NC' ? ncCounties : msCounties;

  return (
    <div className="max-w-6xl mx-auto space-y-6 pb-20">
      <header className="mb-8 space-y-4">
        <div>
          <div className="flex items-center justify-between flex-wrap gap-3 mb-3">
            <div className="flex flex-wrap items-center gap-2">
              <span className="px-3 py-1 bg-amber-100 text-amber-950 rounded-full text-xs font-extrabold uppercase tracking-wider">
                🏛️ Multi-State Mission Control
              </span>
              <span className="text-xs font-mono text-muted-foreground">Calibrated Statistical Audits</span>
              <span className="text-xs bg-emerald-100 text-emerald-900 font-bold px-2.5 py-1 rounded border border-emerald-300 flex items-center gap-1">
                <span>✓ Data Parity Verified</span>
              </span>
            </div>

            {/* State Selector */}
            <div className="flex bg-slate-200 p-1 rounded-xl gap-1">
              <button
                onClick={() => { setSelectedState('MS'); setSelectedCounty('All'); }}
                className={`px-3 py-1 rounded-lg text-xs font-extrabold transition-all ${selectedState === 'MS' ? 'bg-primary text-white shadow' : 'text-slate-700 hover:bg-slate-300'}`}
              >
                📍 Mississippi (MS)
              </button>
              <button
                onClick={() => { setSelectedState('NC'); setSelectedCounty('All'); }}
                className={`px-3 py-1 rounded-lg text-xs font-extrabold transition-all ${selectedState === 'NC' ? 'bg-emerald-700 text-white shadow' : 'text-slate-700 hover:bg-slate-300'}`}
              >
                🌲 North Carolina (NC)
              </button>
            </div>
          </div>

          {/* Collaborative Parity & Dataset Governance Banner */}
          <div className="bg-emerald-50 border border-emerald-300 p-4 rounded-xl flex flex-col sm:flex-row justify-between items-start sm:items-center gap-3 text-emerald-950 shadow-sm mb-4">
            <div className="space-y-0.5">
              <strong className="font-bold text-sm block">Shared Playbook Protocol Active</strong>
              <p className="text-xs text-emerald-900">
                Playbook missions execute strictly inside your browser memory. If your state file differs from your group standard, download the latest version below.
              </p>
            </div>
            <a
              href={typeof window !== 'undefined' && (((localStorage.getItem("marigold_active_group") || "").toLowerCase().includes("demo") || (localStorage.getItem("marigold_active_group") || "").toLowerCase().includes("acme") || (localStorage.getItem("marigold_active_group") || "").toLowerCase().includes("roosevelt") || (localStorage.getItem("marigold_active_group") || "").toLowerCase().includes("sandbox"))) ? "/api/demo-dataset" : "/registry"}
              download={typeof window !== 'undefined' && (((localStorage.getItem("marigold_active_group") || "").toLowerCase().includes("demo") || (localStorage.getItem("marigold_active_group") || "").toLowerCase().includes("acme") || (localStorage.getItem("marigold_active_group") || "").toLowerCase().includes("roosevelt") || (localStorage.getItem("marigold_active_group") || "").toLowerCase().includes("sandbox"))) ? "DEMO_roosevelt_statewide_voter_roll.csv" : undefined}
              className="bg-white hover:bg-emerald-100 text-emerald-900 border border-emerald-400 font-bold text-xs px-3 py-2 rounded-lg shadow-sm whitespace-nowrap transition-colors flex items-center gap-1"
            >
              <span>{typeof window !== 'undefined' && (((localStorage.getItem("marigold_active_group") || "").toLowerCase().includes("demo") || (localStorage.getItem("marigold_active_group") || "").toLowerCase().includes("acme") || (localStorage.getItem("marigold_active_group") || "").toLowerCase().includes("roosevelt") || (localStorage.getItem("marigold_active_group") || "").toLowerCase().includes("sandbox"))) ? "📥 Download Roosevelt Demo Dataset (.csv)" : "🌐 Download Official State Dataset ↗"}</span>
            </a>
          </div>

          <h1 className="text-3xl font-bold text-foreground">{selectedState === 'MS' ? 'Mississippi' : 'North Carolina'} Mission Playbooks</h1>
          <p className="text-muted-foreground mt-2">
            Pre-configured statistical audits calibrated specifically for {selectedState === 'MS' ? 'Mississippi counties (Hinds, DeSoto, Harrison, etc.)' : 'North Carolina counties (Wake, Mecklenburg, Guilford, etc.)'}. Click a playbook below to launch an instant scan. False positives are automatically filtered out, and our non-partisan models learn from your verification feedback.
            Need help understanding the data? <Tooltip content="If the data looks confusing, hover over the ℹ️ icons or ask the AI Chat Guide to explain the math for you."><span className="text-primary font-semibold underline decoration-dotted">Hover here for a tip.</span></Tooltip>
          </p>

          {/* Executive 360° Audit Launch Banner */}
          <div className="pt-4">
            <Link
              href="/explore?autoRun=true"
              className="w-full sm:w-auto bg-gradient-to-r from-[#2D3142] to-[#1E212D] hover:from-[#1E212D] hover:to-black text-amber-300 font-extrabold px-6 py-4 rounded-xl shadow-md transition-all text-sm inline-flex items-center justify-center gap-2 border border-slate-700"
            >
              <span>🚀 Launch 360° Comprehensive Jurisdiction Audit across all 9 Playbooks →</span>
            </Link>
          </div>
        </div>

        <div className="flex flex-wrap gap-2 pt-2 border-t border-border">
          {currentCounties.map(c => (
            <button
              key={c}
              onClick={() => setSelectedCounty(c)}
              className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-all ${selectedCounty === c ? (selectedState === 'NC' ? 'bg-emerald-700 text-white shadow' : 'bg-primary text-white shadow') : 'bg-slate-100 text-slate-700 hover:bg-slate-200'}`}
            >
              {c === 'All' ? '🌐 All Playbooks' : c === 'Statewide' ? '🏛️ Statewide General' : `📍 ${c} County`}
            </button>
          ))}
          <div className="flex-1" />
          <button
            onClick={() => setIsWizardOpen(true)}
            className="px-4 py-1.5 rounded-lg text-xs font-bold bg-amber-100 text-amber-900 border border-amber-300 hover:bg-amber-200 shadow-sm transition-all flex items-center gap-1"
          >
            <span>✨ Create Custom Playbook</span>
          </button>
        </div>
      </header>

      {isLoading ? (
        <p className="text-muted-foreground">Loading Playbooks...</p>
      ) : filteredPlaybooks.length === 0 ? (
        <div className="card text-center py-12">
          <h2 className="text-xl font-bold mb-2">No Playbooks Found</h2>
          <p className="text-muted-foreground mb-6">No playbooks found for {selectedCounty}. Click below to create one!</p>
          <Link href="/explore" className="btn-primary">
            Go to Pro Mode to create one
          </Link>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {filteredPlaybooks.map((p) => (
            <div key={p.id} className="card flex flex-col justify-between group hover:border-primary/50 transition-colors">
              <div>
                <div className="flex justify-between items-start mb-2">
                  <h3 className="font-bold text-lg text-foreground group-hover:text-primary transition-colors">{p.name}</h3>
                  {accuracies[p.audit_type] && (
                    <span className="bg-secondary/20 text-secondary-foreground text-xs px-2 py-1 rounded-md font-bold border border-secondary/30">
                      🎯 {accuracies[p.audit_type]}% Acc
                    </span>
                  )}
                </div>
                <div className="space-y-1 mb-6">
                  <p className="text-sm text-muted-foreground flex items-center gap-2">
                    <span className="font-medium">Algorithm:</span> {getAuditLabel(p.audit_type)}
                  </p>
                  <p className="text-sm text-muted-foreground flex items-center gap-2">
                    <span className="font-medium">Threshold:</span> {p.threshold || 'N/A'}
                  </p>
                  {p.county && (
                    <p className="text-sm text-muted-foreground flex items-center gap-2">
                      <span className="font-medium">County:</span> {p.county}
                    </p>
                  )}
                  {p.audit_type === 'custom' && (
                    <div className="pt-2 mt-2 border-t border-slate-100">
                      <p className="text-xs font-bold text-slate-500 uppercase tracking-wider mb-1">Visibility</p>
                      {p.promotedGroups?.includes(typeof window !== 'undefined' ? localStorage.getItem("marigold_active_group") || "" : "") ? (
                        <div className="inline-flex items-center gap-1 text-xs text-emerald-600 font-bold bg-emerald-50 px-2 py-1 rounded border border-emerald-200">
                          👁️ Shared with Group
                        </div>
                      ) : (
                        <div className="flex items-center gap-2">
                          <div className="inline-flex items-center gap-1 text-xs text-amber-600 font-bold bg-amber-50 px-2 py-1 rounded border border-amber-200">
                            🔒 Private
                          </div>
                          <button 
                            onClick={(e) => {
                              e.stopPropagation();
                              const grp = localStorage.getItem("marigold_active_group") || "default";
                              updatePlaybook(p.id, { promotedGroups: [...(p.promotedGroups || []), grp] });
                            }}
                            className="text-xs py-1 px-2 rounded border border-primary text-primary hover:bg-primary/5 transition-colors font-bold"
                          >
                            Promote to Group
                          </button>
                        </div>
                      )}
                    </div>
                  )}
                </div>

                <div className="bg-slate-100 border border-slate-200 rounded-lg p-2.5 mb-4 text-xs text-slate-800">
                  <span className="font-bold text-slate-900 block mb-0.5">Citation / Legal Standard:</span>
                  <span className="font-medium text-slate-700">{getPlaybookSource(p.name, p.audit_type)}</span>
                </div>
              </div>
              
              <button
                type="button"
                onClick={() => {
                  setLaunchingId(p.id);
                  router.push(`/explore?audit=${p.audit_type}&county=${encodeURIComponent(p.county)}&threshold=${p.threshold}`);
                }}
                disabled={launchingId === p.id}
                className="btn-primary w-full justify-center bg-primary/90 disabled:opacity-75 disabled:cursor-wait flex items-center gap-2"
              >
                {launchingId === p.id ? (
                  <>
                    <span className="animate-spin h-4 w-4 border-2 border-white border-t-transparent rounded-full inline-block"></span>
                    <span>⏳ Launching Scan...</span>
                  </>
                ) : (
                  "Launch Mission"
                )}
              </button>
            </div>
          ))}
        </div>
      )}

      {/* Playbook Wizard Modal */}
      {isWizardOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm p-4">
          <div className="bg-white rounded-xl shadow-2xl w-full max-w-lg overflow-hidden flex flex-col border border-slate-200">
            <div className="p-4 border-b border-slate-100 bg-slate-50 flex justify-between items-center">
              <h3 className="font-bold text-lg text-slate-900">✨ Create Custom Playbook</h3>
              <button onClick={() => setIsWizardOpen(false)} className="text-slate-400 hover:text-slate-700 p-1">✕</button>
            </div>
            
            <div className="p-6 space-y-4">
              <div>
                <label className="block text-sm font-bold text-slate-700 mb-1">Playbook Name</label>
                <input 
                  type="text" 
                  value={newPbName}
                  onChange={(e) => setNewPbName(e.target.value)}
                  className="w-full border border-slate-300 rounded-lg p-2 text-sm focus:ring-2 focus:ring-primary focus:border-primary outline-none"
                  placeholder="e.g. Dormitory Anomaly Scanner"
                />
              </div>
              
              <div>
                <label className="block text-sm font-bold text-slate-700 mb-1">Description / Goal</label>
                <textarea 
                  value={newPbDesc}
                  onChange={(e) => setNewPbDesc(e.target.value)}
                  className="w-full border border-slate-300 rounded-lg p-2 text-sm h-24 focus:ring-2 focus:ring-primary focus:border-primary outline-none"
                  placeholder="Describe what this playbook aims to find..."
                />
              </div>
              
              <div className="bg-amber-50 border border-amber-200 p-3 rounded-lg flex items-start gap-2">
                <span className="text-amber-500 mt-0.5">💡</span>
                <p className="text-xs text-amber-900 font-medium leading-relaxed">
                  Tip: It is often easier to create a playbook directly from the Explore & Review page after you have filtered your data perfectly. Look for the "Save as Playbook" button there.
                </p>
              </div>
            </div>
            
            <div className="p-4 border-t border-slate-100 bg-slate-50 flex justify-end gap-2">
              <button 
                onClick={() => setIsWizardOpen(false)}
                className="px-4 py-2 rounded-lg text-sm font-bold text-slate-600 hover:bg-slate-200 transition-colors"
              >
                Cancel
              </button>
              <button 
                onClick={() => {
                  if (newPbName.trim()) {
                    addPlaybook({
                      id: crypto.randomUUID(),
                      name: newPbName,
                      desc: newPbDesc.slice(0, 50) + (newPbDesc.length > 50 ? '...' : ''),
                      description: newPbDesc,
                      audit_type: 'custom',
                      promotedGroups: []
                    });
                    setIsWizardOpen(false);
                    setNewPbName('');
                    setNewPbDesc('');
                  }
                }}
                disabled={!newPbName.trim()}
                className="px-4 py-2 rounded-lg text-sm font-bold bg-primary text-white hover:bg-primary/90 transition-colors disabled:opacity-50"
              >
                Save Playbook
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
