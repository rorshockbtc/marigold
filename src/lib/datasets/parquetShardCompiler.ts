import { z } from "zod";
import { sha256Hex } from "@/lib/crypto/merkleDagAndOtsBridge";
import {
  getDirectoryOrOPFSHandle,
  readStructuredFile,
  storeFileHandle,
  writeStructuredFile,
} from "@/lib/fs/LocalFSManager";
import { getDuckDB, registerFileInDuckDB } from "@/lib/db/duckdbManager";

export const MARIGOLD_PARQUET_SHARD_ROWS = 250_000;
export const MARIGOLD_PREVIEW_SAMPLE_ROWS = 1_000;

export const ColumnPrimitiveSchema = z.enum([
  "identifier",
  "categorical",
  "measurement",
  "temporal",
  "location",
]);
export type ColumnPrimitive = z.infer<typeof ColumnPrimitiveSchema>;

export const ColumnSpecSchema = z.object({
  name: z.string().min(1),
  normalizedName: z.string().min(1),
  primitive: ColumnPrimitiveSchema,
  nullable: z.boolean(),
  piiRedacted: z.boolean(),
  description: z.string().min(1),
});
export type ColumnSpec = z.infer<typeof ColumnSpecSchema>;

export const ParquetVaultShardSchema = z.object({
  index: z.number().int().min(0),
  filename: z.string().min(1),
  rowCount: z.number().int().min(0),
  byteSize: z.number().int().min(0),
  sha256: z.string().min(64).max(64),
  format: z.enum(["parquet-zstd", "json-columnar-fallback"]).default("parquet-zstd"),
});
export type ParquetVaultShard = z.infer<typeof ParquetVaultShardSchema>;

export const ParquetVaultManifestSchema = z.object({
  schema: z.literal("marigold.parquet.vault.v1"),
  datasetSlug: z.string().min(1),
  title: z.string().min(1),
  createdAt: z.string().min(1),
  rowCount: z.number().int().min(0),
  shardMaxRows: z.number().int().min(1).default(MARIGOLD_PARQUET_SHARD_ROWS),
  columns: z.array(ColumnSpecSchema),
  shards: z.array(ParquetVaultShardSchema),
  merkleRoot: z.string().min(64).max(64),
  previewFilename: z.literal("sample_preview_1k.json"),
});
export type ParquetVaultManifest = z.infer<typeof ParquetVaultManifestSchema>;

const PII_NAME_OR_DIRECT_PATTERNS = [
  /first_?name/i,
  /last_?name/i,
  /middle_?name/i,
  /full_?name/i,
  /^name$/i,
  /voter_?id/i,
  /vuid/i,
  /ncid/i,
  /ssn/i,
  /driver/i,
  /dob/i,
  /birth_?date/i,
  /date_?of_?birth/i,
  /res_?address/i,
  /residential_?address/i,
  /mail_?addr/i,
  /^address$/i,
  /house_?num/i,
  /street_?name/i,
  /phone/i,
  /email/i,
];

function isNumericSample(values: unknown[]): boolean {
  const nonEmpty = values.filter((v) => v !== null && v !== undefined && String(v).trim() !== "");
  if (nonEmpty.length === 0) return false;
  let numericCount = 0;
  for (const v of nonEmpty) {
    if (typeof v === "number" && Number.isFinite(v)) {
      numericCount++;
    } else if (!Number.isNaN(Number(String(v).replace(/,/g, "")))) {
      numericCount++;
    }
  }
  return numericCount / nonEmpty.length >= 0.8;
}

/**
 * Classifies voter roll & civic table headers into Pipes' 5-Primitive Column Ontology
 * (`identifier`, `temporal`, `location`, `measurement`, `categorical`) and marks
 * direct personal identifiers as `piiRedacted: true` for Zero-PII preview exports.
 */
export function inferColumnOntologyFromHeaders(
  headers: string[],
  sampleRows: Array<Record<string, unknown>> = []
): ColumnSpec[] {
  return headers
    .filter((h) => Boolean(h && h.trim().length > 0))
    .map((rawName) => {
      const name = rawName.trim();
      const lower = name.toLowerCase();
      const normalizedName = lower.replace(/[^a-z0-9]+/g, "_").replace(/^_|_$/g, "") || "col";
      const colSamples = sampleRows.slice(0, 50).map((r) => r[name] ?? r[rawName]);
      const hasNulls = colSamples.some((v) => v === null || v === undefined || String(v).trim() === "");
      const piiRedacted = PII_NAME_OR_DIRECT_PATTERNS.some((rx) => rx.test(name));

      let primitive: ColumnPrimitive = "categorical";
      let description = "Categorical attribute";

      if (/(^id$|voter_?id|vuid|ncid|reg_?num|state_?id|sos_?id|file_?id)/i.test(lower)) {
        primitive = "identifier";
        description = "Unique registration identifier";
      } else if (/(date|dob|birth|voted|year|month|timestamp|created_at|updated_at|regn)/i.test(lower)) {
        primitive = "temporal";
        description = "Chronological registration, age cohort, or ballot history timestamp";
      } else if (
        /(county|city|state|zip|precinct|pct|ward|cong|sen|rep|sup|supr|district|address|addr|street|house_num|mail_state|jurisdiction)/i.test(
          lower
        )
      ) {
        primitive = "location";
        description = "Jurisdictional geography, precinct, district, or address component";
      } else if (
        /(count|total|score|age|amount|ballots|voters|pct_val|rate|threshold)/i.test(lower) ||
        isNumericSample(colSamples)
      ) {
        primitive = "measurement";
        description = "Quantitative civic or statistical measurement";
      }

      return ColumnSpecSchema.parse({
        name,
        normalizedName,
        primitive,
        nullable: hasNulls || sampleRows.length === 0,
        piiRedacted,
        description,
      });
    });
}

/**
 * Computes a deterministic pairwise SHA-256 Merkle root over binary shard hashes.
 */
export async function computeDatasetMerkleRoot(shardHashesHex: string[]): Promise<string> {
  if (!shardHashesHex || shardHashesHex.length === 0) {
    return sha256Hex("marigold-empty-dataset");
  }
  let level = [...shardHashesHex].map((h) => h.toLowerCase().trim()).sort();
  while (level.length > 1) {
    const next: string[] = [];
    for (let i = 0; i < level.length; i += 2) {
      if (i + 1 < level.length) {
        next.push(await sha256Hex(level[i] + level[i + 1]));
      } else {
        next.push(await sha256Hex(level[i] + level[i]));
      }
    }
    level = next;
  }
  return level[0];
}

/**
 * Creates a strictly Zero-PII 1,000-row preview sample suitable for instant `<1.5s` UI hydration.
 */
export function buildZeroPiiSamplePreview(
  rows: Array<Record<string, unknown>>,
  columns: ColumnSpec[]
): Array<Record<string, unknown>> {
  const redactedSet = new Set(columns.filter((c) => c.piiRedacted).map((c) => c.name));
  return rows.slice(0, MARIGOLD_PREVIEW_SAMPLE_ROWS).map((row) => {
    const safeRow: Record<string, unknown> = {};
    for (const key of Object.keys(row)) {
      if (redactedSet.has(key) || PII_NAME_OR_DIRECT_PATTERNS.some((rx) => rx.test(key))) {
        safeRow[key] = "[REDACTED-LOCAL-ONLY]";
      } else {
        safeRow[key] = row[key];
      }
    }
    return safeRow;
  });
}

function sanitizeSlug(raw: string): string {
  return raw.toLowerCase().replace(/[^a-z0-9]+/g, "_").replace(/^_|_$/g, "") || "default";
}

/**
 * Compiles rows currently in Marigold's active workspace into ZSTD-compressed Parquet shards
 * (250k rows/shard), infers the 5-primitive column ontology, writes a Zero-PII 1k preview JSON,
 * and saves the Merkle-verified manifest into Sovereign Storage (`Marigold_Local/Uploaded_Data`).
 */
export async function compileActiveDatasetToParquetVault(options?: {
  groupId?: string;
  onProgress?: (pct: number, stage: string) => void;
}): Promise<{
  manifest: ParquetVaultManifest;
  elapsedMs: number;
  shardCount: number;
  totalRows: number;
}> {
  const start = typeof performance !== "undefined" ? performance.now() : Date.now();
  const activeGroup =
    options?.groupId ||
    (typeof window !== "undefined" ? localStorage.getItem("marigold_active_group") : null) ||
    "default";
  const slug = sanitizeSlug(activeGroup);
  const datasetTitle =
    (typeof window !== "undefined" ? localStorage.getItem("marigold_file_name") : null) ||
    `${activeGroup}_voter_roll`;

  options?.onProgress?.(5, "Fetching normalized rows from local storage...");
  const { MarigoldDataEngineService } = await import("@/lib/services/MarigoldDataEngineService");
  const totalCount = await MarigoldDataEngineService.getTotalRowCount(activeGroup);

  const rootHandle = await getDirectoryOrOPFSHandle(slug);
  const shardMeta: ParquetVaultShard[] = [];
  let columns: ColumnSpec[] = [];
  let previewRows: Array<Record<string, unknown>> = [];
  let offset = 0;
  let shardIdx = 0;
  const maxBatch = Math.min(MARIGOLD_PARQUET_SHARD_ROWS, 50_000);

  if (totalCount === 0) {
    const emptyBytes = new TextEncoder().encode("[]");
    const emptyHash = await sha256Hex(emptyBytes);
    await writeStructuredFile(rootHandle, "Uploaded_Data", "sample_preview_1k.json", "[]");
    const manifest: ParquetVaultManifest = ParquetVaultManifestSchema.parse({
      schema: "marigold.parquet.vault.v1",
      datasetSlug: slug,
      title: datasetTitle,
      createdAt: new Date().toISOString(),
      rowCount: 0,
      shardMaxRows: MARIGOLD_PARQUET_SHARD_ROWS,
      columns: [],
      shards: [
        {
          index: 0,
          filename: "shard_000.parquet",
          rowCount: 0,
          byteSize: emptyBytes.byteLength,
          sha256: emptyHash,
          format: "json-columnar-fallback",
        },
      ],
      merkleRoot: await computeDatasetMerkleRoot([emptyHash]),
      previewFilename: "sample_preview_1k.json",
    });
    await writeStructuredFile(
      rootHandle,
      "Uploaded_Data",
      "_parquet_vault_manifest.json",
      JSON.stringify(manifest, null, 2)
    );
    const elapsedMs = Math.round((typeof performance !== "undefined" ? performance.now() : Date.now()) - start);
    return { manifest, elapsedMs, shardCount: 1, totalRows: 0 };
  }

  let accumRows: Array<Record<string, unknown>> = [];

  const flushShard = async (rowsBatch: Array<Record<string, unknown>>, idx: number) => {
    const shardBaseName = `shard_${String(idx).padStart(3, "0")}`;
    let binaryBytes: Uint8Array;
    let filename = `${shardBaseName}.parquet`;
    let format: "parquet-zstd" | "json-columnar-fallback" = "parquet-zstd";

    try {
      const { db, conn } = await getDuckDB();
      const tmpJson = `${shardBaseName}.json`;
      await db.registerFileText(tmpJson, JSON.stringify(rowsBatch));
      await conn.query(
        `CREATE OR REPLACE TEMP TABLE tmp_${shardBaseName} AS SELECT * FROM read_json_auto('${tmpJson}');`
      );
      await conn.query(
        `COPY tmp_${shardBaseName} TO '${filename}' (FORMAT PARQUET, COMPRESSION ZSTD);`
      );
      binaryBytes = await db.copyFileToBuffer(filename);
      await conn.query(`DROP TABLE IF EXISTS tmp_${shardBaseName};`);
    } catch {
      // Deterministic browser fallback if DuckDB WASM COPY TO buffer is unavailable
      format = "json-columnar-fallback";
      filename = `${shardBaseName}.vault.json`;
      binaryBytes = new TextEncoder().encode(JSON.stringify(rowsBatch));
    }

    const digest = await sha256Hex(binaryBytes);
    await writeStructuredFile(rootHandle, "Uploaded_Data", filename, binaryBytes);
    shardMeta.push(
      ParquetVaultShardSchema.parse({
        index: idx,
        filename,
        rowCount: rowsBatch.length,
        byteSize: binaryBytes.byteLength,
        sha256: digest,
        format,
      })
    );
  };

  while (offset < totalCount) {
    const res = await MarigoldDataEngineService.queryData("", [], maxBatch, offset, activeGroup);
    if (!res.rows || res.rows.length === 0) break;

    if (columns.length === 0 && res.rows.length > 0) {
      columns = inferColumnOntologyFromHeaders(Object.keys(res.rows[0]), res.rows.slice(0, 100));
      previewRows = buildZeroPiiSamplePreview(res.rows, columns);
    }

    accumRows.push(...res.rows);
    offset += res.rows.length;

    if (accumRows.length >= MARIGOLD_PARQUET_SHARD_ROWS || offset >= totalCount) {
      const pct = Math.min(90, Math.round((offset / totalCount) * 85) + 10);
      options?.onProgress?.(pct, `Compressing Zstd Parquet shard #${shardIdx + 1}...`);
      await flushShard(accumRows, shardIdx);
      shardIdx++;
      accumRows = [];
    }
  }

  if (accumRows.length > 0) {
    await flushShard(accumRows, shardIdx);
  }

  options?.onProgress?.(95, "Writing Zero-PII 1k preview & Merkle-DAG vault manifest...");
  await writeStructuredFile(
    rootHandle,
    "Uploaded_Data",
    "sample_preview_1k.json",
    JSON.stringify(previewRows, null, 2)
  );

  const merkleRoot = await computeDatasetMerkleRoot(shardMeta.map((s) => s.sha256));
  const manifest = ParquetVaultManifestSchema.parse({
    schema: "marigold.parquet.vault.v1",
    datasetSlug: slug,
    title: datasetTitle,
    createdAt: new Date().toISOString(),
    rowCount: totalCount,
    shardMaxRows: MARIGOLD_PARQUET_SHARD_ROWS,
    columns,
    shards: shardMeta,
    merkleRoot,
    previewFilename: "sample_preview_1k.json",
  });

  await writeStructuredFile(
    rootHandle,
    "Uploaded_Data",
    "_parquet_vault_manifest.json",
    JSON.stringify(manifest, null, 2)
  );

  if (typeof window !== "undefined") {
    localStorage.setItem("marigold_parquet_vault_merkle", merkleRoot);
    localStorage.setItem("marigold_parquet_vault_rows", String(totalCount));
  }

  options?.onProgress?.(100, "Zstd Parquet Vault compiled locally.");
  const elapsedMs = Math.round((typeof performance !== "undefined" ? performance.now() : Date.now()) - start);
  return {
    manifest,
    elapsedMs,
    shardCount: shardMeta.length,
    totalRows: totalCount,
  };
}

/**
 * Mounts an existing Zstd Parquet Vault (`_parquet_vault_manifest.json`) in `< 1.5s`
 * without re-parsing raw CSV text.
 */
export async function fastMountParquetVault(
  dirHandle?: FileSystemDirectoryHandle | null,
  groupId?: string
): Promise<{
  mounted: boolean;
  totalRows: number;
  shardCount: number;
  elapsedMs: number;
  manifest?: ParquetVaultManifest;
  previewRows: Array<Record<string, unknown>>;
}> {
  const start = typeof performance !== "undefined" ? performance.now() : Date.now();
  const activeGroup =
    groupId ||
    (typeof window !== "undefined" ? localStorage.getItem("marigold_active_group") : null) ||
    "default";
  const slug = sanitizeSlug(activeGroup);
  const resolvedRoot = dirHandle || (await getDirectoryOrOPFSHandle(slug));

  const rawManifest = await readStructuredFile(
    resolvedRoot,
    "Uploaded_Data",
    "_parquet_vault_manifest.json"
  );
  if (!rawManifest) {
    return { mounted: false, totalRows: 0, shardCount: 0, elapsedMs: 0, previewRows: [] };
  }

  let parsedManifest: ParquetVaultManifest;
  try {
    const validated = ParquetVaultManifestSchema.safeParse(JSON.parse(rawManifest));
    if (!validated.success) {
      return { mounted: false, totalRows: 0, shardCount: 0, elapsedMs: 0, previewRows: [] };
    }
    parsedManifest = validated.data;
  } catch {
    return { mounted: false, totalRows: 0, shardCount: 0, elapsedMs: 0, previewRows: [] };
  }

  let previewRows: Array<Record<string, unknown>> = [];
  try {
    const rawPreview = await readStructuredFile(
      resolvedRoot,
      "Uploaded_Data",
      parsedManifest.previewFilename
    );
    if (rawPreview) {
      const parsedPreview = JSON.parse(rawPreview);
      if (Array.isArray(parsedPreview)) previewRows = parsedPreview;
    }
  } catch {
    previewRows = [];
  }

  // Register `.parquet` shard buffers directly into DuckDB WASM when in browser
  if (resolvedRoot && parsedManifest.shards.some((s) => s.format === "parquet-zstd")) {
    try {
      const uploadedDir = await resolvedRoot.getDirectoryHandle("Uploaded_Data", { create: false });
      const registeredParquetNames: string[] = [];
      for (const shard of parsedManifest.shards) {
        if (shard.format !== "parquet-zstd") continue;
        try {
          const fh = await uploadedDir.getFileHandle(shard.filename, { create: false });
          if (shard.index === 0) {
            await storeFileHandle(slug, fh);
          }
          const file = await fh.getFile();
          const buf = new Uint8Array(await file.arrayBuffer());
          await registerFileInDuckDB(shard.filename, buf);
          registeredParquetNames.push(`'${shard.filename}'`);
        } catch {
          // Continue registering remaining shards
        }
      }
      if (registeredParquetNames.length > 0) {
        const { conn } = await getDuckDB();
        await conn.query(
          `CREATE OR REPLACE VIEW voter_roll AS SELECT * FROM read_parquet([${registeredParquetNames.join(", ")}]);`
        );
      }
    } catch {
      // Non-fatal in environments without DuckDB worker
    }
  }

  const elapsedMs = Math.max(
    1,
    Math.round((typeof performance !== "undefined" ? performance.now() : Date.now()) - start)
  );

  if (typeof window !== "undefined") {
    localStorage.setItem("marigold_file_connected", "true");
    localStorage.setItem("marigold_file_name", parsedManifest.title);
    localStorage.setItem("marigold_file_rows", String(parsedManifest.rowCount));
    localStorage.setItem("marigold_parquet_fast_mount_ms", String(elapsedMs));
    localStorage.setItem("marigold_parquet_vault_merkle", parsedManifest.merkleRoot);
    window.dispatchEvent(new CustomEvent("marigold-data-connected"));
  }

  return {
    mounted: true,
    totalRows: parsedManifest.rowCount,
    shardCount: parsedManifest.shards.length,
    elapsedMs,
    manifest: parsedManifest,
    previewRows,
  };
}
