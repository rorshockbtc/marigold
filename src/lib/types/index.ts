/**
 * Centralized Type Definitions for Marigold
 * This directory defines the strict contracts for the application, enforcing
 * rigorous typing and eliminating `any` types across the codebase.
 */

// -- Chat & LLM Interfaces --
export interface ChatMessage {
  role: "user" | "assistant" | "system";
  content: string;
  suggestedPlaybook?: Playbook;
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
