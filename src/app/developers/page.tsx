"use client";

import React, { useState, useEffect } from "react";
import Link from "next/link";
import { 
  Terminal, BookOpen, Code2, ShieldCheck, Zap, Search, 
  ArrowRight, Database, Lock, Layers, Sparkles, ChevronRight, 
  MessageSquare, Globe, Settings, Key, Cpu, FileJson, 
  Server, Activity, FileKey, Copy, Check
} from "lucide-react";

export default function DevelopersPage() {
  const [activeTab, setActiveTab] = useState("overview");
  const [searchQuery, setSearchQuery] = useState("");
  const [sandboxInput, setSandboxInput] = useState("{\"citizen_id\": \"US-90210-XYZ\", \"status\": \"ACTIVE\"}");
  const [sandboxKey, setSandboxKey] = useState("marigold_shared_secret_2026");
  const [sandboxOutput, setSandboxOutput] = useState("");
  const [isEncrypting, setIsEncrypting] = useState(false);
  const [copied, setCopied] = useState("");

  const handleCopy = (text: string, id: string) => {
    navigator.clipboard.writeText(text);
    setCopied(id);
    setTimeout(() => setCopied(""), 2000);
  };

  const handleEncrypt = () => {
    setIsEncrypting(true);
    setSandboxOutput("");
    
    // Simulate complex local cryptography
    setTimeout(() => {
      try {
        // A mock representation of AES-GCM-256 for the sandbox UI
        const mockPayload = "a4b5c6d7e8f9a0b1c2d3e4f5" + Buffer.from(sandboxInput).toString("base64").substring(0, 32) + "1a2b3c4d5e6f7a8b9c0d1e2f3a4b5c6d";
        
        setSandboxOutput(JSON.stringify({
          encrypted_payload: mockPayload,
          encryption_standard: "AES-GCM-256",
          algorithm: "Sovereign-Local-RAM",
          status: "SUCCESS"
        }, null, 2));
      } catch (err) {
        setSandboxOutput("Error: Invalid JSON payload. Do you expect me to magically encrypt malformed syntax? Fix your JSON.");
      }
      setIsEncrypting(false);
    }, 850);
  };

  return (
    <div className="min-h-screen bg-[#FDFCFB] text-[#1A1A1A] font-[family-name:var(--font-inter)] flex flex-col md:flex-row selection:bg-[#EAE4DC] selection:text-[#1A1A1A]">
      
      {/* Sidebar Navigation */}
      <aside className="w-full md:w-72 border-r border-[#EBE8E3] bg-[#F7F6F2] md:min-h-screen flex flex-col sticky top-0 z-40 md:h-screen">
        <div className="p-6 border-b border-[#EBE8E3] flex items-center gap-3">
          <div className="bg-[#1A1A1A] text-white p-1.5 rounded flex items-center justify-center">
            <Layers className="w-5 h-5" />
          </div>
          <div>
            <span className="font-[family-name:var(--font-fraunces)] font-black tracking-tight text-xl leading-none block text-[#1A1A1A]">Marigold SDK</span>
            <span className="text-[10px] font-bold uppercase tracking-widest text-[#666666]">Developer Hub</span>
          </div>
        </div>
        
        <div className="p-5 border-b border-[#EBE8E3] bg-[#F3F1ED]">
          <div className="relative">
            <Search className="w-4 h-4 text-[#8C8C8C] absolute left-3 top-2.5" />
            <input 
              type="text" 
              placeholder="Search documentation..." 
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full bg-white border border-[#D9D5CF] rounded px-9 py-2 text-xs font-medium focus:outline-none focus:border-[#1A1A1A] focus:ring-1 focus:ring-[#1A1A1A] transition-all shadow-sm text-[#1A1A1A] placeholder-[#8C8C8C]"
            />
          </div>
        </div>

        <nav className="flex-1 overflow-y-auto p-5 space-y-8 text-sm font-medium">
          <div>
            <h4 className="text-[11px] font-bold uppercase tracking-widest text-[#8C8C8C] mb-3 px-2">Core Concepts</h4>
            <ul className="space-y-1">
              <li>
                <button onClick={() => setActiveTab("overview")} className={`w-full text-left px-3 py-2 rounded flex items-center gap-2.5 transition-all ${activeTab === 'overview' ? 'bg-[#1A1A1A] text-white font-semibold shadow-md' : 'text-[#4D4D4D] hover:bg-[#EBE8E3] hover:text-[#1A1A1A]'}`}>
                  <Globe className="w-4 h-4" /> Layer 2 Architecture
                </button>
              </li>
              <li>
                <button onClick={() => setActiveTab("security")} className={`w-full text-left px-3 py-2 rounded flex items-center gap-2.5 transition-all ${activeTab === 'security' ? 'bg-[#1A1A1A] text-white font-semibold shadow-md' : 'text-[#4D4D4D] hover:bg-[#EBE8E3] hover:text-[#1A1A1A]'}`}>
                  <ShieldCheck className="w-4 h-4" /> Threat Model &amp; Crypto
                </button>
              </li>
              <li>
                <button onClick={() => setActiveTab("node")} className={`w-full text-left px-3 py-2 rounded flex items-center gap-2.5 transition-all ${activeTab === 'node' ? 'bg-[#1A1A1A] text-white font-semibold shadow-md' : 'text-[#4D4D4D] hover:bg-[#EBE8E3] hover:text-[#1A1A1A]'}`}>
                  <Terminal className="w-4 h-4" /> Provisioning a Node
                </button>
              </li>
            </ul>
          </div>
          
          <div>
            <h4 className="text-[11px] font-bold uppercase tracking-widest text-[#8C8C8C] mb-3 px-2">API References</h4>
            <ul className="space-y-1">
              <li>
                <button onClick={() => setActiveTab("rest")} className={`w-full text-left px-3 py-2 rounded flex items-center gap-2.5 transition-all ${activeTab === 'rest' ? 'bg-[#1A1A1A] text-white font-semibold shadow-md' : 'text-[#4D4D4D] hover:bg-[#EBE8E3] hover:text-[#1A1A1A]'}`}>
                  <Code2 className="w-4 h-4" /> Worklist REST API
                </button>
              </li>
              <li>
                <button onClick={() => setActiveTab("websockets")} className={`w-full text-left px-3 py-2 rounded flex items-center gap-2.5 transition-all ${activeTab === 'websockets' ? 'bg-[#1A1A1A] text-white font-semibold shadow-md' : 'text-[#4D4D4D] hover:bg-[#EBE8E3] hover:text-[#1A1A1A]'}`}>
                  <Activity className="w-4 h-4" /> State Sync WebSockets
                </button>
              </li>
            </ul>
          </div>

          <div>
            <h4 className="text-[11px] font-bold uppercase tracking-widest text-[#8C8C8C] mb-3 px-2">Interactive Tools</h4>
            <ul className="space-y-1">
              <li>
                <button onClick={() => setActiveTab("sandbox")} className={`w-full text-left px-3 py-2 rounded flex items-center gap-2.5 transition-all ${activeTab === 'sandbox' ? 'bg-[#1A1A1A] text-white font-semibold shadow-md' : 'text-[#4D4D4D] hover:bg-[#EBE8E3] hover:text-[#1A1A1A]'}`}>
                  <Key className="w-4 h-4" /> Cryptography Sandbox
                </button>
              </li>
            </ul>
          </div>
        </nav>

        <div className="p-5 border-t border-[#EBE8E3] bg-[#F7F6F2] mt-auto">
          <Link href="/" className="text-xs font-semibold text-[#8C8C8C] hover:text-[#1A1A1A] flex items-center gap-1.5 transition-colors">
            &larr; Back to Marigold Client
          </Link>
        </div>
      </aside>

      {/* Main Content Area */}
      <main className="flex-1 overflow-y-auto bg-[#FDFCFB]">
        
        {/* Header Strip */}
        <header className="bg-white/80 backdrop-blur-md border-b border-[#EBE8E3] px-10 py-5 flex items-center justify-between sticky top-0 z-30">
          <div className="flex items-center gap-3 text-sm font-semibold text-[#8C8C8C]">
            <span>Developers</span>
            <ChevronRight className="w-3.5 h-3.5" />
            <span className="text-[#1A1A1A] capitalize">{activeTab.replace('-', ' ')}</span>
          </div>
          <div className="flex gap-4 items-center">
            <span className="text-xs font-medium text-[#666666] bg-[#F3F1ED] px-3 py-1.5 rounded-full border border-[#EBE8E3]">v2.4.0 (Stable)</span>
            <Link href="/contact" className="text-xs font-semibold bg-[#1A1A1A] text-white hover:bg-[#333333] transition-colors px-4 py-2 rounded shadow-sm">Enterprise Support</Link>
          </div>
        </header>

        <div className="max-w-4xl mx-auto px-10 py-16 pb-32">
          
          {/* Tab: Overview (Layer 2) */}
          {activeTab === "overview" && (
            <div className="space-y-12 animate-in fade-in duration-500">
              <div className="space-y-6">
                <span className="inline-block px-3 py-1 bg-[#F3F1ED] text-[#4D4D4D] border border-[#D9D5CF] rounded-sm text-[10px] font-bold uppercase tracking-widest">Architectural Paradigm</span>
                <h1 className="text-5xl font-black font-[family-name:var(--font-fraunces)] tracking-tight text-[#1A1A1A] leading-[1.1]">
                  Marigold as Layer 2 Civic Data
                </h1>
                <p className="text-xl text-[#4D4D4D] leading-relaxed font-light">
                  Marigold is a zero-cloud cryptographic standard. We do not replace monolithic civic data providers (like ELLY). We act as the high-speed, local search and anomaly detection engine, while your platform acts as the verified source of truth.
                </p>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                <div className="bg-white border border-[#EBE8E3] p-8 rounded-xl shadow-sm space-y-4 hover:shadow-md transition-shadow">
                  <div className="w-12 h-12 rounded bg-[#F7F6F2] flex items-center justify-center border border-[#D9D5CF]">
                    <Database className="w-6 h-6 text-[#1A1A1A]" />
                  </div>
                  <h3 className="text-xl font-bold font-[family-name:var(--font-fraunces)] text-[#1A1A1A]">Layer 1: Verification (You)</h3>
                  <p className="text-[15px] text-[#666666] leading-relaxed">
                    Vendors like ELLY ingest, clean, and validate massive civic datasets. You are the source of truth. You handle the heavy compliance, statutory retention, and structural integrity.
                  </p>
                </div>
                <div className="bg-[#1A1A1A] border border-[#333333] p-8 rounded-xl shadow-lg space-y-4 relative overflow-hidden text-white">
                  <div className="w-12 h-12 rounded bg-[#333333] flex items-center justify-center border border-[#4D4D4D] relative z-10">
                    <Zap className="w-6 h-6 text-[#EAE4DC]" />
                  </div>
                  <h3 className="text-xl font-bold font-[family-name:var(--font-fraunces)] relative z-10">Layer 2: Execution (Marigold)</h3>
                  <p className="text-[15px] text-[#A3A3A3] leading-relaxed relative z-10">
                    We act as the distributed execution environment for your data. Users instantiate your data locally in their browser RAM to run complex statistical analysis instantly without exposing PII to the cloud.
                  </p>
                  <div className="absolute -right-8 -bottom-8 opacity-5 z-0">
                    <Layers className="w-64 h-64" />
                  </div>
                </div>
              </div>

              <div className="border-t border-[#EBE8E3] pt-12 space-y-6">
                <h2 className="text-3xl font-bold font-[family-name:var(--font-fraunces)] text-[#1A1A1A]">Integration Philosophy</h2>
                <div className="prose prose-lg prose-slate max-w-none text-[#4D4D4D]">
                  <p>
                    Integrating with Marigold requires a fundamental shift in how you view data sovereignty. In a traditional SaaS model, your users authenticate with your server, query your database, and view the results on a thin client. 
                  </p>
                  <p>
                    In the Marigold architecture, <strong>the client is thick, and the server is blind</strong>. 
                  </p>
                  <ul className="space-y-3 mt-6 mb-8">
                    <li className="flex items-start gap-3">
                      <Check className="w-6 h-6 text-emerald-600 flex-shrink-0 mt-0.5" />
                      <span><strong>State belongs to the user:</strong> User sessions, flags, and worklists live purely in local storage (IndexedDB) and are encrypted at rest.</span>
                    </li>
                    <li className="flex items-start gap-3">
                      <Check className="w-6 h-6 text-emerald-600 flex-shrink-0 mt-0.5" />
                      <span><strong>Compute is pushed to the edge:</strong> WebAssembly and Service Workers handle intensive data linkage, minimizing latency and maximizing privacy.</span>
                    </li>
                    <li className="flex items-start gap-3">
                      <Check className="w-6 h-6 text-emerald-600 flex-shrink-0 mt-0.5" />
                      <span><strong>Transmission is zero-knowledge:</strong> When data must leave the client, it does so as an opaque, authenticated, encrypted payload (AES-GCM) that only the intended recipient (Layer 1) can decrypt.</span>
                    </li>
                  </ul>
                  <p className="text-sm italic text-[#8C8C8C] mt-8 border-l-4 border-[#D9D5CF] pl-4">
                    "If you are expecting a standard CRUD REST API where you can arbitrarily query voter records over HTTPS, you are in the wrong place. We don't have that data. We couldn't give it to you even under subpoena. That is the point." 
                  </p>
                </div>
              </div>
            </div>
          )}

          {/* Tab: Security & Threat Model */}
          {activeTab === "security" && (
            <div className="space-y-12 animate-in fade-in duration-500">
              <div className="space-y-6">
                <span className="inline-block px-3 py-1 bg-[#F3F1ED] text-[#4D4D4D] border border-[#D9D5CF] rounded-sm text-[10px] font-bold uppercase tracking-widest">Cryptography</span>
                <h1 className="text-5xl font-black font-[family-name:var(--font-fraunces)] tracking-tight text-[#1A1A1A] leading-[1.1]">
                  Threat Model &amp; Cryptography
                </h1>
                <p className="text-xl text-[#4D4D4D] leading-relaxed font-light">
                  Enterprise-grade B2B applications require exhaustive threat modeling. Here is exactly how we handle encryption, key exchange, and data at rest.
                </p>
              </div>

              <div className="space-y-8">
                <div className="bg-white border border-[#EBE8E3] rounded-xl overflow-hidden shadow-sm">
                  <div className="bg-[#F7F6F2] px-6 py-4 border-b border-[#EBE8E3] flex items-center gap-3">
                    <ShieldCheck className="w-5 h-5 text-[#1A1A1A]" />
                    <h3 className="font-bold text-lg text-[#1A1A1A]">Data in Transit (E2EE)</h3>
                  </div>
                  <div className="p-6 prose max-w-none text-[#4D4D4D]">
                    <p>
                      All payloads exported from Marigold (such as anomaly reports or worklists) are encrypted using <strong>AES-256-GCM</strong>. We utilize GCM (Galois/Counter Mode) because it provides both authenticated encryption and data integrity. If a single bit of the ciphertext is altered in transit by an intermediary, the authentication tag verification will fail, and the payload will be rejected by the receiver.
                    </p>
                  </div>
                </div>

                <div className="bg-white border border-[#EBE8E3] rounded-xl overflow-hidden shadow-sm">
                  <div className="bg-[#F7F6F2] px-6 py-4 border-b border-[#EBE8E3] flex items-center gap-3">
                    <Lock className="w-5 h-5 text-[#1A1A1A]" />
                    <h3 className="font-bold text-lg text-[#1A1A1A]">Key Management</h3>
                  </div>
                  <div className="p-6 prose max-w-none text-[#4D4D4D]">
                    <p>
                      We employ a federated key management system. A Marigold node never hardcodes shared secrets. 
                    </p>
                    <ul>
                      <li>The <strong>Client Key</strong> is derived from a high-entropy passphrase via PBKDF2 (100,000 iterations, HMAC-SHA256).</li>
                      <li>The <strong>Platform Key</strong> (used to communicate with ELLY or state registries) is provisioned via an out-of-band secure exchange during enterprise onboarding.</li>
                      <li>Ephemeral Session Keys are derived via ECDH (Elliptic-Curve Diffie-Hellman) over curve secp256r1.</li>
                    </ul>
                  </div>
                </div>

                <div className="bg-white border border-[#EBE8E3] rounded-xl overflow-hidden shadow-sm">
                  <div className="bg-[#F7F6F2] px-6 py-4 border-b border-[#EBE8E3] flex items-center gap-3">
                    <Cpu className="w-5 h-5 text-[#1A1A1A]" />
                    <h3 className="font-bold text-lg text-[#1A1A1A]">Memory Protection</h3>
                  </div>
                  <div className="p-6 prose max-w-none text-[#4D4D4D]">
                    <p>
                      JavaScript in the browser is notoriously hostile to secure memory management because developers lack control over garbage collection. To mitigate this:
                    </p>
                    <p>
                      We execute sensitive cryptographic operations inside a dedicated WebAssembly (Wasm) module compiled from Rust. This allows us to explicitly zeroize memory buffers (`memset(0)`) immediately after the ciphertext is generated and before the Wasm memory is yielded back to the V8 JavaScript engine.
                    </p>
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* Tab: REST Worklist API */}
          {activeTab === "rest" && (
            <div className="space-y-12 animate-in fade-in duration-500">
              <div className="space-y-6">
                <span className="inline-block px-3 py-1 bg-[#F3F1ED] text-[#4D4D4D] border border-[#D9D5CF] rounded-sm text-[10px] font-bold uppercase tracking-widest">Integration Guide</span>
                <h1 className="text-5xl font-black font-[family-name:var(--font-fraunces)] tracking-tight text-[#1A1A1A] leading-[1.1]">
                  Consuming Marigold Worklists
                </h1>
                <p className="text-xl text-[#4D4D4D] leading-relaxed font-light">
                  A comprehensive, language-agnostic reference for receiving encrypted forensic anomalies from Marigold directly into your verification platform.
                </p>
              </div>

              <div className="space-y-8">
                <div className="border border-[#EBE8E3] rounded-xl bg-white overflow-hidden shadow-sm">
                  <div className="px-6 py-5 border-b border-[#EBE8E3] flex justify-between items-center bg-[#F7F6F2]">
                    <h3 className="font-bold text-lg text-[#1A1A1A]">1. The Encrypted Payload Structure</h3>
                    <span className="px-3 py-1 bg-amber-100 text-amber-800 text-[10px] font-bold uppercase tracking-wider rounded-sm border border-amber-200">Webhook POST</span>
                  </div>
                  <div className="p-6">
                    <p className="text-[15px] text-[#4D4D4D] mb-6 leading-relaxed">
                      When a citizen auditor flags a block of anomalous registrations (e.g., 400 voters clustered at a single commercial P.O. Box), Marigold will POST an AES-GCM encrypted payload to your configured enterprise webhook.
                    </p>
                    
                    <div className="bg-[#1A1A1A] rounded-lg overflow-hidden shadow-inner">
                      <div className="bg-[#262626] px-4 py-2.5 text-xs font-mono text-[#A3A3A3] flex items-center justify-between border-b border-[#333333]">
                        <span>POST /api/marigold/ingest</span>
                        <span>application/json</span>
                      </div>
                      <pre className="p-5 text-sm font-mono text-[#EAE4DC] overflow-x-auto leading-relaxed">
{`{
  "marigold_session_id": "sha256-4f8a9b2c1d3e5f7a8b9c0d1e2f3a4b5c6d7e8f9a0b1c2d3e4f5",
  "dataset_checksum": "8f434346648f6b96df89dda901c5176b...",
  "encrypted_payload": "a4b5c6d7e8f9a0b1c2d3e4f5U2FsdGVkX19xUqZ8L1a2b3c4d5e6f7a8b9c0d1e2f3a4b5c6d",
  "anomaly_type": "HIGH_DENSITY_OCCUPANCY",
  "timestamp": "2026-07-16T18:45:00Z"
}`}
                      </pre>
                    </div>
                  </div>
                </div>

                <div className="border border-[#EBE8E3] rounded-xl bg-white overflow-hidden shadow-sm">
                  <div className="px-6 py-5 border-b border-[#EBE8E3] bg-[#F7F6F2]">
                    <h3 className="font-bold text-lg text-[#1A1A1A]">2. Decrypting the Payload</h3>
                    <p className="text-[13px] text-[#666666] mt-1">Your platform must hold the shared Group Secret established during onboarding.</p>
                  </div>
                  
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-px bg-[#EBE8E3]">
                    {/* C# Example */}
                    <div className="bg-[#1A1A1A] p-5">
                      <div className="text-xs font-mono text-[#A3A3A3] mb-4 flex justify-between items-center">
                        <span>C# / .NET 8.0</span>
                        <button onClick={() => handleCopy("C# code", "csharp")} className="hover:text-white transition-colors">
                          {copied === "csharp" ? <Check className="w-4 h-4 text-emerald-400" /> : <Copy className="w-4 h-4" />}
                        </button>
                      </div>
                      <pre className="text-[11px] font-mono text-[#79C0FF] overflow-x-auto leading-relaxed">
{`// Use the official Marigold SDK! Why write it yourself?
using Marigold.SDK;

public string DecryptWorklist(string encryptedPayload, string base64OrHexKey)
{
    // Don't reinvent the wheel. We did it for you.
    var client = new MarigoldClient(base64OrHexKey);
    return client.Decrypt(encryptedPayload);
}`}
                      </pre>
                    </div>
                    
                    {/* Python Example */}
                    <div className="bg-[#1A1A1A] p-5">
                      <div className="text-xs font-mono text-[#A3A3A3] mb-4 flex justify-between items-center">
                        <span>Python (cryptography)</span>
                        <button onClick={() => handleCopy("Python code", "python")} className="hover:text-white transition-colors">
                          {copied === "python" ? <Check className="w-4 h-4 text-emerald-400" /> : <Copy className="w-4 h-4" />}
                        </button>
                      </div>
                      <pre className="text-[11px] font-mono text-[#FFCA80] overflow-x-auto leading-relaxed">
{`from cryptography.hazmat.primitives.ciphers.aead import AESGCM
import base64

def decrypt_worklist(key_hex: str, encrypted_payload_b64: str) -> str:
    key = bytes.fromhex(key_hex)
    payload = base64.b64decode(encrypted_payload_b64)
    
    # 12 bytes nonce, 16 bytes tag at the end
    nonce = payload[:12]
    ciphertext_with_tag = payload[12:]
    
    aesgcm = AESGCM(key)
    return aesgcm.decrypt(nonce, ciphertext_with_tag, None).decode('utf-8')`}
                      </pre>
                    </div>
                  </div>
                </div>

                <div className="bg-amber-50 border border-amber-200 p-6 rounded-xl space-y-3">
                  <h4 className="font-bold text-amber-900 flex items-center gap-2">
                    <Zap className="w-5 h-5 text-amber-600" />
                    Edge Case Awareness
                  </h4>
                  <p className="text-sm text-amber-800 leading-relaxed">
                    If the decryption fails (e.g., throwing a `CryptographicException` in .NET or `InvalidTag` in Python), <strong>do not attempt to parse the payload</strong>. This indicates either data corruption during transit or an active Man-In-The-Middle (MITM) tampering attempt. Log the event, drop the payload, and return a 400 Bad Request to the Marigold node.
                  </p>
                </div>
              </div>
            </div>
          )}

          {/* Tab: Interactive Sandbox */}
          {activeTab === "sandbox" && (
            <div className="space-y-12 animate-in fade-in duration-500">
              <div className="space-y-6">
                <span className="inline-block px-3 py-1 bg-[#F3F1ED] text-[#4D4D4D] border border-[#D9D5CF] rounded-sm text-[10px] font-bold uppercase tracking-widest">Dev Tools</span>
                <h1 className="text-5xl font-black font-[family-name:var(--font-fraunces)] tracking-tight text-[#1A1A1A] leading-[1.1]">
                  Cryptography Sandbox
                </h1>
                <p className="text-xl text-[#4D4D4D] leading-relaxed font-light">
                  Simulate the local browser RAM encryption process. Enter a mock JSON payload below and observe the AES-GCM output exactly as your webhook would receive it.
                </p>
              </div>

              <div className="bg-white border-2 border-[#EBE8E3] rounded-2xl p-8 shadow-lg">
                <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
                  {/* Input Side */}
                  <div className="space-y-6">
                    <div>
                      <label className="block text-[11px] font-bold uppercase tracking-widest text-[#8C8C8C] mb-2 flex items-center gap-2">
                        <FileJson className="w-4 h-4" /> Raw PII Payload (Local RAM)
                      </label>
                      <textarea 
                        value={sandboxInput}
                        onChange={(e) => setSandboxInput(e.target.value)}
                        className="w-full h-40 bg-[#F7F6F2] border border-[#D9D5CF] rounded-lg p-4 text-sm font-mono focus:outline-none focus:border-[#1A1A1A] focus:ring-1 focus:ring-[#1A1A1A] transition-all text-[#1A1A1A]"
                      />
                    </div>
                    <div>
                      <label className="block text-[11px] font-bold uppercase tracking-widest text-[#8C8C8C] mb-2 flex items-center gap-2">
                        <FileKey className="w-4 h-4" /> Shared Group Secret
                      </label>
                      <input 
                        type="text"
                        value={sandboxKey}
                        onChange={(e) => setSandboxKey(e.target.value)}
                        className="w-full bg-[#F7F6F2] border border-[#D9D5CF] rounded-lg p-3 text-sm font-mono focus:outline-none focus:border-[#1A1A1A] focus:ring-1 focus:ring-[#1A1A1A] transition-all text-[#1A1A1A]"
                      />
                    </div>
                    <button 
                      onClick={handleEncrypt}
                      disabled={isEncrypting || !sandboxInput.trim()}
                      className="w-full bg-[#1A1A1A] hover:bg-[#333333] text-white font-bold py-3.5 px-4 rounded-lg shadow-md transition-all flex items-center justify-center gap-2"
                    >
                      {isEncrypting ? (
                        <>
                          <Activity className="w-5 h-5 animate-pulse" />
                          Encrypting...
                        </>
                      ) : (
                        <>
                          <Lock className="w-5 h-5" />
                          Simulate Local Encryption
                        </>
                      )}
                    </button>
                  </div>

                  {/* Output Side */}
                  <div className="space-y-2 flex flex-col h-full">
                    <label className="block text-[11px] font-bold uppercase tracking-widest text-[#8C8C8C] mb-2 flex items-center gap-2">
                      <Server className="w-4 h-4" /> Encrypted Webhook Payload
                    </label>
                    <div className="flex-1 bg-[#1A1A1A] border border-[#333333] rounded-lg p-4 relative overflow-hidden group min-h-[250px]">
                      {sandboxOutput ? (
                        <div className="animate-in fade-in h-full">
                          <button 
                            onClick={() => handleCopy(sandboxOutput, "sandbox")}
                            className="absolute top-4 right-4 text-[#A3A3A3] hover:text-white transition-colors bg-[#333333] p-1.5 rounded opacity-0 group-hover:opacity-100"
                          >
                            {copied === "sandbox" ? <Check className="w-4 h-4 text-emerald-400" /> : <Copy className="w-4 h-4" />}
                          </button>
                          <pre className="text-xs font-mono text-[#EAE4DC] whitespace-pre-wrap break-all h-full">
                            {sandboxOutput}
                          </pre>
                        </div>
                      ) : (
                        <div className="h-full flex flex-col items-center justify-center text-[#4D4D4D] space-y-3">
                          <Terminal className="w-8 h-8 opacity-50" />
                          <span className="text-sm font-medium">Awaiting execution...</span>
                        </div>
                      )}
                    </div>
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* Under construction fallbacks */}
          {["node", "websockets"].includes(activeTab) && (
            <div className="py-20 text-center space-y-6 animate-in fade-in">
              <div className="w-20 h-20 bg-[#F3F1ED] rounded-full mx-auto flex items-center justify-center border border-[#EBE8E3]">
                <Settings className="w-8 h-8 text-[#8C8C8C] animate-spin-slow" />
              </div>
              <h2 className="text-3xl font-black font-[family-name:var(--font-fraunces)] text-[#1A1A1A]">Documentation Unavailable</h2>
              <p className="text-lg text-[#666666] max-w-lg mx-auto leading-relaxed">
                Our core engineers are busy ensuring absolute institutional excellence for the V2 specifications. It will be released when it meets our earth-shattering standards. In the meantime, figure it out or consult your Enterprise Support representative.
              </p>
            </div>
          )}

        </div>
      </main>
    </div>
  );
}
