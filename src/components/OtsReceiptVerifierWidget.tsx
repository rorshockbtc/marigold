"use client";

import React, { useState } from "react";
import { ShieldCheck, Upload, Download, CheckCircle2, AlertTriangle, Cpu } from "lucide-react";
import {
  buildOtsFile,
  verifyProof,
  upgradeProof,
} from "@/lib/crypto/otsFormatAndClient";
import { isAirGapLocked } from "@/lib/security/airGapGuard";
import { triggerSovereignDownload } from "@/lib/datasets/massiveDatasetEngine";
import { Eli5ConceptPopover } from "@/components/Eli5ConceptPopover";

export function OtsReceiptVerifierWidget({
  expectedMerkleRootHex,
  reportLabel = "Active Civic Audit",
}: {
  expectedMerkleRootHex: string;
  reportLabel?: string;
}) {
  const [statusMessage, setStatusMessage] = useState<string | null>(null);
  const [verifiedState, setVerifiedState] = useState<"idle" | "valid" | "warning">("idle");
  const [parsedDetails, setParsedDetails] = useState<{
    digestHex: string;
    status: string;
    blockHeight?: number;
    calendars: string[];
  } | null>(null);
  const [lastBytes, setLastBytes] = useState<Uint8Array | null>(null);

  const inspectOtsBytes = async (bytes: Uint8Array, sourceLabel: string) => {
    const check = await verifyProof(bytes, expectedMerkleRootHex, {
      allowLiveBlockCheck: !isAirGapLocked(),
    });
    setLastBytes(bytes);
    setParsedDetails({
      digestHex: check.digestHex,
      status: check.calendarStatus,
      blockHeight: check.blockHeight,
      calendars: check.pendingCalendars,
    });
    if (check.valid) {
      setVerifiedState("valid");
      setStatusMessage(`${sourceLabel}: ${check.calendarStatus}`);
    } else {
      setVerifiedState("warning");
      setStatusMessage(`${sourceLabel}: ${check.calendarStatus}`);
    }
  };

  const handleFile = async (file: File) => {
    const buf = new Uint8Array(await file.arrayBuffer());
    await inspectOtsBytes(buf, file.name);
  };

  const handleDownloadSampleOts = async () => {
    const bytes = buildOtsFile(expectedMerkleRootHex);
    setLastBytes(bytes);
    await inspectOtsBytes(bytes, "Generated .ots Receipt");
    await triggerSovereignDownload({
      filename: `marigold-${expectedMerkleRootHex.slice(0, 12)}.ots`,
      content: bytes,
      mimeType: "application/octet-stream",
    });
  };

  const handleSelfTest = async () => {
    const bytes = buildOtsFile(expectedMerkleRootHex);
    await inspectOtsBytes(bytes, "In-Browser Op-Tree Self-Verify");
  };

  const handleAttemptUpgrade = async () => {
    if (!lastBytes) return;
    const res = await upgradeProof(lastBytes);
    if (res.airGapBlocked) {
      setVerifiedState("warning");
      setStatusMessage(
        "Air-Gap Lock is enabled: local .ots structure & SHA-256 commitment verified offline. Temporarily unlock Air-Gap to query live Bitcoin OpenTimestamps calendars."
      );
      return;
    }
    if (res.upgraded) {
      setLastBytes(res.bytes);
      await inspectOtsBytes(res.bytes, "Bitcoin Block Attestation Upgraded");
    } else {
      setStatusMessage("Calendar still pending Bitcoin confirmation — local SHA-256 op-tree remains valid.");
    }
  };

  return (
    <div
      onDragOver={(e) => e.preventDefault()}
      onDrop={(e) => {
        e.preventDefault();
        const file = e.dataTransfer.files?.[0];
        if (file) handleFile(file);
      }}
      className="rounded-2xl border-2 border-[#111111] bg-white p-6 space-y-4 shadow-xs"
    >
      <div className="flex flex-wrap items-center justify-between gap-3 border-b border-[#DDD6CA] pb-3">
        <div className="flex items-center gap-2.5 flex-wrap">
          <ShieldCheck className="h-5 w-5 text-[#B45309]" />
          <h3 className="font-serif text-xl font-bold text-[#111111]">
            OpenTimestamps (.ots) Binary Verifier
          </h3>
          <Eli5ConceptPopover concept="OpenTimestamps" />
        </div>
        <span className="font-mono text-xs font-bold uppercase tracking-wider text-[#5A534A]">
          {reportLabel}
        </span>
      </div>

      <div className="rounded-xl border border-[#DDD6CA] bg-[#FAF8F5] p-3.5 text-xs space-y-1">
        <div className="font-mono font-bold uppercase tracking-wider text-[#5A534A]">
          Expected Canonical SHA-256 Digest
        </div>
        <div className="font-mono break-all text-[#111111] select-all">
          {expectedMerkleRootHex}
        </div>
      </div>

      <div className="flex flex-wrap items-center gap-2.5">
        <label className="inline-flex h-10 items-center gap-2 rounded-xl border border-[#111111] bg-[#FAF8F5] hover:bg-[#F2ECE1] px-4 text-xs font-bold text-[#111111] cursor-pointer">
          <Upload className="h-3.5 w-3.5 text-[#B45309]" />
          <span>Verify Uploaded .ots File</span>
          <input
            type="file"
            accept=".ots"
            className="hidden"
            onChange={(e) => {
              const f = e.target.files?.[0];
              if (f) handleFile(f);
            }}
          />
        </label>

        <button
          type="button"
          onClick={handleSelfTest}
          className="inline-flex h-10 items-center gap-2 rounded-xl bg-[#111111] hover:bg-[#292524] text-white px-4 text-xs font-bold cursor-pointer"
        >
          <Cpu className="h-3.5 w-3.5 text-[#F59E0B]" />
          <span>Verify Local Commitment</span>
        </button>

        <button
          type="button"
          onClick={handleDownloadSampleOts}
          className="inline-flex h-10 items-center gap-2 rounded-xl bg-[#B45309] hover:bg-[#92400E] text-white px-4 text-xs font-bold cursor-pointer"
        >
          <Download className="h-3.5 w-3.5" />
          <span>Download .ots Receipt</span>
        </button>

        {lastBytes && (
          <button
            type="button"
            onClick={handleAttemptUpgrade}
            className="inline-flex h-10 items-center gap-1.5 rounded-xl border border-[#D6D0C4] bg-white hover:bg-[#FAF8F5] px-3.5 text-xs font-bold text-[#44403C] cursor-pointer"
          >
            Check Bitcoin Upgrade
          </button>
        )}
      </div>

      {statusMessage && (
        <div
          className={`rounded-xl border p-3.5 text-xs space-y-1.5 ${
            verifiedState === "valid"
              ? "border-emerald-300 bg-emerald-50 text-emerald-950"
              : "border-[#F59E0B] bg-[#FEF3C7] text-[#78350F]"
          }`}
        >
          <div className="flex items-center gap-2 font-bold">
            {verifiedState === "valid" ? (
              <CheckCircle2 className="h-4 w-4 text-emerald-700 shrink-0" />
            ) : (
              <AlertTriangle className="h-4 w-4 text-[#B45309] shrink-0" />
            )}
            <span>{statusMessage}</span>
          </div>
          {parsedDetails && (
            <div className="font-mono text-[11px] opacity-90 space-y-0.5 pl-6">
              <div>Proof Digest: {parsedDetails.digestHex || "—"}</div>
              {parsedDetails.blockHeight ? (
                <div>Bitcoin Block Height: #{parsedDetails.blockHeight.toLocaleString()}</div>
              ) : parsedDetails.calendars.length > 0 ? (
                <div>Calendar Attestation: {parsedDetails.calendars.join(", ")}</div>
              ) : null}
            </div>
          )}
        </div>
      )}
    </div>
  );
}
