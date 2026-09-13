/**
 * Pipes Protocol MCP Client & Marigold Inter-Agent Bridge
 *
 * Provides zero-latency vector RAG retrieval, DuckDB-Wasm SIMD manifest fetching,
 * and ambient writeback pinning between the Marigold AI Agent and Pipes (pipes.pink).
 */

export interface PipesNode {
  id: string;
  namespace: string;
  contentHash: string;
  title: string;
  content: string;
  author?: string;
  sourceUrl?: string;
  score?: number;
  denseHumanContext?: {
    marigoldCompatibility?: {
      duckDbQueryHint: string;
      columnSynonyms: Record<string, string>;
      dataDensityScore: number;
      semanticCategory: string;
    };
    museumGlass?: boolean;
    craftExperience?: string;
    attitudinalStance?: string;
  };
}

export interface MarigoldBridgePayload {
  namespaces: Array<{
    name: string;
    activeNodesCount: number;
    duckDbQueryHint: string;
    columnSynonyms: Record<string, string>;
  }>;
  arrowManifest: {
    format: string;
    zeroCopySupported: boolean;
    ipcEndpoint: string;
  };
  interAgentHandshake: {
    protocolVersion: string;
    clientAgent: string;
    serverProtocol: string;
    status: string;
  };
}

export class PipesMCPClient {
  private baseUrl: string;

  constructor(baseUrl = process.env.NEXT_PUBLIC_PIPES_URL || 'https://pipes.pink') {
    this.baseUrl = baseUrl.replace(/\/$/, '');
  }

  /**
   * Fetch vectorized semantic context for a given namespace pipe and optional query.
   */
  async queryPipe(namespace: string, query?: string, limit = 5): Promise<{ nodes: PipesNode[]; totalCount: number }> {
    try {
      const url = new URL(`${this.baseUrl}/api/mcp/query`);
      url.searchParams.set('namespace', namespace);
      if (query) url.searchParams.set('q', query);
      url.searchParams.set('limit', limit.toString());

      const res = await fetch(url.toString(), {
        headers: { 'Accept': 'application/json' },
        next: { revalidate: 60 }
      });

      if (!res.ok) {
        throw new Error(`Pipes MCP query failed with status ${res.status}`);
      }

      const data = await res.json();
      return {
        nodes: data.nodes || [],
        totalCount: data.totalCount || (data.nodes ? data.nodes.length : 0)
      };
    } catch (err) {
      console.warn(`[PipesMCPClient] Query warning for pipe\\${namespace}:`, err);
      return { nodes: [], totalCount: 0 };
    }
  }

  /**
   * Fetch zero-copy DuckDB-Wasm & Arrow manifests via the Marigold Bridge.
   */
  async fetchMarigoldBridge(namespaces: string[] = ['data-mapping', 'election-integrity', 'bitcoin']): Promise<MarigoldBridgePayload | null> {
    try {
      const url = `${this.baseUrl}/api/v1/marigold/bridge?pipes=${namespaces.join(',')}`;
      const res = await fetch(url, { headers: { 'Accept': 'application/json' } });

      if (!res.ok) {
        throw new Error(`Marigold Bridge request failed with status ${res.status}`);
      }

      return await res.json();
    } catch (err) {
      console.warn('[PipesMCPClient] Marigold Bridge fetch warning:', err);
      return null;
    }
  }

  /**
   * Push a newly synthesized data story, anomaly report, or analytical insight back into Pipes.
   */
  async pushInsight(params: {
    targetPipe: string;
    title: string;
    rawText: string;
    sourceUrl?: string;
    curatorPipe?: string;
  }): Promise<{ success: boolean; contentHash?: string; error?: string }> {
    try {
      const url = `${this.baseUrl}/api/v1/pipe/${params.targetPipe}/ambient-pin`;
      const res = await fetch(url, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          title: params.title,
          raw_text: params.rawText,
          url: params.sourceUrl || null,
          user_personal_pipe: params.curatorPipe || 'marigold-agent',
          author: 'Marigold Insights Agent',
          craft_experience: 'Zero-Knowledge Data Storytelling',
          regional_origin: 'Marigold Agentic Framework'
        })
      });

      const data = await res.json();
      if (!res.ok) {
        return { success: false, error: data.error || 'Push failed' };
      }

      return {
        success: true,
        contentHash: data.contentHash
      };
    } catch (err: any) {
      console.error('[PipesMCPClient] Push insight error:', err);
      return { success: false, error: err.message };
    }
  }
}

export const defaultPipesClient = new PipesMCPClient();
