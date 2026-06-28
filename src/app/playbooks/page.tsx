"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { Tooltip } from "@/components/Tooltip";

export default function MissionControl() {
  const [playbooks, setPlaybooks] = useState<any[]>([]);
  const [accuracies, setAccuracies] = useState<Record<string, number>>({});
  const [isLoading, setIsLoading] = useState(true);
  const [selectedCounty, setSelectedCounty] = useState('All');

  useEffect(() => {
    const fetchPlaybooks = async () => {
      try {
        const res = await fetch('/api/playbooks');
        const data = await res.json();
        if (res.ok) {
          setPlaybooks(data);
          
          // Fetch accuracy for all unique audit types
          const uniqueAudits = Array.from(new Set(data.map((p: any) => p.audit_type)));
          const newAccuracies: Record<string, number> = {};
          
          for (const audit of uniqueAudits) {
            const accRes = await fetch(`/api/feedback?auditType=${audit}`);
            if (accRes.ok) {
              const accData = await accRes.json();
              newAccuracies[audit as string] = accData.accuracy;
            }
          }
          setAccuracies(newAccuracies);
        }
      } catch (e) {
        console.error(e);
      } finally {
        setIsLoading(false);
      }
    };
    fetchPlaybooks();
  }, []);

  const getAuditLabel = (type: string) => {
    const labels: Record<string, string> = {
      'density': 'High-Density Occupancy',
      'missing-dorm': 'Missing Unit/Dorm',
      'po-box': 'P.O. Box in Residence',
      'typo-names': 'Fat-Finger Typo',
      'duplicates': 'Intra-County Duplicates',
      'commercial': 'Commercial Disguises',
      'spikes': 'Registration Spikes',
      'phantom-precincts': 'Phantom Precincts',
      'out-of-state-mailing': 'Out-of-State Mailing'
    };
    return labels[type] || type;
  };

  const filteredPlaybooks = selectedCounty === 'All' 
    ? playbooks 
    : playbooks.filter(p => (selectedCounty === 'Statewide' ? !p.county : p.county === selectedCounty));

  return (
    <div className="max-w-6xl mx-auto space-y-6 pb-20">
      <header className="mb-8 space-y-4">
        <div>
          <div className="flex items-center gap-2 mb-3">
            <span className="px-3 py-1 bg-amber-100 text-amber-950 rounded-full text-xs font-extrabold uppercase tracking-wider">
              🏛️ Mississippi Mission Control
            </span>
            <span className="text-xs font-mono text-muted-foreground">Statewide & County Templates</span>
          </div>
          <h1 className="text-3xl font-bold text-foreground">Mississippi Mission Playbooks</h1>
          <p className="text-muted-foreground mt-2">
            Pre-configured statistical audits calibrated specifically for Mississippi counties (Hinds, DeSoto, Harrison, Madison, Rankin). Click a playbook below to launch an instant local scan. False positives are automatically filtered out, and our non-partisan models learn from your verification feedback.
            Need help understanding the data? <Tooltip content="If the data looks confusing, hover over the ℹ️ icons or ask the AI Chat Guide to explain the math for you."><span className="text-primary font-semibold underline decoration-dotted">Hover here for a tip.</span></Tooltip>
          </p>
        </div>

        <div className="flex flex-wrap gap-2 pt-2 border-t border-border">
          {['All', 'Statewide', 'Hinds', 'DeSoto', 'Harrison', 'Madison', 'Rankin', 'Jackson', 'Lee'].map(c => (
            <button
              key={c}
              onClick={() => setSelectedCounty(c)}
              className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-all ${selectedCounty === c ? 'bg-primary text-white shadow' : 'bg-slate-100 text-slate-700 hover:bg-slate-200'}`}
            >
              {c === 'All' ? '🌐 All Playbooks' : c === 'Statewide' ? '🏛️ Statewide General' : `📍 ${c} County`}
            </button>
          ))}
        </div>
      </header>

      {isLoading ? (
        <p className="text-muted-foreground">Loading Playbooks...</p>
      ) : filteredPlaybooks.length === 0 ? (
        <div className="card text-center py-12">
          <h2 className="text-xl font-bold mb-2">No Playbooks Found</h2>
          <p className="text-muted-foreground mb-6">No playbooks found for {selectedCounty}. Click below to create one!</p>
          <Link href="/analysis" className="btn-primary">
            Go to Pro Mode to create one
          </Link>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {filteredPlaybooks.map((p) => (
            <div key={p.id} className="card flex flex-col justify-between group hover:border-primary/50 transition-colors">
              <div>
                <div className="flex justify-between items-start mb-2">
                  <h3 className="font-bold text-lg text-foreground group-hover:text-primary transition-colors">{p.name}</h3>
                  {accuracies[p.audit_type] && (
                    <span className="bg-secondary/20 text-secondary-foreground text-xs px-2 py-1 rounded-md font-bold border border-secondary/30">
                      🎯 {accuracies[p.audit_type]}% Acc
                    </span>
                  )}
                </div>
                <div className="space-y-1 mb-6">
                  <p className="text-sm text-muted-foreground flex items-center gap-2">
                    <span className="font-medium">Algorithm:</span> {getAuditLabel(p.audit_type)}
                  </p>
                  <p className="text-sm text-muted-foreground flex items-center gap-2">
                    <span className="font-medium">Threshold:</span> {p.threshold || 'N/A'}
                  </p>
                  {p.county && (
                    <p className="text-sm text-muted-foreground flex items-center gap-2">
                      <span className="font-medium">County:</span> {p.county}
                    </p>
                  )}
                </div>
              </div>
              
              <Link 
                href={`/analysis?audit=${p.audit_type}&county=${encodeURIComponent(p.county)}&threshold=${p.threshold}`}
                className="btn-primary w-full justify-center bg-primary/90"
              >
                Launch Mission
              </Link>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
