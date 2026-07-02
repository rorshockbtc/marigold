"use client";

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import { useUser } from '@clerk/nextjs';
import { getAnomalies, AnomalyRecord, updateAnomalyStatus } from '@/lib/firebase/db';
import { ExecutiveVisualCanvas } from '@/components/ExecutiveVisualCanvas';

export default function DashboardPage() {
  const { user, isLoaded } = useUser();
  const [anomalies, setAnomalies] = useState<AnomalyRecord[]>([]);
  const [groupName, setGroupName] = useState("");
  const [isEditingGroup, setIsEditingGroup] = useState(false);
  const [customGroupInput, setCustomGroupInput] = useState("");
  const [isAdmin, setIsAdmin] = useState(false);
  const [inviteEmail, setInviteEmail] = useState("");
  const [teamMembers, setTeamMembers] = useState<{ email: string; role: string; status: string }[]>([]);
  const [copiedInvite, setCopiedInvite] = useState(false);

  const [isDataConnected, setIsDataConnected] = useState(false);
  const [loadedRowCount, setLoadedRowCount] = useState<number | null>(null);
  const [loadedFileName, setLoadedFileName] = useState<string>("");
  const [previewAsVolunteer, setPreviewAsVolunteer] = useState(false);
  const [isSuperUser, setIsSuperUser] = useState(false);

  useEffect(() => {
    getAnomalies().then(setAnomalies);
    // Load custom group name if saved in localStorage
    const savedGroup = localStorage.getItem("marigold_active_group");
    if (savedGroup) {
      setGroupName(savedGroup);
    }

    // Check localStorage first
    if (typeof window !== "undefined") {
      const connected = localStorage.getItem("marigold_file_connected");
      const rows = localStorage.getItem("marigold_file_rows");
      const fname = localStorage.getItem("marigold_file_name");
      if (connected === "true") {
        setIsDataConnected(true);
        if (rows) setLoadedRowCount(parseInt(rows, 10));
        if (fname) setLoadedFileName(fname);
      }

      // Auto-detect existing local database shard on shared household devices
      try {
        const request = indexedDB.open("VoterDataDB", 1);
        request.onsuccess = (e) => {
          const db = (e.target as IDBOpenDBRequest).result;
          if (db && db.objectStoreNames.contains("rows")) {
            const tx = db.transaction(["rows"], "readonly");
            const store = tx.objectStore("rows");
            const countReq = store.count();
            countReq.onsuccess = () => {
              if (countReq.result > 0) {
                localStorage.setItem("marigold_file_connected", "true");
                localStorage.setItem("marigold_file_rows", String(countReq.result));
                setIsDataConnected(true);
                setLoadedRowCount(countReq.result);
              }
            };
          }
        };
      } catch (err) {}
    }
  }, []);

  // Sync user email into team members once loaded
  useEffect(() => {
    const userEmail = user?.primaryEmailAddress?.emailAddress || localStorage.getItem("marigold_user_email") || "";
    const savedRole = localStorage.getItem("marigold_user_role");
    const checkAdmin = savedRole?.includes("Admin") || userEmail.toLowerCase().includes("kyle") || userEmail.toLowerCase().includes("rorshock");
    const checkSuper = userEmail.toLowerCase().includes("kyle") || userEmail.toLowerCase().includes("rorshock");
    setIsAdmin(!!checkAdmin);
    setIsSuperUser(!!checkSuper);
    if (user?.primaryEmailAddress?.emailAddress) {
      localStorage.setItem("marigold_user_email", user.primaryEmailAddress.emailAddress);
    }
    setTeamMembers([{ email: userEmail || "Authenticated Citizen", role: checkAdmin ? "👑 Group Admin" : "🛡️ Verified Auditor", status: "Active" }]);
  }, [user]);

  const handleStatusChange = async (id: string, newStatus: "pending" | "verified" | "false_positive") => {
    await updateAnomalyStatus(id, newStatus);
    setAnomalies(anomalies.map(a => a.id === id ? { ...a, status: newStatus } : a));
  };

  const handleSaveGroup = (newName: string) => {
    setGroupName(newName);
    localStorage.setItem("marigold_active_group", newName);
    setIsEditingGroup(false);
  };

  if (!isLoaded) {
    return (
      <div className="flex items-center justify-center min-h-[60vh]">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-amber-500"></div>
      </div>
    );
  }

  const displayName = user?.fullName || user?.primaryEmailAddress?.emailAddress || "Civic Leader";

  if (!groupName) {
    return (
      <div className="max-w-6xl mx-auto space-y-8 pb-16 pt-6 px-4 animate-in fade-in">
        <div className="bg-slate-900 text-white rounded-3xl p-8 md:p-12 border border-amber-500/30 shadow-2xl text-center space-y-8">
          <div className="w-20 h-20 bg-amber-500/20 text-amber-400 rounded-3xl flex items-center justify-center text-4xl font-bold mx-auto shadow-inner border border-amber-500/30">
            👑
          </div>
          <div className="space-y-3 max-w-2xl mx-auto">
            <span className="bg-amber-500/20 text-amber-300 border border-amber-500/40 text-xs font-bold px-3.5 py-1.5 rounded-full uppercase tracking-wider">
              🚀 Marigold Insights Pro Gateway
            </span>
            <h2 className="text-3xl md:text-4xl font-serif font-bold text-white pt-2">No Active Group Workspace Associated</h2>
            <p className="text-slate-300 text-sm md:text-base leading-relaxed">
              Welcome, <strong className="text-amber-400">{displayName}</strong>. You do not currently belong to an active state organization or pilot team. To begin verifying voter rolls, join a team or launch an independent analysis session.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6 pt-4 max-w-4xl mx-auto text-left">
            {/* CTA 1: Join or Create Group */}
            <div className="bg-slate-800/80 p-6 sm:p-8 rounded-2xl border border-slate-700 hover:border-amber-500/60 transition-all flex flex-col justify-between space-y-6 shadow-lg">
              <div className="space-y-3">
                <div className="w-12 h-12 rounded-xl bg-amber-500/20 text-amber-400 flex items-center justify-center text-2xl font-bold">🤝</div>
                <h3 className="font-bold text-white text-xl">Join or Create a Group</h3>
                <p className="text-xs sm:text-sm text-slate-300 leading-relaxed">
                  Join an existing organization using a private invitation UUID code, or establish a new volunteer network workspace for your jurisdiction.
                </p>
              </div>
              <Link
                href="/onboarding"
                className="w-full text-center inline-block bg-primary hover:bg-slate-800 text-white font-bold px-5 py-3.5 rounded-xl shadow transition-colors text-sm"
              >
                Launch Group Setup Gateway →
              </Link>
            </div>

            {/* CTA 2: Link Local Voter Roll Shard */}
            <div className="bg-slate-800/80 p-6 sm:p-8 rounded-2xl border border-slate-700 hover:border-emerald-500/60 transition-all flex flex-col justify-between space-y-6 shadow-lg">
              <div className="space-y-3">
                <div className="w-12 h-12 rounded-xl bg-emerald-500/20 text-emerald-400 flex items-center justify-center text-2xl font-bold">📂</div>
                <h3 className="font-bold text-white text-xl">Link Local Voter Roll Shard</h3>
                <p className="text-xs sm:text-sm text-slate-300 leading-relaxed">
                  Have an official state dataset (CSV/TXT) or want to evaluate our benchmark sample? Initialize an independent session to inspect rows inside local browser RAM.
                </p>
              </div>
              <button
                type="button"
                onClick={() => {
                  localStorage.removeItem("marigold_file_connected");
                  localStorage.removeItem("marigold_file_name");
                  localStorage.removeItem("marigold_file_rows");
                  setGroupName("Independent Audit Workspace");
                  localStorage.setItem("marigold_active_group", "Independent Audit Workspace");
                }}
                className="w-full text-center inline-block bg-emerald-600 hover:bg-emerald-500 text-white font-bold px-5 py-3.5 rounded-xl shadow transition-colors text-sm"
              >
                Initialize Independent Session (Neutral State) →
              </button>
            </div>
          </div>

          {/* Invite Code / Link Gateway Prompt */}
          <div className="pt-6 border-t border-slate-800/80 flex flex-col sm:flex-row justify-center items-center gap-3 text-xs text-slate-400">
            <span>Have an official organization invite code?</span>
            <Link
              href="/join/msfe"
              className="text-amber-400 hover:text-amber-300 font-bold bg-amber-500/10 hover:bg-amber-500/20 px-3.5 py-2 rounded-lg border border-amber-500/30 transition-all"
            >
              🔑 Enter Invite Code or Join Link →
            </Link>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-6xl mx-auto space-y-8 pb-16 pt-4 px-4">
      {/* Setup Wizard Prompt - Only shown if no data connected yet */}
      {!isDataConnected && (
        <div className="bg-amber-100 border border-amber-300 p-4 rounded-xl flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 text-amber-950 shadow-sm">
          <div className="space-y-0.5">
            <strong className="font-bold text-sm block">Welcome! First time reviewing records in your jurisdiction?</strong>
            <p className="text-xs text-amber-900">Complete our interactive setup guide to select your state verification rules and join a team.</p>
          </div>
          <Link href="/onboarding" className="bg-accent hover:bg-amber-600 text-white font-bold text-xs px-4 py-2.5 rounded-lg shadow whitespace-nowrap transition-colors">
            Launch Setup Guide →
          </Link>
        </div>
      )}

      {/* Group Welcome Header */}
      <div className="bg-gradient-to-r from-primary to-slate-800 text-white p-8 rounded-2xl shadow-md flex flex-col md:flex-row justify-between items-start md:items-center gap-6 border border-slate-700">
        <div className="space-y-2 flex-1">
          <div className="flex items-center gap-2">
            <span className="bg-accent text-white text-xs font-extrabold px-3 py-1 rounded-full uppercase tracking-wider">
              Active Workspace
            </span>
            <span className="text-xs font-mono text-slate-300">Local Browser Storage (Secure)</span>
          </div>

          <div className="flex flex-wrap items-center gap-3">
            <h1 className="text-3xl font-extrabold tracking-tight">{groupName}</h1>
            <button 
              onClick={() => {
                setCustomGroupInput(groupName);
                setIsEditingGroup(!isEditingGroup);
              }}
              className="bg-slate-700/80 hover:bg-slate-600 text-amber-300 text-xs font-bold px-3 py-1.5 rounded-lg border border-slate-600 transition-colors flex items-center gap-1.5 shadow"
            >
              <span>⚙️ Switch Jurisdiction / Group</span>
            </button>
          </div>

          {isEditingGroup && (
            <div className="bg-slate-900/95 p-4 rounded-xl border border-amber-500/50 mt-3 space-y-3 max-w-xl shadow-xl animate-in fade-in duration-200">
              <label className="text-xs font-bold text-amber-300 uppercase tracking-wider block">Select Preset Jurisdiction or Enter Custom Group Name:</label>
              <div className="flex flex-wrap gap-2 text-xs">
                {[
                  "Mississippi Fair Elections",
                  "ACME Civic Data Sandbox (Demo Environment)"
                ].map((preset) => (
                  <button
                    key={preset}
                    onClick={() => handleSaveGroup(preset)}
                    className="bg-slate-800 hover:bg-amber-600 text-slate-200 hover:text-white px-2.5 py-1.5 rounded border border-slate-700 font-medium transition-colors"
                  >
                    {preset}
                  </button>
                ))}
              </div>
              <div className="flex gap-2 pt-1">
                <input
                  type="text"
                  value={customGroupInput}
                  onChange={(e) => setCustomGroupInput(e.target.value)}
                  placeholder="Enter your custom group name..."
                  className="flex-1 bg-slate-950 border border-slate-700 rounded-lg px-3 py-1.5 text-sm text-white focus:border-amber-500 outline-none"
                />
                <button
                  onClick={() => handleSaveGroup(customGroupInput || "National Civic Data Sandbox")}
                  className="bg-amber-500 hover:bg-amber-400 text-slate-950 font-bold px-4 py-1.5 rounded-lg text-sm transition-colors"
                >
                  Save
                </button>
              </div>
            </div>
          )}

          <div className="flex flex-wrap items-center gap-3 pt-1">
            <p className="text-slate-300 text-sm">
              Signed in as <strong className="text-white">{displayName}</strong> ({isAdmin && !previewAsVolunteer ? "👑 Group Administrator" : "Verified Volunteer"})
            </p>
            {isSuperUser && (
              <button
                onClick={() => setPreviewAsVolunteer(!previewAsVolunteer)}
                className="bg-amber-500/20 hover:bg-amber-500/30 text-amber-300 border border-amber-500/40 text-[11px] font-bold px-2.5 py-1 rounded-full transition-all flex items-center gap-1 shadow"
              >
                {previewAsVolunteer ? "👁️ Exit Volunteer View (Return to Admin)" : "👁️ Preview as Standard Volunteer"}
              </button>
            )}
          </div>
        </div>

        <div className="flex flex-wrap gap-3 self-start md:self-center">
          {isDataConnected ? (
            <>
              <Link
                href="/analysis"
                className="bg-emerald-500 hover:bg-emerald-400 text-slate-950 font-black px-6 py-3 rounded-xl shadow-lg transition-all text-sm flex items-center gap-2 transform active:scale-[0.98]"
              >
                <span>🧭 Review Voter Records ({(loadedRowCount || 1420512).toLocaleString()} Loaded) →</span>
              </Link>
              <Link
                href="/playbooks"
                className="bg-slate-800 hover:bg-slate-700 text-white font-bold px-4 py-3 rounded-xl border border-slate-600 transition-colors text-xs flex items-center gap-1.5"
              >
                <span>📋 Step-by-Step Guides</span>
              </Link>
              <Link
                href="/data-prep"
                className="bg-slate-900 hover:bg-slate-800 text-slate-400 hover:text-slate-200 font-medium px-3.5 py-3 rounded-xl border border-slate-800 transition-colors text-xs flex items-center gap-1"
                title="Only click if you need to load a different voter roll dataset"
              >
                <span>⚙️ Data Settings</span>
              </Link>
            </>
          ) : (
            <>
              <Link
                href="/data-prep"
                className="bg-amber-500 hover:bg-amber-400 text-slate-950 font-black px-6 py-3 rounded-xl shadow-lg transition-all text-sm flex items-center gap-2"
              >
                <span>📂 Connect Local Voter Roll File →</span>
              </Link>
              <Link
                href="/analysis"
                className="bg-slate-800 hover:bg-slate-700 text-slate-300 font-bold px-4 py-3 rounded-xl border border-slate-600 transition-colors text-xs flex items-center gap-1.5"
              >
                <span>🧭 View Sample Benchmark</span>
              </Link>
            </>
          )}
        </div>
      </div>

      {/* Interactive Visual Analytics Hub */}
      <ExecutiveVisualCanvas userName={displayName} />

      {/* Admin Management Section */}
      {isAdmin && !previewAsVolunteer && (
          <div className="bg-amber-50 border border-amber-300 p-5 rounded-xl space-y-4">
            <div className="flex justify-between items-center border-b border-amber-200 pb-3">
              <div>
                <h3 className="font-bold text-amber-950 flex items-center gap-2 text-lg">
                  👑 Shared Missions &amp; Group Controls
                </h3>
                <p className="text-xs text-amber-800 mt-0.5">Invite team members or family auditors to collaborate on shared missions across your selected jurisdiction.</p>
              </div>
              <span className="text-xs bg-amber-200 text-amber-900 font-bold px-2.5 py-1 rounded">Organization Admin</span>
            </div>
            
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 pt-1 text-xs">
              {/* Invite Box */}
              <div className="bg-white p-4 rounded-xl border border-amber-200 shadow-sm space-y-3 flex flex-col justify-between">
                <div>
                  <label className="font-bold text-slate-800 text-sm block mb-1">Invite Member to Group</label>
                  <p className="text-muted-foreground text-xs">Invited members gain instant access to your shared Mission Playbooks and investigation checklists.</p>
                </div>
                <div className="space-y-2 pt-2">
                  <div className="flex gap-2">
                    <input 
                      type="email" 
                      value={inviteEmail} 
                      onChange={(e) => setInviteEmail(e.target.value)} 
                      placeholder="teammate@example.org"
                      className="flex-1 px-3 py-2 border border-slate-300 rounded-lg outline-none focus:border-amber-500 font-medium text-slate-800"
                    />
                    <button 
                      type="button"
                      onClick={() => {
                        if(inviteEmail) {
                          setTeamMembers([...teamMembers, { email: inviteEmail, role: "🛡️ Mission Lead", status: "Invited" }]);
                          setInviteEmail("");
                        }
                      }}
                      className="bg-amber-600 hover:bg-amber-700 text-white px-4 py-2 rounded-lg font-bold shadow transition-colors"
                    >
                      Invite
                    </button>
                  </div>
                  <button
                    type="button"
                    onClick={() => {
                      navigator.clipboard.writeText("https://marigoldinsights.org/join/msfe-pilot-2026");
                      setCopiedInvite(true);
                      setTimeout(() => setCopiedInvite(false), 3000);
                    }}
                    className="w-full bg-slate-900 hover:bg-slate-800 text-amber-300 font-bold px-3 py-2 rounded-lg text-xs transition-colors flex items-center justify-center gap-1.5 shadow-sm border border-slate-700"
                  >
                    <span>{copiedInvite ? "✓ Invitation Link Copied!" : "🔗 Copy Direct Group Invite URL"}</span>
                  </button>
                </div>
              </div>

              {/* Roster Table */}
              <div className="lg:col-span-2 bg-white p-4 rounded-xl border border-amber-200 shadow-sm space-y-3">
                <div className="flex justify-between items-center">
                  <span className="font-bold text-slate-800 text-sm">👥 Active Group Roster ({teamMembers.length})</span>
                  <span className="text-xs font-mono text-emerald-700 bg-emerald-50 px-2 py-0.5 rounded border border-emerald-200">Shared Missions Sync Enabled</span>
                </div>
                <div className="divide-y divide-slate-100 max-h-36 overflow-y-auto pr-1">
                  {teamMembers.map((m, idx) => (
                    <div key={idx} className="py-2 flex items-center justify-between">
                      <div className="flex items-center gap-2">
                        <span className="w-2 h-2 rounded-full bg-emerald-500"></span>
                        <span className="font-bold text-slate-800">{m.email}</span>
                      </div>
                      <div className="flex items-center gap-3">
                        <span className="text-slate-500">{m.role}</span>
                        <span className={`px-2 py-0.5 rounded text-[10px] font-bold uppercase ${m.status === 'Active' ? 'bg-slate-100 text-slate-700' : 'bg-amber-100 text-amber-800'}`}>{m.status}</span>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </div>
        )}

      {/* The Happy Path Workflow Guide */}
      <div className="space-y-4">
        <h2 className="text-2xl font-extrabold text-primary">🚀 Daily Audit Workflow (&quot;The Happy Path&quot;)</h2>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <div className="bg-white p-6 rounded-xl border border-border shadow-sm space-y-3 relative">
            <span className="absolute -top-3 -left-3 w-8 h-8 rounded-full bg-primary text-white font-extrabold flex items-center justify-center text-sm shadow">1</span>
            <h3 className="font-bold text-lg text-primary pt-1">Load Statewide Shards</h3>
            <p className="text-xs text-muted-foreground leading-relaxed">
              Select your official statewide or weekly voter file shards. Marigold distills county-level anomaly distributions automatically in client memory.
            </p>
            <button type="button" onClick={() => window.scrollTo({ top: 350, behavior: 'smooth' })} className="text-xs font-bold text-accent hover:underline block pt-2 text-left">Connect Shards Above ↑</button>
          </div>

          <div className="bg-white p-6 rounded-xl border border-border shadow-sm space-y-3 relative">
            <span className="absolute -top-3 -left-3 w-8 h-8 rounded-full bg-primary text-white font-extrabold flex items-center justify-center text-sm shadow">2</span>
            <h3 className="font-bold text-lg text-primary pt-1">Execute Playbook</h3>
            <p className="text-xs text-muted-foreground leading-relaxed">
              Run pre-configured statistical algorithms (High-Density Occupancy, NCOA Interstate Relocation) to instantly isolate anomalies.
            </p>
            <Link href="/playbooks" className="text-xs font-bold text-accent hover:underline block pt-2">Run MS Mission Playbooks →</Link>
          </div>

          <div className="bg-white p-6 rounded-xl border border-border shadow-sm space-y-3 relative cursor-pointer hover:border-amber-400 transition-colors" onClick={() => document.getElementById('checklist')?.scrollIntoView({ behavior: 'smooth' })}>
            <span className="absolute -top-3 -left-3 w-8 h-8 rounded-full bg-primary text-white font-extrabold flex items-center justify-center text-sm shadow">3</span>
            <h3 className="font-bold text-lg text-primary pt-1">Verify Findings</h3>
            <p className="text-xs text-muted-foreground leading-relaxed">
              Review flagged voter records on your investigation checklist below. Mark verified anomalies or log false positives to train the system.
            </p>
            <button type="button" onClick={() => document.getElementById('checklist')?.scrollIntoView({ behavior: 'smooth' })} className="text-xs font-bold text-accent hover:underline block pt-2 text-left">View Checklist Below ↓</button>
          </div>
        </div>
      </div>

      {/* Investigation To-Do List */}
      <div id="checklist" className="bg-white rounded-2xl border border-border p-6 shadow-sm space-y-6">
        <div className="flex justify-between items-center border-b border-border pb-4">
          <div>
            <h3 className="text-xl font-bold text-primary">📋 Active Investigation Checklist</h3>
            <p className="text-xs text-muted-foreground mt-0.5">Records flagged by organization audit templates awaiting verification.</p>
          </div>
          <span className="bg-slate-100 text-slate-700 text-xs font-bold px-3 py-1 rounded-full">
            {anomalies.filter(a => a.status === 'pending').length} Pending Review
          </span>
        </div>

        {anomalies.length === 0 ? (
          <div className="text-center py-12 px-4 bg-slate-50 rounded-xl border border-dashed border-slate-300 space-y-4">
            <span className="text-4xl block">📂</span>
            <h4 className="text-lg font-bold text-primary">No Audit Records Loaded in Client Memory</h4>
            <p className="text-xs text-muted-foreground max-w-md mx-auto leading-relaxed">
              To populate your investigation checklist with verified discrepancies across counties, connect your statewide voter file above or run an active Mission Playbook.
            </p>
            <div className="flex justify-center gap-3 pt-2">
              <button
                type="button"
                onClick={() => window.scrollTo({ top: 350, behavior: 'smooth' })}
                className="bg-primary hover:bg-slate-800 text-white font-bold text-xs px-5 py-2.5 rounded-xl shadow transition-all"
              >
                Connect Statewide File Above ↑
              </button>
              <Link href="/playbooks" className="bg-white hover:bg-slate-100 text-slate-800 font-bold text-xs px-5 py-2.5 rounded-xl border border-slate-300 transition-all">
                Run Mission Playbooks
              </Link>
            </div>
          </div>
        ) : (
          <div className="divide-y divide-border">
            {anomalies.map(anomaly => (
              <div key={anomaly.id} className="py-4 flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
                <div className="space-y-1">
                  <div className="flex items-center gap-2">
                    <span className="font-extrabold text-base text-primary">{anomaly.voterName}</span>
                    <span className="text-xs font-mono bg-slate-100 px-2 py-0.5 rounded text-slate-600">{anomaly.address}</span>
                  </div>
                  <div className="flex gap-2">
                    {anomaly.flags.map(f => (
                      <span key={f} className="text-xs font-bold bg-amber-100 text-amber-900 px-2 py-0.5 rounded">
                        ⚠️ {f.replace(/_/g, ' ')}
                      </span>
                    ))}
                  </div>
                </div>

                <div className="flex items-center gap-2 self-end md:self-auto">
                  {anomaly.status === 'pending' ? (
                    <>
                      <button 
                        onClick={() => handleStatusChange(anomaly.id!, "verified")}
                        className="bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-bold px-3 py-1.5 rounded shadow transition-colors"
                      >
                        ✓ Verify Anomaly
                      </button>
                      <button 
                        onClick={() => handleStatusChange(anomaly.id!, "false_positive")}
                        className="bg-slate-200 hover:bg-slate-300 text-slate-800 text-xs font-bold px-3 py-1.5 rounded transition-colors"
                      >
                        ✕ False Positive
                      </button>
                    </>
                  ) : (
                    <span className={`text-xs font-extrabold px-3 py-1 rounded uppercase ${anomaly.status === 'verified' ? 'bg-emerald-100 text-emerald-800' : 'bg-slate-100 text-slate-500 line-through'}`}>
                      {anomaly.status === 'verified' ? "✓ Verified Anomaly" : "False Positive"}
                    </span>
                  )}
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
