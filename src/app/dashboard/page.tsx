"use client";

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import { useUser } from '@clerk/nextjs';
import { getAnomalies, AnomalyRecord, updateAnomalyStatus } from '@/lib/firebase/db';
import { ExecutiveVisualCanvas } from '@/components/ExecutiveVisualCanvas';

export default function DashboardPage() {
  const { user, isLoaded } = useUser();
  const [anomalies, setAnomalies] = useState<AnomalyRecord[]>([]);
  const [groupName, setGroupName] = useState("MSFE Group (Mississippi Fair Elections)");
  const [isAdmin, setIsAdmin] = useState(true);
  const [transferEmail, setTransferEmail] = useState("");
  const [newGroupNameInput, setNewGroupNameInput] = useState("");
  const [inviteEmail, setInviteEmail] = useState("");
  const [teamMembers, setTeamMembers] = useState([
    { email: "kyle@msfe.org", role: "👑 Group Admin", status: "Active" },
    { email: "dad@msfe.org", role: "🛡️ Mission Lead", status: "Active" },
    { email: "volunteer@msfe.org", role: "👤 Reviewer", status: "Active" }
  ]);

  useEffect(() => {
    getAnomalies().then(setAnomalies);
  }, []);

  const handleStatusChange = async (id: string, newStatus: "pending" | "verified" | "false_positive") => {
    await updateAnomalyStatus(id, newStatus);
    setAnomalies(anomalies.map(a => a.id === id ? { ...a, status: newStatus } : a));
  };

  if (!isLoaded) {
    return (
      <div className="flex items-center justify-center min-h-[60vh]">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-amber-500"></div>
      </div>
    );
  }

  const displayName = user?.fullName || user?.primaryEmailAddress?.emailAddress || "Civic Leader";

  return (
    <div className="max-w-6xl mx-auto space-y-8 pb-16 pt-4 px-4">
      {/* Group Welcome Header */}
      <div className="bg-gradient-to-r from-primary to-slate-800 text-white p-8 rounded-2xl shadow-md flex flex-col md:flex-row justify-between items-start md:items-center gap-6 border border-slate-700">
        <div className="space-y-2">
          <div className="flex items-center gap-2">
            <span className="bg-accent text-white text-xs font-extrabold px-3 py-1 rounded-full uppercase tracking-wider">
              Active Workspace
            </span>
            <span className="text-xs font-mono text-slate-300">Zero-PII Client Memory</span>
          </div>
          <h1 className="text-3xl font-extrabold tracking-tight">{groupName}</h1>
          <p className="text-slate-300 text-sm">
            Signed in as <strong className="text-white">{displayName}</strong> ({isAdmin ? "👑 Group Administrator" : "Standard Member"})
          </p>
        </div>

        <div className="flex flex-wrap gap-3">
          <Link href="/analysis" className="bg-accent hover:bg-amber-600 text-white font-bold px-5 py-2.5 rounded-lg shadow transition-colors text-sm flex items-center gap-2">
            <span>⚡ Launch Pro Mode</span>
          </Link>
          <Link href="/playbooks" className="bg-slate-700 hover:bg-slate-600 text-white font-bold px-5 py-2.5 rounded-lg shadow transition-colors text-sm">
            Browse MS Playbooks
          </Link>
        </div>
      </div>

      {/* Interactive Visual Analytics Hub */}
      <ExecutiveVisualCanvas />

      {/* Admin Management Section */}
      {isAdmin && (
          <div className="bg-amber-50 border border-amber-300 p-5 rounded-xl space-y-4">
            <div className="flex justify-between items-center border-b border-amber-200 pb-3">
              <div>
                <h3 className="font-bold text-amber-950 flex items-center gap-2 text-lg">
                  👑 MSFE Shared Missions & Group Controls
                </h3>
                <p className="text-xs text-amber-800 mt-0.5">Invite team members (like your Dad or family) to collaborate on shared missions across jurisdictions.</p>
              </div>
              <span className="text-xs bg-amber-200 text-amber-900 font-bold px-2.5 py-1 rounded">Organization Admin</span>
            </div>
            
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 pt-1 text-xs">
              {/* Invite Box */}
              <div className="bg-white p-4 rounded-xl border border-amber-200 shadow-sm space-y-3 flex flex-col justify-between">
                <div>
                  <label className="font-bold text-slate-800 text-sm block mb-1">Invite Member to MSFE Group</label>
                  <p className="text-muted-foreground text-xs">Invited members gain instant access to your shared Mission Playbooks and investigation checklists.</p>
                </div>
                <div className="flex gap-2 pt-2">
                  <input 
                    type="email" 
                    value={inviteEmail} 
                    onChange={(e) => setInviteEmail(e.target.value)} 
                    placeholder="dad@example.com"
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
            <h3 className="font-bold text-lg text-primary pt-1">Load Local Data</h3>
            <p className="text-xs text-muted-foreground leading-relaxed">
              Select or drag-and-drop your official county voter roll CSV file. Data remains encrypted inside your client browser memory.
            </p>
            <Link href="/data-prep" className="text-xs font-bold text-accent hover:underline block pt-2">Connect CSV File →</Link>
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
      </div>
    </div>
  );
}
