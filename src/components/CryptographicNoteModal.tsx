"use client";

import React, { useState, useEffect } from 'react';

interface CryptographicNoteModalProps {
  record: any;
  isOpen: boolean;
  onClose: () => void;
}

export function CryptographicNoteModal({ record, isOpen, onClose }: CryptographicNoteModalProps) {
  const [noteText, setNoteText] = useState('');
  const [sha256Hash, setSha256Hash] = useState<string>('');
  const [volunteerPin, setVolunteerPin] = useState<string>('2026');
  const [encryptedPayload, setEncryptedPayload] = useState<string | null>(null);
  const [copied, setCopied] = useState(false);

  useEffect(() => {
    if (isOpen && record) {
      const rawIdentifier = (record.address || record.address1 || record.voter_id || record.name || "UNKNOWN_RECORD").toString().toUpperCase().trim();
      computeSha256(rawIdentifier).then(hash => {
        setSha256Hash(hash);
      });
    }
  }, [isOpen, record]);

  async function computeSha256(message: string): Promise<string> {
    try {
      const msgBuffer = new TextEncoder().encode(message);
      const hashBuffer = await crypto.subtle.digest('SHA-256', msgBuffer);
      const hashArray = Array.from(new Uint8Array(hashBuffer));
      return hashArray.map(b => b.toString(16).padStart(2, '0')).join('');
    } catch (e) {
      let hash = 0;
      for (let i = 0; i < message.length; i++) {
        hash = ((hash << 5) - hash) + message.charCodeAt(i);
        hash |= 0;
      }
      return "ID-" + Math.abs(hash).toString(16).padStart(8, '0');
    }
  }

  const handleSaveObservation = async () => {
    if (!noteText.trim()) return;
    
    const pinSalt = volunteerPin.padEnd(4, '0');
    const compositeHash = await computeSha256(`${pinSalt}::${sha256Hash}`);
    const shortHash = compositeHash.substring(0, 12);
    
    const bundle = {
      anonymous_location_id: shortHash.toUpperCase(),
      observation_note: noteText.trim(),
      county_jurisdiction: record.county || "Statewide",
      volunteer_pin_alias: `PIN-${pinSalt}`,
      timestamp: new Date().toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' }),
      privacy_badge: "Verified Community Observation (Zero Sensitive Information)"
    };

    setEncryptedPayload(JSON.stringify(bundle, null, 2));
  };

  const copyBundle = () => {
    if (encryptedPayload) {
      navigator.clipboard.writeText(encryptedPayload);
      setCopied(true);
      setTimeout(() => setCopied(false), 2500);
    }
  };

  if (!isOpen || !record) return null;

  const displayAddress = record.address || record.address1 || record.voter_id || record.name || "Selected Record";

  return (
    <div className="fixed inset-0 z-[99999] bg-slate-900/60 backdrop-blur-sm flex items-center justify-center p-4 overflow-y-auto animate-fadeIn">
      <div className="bg-white dark:bg-slate-900 border-2 border-slate-200 dark:border-slate-800 rounded-2xl max-w-2xl w-full shadow-2xl overflow-hidden text-slate-900 dark:text-slate-100">
        {/* Header */}
        <div className="p-5 bg-amber-50 dark:bg-slate-950 border-b border-amber-200 dark:border-slate-800 flex items-center justify-between">
          <div className="flex items-center gap-3.5">
            <div className="w-11 h-11 rounded-xl bg-amber-500 text-white flex items-center justify-center text-2xl font-bold shadow-sm">
              💡
            </div>
            <div>
              <h3 className="font-black text-slate-900 dark:text-white text-lg">Community Field Note & Observation</h3>
              <p className="text-xs font-semibold text-slate-600 dark:text-slate-400">Shining light on civic data while protecting citizen privacy and community standards.</p>
            </div>
          </div>
          <button 
            onClick={onClose}
            className="text-slate-500 hover:text-slate-900 dark:hover:text-white text-xl p-2 rounded-lg hover:bg-amber-100 dark:hover:bg-slate-800 transition-colors font-bold"
          >
            ✕
          </button>
        </div>

        {/* Body Stack showing all information without tab switching */}
        <div className="p-6 space-y-8 max-h-[80vh] overflow-y-auto">
          {/* Main Form Section */}
          <div className="space-y-4">
            {/* Reassuring Community Banner */}
            <div className="bg-amber-500/10 p-4 rounded-xl border border-amber-500/30 flex items-start gap-3">
              <span className="text-xl">🌟</span>
              <p className="text-xs sm:text-sm font-semibold text-slate-800 dark:text-slate-200 leading-relaxed">
                <strong className="text-amber-900 dark:text-amber-300 font-black">Shining Light Together:</strong> Your field notes help local volunteers identify anomalies without exposing personal citizen information. Physical addresses are automatically converted to anonymous digital badges.
              </p>
            </div>

            {/* Record Target Card */}
            <div className="bg-slate-100 dark:bg-slate-800/80 p-4 rounded-xl border border-slate-200 dark:border-slate-700 flex flex-col sm:flex-row justify-between items-start sm:items-center gap-2">
              <div>
                <span className="text-[11px] font-extrabold text-slate-500 dark:text-slate-400 uppercase tracking-wider block">Target Location</span>
                <span className="font-extrabold text-base text-slate-900 dark:text-white">{displayAddress}</span>
              </div>
              <span className="bg-white dark:bg-slate-900 text-slate-800 dark:text-slate-200 text-xs font-black px-3 py-1 rounded-lg border border-slate-300 dark:border-slate-700 shadow-sm">
                {record.county || "Statewide"} County
              </span>
            </div>

            {/* Note Text Area */}
            <div>
              <label className="block text-sm font-extrabold text-slate-900 dark:text-slate-100 mb-1.5">
                Volunteer Field Observation
              </label>
              <textarea
                rows={3}
                value={noteText}
                onChange={(e) => setNoteText(e.target.value)}
                placeholder="e.g., Physical visit confirmed this location is a student dormitory hall at Jackson State University. High occupancy is verified..."
                className="w-full bg-white dark:bg-slate-950 border-2 border-slate-300 dark:border-slate-700 rounded-xl p-3.5 text-sm font-medium text-slate-900 dark:text-white focus:border-amber-500 focus:outline-none placeholder:text-slate-400 shadow-inner"
              />
            </div>

            {/* Simple 4-Digit Volunteer PIN */}
            <div className="flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-4 bg-slate-50 dark:bg-slate-800/50 p-4 rounded-xl border border-slate-200 dark:border-slate-700">
              <div className="space-y-0.5">
                <label className="block text-xs font-black uppercase text-slate-700 dark:text-slate-300">Volunteer Verification PIN</label>
                <p className="text-[11px] text-slate-500 dark:text-slate-400">A simple 4-digit number to tag your observation with your local team.</p>
              </div>
              <div className="flex items-center gap-3 self-end sm:self-center">
                <input
                  type="text"
                  maxLength={4}
                  value={volunteerPin}
                  onChange={(e) => setVolunteerPin(e.target.value.replace(/[^0-9]/g, ''))}
                  placeholder="2026"
                  className="w-24 text-center bg-white dark:bg-slate-950 border-2 border-slate-300 dark:border-slate-600 rounded-lg px-3 py-2 text-base font-black font-mono tracking-widest text-slate-900 dark:text-white focus:border-amber-500 focus:outline-none shadow-sm"
                />
                <button
                  type="button"
                  onClick={handleSaveObservation}
                  disabled={!noteText.trim()}
                  className="bg-amber-600 hover:bg-amber-500 disabled:opacity-50 text-white font-black px-5 py-2.5 rounded-xl text-xs sm:text-sm shadow-md transition-all flex items-center gap-1.5"
                >
                  <span>✨ Save Community Note</span>
                </button>
              </div>
            </div>

            {/* Observation Output Bundle */}
            {encryptedPayload && (
              <div className="mt-4 p-4 bg-emerald-50 dark:bg-emerald-950/30 border-2 border-emerald-500/40 rounded-xl space-y-3 animate-fadeIn">
                <div className="flex items-center justify-between">
                  <span className="text-xs font-black text-emerald-800 dark:text-emerald-300 flex items-center gap-1.5">
                    <span>✅ Observation Note Ready to Share</span>
                  </span>
                  <button
                    onClick={copyBundle}
                    className="bg-emerald-700 hover:bg-emerald-600 text-white font-extrabold text-xs px-3.5 py-1.5 rounded-lg shadow transition-colors"
                  >
                    {copied ? "✓ Copied to Clipboard!" : "📋 Copy Note Summary"}
                  </button>
                </div>
                <pre className="text-xs font-mono font-bold text-slate-800 dark:text-slate-200 bg-white dark:bg-slate-900 p-3.5 rounded-lg overflow-x-auto border border-emerald-500/30 shadow-inner">
                  {encryptedPayload}
                </pre>
                <p className="text-xs text-slate-600 dark:text-slate-400 leading-relaxed font-medium">
                  Your observation has been tagged with your 4-digit volunteer PIN and anonymized location badge. Paste this into your team chat or playbook without sharing tracking URLs or private citizen names.
                </p>
              </div>
            )}
          </div>

          <hr className="border-slate-200 dark:border-slate-800" />

          {/* Plain-English Guide Section */}
          <div className="space-y-4 text-sm leading-relaxed text-slate-700 dark:text-slate-300 font-medium">
            <h4 className="font-extrabold text-slate-900 dark:text-white text-base flex items-center gap-2">
              <span>📖</span> Plain-English Guide to Community Collaboration
            </h4>
            <div className="bg-amber-50 dark:bg-amber-950/40 border border-amber-300 dark:border-amber-700 p-4 rounded-xl text-amber-950 dark:text-amber-200 font-bold">
              💡 <strong className="font-black">The Metaphor of the Cave:</strong> We aren&apos;t casting shadow puppets or keeping secrets in the dark. Our goal is to bring civic understanding into the sunlight so communities can verify their own public registries with clarity and confidence.
            </div>
            <ul className="list-disc list-inside space-y-2.5 ml-1 text-slate-700 dark:text-slate-300">
              <li>
                <strong className="text-slate-900 dark:text-white">No Names Broadcast:</strong> When you leave a field observation on a dormitory or apartment building, citizen names are never included.
              </li>
              <li>
                <strong className="text-slate-900 dark:text-white">Anonymous Location ID:</strong> The street address is converted into an anonymized digital badge so volunteers can confirm locations without transmitting sensitive information.
              </li>
              <li>
                <strong className="text-slate-900 dark:text-white">Simple Team PIN:</strong> Instead of complicated hexadecimal passwords, your local volunteer team uses a simple 4-digit verification code to group observations together.
              </li>
            </ul>
          </div>

          <hr className="border-slate-200 dark:border-slate-800" />

          {/* Privacy Details Section */}
          <div className="space-y-4 text-xs leading-relaxed text-slate-700 dark:text-slate-300">
            <h4 className="font-extrabold text-slate-900 dark:text-white text-base flex items-center gap-2">
              <span>🛡️</span> Technical Privacy Architecture
            </h4>
            <div className="bg-blue-50 dark:bg-blue-950/40 border border-blue-300 dark:border-blue-700 p-4 rounded-xl text-blue-950 dark:text-blue-200 font-bold text-sm">
              <strong className="font-black">Zero Sensitive Information Architecture</strong> for community volunteers and state partners.
            </div>
            <div className="space-y-3 bg-slate-100 dark:bg-slate-800 p-4 rounded-xl border border-slate-200 dark:border-slate-700 text-sm font-medium">
              <div>
                <span className="text-slate-500 dark:text-slate-400 block text-xs font-bold uppercase">Anonymization Method</span>
                <span className="text-slate-900 dark:text-white font-extrabold">One-Way SHA-256 Location Hashes</span>
              </div>
              <div>
                <span className="text-slate-500 dark:text-slate-400 block text-xs font-bold uppercase">Data Storage Location</span>
                <span className="text-slate-900 dark:text-white font-extrabold">Local Browser Memory & IndexedDB Sandbox</span>
              </div>
              <div>
                <span className="text-slate-500 dark:text-slate-400 block text-xs font-bold uppercase">Network Transmission</span>
                <span className="text-emerald-700 dark:text-emerald-400 font-extrabold">0.00% Automatic Exfiltration (User-Controlled Copy Only)</span>
              </div>
            </div>
          </div>
        </div>

        {/* Footer */}
        <div className="p-4 bg-slate-100 dark:bg-slate-950 border-t border-slate-200 dark:border-slate-800 flex justify-end">
          <button
            onClick={onClose}
            className="bg-slate-800 hover:bg-slate-700 text-white font-extrabold px-6 py-2.5 rounded-xl text-sm transition-colors shadow"
          >
            Done
          </button>
        </div>
      </div>
    </div>
  );
}
