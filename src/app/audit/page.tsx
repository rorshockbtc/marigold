"use client";
import React, { useState, useEffect } from "react";
import { ChevronRight, Filter, AlertTriangle, Play, FileText, FolderKey, PlayCircle, Shield, ShieldAlert, Activity, BookOpen, Layers, MessageSquare } from "lucide-react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { PageHeader } from "@/components/PageHeader";
import { DataRequiredState } from "@/components/DataRequiredState";

export default function AuditPage() {
  const router = useRouter();
  const [isDataLoaded, setIsDataLoaded] = useState(false);
  const [activeGroup, setActiveGroup] = useState("");

  useEffect(() => {
    if (typeof window !== "undefined") {
      const group = localStorage.getItem("marigold_active_group") || "Independent Audit Workspace";
      setActiveGroup(group);
      
      const isConnected = localStorage.getItem("marigold_file_connected") === "true";
      const isDemo = group.toLowerCase().includes("demo") || group.toLowerCase().includes("sandbox");
      
      if (isConnected || (isDemo && localStorage.getItem("marigold_file_name")?.toUpperCase().includes("DEMO"))) {
        setIsDataLoaded(true);
      } else {
        setIsDataLoaded(false);
      }
    }
  }, []);

  const openMariWithQuery = (query: string) => {
    window.dispatchEvent(new Event('open-mari-panel'));
    setTimeout(() => {
      window.dispatchEvent(new CustomEvent('mari-set-query', { detail: { query } }));
    }, 100);
  };

  const playbooks = [
    { id: 'density', label: 'High-Density Occupancy', icon: '⚡', phase: 'Phase 2: Residential', desc: 'Identify 12+ voters registered to a single residential address.' },
    { id: 'missing-dorm', label: 'Missing Dorm / Unit #', icon: '🏢', phase: 'Phase 2: Residential', desc: 'Flag large communal buildings missing apartment or room numbers.' },
    { id: 'po-box', label: 'P.O. Box Residence', icon: '📬', phase: 'Phase 2: Residential', desc: 'Identify P.O. Box addresses incorrectly listed in the physical residential field.' },
    { id: 'typo-names', label: 'Clerical Typo Check', icon: '⌨️', phase: 'Phase 3: Identity', desc: 'Flag 1-character first or last names indicating data entry errors.' },
    { id: 'duplicates', label: 'Intra-County Duplicates', icon: '👯', phase: 'Phase 3: Identity', desc: 'Identify exact Name & Zip matches residing at different addresses.' },
    { id: 'commercial', label: 'Commercial Disguises', icon: '🏪', phase: 'Phase 3: Identity', desc: 'Flag addresses containing commercial indicators (UPS Stores, PMBs).' },
    { id: 'spikes', label: 'Registration Surges', icon: '📈', phase: 'Phase 4: Temporal', desc: 'Identify massive single-day volume spikes in new registrations.' },
    { id: 'phantom-precincts', label: 'Phantom Precincts', icon: '👻', phase: 'Phase 4: Temporal', desc: 'Flag active voters with missing or null precinct code assignments.' },
    { id: 'out-of-state-mailing', label: 'NCOA / Out of State', icon: '✈️', phase: 'Phase 4: Temporal', desc: 'Identify voters maintaining active registration while receiving mail out-of-state.' },
  ];

  if (!isDataLoaded) {
    return (
      <DataRequiredState 
        title="Data Required" 
        subtitle="You cannot run Playbooks because your local data engine is empty." 
      />
    );
  }

  const renderPhase = (phaseName: string) => {
    const phasePlaybooks = playbooks.filter(p => p.phase === phaseName);
    return (
      <div key={phaseName} className="mb-12">
        <h2 className="text-lg font-serif text-text-header mb-4 flex items-center gap-2">
          <Layers className="w-5 h-5 text-primary" />
          {phaseName}
        </h2>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {phasePlaybooks.map(pb => (
            <Link 
              key={pb.id}
              href={`/audit/${pb.id}`}
              className="bg-white border border-border-soft hover:border-primary p-5 rounded-[20px] shadow-sm hover:shadow-md transition-all group flex flex-col h-full"
            >
              <div className="flex items-center gap-3 mb-3">
                <div className="w-10 h-10 rounded-full bg-surface flex items-center justify-center text-xl shrink-0 group-hover:scale-110 transition-transform">
                  {pb.icon}
                </div>
                <h3 className="font-bold text-text-header">{pb.label}</h3>
              </div>
              <p className="text-sm text-text-body mb-4 flex-1">{pb.desc}</p>
              <div className="flex items-center justify-between mt-auto pt-4 border-t border-border-soft">
                <span className="text-xs font-bold text-primary group-hover:underline">Run in Explore & Review</span>
                <ChevronRight className="w-4 h-4 text-primary opacity-0 group-hover:opacity-100 transition-opacity" />
              </div>
            </Link>
          ))}
        </div>
      </div>
    );
  };

  return (
    <div className="flex flex-col h-full font-sans max-w-6xl mx-auto px-4 sm:px-6">
      
      {/* Header */}
      <PageHeader
        title="Guided Playbooks"
        subtitle="Choose an automated workflow to analyze your local data. Playbooks are organized by verification phase and execute mathematically sound audits against your secure civic records."
        actions={
          <button 
            onClick={() => openMariWithQuery("Which playbook should I run first if I suspect residential zoning errors?")}
            className="btn-secondary flex items-center gap-2 font-bold"
          >
            DISCUSS
          </button>
        }
      />

      {/* Playbook Categories */}
      <div className="pb-12">
        {renderPhase("Phase 2: Residential")}
        {renderPhase("Phase 3: Identity")}
        {renderPhase("Phase 4: Temporal")}
      </div>
    </div>
  );
}
