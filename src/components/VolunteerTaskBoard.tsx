"use client";

import React from "react";
import { AlertTriangle, MapPin, CheckCircle2, CheckSquare } from "lucide-react";
import type { AnomalyRecord } from "@/lib/firebase/db";

interface VolunteerTaskBoardProps {
  groupName: string;
  anomalies: AnomalyRecord[];
  onVerify: (id: string, status: "verified" | "false_positive") => void;
}

export function VolunteerTaskBoard({ groupName, anomalies, onVerify }: VolunteerTaskBoardProps) {
  const pending = anomalies.filter(a => a.status === 'pending');
  const completed = anomalies.filter(a => a.status !== 'pending');

  return (
    <div className="max-w-4xl mx-auto space-y-8 pb-16 pt-6 px-4 animate-in fade-in duration-500">
      <div className="bg-emerald-50 border border-emerald-200 text-emerald-950 p-6 md:p-8 rounded-2xl shadow-sm space-y-3">
        <h1 className="text-2xl md:text-3xl font-black tracking-tight flex items-center gap-2">
          <MapPin className="w-6 h-6 text-emerald-600" />
          <span>Local Field Assignments</span>
        </h1>
        <p className="text-sm md:text-base text-emerald-800 leading-relaxed max-w-2xl">
          Welcome to the {groupName} volunteer task board. Your technical organizers have already processed the official voter rolls and identified addresses that require physical or manual verification. No configuration is required on your part.
        </p>
      </div>

      <div className="space-y-6">
        <div className="flex items-center justify-between border-b border-slate-200 pb-2">
          <h2 className="text-xl font-bold text-slate-900 flex items-center gap-2">
            <CheckSquare className="w-5 h-5 text-slate-500" />
            <span>Pending Reviews ({pending.length})</span>
          </h2>
        </div>

        {pending.length === 0 ? (
          <div className="text-center py-12 px-4 bg-slate-50 rounded-xl border border-dashed border-slate-300">
            <CheckCircle2 className="w-12 h-12 text-emerald-500 mx-auto mb-3" />
            <h3 className="text-lg font-bold text-slate-900">You are all caught up!</h3>
            <p className="text-sm text-slate-600 mt-1">There are no pending anomaly assignments for your jurisdiction.</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {pending.map(anomaly => (
              <div key={anomaly.id} className="bg-white border border-slate-200 p-5 rounded-xl shadow-sm hover:shadow-md transition-shadow flex flex-col justify-between space-y-4">
                <div className="space-y-2">
                  <div className="flex items-start justify-between gap-2">
                    <span className="font-black text-slate-900 text-lg leading-none">{anomaly.voterName}</span>
                  </div>
                  <div className="flex items-center gap-1.5 text-sm font-mono text-slate-600 bg-slate-50 px-2 py-1 rounded inline-block">
                    <MapPin className="w-3.5 h-3.5" />
                    {anomaly.address}
                  </div>
                  <div className="pt-2 flex flex-wrap gap-1.5">
                    {anomaly.flags.map(f => (
                      <span key={f} className="text-xs font-bold bg-amber-100 text-amber-900 px-2 py-0.5 rounded inline-flex items-center gap-1">
                        <AlertTriangle className="w-3 h-3 text-amber-700" />
                        <span>{f.replace(/_/g, ' ')}</span>
                      </span>
                    ))}
                  </div>
                </div>
                <div className="grid grid-cols-2 gap-2 pt-2 border-t border-slate-100">
                  <button 
                    onClick={() => onVerify(anomaly.id!, "verified")}
                    className="bg-emerald-600 hover:bg-emerald-700 text-white font-bold py-2 rounded-lg text-xs transition-colors"
                  >
                    Confirm Issue
                  </button>
                  <button 
                    onClick={() => onVerify(anomaly.id!, "false_positive")}
                    className="bg-slate-100 hover:bg-slate-200 text-slate-700 font-bold py-2 rounded-lg text-xs transition-colors border border-slate-200"
                  >
                    False Positive
                  </button>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {completed.length > 0 && (
        <div className="space-y-4 pt-8">
          <h2 className="text-sm font-bold text-slate-500 uppercase tracking-wider">Recently Completed</h2>
          <div className="space-y-2">
            {completed.map(anomaly => (
              <div key={anomaly.id} className="bg-slate-50 border border-slate-200 p-3 rounded-lg flex items-center justify-between text-sm">
                <div className="flex items-center gap-3">
                  <span className={`w-2 h-2 rounded-full ${anomaly.status === 'verified' ? 'bg-emerald-500' : 'bg-slate-400'}`}></span>
                  <span className="font-bold text-slate-700">{anomaly.voterName}</span>
                  <span className="text-slate-500 truncate max-w-[200px]">{anomaly.address}</span>
                </div>
                <span className="text-xs font-bold text-slate-500 bg-white px-2 py-1 rounded border border-slate-200">
                  {anomaly.status === 'verified' ? 'Confirmed' : 'Dismissed'}
                </span>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
