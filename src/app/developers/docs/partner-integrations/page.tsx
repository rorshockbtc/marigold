import React from "react";
import Link from "next/link";
import { ChevronRight, ChevronLeft, Building2, Server, Lock, ArrowRightLeft, ShieldCheck, Database } from "lucide-react";
import { NonTechnicalTranslator } from "@/components/NonTechnicalTranslator";

export default function PartnerIntegrationsPage() {
  return (
    <div className="space-y-10 pb-16 animate-in fade-in duration-500">
      
      <div className="space-y-4 border-b border-slate-200 pb-8">
        <div className="flex items-center gap-2 text-sm font-bold text-emerald-600 mb-2">
          <span>Core Infrastructure</span>
          <ChevronRight className="w-4 h-4 text-slate-400" />
          <span className="text-slate-900">Legacy Partner Integrations</span>
        </div>
        <h1 className="text-4xl md:text-5xl font-black font-serif tracking-tight text-slate-900 leading-tight">
          Federated Collaboration for Legacy Monoliths
        </h1>
        <p className="text-xl text-slate-600 leading-relaxed max-w-3xl">
          Architectural philosophy and integration building blocks for monolithic state providers (e.g., legacy C#/Java civic systems) seeking secure, decentralized collaboration via Marigold Insights.
        </p>
      </div>

      <div className="prose prose-slate prose-emerald max-w-none">
        
        <NonTechnicalTranslator 
          title="The Partner Philosophy: Exploration vs. Verification"
          mariContextPrompt="I just read the non-technical translation for Exploration vs Verification. Why doesn't Marigold verify the data?"
          technicalContent={
            <>
              <p>
                Legacy civic technology platforms operate under strict, expensive data constraints. These systems (often built on monolithic databases without public APIs) rightfully guard their PII (Personally Identifiable Information) fiercely. 
              </p>
              <p>
                Marigold Insights is not a data broker; it is an exploration engine. Our architectural philosophy for partner collaboration is strict separation of concerns:
              </p>
              <ul>
                <li><strong>Marigold handles the Exploration:</strong> We run the mathematically intensive Fellegi-Sunter matching and Standard Deviation anomaly modeling on encrypted representations of the data.</li>
                <li><strong>The Partner handles the Verification:</strong> The partner retains the unencrypted master PII and manages the human workflow (verifying, challenging, or ignoring the anomaly flags).</li>
              </ul>
            </>
          }
          eli5Content={
            <p>
              Imagine Marigold is a metal detector and our Partner (like a state database) is the person digging in the sand. We don't want to dig, and we don't want to keep whatever is buried. Our only job is to sweep over the sand and beep when we find something interesting (Exploration). The Partner then decides whether to dig it up and verify what it is (Verification). This keeps everyone safe and focused on what they do best.
            </p>
          }
        />

        <NonTechnicalTranslator 
          title="The Bi-Directional Delta (∆) API"
          mariContextPrompt="I just read the non-technical translation for the Delta API. What does delta mean in this context?"
          technicalContent={
            <>
              <p>
                For data providers with deep historical archives (e.g., Elly), transmitting the entire multi-gigabyte historical database for anomaly detection is highly inefficient and violates our lightweight DAIO principles.
              </p>
              <p>
                Instead, partners must implement the <strong>Bi-Directional Delta (∆) API</strong>. The partner calculates the structural differences (deltas) between historical files and the current file locally. The partner only transmits the encrypted Z-Score aberrations (the delta) to Marigold for Data Visualization rendering.
              </p>
              <p>
                This API is intentionally bi-directional but severely restricted. Marigold holds <strong>limited write permissions</strong>—allowing us to write verification tags or Cartridge execution logs back to the partner's system without granting us root mutation access to the underlying PII.
              </p>
            </>
          }
          eli5Content={
            <p>
              If a book only has one new page added to it, you shouldn't mail the entire 1,000-page book to someone just to show them the update. You should only mail the single new page. We call this the "Delta" (the difference). Partners with massive historical records only send Marigold the "new pages" or "differences" that look suspicious. We then draw beautiful charts based on those differences and send a small "verified" sticker back to the partner to put in their book.
            </p>
          }
        />

        <NonTechnicalTranslator 
          title="Building Blocks for Secure Cross-Platform Communication"
          mariContextPrompt="I just read the non-technical translation for the Building Blocks section. What are the key concepts for connecting legacy systems securely?"
          technicalContent={
            <>
              <p>
                To establish a secure bridge between a legacy monolith and Marigold Insights, partners must construct an abstraction layer that handles Client-Side Encryption, Anonymous Session Handoff, and Asynchronous Webhooks.
              </p>

              <h3>1. Local AES-GCM Encryption (The Air-Gap)</h3>
              <p>
                Before any data leaves the partner's secure perimeter, it must be encrypted. If you are unable to use our pre-built Node.js or .NET SDKs, your integration must replicate the following cryptographic flow explicitly:
              </p>
              
              <pre className="bg-slate-50 border border-slate-200 text-slate-900 p-4 rounded-xl overflow-x-auto text-xs font-mono leading-relaxed my-6 shadow-sm">
<code>{`// Architectural Pseudocode for Legacy C#/Java Enclaves
1. Extract Dataset (ID, Name, DOB, Address) from Monolith SQL.
2. Initialize AES-256-GCM cipher using a Partner-managed Master Key.
3. For each row:
     a. Generate 12-byte random IV (Nonce).
     b. Encrypt PII payload.
     c. Extract 16-byte Authentication Tag.
     d. Construct Encrypted Vault Object: { id, iv, ciphertext, authTag }.
4. Send Encrypted Vault Object over TLS 1.3 to Marigold API.`}</code>
              </pre>

              <h3>2. Embedded iFrame / Seamless Dashboard Handoff</h3>
              <p>
                The ultimate goal of a partnership integration is to allow the end-user (the volunteer) to seamlessly view Marigold's visual analytics directly inside the partner's existing portal. 
              </p>
              <p>
                Because Marigold relies on encrypted session tokens, partners can use an <strong>Anonymous Handoff Token</strong> via an iFrame or authenticated redirect.
              </p>

              <pre className="bg-slate-50 border border-slate-200 text-slate-900 p-4 rounded-xl overflow-x-auto text-xs font-mono leading-relaxed my-6 shadow-sm">
<code>{`<!-- Embedded Integration Example -->
<iframe 
  src="https://marigoldinsights.org/embed/task-board?session_token=XYZ123&hide_nav=true" 
  sandbox="allow-scripts allow-same-origin"
  className="w-full h-[800px] border-none"
/>`}</code>
              </pre>
              <p>
                By passing <code>hide_nav=true</code> and an ephemeral <code>session_token</code>, the user experiences Marigold as a native module of your platform. Marigold will display the visual anomalies (e.g., "Row 101 flags as Commercial Zoning"), and the partner platform retains the mapping of "Row 101" to the actual citizen's plaintext identity.
              </p>

              <div className="bg-amber-50 border border-amber-200 p-6 rounded-xl my-8 not-prose flex items-start gap-4 shadow-sm">
                <Lock className="w-6 h-6 text-amber-600 shrink-0 mt-1" />
                <div>
                  <h4 className="font-bold text-amber-900 mb-1">State Preservation & Synchronization</h4>
                  <p className="text-sm text-amber-800 leading-relaxed">
                    It is critical that you pass the exact <code>state</code> and <code>dateOfVoterRoll</code> metadata in your initial ingestion payload. Because state voter rolls fluctuate daily, Marigold utilizes this metadata to track historical anomalies across rolling timelines. Without these identifiers, temporal synchronization between our analytical engine and your monolith will drift.
                  </p>
                </div>
              </div>
            </>
          }
          eli5Content={
            <p>
              When connecting old computer systems to Marigold, we need to build a safe bridge. First, all data must be securely locked up (encrypted) before it even leaves the partner's system. Think of it like putting a letter in a locked safe before shipping it. Second, when users look at our charts, they should feel like they never left the partner's website. We achieve this by opening a small window (an iframe) to our charts, while keeping everyone's identity safely anonymous. Lastly, it's very important to always label the data with its location and date so we don't mix up old records with new ones!
            </p>
          }
        />
      </div>

      {/* Footer Nav */}
      <div className="pt-8 border-t border-slate-200 flex justify-between">
        <Link 
          href="/developers/docs/versioning"
          className="text-slate-600 hover:text-slate-900 px-4 py-3 rounded-xl font-bold text-sm flex items-center gap-2 transition-colors"
        >
          <ChevronLeft className="w-4 h-4" />
          Previous: Data Traversal & Versioning
        </Link>
        <Link 
          href="/developers/docs/algorithms/fellegi-sunter"
          className="bg-emerald-600 hover:bg-emerald-700 text-white px-6 py-3 rounded-xl font-bold text-sm flex items-center gap-2 transition-colors shadow-sm"
        >
          Next: Algorithmic Proofs
          <ChevronRight className="w-4 h-4" />
        </Link>
      </div>

    </div>
  );
}
