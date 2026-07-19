"use client";

import React from "react";
import Link from "next/link";
import { ChevronRight, ChevronLeft, AlertOctagon, TerminalSquare, SearchCode } from "lucide-react";

export default function ErrorCodesPage() {
  return (
    <div className="space-y-10 pb-16 animate-in fade-in duration-500">
      
      <div className="space-y-4 border-b border-slate-200 pb-8">
        <div className="flex items-center gap-2 text-sm font-bold text-emerald-600 mb-2">
          <span>API Reference</span>
          <ChevronRight className="w-4 h-4 text-slate-600" />
          <span className="text-slate-900">Error Codes Dictionary</span>
        </div>
        <h1 className="text-4xl md:text-5xl font-black font-serif tracking-tight text-slate-900 leading-tight">
          Error Dictionary
        </h1>
        <p className="text-xl text-slate-600 leading-relaxed max-w-3xl">
          Due to the strict Zero-PII cryptographic mandates, debugging API failures can be complex. We return deterministic, canonical error codes so your middleware can automate retry logic or halt the ingestion pipeline.
        </p>
      </div>

      <div className="prose prose-slate prose-emerald max-w-none">
        
        <h2>HTTP Status Protocols</h2>
        <p>
          Marigold adheres to strict HTTP semantic conventions. Before parsing the JSON response body for a canonical error string, your HTTP client should respect the standard transport codes.
        </p>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 my-8 not-prose">
          <div className="bg-rose-50 border border-rose-200 p-5 rounded-xl">
            <h4 className="font-bold text-rose-900 text-lg mb-2 flex items-center gap-2">
              <AlertOctagon className="w-5 h-5 text-rose-600" />
              4xx Client Errors
            </h4>
            <p className="text-sm text-rose-800 leading-relaxed">
              The payload you sent is cryptographically invalid, violates JSON schema, or originates from a blocked IP. Do not retry these requests without modifying the payload or configuration.
            </p>
          </div>
          <div className="bg-amber-50 border border-amber-200 p-5 rounded-xl">
            <h4 className="font-bold text-amber-900 text-lg mb-2 flex items-center gap-2">
              <TerminalSquare className="w-5 h-5 text-amber-600" />
              429 Rate Limits
            </h4>
            <p className="text-sm text-amber-800 leading-relaxed">
              Your server is dispatching requests faster than your SLA tier allows. Implement exponential backoff and retry after the specified cool-down window.
            </p>
          </div>
          <div className="bg-slate-100 border border-slate-300 p-5 rounded-xl">
            <h4 className="font-bold text-slate-900 text-lg mb-2 flex items-center gap-2">
              <SearchCode className="w-5 h-5 text-slate-600" />
              5xx Server Errors
            </h4>
            <p className="text-sm text-slate-700 leading-relaxed">
              The algorithmic cluster encountered a math overflow (e.g. Z-Score matrix bounds exceeded). Highly anomalous but transient. Safe to retry with exponential backoff.
            </p>
          </div>
        </div>

        <h2>Canonical Error Codes</h2>
        <p>
          When a request fails, the response body will contain a <code>code</code> and a <code>message</code> field. Use the <code>code</code> for programmatic branching.
        </p>

        <div className="bg-white rounded-xl border border-slate-200 shadow-sm overflow-hidden text-sm not-prose my-8">
          <div className="grid grid-cols-12 bg-slate-50 font-bold border-b border-slate-200 p-4 text-slate-600 text-xs uppercase tracking-wider">
            <div className="col-span-3">Status</div>
            <div className="col-span-4">Canonical Code</div>
            <div className="col-span-5">Resolution Guide</div>
          </div>
          <div className="divide-y divide-slate-100">
            
            {/* Auth Tag */}
            <div className="grid grid-cols-12 p-4 items-start gap-4 hover:bg-slate-50 transition-colors">
              <div className="col-span-3 font-mono font-bold text-rose-600">400 Bad Request</div>
              <div className="col-span-4 font-mono font-bold text-slate-900 text-xs bg-slate-100 p-2 rounded max-w-max">ERR_AUTH_TAG_MISMATCH</div>
              <div className="col-span-5 text-slate-600 text-sm leading-relaxed">
                <p className="mb-2">The AES-GCM authentication tag failed verification.</p>
                <ul className="list-disc pl-4 space-y-1 text-xs">
                  <li>Ensure your IV (Nonce) is exactly 12 bytes.</li>
                  <li>Ensure your master key is exactly 32 bytes (256-bit).</li>
                  <li>Ensure you appended the exact 16-byte Auth Tag to the end of the ciphertext before Base64 encoding.</li>
                </ul>
              </div>
            </div>

            {/* Validation */}
            <div className="grid grid-cols-12 p-4 items-start gap-4 hover:bg-slate-50 transition-colors">
              <div className="col-span-3 font-mono font-bold text-rose-600">400 Bad Request</div>
              <div className="col-span-4 font-mono font-bold text-slate-900 text-xs bg-slate-100 p-2 rounded max-w-max">ERR_SCHEMA_VALIDATION</div>
              <div className="col-span-5 text-slate-600 text-sm leading-relaxed">
                The JSON payload does not match the OpenAPI 3.1 specification. Check the <code>details</code> array in the response for the exact missing field (e.g. <code>session_fingerprint</code> is missing).
              </div>
            </div>

            {/* Module Unrecognized */}
            <div className="grid grid-cols-12 p-4 items-start gap-4 hover:bg-slate-50 transition-colors">
              <div className="col-span-3 font-mono font-bold text-rose-600">400 Bad Request</div>
              <div className="col-span-4 font-mono font-bold text-slate-900 text-xs bg-slate-100 p-2 rounded max-w-max">ERR_UNSUPPORTED_MODULE</div>
              <div className="col-span-5 text-slate-600 text-sm leading-relaxed">
                The <code>anomaly_type</code> string requested does not exist or has been deprecated. Call the <code>/modules/list</code> endpoint to view active modules.
              </div>
            </div>

            {/* Token Expired */}
            <div className="grid grid-cols-12 p-4 items-start gap-4 hover:bg-slate-50 transition-colors">
              <div className="col-span-3 font-mono font-bold text-amber-600">401 Unauthorized</div>
              <div className="col-span-4 font-mono font-bold text-slate-900 text-xs bg-slate-100 p-2 rounded max-w-max">ERR_TOKEN_EXPIRED</div>
              <div className="col-span-5 text-slate-600 text-sm leading-relaxed">
                The <code>mg_live_</code> Bearer token has exceeded its 30-day lifecycle limit. Trigger your rotation cron job to fetch a new token via the <code>/tokens/rotate</code> endpoint using your administrative credential.
              </div>
            </div>

            {/* IP Blocked */}
            <div className="grid grid-cols-12 p-4 items-start gap-4 hover:bg-slate-50 transition-colors">
              <div className="col-span-3 font-mono font-bold text-amber-600">403 Forbidden</div>
              <div className="col-span-4 font-mono font-bold text-slate-900 text-xs bg-slate-100 p-2 rounded max-w-max">ERR_IP_RESTRICTED</div>
              <div className="col-span-5 text-slate-600 text-sm leading-relaxed">
                Your server's egress IP address is not on the institutional Network ACL whitelist. Contact the architecture desk immediately. Do not automate retries for this error.
              </div>
            </div>

            {/* Rate Limit */}
            <div className="grid grid-cols-12 p-4 items-start gap-4 hover:bg-slate-50 transition-colors">
              <div className="col-span-3 font-mono font-bold text-blue-600">429 Too Many Requests</div>
              <div className="col-span-4 font-mono font-bold text-slate-900 text-xs bg-slate-100 p-2 rounded max-w-max">ERR_RATE_LIMIT_EXCEEDED</div>
              <div className="col-span-5 text-slate-600 text-sm leading-relaxed">
                You have exceeded the API calls per minute threshold for your SLA tier. Parse the <code>Retry-After</code> HTTP header (returns seconds) and implement a sleep/backoff loop before transmitting the next chunk.
              </div>
            </div>

            {/* Z-Score Overflow */}
            <div className="grid grid-cols-12 p-4 items-start gap-4 hover:bg-slate-50 transition-colors">
              <div className="col-span-3 font-mono font-bold text-slate-900">500 Server Error</div>
              <div className="col-span-4 font-mono font-bold text-slate-900 text-xs bg-slate-100 p-2 rounded max-w-max">ERR_Z_SCORE_OVERFLOW</div>
              <div className="col-span-5 text-slate-600 text-sm leading-relaxed">
                The standard deviation mathematical matrix calculation resulted in a 64-bit float overflow. This almost exclusively occurs when you fail to partition your payload. Ensure you are sending no more than 10,000 records per API call.
              </div>
            </div>

          </div>
        </div>

      </div>

      {/* Footer Nav */}
      <div className="pt-8 border-t border-slate-200 flex justify-start">
        <Link 
          href="/developers/docs/api-reference/detect"
          className="text-slate-600 hover:text-slate-900 px-4 py-3 rounded-xl font-bold text-sm flex items-center gap-2 transition-colors"
        >
          <ChevronLeft className="w-4 h-4" />
          Previous: Anomaly Detection Endpoint
        </Link>
      </div>

    </div>
  );
}
