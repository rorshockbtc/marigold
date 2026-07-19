"use client";

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import { useUser } from '@clerk/nextjs';
import { Button } from '@/components/ui/Button';
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/Card';
import { Badge } from '@/components/ui/Badge';
import { Input } from '@/components/ui/Input';

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

  const isDemoMode = typeof window !== 'undefined' && (localStorage.getItem("marigold_active_group") === "State of Roosevelt (Demo)");

  useEffect(() => {
    const savedGroup = localStorage.getItem("marigold_active_group");
    if (savedGroup) setGroupName(savedGroup);
    const savedWebsite = localStorage.getItem("marigold_active_website");
    if (savedWebsite) setWebsite(savedWebsite);
    const savedJurisdiction = localStorage.getItem("marigold_active_jurisdiction");
    if (savedJurisdiction) setJurisdiction(savedJurisdiction);

    const appsKey = (savedGroup === "State of Roosevelt (Demo)") ? "marigold_demo_applications" : "marigold_group_applications";
    const savedApps = localStorage.getItem(appsKey);
    if (savedApps) {
      try {
        setApplications(JSON.parse(savedApps));
      } catch (e) {}
    } else if (savedGroup === "State of Roosevelt (Demo)") {
      const demoApps: Application[] = [{
        id: `APP-DEMO-1`,
        name: "Elena Rostova (Franklin County Auditor)",
        email: "elena.rostova@roosevelt.gov",
        phone: "(991) 555-0199",
        note: "Ready to assist with Franklin and Roosevelt County registration audits.",
        date: "Jul 15, 2026",
        status: 'pending'
      }];
      setApplications(demoApps);
      localStorage.setItem(appsKey, JSON.stringify(demoApps));
    }
  }, []);

  useEffect(() => {
    const savedGroup = localStorage.getItem("marigold_active_group") || "State of Roosevelt (Demo)";
    const rosterKey = (savedGroup === "State of Roosevelt (Demo)") ? "marigold_demo_roster" : "marigold_group_roster";
    const savedRoster = localStorage.getItem(rosterKey);
    if (savedRoster) {
      try {
        setRoster(JSON.parse(savedRoster));
        return;
      } catch (e) {}
    }

    if (savedGroup === "State of Roosevelt (Demo)") {
      const demoRoster = [
        { name: "Sarah Jenkins (Roosevelt Admin)", email: "s.jenkins@roosevelt.gov", role: "👑 Group Admin", joined: "Active Member" },
        { name: "Marcus Vance (Data Lead)", email: "m.vance@roosevelt.gov", role: "👤 Group Member", joined: "Verified Auditor" },
        { name: "David Chen (Audit Volunteer)", email: "david.chen@roosevelt.org", role: "👤 Group Member", joined: "Active Member" }
      ];
      setRoster(demoRoster);
      localStorage.setItem(rosterKey, JSON.stringify(demoRoster));
      return;
    }

    const userEmail = user?.primaryEmailAddress?.emailAddress || localStorage.getItem("marigold_user_email") || "";
    const userName = user?.fullName || localStorage.getItem("marigold_user_name") || userEmail.split('@')[0] || "Volunteer Auditor";
    const userRole = localStorage.getItem("marigold_user_role") || (userEmail.includes("kyle") || userEmail.includes("rorshock") ? "👑 Group Admin" : "🛡️ Verified Auditor");
    
    if (user?.primaryEmailAddress?.emailAddress) {
      localStorage.setItem("marigold_user_email", user.primaryEmailAddress.emailAddress);
    }
    if (user?.fullName) {
      localStorage.setItem("marigold_user_name", user.fullName);
    }
    const initialRoster = [{ name: userName, email: userEmail, role: userRole, joined: "Active Member" }];
    setRoster(initialRoster);
    localStorage.setItem(rosterKey, JSON.stringify(initialRoster));
  }, [user]);

  const handleSimulateApplicant = () => {
    const appsKey = isDemoMode ? "marigold_demo_applications" : "marigold_group_applications";
    const mockApp: Application = isDemoMode ? {
      id: `APP-DEMO-${Date.now()}`,
      name: "Marcus Vance (Franklin County Volunteer)",
      email: "marcus.vance@roosevelt.org",
      phone: "(991) 555-0144",
      note: "Requesting access to verify commercial P.O. Box matches across Roosevelt City.",
      date: new Date().toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' }),
      status: 'pending'
    } : {
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
    localStorage.setItem(appsKey, JSON.stringify(updated));
  };

  const handleApprove = (app: Application) => {
    const appsKey = isDemoMode ? "marigold_demo_applications" : "marigold_group_applications";
    const rosterKey = isDemoMode ? "marigold_demo_roster" : "marigold_group_roster";
    const updatedApps = applications.map(a => a.id === app.id ? { ...a, status: 'approved' as const } : a);
    setApplications(updatedApps);
    localStorage.setItem(appsKey, JSON.stringify(updatedApps));
    const updatedRoster = [...roster, { name: app.name, email: app.email, role: '👤 Group Member', joined: 'Just Approved' }];
    setRoster(updatedRoster);
    localStorage.setItem(rosterKey, JSON.stringify(updatedRoster));
  };

  const handleReject = (app: Application) => {
    const appsKey = isDemoMode ? "marigold_demo_applications" : "marigold_group_applications";
    const updated = applications.map(a => a.id === app.id ? { ...a, status: 'rejected' as const } : a);
    setApplications(updated);
    localStorage.setItem(appsKey, JSON.stringify(updated));
  };

  const handleToggleRole = (email: string) => {
    const rosterKey = isDemoMode ? "marigold_demo_roster" : "marigold_group_roster";
    const updated = roster.map(m => {
      if (m.email === email) {
        const newRole = m.role === '👑 Group Admin' ? '👤 Group Member' : '👑 Group Admin';
        return { ...m, role: newRole };
      }
      return m;
    });
    setRoster(updated);
    localStorage.setItem(rosterKey, JSON.stringify(updated));
  };

  const handleAddManualMember = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newMemberName || !newMemberEmail) return;
    const rosterKey = isDemoMode ? "marigold_demo_roster" : "marigold_group_roster";
    const updated = [...roster, { name: newMemberName, email: newMemberEmail, role: newMemberRole, joined: "Manually Enrolled" }];
    setRoster(updated);
    localStorage.setItem(rosterKey, JSON.stringify(updated));
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
            <Badge variant="warning">👑 Organization Console</Badge>
          </div>
          <h1 className="text-3xl font-serif font-black text-primary mt-2">Group Administration &amp; Roster Management</h1>
          <p className="text-sm text-muted-foreground font-medium">Manage your organization credentials, review applicant requests, and govern zero-PII Playbook broadcast rules.</p>
        </div>

        <div className="flex gap-3">
          <Link href="/dashboard">
            <Button variant="secondary" size="md">
              ← Return to Dashboard
            </Button>
          </Link>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Left Column: Group Credentials Editor */}
        <Card>
          <CardHeader>
            <CardTitle>Organization Profile</CardTitle>
            <p className="text-xs text-muted-foreground mt-0.5">Public details displayed on the onboarding directory.</p>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleSaveProfile} className="space-y-4">
              <Input
                label="Group / Organization Title"
                value={groupName}
                onChange={(e) => setGroupName(e.target.value)}
              />
              <Input
                label="Official Website URL"
                type="url"
                placeholder="https://yourgroup.org"
                value={website}
                onChange={(e) => setWebsite(e.target.value)}
              />
              <Input
                label="Jurisdiction Coverage Area"
                value={jurisdiction}
                onChange={(e) => setJurisdiction(e.target.value)}
              />
              <div className="pt-2">
                <Button type="submit" variant="primary" className="w-full">
                  Save Credentials
                </Button>
                {savedMessage && <p className="text-emerald-700 font-bold text-center pt-2 text-xs">✓ Settings successfully updated</p>}
              </div>
            </form>
          </CardContent>
        </Card>

        {/* Right Column: Applications Queue & Roster */}
        <div className="lg:col-span-2 space-y-8">
          {/* Applications Queue */}
          <Card>
            <div className="flex justify-between items-center border-b border-border pb-4 mb-4">
              <div>
                <CardTitle className="flex items-center gap-2">
                  📬 Membership Application Review Queue
                </CardTitle>
                <p className="text-xs text-muted-foreground mt-0.5">Citizens requesting access to join your shared audit missions.</p>
              </div>
              <div className="flex items-center gap-2">
                <Button onClick={handleSimulateApplicant} variant="outline" size="sm">
                  🧪 Simulate Applicant
                </Button>
                <Badge variant="warning">{applications.filter(a => a.status === 'pending').length} Pending</Badge>
              </div>
            </div>
            
            <CardContent>
              {applications.length === 0 ? (
                <div className="text-center py-8 px-4 bg-slate-50 rounded-xl border border-dashed border-slate-300 space-y-4">
                  <span className="text-3xl block">📭</span>
                  <p className="text-sm font-bold text-slate-700">No Pending Applications</p>
                  <p className="text-xs text-slate-500 max-w-md mx-auto leading-relaxed">
                    When volunteers apply from this device, their requests appear here. For multi-device workflows (e.g. parents applying on their own computer), applications remain saved in their browser memory until Firebase cloud database broadcast is enabled.
                  </p>
                  <Button onClick={handleSimulateApplicant} variant="primary">
                    🧪 Simulate Volunteer Applicant Now →
                  </Button>
                </div>
              ) : (
                <div className="divide-y divide-border">
                  {applications.map(app => (
                    <div key={app.id} className="py-4 space-y-3">
                      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-2">
                        <div>
                          <div className="flex items-center gap-2">
                            <strong className="text-base text-primary font-bold">{app.name}</strong>
                            <Badge variant="default" className="normal-case tracking-normal font-mono">{app.email}</Badge>
                          </div>
                          <p className="text-xs font-semibold text-slate-500 mt-0.5">📞 Phone: <span className="text-slate-800 font-mono">{app.phone}</span> • Submitted: {app.date}</p>
                        </div>

                        <div className="flex gap-2">
                          {app.status === 'pending' ? (
                            <>
                              <Button onClick={() => handleApprove(app)} variant="success" size="sm">Approve Access</Button>
                              <Button onClick={() => handleReject(app)} variant="secondary" size="sm">Decline</Button>
                            </>
                          ) : (
                            <Badge variant={app.status === 'approved' ? 'success' : 'danger'}>
                              {app.status === 'approved' ? '✓ Approved Member' : '✕ Declined'}
                            </Badge>
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
            </CardContent>
          </Card>

          {/* Active Roster Table */}
          <Card>
            <CardHeader className="border-b-0 pb-0">
              <div className="bg-emerald-50 border border-emerald-300 p-4 rounded-xl text-xs text-emerald-950 flex items-start gap-3 mb-4">
                <span className="text-base shrink-0">💡</span>
                <div className="space-y-1">
                  <strong className="font-bold block text-emerald-900">Organization Data Ingestion Policy</strong>
                  <p className="text-emerald-800 leading-relaxed">
                    To maintain strict compliance with state privacy statutes, all group members must stream and chunk raw voter rolls locally on their individual devices using the <Link href="/data-prep" className="underline font-bold">Data Chunking Studio</Link>. Only zero-PII statistical frequency summaries (Shared Playbooks) synchronize across group accounts.
                  </p>
                </div>
              </div>
              <div className="flex justify-between items-center border-b border-border pb-4">
                <div>
                  <CardTitle>👥 Active Group Roster ({roster.length})</CardTitle>
                  <p className="text-xs text-muted-foreground mt-0.5">Members authorized to synchronize zero-PII Shared Playbooks.</p>
                </div>
                <div className="flex items-center gap-2">
                  <Button onClick={() => setShowAddModal(!showAddModal)} variant="primary" size="sm">
                    ➕ Manually Add Member
                  </Button>
                  <Badge variant="success" className="hidden sm:inline-flex">🔒 PII Playbook Lock Active</Badge>
                </div>
              </div>
            </CardHeader>
            <CardContent>
              {showAddModal && (
                <form onSubmit={handleAddManualMember} className="bg-slate-50 p-5 rounded-xl border border-slate-300 space-y-4 mb-4">
                  <div className="font-bold text-slate-800 text-sm flex items-center justify-between">
                    <span>➕ Manually Add Volunteer / Auditor to Roster</span>
                    <button type="button" onClick={() => setShowAddModal(false)} className="text-slate-600 hover:text-slate-600 font-normal">✕ Close</button>
                  </div>
                  <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                    <Input
                      label="Member Full Name"
                      value={newMemberName}
                      onChange={(e) => setNewMemberName(e.target.value)}
                      required
                    />
                    <Input
                      label="Email Address"
                      type="email"
                      value={newMemberEmail}
                      onChange={(e) => setNewMemberEmail(e.target.value)}
                      required
                    />
                    <div className="flex flex-col gap-1.5 w-full">
                      <label className="text-xs font-bold text-muted-foreground tracking-wide uppercase">Group Role</label>
                      <select
                        value={newMemberRole}
                        onChange={(e) => setNewMemberRole(e.target.value)}
                        className="flex h-11 w-full rounded-xl border border-border bg-white px-3.5 py-2.5 text-sm shadow-sm focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-accent"
                      >
                        <option value="👤 Group Member">👤 Group Member (Standard)</option>
                        <option value="👑 Group Admin">👑 Group Admin</option>
                      </select>
                    </div>
                  </div>
                  <div className="flex justify-end gap-2 pt-2">
                    <Button type="button" onClick={() => setShowAddModal(false)} variant="secondary">Cancel</Button>
                    <Button type="submit" variant="primary">Add to Roster →</Button>
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
                        <Badge variant={m.role === '👑 Group Admin' ? 'warning' : 'default'} className="mb-1">{m.role}</Badge>
                        <span className="text-[10px] text-muted-foreground block">{m.joined}</span>
                      </div>
                      {m.email !== 'kyle@msfe.org' && (
                        <Button onClick={() => handleToggleRole(m.email)} variant="secondary" size="sm" className="text-[11px] h-8 px-2.5">
                          {m.role === '👑 Group Admin' ? 'Demote to Member' : 'Promote to Admin'}
                        </Button>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}
