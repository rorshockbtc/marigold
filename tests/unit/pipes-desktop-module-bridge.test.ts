import { describe, it, expect, vi } from 'vitest';
import {
  isRunningInPipesDesktop,
  shouldRecommendPipesDesktop,
  getPipesNativeCapabilities,
  listLocalCivicDatasetsNative,
  streamProfileDatasetNative,
  shardMassiveArchiveNative,
  getPipesDesktopDownloadUrl,
  LARGE_ZIP_DESKTOP_RECOMMEND_BYTES,
  LARGE_RAW_DESKTOP_RECOMMEND_BYTES,
} from '../../src/lib/desktop/tauriPipesBridge';
import { validateCivicContent } from '../../src/lib/security/civicPiiGuard';

describe('Pipes.app Desktop Module Bridge (Marigold Data & Civic Studio)', () => {
  it('detects web browser vs Pipes.app Tauri runtime accurately', () => {
    expect(isRunningInPipesDesktop({})).toBe(false);
    expect(isRunningInPipesDesktop(null)).toBe(false);
    expect(isRunningInPipesDesktop({ __TAURI_INTERNALS__: { invoke: vi.fn() } })).toBe(true);
    expect(isRunningInPipesDesktop({ __TAURI__: { core: { invoke: vi.fn() } } })).toBe(true);
  });

  it('recommends Pipes Desktop when .zip or raw tabular files approach wasm32 limits', () => {
    const smallCsv = shouldRecommendPipesDesktop({
      name: 'county_sample.csv',
      size: 12 * 1024 * 1024,
    });
    expect(smallCsv.recommend).toBe(false);
    expect(smallCsv.isZip).toBe(false);

    const smallZip = shouldRecommendPipesDesktop({
      name: 'small_precinct.zip',
      size: 40 * 1024 * 1024,
    });
    expect(smallZip.recommend).toBe(false);
    expect(smallZip.isZip).toBe(true);

    const ncZip = shouldRecommendPipesDesktop({
      name: 'ncvoter_Statewide.zip',
      size: 650 * 1024 * 1024,
    });
    expect(ncZip.recommend).toBe(true);
    expect(ncZip.isZip).toBe(true);
    expect(ncZip.estimatedUncompressedBytes).toBeGreaterThan(2.5 * 1024 * 1024 * 1024);
    expect(ncZip.reason).toContain('WebAssembly');

    const giantRaw = shouldRecommendPipesDesktop({
      name: 'statewide_raw.txt',
      size: LARGE_RAW_DESKTOP_RECOMMEND_BYTES + 1024,
    });
    expect(giantRaw.recommend).toBe(true);
    expect(giantRaw.isZip).toBe(false);
    expect(LARGE_ZIP_DESKTOP_RECOMMEND_BYTES).toBe(350 * 1024 * 1024);
  });

  it('invokes Pipes Native Rust IPC commands cleanly and preserves strict Zero-PII output', async () => {
    const invokeSpy = vi.fn(async (cmd: string, args?: Record<string, unknown>) => {
      if (cmd === 'marigold_native_capabilities') {
        return {
          available: true,
          engine: 'pipes-native-rust-v2',
          outOfCoreZipStreaming: true,
          wasm32CeilingBypassed: true,
          defaultVaultDir: '/Users/auditor/Documents/Marigold_Local',
          supportedExtensions: ['.zip', '.csv', '.tsv', '.txt'],
        };
      }
      if (cmd === 'marigold_list_local_datasets') {
        return [
          {
            name: 'ncvoter_Statewide.zip',
            path: '/Users/auditor/Downloads/ncvoter_Statewide.zip',
            sizeBytes: 685_000_000,
            location: 'Downloads',
            extension: 'zip',
          },
        ];
      }
      if (cmd === 'marigold_stream_profile_dataset') {
        expect(args?.path).toBe('/Users/auditor/Downloads/ncvoter_Statewide.zip');
        return {
          sourcePath: '/Users/auditor/Downloads/ncvoter_Statewide.zip',
          entryName: 'ncvoter_Statewide.txt',
          fileBytes: 685_000_000,
          sha256: 'a'.repeat(64),
          delimiter: 'TAB (\\t)',
          headers: ['county_id', 'county_desc', 'voter_status_desc', 'party_cd'],
          totalRows: 8_420_115,
          elapsedMs: 1840,
          groupByColumn: 'county_desc',
          topGroups: [
            { value: 'WAKE', count: 842100 },
            { value: 'MECKLENBURG', count: 815420 },
          ],
        };
      }
      if (cmd === 'marigold_shard_massive_archive') {
        expect(args?.rowsPerShard).toBe(250000);
        return {
          sourcePath: '/Users/auditor/Downloads/ncvoter_Statewide.zip',
          entryName: 'ncvoter_Statewide.txt',
          outputDir: '/Users/auditor/Documents/Marigold_Local/ncvoter_Statewide_shards',
          totalRows: 8_420_115,
          rowsPerShard: 250000,
          shardCount: 34,
          merkleRoot: 'b'.repeat(64),
          elapsedMs: 9120,
          shards: [],
        };
      }
      return null;
    });

    const mockWin = { __TAURI_INTERNALS__: { invoke: invokeSpy } };

    const caps = await getPipesNativeCapabilities(mockWin);
    expect(caps?.available).toBe(true);
    expect(caps?.wasm32CeilingBypassed).toBe(true);

    const files = await listLocalCivicDatasetsNative(mockWin);
    expect(files).toHaveLength(1);
    expect(files[0].name).toBe('ncvoter_Statewide.zip');

    const profile = await streamProfileDatasetNative(files[0].path, null, 'county_desc', mockWin);
    expect(profile.totalRows).toBe(8_420_115);
    expect(profile.delimiter).toBe('TAB (\\t)');
    expect(validateCivicContent(JSON.stringify(profile), 'profile.json').allowed).toBe(true);

    const manifest = await shardMassiveArchiveNative(files[0].path, 250000, null, mockWin);
    expect(manifest.shardCount).toBe(34);
    expect(manifest.outputDir).toContain('Marigold_Local');

    expect(getPipesDesktopDownloadUrl()).toBe('https://pipes.pink/download?module=marigold');
  });
});
