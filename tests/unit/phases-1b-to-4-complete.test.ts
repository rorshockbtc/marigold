import { describe, expect, it, afterEach } from "vitest";
import {
  inferColumnOntologyFromHeaders,
  buildZeroPiiSamplePreview,
  computeDatasetMerkleRoot,
} from "@/lib/datasets/parquetShardCompiler";
import {
  aggregateDynamicCountySummaries,
  buildOnePageCountyBriefHtml,
} from "@/lib/data/dynamicCountyAggregator";
import {
  buildOtsFile,
  isOtsFile,
  parseOts,
  proofStatus,
  graftFragment,
  writeVaruint,
  writeVarbytes,
  OTS_MAGIC,
  OP_SHA256,
  OP_APPEND,
  TAG_ATTESTATION,
  TAG_BITCOIN,
} from "@/lib/crypto/otsFormatAndClient";
import {
  buildDefaultMarigoldCivicCorpus,
  buildLocalBM25CorpusIndex,
  queryLocalBM25Corpus,
  withTapOutLoopGuard,
} from "@/lib/ai/localCorpusSearch";
import { buildCountySpokenScript } from "@/hooks/useCountyAudioBriefing";
import { buildStandaloneOfflineDossierHtml } from "@/lib/datasets/standaloneOfflineHtmlBundle";
import {
  buildEncryptedCoalitionEvent,
  decryptCoalitionEvent,
  publishCoalitionEvent,
} from "@/lib/relay/nostrCoalitionSync";
import { setAirGapLocked } from "@/lib/security/airGapGuard";

afterEach(() => {
  setAirGapLocked(false);
});

describe("Phase 1B: 5-Primitive Column Ontology, Zero-PII 1k Preview & Merkle Root", () => {
  it("classifies civic voter headers into 5 primitives and flags PII redaction correctly", () => {
    const headers = [
      "voter_id",
      "first_name",
      "last_name",
      "dob",
      "res_address",
      "county",
      "precinct_code",
      "reg_date",
      "status",
      "ballots_cast",
    ];
    const specs = inferColumnOntologyFromHeaders(headers, [
      {
        voter_id: "MS12345",
        first_name: "Ada",
        last_name: "Lovelace",
        dob: "1985-04-12",
        res_address: "101 Main St",
        county: "Hinds",
        precinct_code: "042",
        reg_date: "2020-09-15",
        status: "ACTIVE",
        ballots_cast: 5,
      },
    ]);

    const byName = Object.fromEntries(specs.map((s) => [s.name, s]));
    expect(byName.voter_id.primitive).toBe("identifier");
    expect(byName.voter_id.piiRedacted).toBe(true);
    expect(byName.first_name.primitive).toBe("categorical");
    expect(byName.first_name.piiRedacted).toBe(true);
    expect(byName.res_address.primitive).toBe("location");
    expect(byName.res_address.piiRedacted).toBe(true);
    expect(byName.county.primitive).toBe("location");
    expect(byName.county.piiRedacted).toBe(false);
    expect(byName.dob.primitive).toBe("temporal");
    expect(byName.dob.piiRedacted).toBe(true);
    expect(byName.reg_date.primitive).toBe("temporal");
    expect(byName.ballots_cast.primitive).toBe("measurement");
  });

  it("masks personal columns in Zero-PII preview sample while keeping county & status intact", () => {
    const specs = inferColumnOntologyFromHeaders([
      "voter_id",
      "first_name",
      "res_address",
      "county",
      "status",
    ]);
    const preview = buildZeroPiiSamplePreview(
      [
        {
          voter_id: "998877",
          first_name: "Grace",
          res_address: "412 Oak Ave",
          county: "Wake",
          status: "ACTIVE",
        },
      ],
      specs
    );
    expect(preview[0].voter_id).toBe("[REDACTED-LOCAL-ONLY]");
    expect(preview[0].first_name).toBe("[REDACTED-LOCAL-ONLY]");
    expect(preview[0].res_address).toBe("[REDACTED-LOCAL-ONLY]");
    expect(preview[0].county).toBe("Wake");
    expect(preview[0].status).toBe("ACTIVE");
  });

  it("computes deterministic 64-hex SHA-256 dataset Merkle root", async () => {
    const h1 = "a".repeat(64);
    const h2 = "b".repeat(64);
    const root1 = await computeDatasetMerkleRoot([h1, h2]);
    const root2 = await computeDatasetMerkleRoot([h2, h1]);
    expect(root1).toMatch(/^[0-9a-f]{64}$/);
    expect(root1).toBe(root2);
  });
});

describe("Phase 2B: Dynamic County Reviewer & 1-Page County PDF HTML", () => {
  it("aggregates multi-county playbooks into explicit-noun summaries and generates zero-red 1-page HTML", () => {
    const counties = aggregateDynamicCountySummaries({
      totalRows: 12000,
      stateCode: "NC",
      anomalyRecords: {
        density: [
          { county: "Wake", address: "100 Campus Way", occupant_count: 14 },
          { county: "Wake", address: "200 Oak St", occupant_count: 10 },
          { county: "Mecklenburg", address: "55 Elm Rd", occupant_count: 9 },
        ],
        "out-of-state-mailing": [
          { county: "Wake", id: "1" },
          { county: "Wake", id: "2" },
        ],
        "nvra-reconciliation": [
          { county: "Wake", details: "Inactive voter voted in 2024" },
        ],
      },
      sampleRows: [
        { county: "Wake", status: "ACTIVE", date_registered: "2026-02-01" },
        { county: "Wake", status: "ACTIVE", date_registered: "2024-03-01" },
        { county: "Wake", status: "INACTIVE", date_registered: "2018-01-01" },
        { county: "Mecklenburg", status: "ACTIVE", date_registered: "2023-05-12" },
      ],
    });

    expect(counties.length).toBe(2);
    const wake = counties.find((c) => c.county === "Wake")!;
    expect(wake.highDensityCount).toBe(2);
    expect(wake.highDensityVoters).toBe(24);
    expect(wake.ncoaCount).toBe(2);
    expect(wake.inactiveVotedRecent).toBe(1);
    expect(wake.priorityScore).toBeGreaterThanOrEqual(0);
    expect(wake.priorityScore).toBeLessThanOrEqual(100);
    expect(wake.cleanlinessScore).toBeGreaterThanOrEqual(0);
    expect(wake.cleanlinessScore).toBeLessThanOrEqual(100);
    expect(wake.plainEnglishSummary).toContain("Wake County spans");

    const pdfHtml = buildOnePageCountyBriefHtml(wake, {
      stateCode: "NC",
      totalDatasetRows: 12000,
    });
    expect(pdfHtml).toContain("Wake County, North Carolina");
    expect(pdfHtml).toContain("County Boards of Elections");
    expect(pdfHtml).not.toContain("#dc2626");
    expect(pdfHtml).not.toContain("bg-red");
    expect(pdfHtml).not.toContain("bg-rose");
  });
});

describe("Phase 3B: Binary .ots Op-Tree Parser, BM25 Corpus Search & Tap-Out Loop Guard", () => {
  it("builds, parses, checks status, and grafts binary .ots proofs including Bitcoin block leaves", () => {
    const digestHex = "3f".repeat(32);
    const ots = buildOtsFile(digestHex);
    expect(isOtsFile(ots)).toBe(true);

    const parsed = parseOts(ots);
    expect(parsed.fileDigestHex).toBe(digestHex);
    expect(parsed.leaves.length).toBe(1);
    expect(parsed.leaves[0].type).toBe("pending");

    const status = proofStatus(ots);
    expect(status.status).toBe("pending");
    expect(status.digestHex).toBe(digestHex);

    // Construct a synthetic calendar fragment: APPEND(0x01,0x02) -> OP_SHA256 -> TAG_ATTESTATION(TAG_BITCOIN, height 890123)
    const concat = (parts: Uint8Array[]) => {
      const out = new Uint8Array(parts.reduce((s, p) => s + p.length, 0));
      let off = 0;
      for (const p of parts) {
        out.set(p, off);
        off += p.length;
      }
      return out;
    };
    const appendArg = new Uint8Array([0x01, 0x02]);
    const bitcoinFragment = concat([
      new Uint8Array([OP_APPEND]),
      writeVarbytes(appendArg),
      new Uint8Array([OP_SHA256]),
      new Uint8Array([TAG_ATTESTATION]),
      TAG_BITCOIN,
      writeVarbytes(writeVaruint(890123)),
    ]);

    const grafted = graftFragment(ots, digestHex, bitcoinFragment);
    const upgradedStatus = proofStatus(grafted);
    expect(upgradedStatus.status).toBe("complete");
    expect(upgradedStatus.blockHeight).toBe(890123);
    expect(upgradedStatus.opCount).toBe(2);
  });

  it("retrieves relevant civic playbooks via offline BM25 and halts at 2-iteration Tap-Out Guard", async () => {
    const index = buildLocalBM25CorpusIndex(buildDefaultMarigoldCivicCorpus());
    const benfordHits = queryLocalBM25Corpus(index, "Benford law leading digit precinct capacity", 3);
    expect(benfordHits[0].doc.id).toBe("playbook-benford");

    const nvraHits = queryLocalBM25Corpus(index, "inactive voters who voted recently NVRA protection", 3);
    expect(nvraHits[0].doc.id).toBe("playbook-nvra");

    const guarded = await withTapOutLoopGuard(
      async (iter) => ({ done: false, value: `attempt-${iter}` }),
      {
        maxIterations: 2,
        onTapOut: (last, iters) => `tapped-out-at-${iters}:${last}`,
      }
    );
    expect(guarded.tappedOut).toBe(true);
    expect(guarded.iterations).toBe(2);
    expect(guarded.result).toBe("tapped-out-at-2:attempt-2");
  });
});

describe("Phase 4: Audio Briefings, Standalone Offline .html Bundle & Nostr Encrypted Sync", () => {
  it("builds a Zero-PII 90-second county audio briefing script with explicit nouns", () => {
    const script = buildCountySpokenScript({
      county: "Hinds",
      stateName: "Mississippi",
      authorityLabel: "County Election Commissioners",
      total: 173149,
      active: 165189,
      inactive: 7960,
      priorityScore: 67.6,
      cleanlinessScore: 83,
      statusLabel: "Needs attention in all 3 areas",
      highDensityCount: 431,
      highDensityVoters: 7826,
      ncoaCount: 355,
      duplicateCount: 95,
      overCapacityPrecincts: 8,
      splitPrecincts: 12,
      inactiveVotedRecent: 140,
    });
    expect(script).toContain("Hinds County, Mississippi");
    expect(script).toContain("173,149 total registered voters");
    expect(script).toContain("Zero voter names");
    const wordCount = script.split(/\s+/).length;
    expect(wordCount).toBeGreaterThan(95);
    expect(wordCount).toBeLessThan(280);
  });

  it("compiles a tamper-evident offline .html bundle and blocks PII leaks via civicPiiGuard", async () => {
    const res = await buildStandaloneOfflineDossierHtml({
      title: "Hinds County Public Audit",
      subtitle: "Zero-PII Civic Briefing",
      jurisdictionName: "Hinds County",
      stateCode: "MS",
      totalRecords: 173149,
      cleanlinessScore: 83,
      summaryParagraphs: ["Every ballot traced cleanly with 431 high-density sites checked."],
      metrics: [{ label: "Registered Voters", valueWithUnit: "173,149 voters" }],
    });

    expect(res.merkleHashHex).toMatch(/^[0-9a-f]{64}$/);
    expect(res.html).toContain("Verify SHA-256 Proof Offline");
    expect(res.html).toContain(res.merkleHashHex);

    await expect(
      buildStandaloneOfflineDossierHtml({
        title: "Unsafe Export",
        subtitle: "PII Leak Attempt",
        jurisdictionName: "Hinds",
        stateCode: "MS",
        totalRecords: 10,
        cleanlinessScore: 90,
        summaryParagraphs: ["Voter SSN 123-45-6789 leaked here"],
        metrics: [],
      })
    ).rejects.toThrow();
  });

  it("encrypts/decrypts coalition events with AES-256-GCM and enforces Air-Gap Lock without opening WebSockets", async () => {
    const payload = JSON.stringify({ county: "Hinds", verifiedCleanliness: 83 });
    const event = await buildEncryptedCoalitionEvent({
      groupSlug: "ms_coalition",
      passphrase: "test-passphrase-2026",
      payloadType: "COUNTY_SCORECARD",
      plaintextJson: payload,
      authorAlias: "Auditor A",
    });

    expect(event.id).toMatch(/^[0-9a-f]{64}$/);
    expect(event.kind).toBe(30023);
    expect(event.content).not.toContain("Hinds");

    const decrypted = await decryptCoalitionEvent(event, "ms_coalition", "test-passphrase-2026");
    expect(decrypted).toBe(payload);

    setAirGapLocked(true);
    const publishRes = await publishCoalitionEvent(event);
    expect(publishRes.delivered).toBe(false);
    expect(publishRes.queuedOffline).toBe(true);
    expect(publishRes.reason).toBe("air-gap-locked");
  });
});
