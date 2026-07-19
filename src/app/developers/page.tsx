"use client";

import React, { useState } from "react";
import Link from "next/link";
import { 
  Terminal, 
  BookOpen, 
  Code2, 
  ShieldCheck, 
  Zap, 
  Search, 
  ArrowRight, 
  Database,
  Lock,
  Layers,
  Sparkles,
  ChevronRight,
  MessageSquare,
  Globe,
  Settings
} from "lucide-react";

export default function DevelopersPage() {
  const [activeTab, setActiveTab] = useState("overview");
  const [searchQuery, setSearchQuery] = useState("");
  const [mariQuery, setMariQuery] = useState("");
  const [mariResponse, setMariResponse] = useState<string | null>(null);
  const [isQuerying, setIsQuerying] = useState(false);

  const handleAskMari = async () => {
    if (!mariQuery.trim()) return;
    setIsQuerying(true);
    setMariResponse(null);

    // Simulate API call for the UI DevEx
    setTimeout(() => {
      setMariResponse(
        "Marigold operates under a Sovereign-by-Default architecture. This means the AI (me) never sees the raw voter PII. When you connect via our API, you are passing an AES-GCM encrypted payload that is decrypted exclusively inside the local browser RAM of the citizen auditor. Our explicit bias is transparency: we separate the non-fungible validation data (handled by vendors like ELLY) from the high-speed search and anomaly detection executed on the client edge."
      );
      setIsQuerying(false);
    }, 1200);
  };

  return (
    <div className="min-h-screen bg-background text-foreground font-sans flex flex-col md:flex-row selection:bg-accent selection:text-white">
      
      {/* Sidebar Navigation */}
      <aside className="w-full md:w-64 border-r border-border bg-white md:min-h-screen flex flex-col sticky top-0 z-40 md:h-screen">
        <div className="p-5 border-b border-border flex items-center gap-2">
          <Layers className="w-5 h-5 text-accent" />
          <span className="font-black tracking-tight text-lg">Marigold SDK</span>
        </div>
        
        <div className="p-4 border-b border-border bg-slate-50">
          <div className="relative">
            <Search className="w-4 h-4 text-muted-foreground absolute left-3 top-2.5" />
            <input 
              type="text" 
              placeholder="Search SDK..." 
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full bg-white border border-border rounded-lg pl-9 pr-3 py-2 text-xs font-medium focus:outline-none focus:border-accent focus:ring-1 focus:ring-accent transition-all shadow-sm"
            />
          </div>
        </div>

        <nav className="flex-1 overflow-y-auto p-4 space-y-6 text-sm font-medium">
          <div>
            <h4 className="text-[10px] font-black uppercase tracking-wider text-muted-foreground mb-2 px-2">Core Concepts</h4>
            <ul className="space-y-1">
              <li>
                <button onClick={() => setActiveTab("overview")} className={`w-full text-left px-2 py-1.5 rounded-md flex items-center gap-2 transition-colors ${activeTab === 'overview' ? 'bg-accent/10 text-accent font-bold' : 'text-foreground hover:bg-muted'}`}>
                  <Globe className="w-4 h-4" /> Layer 2 Architecture
                </button>
              </li>
              <li>
                <button onClick={() => setActiveTab("node")} className={`w-full text-left px-2 py-1.5 rounded-md flex items-center gap-2 transition-colors ${activeTab === 'node' ? 'bg-accent/10 text-accent font-bold' : 'text-foreground hover:bg-muted'}`}>
                  <Terminal className="w-4 h-4" /> Run Your Own Node
                </button>
              </li>
            </ul>
          </div>
          
          <div>
            <h4 className="text-[10px] font-black uppercase tracking-wider text-muted-foreground mb-2 px-2">Integration</h4>
            <ul className="space-y-1">
              <li>
                <button onClick={() => setActiveTab("rest")} className={`w-full text-left px-2 py-1.5 rounded-md flex items-center gap-2 transition-colors ${activeTab === 'rest' ? 'bg-accent/10 text-accent font-bold' : 'text-foreground hover:bg-muted'}`}>
                  <Code2 className="w-4 h-4" /> REST Worklist API
                </button>
              </li>
              <li>
                <button onClick={() => setActiveTab("websockets")} className={`w-full text-left px-2 py-1.5 rounded-md flex items-center gap-2 transition-colors ${activeTab === 'websockets' ? 'bg-accent/10 text-accent font-bold' : 'text-foreground hover:bg-muted'}`}>
                  <Zap className="w-4 h-4" /> WebSocket Steams
                </button>
              </li>
            </ul>
          </div>
        </nav>

        <div className="p-4 border-t border-border bg-slate-50 mt-auto">
          <Link href="/" className="text-xs font-bold text-muted-foreground hover:text-foreground flex items-center gap-1">
            &larr; Back to Marigold App
          </Link>
        </div>
      </aside>

      {/* Main Content Area */}
      <main className="flex-1 overflow-y-auto bg-[#FAF8F5] pb-24">
        
        {/* Header Strip */}
        <header className="bg-white border-b border-border px-8 py-5 flex items-center justify-between sticky top-0 z-30">
          <div className="flex items-center gap-2 text-sm font-bold text-muted-foreground">
            <span>Developers</span>
            <ChevronRight className="w-3.5 h-3.5" />
            <span className="text-foreground capitalize">{activeTab.replace('-', ' ')}</span>
          </div>
          <div className="flex gap-3">
            <Link href="/contact" className="btn-secondary text-xs h-8 px-4 py-0">Custom API Support</Link>
          </div>
        </header>

        <div className="max-w-4xl mx-auto px-8 py-12 space-y-10">
          
          {/* Tab: Overview (Layer 2) */}
          {activeTab === "overview" && (
            <div className="space-y-8 animate-in fade-in slide-in-from-bottom-4">
              <div className="space-y-4">
                <span className="inline-block px-3 py-1 bg-accent/10 text-accent border border-accent/20 rounded-full text-xs font-black uppercase tracking-widest">Architectural Paradigm</span>
                <h1 className="text-4xl font-black font-serif tracking-tight text-primary">Marigold as Layer 2 Civic Data</h1>
                <p className="text-lg text-muted-foreground leading-relaxed font-medium">
                  Marigold is a zero-cloud cryptographic standard. We do not replace monolithic civic data providers (like ELLY). We act as the high-speed, local search and anomaly detection engine, while your platform acts as the verified source of truth.
                </p>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-5 pt-4">
                <div className="bg-white border border-border p-6 rounded-2xl shadow-sm space-y-3">
                  <div className="w-10 h-10 rounded-lg bg-emerald-100 flex items-center justify-center border border-emerald-200">
                    <Database className="w-5 h-5 text-emerald-700" />
                  </div>
                  <h3 className="font-bold text-primary">Layer 1: Verification (You)</h3>
                  <p className="text-sm text-muted-foreground leading-relaxed">
                    Vendors like ELLY ingest, clean, and validate massive civic datasets. You are the source of truth. You handle the heavy compliance and structural integrity.
                  </p>
                </div>
                <div className="bg-white border border-border p-6 rounded-2xl shadow-sm space-y-3 relative overflow-hidden">
                  <div className="w-10 h-10 rounded-lg bg-accent/10 flex items-center justify-center border border-accent/20 relative z-10">
                    <Zap className="w-5 h-5 text-accent" />
                  </div>
                  <h3 className="font-bold text-primary relative z-10">Layer 2: Execution (Marigold)</h3>
                  <p className="text-sm text-muted-foreground leading-relaxed relative z-10">
                    We act as the Google Search for your data. Users instantiate your data locally in their browser RAM to run complex statistical analysis instantly without exposing PII.
                  </p>
                  <div className="absolute -right-4 -bottom-4 opacity-[0.03] z-0">
                    <Layers className="w-48 h-48" />
                  </div>
                </div>
              </div>

              <div className="bg-slate-900 text-white p-8 rounded-2xl shadow-lg border border-slate-800 space-y-5">
                <h3 className="text-xl font-bold flex items-center gap-2">
                  <ShieldCheck className="w-5 h-5 text-emerald-400" />
                  Why This Matters for Your API
                </h3>
                <p className="text-slate-300 text-sm leading-relaxed">
                  Most civic tech developers build centralized databases. The July 2026 declassifications proved this is a security liability. Marigold allows your users to share workflows, flags, and notes across the internet using **SHA-256 fingerprinting** and **AES-GCM-256 encryption**, meaning you can offer seamless cross-platform collaboration without ever transmitting raw voter PII across state lines.
                </p>
              </div>
            </div>
          )}

          {/* Tab: Run Your Own Node */}
          {activeTab === "node" && (
            <div className="space-y-8 animate-in fade-in slide-in-from-bottom-4">
              <div className="space-y-4">
                <span className="inline-block px-3 py-1 bg-slate-200 text-slate-800 border border-slate-300 rounded-full text-xs font-black uppercase tracking-widest">Ideological Architecture</span>
                <h1 className="text-4xl font-black font-serif tracking-tight text-primary">Run Your Own Civic Node</h1>
                <p className="text-lg text-muted-foreground leading-relaxed font-medium">
                  Drawing from Bitcoin network principles, Marigold empowers individual citizens and clerks to source civic data locally and instantiate it within their own sovereign browser environment.
                </p>
              </div>

              <div className="prose prose-slate max-w-none">
                <p>
                  When a user loads Marigold, they are not logging into a SaaS platform. They are booting up a local, cryptographic application. The search protocols (e.g., Fuzzy Matching, Benford's Law distribution curves) execute purely based on row-headers and SQL schemas without retaining the non-fungible PII.
                </p>
                <div className="bg-white border-l-4 border-accent p-5 rounded-r-xl shadow-sm my-6">
                  <h4 className="font-bold text-primary m-0 mb-2">The "Google Search" Analogy</h4>
                  <p className="text-sm m-0 text-muted-foreground">
                    Think of Marigold as a meta-search utility agnostic to the core database. The nerds (developers) create open-source search algorithms here. The users run them instantly. When a user finds an anomaly, they encrypt it and send a <strong>Worklist payload</strong> back to your platform (the Layer 1 Verification Source) for official escalation.
                  </p>
                </div>
              </div>
            </div>
          )}

          {/* Tab: REST Worklist API */}
          {activeTab === "rest" && (
            <div className="space-y-8 animate-in fade-in slide-in-from-bottom-4">
              <div className="space-y-4">
                <span className="inline-block px-3 py-1 bg-blue-100 text-blue-800 border border-blue-200 rounded-full text-xs font-black uppercase tracking-widest">Integration Guide</span>
                <h1 className="text-4xl font-black font-serif tracking-tight text-primary">Consuming Marigold Worklists</h1>
                <p className="text-lg text-muted-foreground leading-relaxed font-medium">
                  A language-agnostic guide to receiving encrypted forensic anomalies from Marigold directly into your verification platform (e.g., ELLY).
                </p>
              </div>

              <div className="space-y-4">
                <h3 className="font-bold text-lg border-b border-border pb-2">1. The Encrypted Payload Structure</h3>
                <p className="text-sm text-muted-foreground">
                  When a user flags a block of anomalous registrations (e.g., 400 voters clustered at a single commercial P.O. Box), Marigold will POST an AES-GCM encrypted payload to your configured webhook.
                </p>
                
                <div className="bg-[#1E1E1E] rounded-xl overflow-hidden shadow-md">
                  <div className="bg-[#2D2D2D] px-4 py-2 text-xs font-mono text-slate-400 flex items-center justify-between">
                    <span>Example: POST /api/marigold/ingest</span>
                    <span>application/json</span>
                  </div>
                  <pre className="p-4 text-xs font-mono text-emerald-400 overflow-x-auto">
{`{
  "marigold_session_id": "sha256-hash-fingerprint",
  "dataset_checksum": "8f434346648f6b96df89dda901c5176b...",
  "payload": {
    "ciphertext": "U2FsdGVkX19xUq...",
    "iv": "a4b5c6d7e8f9a0b1c2d3e4f5",
    "authTag": "1a2b3c4d5e6f7a8b9c0d1e2f3a4b5c6d"
  },
  "anomaly_type": "HIGH_DENSITY_OCCUPANCY"
}`}
                  </pre>
                </div>
              </div>

              <div className="space-y-4 pt-4">
                <h3 className="font-bold text-lg border-b border-border pb-2">2. Decrypting the Payload</h3>
                <p className="text-sm text-muted-foreground">
                  Your platform must hold the shared Group Secret (established during out-of-band onboarding). Below are examples in multiple environments.
                </p>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  {/* C# Example */}
                  <div className="bg-[#1E1E1E] rounded-xl overflow-hidden shadow-md">
                    <div className="bg-[#2D2D2D] px-4 py-2 text-xs font-mono text-slate-300">C# / .NET Example</div>
                    <pre className="p-4 text-[10px] font-mono text-blue-300 overflow-x-auto">
{`using System.Security.Cryptography;

public byte[] DecryptWorklist(byte[] ciphertext, byte[] key, byte[] nonce, byte[] tag)
{
    using (var cipher = new AesGcm(key))
    {
        var plaintext = new byte[ciphertext.Length];
        cipher.Decrypt(nonce, ciphertext, tag, plaintext);
        return plaintext;
    }
}`}
                    </pre>
                  </div>
                  
                  {/* Python Example */}
                  <div className="bg-[#1E1E1E] rounded-xl overflow-hidden shadow-md">
                    <div className="bg-[#2D2D2D] px-4 py-2 text-xs font-mono text-slate-300">Python Example</div>
                    <pre className="p-4 text-[10px] font-mono text-yellow-300 overflow-x-auto">
{`from cryptography.hazmat.primitives.ciphers.aead import AESGCM

def decrypt_worklist(key: bytes, nonce: bytes, ciphertext: bytes, tag: bytes):
    aesgcm = AESGCM(key)
    # The cryptography library appends the tag to the ciphertext
    return aesgcm.decrypt(nonce, ciphertext + tag, None)`}
                    </pre>
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* Interactive Sovereign Mari AI Assistant */}
          <div className="mt-16 pt-8 border-t border-border">
            <div className="bg-white border-2 border-accent/20 rounded-2xl p-6 md:p-8 shadow-lg">
              <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-6 border-b border-border pb-4">
                <div>
                  <h3 className="text-lg font-black font-serif text-primary flex items-center gap-2">
                    <Sparkles className="w-5 h-5 text-accent" />
                    Mari Dev Assistant
                  </h3>
                  <p className="text-xs font-bold text-muted-foreground mt-1">
                    Powered by <a href="https://greater.pink" target="_blank" rel="noopener noreferrer" className="text-accent hover:underline">Sovereign-by-Default FOSS Principles</a>. Explicit bias: Cryptographic Transparency.
                  </p>
                </div>
              </div>

              <div className="flex flex-col md:flex-row gap-3">
                <input 
                  type="text" 
                  value={mariQuery}
                  onChange={(e) => setMariQuery(e.target.value)}
                  placeholder="Ask Mari how to integrate a specific language or implement SHA-256 fingerprinting..."
                  className="input-field flex-1 text-sm font-medium"
                  onKeyDown={(e) => e.key === 'Enter' && handleAskMari()}
                />
                <button 
                  onClick={handleAskMari}
                  disabled={isQuerying || !mariQuery.trim()}
                  className="btn-primary flex-shrink-0 min-w-[120px]"
                >
                  {isQuerying ? "Synthesizing..." : "Ask Mari"}
                </button>
              </div>

              {mariResponse && (
                <div className="mt-5 p-5 bg-slate-50 rounded-xl border border-slate-200 text-sm leading-relaxed text-slate-800 font-medium animate-in fade-in shadow-inner">
                  <div className="text-[10px] font-black uppercase tracking-widest text-accent mb-2">Mari Synthesis</div>
                  {mariResponse}
                </div>
              )}
            </div>
          </div>

        </div>
      </main>
    </div>
  );
}
