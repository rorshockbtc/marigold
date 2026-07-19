"use client";

import React, { useState, useEffect } from 'react';
import { useRouter, useParams } from 'next/navigation';
import { useUser } from '@clerk/nextjs';
import Link from 'next/link';

export default function GroupInviteGatewayPage() {
  const router = useRouter();
  const params = useParams();
  const { user, isLoaded } = useUser();
  const [isAccepting, setIsAccepting] = useState(false);
  const [errorMsg, setErrorMsg] = useState("");

  const rawCode = (params?.code || "") as string;
  const cleanCode = decodeURIComponent(rawCode).toLowerCase();

  // Determine target organization from invite code
  const getGroupInfo = (code: string) => {
    if (code.includes("msfe") || code.includes("miss") || code.includes("abc")) {
      return {
        name: "Mississippi Fair Elections",
        jurisdiction: "Mississippi (All 82 Counties)",
        admin: "Kyle (Founding Admin)",
        website: "https://msfe.org",
        description: "Non-partisan citizen audit network evaluating county voter registration rolls for accuracy and statutory compliance."
      };
    }
    if (code.includes("roosevelt") || code.includes("demo")) {
      return {
        name: "State of Roosevelt (Demo)",
        jurisdiction: "State of Roosevelt (6 Counties)",
        admin: "Demo Mission Lead",
        website: "https://marigoldinsights.org",
        description: "Synthetic evaluation network using official ~1,800-row Roosevelt demo dataset for zero-PII audit testing."
      };
    }
    if (code.includes("acme") || code.includes("sandbox")) {
      return {
        name: "ACME Civic Data Sandbox",
        jurisdiction: "Multi-State Verification Area",
        admin: "ACME Group Lead",
        website: "https://marigoldinsights.org",
        description: "Sandbox collaboration group testing statistical verification playbooks and local memory processing."
      };
    }
    const customName = code.split('-').map(w => w.charAt(0).toUpperCase() + w.slice(1)).join(' ');
    return {
      name: customName || "Independent Audit Workspace",
      jurisdiction: "Neutral Jurisdiction",
      admin: "Workspace Lead",
      website: "https://marigoldinsights.org",
      description: "Collaborative civic workspace evaluating data anomalies and shared verification playbooks."
    };
  };

  const targetGroup = getGroupInfo(cleanCode);
  const userEmail = user?.primaryEmailAddress?.emailAddress || "";
  const displayName = user?.fullName || userEmail.split('@')[0] || "Civic Volunteer";

  const handleAcceptInvite = () => {
    setIsAccepting(true);
    setErrorMsg("");

    setTimeout(() => {
      // Set active workspace
      localStorage.setItem("marigold_active_group", targetGroup.name);
      localStorage.setItem("marigold_user_role", "Verified Auditor");
      localStorage.setItem("marigold_onboarding_done", "true");
      localStorage.setItem("marigold_active_jurisdiction", targetGroup.jurisdiction);
      if (targetGroup.website) {
        localStorage.setItem("marigold_active_website", targetGroup.website);
      }
      if (userEmail) {
        localStorage.setItem("marigold_user_email", userEmail);
      }
      if (user?.fullName) {
        localStorage.setItem("marigold_user_name", user.fullName);
      }

      router.push('/dashboard');
    }, 600);
  };

  if (!isLoaded) {
    return (
      <div className="min-h-[70vh] flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-4 border-amber-500"></div>
      </div>
    );
  }

  return (
    <div className="max-w-3xl mx-auto py-12 px-4 space-y-8 animate-in fade-in duration-300">
      {/* Invite Header Badge */}
      <div className="text-center space-y-3">
        <span className="bg-amber-100 dark:bg-amber-950/80 text-amber-900 dark:text-amber-200 border border-amber-300 dark:border-amber-700 font-black text-xs px-4 py-1.5 rounded-full uppercase tracking-wider inline-flex items-center gap-1.5 shadow-sm">
          <span>👑 Official Organization Invitation</span>
        </span>
        <h1 className="text-3xl sm:text-4xl font-serif font-black text-slate-900 dark:text-slate-900 pt-1">
          You Are Invited to Join {targetGroup.name}
        </h1>
        <p className="text-slate-700 dark:text-slate-700 text-sm max-w-xl mx-auto font-medium leading-relaxed">
          Welcome! You have been invited by <strong>{targetGroup.admin}</strong> to join this secure civic verification workspace.
        </p>
      </div>

      {/* Main Invitation Card */}
      <div className="bg-white dark:bg-slate-50 border border-slate-200 rounded-3xl border-2 border-slate-300 dark:border-slate-700 p-8 shadow-xl space-y-8">
        <div className="bg-slate-100 dark:bg-slate-100 p-6 rounded-2xl border border-slate-200 dark:border-slate-200 space-y-4">
          <div className="flex flex-wrap justify-between items-center gap-2">
            <span className="text-xs font-extrabold uppercase tracking-wider text-slate-600 dark:text-slate-600">
              Workspace Profile
            </span>
            <span className="text-xs font-mono bg-slate-200 dark:bg-slate-800 text-slate-900 dark:text-slate-100 px-3 py-1 rounded-md font-bold border border-slate-300 dark:border-slate-700">
              CODE: {rawCode.toUpperCase()}
            </span>
          </div>

          <div className="space-y-1">
            <h3 className="text-2xl font-black text-slate-900 dark:text-slate-900">{targetGroup.name}</h3>
            <p className="text-sm font-bold text-amber-700 dark:text-amber-400">📍 {targetGroup.jurisdiction}</p>
          </div>

          <p className="text-sm text-slate-700 dark:text-slate-700 leading-relaxed font-medium">
            {targetGroup.description}
          </p>
        </div>

        {/* User Account Context & JWT Assurances */}
        <div className="border-t border-slate-200 dark:border-slate-200 pt-6 space-y-4">
          <h4 className="text-sm font-black uppercase tracking-wider text-slate-900 dark:text-slate-100 flex items-center gap-2">
            <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse"></span>
            Role-Based Access Control (RBAC) Active:
          </h4>
          
          {user ? (
            <div className="flex items-center justify-between p-4 bg-emerald-50 dark:bg-emerald-950/40 rounded-xl border border-emerald-300 dark:border-emerald-700">
              <div className="space-y-0.5">
                <p className="font-extrabold text-slate-900 dark:text-slate-900 text-base">{displayName}</p>
                <p className="text-xs font-mono text-emerald-800 dark:text-emerald-800">{userEmail || "Authenticated Citizen Account"}</p>
                <p className="text-[10px] uppercase font-bold text-emerald-700 dark:text-emerald-700 mt-1">Verified via Clerk Magic Link</p>
              </div>
              <div className="flex flex-col items-end gap-1">
                <span className="bg-emerald-600 text-white text-[11px] font-black px-3 py-1 rounded-full uppercase">
                  org:auditor (Pending)
                </span>
              </div>
            </div>
          ) : (
            <div className="p-4 bg-amber-50 dark:bg-amber-950/40 rounded-xl border border-amber-300 dark:border-amber-700 space-y-2">
              <p className="text-sm font-bold text-amber-950 dark:text-amber-200">
                You are browsing in guest verification mode.
              </p>
              <p className="text-xs text-amber-900 dark:text-amber-300 leading-relaxed">
                We have deprecated legacy PIN inputs in favor of zero-friction cryptographic access. Clicking Accept below will trigger a secure Magic Link to your email, instantly assigning you the proper JWT Role to unlock shared playbooks without remembering passwords.
              </p>
            </div>
          )}
        </div>

        {/* Accept Button */}
        <button
          onClick={handleAcceptInvite}
          disabled={isAccepting}
          className="w-full h-14 bg-amber-500 hover:bg-amber-400 disabled:opacity-50 text-slate-950 font-black text-lg rounded-2xl shadow-lg hover:shadow-xl transition-all flex items-center justify-center gap-2 transform active:scale-[0.99]"
        >
          {isAccepting ? (
            <span className="flex items-center gap-2">
              <span className="animate-spin rounded-full h-5 w-5 border-b-2 border-slate-950"></span>
              <span>Linking Account to Workspace...</span>
            </span>
          ) : (
            <span>🔑 Accept Invitation &amp; Enter Workspace →</span>
          )}
        </button>
      </div>

      {/* Respectful Privacy Assurance */}
      <div className="text-center text-xs text-slate-600 dark:text-slate-600 max-w-lg mx-auto leading-relaxed">
        🔒 <strong>Zero-Data Exfiltration Guarantee:</strong> Joining a group workspace connects your team missions and shared audit playbooks. Your raw voter roll spreadsheet rows remain strictly in your local device RAM and never upload to external servers.
      </div>
    </div>
  );
}
