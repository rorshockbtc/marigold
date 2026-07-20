"use client";

import React from "react";
import Link from "next/link";
import { ChevronRight, ChevronLeft, Shield, Lock, FileKey2, KeyRound } from "lucide-react";
import { NonTechnicalTranslator } from "@/components/NonTechnicalTranslator";
import { CodeBlock } from "@/components/CodeBlock";

export default function CryptographyPage() {
  return (
    <div className="space-y-10 pb-16 animate-in fade-in duration-500">
      
      <div className="space-y-4 border-b border-slate-200 pb-8">
        <div className="flex items-center gap-2 text-sm font-bold text-emerald-600 mb-2">
          <span>Core Infrastructure</span>
          <ChevronRight className="w-4 h-4 text-slate-600" />
          <span className="text-slate-900">Zero-PII Cryptography</span>
        </div>
        <h1 className="text-4xl md:text-5xl font-black font-serif tracking-tight text-slate-900 leading-tight">
          Zero-PII Cryptography
        </h1>
        <p className="text-xl text-slate-600 leading-relaxed max-w-3xl">
          Marigold Insights operates on a strict, mathematically-provable Zero-Trust boundary. We enforce AES-256-GCM authenticated encryption at the edge. Your PII never touches our processors in plaintext.
        </p>
      </div>

      <div className="prose prose-slate prose-emerald max-w-none">
        
        <NonTechnicalTranslator 
          title="The Zero-Knowledge Mandate"
          mariContextPrompt="I just read the non-technical translation for the Zero-Knowledge Mandate. How does Marigold do math on data they can't even see?"
          technicalContent={
            <>
              <p>
                State election systems manage Highly Sensitive Personally Identifiable Information (HS-PII). Traditional data brokers ingest these massive datasets via SFTP, placing the liability of SOC 2 / FedRAMP compliance squarely on the cloud provider. We reject this architecture.
              </p>
              <p>
                Marigold functions exclusively on <strong>Encrypted Vaults</strong>. We act as an algebraic calculator for your system. We perform standard deviation logic, Fellegi-Sunter log-odds evaluation, and NCOA clustering on pre-encrypted hashes.
              </p>

              <div className="bg-slate-50 border border-slate-200 p-6 rounded-xl my-8 not-prose">
                <h4 className="font-bold text-slate-900 mb-4 flex items-center gap-2 border-b border-slate-200 pb-2">
                  <Lock className="w-5 h-5 text-emerald-600" />
                  AES-256-GCM Specification
                </h4>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm">
                  <div>
                    <strong className="block text-slate-900 mb-1">Cipher Algorithm</strong>
                    <code className="text-emerald-700 bg-emerald-50 px-2 py-1 rounded">aes-256-gcm</code>
                  </div>
                  <div>
                    <strong className="block text-slate-900 mb-1">Key Size</strong>
                    <code className="text-emerald-700 bg-emerald-50 px-2 py-1 rounded">32 bytes (256 bits)</code>
                  </div>
                  <div>
                    <strong className="block text-slate-900 mb-1">Initialization Vector (Nonce)</strong>
                    <code className="text-emerald-700 bg-emerald-50 px-2 py-1 rounded">12 bytes (96 bits)</code>
                  </div>
                  <div>
                    <strong className="block text-slate-900 mb-1">Authentication Tag</strong>
                    <code className="text-emerald-700 bg-emerald-50 px-2 py-1 rounded">16 bytes (128 bits)</code>
                  </div>
                </div>
              </div>
            </>
          }
          eli5Content={
            <p>
              When a state government gives voter data to a normal tech company, that company becomes legally responsible for protecting those thousands of real names and addresses from hackers. This is very dangerous. Marigold uses a "Zero-Knowledge" rule, meaning we refuse to look at the real names. Before the data leaves the government's computer, it is shoved into an unbreakable digital lockbox (an Encrypted Vault). The government keeps the only key. Marigold's supercomputers do advanced math on the outside of the lockbox and return it. Since we never see the real names, a hacker couldn't steal them from us even if they tried!
            </p>
          }
        />

        <NonTechnicalTranslator 
          title="Preparing the Encrypted Vault"
          mariContextPrompt="I just read the non-technical translation for Preparing the Encrypted Vault. How do you prepare data for Marigold without exposing it?"
          eli5Content={
            <p>
              Think of preparing the Encrypted Vault like packing a secret message in a safe before mailing it. You first lock your voter data with your own personal key. Then you put that locked data in a box along with two things: a random sticker (so every box looks unique) and a special wax seal to prove nobody tampered with the box in transit. Finally, you turn the whole package into a long string of text so it can travel safely across the internet to Marigold.
            </p>
          }
          technicalContent={
            <>
              <h2>Preparing the Encrypted Vault</h2>
              <p>
                Before calling the <code>/modules/anomalies/detect</code> endpoint, you must construct an encrypted vault. The vault is a Base64-encoded string containing three concatenated elements:
              </p>
              <ol>
                <li><strong>The IV (Nonce):</strong> 12 bytes of cryptographically secure random data.</li>
                <li><strong>The Ciphertext:</strong> Your JSON-stringified dataset, encrypted with your 32-byte master key.</li>
                <li><strong>The Auth Tag:</strong> 16 bytes generated by the GCM cipher validating the integrity of the ciphertext.</li>
              </ol>

              <h3>Reference Implementation (Node.js)</h3>
              <p>
                Below is a production-ready Node 20+ implementation utilizing the native <code>node:crypto</code> module to generate the exact <code>encrypted_vault.payload</code> string expected by the API.
              </p>

              <CodeBlock
                language="typescript"
                title="Node.js 20+ Encryption Flow"
                code={`import crypto from 'node:crypto';

// CAUTION: This key must be securely generated (32 bytes) and stored locally.
// Marigold NEVER receives this key. If you lose it, the anomalies we return 
// cannot be decrypted by your system.
const LOCAL_MASTER_KEY = Buffer.from(process.env.MARIGOLD_LOCAL_KEY, 'hex');

function createEncryptedVault(dataArray: string[]): string {
  // 1. Stringify your data (e.g. array of Row IDs)
  const plaintext = JSON.stringify(dataArray);

  // 2. Generate a 12-byte secure random IV (Nonce)
  const iv = crypto.randomBytes(12);

  // 3. Instantiate the AES-256-GCM cipher
  const cipher = crypto.createCipheriv('aes-256-gcm', LOCAL_MASTER_KEY, iv);

  // 4. Encrypt the data
  const ciphertext = Buffer.concat([
    cipher.update(plaintext, 'utf8'),
    cipher.final()
  ]);

  // 5. Extract the 16-byte Authentication Tag
  const authTag = cipher.getAuthTag();

  // 6. Concatenate: IV (12) + Ciphertext (N) + AuthTag (16)
  const finalPayload = Buffer.concat([iv, ciphertext, authTag]);

  // 7. Base64 encode for API transmission
  return finalPayload.toString('base64');
}`}
              />

              <h3>Reference Implementation (C# / .NET 8)</h3>
              <p>
                For state agencies relying on Microsoft infrastructure, here is the equivalent implementation utilizing the highly optimized <code>AesGcm</code> class in <code>System.Security.Cryptography</code>.
              </p>

              <CodeBlock
                language="csharp"
                title="C# / .NET 8 Encryption Flow"
                code={`using System;
using System.Security.Cryptography;
using System.Text;
using System.Text.Json;

public class MarigoldCryptography 
{
    private readonly byte[] _masterKey; // Must be exactly 32 bytes

    public MarigoldCryptography(string hexKey) 
    {
        _masterKey = Convert.FromHexString(hexKey);
    }

    public string CreateEncryptedVault(string[] dataArray) 
    {
        byte[] plaintext = Encoding.UTF8.GetBytes(JsonSerializer.Serialize(dataArray));
        
        byte[] nonce = new byte[12];
        RandomNumberGenerator.Fill(nonce);

        byte[] ciphertext = new byte[plaintext.Length];
        byte[] authTag = new byte[16];

        using (AesGcm aesGcm = new AesGcm(_masterKey, 16)) // 16 byte tag size
        {
            aesGcm.Encrypt(nonce, plaintext, ciphertext, authTag);
        }

        // Concatenate: Nonce (12) + Ciphertext (N) + AuthTag (16)
        byte[] finalPayload = new byte[nonce.Length + ciphertext.Length + authTag.Length];
        Buffer.BlockCopy(nonce, 0, finalPayload, 0, nonce.Length);
        Buffer.BlockCopy(ciphertext, 0, finalPayload, nonce.Length, ciphertext.Length);
        Buffer.BlockCopy(authTag, 0, finalPayload, nonce.Length + ciphertext.Length, authTag.Length);

        return Convert.ToBase64String(finalPayload);
    }
}`}
              />
            </>
          }
        />

        <NonTechnicalTranslator 
          title="Decrypting the Response"
          mariContextPrompt="I just read the non-technical translation for Decrypting the Response. What happens when Marigold sends the analyzed data back?"
          eli5Content={
            <p>
              When Marigold finishes analyzing your data, we send the results back to you in a similar locked safe. Because you are the only one with the key, you have to carefully reverse the packing process to open the safe and read the results. If you don't do this perfectly—even messing up a single letter—the safe's tamper-seal will break and it won't open.
            </p>
          }
          technicalContent={
            <>
              <h2>Decrypting the Response</h2>
              <p>
                When Marigold processes your algorithm, we encrypt the flagged anomalies (e.g., Row IDs that failed the density check) utilizing the same Nonce architecture. When you receive the response payload, you must reverse the concatenation process (extract the first 12 bytes as the IV, the last 16 bytes as the Auth Tag, and the middle as the Ciphertext) to securely read the flagged rows locally.
              </p>

              <div className="bg-rose-50 border border-rose-200 rounded-xl p-6 my-8 not-prose">
                <h4 className="text-rose-900 font-bold mb-3 flex items-center gap-2">
                  <FileKey2 className="w-5 h-5 text-rose-600" />
                  ERR_AUTH_TAG_MISMATCH
                </h4>
                <p className="text-sm text-rose-800 leading-relaxed">
                  The most common decryption error occurs when the <code>authTag</code> is incorrectly sliced from the payload. AES-GCM will aggressively throw an exception if the Tag is altered by even a single bit. Ensure you are extracting exactly 16 bytes from the absolute end of the Buffer array before attempting <code>decipher.setAuthTag()</code>.
                </p>
              </div>
            </>
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
          href="/developers/docs/algorithms/fellegi-sunter"
          className="bg-slate-50 border border-slate-200 hover:bg-emerald-600 text-white px-6 py-3 rounded-xl font-bold text-sm flex items-center gap-2 transition-colors shadow-sm"
        >
          Next: Fellegi-Sunter Algorithm
          <ChevronRight className="w-4 h-4" />
        </Link>
      </div>

    </div>
  );
}
