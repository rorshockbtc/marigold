"use client";

import React from "react";
import Link from "next/link";
import { ChevronRight, ChevronLeft, ShieldAlert, Cpu } from "lucide-react";
import { NonTechnicalTranslator } from "@/components/NonTechnicalTranslator";
import { CodeBlock } from "@/components/CodeBlock";

export default function GettingStartedPage() {
  return (
    <div className="space-y-10 pb-16 animate-in fade-in duration-500">
      
      <div className="space-y-4 border-b border-slate-200 pb-8">
        <div className="flex items-center gap-2 text-sm font-bold text-emerald-600 mb-2">
          <span>Getting Started</span>
          <ChevronRight className="w-4 h-4 text-slate-600" />
          <span className="text-slate-900">Quickstart Guide</span>
        </div>
        <h1 className="text-4xl md:text-5xl font-black font-serif tracking-tight text-slate-900 leading-tight">
          Quickstart Guide
        </h1>
        <p className="text-xl text-slate-600 leading-relaxed max-w-3xl">
          Establish your institutional environment, rotate your primary Bearer tokens, and conduct your very first synthetic anomaly detection sweep using the Marigold Universal API standard.
        </p>
      </div>

      <div className="prose prose-slate prose-emerald max-w-none">
        <NonTechnicalTranslator 
          title="Prerequisites & Institutional Compliance"
          mariContextPrompt="I just read the non-technical translation for Prerequisites. Can you explain why it's so strict before letting someone use the system?"
          technicalContent={
            <>
              <p>
                Before a single packet of data traverses the wire to the Marigold Insights cloud ingress points, your monolithic architecture must be fully validated. We strictly enforce a Zero-Trust perimeter. The following prerequisites must be met before your API tokens are granted:
              </p>
              <ul>
                <li><strong>Static IPv4 / IPv6 Range:</strong> You must provide your agency's egress IP block to the Architecture Desk. Requests originating from dynamic or unverified IPs will be hard-dropped at the WAF level without a JSON response.</li>
                <li><strong>Cryptographic Libraries:</strong> Your runtime environment (e.g., .NET Core 8+, Java 21+, Python 3.11+, Node 20+) must support AES-GCM 256-bit cryptography natively. DO NOT attempt to roll your own cryptographic implementation or use CBC modes.</li>
                <li><strong>Compliance Token:</strong> You must have a signed SOC 2 Type II exemption or inclusion rider verified by the <code>partnerships@marigoldinsights.org</code> desk.</li>
              </ul>

              <div className="bg-amber-50 border border-amber-200 rounded-xl p-6 my-8 not-prose">
                <h4 className="text-amber-900 font-bold mb-3 flex items-center gap-2">
                  <ShieldAlert className="w-5 h-5 text-amber-600" />
                  Warning: The Zero-PII Mandate
                </h4>
                <p className="text-sm text-amber-800 leading-relaxed">
                  If our packet inspectors detect plaintext Personally Identifiable Information (such as SSNs, raw plaintext dates of birth, or plaintext first/last name matrices) in your payload, your API keys will be immediately and irrevocably revoked. <strong>We do not want your raw data.</strong> All payloads must be pre-hashed and encrypted according to the Cryptography Guidelines.
                </p>
              </div>
            </>
          }
          eli5Content={
            <p>
              Because we are dealing with national security and election integrity, we don't let just anyone use our system. You can't just sign up with an email address. Before a government agency can plug into Marigold, they have to prove to us that they are operating from a secure government building, using military-grade math, and following federal compliance rules. Most importantly, if any government tries to send us real, readable names and addresses (instead of secret scrambled codes), we instantly shut off their connection and ban them. We refuse to hold raw citizen data. Period.
            </p>
          }
        />

        <NonTechnicalTranslator 
          title="Step 1: Instantiating the Client"
          mariContextPrompt="I just read the non-technical translation for Step 1. Can you explain why we don't just hardcode the token?"
          technicalContent={
            <>
              <p>
                We highly recommend generating a strongly-typed SDK using our <code>openapi.yaml</code> specification file. For this quickstart, however, we will use a raw cURL command to demonstrate the underlying mechanics of the REST interaction.
              </p>

              <p>
                First, store your active token securely. In a production environment, this should be fetched from a secure vault (e.g., HashiCorp Vault, AWS Secrets Manager) and never hardcoded.
              </p>

              <CodeBlock
                language="bash"
                title="Export Tokens"
                code={`# Export your institutional token
export MARIGOLD_BEARER="mg_live_x89aZ120BklqP94MnvX5..."

# Ensure your endpoints point to v1
export MARIGOLD_API_HOST="https://api.marigoldinsights.org/v1"`}
              />
            </>
          }
          eli5Content={
            <p>
              The first step is preparing to talk to Marigold. Think of it like getting ready to make a highly secure phone call. You need the right phone number and your secret password. It is extremely important that you store this password safely in a digital vault and never write it down in your code where anyone could read it.
            </p>
          }
        />

        <NonTechnicalTranslator 
          title="Step 2: Preparing the Synthetic Payload"
          mariContextPrompt="I just read the non-technical translation for Step 2. What exactly is a synthetic payload?"
          technicalContent={
            <>
              <p>
                To test the connection, you must generate a synthetic payload. We will test the <code>HIGH_DENSITY</code> anomaly detection module. The <code>session_fingerprint</code> is a unique SHA-256 hash identifying this specific audit run. It prevents replay attacks and ensures idempotency.
              </p>

              <p>
                The <code>encrypted_vault</code> contains the actual data. For this test, you do not need to implement AES-GCM; you can use our sandbox-whitelisted synthetic ciphertext <code>SYNTHETIC_TEST_VECTOR_01</code>.
              </p>

              <CodeBlock
                language="bash"
                title="Create JSON Payload"
                code={`cat << EOF > test-payload.json
{
  "session_fingerprint": "a3b9c8d7e6f5a4b3c2d1e0f9a8b7c6d5e4f3a2b1c0d9e8f7a6b5c4d3e2f1a0",
  "anomaly_type": "HIGH_DENSITY",
  "record_identifiers": [
    "ROW_0001",
    "ROW_0002"
  ],
  "encrypted_vault": {
    "payload": "SYNTHETIC_TEST_VECTOR_01"
  }
}
EOF`}
              />
            </>
          }
          eli5Content={
            <p>
              Before sending real data, we always test the connection with fake, perfectly safe test data (a "synthetic payload"). This proves that your computer can reach our system securely without risking any sensitive citizen information. Think of it like a practice fire drill.
            </p>
          }
        />

        <NonTechnicalTranslator 
          title="Step 3: Executing the First Sweep"
          mariContextPrompt="I just read the non-technical translation for Step 3. What happens if my IP isn't whitelisted?"
          technicalContent={
            <>
              <p>
                Now, transmit the synthetic payload to the cloud ingress point. Our ingress load balancers will verify your IP, authenticate your Bearer token, validate the JSON schema against our strict OpenAPI 3.1 definitions, and route the request to the algorithmic workers.
              </p>

              <CodeBlock
                language="bash"
                title="Execute POST Request"
                code={`curl -X POST $MARIGOLD_API_HOST/modules/anomalies/detect \\
  -H "Authorization: Bearer $MARIGOLD_BEARER" \\
  -H "Content-Type: application/json" \\
  -d @test-payload.json`}
              />

              <h3>Expected Response</h3>
              <p>
                If your IP is whitelisted and your token is valid, you will receive a <code>200 OK</code> response. The <code>status</code> field will indicate SUCCESS, and you will receive a synthetic array of flagged anomalies. Note that because you used a synthetic vector, the response is deterministic and hardcoded for validation purposes.
              </p>

              <CodeBlock
                language="json"
                title="Expected JSON Response"
                code={`{
  "status": "SUCCESS",
  "anomalies_found": 2,
  "flags": [
    {
      "record_id": "ROW_0001",
      "flag_reason": "SYNTHETIC_HIGH_DENSITY_TRIGGER",
      "severity": "HIGH"
    },
    {
      "record_id": "ROW_0002",
      "flag_reason": "SYNTHETIC_HIGH_DENSITY_TRIGGER",
      "severity": "MEDIUM"
    }
  ]
}`}
              />
            </>
          }
          eli5Content={
            <p>
              This is where you actually send the test data over to us. Our automated security guards check your ID and your location. If everything checks out, we process the request and send you back a successful test result, showing you exactly what it will look like when we find real issues in the future.
            </p>
          }
        />

        <NonTechnicalTranslator 
          title="Step 4: Integration Architecture Strategies"
          mariContextPrompt="I just read the non-technical translation for Step 4. Why do we need to chunk the data into pieces?"
          technicalContent={
            <>
              <p>
                Once you have successfully executed the synthetic sweep, you must design your production architecture. You cannot run these sweeps iteratively inside a standard blocking UI thread. Civic datasets easily exceed 5-10 million rows, resulting in JSON payloads larger than 5GB.
              </p>
              
              <p>
                We strongly mandate the <strong>Asynchronous Worker Strategy</strong>. 
              </p>
              <ol>
                <li>Your primary backend partitions the dataset into chunks of exactly 10,000 rows.</li>
                <li>A background worker thread generates the AES-GCM encrypted vault for each chunk.</li>
                <li>The worker submits the chunks to Marigold asynchronously utilizing an exponential backoff retry mechanism to respect our 500 RPM rate limit.</li>
                <li>As responses return, the worker decrypts the anomalies and writes the flags directly to your SQL/NoSQL database for UI consumption.</li>
              </ol>

              <div className="bg-blue-50 border border-blue-200 rounded-xl p-6 my-8 not-prose">
                <h4 className="text-blue-900 font-bold mb-3 flex items-center gap-2">
                  <Cpu className="w-5 h-5 text-blue-600" />
                  Parallelism Constraints
                </h4>
                <p className="text-sm text-blue-800 leading-relaxed">
                  While you should use parallel workers, do not exceed 5 concurrent connections per IP address. The Marigold WAF implements strict concurrent connection limits to prevent DDOS-style ingestion exhaustion. A pool of 3-4 background threads is optimal for chunking a 10M row database in under 20 minutes.
                </p>
              </div>
            </>
          }
          eli5Content={
            <p>
              When you're ready to send real, massive databases (like millions of records), you can't just send it all at once like a giant email attachment. The system will crash. Instead, you need to break it into smaller boxes (chunks) and send a few boxes at a time in the background. We also limit how many boxes you can hand us at the exact same second to prevent traffic jams.
            </p>
          }
        />

      </div>

      {/* Footer Nav */}
      <div className="pt-8 border-t border-slate-200 flex justify-between">
        <Link 
          href="/developers"
          className="text-slate-600 hover:text-slate-900 px-4 py-3 rounded-xl font-bold text-sm flex items-center gap-2 transition-colors"
        >
          <ChevronLeft className="w-4 h-4" />
          Previous: Introduction
        </Link>
        <Link 
          href="/developers/docs/authentication"
          className="bg-slate-50 border border-slate-200 hover:bg-emerald-600 text-white px-6 py-3 rounded-xl font-bold text-sm flex items-center gap-2 transition-colors shadow-sm"
        >
          Next: Authentication & Tokens
          <ChevronRight className="w-4 h-4" />
        </Link>
      </div>

    </div>
  );
}
