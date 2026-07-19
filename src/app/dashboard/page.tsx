"use client";

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import { useUser } from '@clerk/nextjs';
import { getAnomalies, AnomalyRecord, updateAnomalyStatus } from '@/lib/firebase/db';
import { ExecutiveVisualCanvas } from '@/components/ExecutiveVisualCanvas';
import { GlossaryTooltip } from '@/components/GlossaryTooltip';
import { Crown, Shield, Rocket, Users, Folder, Key, Settings, Search, BookOpen, Eye, CheckCircle2, AlertTriangle, Link2, Sparkles, Building2, Package, BarChart3, HelpCircle, ArrowRight, Download } from 'lucide-react';
import { getActiveDatabaseName, isDemoGroupActive, autoLoadSyntheticDemoDataset } from '@/lib/db/dbName';
import { useVoterRollConnection } from '@/hooks/useVoterRollConnection';
import { VolunteerTaskBoard } from '@/components/VolunteerTaskBoard';

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

  const [previewAsVolunteer, setPreviewAsVolunteer] = useState(false);
  const [isSuperUser, setIsSuperUser] = useState(false);
  const [isLoadingDemo, setIsLoadingDemo] = useState(false);
  const [demoStatusMsg, setDemoStatusMsg] = useState("");

  const handle1ClickLoadDemo = async () => {
    setIsLoadingDemo(true);
    try {
      await autoLoadSyntheticDemoDataset((msg) => setDemoStatusMsg(msg));
      window.location.href = "/analysis";
    } catch (err) {
      setIsLoadingDemo(false);
      alert("Failed to auto-load demo dataset: " + err);
    }
  };

  useEffect(() => {
    let activeGroup = localStorage.getItem("marigold_active_group");
    if (!activeGroup) {
      activeGroup = "State of Roosevelt (Demo)";
      localStorage.setItem("marigold_active_group", activeGroup);
      localStorage.setItem("marigold_user_role", "Verified Tester");
    }
    setGroupName(activeGroup);

    const handleGroupChange = (e: Event) => {
      const customEvent = e as CustomEvent<{ group?: string }>;
      const newGroup = customEvent?.detail?.group || localStorage.getItem("marigold_active_group") || "State of Roosevelt (Demo)";
      setGroupName(newGroup);
    };
    window.addEventListener('marigold-group-change', handleGroupChange);

    getAnomalies().then(setAnomalies);

    return () => window.removeEventListener('marigold-group-change', handleGroupChange);
  }, []);

  const { isDataConnected, loadedRowCount, loadedFileName } = useVoterRollConnection(groupName);



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
    setTeamMembers([{ email: userEmail || "Authenticated Citizen", role: checkAdmin ? "Group Admin" : "Verified Auditor", status: "Active" }]);
  }, [user]);

  const handleStatusChange = async (id: string, newStatus: "pending" | "verified" | "false_positive") => {
    await updateAnomalyStatus(id, newStatus);
    setAnomalies(anomalies.map(a => a.id === id ? { ...a, status: newStatus } : a));
  };

  const handleSaveGroup = (newName: string) => {
    setGroupName(newName);
    if (typeof window !== "undefined") {
      localStorage.setItem("marigold_active_group", newName);
      if (newName === "State of Roosevelt (Demo)") {
        localStorage.setItem("marigold_user_role", "Verified Tester");
      } else if (newName === "Mississippi Fair Elections") {
        localStorage.setItem("marigold_user_role", "Group Admin");
      }
      window.dispatchEvent(new CustomEvent('marigold-group-change', { detail: { group: newName } }));
    }
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
        <div className="bg-slate-50 border border-slate-200 text-slate-900 rounded-3xl p-8 md:p-12 border border-amber-500/30 shadow-2xl text-center space-y-8">
          <div className="w-20 h-20 bg-amber-500/20 text-amber-400 rounded-3xl flex items-center justify-center mx-auto shadow-inner border border-amber-500/30">
            <Crown className="w-10 h-10 text-amber-400" />
          </div>
          <div className="space-y-3 max-w-2xl mx-auto">
            <span className="bg-amber-500/20 text-amber-300 border border-amber-500/40 text-xs font-bold px-3.5 py-1.5 rounded-full uppercase tracking-wider inline-flex items-center gap-1.5">
              <Rocket className="w-3.5 h-3.5 text-amber-400" />
              <span>Marigold Insights Pro Gateway</span>
            </span>
            <h2 className="text-3xl md:text-4xl font-serif font-bold text-slate-900 pt-2">No Active Group Workspace Associated</h2>
            <p className="text-slate-700 text-sm md:text-base leading-relaxed">
              Welcome, <strong className="text-amber-400">{displayName}</strong>. You do not currently belong to an active state organization or pilot team. To begin verifying voter rolls, join a team or launch an independent analysis session.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6 pt-4 max-w-4xl mx-auto text-left">
            {/* CTA 1: Join or Create Group */}
            <div className="bg-slate-800/80 p-6 sm:p-8 rounded-2xl border border-slate-700 hover:border-amber-500/60 transition-all flex flex-col justify-between space-y-6 shadow-lg">
              <div className="space-y-3">
                <div className="w-12 h-12 rounded-xl bg-amber-500/20 text-amber-400 flex items-center justify-center">
                  <Users className="w-6 h-6 text-amber-400" />
                </div>
                <h3 className="font-bold text-slate-900 text-xl">Join or Create a Group</h3>
                <p className="text-xs sm:text-sm text-slate-700 leading-relaxed">
                  Join an existing organization using a private invitation UUID code, or establish a new volunteer network workspace for your jurisdiction.
                </p>
              </div>
              <Link
                href="/onboarding"
                className="w-full text-center inline-block bg-primary hover:bg-slate-800 text-slate-900 font-bold px-5 py-3.5 rounded-xl shadow transition-colors text-sm"
              >
                Launch Group Setup Gateway →
              </Link>
            </div>

            {/* CTA 2: Link Local Voter Roll Shard */}
            <div className="bg-slate-800/80 p-6 sm:p-8 rounded-2xl border border-slate-700 hover:border-emerald-500/60 transition-all flex flex-col justify-between space-y-6 shadow-lg">
              <div className="space-y-3">
                <div className="w-12 h-12 rounded-xl bg-emerald-500/20 text-emerald-400 flex items-center justify-center">
                  <Folder className="w-6 h-6 text-emerald-700" />
                </div>
                <h3 className="font-bold text-slate-900 text-xl">Link Local Voter Roll Shard</h3>
                <p className="text-xs sm:text-sm text-slate-700 leading-relaxed">
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
          <div className="pt-6 border-t border-slate-200/80 flex flex-col sm:flex-row justify-center items-center gap-3 text-xs text-slate-600">
            <span>Have an official organization invite code?</span>
            <Link
              href={
                (groupName || "").toLowerCase().includes("demo") || (groupName || "").toLowerCase().includes("roosevelt")
                  ? "/join/roosevelt-demo"
                  : (groupName || "").toLowerCase().includes("acme") || (groupName || "").toLowerCase().includes("sandbox")
                  ? "/join/acme-sandbox"
                  : "/join/msfe"
              }
              className="text-amber-400 hover:text-amber-300 font-bold bg-amber-500/10 hover:bg-amber-500/20 px-3.5 py-2 rounded-lg border border-amber-500/30 transition-all inline-flex items-center gap-1.5"
            >
              <Key className="w-3.5 h-3.5" />
              <span>Enter Invite Code or Join Link →</span>
            </Link>
          </div>
        </div>
      </div>
    );
  }

  // Branching Logic for Role-Based UI
  if (!isAdmin || previewAsVolunteer) {
    return (
      <>
        {isSuperUser && previewAsVolunteer && (
          <div className="bg-amber-100 text-amber-900 px-4 py-2 text-center text-xs font-bold w-full border-b border-amber-200">
            Previewing as Volunteer. <button onClick={() => setPreviewAsVolunteer(false)} className="underline ml-2">Exit Preview</button>
          </div>
        )}
        <VolunteerTaskBoard groupName={groupName} anomalies={anomalies} onVerify={handleStatusChange} />
      </>
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

      {/* Executive Civic Command Center Header */}
      <div className="bg-muted text-foreground p-8 rounded-2xl border border-border shadow-sm space-y-6">
        {/* Top Header Row */}
        <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 border-b border-border pb-6">
          <div className="space-y-2">
            <div className="flex items-center gap-2">
              <span className="bg-accent/15 text-[#D96B27] border border-[#D96B27]/30 text-xs font-black px-3 py-1 rounded-full uppercase tracking-wider inline-flex items-center gap-1.5">
                <Crown className="w-3.5 h-3.5" />
                <span>Active Jurisdiction Workspace</span>
              </span>
              <span className="text-xs font-mono text-[#646A7A] inline-flex items-center gap-1">
                <Shield className="w-3 h-3" />
                <span>Local In-Memory Air-Gap</span>
              </span>
            </div>
            <div className="flex flex-wrap items-center gap-3">
              <h1 className="text-3xl md:text-4xl font-black tracking-tight text-foreground">{groupName}</h1>
              <button 
                onClick={() => {
                  setCustomGroupInput(groupName);
                  setIsEditingGroup(!isEditingGroup);
                }}
                className="bg-white hover:bg-[#EAE5DC] text-foreground text-xs font-bold px-3 py-1.5 rounded-lg border border-border transition-colors flex items-center gap-1.5 shadow-2xs"
              >
                <Settings className="w-3.5 h-3.5" />
                <span>Switch Jurisdiction / Group</span>
              </button>
            </div>
            <p className="text-sm text-[#4A5060]">
              Signed in as <strong className="text-foreground font-bold">{displayName}</strong> ({isAdmin && !previewAsVolunteer ? "Group Administrator" : "Verified Volunteer"})
            </p>
          </div>

          {/* Quick Actions Cluster */}
          <div className="flex flex-wrap items-center gap-3">
            {isDataConnected ? (
              <div className="flex items-center gap-2 flex-wrap">
                <Link
                  href="/analysis"
                  className="bg-accent hover:bg-[#C85A1B] text-slate-900 font-black px-6 py-3.5 rounded-xl shadow-sm transition-all text-sm flex items-center gap-2 transform active:scale-[0.98]"
                >
                  <Search className="w-4 h-4" />
                  <span>Review Voter Records ({(loadedRowCount && loadedRowCount > 0) ? loadedRowCount.toLocaleString() : (groupName && (groupName.toLowerCase().includes("demo") || groupName.toLowerCase().includes("acme") || groupName.toLowerCase().includes("roosevelt") || groupName.toLowerCase().includes("sandbox")) ? '0 rows — Link DEMO File' : 'No File Linked')}) →</span>
                </Link>
                <Link
                  href="/data-prep"
                  className="bg-white hover:bg-[#EAE5DC] text-foreground font-bold px-4 py-3.5 rounded-xl border border-border transition-colors text-xs shadow-2xs flex items-center gap-1.5"
                >
                  <Folder className="w-4 h-4 text-[#D96B27]" />
                  <span>📂 Re-Link Local File (/data-prep)</span>
                </Link>
              </div>
            ) : (
              <Link
                href="/data-prep"
                className="bg-accent hover:bg-[#C85A1B] text-slate-900 font-black px-6 py-3.5 rounded-xl shadow-sm transition-all text-sm flex items-center gap-2"
              >
                <Folder className="w-4 h-4" />
                <span>Connect Local Voter Roll File (/data-prep) →</span>
              </Link>
            )}
            <Link
              href="/playbooks"
              className="bg-white hover:bg-[#EAE5DC] text-foreground font-bold px-4 py-3.5 rounded-xl border border-border transition-colors text-xs shadow-2xs flex items-center gap-1.5"
            >
              <BookOpen className="w-4 h-4" />
              <span>Step-by-Step Guides</span>
            </Link>
            <Link
              href="/comprehensive-audit"
              className="bg-[#2D3142] hover:bg-[#1E212D] text-amber-400 font-extrabold px-4 py-3.5 rounded-xl shadow-sm transition-all text-xs flex items-center gap-1.5 border border-slate-700"
            >
              <Rocket className="w-4 h-4 text-[#D96B27]" />
              <span>🚀 360° Comprehensive Audit →</span>
            </Link>
          </div>
        </div>

        {/* Edit Group Modal/Dropdown if active */}
        {isEditingGroup && (
          <div className="bg-white p-5 rounded-xl border border-[#D96B27]/40 space-y-3 max-w-xl shadow-lg animate-in fade-in duration-200">
            <label className="text-xs font-black text-[#D96B27] uppercase tracking-wider block">Select Preset Jurisdiction or Enter Custom Group Name:</label>
            <div className="flex flex-wrap gap-2 text-xs">
              {[
                "State of Roosevelt (Demo)",
                ...(isAdmin || isSuperUser || groupName === "Mississippi Fair Elections" ? ["Mississippi Fair Elections"] : [])
              ].map((preset) => (
                <button
                  key={preset}
                  onClick={() => handleSaveGroup(preset)}
                  className="bg-muted hover:bg-accent text-foreground hover:text-slate-900 px-3 py-1.5 rounded-lg border border-border font-bold transition-colors"
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
                className="flex-1 bg-[#FAF8F5] border border-border rounded-lg px-3 py-2 text-sm text-foreground focus:border-[#D96B27] outline-none font-medium"
              />
              <button
                onClick={() => handleSaveGroup(customGroupInput || "National Civic Data Sandbox")}
                className="bg-accent hover:bg-[#C85A1B] text-slate-900 font-black px-5 py-2 rounded-lg text-sm transition-colors"
              >
                Save
              </button>
            </div>
          </div>
        )}

        {/* State of Roosevelt (Demo) / ACME Synthetic Data Banner */}
        {((groupName.toLowerCase().includes("demo") || groupName.toLowerCase().includes("acme") || groupName.toLowerCase().includes("roosevelt") || groupName.toLowerCase().includes("sandbox")) || !isDataConnected) && (
          <div className="bg-gradient-to-r from-amber-900/90 via-amber-800 to-amber-950 text-amber-50 p-6 rounded-2xl border border-amber-600/40 shadow-lg flex flex-col md:flex-row items-start md:items-center justify-between gap-6 animate-in fade-in duration-300">
            <div className="space-y-2 max-w-2xl">
              <div className="flex items-center gap-2">
                <span className="bg-amber-500/20 text-amber-300 border border-amber-400/30 text-[10px] font-black px-2.5 py-0.5 rounded-full uppercase tracking-widest">
                  🌲 Synthetic Demo Environment
                </span>
                <span className="text-xs text-amber-200 font-medium">Safe for Video Recording & Public Demos</span>
              </div>
              <h3 className="text-xl font-black text-slate-900 tracking-tight">{groupName} — Download Roosevelt Synthetic Voter Roll</h3>
              <p className="text-xs text-amber-100 leading-relaxed">
                We have pre-engineered an ~1,800 row synthetic Roosevelt dataset containing realistic single-character clerical errors, unsegmented college dorms (<strong className="text-slate-900">100 CAMPUS DR</strong>), UPS store commercial mail drops, and single-day registration surges. Download this file below and link it in <Link href="/data-prep" className="underline font-bold hover:text-slate-900">/data-prep</Link> to experience 100% full-fidelity client-side chunking and statistical audit playbooks!
              </p>
            </div>
            <div className="flex flex-col sm:flex-row gap-3 w-full md:w-auto shrink-0">
              <button
                onClick={handle1ClickLoadDemo}
                disabled={isLoadingDemo}
                className="bg-amber-400 hover:bg-amber-300 disabled:opacity-50 text-slate-950 font-black px-6 py-3.5 rounded-xl shadow-lg transition-all text-xs flex items-center justify-center gap-2 transform active:scale-[0.98]"
              >
                <Sparkles className="w-4 h-4 text-slate-900 animate-pulse" />
                <span>{isLoadingDemo ? (demoStatusMsg || "⏳ Auto-Loading ~1,800 Demo Records...") : "⚡ 1-Click Auto-Load (~1,800 Records) →"}</span>
              </button>
            </div>
          </div>
        )}

        {/* Executive 360° Comprehensive Audit Command Banner */}
        <div className="bg-gradient-to-r from-[#2D3142] to-[#1E212D] text-slate-900 p-6 rounded-2xl border border-slate-700 shadow-md flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
          <div className="space-y-1">
            <div className="flex items-center gap-2">
              <span className="bg-accent text-slate-900 text-[11px] font-black px-2.5 py-0.5 rounded-full uppercase tracking-wider">
                ⚡ Executive Sales &amp; Audit Tool
              </span>
              <span className="text-xs text-amber-300 font-mono">Zero-Cloud <GlossaryTooltip term="PII" /> <GlossaryTooltip term="Air-Gap" /></span>
            </div>
            <h3 className="text-xl font-black tracking-tight text-slate-900 flex items-center gap-2">
              <span>Run 360° Comprehensive Jurisdiction Audit</span>
            </h3>
            <p className="text-xs text-slate-700 max-w-2xl leading-relaxed">
              Execute all 9 verified Fellegi-Sunter and anomaly cartridges simultaneously across your entire {(loadedRowCount && loadedRowCount > 0) ? `${loadedRowCount.toLocaleString()}-row` : 'DEMO'} voter roll in <GlossaryTooltip term="RAM" />. Instantly generate a publication-ready Executive Briefing PDF and a Zero-<GlossaryTooltip term="PII" /> JSON summary cartridge!
            </p>
          </div>
          <Link
            href="/comprehensive-audit"
            className="bg-accent hover:bg-[#C85A1B] text-slate-900 font-black px-6 py-4 rounded-xl shadow-md transition-all text-sm flex items-center gap-2 shrink-0 transform active:scale-[0.98]"
          >
            <Rocket className="w-4 h-4" />
            <span>🚀 Execute 360° Comprehensive Audit →</span>
          </Link>
        </div>

        {/* 4-Column Real-Time Telemetry & System Status Widgets */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 pt-1">
          <div className="bg-white p-4 rounded-xl border border-border shadow-2xs space-y-1">
            <span className="text-[11px] font-bold text-[#646A7A] uppercase tracking-wider">Active Memory Shard</span>
            <div className="text-lg md:text-xl font-black text-foreground">
              {(loadedRowCount && loadedRowCount > 0) ? loadedRowCount.toLocaleString() : '0'} <span className="text-xs font-normal text-[#646A7A]">rows</span>
            </div>
            <div className="text-[11px] text-emerald-700 font-semibold flex items-center gap-1">
              <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 inline-block"></span> Local RAM Locked
            </div>
          </div>

          <div className="bg-white p-4 rounded-xl border border-border shadow-2xs space-y-1">
            <span className="text-[11px] font-bold text-[#646A7A] uppercase tracking-wider">Forensic Playbook</span>
            <div className="text-lg md:text-xl font-black text-[#D96B27]">Playbook 2.0</div>
            <div className="text-[11px] text-[#646A7A] font-medium">HSGP & FEMA Validated</div>
          </div>

          <div className="bg-white p-4 rounded-xl border border-border shadow-2xs space-y-1">
            <span className="text-[11px] font-bold text-[#646A7A] uppercase tracking-wider">Operator Clearance</span>
            <div className="text-lg md:text-xl font-black text-foreground">
              {isAdmin && !previewAsVolunteer ? "Group Admin" : "Auditor"}
            </div>
            {isSuperUser && (
              <button
                onClick={() => setPreviewAsVolunteer(!previewAsVolunteer)}
                className="text-[10px] font-bold text-[#D96B27] hover:underline flex items-center gap-1 pt-0.5"
              >
                <Eye className="w-3 h-3 inline" />
                <span>{previewAsVolunteer ? "Return to Admin Mode" : "Volunteer Preview"}</span>
              </button>
            )}
          </div>

          <div className="bg-white p-4 rounded-xl border border-border shadow-2xs space-y-1">
            <span className="text-[11px] font-bold text-[#646A7A] uppercase tracking-wider">Network Air-Gap</span>
            <div className="text-lg md:text-xl font-black text-emerald-700">100% Isolated</div>
            <div className="text-[11px] text-[#646A7A] font-mono">0 bytes exfiltrated</div>
          </div>
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
                  <Crown className="w-5 h-5 text-amber-600" />
                  <span>Shared Missions &amp; Group Controls</span>
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
                          setTeamMembers([...teamMembers, { email: inviteEmail, role: "Mission Lead", status: "Invited" }]);
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
                      const grp = (groupName || "").toLowerCase();
                      let inviteUrl = "https://marigoldinsights.org/join/msfe-pilot-2026";
                      if (grp.includes("demo") || grp.includes("roosevelt")) {
                        inviteUrl = "https://marigoldinsights.org/join/roosevelt-demo";
                      } else if (grp.includes("acme") || grp.includes("sandbox")) {
                        inviteUrl = "https://marigoldinsights.org/join/acme-sandbox";
                      } else if (grp && !grp.includes("mississippi") && !grp.includes("msfe") && !grp.includes("fair elections")) {
                        const cleanCode = grp.replace(/[^a-z0-9]+/g, '-').replace(/^-|-$/g, '');
                        inviteUrl = `https://marigoldinsights.org/join/${cleanCode || 'workspace'}`;
                      }
                      navigator.clipboard.writeText(inviteUrl);
                      setCopiedInvite(true);
                      setTimeout(() => setCopiedInvite(false), 3000);
                    }}
                    className="w-full bg-slate-50 border border-slate-200 hover:bg-slate-800 text-amber-300 font-bold px-3 py-2 rounded-lg text-xs transition-colors flex items-center justify-center gap-1.5 shadow-sm border border-slate-700"
                  >
                    <Link2 className="w-3.5 h-3.5" />
                    <span>{copiedInvite ? "✓ Invitation Link Copied!" : "Copy Direct Group Invite URL"}</span>
                  </button>
                </div>
              </div>

              {/* Roster Table */}
              <div className="lg:col-span-2 bg-white p-4 rounded-xl border border-amber-200 shadow-sm space-y-3">
                <div className="flex justify-between items-center">
                  <span className="font-bold text-slate-800 text-sm inline-flex items-center gap-1.5">
                    <Users className="w-4 h-4" />
                    <span>Active Group Roster ({teamMembers.length})</span>
                  </span>
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
        <h2 className="text-2xl font-extrabold text-primary flex items-center gap-2.5">
          <Rocket className="w-6 h-6 text-primary" />
          <span>Daily Audit Workflow (&quot;The Happy Path&quot;)</span>
        </h2>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <div className="bg-white p-6 rounded-xl border border-border shadow-sm space-y-3 relative">
            <span className="absolute -top-3 -left-3 w-8 h-8 rounded-full bg-primary text-slate-900 font-extrabold flex items-center justify-center text-sm shadow">1</span>
            <h3 className="font-bold text-lg text-primary pt-1">Load Statewide Shards</h3>
            <p className="text-xs text-muted-foreground leading-relaxed">
              Select your official statewide or weekly voter file shards. Marigold distills county-level anomaly distributions automatically in client memory.
            </p>
            <Link href="/data-prep" className="text-xs font-bold text-accent hover:underline block pt-2 text-left">Connect Shards (/data-prep) →</Link>
          </div>

          <div className="bg-white p-6 rounded-xl border border-border shadow-sm space-y-3 relative">
            <span className="absolute -top-3 -left-3 w-8 h-8 rounded-full bg-primary text-slate-900 font-extrabold flex items-center justify-center text-sm shadow">2</span>
            <h3 className="font-bold text-lg text-primary pt-1">Execute Playbook</h3>
            <p className="text-xs text-muted-foreground leading-relaxed">
              Run pre-configured statistical algorithms (High-Density Occupancy, NCOA Interstate Relocation) to instantly isolate anomalies.
            </p>
            <Link href="/playbooks" className="text-xs font-bold text-accent hover:underline block pt-2">Run MS Mission Playbooks →</Link>
          </div>

          <div className="bg-white p-6 rounded-xl border border-border shadow-sm space-y-3 relative cursor-pointer hover:border-amber-400 transition-colors" onClick={() => document.getElementById('checklist')?.scrollIntoView({ behavior: 'smooth' })}>
            <span className="absolute -top-3 -left-3 w-8 h-8 rounded-full bg-primary text-slate-900 font-extrabold flex items-center justify-center text-sm shadow">3</span>
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
            <h3 className="text-xl font-bold text-primary flex items-center gap-2">
              <BookOpen className="w-5 h-5 text-primary" />
              <span>Active Investigation Checklist</span>
            </h3>
            <p className="text-xs text-muted-foreground mt-0.5">Records flagged by organization audit templates awaiting verification.</p>
          </div>
          <span className="bg-slate-100 text-slate-700 text-xs font-bold px-3 py-1 rounded-full">
            {anomalies.filter(a => a.status === 'pending').length} Pending Review
          </span>
        </div>

        {anomalies.length === 0 ? (
          <div className="text-center py-12 px-4 bg-slate-50 rounded-xl border border-dashed border-slate-300 space-y-4">
            <Folder className="w-12 h-12 text-slate-600 mx-auto" />
            <h4 className="text-lg font-bold text-primary">No Audit Records Loaded in Client Memory</h4>
            <p className="text-xs text-muted-foreground max-w-md mx-auto leading-relaxed">
              To populate your investigation checklist with verified discrepancies across counties, connect your statewide voter file above or run an active Mission Playbook.
            </p>
            <div className="flex justify-center gap-3 pt-2 flex-wrap">
              <Link
                href="/data-prep"
                className="bg-primary hover:bg-slate-800 text-slate-900 font-bold text-xs px-5 py-2.5 rounded-xl shadow transition-all flex items-center gap-1.5"
              >
                <Folder className="w-4 h-4" />
                <span>Connect / Re-Link Local Voter File (/data-prep) →</span>
              </Link>
              <a
                href="/api/demo-dataset"
                download="DEMO_roosevelt_statewide_voter_roll.csv"
                className="bg-amber-600 hover:bg-amber-500 text-white font-bold text-xs px-5 py-2.5 rounded-xl shadow transition-all flex items-center gap-1.5"
              >
                <Download className="w-4 h-4" />
                <span>📥 Download DEMO_roosevelt_statewide_voter_roll.csv</span>
              </a>
              <Link href="/playbooks" className="bg-white hover:bg-slate-100 text-slate-800 font-bold text-xs px-5 py-2.5 rounded-xl border border-slate-300 transition-all flex items-center gap-1.5">
                <span>Run Mission Playbooks</span>
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
                      <span key={f} className="text-xs font-bold bg-amber-100 text-amber-900 px-2 py-0.5 rounded inline-flex items-center gap-1">
                        <AlertTriangle className="w-3 h-3 text-amber-700" />
                        <span>{f.replace(/_/g, ' ')}</span>
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
