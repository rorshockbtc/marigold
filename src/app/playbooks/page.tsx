"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { Tooltip } from "@/components/Tooltip";

export default function MissionControl() {
  const [playbooks, setPlaybooks] = useState<any[]>([]);
  const [accuracies, setAccuracies] = useState<Record<string, number>>({});
  const [isLoading, setIsLoading] = useState(true);

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

  return (
    <div className="max-w-6xl mx-auto space-y-6 pb-20">
      <header className="mb-8">
        <div className="inline-block px-3 py-1 bg-primary/10 text-primary rounded-full text-sm font-semibold mb-3">
          Mission Control
        </div>
        <h1 className="text-3xl font-bold text-foreground">Organization Playbooks</h1>
        <p className="text-muted-foreground mt-2">
          Your organization's self-teaching To-Do List. Click a playbook below to run a pre-configured audit curated by your team. False positives are automatically filtered out, and the model learns from your feedback to predict accuracy. 
          Need help understanding the data? <Tooltip content="If the data looks confusing, hover over the ℹ️ icons or ask the AI Chat Guide to explain the math for you."><span className="text-primary font-semibold underline decoration-dotted">Hover here for a tip.</span></Tooltip>
        </p>
      </header>

      {isLoading ? (
        <p className="text-muted-foreground">Loading Playbooks...</p>
      ) : playbooks.length === 0 ? (
        <div className="card text-center py-12">
          <h2 className="text-xl font-bold mb-2">No Playbooks Found</h2>
          <p className="text-muted-foreground mb-6">Your organization hasn't saved any playbooks yet.</p>
          <Link href="/analysis" className="btn-primary">
            Go to Pro Mode to create one
          </Link>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {playbooks.map((p) => (
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
