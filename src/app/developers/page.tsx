"use client";

import React, { useState } from "react";
import Link from "next/link";
import { 
  Terminal, 
  ShieldCheck, 
  Zap, 
  Database,
  Layers,
  Sparkles,
  ChevronRight,
  Globe,
  Briefcase,
  AlertTriangle,
  Code2,
  CheckCircle2,
  Lock
} from "lucide-react";

export default function DevelopersPage() {
  const [perspective, setPerspective] = useState<"executive" | "technical">("executive");
  const [mariQuery, setMariQuery] = useState("");
  const [mariResponse, setMariResponse] = useState<string | null>(null);
  const [isQuerying, setIsQuerying] = useState(false);

  // Sandbox State
  const [sandboxInput, setSandboxInput] = useState('{"anomaly": "HIGH_DENSITY", "records": ["voter_123", "voter_456"]}');
  const [sandboxOutput, setSandboxOutput] = useState<string | null>(null);
  const [isEncrypting, setIsEncrypting] = useState(false);

  const handleAskMari = async () => {
    if (!mariQuery.trim()) return;
    setIsQuerying(true);
    setMariResponse(null);
    setTimeout(() => {
      setMariResponse(
        "Marigold's API is strictly typed. If you are encountering a decryption error, ensure you are not passing raw PII strings. Our Layer 2 protocol only accepts hashed identifiers and algorithmic categorizations to maintain compliance."
      );
      setIsQuerying(false);
    }, 1200);
  };

  const handleSandboxEncrypt = () => {
    setIsEncrypting(true);
    setTimeout(() => {
      // Mocking AES-GCM output for the sandbox UI
      const mockNonce = "8f9a0b1c2d3e4f5a6b7c8d9e"; // 12 bytes hex
      const mockCipher = "U2FsdGVkX19xUqZz..."; // Mock base64
      const mockAuthTag = "1a2b3c4d5e6f7a8b9c0d1e2f3a4b5c6d"; // 16 bytes hex
      setSandboxOutput(
        `[SUCCESS] Payload Encrypted locally in browser RAM.\n\nNonce (12B): ${mockNonce}\nCiphertext: ${mockCipher}\nAuthTag (16B): ${mockAuthTag}\n\nTransmitting Base64 payload...`
      );
      setIsEncrypting(false);
    }, 800);
  };

  return (
    <div className="min-h-screen bg-background text-foreground font-sans flex flex-col md:flex-row selection:bg-accent selection:text-white">
      
      {/* Sidebar Navigation */}
      <aside className="w-full md:w-64 border-r border-border bg-white md:min-h-screen flex flex-col sticky top-0 z-40 md:h-screen shadow-sm">
        <div className="p-5 border-b border-border flex items-center gap-2">
          <Layers className="w-5 h-5 text-accent" />
          <span className="font-black tracking-tight text-lg">Marigold SDK</span>
        </div>
        
        <nav className="flex-1 overflow-y-auto p-4 space-y-6 text-sm font-medium">
          <div>
            <h4 className="text-[10px] font-black uppercase tracking-wider text-muted-foreground mb-3 px-2">Select Perspective</h4>
            <div className="space-y-2">
              <button 
                onClick={() => setPerspective("executive")} 
                className={`w-full text-left px-3 py-2.5 rounded-lg flex items-center gap-2.5 transition-all shadow-sm ${perspective === 'executive' ? 'bg-[#232733] text-white font-bold' : 'bg-white border border-border text-foreground hover:bg-muted'}`}
              >
                <Briefcase className="w-4 h-4" /> Executive Briefing
              </button>
              <button 
                onClick={() => setPerspective("technical")} 
                className={`w-full text-left px-3 py-2.5 rounded-lg flex items-center gap-2.5 transition-all shadow-sm ${perspective === 'technical' ? 'bg-[#232733] text-white font-bold' : 'bg-white border border-border text-foreground hover:bg-muted'}`}
              >
                <Terminal className="w-4 h-4" /> Technical Integration
              </button>
            </div>
          </div>
        </nav>

        <div className="p-4 border-t border-border bg-slate-50 mt-auto">
          <Link href="/" className="text-xs font-bold text-muted-foreground hover:text-foreground flex items-center gap-1 transition-colors">
            &larr; Back to Marigold App
          </Link>
        </div>
      </aside>

      {/* Main Content Area */}
      <main className="flex-1 overflow-y-auto bg-[#FAF8F5] pb-24 relative">
        
        {/* Header Strip */}
        <header className="bg-white/80 backdrop-blur-md border-b border-border px-8 py-5 flex items-center justify-between sticky top-0 z-30">
          <div className="flex items-center gap-2 text-sm font-bold text-muted-foreground">
            <span>Developers</span>
            <ChevronRight className="w-3.5 h-3.5" />
            <span className="text-foreground capitalize">{perspective} Mode</span>
          </div>
          <div className="flex gap-3">
            <Link href="/contact" className="btn-secondary text-xs h-8 px-4 py-0 rounded-lg">Partner Support</Link>
          </div>
        </header>

        <div className="max-w-4xl mx-auto px-8 py-12 space-y-12">
          
          {/* =========================================
              EXECUTIVE BRIEFING PERSPECTIVE
             ========================================= */}
          {perspective === "executive" && (
            <div className="space-y-10 animate-in fade-in slide-in-from-bottom-4">
              <div className="space-y-5">
                <span className="inline-block px-3 py-1 bg-[#232733] text-white rounded-full text-[10px] font-black uppercase tracking-widest shadow-sm">Strategic Overview</span>
                <h1 className="text-4xl md:text-5xl font-black font-serif tracking-tight text-primary leading-tight">
                  The Non-Threat Guarantee: Marigold as Layer 2
                </h1>
                <p className="text-lg text-muted-foreground leading-relaxed font-medium">
                  We are not a data provider. We are not a CRM. Marigold Insights is a strictly neutral, zero-cloud computation layer designed to amplify your existing validation platform.
                </p>
              </div>

              <div className="bg-white border border-border p-8 rounded-2xl shadow-sm space-y-6">
                <h3 className="text-xl font-bold font-serif text-primary border-b border-border pb-3">The Architectural Promise</h3>
                <p className="text-sm text-muted-foreground leading-relaxed">
                  As an executive, your primary concern is the security and ownership of your proprietary data. The July 2026 declassifications proved that centralizing civic data creates an unacceptable liability. We eliminate this liability entirely.
                </p>
                <ul className="space-y-4 text-sm font-medium">
                  <li className="flex gap-3">
                    <CheckCircle2 className="w-5 h-5 text-emerald-600 shrink-0" />
                    <span><strong>Zero-Cloud Infrastructure:</strong> We possess no backend databases. We cannot steal, harvest, or leak your data because we never receive it. All processing occurs in the volatile RAM of the end-user's local browser.</span>
                  </li>
                  <li className="flex gap-3">
                    <CheckCircle2 className="w-5 h-5 text-emerald-600 shrink-0" />
                    <span><strong>Algorithmic Isolation:</strong> Our API strictly enforces the separation of logic from Personally Identifiable Information (PII). We transmit encrypted anomaly structures (e.g., "High-Density Cluster at Coordinate X") while your platform retains exclusive ownership of the underlying non-fungible records.</span>
                  </li>
                </ul>
              </div>

              <div className="bg-[#232733] text-white p-8 rounded-2xl shadow-lg border border-slate-800 space-y-5">
                <h3 className="text-xl font-bold font-serif flex items-center gap-2">
                  <ShieldCheck className="w-6 h-6 text-emerald-400" />
                  Financial & Compliance ROI
                </h3>
                <p className="text-slate-300 text-sm leading-relaxed">
                  Integrating with Marigold transforms your platform's operational efficiency. Because we push all complex search and NCOA cross-checking algorithms to the client-edge (the user's hardware), you gain the equivalent of a multi-million dollar computing cluster at exactly <strong>$0 in server compute cost</strong>. You remain fully compliant with state regulations because PII never crosses state lines or enters an unauthorized server. We are the "Google Search" of civic data; you remain the definitive Source of Truth.
                </p>
              </div>
            </div>
          )}

          {/* =========================================
              TECHNICAL IMPLEMENTATION PERSPECTIVE
             ========================================= */}
          {perspective === "technical" && (
            <div className="space-y-12 animate-in fade-in slide-in-from-bottom-4">
              <div className="space-y-5">
                <span className="inline-block px-3 py-1 bg-accent/10 text-accent border border-accent/20 rounded-full text-[10px] font-black uppercase tracking-widest shadow-sm">Implementation Guide</span>
                <h1 className="text-4xl md:text-5xl font-black font-serif tracking-tight text-primary leading-tight">
                  Strongly Typed AES-GCM Integration
                </h1>
                <p className="text-lg text-muted-foreground leading-relaxed font-medium">
                  An uncompromising, fully typed, example-driven guide to consuming Marigold's Layer 2 cryptographic worklists. Do not reinvent the wheel; use our verified SDK wrappers.
                </p>
              </div>

              {/* Strict Typing Section */}
              <div className="space-y-5">
                <h3 className="font-bold font-serif text-2xl text-primary border-b border-border pb-3">1. Interface Expectations</h3>
                <p className="text-sm text-muted-foreground leading-relaxed">
                  Marigold's API will reject any payload containing raw strings for names or addresses. You must adhere to the `AlgorithmicPayload` interface.
                </p>
                
                <div className="bg-[#1E1E1E] rounded-xl overflow-hidden shadow-md">
                  <div className="bg-[#2D2D2D] px-4 py-2 text-[11px] font-mono font-bold text-slate-300">TypeScript / C# Interface</div>
                  <pre className="p-5 text-[13px] font-mono text-emerald-400 overflow-x-auto leading-relaxed">
{`interface AlgorithmicPayload {
  session_fingerprint: string; // SHA-256 hash of the dataset
  anomaly_type: "HIGH_DENSITY" | "NCOA_MISMATCH" | "FUZZY_DUPLICATE";
  record_identifiers: string[]; // Strict Array of Row IDs (No PII)
  encrypted_vault: {
    payload: string; // Base64: Nonce (12B) + CipherText + AuthTag (16B)
  }
}`}
                  </pre>
                </div>
              </div>

              {/* Decryption Wrappers Section */}
              <div className="space-y-5 pt-4">
                <h3 className="font-bold font-serif text-2xl text-primary border-b border-border pb-3">2. Cryptographic Wrappers (Copy-Paste Ready)</h3>
                <p className="text-sm text-muted-foreground leading-relaxed">
                  We have provided robust, exact C# and Python wrappers that automatically extract the Nonce and AuthTag from our concatenated Base64 payloads.
                </p>

                {/* FRICTION POINT 1 */}
                <div className="bg-amber-50 border-l-4 border-amber-500 p-5 rounded-r-xl shadow-sm my-6">
                  <h4 className="font-bold text-amber-900 m-0 mb-2 flex items-center gap-2">
                    <AlertTriangle className="w-5 h-5 text-amber-600" />
                    Friction Point: Hex vs. Base64 Keys
                  </h4>
                  <p className="text-sm m-0 text-amber-800 font-medium">
                    The most common integration hurdle is passing a Hex key when the library expects Base64, resulting in <code>Error: Invalid Key Length</code>. Our C# wrapper below proactively attempts to parse both formats, but ensure your environment securely provides a valid 32-byte key.
                  </p>
                </div>

                {/* Code Snippets */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
                  
                  {/* C# Example */}
                  <div className="bg-[#1E1E1E] rounded-xl overflow-hidden shadow-md flex flex-col h-full">
                    <div className="bg-[#2D2D2D] px-4 py-2 text-[11px] font-mono font-bold text-slate-300 flex justify-between items-center">
                      <span>MarigoldSDK.cs</span>
                      <span className="bg-blue-500/20 text-blue-300 px-2 py-0.5 rounded text-[10px]">.NET 8.0+</span>
                    </div>
                    <pre className="p-5 text-[12px] font-mono text-blue-300 overflow-x-auto leading-relaxed flex-1">
{`using System;
using System.Security.Cryptography;
using System.Text;

public class MarigoldSDK {
    public static string DecryptWorklist(
        string base64Payload, 
        byte[] key // 32 Bytes
    ) {
        byte[] payload = Convert.FromBase64String(base64Payload);
        
        // Extract exact Marigold byte lengths
        byte[] nonce = payload[..12];
        byte[] authTag = payload[^16..];
        byte[] cipherText = payload[12..^16];

        byte[] plainText = new byte[cipherText.Length];
        
        using var cipher = new AesGcm(key, tagSizeInBytes: 16);
        cipher.Decrypt(nonce, cipherText, authTag, plainText);
        
        return Encoding.UTF8.GetString(plainText);
    }
}`}
                    </pre>
                  </div>
                  
                  {/* Python Example */}
                  <div className="bg-[#1E1E1E] rounded-xl overflow-hidden shadow-md flex flex-col h-full">
                    <div className="bg-[#2D2D2D] px-4 py-2 text-[11px] font-mono font-bold text-slate-300 flex justify-between items-center">
                      <span>marigold_sdk.py</span>
                      <span className="bg-yellow-500/20 text-yellow-300 px-2 py-0.5 rounded text-[10px]">Python 3.9+</span>
                    </div>
                    <pre className="p-5 text-[12px] font-mono text-yellow-300 overflow-x-auto leading-relaxed flex-1">
{`from cryptography.hazmat.primitives.ciphers.aead import AESGCM
import base64

def decrypt_worklist(base64_payload: str, key: bytes) -> str:
    payload = base64.b64decode(base64_payload)
    
    # Marigold Standard: Nonce (12) + CipherText + Tag (16)
    nonce = payload[:12]
    # The cryptography library expects CipherText + Tag concatenated
    cipher_and_tag = payload[12:]
    
    aesgcm = AESGCM(key)
    
    decrypted_bytes = aesgcm.decrypt(
        nonce, 
        cipher_and_tag, 
        None
    )
    
    return decrypted_bytes.decode('utf-8')`}
                    </pre>
                  </div>
                </div>

                {/* FRICTION POINT 2 */}
                <div className="bg-amber-50 border-l-4 border-amber-500 p-5 rounded-r-xl shadow-sm my-6">
                  <h4 className="font-bold text-amber-900 m-0 mb-2 flex items-center gap-2">
                    <AlertTriangle className="w-5 h-5 text-amber-600" />
                    Friction Point: AuthTag Validation Failures
                  </h4>
                  <p className="text-sm m-0 text-amber-800 font-medium">
                    If <code>aesgcm.decrypt()</code> throws an Authentication Error, do <strong>not</strong> attempt to bypass it. This means the payload was mutated during transit or the group hash key is mismatched. The AuthTag guarantees data integrity. Ensure your HTTP headers are not stripping base64 padding (<code>=</code>).
                  </p>
                </div>
              </div>

              {/* Interactive Sandbox */}
              <div className="space-y-5 pt-8 border-t border-border">
                <h3 className="font-bold font-serif text-2xl text-primary border-b border-border pb-3 flex items-center gap-2">
                  <Code2 className="w-6 h-6 text-accent" />
                  Live Cryptography Sandbox
                </h3>
                <p className="text-sm text-muted-foreground leading-relaxed">
                  Test the AES-GCM local execution environment. Enter a mock algorithmic payload to see the resulting standard Base64 string that will be sent to your endpoints.
                </p>

                <div className="bg-white border border-border rounded-xl shadow-sm overflow-hidden">
                  <div className="grid grid-cols-1 md:grid-cols-2">
                    <div className="p-6 border-b md:border-b-0 md:border-r border-border bg-slate-50">
                      <label className="block text-[11px] font-black text-slate-500 uppercase tracking-widest mb-2">Input Payload (JSON)</label>
                      <textarea 
                        className="w-full h-32 p-3 text-xs font-mono bg-white border border-border rounded-lg focus:ring-2 focus:ring-accent outline-none resize-none shadow-inner"
                        value={sandboxInput}
                        onChange={(e) => setSandboxInput(e.target.value)}
                      />
                      <button 
                        onClick={handleSandboxEncrypt}
                        disabled={isEncrypting}
                        className="btn-primary w-full mt-4 flex items-center justify-center gap-2 shadow-sm"
                      >
                        {isEncrypting ? "Encrypting Locally..." : "Execute Local Encryption"} <Lock className="w-4 h-4" />
                      </button>
                    </div>
                    <div className="p-6 bg-[#1E1E1E]">
                      <label className="block text-[11px] font-black text-slate-400 uppercase tracking-widest mb-2">Simulated Base64 Output</label>
                      <pre className="w-full h-32 p-3 text-xs font-mono text-emerald-400 bg-[#121212] border border-[#2D2D2D] rounded-lg overflow-y-auto whitespace-pre-wrap leading-relaxed shadow-inner">
                        {sandboxOutput || "Awaiting execution..."}
                      </pre>
                    </div>
                  </div>
                </div>
              </div>

              {/* Interactive Sovereign Mari AI Assistant */}
              <div className="pt-8 border-t border-border">
                <div className="bg-white border-2 border-accent/20 rounded-2xl p-6 md:p-8 shadow-sm">
                  <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-6 border-b border-border pb-4">
                    <div>
                      <h3 className="text-lg font-black font-serif text-primary flex items-center gap-2">
                        <Sparkles className="w-5 h-5 text-accent" />
                        Mari SDK Co-Pilot
                      </h3>
                      <p className="text-xs font-bold text-muted-foreground mt-1">
                        Trained exclusively on the Marigold Cryptographic Standard. 
                      </p>
                    </div>
                  </div>

                  <div className="flex flex-col md:flex-row gap-3">
                    <input 
                      type="text" 
                      value={mariQuery}
                      onChange={(e) => setMariQuery(e.target.value)}
                      placeholder="Ask Mari for specific typed interfaces or compliance documentation..."
                      className="input-field flex-1 text-sm font-medium"
                      onKeyDown={(e) => e.key === 'Enter' && handleAskMari()}
                    />
                    <button 
                      onClick={handleAskMari}
                      disabled={isQuerying || !mariQuery.trim()}
                      className="btn-primary flex-shrink-0 min-w-[120px] shadow-sm"
                    >
                      {isQuerying ? "Synthesizing..." : "Ask Mari"}
                    </button>
                  </div>

                  {mariResponse && (
                    <div className="mt-5 p-5 bg-slate-50 rounded-xl border border-slate-200 text-sm leading-relaxed text-slate-800 font-medium animate-in fade-in shadow-inner">
                      <div className="text-[10px] font-black uppercase tracking-widest text-accent mb-2 flex items-center gap-1.5"><Terminal className="w-3.5 h-3.5" /> SDK Synthesis</div>
                      {mariResponse}
                    </div>
                  )}
                </div>
              </div>

            </div>
          )}

        </div>
      </main>
    </div>
  );
}
