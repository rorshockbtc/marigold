import { z } from 'zod';
import { ArticleState, ArticleSection, ArticleChart, DossierBlock } from '../types';

export interface CitationProvenance {
  spanId: string;
  startIndex: number;
  endIndex: number;
  sourceQueryHash: string;
  exactQuote: string;
  confidence: number;
}

export interface PipesProseBlock {
  id: string;
  type: 'PROSE';
  role: 'THESIS' | 'EXORDIUM' | 'TESTIMONIUM' | 'PROBATIO' | 'SYNPOSIS' | 'PERORATIO';
  title?: string;
  contentMd: string;
  citations: CitationProvenance[];
}

export interface PipesDataMatrixBlock {
  id: string;
  type: 'DATA_MATRIX';
  headers: string[];
  rows: Record<string, string | number>[];
  chartSpec?: ArticleChart;
}

export interface PipesDossierDocument {
  dossierId: string;
  title: string;
  namespace: string;
  version: number;
  publishedAt: string;
  blocks: (PipesProseBlock | PipesDataMatrixBlock)[];
}

export interface PipesPublishResponse {
  success: boolean;
  dossierId?: string;
  publishedUrl?: string;
  monetizationStatus?: string;
  error?: string;
}
