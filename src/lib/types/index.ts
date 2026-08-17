/**
 * Centralized Type Definitions for Marigold
 * This directory defines the strict contracts for the application, enforcing
 * rigorous typing and eliminating `any` types across the codebase.
 */

// -- Data Story (Article) Interfaces --
export interface ArticleChart {
  type: 'bar' | 'pie' | 'line' | 'scatter';
  xAxisLabel?: string;
  yAxisLabel?: string;
  yScaleMin?: number;
  yScaleMax?: number;
  series: {
    id: string;
    data: {
      x: string | number;
      y: number;
    }[];
  }[];
}

export interface ArticleSection {
  id: string;
  heading: string;
  narrative: string;
  chart?: ArticleChart;
}

export interface ArticleState {
  title: string;
  sections: ArticleSection[];
}

// -- Chat & LLM Interfaces --
export interface ChatMessage {
  role: "user" | "assistant" | "system";
  content: string;
  suggestedPlaybook?: Playbook;
  isTriage?: boolean;
  originalQuery?: string;
  hiddenContext?: string; // Used to feed tool execution memory back to the LLM without showing it in the UI
  hasFolderRelinkAffordance?: boolean;
}

export interface ChatSession {
  id: string;
  title: string;
  timestamp: number;
  messages: ChatMessage[];
}

export interface ChatPayload {
  query: string;
  history: ChatMessage[];
  userApiKey: string;
  isFriendlyMode: boolean;
  pageContext: PageContext;
  forceBypassTriage?: boolean;
  articleState?: ArticleState; // The current state of the article, injected silently into the prompt
}

export interface PageContext {
  currentRoute: string;
  activeGroup: string;
  datasetName: string;
  datasetRowCount: string;
  isDataConnected: boolean;
  isDemoMode: boolean;
}

// -- Playbooks & Templates --
export interface Playbook {
  id?: string;
  name: string;
  description: string;
  audit_type?: string;
  auditType?: string;
  threshold?: number;
  county?: string;
  queryTemplate?: string;
}

// -- Audits & Resources --
export interface AuditResource {
  id: string;
  title: string;
  url: string;
  type: string;
}

export interface NewsArticle {
  id: string;
  headline: string;
  source: string;
  date: string;
  url: string;
}

// -- Recharts Tooltips (UI) --
export interface RechartsTooltipProps {
  active?: boolean;
  payload?: RechartsPayloadEntry[];
  label?: string;
}

export interface RechartsPayloadEntry {
  value: number | string;
  name: string;
  dataKey: string;
  payload: Record<string, unknown>;
  color?: string;
}

export interface RechartsSliceEntry {
  name: string;
  value: number;
  percent?: number;
  payload?: Record<string, unknown>;
}

// -- Worker Messages --
export interface WorkerMessage<T = unknown> {
  type: 'CHUNK' | 'COMPLETE' | 'ERROR' | 'PROGRESS';
  payload?: T;
  error?: string;
}

// -- Executable Cartridges (Pipes Upstream) --
export * from './cartridge';
