"use client";

import React from "react";
import Link from "next/link";
import { ChevronRight, ChevronLeft, Webhook, Network, ArrowDownUp } from "lucide-react";
import { NonTechnicalTranslator } from "@/components/NonTechnicalTranslator";
import { CodeBlock } from "@/components/CodeBlock";

export default function WebhooksPage() {
  return (
    <div className="space-y-10 pb-16 animate-in fade-in duration-500">
      
      <div className="space-y-4 border-b border-slate-200 pb-8">
        <div className="flex items-center gap-2 text-sm font-bold text-emerald-600 mb-2">
          <span>Core Infrastructure</span>
          <ChevronRight className="w-4 h-4 text-slate-400" />
          <span className="text-slate-900">Webhooks & Async Ingestion</span>
        </div>
        <h1 className="text-4xl md:text-5xl font-black font-serif tracking-tight text-slate-900 leading-tight">
          Webhooks
        </h1>
        <p className="text-xl text-slate-600 leading-relaxed max-w-3xl">
          When processing monolithic datasets exceeding 1,000,000 rows, blocking HTTP requests will result in connection timeouts. Marigold heavily advocates for asynchronous webhook architectures.
        </p>
      </div>

      <div className="prose prose-slate prose-emerald max-w-none">
        
        <NonTechnicalTranslator 
          title="Asynchronous Processing Flow"
          mariContextPrompt="I just read the non-technical translation for Asynchronous Processing Flow. Why do we need webhooks?"
          technicalContent={
            <>
              <p>
                Instead of holding a TCP connection open while the Fellegi-Sunter algorithms iterate across millions of vector matrices, you can pass a <code>callback_url</code> in your initial payload. The Marigold API will immediately return a <code>202 Accepted</code> containing a Job ID.
              </p>
              
              <p>
                Once the analytical cluster finishes calculating the Z-scores and encrypting the resultant anomaly flags, we will execute an HTTP POST request against your callback URL containing the final AES-GCM encrypted payload.
              </p>

              <div className="bg-slate-50 border border-slate-200 p-6 rounded-xl my-8 not-prose flex items-start gap-4">
                <Network className="w-6 h-6 text-slate-600 shrink-0 mt-1" />
                <div>
                  <h4 className="font-bold text-slate-900 mb-1">Webhook Idempotency</h4>
                  <p className="text-sm text-slate-600 leading-relaxed">
                    Marigold guarantees <strong>At-Least-Once</strong> delivery. Your webhook ingestion controller must be idempotent. Use the <code>session_fingerprint</code> to ensure your database does not process the same callback payload multiple times in the event of a network retry.
                  </p>
                </div>
              </div>
            </>
          }
          eli5Content={
            <p>
              Checking millions of voters takes a long time. If your computer asks our computer a question and just waits on the line for the answer, the connection will eventually timeout and drop. Instead, your computer drops off the data and says, "Call me at this number when you're done." That "call me back" feature is called a Webhook. When Marigold finishes doing all the hard math, we dial your computer's number and deliver the final report.
            </p>
          }
        />

        <NonTechnicalTranslator 
          title="HMAC-SHA256 Signature Verification"
          mariContextPrompt="I just read the non-technical translation for Signature Verification. What stops a hacker from pretending to be Marigold?"
          technicalContent={
            <>
              <p>
                Because your webhook endpoint must be publicly accessible on the internet, you must cryptographically verify that incoming payloads actually originated from Marigold Insights, rather than a malicious actor attempting a spoofing attack.
              </p>

              <p>
                Every webhook dispatched by Marigold includes a <code>X-Marigold-Signature</code> HTTP header. This signature is an HMAC-SHA256 hash of the raw request body, signed using your <strong>Webhook Secret</strong>.
              </p>

              <CodeBlock
                language="typescript"
                title="Express.js Webhook Verification Middleware"
                code={`// Express.js Webhook Verification Middleware
import crypto from 'node:crypto';
import express from 'express';

const app = express();
const WEBHOOK_SECRET = process.env.MARIGOLD_WEBHOOK_SECRET; // Starts with whsec_

// WARNING: You must use the RAW body for HMAC verification. 
// Do not use express.json() before verification.
app.post('/webhooks/marigold', express.raw({ type: 'application/json' }), (req, res) => {
  const signatureHeader = req.headers['x-marigold-signature'];
  
  if (!signatureHeader) {
    return res.status(401).send('Missing Signature');
  }

  // Generate our own signature based on the raw body
  const expectedSignature = crypto
    .createHmac('sha256', WEBHOOK_SECRET)
    .update(req.body)
    .digest('hex');

  // Use timingSafeEqual to prevent timing attacks
  const isValid = crypto.timingSafeEqual(
    Buffer.from(signatureHeader),
    Buffer.from(expectedSignature)
  );

  if (!isValid) {
    return res.status(401).send('Invalid Signature');
  }

  // Parse the body now that it is validated
  const payload = JSON.parse(req.body.toString());
  
  // Acknowledge receipt immediately to prevent Marigold from retrying
  res.status(200).send('OK');

  // Process the payload asynchronously...
  processEncryptedVault(payload);
});`}
              />
            </>
          }
          eli5Content={
            <p>
              Because your computer's "phone number" (the Webhook address) is public, anyone could call it. A bad guy might call your computer and say, "Hi, I'm Marigold, here is a fake report." To stop this, we use a secret handshake. Every time Marigold calls your computer, we stamp the report with a wax seal using a secret ring that only you and Marigold have. Your computer checks the wax seal, and if it matches perfectly, you know for sure it was really us who called.
            </p>
          }
        />

      </div>

      {/* Footer Nav */}
      <div className="pt-8 border-t border-slate-200 flex justify-between">
        <Link 
          href="/developers/docs/authentication"
          className="text-slate-600 hover:text-slate-900 px-4 py-3 rounded-xl font-bold text-sm flex items-center gap-2 transition-colors"
        >
          <ChevronLeft className="w-4 h-4" />
          Previous: Authentication
        </Link>
        <Link 
          href="/developers/docs/cryptography"
          className="bg-emerald-600 hover:bg-emerald-700 text-white px-6 py-3 rounded-xl font-bold text-sm flex items-center gap-2 transition-colors shadow-sm"
        >
          Next: Cryptography
          <ChevronRight className="w-4 h-4" />
        </Link>
      </div>

    </div>
  );
}
