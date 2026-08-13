import { MarigoldCartridge, CartridgeOperation, CartridgeOutput, CartridgeNarrative, CartridgeParameter } from '../types/cartridge';
import { Playbook } from '../types';

export interface BuildCartridgeParams {
  id: string;
  name: string;
  summary: string;
  description: string;
  authorIdentity: string;
  engine: 'duckdb-wasm';
  operations: CartridgeOperation[];
  outputs: CartridgeOutput[];
  narratives: CartridgeNarrative[];
  mappings: Record<string, string>;
  parameters: Record<string, CartridgeParameter>;
}

/**
 * CartridgeBuilder
 * 
 * Takes internal Marigold Playbook state and strictly serializes it into the 
 * chb.marigold.cartridge.v1 JSON schema, ready for export or Pipes ingestion.
 */
export function buildCartridgeManifest(params: BuildCartridgeParams): MarigoldCartridge {
  return {
    schema: 'chb.marigold.cartridge.v1',
    kind: 'executable-cartridge',
    id: params.id,
    version: '1.0.0', // Initial export version
    display: {
      name: params.name,
      summary: params.summary,
      description: params.description
    },
    publisher: {
      clerkId: params.authorIdentity,
      product: 'marigold-insights'
    },
    provenance: {
      methodology: ['local-first-execution'],
      createdAt: new Date().toISOString()
    },
    privacy: {
      sourceDataLeavesClient: false,
      directIdentifiersIncluded: false
    },
    license: {
      code: 'AGPL-3.0-or-later'
    },
    runtime: {
      engine: params.engine,
      executionLocation: 'client',
      workers: true
    },
    inputs: {
      acceptedFormats: ['csv', 'parquet'],
      semanticMappings: params.mappings,
      parameters: params.parameters
    },
    operations: params.operations,
    outputs: params.outputs,
    narratives: params.narratives
  };
}

/**
 * Utility to download the generated Cartridge as a .json file.
 */
export function downloadCartridge(cartridge: MarigoldCartridge) {
  const jsonString = JSON.stringify(cartridge, null, 2);
  const blob = new Blob([jsonString], { type: 'application/json' });
  const url = URL.createObjectURL(blob);
  
  const link = document.createElement('a');
  link.href = url;
  const safeName = cartridge.display.name.toLowerCase().replace(/[^a-z0-9]+/g, '-');
  link.download = `${safeName}-cartridge-v1.json`;
  
  document.body.appendChild(link);
  link.click();
  
  document.body.removeChild(link);
  URL.revokeObjectURL(url);
}
