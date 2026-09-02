import { ArticleState, ArticleSection } from '@/lib/types';
import { Save, Share2, AlertCircle, BarChart3, PieChart, TrendingUp } from 'lucide-react';
import { Button } from './ui/Button';
import { ResponsiveBar } from '@nivo/bar';
import { ResponsivePie } from '@nivo/pie';
import { ResponsiveLine } from '@nivo/line';
import { useState, useEffect } from 'react';
import ReactMarkdown from 'react-markdown';
import { DecryptionEngine } from '@/lib/security/DecryptionEngine';

export interface ArticleViewerProps {
  article: ArticleState;
  onPublishToGroup: () => void;
  onSaveLocally: () => void;
  isPublicView?: boolean;
}

export function ArticleViewer({ article, onPublishToGroup, onSaveLocally, isPublicView = false }: ArticleViewerProps) {
  const [displayArticle, setDisplayArticle] = useState<ArticleState>(article);
  const [isSaved, setIsSaved] = useState(false);
  const [isPublished, setIsPublished] = useState(false);

  const handleSaveClick = () => {
    setIsSaved(true);
    onSaveLocally();
    setTimeout(() => setIsSaved(false), 3000);
  };

  const handlePublishClick = () => {
    setIsPublished(true);
    onPublishToGroup();
    // Save to local storage for the published view
    if (typeof window !== 'undefined') {
      localStorage.setItem('marigold_published_story', JSON.stringify(displayArticle));
      window.open('/published', '_blank');
    }
    setTimeout(() => setIsPublished(false), 3000);
  };

  useEffect(() => {
    async function hydrate() {
      if (!article) return;
      const next: ArticleState = {
        title: await DecryptionEngine.hydrateText(article.title),
        sections: []
      };
      
      for (const sec of article.sections) {
        const nextSec: ArticleSection = {
          id: sec.id,
          heading: sec.heading ? await DecryptionEngine.hydrateText(sec.heading) : "",
          narrative: sec.narrative ? await DecryptionEngine.hydrateText(sec.narrative) : "",
        };
        
        if (sec.chart) {
          nextSec.chart = { ...sec.chart, series: [] };
          if (sec.chart.xAxisLabel) nextSec.chart.xAxisLabel = await DecryptionEngine.hydrateText(sec.chart.xAxisLabel);
          if (sec.chart.yAxisLabel) nextSec.chart.yAxisLabel = await DecryptionEngine.hydrateText(sec.chart.yAxisLabel);
          
          if (sec.chart.series) {
            for (const series of sec.chart.series) {
               if (!series || !series.data) continue;
               const seriesIdRaw = series.id || "Series";
               const nextSeries = {
                 id: (await DecryptionEngine.hydrateText(seriesIdRaw)).replace(/\n/g, ' ').trim(),
                 data: [] as any[]
               };
               for (const pt of series.data) {
                 if (pt.x === undefined || pt.y === undefined) continue; // Defensive check for bad Gemini schemas
                 nextSeries.data.push({
                   x: typeof pt.x === 'string' ? (await DecryptionEngine.hydrateText(pt.x)).replace(/\n/g, ' ').trim() : String(pt.x),
                   y: Number(pt.y) || 0
                 });
               }
               nextSec.chart.series.push(nextSeries);
            }
          }
        }
        next.sections.push(nextSec);
      }
      setDisplayArticle(next);
    }
    
    hydrate();
  }, [article]);

  return (
    <div className="w-full bg-surface min-h-screen text-text-body">
      {/* Sticky Header */}
      <div className="sticky top-0 z-20 bg-surface/80 backdrop-blur-md border-b border-border-soft px-8 py-4 flex items-center justify-between">
        <h1 className="text-xl font-serif font-bold text-text-header truncate mr-4">
          {displayArticle.title || "Untitled Data Story"}
        </h1>
        <div className="flex items-center gap-3 shrink-0">
          {!isPublicView && (
            <>
              <Button onClick={handleSaveClick} variant="outline" className="flex items-center gap-2">
                <Save className="w-4 h-4" /> {isSaved ? "Saved!" : "Save"}
              </Button>
              <Button onClick={handlePublishClick} variant="primary" className="flex items-center gap-2">
                <Share2 className="w-4 h-4" /> {isPublished ? "Published!" : "Publish"}
              </Button>
            </>
          )}
        </div>
      </div>

      {/* Article Body */}
      <article className="max-w-3xl mx-auto px-8 py-12 space-y-12">
        <header className="mb-12">
          <h1 className="text-4xl md:text-5xl font-serif font-bold text-text-header leading-tight mb-6">
            {displayArticle.title}
          </h1>
          <hr className="border-border-soft" />
        </header>

        {displayArticle.sections.map((section) => (
          <section key={section.id} className="space-y-6">
            {section.heading && (
              <h2 className="text-2xl font-serif font-bold text-text-header mt-8 mb-4">
                {section.heading}
              </h2>
            )}
            
            {section.narrative && (
              <div className="prose prose-lg max-w-none text-text-body leading-relaxed markdown-content">
                <ReactMarkdown>{section.narrative}</ReactMarkdown>
              </div>
            )}

            {section.chart && section.chart.series && section.chart.series.length > 0 && (
              <figure className="my-10 bg-white border border-border-soft rounded-xl p-6 shadow-sm">
                <figcaption className="text-xs font-bold text-text-header uppercase tracking-wider flex items-center gap-2 mb-6 pb-4 border-b border-border-soft">
                  {section.chart.type === 'bar' ? <BarChart3 className="w-4 h-4 text-primary" /> : 
                   section.chart.type === 'pie' ? <PieChart className="w-4 h-4 text-primary" /> : 
                   <TrendingUp className="w-4 h-4 text-primary" />}
                  Data Visualization: {section.chart.type.toUpperCase()}
                </figcaption>
                
                <div className="h-[400px] w-full">
                  {(() => {
                    const c = section.chart;
                    if (!c) return null;
                    
                    const commonLegends: any[] = [
                      {
                        dataFrom: 'keys',
                        anchor: 'right',
                        direction: 'column',
                        justify: false,
                        translateX: 140,
                        translateY: 0,
                        itemsSpacing: 10,
                        itemWidth: 140,
                        itemHeight: 20,
                        itemDirection: 'left-to-right',
                        itemOpacity: 0.85,
                        symbolSize: 15,
                        effects: [{ on: 'hover', style: { itemOpacity: 1 } }]
                      }
                    ];

                    const axisBottom = { 
                      tickSize: 5, 
                      tickPadding: 5, 
                      tickRotation: 0, 
                      legend: c.xAxisLabel || '', 
                      legendPosition: 'middle' as const, 
                      legendOffset: 40 
                    };

                    const axisLeft = { 
                      tickSize: 5, 
                      tickPadding: 5, 
                      tickRotation: 0, 
                      legend: c.yAxisLabel || '', 
                      legendPosition: 'middle' as const, 
                      legendOffset: -50 
                    };

                    if (c.type === 'bar') {
                      // Transpose series into Nivo Bar format (group by X)
                      const barDataMap = new Map<string | number, any>();
                      const keys = c.series.map(s => s.id);
                      
                      c.series.forEach(s => {
                        s.data.forEach(d => {
                          if (!barDataMap.has(d.x)) {
                            barDataMap.set(d.x, { label: d.x });
                          }
                          barDataMap.get(d.x)[s.id] = d.y;
                        });
                      });
                      
                      const barData = Array.from(barDataMap.values());
                      
                      // Calculate max label length for rotation
                      let maxLabelLength = 0;
                      barData.forEach(d => {
                        if (d.label && String(d.label).length > maxLabelLength) {
                          maxLabelLength = String(d.label).length;
                        }
                      });

                      let rotation = 0;
                      let bottomMargin = 60;
                      let legendOffset = 40;

                      if (maxLabelLength > 20) {
                        rotation = -90;
                        bottomMargin = 140;
                        legendOffset = 120;
                      } else if (maxLabelLength > 10) {
                        rotation = -45;
                        bottomMargin = 100;
                        legendOffset = 80;
                      }

                      const dynamicAxisBottom = { 
                        ...axisBottom, 
                        tickRotation: rotation,
                        legendOffset: legendOffset
                      };

                      return (
                        <ResponsiveBar
                          data={barData}
                          keys={keys}
                          indexBy="label"
                          margin={{ top: 20, right: 180, bottom: bottomMargin, left: 60 }}
                          padding={0.3}
                          colors={{ scheme: 'set2' }}
                          axisBottom={dynamicAxisBottom}
                          axisLeft={axisLeft}
                          labelSkipWidth={12}
                          labelSkipHeight={12}
                          legends={commonLegends}
                        />
                      );
                    }

                    if (c.type === 'line' || c.type === 'scatter') {
                      // Nivo Line and Scatter inherently use the series format
                      const isScatter = c.type === 'scatter';
                      const lineMin = c.yScaleMin !== undefined ? c.yScaleMin : 'auto';
                      const lineMax = c.yScaleMax !== undefined ? c.yScaleMax : 'auto';
                      
                      // Sort chronological X values to prevent the line from drawing backwards (double lines)
                      const sortedSeries = c.series.map(s => {
                        const sortedData = [...s.data].sort((a, b) => {
                          const aVal = String(a.x);
                          const bVal = String(b.x);
                          return aVal.localeCompare(bVal, undefined, { numeric: true });
                        });
                        return { ...s, data: sortedData };
                      });
                      
                      return (
                        <ResponsiveLine
                          data={sortedSeries}
                          margin={{ top: 20, right: 180, bottom: 60, left: 60 }}
                          xScale={{ type: 'point' }}
                          yScale={{ type: 'linear', min: lineMin, max: lineMax, stacked: false, reverse: false }}
                          axisTop={null}
                          axisRight={null}
                          axisBottom={axisBottom}
                          axisLeft={axisLeft}
                          pointSize={isScatter ? 12 : 8}
                          pointColor={{ theme: 'background' }}
                          pointBorderWidth={2}
                          pointBorderColor={{ from: 'serieColor' }}
                          pointLabelYOffset={-12}
                          useMesh={true}
                          enableArea={false}
                          enableGridX={!isScatter}
                          enableGridY={true}
                          lineWidth={isScatter ? 0 : 2}
                          colors={{ scheme: 'set2' }}
                          legends={commonLegends.map(l => ({ ...l, dataFrom: undefined }))}
                        />
                      );
                    }

                    if (c.type === 'pie') {
                      // Pie chart uses the first series, treating x as labels and y as values
                      if (c.series.length === 0) return null;
                      const pieData = c.series[0].data.map(d => ({
                        id: String(d.x),
                        label: String(d.x),
                        value: d.y
                      }));

                      const tooManySlices = pieData.length > 10;
                      
                      return (
                        <ResponsivePie
                          data={pieData}
                          margin={{ top: 40, right: 80, bottom: 80, left: 80 }}
                          innerRadius={0.5}
                          padAngle={0.7}
                          cornerRadius={3}
                          colors={{ scheme: 'set2' }}
                          borderWidth={1}
                          borderColor={{ from: 'color', modifiers: [['darker', 0.2]] }}
                          enableArcLinkLabels={!tooManySlices}
                          arcLinkLabelsSkipAngle={10}
                          arcLinkLabelsTextColor="#333333"
                          arcLinkLabelsThickness={2}
                          arcLinkLabelsColor={{ from: 'color' }}
                          arcLabelsSkipAngle={10}
                          arcLabelsTextColor={{ from: 'color', modifiers: [['darker', 2]] }}
                          legends={commonLegends.map(l => ({ ...l, dataFrom: undefined, direction: 'column', anchor: 'right', translateY: 0, translateX: 140 }))}
                        />
                      );
                    }

                    return (
                      <div className="w-full h-full flex items-center justify-center text-muted-foreground bg-surface-secondary rounded-lg border border-dashed border-border">
                        {c.type} charts coming soon.
                      </div>
                    );
                  })()}
                </div>
              </figure>
            )}
          </section>
        ))}
      </article>
    </div>
  );
}
