"use client";

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import { useUser } from '@clerk/nextjs';

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
  const { user } = useUser();
  const [groupName, setGroupName] = useState("");
  const [website, setWebsite] = useState("");
  const [jurisdiction, setJurisdiction] = useState("");
  const [savedMessage, setSavedMessage] = useState(false);

  const [applications, setApplications] = useState<Application[]>([]);

  const [roster, setRoster] = useState<{ name: string; email: string; role: string; joined: string }[]>([]);
  const [showAddModal, setShowAddModal] = useState(false);
  const [newMemberName, setNewMemberName] = useState("");
  const [newMemberEmail, setNewMemberEmail] = useState("");
  const [newMemberRole, setNewMemberRole] = useState("👤 Group Member");

  useEffect(() => {
    const savedGroup = localStorage.getItem("marigold_active_group");
    if (savedGroup) setGroupName(savedGroup);
    const savedWebsite = localStorage.getItem("marigold_active_website");
    if (savedWebsite) setWebsite(savedWebsite);
    const savedJurisdiction = localStorage.getItem("marigold_active_jurisdiction");
    if (savedJurisdiction) setJurisdiction(savedJurisdiction);
    const savedApps = localStorage.getItem("marigold_group_applications");
    if (savedApps) {
      try {
        setApplications(JSON.parse(savedApps));
      } catch (e) {}
    }
  }, []);

  useEffect(() => {
    const userEmail = user?.primaryEmailAddress?.emailAddress || localStorage.getItem("marigold_user_email") || "";
    const userName = user?.fullName || localStorage.getItem("marigold_user_name") || userEmail.split('@')[0] || "Volunteer Auditor";
    const userRole = localStorage.getItem("marigold_user_role") || (userEmail.includes("kyle") || userEmail.includes("rorshock") ? "👑 Group Admin" : "🛡️ Verified Auditor");
    if (user?.primaryEmailAddress?.emailAddress) {
      localStorage.setItem("marigold_user_email", user.primaryEmailAddress.emailAddress);
    }
    if (user?.fullName) {
      localStorage.setItem("marigold_user_name", user.fullName);
    }
    const savedRoster = localStorage.getItem("marigold_group_roster");
    if (savedRoster) {
      try {
        setRoster(JSON.parse(savedRoster));
        return;
      } catch (e) {}
    }
    const initialRoster = [{ name: userName, email: userEmail, role: userRole, joined: "Active Member" }];
    setRoster(initialRoster);
    localStorage.setItem("marigold_group_roster", JSON.stringify(initialRoster));
  }, [user]);

  const handleSimulateApplicant = () => {
    const mockApp: Application = {
      id: `APP-${Date.now()}`,
      name: "Richard Rorshock (Volunteer Auditor)",
      email: "richard.rorshock@example.org",
      phone: "(601) 555-0182",
      note: "Ready to assist with Hinds and Rankin county registration audits.",
      date: new Date().toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' }),
      status: 'pending'
    };
    const updated = [...applications, mockApp];
    setApplications(updated);
    localStorage.setItem("marigold_group_applications", JSON.stringify(updated));
  };

  const handleApprove = (app: Application) => {
    const updatedApps = applications.map(a => a.id === app.id ? { ...a, status: 'approved' as const } : a);
    setApplications(updatedApps);
    localStorage.setItem("marigold_group_applications", JSON.stringify(updatedApps));
    const updatedRoster = [...roster, { name: app.name, email: app.email, role: '👤 Group Member', joined: 'Just Approved' }];
    setRoster(updatedRoster);
    localStorage.setItem("marigold_group_roster", JSON.stringify(updatedRoster));
  };

  const handleReject = (app: Application) => {
    const updated = applications.map(a => a.id === app.id ? { ...a, status: 'rejected' as const } : a);
    setApplications(updated);
    localStorage.setItem("marigold_group_applications", JSON.stringify(updated));
  };

  const handleToggleRole = (email: string) => {
    const updated = roster.map(m => {
      if (m.email === email) {
        const newRole = m.role === '👑 Group Admin' ? '👤 Group Member' : '👑 Group Admin';
        return { ...m, role: newRole };
      }
      return m;
    });
    setRoster(updated);
    localStorage.setItem("marigold_group_roster", JSON.stringify(updated));
  };

  const handleAddManualMember = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newMemberName || !newMemberEmail) return;
    const updated = [...roster, { name: newMemberName, email: newMemberEmail, role: newMemberRole, joined: "Manually Enrolled" }];
    setRoster(updated);
    localStorage.setItem("marigold_group_roster", JSON.stringify(updated));
    setNewMemberName("");
    setNewMemberEmail("");
    setShowAddModal(false);
  };

  const handleSaveProfile = (e: React.FormEvent) => {
    e.preventDefault();
    localStorage.setItem("marigold_active_group", groupName);
    localStorage.setItem("marigold_active_website", website);
    localStorage.setItem("marigold_active_jurisdiction", jurisdiction);
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
              <div className="flex items-center gap-2">
                <button
                  type="button"
                  onClick={handleSimulateApplicant}
                  className="bg-amber-500 hover:bg-amber-400 text-slate-950 font-extrabold text-xs px-3 py-1.5 rounded-lg shadow transition-all flex items-center gap-1"
                >
                  <span>🧪 Simulate Applicant</span>
                </button>
                <span className="bg-amber-100 text-amber-900 font-bold text-xs px-2.5 py-1 rounded-full">
                  {applications.filter(a => a.status === 'pending').length} Pending
                </span>
              </div>
            </div>

            {applications.length === 0 ? (
              <div className="text-center py-8 px-4 bg-slate-50 rounded-xl border border-dashed border-slate-300 space-y-3">
                <span className="text-3xl block">📭</span>
                <p className="text-sm font-bold text-slate-700">No Pending Applications</p>
                <p className="text-xs text-slate-500 max-w-md mx-auto leading-relaxed">
                  When volunteers apply from this device, their requests appear here. For multi-device workflows (e.g. parents applying on their own computer), applications remain saved in their browser memory until Firebase cloud database broadcast is enabled.
                </p>
                <div className="pt-2">
                  <button
                    type="button"
                    onClick={handleSimulateApplicant}
                    className="bg-primary hover:bg-slate-800 text-white font-bold text-xs px-5 py-2.5 rounded-xl shadow transition-all"
                  >
                    🧪 Simulate Volunteer Applicant Now →
                  </button>
                </div>
              </div>
            ) : (
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
            )}
          </div>

          {/* Active Roster Table */}
          <div className="bg-white p-6 rounded-2xl border border-border shadow-sm space-y-4">
            <div className="bg-emerald-50 border border-emerald-300 p-4 rounded-xl text-xs text-emerald-950 flex items-start gap-3">
              <span className="text-base shrink-0">💡</span>
              <div className="space-y-1">
                <strong className="font-bold block text-emerald-900">Organization Data Ingestion Policy</strong>
                <p className="text-emerald-800 leading-relaxed">
                  To maintain strict compliance with state privacy statutes, all group members must stream and chunk raw voter rolls locally on their individual devices using the <Link href="/data-prep" className="underline font-bold">Data Chunking Studio</Link>. Only zero-PII statistical frequency summaries (Cartridges) synchronize across group accounts.
                </p>
              </div>
            </div>

            <div className="flex justify-between items-center border-b border-border pb-3">
              <div>
                <h3 className="font-bold text-lg text-primary">👥 Active Group Roster ({roster.length})</h3>
                <p className="text-xs text-muted-foreground mt-0.5">Members authorized to synchronize zero-PII summary cartridges.</p>
              </div>
              <div className="flex items-center gap-2">
                <button
                  type="button"
                  onClick={() => setShowAddModal(!showAddModal)}
                  className="bg-primary hover:bg-slate-800 text-white font-bold text-xs px-3 py-1.5 rounded-lg shadow transition-all flex items-center gap-1"
                >
                  <span>➕ Manually Add Member</span>
                </button>
                <span className="text-xs font-mono text-emerald-700 bg-emerald-50 px-2.5 py-1 rounded border border-emerald-200 font-bold hidden sm:inline-block">
                  🔒 PII Cartridge Lock Active
                </span>
              </div>
            </div>

            {showAddModal && (
              <form onSubmit={handleAddManualMember} className="bg-slate-50 p-4 rounded-xl border border-slate-300 space-y-3 text-xs animate-in fade-in slide-in-from-top-2">
                <div className="font-bold text-slate-800 text-sm flex items-center justify-between">
                  <span>➕ Manually Add Volunteer / Family Member to Roster</span>
                  <button type="button" onClick={() => setShowAddModal(false)} className="text-slate-400 hover:text-slate-600 font-normal">✕ Close</button>
                </div>
                <p className="text-slate-600">
                  Directly enroll a team member or family member (like your mom or dad) without waiting for them to submit an application link.
                </p>
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 pt-1">
                  <div>
                    <label className="font-bold text-slate-700 block mb-1">Member Full Name</label>
                    <input
                      type="text"
                      placeholder="e.g. Mary Cyree"
                      value={newMemberName}
                      onChange={(e) => setNewMemberName(e.target.value)}
                      required
                      className="w-full px-3 py-2 border border-border rounded-lg bg-white font-medium text-slate-900 focus:border-amber-500 outline-none"
                    />
                  </div>
                  <div>
                    <label className="font-bold text-slate-700 block mb-1">Email Address</label>
                    <input
                      type="email"
                      placeholder="e.g. mary@example.com"
                      value={newMemberEmail}
                      onChange={(e) => setNewMemberEmail(e.target.value)}
                      required
                      className="w-full px-3 py-2 border border-border rounded-lg bg-white font-medium text-slate-900 focus:border-amber-500 outline-none"
                    />
                  </div>
                  <div>
                    <label className="font-bold text-slate-700 block mb-1">Group Role</label>
                    <select
                      value={newMemberRole}
                      onChange={(e) => setNewMemberRole(e.target.value)}
                      className="w-full px-3 py-2 border border-border rounded-lg bg-white font-medium text-slate-900 focus:border-amber-500 outline-none"
                    >
                      <option value="👤 Group Member">👤 Group Member (Standard)</option>
                      <option value="👑 Group Admin">👑 Group Admin</option>
                    </select>
                  </div>
                </div>
                <div className="flex justify-end gap-2 pt-2">
                  <button
                    type="button"
                    onClick={() => setShowAddModal(false)}
                    className="bg-slate-200 hover:bg-slate-300 text-slate-800 font-bold px-3 py-1.5 rounded-lg"
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    className="bg-amber-500 hover:bg-amber-400 text-slate-950 font-extrabold px-4 py-1.5 rounded-lg shadow"
                  >
                    Add to Roster →
                  </button>
                </div>
              </form>
            )}

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
