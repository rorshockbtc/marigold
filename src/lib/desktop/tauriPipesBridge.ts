/**
 * Bridge between marigoldinsights.org web UI and the Pipes.app (Tauri v2)
 * Marigold Data & Civic Studio native module.
 *
 * When running inside Pipes.app (`__TAURI_INTERNALS__` or `__TAURI__`), massive
 * 4GB+ `.zip`, `.txt`, `.tsv`, and `.csv` civic archives can stream out-of-core
 * through native Rust (`BufReader` + system `unzip -p`/`tar -xOf`) in O(1) RAM,
 * completely bypassing the 4GB `wasm32` address ceiling.
 */

export const LARGE_ZIP_DESKTOP_RECOMMEND_BYTES = 350 * 1024 * 1024; // 350 MB zipped -> ~1.5-4.5 GB uncompressed
export const LARGE_RAW_DESKTOP_RECOMMEND_BYTES = 900 * 1024 * 1024; // 900 MB raw CSV/TXT/TSV

export const PIPES_DESKTOP_URLS = {
  downloadMarigoldModule: 'https://pipes.pink/download?module=marigold',
  openMarigoldWorkspace: 'https://pipes.pink/desktop/marigold?view=desktop&workspace=marigold',
} as const;

export interface PipesNativeCapabilities {
  available: boolean;
  engine: string;
  outOfCoreZipStreaming: boolean;
  wasm32CeilingBypassed: boolean;
  defaultVaultDir: string;
  supportedExtensions: string[];
}

export interface LocalCivicDatasetItem {
  name: string;
  path: string;
  sizeBytes: number;
  location: string;
  extension: string;
}

export interface CivicGroupCount {
  value: string;
  count: number;
}

export interface NativeStreamProfile {
  sourcePath: string;
  entryName: string;
  fileBytes: number;
  sha256: string;
  delimiter: string;
  headers: string[];
  totalRows: number;
  elapsedMs: number;
  groupByColumn: string | null;
  topGroups: CivicGroupCount[];
}

export interface NativeShardItem {
  fileName: string;
  path: string;
  rowCount: number;
  byteSize: number;
  sha256: string;
}

export interface NativeShardManifest {
  sourcePath: string;
  entryName: string;
  outputDir: string;
  totalRows: number;
  rowsPerShard: number;
  shardCount: number;
  merkleRoot: string;
  elapsedMs: number;
  shards: NativeShardItem[];
}

export interface LargeArchiveRecommendation {
  recommend: boolean;
  isZip: boolean;
  estimatedUncompressedBytes: number;
  reason: string;
}

type TauriWindowLike = {
  __TAURI_INTERNALS__?: {
    invoke?: <T = unknown>(cmd: string, args?: Record<string, unknown>) => Promise<T>;
  };
  __TAURI__?: {
    core?: {
      invoke?: <T = unknown>(cmd: string, args?: Record<string, unknown>) => Promise<T>;
    };
  };
};

export function isRunningInPipesDesktop(win?: unknown): boolean {
  const target = (win ?? (typeof window !== 'undefined' ? window : undefined)) as TauriWindowLike | undefined;
  if (!target || typeof target !== 'object') return false;
  return Boolean(target.__TAURI_INTERNALS__ || target.__TAURI__);
}

export function shouldRecommendPipesDesktop(file: { name: string; size: number }): LargeArchiveRecommendation {
  const name = (file.name || '').toLowerCase();
  const isZip = name.endsWith('.zip');
  const size = Math.max(0, Number(file.size || 0));
  const estimatedUncompressedBytes = isZip ? Math.round(size * 4.5) : size;

  if (isZip && size >= LARGE_ZIP_DESKTOP_RECOMMEND_BYTES) {
    return {
      recommend: true,
      isZip: true,
      estimatedUncompressedBytes,
      reason: `This ${(size / (1024 * 1024)).toFixed(0)} MB compressed .zip archive is estimated to expand to ~${(
        estimatedUncompressedBytes /
        (1024 * 1024 * 1024)
      ).toFixed(1)} GB, which can approach browser WebAssembly's 4 GB limit. Pipes Desktop streams it natively in O(1) RAM.`,
    };
  }

  if (!isZip && size >= LARGE_RAW_DESKTOP_RECOMMEND_BYTES) {
    return {
      recommend: true,
      isZip: false,
      estimatedUncompressedBytes,
      reason: `This ${(size / (1024 * 1024 * 1024)).toFixed(2)} GB file is safer to shard into 250k-row blocks using Pipes Desktop's native Rust streaming engine.`,
    };
  }

  return {
    recommend: false,
    isZip,
    estimatedUncompressedBytes,
    reason: 'Safe to process directly inside browser WebAssembly RAM.',
  };
}

export async function invokePipesTauri<T>(
  cmd: string,
  args: Record<string, unknown> = {},
  win?: unknown
): Promise<T> {
  const target = (win ?? (typeof window !== 'undefined' ? window : undefined)) as TauriWindowLike | undefined;
  if (target?.__TAURI_INTERNALS__ && typeof target.__TAURI_INTERNALS__.invoke === 'function') {
    return await target.__TAURI_INTERNALS__.invoke<T>(cmd, args);
  }
  if (target?.__TAURI__?.core && typeof target.__TAURI__.core.invoke === 'function') {
    return await target.__TAURI__.core.invoke<T>(cmd, args);
  }
  throw new Error('Pipes Desktop native Tauri IPC runtime is not active in this window.');
}

export async function getPipesNativeCapabilities(win?: unknown): Promise<PipesNativeCapabilities | null> {
  if (!isRunningInPipesDesktop(win)) return null;
  try {
    return await invokePipesTauri<PipesNativeCapabilities>('marigold_native_capabilities', {}, win);
  } catch {
    return null;
  }
}

export async function listLocalCivicDatasetsNative(win?: unknown): Promise<LocalCivicDatasetItem[]> {
  if (!isRunningInPipesDesktop(win)) return [];
  return await invokePipesTauri<LocalCivicDatasetItem[]>('marigold_list_local_datasets', {}, win);
}

export async function streamProfileDatasetNative(
  path: string,
  delimiter?: string | null,
  groupByCol?: string | null,
  win?: unknown
): Promise<NativeStreamProfile> {
  return await invokePipesTauri<NativeStreamProfile>(
    'marigold_stream_profile_dataset',
    {
      path,
      delimiter: delimiter ?? null,
      groupByCol: groupByCol ?? null,
    },
    win
  );
}

export async function shardMassiveArchiveNative(
  path: string,
  rowsPerShard = 250000,
  outputSubdir?: string | null,
  win?: unknown
): Promise<NativeShardManifest> {
  return await invokePipesTauri<NativeShardManifest>(
    'marigold_shard_massive_archive',
    {
      path,
      rowsPerShard,
      outputSubdir: outputSubdir ?? null,
    },
    win
  );
}

export function getPipesDesktopDownloadUrl(): string {
  return PIPES_DESKTOP_URLS.downloadMarigoldModule;
}
