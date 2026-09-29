import { ArticleState, ArticleSection, DossierBlock } from '../types';
import { PipesDossierDocument, PipesProseBlock, PipesDataMatrixBlock, CitationProvenance } from './types';
import { v4 as uuidv4 } from 'uuid';

export function convertArticleStateToPipesAST(
  article: ArticleState,
  namespace: string = 'pipe\\marigold-insights'
): PipesDossierDocument {
  const dossierId = uuidv4();
  const blocks: (PipesProseBlock | PipesDataMatrixBlock)[] = [];

  if (article.blocks && article.blocks.length > 0) {
    article.blocks.forEach((b: DossierBlock, idx: number) => {
      const proseBlock: PipesProseBlock = {
        id: b.id || uuidv4(),
        type: 'PROSE',
        role: idx === 0 ? 'EXORDIUM' : idx === 1 ? 'THESIS' : 'PROBATIO',
        title: b.content.title,
        contentMd: b.content.narrative || '',
        citations: b.sqlProvenance ? [
          {
            spanId: uuidv4(),
            startIndex: 0,
            endIndex: (b.content.narrative || '').length,
            sourceQueryHash: b.sqlProvenance,
            exactQuote: (b.content.narrative || '').slice(0, 80),
            confidence: 0.98
          }
        ] : []
      };
      blocks.push(proseBlock);

      if (b.content.chartSpec) {
        const matrixBlock: PipesDataMatrixBlock = {
          id: uuidv4(),
          type: 'DATA_MATRIX',
          headers: b.content.chartSpec.series.map(s => s.id),
          rows: b.content.chartSpec.series[0]?.data.map(d => ({ x: String(d.x), y: d.y })) || [],
          chartSpec: b.content.chartSpec
        };
        blocks.push(matrixBlock);
      }
    });
  } else if (article.sections && article.sections.length > 0) {
    article.sections.forEach((sec: ArticleSection, idx: number) => {
      const proseBlock: PipesProseBlock = {
        id: sec.id || uuidv4(),
        type: 'PROSE',
        role: idx === 0 ? 'EXORDIUM' : idx === 1 ? 'THESIS' : 'PROBATIO',
        title: sec.heading,
        contentMd: sec.narrative || '',
        citations: []
      };
      blocks.push(proseBlock);

      if (sec.chart) {
        const matrixBlock: PipesDataMatrixBlock = {
          id: uuidv4(),
          type: 'DATA_MATRIX',
          headers: sec.chart.series.map(s => s.id),
          rows: sec.chart.series[0]?.data.map(d => ({ x: String(d.x), y: d.y })) || [],
          chartSpec: sec.chart
        };
        blocks.push(matrixBlock);
      }
    });
  }

  return {
    dossierId,
    title: article.title || 'Untitled Data Story',
    namespace,
    version: 1,
    publishedAt: new Date().toISOString(),
    blocks
  };
}

export function convertPipesASTToArticleState(dossier: PipesDossierDocument): ArticleState {
  const sections: ArticleSection[] = [];

  dossier.blocks.forEach((block) => {
    if (block.type === 'PROSE') {
      sections.push({
        id: block.id,
        heading: block.title || '',
        narrative: block.contentMd
      });
    } else if (block.type === 'DATA_MATRIX' && block.chartSpec) {
      const lastSection = sections[sections.length - 1];
      if (lastSection) {
        lastSection.chart = block.chartSpec;
      } else {
        sections.push({
          id: block.id,
          heading: 'Data Matrix Visualization',
          narrative: '',
          chart: block.chartSpec
        });
      }
    }
  });

  return {
    title: dossier.title,
    sections
  };
}
