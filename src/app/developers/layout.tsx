"use client";

import React from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { 
  Terminal, BookOpen, Key, Shield, Calculator, FileJson, 
  Search, ChevronRight, Layers, LayoutTemplate, Activity, AlertTriangle, Blocks, Building2, ArrowDownUp
} from "lucide-react";
import MariRightPanel from "@/components/MariRightPanel";

export default function DevelopersLayout({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();

  const navigation = [
    {
      group: "Getting Started",
      items: [
        { name: "Introduction", href: "/developers", icon: BookOpen },
        { name: "Why Marigold?", href: "/developers/docs/philosophy", icon: Shield },
        { name: "Quickstart Guide", href: "/developers/docs/getting-started", icon: Terminal },
        { name: "Official SDKs", href: "/developers/docs/sdks", icon: Blocks },
      ]
    },
    {
      group: "Core Infrastructure",
      items: [
        { name: "Authentication & Tokens", href: "/developers/docs/authentication", icon: Key },
        { name: "Webhooks & Callbacks", href: "/developers/docs/webhooks", icon: Activity },
        { name: "Zero-PII Cryptography", href: "/developers/docs/cryptography", icon: Shield },
        { name: "Data Traversal & Versioning", href: "/developers/docs/versioning", icon: Layers },
        { name: "Partner Integrations", href: "/developers/docs/partner-integrations", icon: Building2 },
      ]
    },
    {
      group: "Algorithmic Proofs",
      items: [
        { name: "Fellegi-Sunter Matching", href: "/developers/docs/algorithms/fellegi-sunter", icon: Calculator },
        { name: "Standard Deviation (Z-Score)", href: "/developers/docs/algorithms/z-score", icon: Activity },
      ]
    },
    {
      group: "API Reference",
      items: [
        { name: "Anomaly Detection", href: "/developers/docs/api-reference/detect", icon: LayoutTemplate },
        { name: "Historical Delta", href: "/developers/docs/api-reference/historical-delta", icon: ArrowDownUp },
        { name: "Active Modules List", href: "/developers/docs/api-reference/list", icon: Blocks },
        { name: "Error Codes Dictionary", href: "/developers/docs/errors", icon: AlertTriangle },
      ]
    }
  ];

  return (
    <div className="min-h-screen bg-background text-foreground font-sans flex flex-col md:flex-row">
      
      {/* Sidebar Navigation */}
      <aside className="w-full md:w-72 border-r border-border bg-card-bg md:min-h-screen flex flex-col sticky top-0 z-40 md:h-screen shadow-sm">
        <div className="p-5 border-b border-border-soft flex flex-col gap-4">
          <Link href="/" className="flex items-center gap-2 text-foreground hover:text-primary transition-colors">
            <Layers className="w-5 h-5 text-primary" />
            <span className="font-black tracking-tight text-lg">Marigold Docs</span>
          </Link>
          
          <div className="relative">
            <Search className="w-4 h-4 absolute left-3 top-2.5 text-secondary" />
            <input 
              type="text" 
              placeholder="Search documentation (Cmd+K)" 
              className="w-full pl-9 pr-3 py-2 bg-input border border-border-soft rounded-[12px] text-sm focus:outline-none focus:ring-2 focus:ring-primary shadow-sm"
            />
          </div>
        </div>
        
        <nav className="flex-1 overflow-y-auto p-4 space-y-8">
          {navigation.map((section, idx) => (
            <div key={idx}>
              <h4 className="text-xs font-black uppercase tracking-wider text-foreground mb-3 px-2">
                {section.group}
              </h4>
              <div className="space-y-1">
                {section.items.map((item) => {
                  const isActive = pathname === item.href;
                  return (
                    <Link
                      key={item.name}
                      href={item.href}
                      className={`w-full text-left px-3 py-2 rounded-[12px] flex items-center justify-between transition-all group ${
                        isActive 
                          ? 'bg-primary/10 text-primary font-bold shadow-sm border border-primary/20' 
                          : 'text-secondary hover:bg-muted hover:text-foreground font-medium'
                      }`}
                    >
                      <div className="flex items-center gap-2.5">
                        <item.icon className={`w-4 h-4 ${isActive ? 'text-primary' : 'text-secondary group-hover:text-foreground'}`} />
                        <span className="text-sm">{item.name}</span>
                      </div>
                      {isActive && <ChevronRight className="w-3.5 h-3.5 text-primary" />}
                    </Link>
                  );
                })}
              </div>
            </div>
          ))}
        </nav>

        <div className="p-4 border-t border-border-soft bg-card-bg mt-auto flex justify-between items-center">
          <span className="text-xs font-bold text-secondary">v1.0.4 Enterprise</span>
          <Link href="/contact" className="text-xs font-bold text-primary hover:underline">
            Support
          </Link>
        </div>
      </aside>

      {/* Main Content Area */}
      <main className="flex-1 overflow-y-auto bg-background relative">
        <div className="max-w-4xl mx-auto px-8 py-12 lg:px-16 lg:py-16">
          {children}
        </div>
      </main>

      {/* Persistent Mari AI Side Panel */}
      <MariRightPanel />
    </div>
  );
}
