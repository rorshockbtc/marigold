"use client";

import React, { useState, useEffect } from 'react';
import Link from 'next/link';

interface Application {
  id: string;
  name: string;
  email: string;
  phone: string;
  note: string;
  date: string;
  status: 'pending' | 'approved' | 'rejected';
}

export default function GroupAdminSettingsPage() {
  const [groupName, setGroupName] = useState("Mississippi Fair Elections (MSFE Pilot)");
  const [website, setWebsite] = useState("https://msfe.org");
  const [jurisdiction, setJurisdiction] = useState("Mississippi (All 82 Counties)");
  const [savedMessage, setSavedMessage] = useState(false);

  const [applications, setApplications] = useState<Application[]>([
    { id: 'app-1', name: 'Robert Miller', email: 'robert.m@civicdata.org', phone: '(601) 555-0182', note: 'Rankin County volunteer analyst looking to assist with NCOA verification.', date: 'Today, 9:15 AM', status: 'pending' },
  ]);

  const [roster, setRoster] = useState([
    { name: 'Kyle (You)', email: 'kyle@msfe.org', role: '👑 Group Admin', joined: 'Founding Member' },
    { name: 'David Lead', email: 'dad@msfe.org', role: '👤 Group Member', joined: 'Active (Cartridge Sync Enabled)' },
    { name: 'Elena Vance', email: 'evance@civicdata.org', role: '👤 Group Member', joined: 'Active' }
  ]);

  useEffect(() => {
    const saved = localStorage.getItem("marigold_active_group");
    if (saved) setGroupName(saved);
  }, []);

  const handleApprove = (app: Application) => {
    setApplications(applications.map(a => a.id === app.id ? { ...a, status: 'approved' } : a));
    setRoster([...roster, { name: app.name, email: app.email, role: '👤 Group Member', joined: 'Just Approved' }]);
  };

  const handleReject = (app: Application) => {
    setApplications(applications.map(a => a.id === app.id ? { ...a, status: 'rejected' } : a));
  };

  const handleToggleRole = (email: string) => {
    setRoster(roster.map(m => {
      if (m.email === email) {
        const newRole = m.role === '👑 Group Admin' ? '👤 Group Member' : '👑 Group Admin';
        return { ...m, role: newRole };
      }
      return m;
    }));
  };

  const handleSaveProfile = (e: React.FormEvent) => {
    e.preventDefault();
    localStorage.setItem("marigold_active_group", groupName);
    setSavedMessage(true);
    setTimeout(() => setSavedMessage(false), 3000);
  };

  return (
    <div className="max-w-6xl mx-auto space-y-8 pb-20 pt-4 px-4 font-sans">
      {/* Navigation Header */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 border-b border-border pb-6">
        <div>
          <div className="flex items-center gap-2">
            <span className="text-xs font-bold uppercase tracking-wider px-2.5 py-1 rounded bg-amber-100 text-amber-900">
              👑 Organization Console
            </span>
          </div>
          <h1 className="text-3xl font-serif font-bold text-primary mt-1">Group Administration &amp; Roster Management</h1>
          <p className="text-sm text-muted-foreground">Manage your organization credentials, review applicant requests, and govern zero-PII cartridge broadcast rules.</p>
        </div>

        <div className="flex gap-3">
          <Link href="/dashboard" className="bg-slate-100 hover:bg-slate-200 text-slate-800 font-bold text-xs px-4 py-2.5 rounded-lg border border-slate-300 transition-colors">
            ← Return to Dashboard
          </Link>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Left Column: Group Credentials Editor */}
        <div className="bg-white p-6 rounded-2xl border border-border shadow-sm space-y-5">
          <div className="border-b border-border pb-3">
            <h3 className="font-bold text-lg text-primary">Organization Profile</h3>
            <p className="text-xs text-muted-foreground mt-0.5">Public details displayed on the onboarding directory.</p>
          </div>

          <form onSubmit={handleSaveProfile} className="space-y-4 text-xs">
            <div>
              <label className="font-bold text-slate-700 block mb-1">Group / Organization Title</label>
              <input 
                type="text" 
                value={groupName} 
                onChange={(e) => setGroupName(e.target.value)} 
                className="w-full px-3 py-2 border border-border rounded-lg font-medium text-sm text-slate-900 focus:border-amber-500 outline-none" 
              />
            </div>

            <div>
              <label className="font-bold text-slate-700 block mb-1">Official Website URL</label>
              <input 
                type="url" 
                value={website} 
                onChange={(e) => setWebsite(e.target.value)} 
                placeholder="https://yourgroup.org" 
                className="w-full px-3 py-2 border border-border rounded-lg font-medium text-sm text-slate-900 focus:border-amber-500 outline-none" 
              />
            </div>

            <div>
              <label className="font-bold text-slate-700 block mb-1">Jurisdiction Coverage Area</label>
              <input 
                type="text" 
                value={jurisdiction} 
                onChange={(e) => setJurisdiction(e.target.value)} 
                className="w-full px-3 py-2 border border-border rounded-lg font-medium text-sm text-slate-900 focus:border-amber-500 outline-none" 
              />
            </div>

            <div className="pt-2">
              <button type="submit" className="w-full bg-primary hover:bg-slate-800 text-white font-bold py-2.5 rounded-lg text-sm shadow transition-all">
                Save Credentials
              </button>
              {savedMessage && <p className="text-emerald-700 font-bold text-center pt-2">✓ Settings successfully updated</p>}
            </div>
          </form>
        </div>

        {/* Right Column: Applications Queue & Roster */}
        <div className="lg:col-span-2 space-y-8">
          {/* Applications Queue */}
          <div className="bg-white p-6 rounded-2xl border border-border shadow-sm space-y-4">
            <div className="flex justify-between items-center border-b border-border pb-3">
              <div>
                <h3 className="font-bold text-lg text-primary flex items-center gap-2">
                  📬 Membership Application Review Queue
                </h3>
                <p className="text-xs text-muted-foreground mt-0.5">Citizens requesting access to join your shared audit missions.</p>
              </div>
              <span className="bg-amber-100 text-amber-900 font-bold text-xs px-2.5 py-1 rounded-full">
                {applications.filter(a => a.status === 'pending').length} Pending
              </span>
            </div>

            <div className="divide-y divide-border">
              {applications.map(app => (
                <div key={app.id} className="py-4 space-y-3">
                  <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-2">
                    <div>
                      <div className="flex items-center gap-2">
                        <strong className="text-base text-primary font-bold">{app.name}</strong>
                        <span className="text-xs font-mono bg-slate-100 px-2 py-0.5 rounded text-slate-600">{app.email}</span>
                      </div>
                      <p className="text-xs font-semibold text-slate-500 mt-0.5">📞 Phone: <span className="text-slate-800 font-mono">{app.phone}</span> • Submitted: {app.date}</p>
                    </div>

                    <div className="flex gap-2">
                      {app.status === 'pending' ? (
                        <>
                          <button onClick={() => handleApprove(app)} className="bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-bold px-3 py-1.5 rounded shadow transition-colors">
                            Approve Access
                          </button>
                          <button onClick={() => handleReject(app)} className="bg-slate-200 hover:bg-slate-300 text-slate-800 text-xs font-bold px-3 py-1.5 rounded transition-colors">
                            Decline
                          </button>
                        </>
                      ) : (
                        <span className={`text-xs font-extrabold px-3 py-1 rounded uppercase ${app.status === 'approved' ? 'bg-emerald-100 text-emerald-800' : 'bg-red-100 text-red-800'}`}>
                          {app.status === 'approved' ? '✓ Approved Member' : '✕ Declined'}
                        </span>
                      )}
                    </div>
                  </div>

                  <div className="bg-slate-50 p-3 rounded-lg border border-slate-200 text-xs text-slate-700 italic">
                    &quot;{app.note}&quot;
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Active Roster Table */}
          <div className="bg-white p-6 rounded-2xl border border-border shadow-sm space-y-4">
            <div className="flex justify-between items-center border-b border-border pb-3">
              <div>
                <h3 className="font-bold text-lg text-primary">👥 Active Group Roster ({roster.length})</h3>
                <p className="text-xs text-muted-foreground mt-0.5">Members authorized to synchronize zero-PII summary cartridges.</p>
              </div>
              <span className="text-xs font-mono text-emerald-700 bg-emerald-50 px-2.5 py-1 rounded border border-emerald-200 font-bold">
                🔒 PII Cartridge Lock Active
              </span>
            </div>

            <div className="divide-y divide-border text-sm">
              {roster.map((m, idx) => (
                <div key={idx} className="py-3 flex flex-wrap justify-between items-center gap-2">
                  <div className="flex items-center gap-3">
                    <span className="w-2.5 h-2.5 rounded-full bg-emerald-500 shrink-0"></span>
                    <div>
                      <strong className="text-slate-900 block font-bold">{m.name}</strong>
                      <span className="text-xs font-mono text-slate-500">{m.email}</span>
                    </div>
                  </div>
                  <div className="flex items-center gap-3">
                    <div className="text-right">
                      <span className={`text-xs font-bold px-2.5 py-1 rounded block ${m.role === '👑 Group Admin' ? 'bg-amber-100 text-amber-950 font-extrabold' : 'bg-slate-100 text-slate-800'}`}>{m.role}</span>
                      <span className="text-[10px] text-muted-foreground mt-0.5 block">{m.joined}</span>
                    </div>
                    {m.email !== 'kyle@msfe.org' && (
                      <button
                        onClick={() => handleToggleRole(m.email)}
                        className="text-[11px] bg-slate-100 hover:bg-slate-200 text-slate-700 font-bold px-2.5 py-1.5 rounded border border-slate-300 transition-colors shrink-0"
                      >
                        {m.role === '👑 Group Admin' ? 'Demote to Member' : 'Promote to Admin'}
                      </button>
                    )}
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
