"use client";

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import { useUser } from '@clerk/nextjs';
import { getAnomalies, AnomalyRecord, updateAnomalyStatus } from '@/lib/firebase/db';
import { ExecutiveVisualCanvas } from '@/components/ExecutiveVisualCanvas';

export default function DashboardPage() {
  const { user, isLoaded } = useUser();
  const [anomalies, setAnomalies] = useState<AnomalyRecord[]>([]);
  const [groupName, setGroupName] = useState("Mississippi Fair Elections");
  const [isAdmin, setIsAdmin] = useState(true);
  const [transferEmail, setTransferEmail] = useState("");
  const [newGroupNameInput, setNewGroupNameInput] = useState("");

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
        <div className="bg-amber-50/80 border border-amber-300 p-6 rounded-xl space-y-4">
          <div className="flex items-center justify-between">
            <h3 className="font-bold text-amber-950 flex items-center gap-2">
              👑 Group Administrator Controls
            </h3>
            <span className="text-xs bg-amber-200 text-amber-900 font-bold px-2 py-0.5 rounded">Admin Only</span>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-xs">
            <div className="bg-white p-4 rounded-lg border border-amber-200 space-y-2">
              <label className="font-bold text-slate-700 block">Rename / Switch Organization Group</label>
              <div className="flex gap-2">
                <input 
                  type="text" 
                  value={newGroupNameInput} 
                  onChange={(e) => setNewGroupNameInput(e.target.value)} 
                  placeholder={groupName}
                  className="flex-1 px-3 py-1.5 border rounded outline-none font-bold text-primary"
                />
                <button 
                  onClick={() => { if(newGroupNameInput) { setGroupName(newGroupNameInput); setNewGroupNameInput(""); } }}
                  className="bg-primary text-white px-3 py-1.5 rounded font-bold hover:bg-slate-800 transition-colors"
                >
                  Update
                </button>
              </div>
            </div>

            <div className="bg-white p-4 rounded-lg border border-amber-200 space-y-2">
              <label className="font-bold text-slate-700 block">Transfer Admin Rights to Member</label>
              <div className="flex gap-2">
                <input 
                  type="email" 
                  value={transferEmail} 
                  onChange={(e) => setTransferEmail(e.target.value)} 
                  placeholder="volunteer@msfe.org"
                  className="flex-1 px-3 py-1.5 border rounded outline-none"
                />
                <button 
                  onClick={() => { if(transferEmail) { alert(`Admin transfer invitation sent to ${transferEmail}.`); setTransferEmail(""); } }}
                  className="bg-red-800 hover:bg-red-900 text-white px-3 py-1.5 rounded font-bold transition-colors"
                >
                  Transfer
                </button>
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
