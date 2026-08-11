"use client";

import { useFeed } from "@/lib/workspace/FeedContext";
import { formatDistanceToNow } from "date-fns";
import { Activity, BookOpen, AlertTriangle, ShieldCheck, Ticket } from "lucide-react";
import Link from "next/link";

export default function FeedPage() {
  const { feedEvents } = useFeed();
  const activeGroup = typeof window !== 'undefined' ? localStorage.getItem("marigold_active_group") || "Unknown Group" : "";

  return (
    <div className="max-w-4xl mx-auto p-6 animate-in fade-in duration-500 pb-32">
      <div className="mb-10">
        <h1 className="text-4xl font-serif font-black text-text-header mb-3 tracking-tight">Group Feed</h1>
        <p className="text-lg text-text-body max-w-2xl leading-relaxed">
          Zero-knowledge event stream for <span className="font-bold text-primary">{activeGroup}</span>. 
          Monitor team activity, shared playbooks, and ticket escalations here.
        </p>
      </div>

      <div className="space-y-6">
        {feedEvents.length === 0 ? (
          <div className="text-center py-20 bg-surface border border-border-soft rounded-2xl">
            <Activity className="w-12 h-12 text-muted-foreground mx-auto mb-4 opacity-50" />
            <h3 className="text-xl font-bold text-text-header mb-2">No Recent Activity</h3>
            <p className="text-text-body max-w-md mx-auto">
              This feed will automatically update when members of {activeGroup} promote playbooks or triage tickets.
            </p>
          </div>
        ) : (
          <div className="relative border-l-2 border-border-soft ml-4 md:ml-6 space-y-8 pb-10">
            {feedEvents.map((event, idx) => {
              let Icon = Activity;
              let iconColor = "text-slate-500";
              let iconBg = "bg-slate-100";
              let linkPath = "";
              let linkText = "";

              if (event.type === "playbook_promoted") {
                Icon = BookOpen;
                iconColor = "text-indigo-600";
                iconBg = "bg-indigo-100";
                linkPath = "/playbooks";
                linkText = "View Playbook";
              } else if (event.type === "ticket_promoted") {
                Icon = Ticket;
                iconColor = "text-emerald-600";
                iconBg = "bg-emerald-100";
                linkPath = "/dashboard";
                linkText = "View Ticket in Triage";
              } else if (event.type === "system_alert") {
                Icon = AlertTriangle;
                iconColor = "text-amber-600";
                iconBg = "bg-amber-100";
              }

              return (
                <div key={event.id} className="relative pl-8 md:pl-10">
                  {/* Timeline Dot */}
                  <div className={`absolute -left-[17px] top-1 w-8 h-8 rounded-full border-4 border-background flex items-center justify-center ${iconBg}`}>
                    <Icon className={`w-4 h-4 ${iconColor}`} />
                  </div>
                  
                  {/* Content Card */}
                  <div className="bg-white border border-border-soft rounded-2xl p-5 shadow-sm hover:shadow-md transition-shadow">
                    <div className="flex justify-between items-start mb-2">
                      <p className="text-text-header">
                        <span className="font-bold">{event.author}</span> {event.message}
                      </p>
                      <span className="text-xs text-muted-foreground whitespace-nowrap ml-4">
                        {formatDistanceToNow(new Date(event.timestamp), { addSuffix: true })}
                      </span>
                    </div>
                    
                    {linkPath && (
                      <div className="mt-4 pt-4 border-t border-border-soft flex justify-end">
                        <Link href={linkPath} className="text-sm font-bold text-primary hover:text-primary/80 transition-colors flex items-center gap-2">
                          {linkText} &rarr;
                        </Link>
                      </div>
                    )}
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
}
