"use client";

import React, { useState } from 'react';
import { useRouter } from 'next/navigation';
import { useUser } from '@clerk/nextjs';
import Link from 'next/link';

interface StateGroup {
  id: string;
  name: string;
  state: string;
  website?: string;
  desc: string;
  memberCount: number;
}

const PUBLIC_GROUPS: StateGroup[] = [
  { id: 'msfe', name: 'Mississippi Fair Elections', state: 'Mississippi', website: 'https://msfe.org', desc: 'Non-partisan volunteer network verifying voter rolls across all 82 MS counties.', memberCount: 1 },
  { id: 'acme_sandbox', name: 'ACME Civic Data Sandbox (Demo Environment)', state: 'Other / Multi-State', desc: 'Synthetically generated sample roll environment for training and testing.', memberCount: 1 }
];

export default function OnboardingPage() {
  const router = useRouter();
  const { user, isLoaded } = useUser();
  const [step, setStep] = useState<1 | 2>(1);
  const [selectedState, setSelectedState] = useState("Mississippi");
  const [actionType, setActionType] = useState<'join' | 'create'>('join');
  const [legalAccepted, setLegalAccepted] = useState(false);

  // Profile & Existing Admin recognition
  const [customName, setCustomName] = useState("");
  const [existingGroup, setExistingGroup] = useState<string | null>(null);
  const [existingRole, setExistingRole] = useState<string | null>(null);

  // Join form state
  const [targetGroup, setTargetGroup] = useState<StateGroup | null>(PUBLIC_GROUPS[0]);
  const [inviteCodeInput, setInviteCodeInput] = useState("");
  const [applicantPhone, setApplicantPhone] = useState("");
  const [applicantNote, setApplicantNote] = useState("");
  const [requestSubmitted, setRequestSubmitted] = useState(false);

  // Create group state
  const [newGroupName, setNewGroupName] = useState("");
  const [newGroupWebsite, setNewGroupWebsite] = useState("");

  const userEmail = user?.primaryEmailAddress?.emailAddress || "";
  const fallbackName = user?.fullName || userEmail.split('@')[0] || "New Auditor";

  React.useEffect(() => {
    if (isLoaded) {
      const savedGroup = localStorage.getItem("marigold_active_group");
      const savedRole = localStorage.getItem("marigold_user_role");
      const savedName = localStorage.getItem("marigold_user_name");
      if (savedGroup) setExistingGroup(savedGroup);
      if (savedRole) setExistingRole(savedRole);
      setCustomName(savedName || fallbackName);
    }
  }, [isLoaded, fallbackName]);

  if (!isLoaded) {
    return (
      <div className="min-h-[70vh] flex items-center justify-center">
        <div className="animate-spin rounded-full h-10 w-10 border-b-2 border-amber-500"></div>
      </div>
    );
  }

  const handleCompleteOnboarding = (groupTitle: string, role: string) => {
    localStorage.setItem("marigold_active_group", groupTitle);
    localStorage.setItem("marigold_user_role", role);
    localStorage.setItem("marigold_user_name", customName || fallbackName);
    if (userEmail) {
      localStorage.setItem("marigold_user_email", userEmail);
    }
    if (newGroupWebsite) {
      localStorage.setItem("marigold_active_website", newGroupWebsite);
    }
    if (selectedState) {
      localStorage.setItem("marigold_active_jurisdiction", `${selectedState} Coverage Area`);
    }
    localStorage.setItem("marigold_onboarding_done", "true");
    router.push('/dashboard');
  };

  return (
    <div className="max-w-4xl mx-auto py-12 px-4 space-y-8">
      {/* Header Banner */}
      <div className="text-center space-y-3">
        <span className="bg-amber-100 text-amber-950 font-extrabold text-xs px-3.5 py-1.5 rounded-full uppercase tracking-wider">
          Step {step} of 2 • Workspace Setup
        </span>
        <h1 className="text-3xl sm:text-4xl font-serif font-bold text-primary">
          Welcome to Marigold Insights, {customName || fallbackName}
        </h1>
        <p className="text-muted-foreground text-sm max-w-xl mx-auto">
          Let&apos;s configure your zero-PII local analysis environment and connect you with your civic jurisdiction.
        </p>
      </div>

      {/* Existing Group Admin Banner */}
      {existingGroup && (
        <div className="bg-emerald-50 border-2 border-emerald-400 rounded-2xl p-6 shadow-md space-y-4 text-emerald-950 animate-in fade-in">
          <div className="flex flex-wrap justify-between items-center gap-2">
            <span className="bg-emerald-200 text-emerald-900 text-xs font-bold px-3 py-1 rounded-full uppercase tracking-wider">
              👑 Active Organization Detected
            </span>
            <span className="font-mono text-xs bg-white px-3 py-1 rounded border border-emerald-300">
              Role: {existingRole || 'Group Admin'}
            </span>
          </div>
          <h2 className="text-xl sm:text-2xl font-serif font-bold text-primary">
            Welcome back, {customName || fallbackName}! You are governing <strong>{existingGroup}</strong>.
          </h2>
          <p className="text-xs text-emerald-900 leading-relaxed">
            Your zero-PII local workspace is already connected. Enter your dashboard directly or manage new member applicants in group settings.
          </p>
          <div className="flex flex-wrap gap-3 pt-1">
            <button
              onClick={() => router.push('/dashboard')}
              className="bg-primary hover:bg-slate-800 text-white font-bold px-6 py-2.5 rounded-xl text-xs shadow transition-all"
            >
              Enter Dashboard →
            </button>
            <button
              onClick={() => router.push('/settings/group')}
              className="bg-white hover:bg-emerald-100 text-emerald-950 font-bold px-6 py-2.5 rounded-xl border border-emerald-400 text-xs shadow-sm transition-all"
            >
              ⚙️ Manage Roster & Apps
            </button>
            <button
              onClick={() => {
                localStorage.removeItem("marigold_active_group");
                setExistingGroup(null);
              }}
              className="text-xs text-slate-500 hover:text-red-600 font-bold underline px-2 py-2.5 ml-auto transition-colors"
            >
              Switch / Create New Group
            </button>
          </div>
        </div>
      )}

      {/* Step 1: Jurisdiction & Compliance */}
      {step === 1 && (
        <div className="bg-white rounded-2xl border border-border p-6 sm:p-8 shadow-md space-y-6 animate-in fade-in duration-200">
          <div className="border-b border-border pb-4">
            <h2 className="text-xl font-bold text-primary">1. Configure Profile &amp; Jurisdiction</h2>
            <p className="text-xs text-muted-foreground mt-0.5">Set your display title and select your state election record area.</p>
          </div>

          <div className="space-y-4">
            <div>
              <label className="text-sm font-bold text-slate-800 block mb-1">Your Full Name / Display Title *</label>
              <input
                type="text"
                value={customName}
                onChange={(e) => setCustomName(e.target.value)}
                placeholder="e.g., Kyle (Lead Auditor)"
                className="w-full h-12 px-4 rounded-xl border border-border bg-slate-50 text-base font-medium text-primary focus:ring-2 focus:ring-amber-500 outline-none"
              />
            </div>

            <div>
              <label className="text-sm font-bold text-slate-800 block mb-1">Which State Voter Rolls Will You Analyze?</label>
              <select
              value={selectedState}
              onChange={(e) => {
                setSelectedState(e.target.value);
                const match = PUBLIC_GROUPS.find(g => g.state === e.target.value);
                if (match) setTargetGroup(match);
              }}
              className="w-full h-12 px-4 rounded-xl border border-border bg-slate-50 text-base font-medium text-primary focus:ring-2 focus:ring-amber-500 outline-none"
            >
              <option value="Mississippi">Mississippi</option>
              <option value="Wyoming">Wyoming</option>
              <option value="Ohio">Ohio</option>
              <option value="Pennsylvania">Pennsylvania</option>
              <option value="Other / Multi-State">Other / Multi-State Jurisdiction</option>
            </select>
            </div>
          </div>

          {/* State Specific Legal & Privacy Notice */}
          <div className="bg-amber-50 border border-amber-300 rounded-xl p-5 space-y-3 text-xs text-amber-950">
            <div className="flex items-center gap-2 font-bold text-amber-900 text-sm">
              <span>⚠️ Notice on {selectedState} Public Record Access</span>
            </div>
            <p className="leading-relaxed">
              Official voter files in <strong>{selectedState}</strong> contain protected citizen information and are governed by state statute. By proceeding, you acknowledge that:
            </p>
            <ul className="list-disc pl-5 space-y-1 text-amber-900 font-medium">
              <li>You will never transmit or upload raw citizen files across public cloud servers.</li>
              <li>You will run all voter file analyses strictly inside your local browser memory using Marigold&apos;s zero-PII execution engine.</li>
              <li>Published group reports must contain only aggregate statistical summaries (Playbook Summaries) without individual PII.</li>
            </ul>
          </div>

          {/* Statutory Liability & Terms Acceptance Checkbox */}
          <div className="bg-slate-900 border border-slate-800 rounded-xl p-5 text-xs text-slate-300 space-y-3 shadow-inner">
            <label className="flex items-start gap-3 cursor-pointer">
              <input
                type="checkbox"
                checked={legalAccepted}
                onChange={(e) => setLegalAccepted(e.target.checked)}
                className="mt-0.5 h-4 w-4 rounded border-slate-700 bg-slate-800 text-amber-500 focus:ring-amber-500 shrink-0 cursor-pointer"
              />
              <span className="leading-relaxed">
                I acknowledge and agree to the <Link href="/terms" target="_blank" className="text-accent underline font-bold">Terms of Service &amp; Statutory Data Liability Agreement</Link> and <Link href="/privacy" target="_blank" className="text-accent underline font-bold">Zero-Knowledge Privacy Policy</Link>. I warrant that any civic dataset or voter roll spreadsheet connected locally to my browser tab complies with all applicable Secretary of State regulations and state election laws.
              </span>
            </label>
          </div>

          <div className="pt-4 flex justify-end">
            <button
              onClick={() => setStep(2)}
              disabled={!legalAccepted}
              className="bg-primary hover:bg-slate-800 disabled:opacity-40 disabled:cursor-not-allowed text-white font-bold px-8 py-3.5 rounded-xl shadow transition-all text-sm flex items-center gap-2"
            >
              <span>Continue to Organization Setup</span>
              <span>→</span>
            </button>
          </div>
        </div>
      )}

      {/* Step 2: Organization & Roster Path */}
      {step === 2 && (
        <div className="bg-white rounded-2xl border border-border p-6 sm:p-8 shadow-md space-y-6 animate-in fade-in duration-200">
          <div className="border-b border-border pb-4 flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
            <div>
              <h2 className="text-xl font-bold text-primary">2. Connect with an Organization Group</h2>
              <p className="text-xs text-muted-foreground mt-0.5">Collaborate securely by sharing aggregate audit playbooks with teammates.</p>
            </div>
            <button onClick={() => setStep(1)} className="text-xs text-slate-500 font-bold hover:underline">
              ← Back to Jurisdiction
            </button>
          </div>

          {/* Path Selector Tabs */}
          <div className="grid grid-cols-2 gap-4 bg-slate-100 p-1.5 rounded-xl border border-slate-200">
            <button
              onClick={() => { setActionType('join'); setRequestSubmitted(false); }}
              className={`py-3 rounded-lg font-bold text-sm transition-all ${actionType === 'join' ? 'bg-white text-primary shadow' : 'text-slate-600 hover:text-primary'}`}
            >
              🤝 Join Existing Group
            </button>
            <button
              onClick={() => setActionType('create')}
              className={`py-3 rounded-lg font-bold text-sm transition-all ${actionType === 'create' ? 'bg-white text-primary shadow' : 'text-slate-600 hover:text-primary'}`}
            >
              👑 Create New Group
            </button>
          </div>

          {/* JOIN EXISTING GROUP FLOW */}
          {actionType === 'join' && (
            <div className="space-y-6 pt-2">
              {/* Anti-Scraping UUID Lookup */}
              <div className="bg-slate-900 text-white p-5 rounded-2xl space-y-3 border border-slate-800 shadow-lg">
                <div className="flex items-center justify-between">
                  <span className="text-xs font-bold uppercase tracking-wider text-amber-400 flex items-center gap-1.5">
                    <span>🔒 Anti-Scraping Protected UUID Lookup</span>
                  </span>
                  <span className="text-[10px] bg-slate-800 text-slate-300 px-2.5 py-1 rounded font-mono border border-slate-700">Private Join Mode</span>
                </div>
                <p className="text-xs text-slate-300 leading-relaxed">
                  To protect citizen volunteer lists and client identities from automated scraping, many organizations hide from public directories. Enter your group invitation UUID or code below:
                </p>
                <div className="flex flex-col sm:flex-row gap-2.5">
                  <input
                    type="text"
                    value={inviteCodeInput}
                    onChange={(e) => setInviteCodeInput(e.target.value)}
                    placeholder="Enter Invite UUID or Code (e.g. MSFE-PILOT-8821)"
                    className="flex-1 bg-slate-800 border border-slate-600 rounded-xl px-3.5 py-2.5 text-xs text-white placeholder-slate-400 focus:outline-none focus:border-amber-500 font-mono"
                  />
                  <button
                    type="button"
                    onClick={() => {
                      const val = inviteCodeInput.toUpperCase();
                      if (val.includes("MSFE") || val.includes("MISS") || val.includes("PILOT")) {
                        setTargetGroup(PUBLIC_GROUPS[0]);
                      } else {
                        alert("Invalid Invitation Code. For testing, try typing 'MSFE-PILOT-8821'.");
                      }
                    }}
                    className="bg-amber-500 hover:bg-amber-400 text-slate-950 font-bold px-4 py-2.5 rounded-xl text-xs transition-colors shrink-0 shadow"
                  >
                    Lookup & Select Group →
                  </button>
                </div>
              </div>

              <div className="space-y-3">
                <label className="text-xs font-bold uppercase tracking-wider text-slate-500 block">Available Public Groups in {selectedState}:</label>
                <div className="grid grid-cols-1 gap-3">
                  {PUBLIC_GROUPS.filter(g => selectedState === "Other / Multi-State" || g.state === selectedState).map(group => (
                    <div
                      key={group.id}
                      onClick={() => setTargetGroup(group)}
                      className={`p-4 rounded-xl border-2 transition-all cursor-pointer flex justify-between items-center ${targetGroup?.id === group.id ? 'border-amber-500 bg-amber-50/40' : 'border-slate-200 hover:border-slate-300'}`}
                    >
                      <div className="space-y-1">
                        <div className="flex items-center gap-2">
                          <strong className="text-base text-primary font-bold">{group.name}</strong>
                          {group.website && (
                            <a href={group.website} target="_blank" rel="noopener noreferrer" onClick={(e) => e.stopPropagation()} className="text-xs bg-slate-100 text-slate-600 hover:bg-slate-200 px-2 py-0.5 rounded font-mono">
                              🌐 Official Website ↗
                            </a>
                          )}
                        </div>
                        <p className="text-xs text-muted-foreground">{group.desc}</p>
                      </div>
                      <span className="text-xs font-bold text-slate-600 bg-slate-100 px-3 py-1 rounded-full whitespace-nowrap">
                        👥 {group.memberCount} Members
                      </span>
                    </div>
                  ))}
                </div>
              </div>

              {targetGroup && !requestSubmitted ? (
                <div className="bg-slate-50 border border-slate-200 p-5 rounded-xl space-y-4">
                  <h3 className="font-bold text-sm text-primary">Request Membership Access for {targetGroup.name}</h3>
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-xs">
                    <div>
                      <label className="font-bold text-slate-700 block mb-1">Your Full Name</label>
                      <input type="text" value={customName} onChange={(e) => setCustomName(e.target.value)} className="w-full px-3 py-2 bg-white border border-slate-300 rounded-lg font-medium text-slate-900 focus:border-amber-500 outline-none" />
                    </div>
                    <div>
                      <label className="font-bold text-slate-700 block mb-1">Email Address</label>
                      <input type="email" readOnly value={userEmail} className="w-full px-3 py-2 bg-slate-200 border border-slate-300 rounded-lg font-medium text-slate-700" />
                    </div>
                    <div className="sm:col-span-2">
                      <label className="font-bold text-slate-700 block mb-1">Phone Number (Required for Auditor Verification)</label>
                      <input 
                        type="tel" 
                        value={applicantPhone} 
                        onChange={(e) => setApplicantPhone(e.target.value)} 
                        placeholder="(601) 555-0199" 
                        className="w-full px-3 py-2 bg-white border border-slate-300 rounded-lg font-medium text-slate-800 focus:border-amber-500 outline-none" 
                      />
                    </div>
                    <div className="sm:col-span-2">
                      <label className="font-bold text-slate-700 block mb-1">Message to Group Admin</label>
                      <textarea 
                        rows={2} 
                        value={applicantNote} 
                        onChange={(e) => setApplicantNote(e.target.value)} 
                        placeholder="Briefly state your volunteering interest or county jurisdiction..." 
                        className="w-full px-3 py-2 bg-white border border-slate-300 rounded-lg font-medium text-slate-800 focus:border-amber-500 outline-none" 
                      />
                    </div>
                  </div>

                  <button
                    onClick={() => {
                      const newApp = {
                        id: `APP-${Date.now()}`,
                        name: customName || "Volunteer Auditor",
                        email: userEmail || "volunteer@example.org",
                        phone: applicantPhone || "(601) 555-0199",
                        note: applicantNote || `Requesting access to ${targetGroup?.name || "group"} shared audit checklists.`,
                        date: new Date().toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' }),
                        status: 'pending'
                      };
                      try {
                        const existing = JSON.parse(localStorage.getItem("marigold_group_applications") || "[]");
                        localStorage.setItem("marigold_group_applications", JSON.stringify([...existing, newApp]));
                      } catch (e) {}
                      setRequestSubmitted(true);
                    }}
                    disabled={!applicantPhone}
                    className="w-full bg-accent hover:bg-amber-600 disabled:opacity-50 text-white font-bold py-3 rounded-xl shadow transition-all text-sm"
                  >
                    Submit Access Application to Group Lead
                  </button>
                </div>
              ) : requestSubmitted ? (
                <div className="bg-emerald-50 border border-emerald-300 p-6 rounded-xl text-center space-y-4 animate-in fade-in">
                  <div className="w-12 h-12 rounded-full bg-emerald-500 text-white font-bold text-2xl flex items-center justify-center mx-auto shadow">✓</div>
                  <h3 className="font-bold text-lg text-emerald-950">Membership Application Submitted!</h3>
                  <p className="text-xs text-emerald-900 max-w-md mx-auto leading-relaxed">
                    Your request has been forwarded to the <strong>{targetGroup?.name}</strong> administration queue. While awaiting approval, you have full access to run local zero-PII audits in your personal workspace.
                  </p>
                  <button
                    onClick={() => handleCompleteOnboarding(targetGroup?.name || "Civic Sandbox", "Pending Member")}
                    className="bg-primary hover:bg-slate-800 text-white font-bold px-8 py-3 rounded-xl text-sm shadow transition-all"
                  >
                    Enter Workspace Now →
                  </button>
                </div>
              ) : null}
            </div>
          )}

          {/* CREATE NEW GROUP FLOW */}
          {actionType === 'create' && (
            <div className="space-y-5 pt-2">
              <div className="bg-amber-50/60 border border-amber-200 p-4 rounded-xl text-xs text-amber-950">
                👑 Establishing a new organization grants you full Group Admin controls, application queue management, and summary playbook broadcasting.
              </div>

              <div className="space-y-4 text-sm">
                <div>
                  <label className="font-bold text-slate-800 block mb-1">Organization / Group Name *</label>
                  <input
                    type="text"
                    value={newGroupName}
                    onChange={(e) => setNewGroupName(e.target.value)}
                    placeholder="e.g., Madison County Civic Audit Coalition"
                    className="w-full px-4 py-2.5 border border-border rounded-xl font-medium focus:border-amber-500 outline-none"
                  />
                </div>

                <div>
                  <label className="font-bold text-slate-800 block mb-1">Official Organization Website URL (Optional)</label>
                  <input
                    type="url"
                    value={newGroupWebsite}
                    onChange={(e) => setNewGroupWebsite(e.target.value)}
                    placeholder="https://yourcivicgroup.org"
                    className="w-full px-4 py-2.5 border border-border rounded-xl font-medium focus:border-amber-500 outline-none"
                  />
                </div>
              </div>

              <button
                onClick={() => handleCompleteOnboarding(newGroupName || `${selectedState} Audit Group`, "👑 Group Admin")}
                disabled={!newGroupName}
                className="w-full bg-accent hover:bg-amber-600 disabled:opacity-50 text-white font-bold py-3.5 rounded-xl shadow transition-all text-sm flex items-center justify-center gap-2"
              >
                <span>Create Group &amp; Enter Dashboard</span>
                <span>→</span>
              </button>
            </div>
          )}
        </div>
      )}
    </div>
  );
}
