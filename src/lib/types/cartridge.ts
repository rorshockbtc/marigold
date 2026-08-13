export type CartridgeSchemaVersion = 'chb.marigold.cartridge.v1';

export interface MarigoldCartridge {
  schema: CartridgeSchemaVersion;
  kind: 'executable-cartridge';
  id: string; // e.g., marigold:playbook:duplicate-record-audit
  version: string; // semver
  display: {
    name: string;
    summary: string;
    description: string;
  };
  publisher: {
    clerkId?: string; // Currently tracks Marigold author
    organizationId?: string;
    product: string; // e.g., "marigold-insights"
  };
  provenance: {
    methodology: string[];
    createdAt: string; // ISO 8601
  };
  privacy: {
    sourceDataLeavesClient: boolean; // Must be false for Zero-Cloud
    directIdentifiersIncluded: boolean;
  };
  license: {
    code: string; // e.g., "AGPL-3.0-or-later"
  };
  runtime: {
    engine: 'duckdb-wasm';
    executionLocation: 'client';
    workers: boolean;
  };
  inputs: {
    acceptedFormats: string[]; // e.g., ['csv', 'parquet']
    semanticMappings: Record<string, string>; // e.g., { givenName: "person.given-name" }
    parameters: Record<string, CartridgeParameter>;
  };
  operations: CartridgeOperation[];
  outputs: CartridgeOutput[];
  narratives: CartridgeNarrative[];
}

export interface CartridgeParameter {
  type: 'number' | 'string' | 'boolean';
  default?: string | number | boolean;
  minimum?: number;
  maximum?: number;
}

export interface CartridgeOperation {
  id: string;
  type: 'duckdb-query';
  query: string; // The parameterized SQL query
  parameters: string[]; // Names of inputs/parameters to bind
}

export interface CartridgeOutput {
  id: string;
  schema: Record<string, string>; // e.g., { groupId: "string", confidence: "number" }
}

export interface CartridgeNarrative {
  id: string;
  template: string; // Markdown template string
  allowedInputs: string[]; // Which output IDs can be passed into this template
}
