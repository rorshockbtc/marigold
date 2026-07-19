"use client";

import React from "react";
import Link from "next/link";
import { ChevronRight, ChevronLeft, Lock, Fingerprint, Shield, Server, ArrowRightLeft } from "lucide-react";

export default function AuthenticationPage() {
  return (
    <div className="space-y-10 pb-16 animate-in fade-in duration-500">
      
      <div className="space-y-4 border-b border-slate-200 pb-8">
        <div className="flex items-center gap-2 text-sm font-bold text-emerald-600 mb-2">
          <span>Core Infrastructure</span>
          <ChevronRight className="w-4 h-4 text-slate-600" />
          <span className="text-slate-900">Authentication & Tokens</span>
        </div>
        <h1 className="text-4xl md:text-5xl font-black font-serif tracking-tight text-slate-900 leading-tight">
          Authentication & Tokens
        </h1>
        <p className="text-xl text-slate-600 leading-relaxed max-w-3xl">
          Marigold utilizes a dual-layer authentication mesh consisting of strict IPv4/IPv6 Network Access Control Lists (NACLs) paired with high-entropy Bearer tokens.
        </p>
      </div>

      <div className="prose prose-slate prose-emerald max-w-none">
        
        <h2>The Dual-Layer Mesh</h2>
        <p>
          Given the sensitive nature of civic auditing workloads, relying solely on Bearer tokens is mathematically insufficient. If an administrative token is accidentally leaked in a GitHub repository or compromised via a social engineering vector, unauthorized ingress must still be mitigated.
        </p>
        <p>
          Therefore, Marigold mandates a <strong>Dual-Layer Mesh</strong>:
        </p>
        
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 my-8 not-prose">
          <div className="p-6 border border-slate-200 rounded-xl bg-white shadow-sm relative overflow-hidden group">
            <div className="absolute top-0 right-0 w-32 h-32 bg-blue-50 rounded-full -mr-16 -mt-16 transition-transform group-hover:scale-150 duration-500"></div>
            <Server className="w-8 h-8 text-blue-600 mb-4 relative z-10" />
            <h3 className="font-bold text-slate-900 text-lg mb-2 relative z-10">Layer 1: Network ACLs</h3>
            <p className="text-sm text-slate-600 leading-relaxed relative z-10">
              Tokens only function when the API request originates from a pre-approved, static IP block registered to your state agency. Dynamic residential IPs and standard public cloud shared IPs are blocked at the Web Application Firewall (WAF) layer.
            </p>
          </div>

          <div className="p-6 border border-slate-200 rounded-xl bg-white shadow-sm relative overflow-hidden group">
            <div className="absolute top-0 right-0 w-32 h-32 bg-emerald-50 rounded-full -mr-16 -mt-16 transition-transform group-hover:scale-150 duration-500"></div>
            <Fingerprint className="w-8 h-8 text-emerald-600 mb-4 relative z-10" />
            <h3 className="font-bold text-slate-900 text-lg mb-2 relative z-10">Layer 2: Token Entropy</h3>
            <p className="text-sm text-slate-600 leading-relaxed relative z-10">
              Each HTTP request must include an <code>Authorization: Bearer</code> header containing a 256-bit cryptographically secure pseudo-random string tied specifically to an isolated audit instance (Session Token).
            </p>
          </div>
        </div>

        <h2>Implementing the Authorization Header</h2>
        <p>
          Your integration must append the following HTTP header to all requests against the <code>https://api.marigoldinsights.org/v1</code> space. Do not use Basic Auth or query parameter authentication. We do not support it.
        </p>

        <pre className="bg-slate-50 border border-slate-200 text-emerald-700 p-4 rounded-xl overflow-x-auto text-sm font-mono leading-relaxed my-6 shadow-md border border-slate-700">
<code>{`Authorization: Bearer mg_live_x89aZ120BklqP94MnvX5...`}</code>
        </pre>

        <h3>Token Prefix Definitions</h3>
        <p>
          Marigold utilizes explicit token prefixing to prevent accidental leakage in logging systems. If your APM or SIEM detects a string starting with these prefixes in plaintext logs, it should immediately trigger a P1 security incident.
        </p>

        <table className="min-w-full border-collapse my-8 text-sm not-prose">
          <thead>
            <tr className="bg-slate-50 border-b border-slate-200">
              <th className="text-left py-3 px-4 font-bold text-slate-900">Prefix</th>
              <th className="text-left py-3 px-4 font-bold text-slate-900">Environment</th>
              <th className="text-left py-3 px-4 font-bold text-slate-900">Description</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-100">
            <tr>
              <td className="py-3 px-4 font-mono font-bold text-emerald-600">mg_live_</td>
              <td className="py-3 px-4">Production</td>
              <td className="py-3 px-4 text-slate-600">Grants access to live algorithmic clusters. Metered against your agency's SOC 2 compliance SLA.</td>
            </tr>
            <tr>
              <td className="py-3 px-4 font-mono font-bold text-blue-600">mg_test_</td>
              <td className="py-3 px-4">Staging / QA</td>
              <td className="py-3 px-4 text-slate-600">Used strictly for unit testing. Automatically overrides payloads with synthetic anomalies to prevent data contamination.</td>
            </tr>
            <tr>
              <td className="py-3 px-4 font-mono font-bold text-rose-600">mg_rot_</td>
              <td className="py-3 px-4">Administrative</td>
              <td className="py-3 px-4 text-slate-600">A high-privilege token used exclusively to hit the <code>/tokens/rotate</code> endpoint. Never use this for data sweeps.</td>
            </tr>
          </tbody>
        </table>

        <h2>Key Rotation Strategy (Zero-Downtime)</h2>
        <p>
          We mandate a 30-day strict rotation policy for all <code>mg_live_</code> tokens. If a token exceeds 30 days of age, our ingress routers will intercept the request and return a <code>401 Unauthorized - ERR_TOKEN_EXPIRED</code>.
        </p>

        <p>
          To maintain zero-downtime, your DevOps infrastructure must automate the token rotation utilizing the <code>mg_rot_</code> administrative credential. When you request a new live token, the legacy token enters a <strong>72-hour graceful deprecation window</strong>. During this window, both the old and new token will successfully authenticate, allowing your monolithic applications time to fetch the newly provisioned token from your internal secrets manager without dropping active algorithmic sweeps.
        </p>

        <div className="bg-slate-50 border border-slate-200 p-6 rounded-xl my-8">
          <h4 className="text-slate-900 font-bold mb-3 flex items-center gap-2">
            <ArrowRightLeft className="w-5 h-5 text-slate-600" />
            Automated Rotation Example (Bash / Cron)
          </h4>
          <pre className="bg-slate-50 border border-slate-200 text-slate-900 p-4 rounded-xl overflow-x-auto text-[11px] font-mono leading-relaxed shadow-inner">
<code>{`#!/bin/bash
# Triggered via Jenkins or GitHub Actions every 25 days

# 1. Request new token from Marigold
NEW_TOKEN_JSON=$(curl -X POST https://api.marigoldinsights.org/v1/tokens/rotate \\
  -H "Authorization: Bearer $MARIGOLD_ROT_TOKEN")

NEW_TOKEN=$(echo $NEW_TOKEN_JSON | jq -r '.new_live_token')

# 2. Push to your internal AWS Secrets Manager
aws secretsmanager put-secret-value \\
  --secret-id prod/marigold/bearer \\
  --secret-string "$NEW_TOKEN"

echo "Rotation complete. Legacy token expires in 72 hours."`}</code>
          </pre>
        </div>

        <h2>Handling 401 & 403 Errors</h2>
        <p>
          It is critical that your application differentiates between a 401 (Authentication) and a 403 (Authorization/Network) failure.
        </p>
        <ul>
          <li><strong>401 Unauthorized:</strong> The WAF successfully received the request, but the token itself was malformed, expired, or failed signature validation. Your application should attempt to fetch the latest token from your secrets manager and retry once.</li>
          <li><strong>403 Forbidden:</strong> The token is mathematically valid, but Layer 1 (NACL) rejected the request. Your server's egress IP has shifted. Do not retry automatically; this requires manual network administrator intervention to update the IP whitelist with Marigold Support.</li>
        </ul>

      </div>

      {/* Footer Nav */}
      <div className="pt-8 border-t border-slate-200 flex justify-between">
        <Link 
          href="/developers/docs/getting-started"
          className="text-slate-600 hover:text-slate-900 px-4 py-3 rounded-xl font-bold text-sm flex items-center gap-2 transition-colors"
        >
          <ChevronLeft className="w-4 h-4" />
          Previous: Quickstart Guide
        </Link>
        <Link 
          href="/developers/docs/cryptography"
          className="bg-slate-50 border border-slate-200 hover:bg-emerald-600 text-white px-6 py-3 rounded-xl font-bold text-sm flex items-center gap-2 transition-colors shadow-sm"
        >
          Next: Zero-PII Cryptography
          <ChevronRight className="w-4 h-4" />
        </Link>
      </div>

    </div>
  );
}
