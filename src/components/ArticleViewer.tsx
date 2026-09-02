import { ArticleState, ArticleSection } from '@/lib/types';
import { Save, Share2, AlertCircle, BarChart3, PieChart, TrendingUp } from 'lucide-react';
import { Button } from './ui/Button';
import { ChartRenderer } from './ChartRenderer';
import { useState, useEffect } from 'react';
import ReactMarkdown from 'react-markdown';
import { DecryptionEngine } from '@/lib/security/DecryptionEngine';
import { v4 as uuidv4 } from 'uuid';
import { publishStoryToFirestore } from '@/lib/firebase/firestore';
import { X } from 'lucide-react';

const scrubPII = (text: string): string => {
  if (!text) return text;
  let scrubbed = text;
  
  // Basic Email Scrubbing
  scrubbed = scrubbed.replace(/\b[A-Za-z0-9._%+-]+@[A-Za-z0-9.-]+\.[A-Z|a-z]{2,}\b/g, '[REDACTED EMAIL]');
  
  // Basic Phone Scrubbing (US style)
  scrubbed = scrubbed.replace(/\b(?:\+?1[-. ]?)?\(?([0-9]{3})\)?[-. ]?([0-9]{3})[-. ]?([0-9]{4})\b/g, '[REDACTED PHONE]');
  
  // Basic SSN or Voter ID (9-10 digits)
  scrubbed = scrubbed.replace(/\b\d{3}-\d{2}-\d{4}\b/g, '[REDACTED ID]');
  scrubbed = scrubbed.replace(/\b\d{9,10}\b/g, '[REDACTED ID]');
  
  // Basic Address pattern (e.g. 123 Main St)
  scrubbed = scrubbed.replace(/\b\d{1,5}\s+[a-zA-Z0-9\s]+(?:Street|St|Avenue|Ave|Road|Rd|Boulevard|Blvd|Lane|Ln|Drive|Dr|Court|Ct|Place|Pl|Terrace|Ter|Circle|Cir)\b/gi, '[REDACTED ADDRESS]');
  
  return scrubbed;
};

const sanitizeArticle = (article: ArticleState): ArticleState => {
  return {
    title: scrubPII(article.title),
    sections: article.sections ? article.sections.map(sec => ({
      ...sec,
      heading: scrubPII(sec.heading),
      narrative: scrubPII(sec.narrative),
      chart: sec.chart ? {
        ...sec.chart,
        xAxisLabel: scrubPII(sec.chart.xAxisLabel || ''),
        yAxisLabel: scrubPII(sec.chart.yAxisLabel || ''),
        series: sec.chart.series.map(s => ({
          ...s,
          id: scrubPII(s.id),
          data: s.data.map(d => ({
            ...d,
            x: typeof d.x === 'string' ? scrubPII(d.x) : d.x
          }))
        }))
      } : undefined
    })) : undefined,
    blocks: article.blocks ? article.blocks.map(block => ({
      ...block,
      content: {
        ...block.content,
        title: scrubPII(block.content.title || ''),
        narrative: scrubPII(block.content.narrative || ''),
        chartSpec: block.content.chartSpec ? {
          ...block.content.chartSpec,
          xAxisLabel: scrubPII(block.content.chartSpec.xAxisLabel || ''),
          yAxisLabel: scrubPII(block.content.chartSpec.yAxisLabel || ''),
          series: block.content.chartSpec.series.map(s => ({
            ...s,
            id: scrubPII(s.id),
            data: s.data.map(d => ({
              ...d,
              x: typeof d.x === 'string' ? scrubPII(d.x) : d.x
            }))
          }))
        } : undefined
      }
    })) : undefined
  };
};

export interface ArticleViewerProps {
  article: ArticleState;
  onPublishToGroup: () => void;
  onSaveLocally: () => void;
  isPublicView?: boolean;
  onBlockApprove?: (id: string) => void;
  onBlockReject?: (id: string) => void;
  onBlockDiscuss?: (id: string, content: string) => void;
}

export function ArticleViewer({ 
  article, 
  onPublishToGroup, 
  onSaveLocally, 
  isPublicView = false,
  onBlockApprove,
  onBlockReject,
  onBlockDiscuss
}: ArticleViewerProps) {
  const [displayArticle, setDisplayArticle] = useState<ArticleState>(article);
  const [isSaved, setIsSaved] = useState(false);
  const [isPublished, setIsPublished] = useState(false);

  const handleSaveClick = () => {
    setIsSaved(true);
    onSaveLocally();
    setTimeout(() => setIsSaved(false), 3000);
  };

  const [unsplashData, setUnsplashData] = useState<any>(null);

  useEffect(() => {
    if (!displayArticle.title) return;
    const fetchImage = async () => {
      try {
        const res = await fetch(`/api/unsplash?query=${encodeURIComponent(displayArticle.title)}`);
        const data = await res.json();
        if (data.url) {
          setUnsplashData(data);
          if (data.downloadLocation) {
            fetch('/api/unsplash/download', {
              method: 'POST',
              headers: { 'Content-Type': 'application/json' },
              body: JSON.stringify({ downloadLocation: data.downloadLocation })
            }).catch(() => {});
          }
        }
      } catch (e) {
        console.error("Failed to fetch Unsplash image", e);
      }
    };
    fetchImage();
  }, [displayArticle.title]);

  const [isPublishModalOpen, setIsPublishModalOpen] = useState(false);
  const [publishStatus, setPublishStatus] = useState<string | null>(null);
  const [publishedUrl, setPublishedUrl] = useState<string | null>(null);

  const handlePublishClick = () => {
    setIsPublishModalOpen(true);
  };

  const handlePublishToWorkspace = () => {
    setPublishStatus("Saving to Local Workspace...");
    const uid = uuidv4().substring(0, 8);
    if (typeof window !== 'undefined') {
      localStorage.setItem('marigold_published_story', JSON.stringify({ ...displayArticle, _publishId: uid }));
      setTimeout(() => {
        setPublishStatus(null);
        setIsPublishModalOpen(false);
        setIsPublished(true);
        onPublishToGroup();
        window.open(`/published?id=${uid}`, '_blank');
        setTimeout(() => setIsPublished(false), 3000);
      }, 800);
    }
  };

  const handlePublishToWeb = async () => {
    setPublishStatus("Scrubbing PII & Publishing to Web...");
    const uid = uuidv4().substring(0, 8);
    const sanitizedArticle = sanitizeArticle(displayArticle);
    const cleanForFirestore = JSON.parse(JSON.stringify(sanitizedArticle));
    
    const success = await publishStoryToFirestore(uid, cleanForFirestore);
    if (success) {
      if (typeof window !== 'undefined') {
        const url = `${window.location.origin}/published?id=${uid}`;
        setPublishedUrl(url);
        setPublishStatus("Published Successfully!");
      }
    } else {
      setPublishStatus("Failed to publish to the web.");
    }
  };

  useEffect(() => {
    async function hydrate() {
      if (!article) return;
      const next: ArticleState = {
        title: await DecryptionEngine.hydrateText(article.title),
      };
      
      if (article.sections && article.sections.length > 0) {
        next.sections = [];
        for (const sec of article.sections) {
          let cleanNarrative = "";
          if (sec.narrative) {
            const raw = await DecryptionEngine.hydrateText(sec.narrative);
            cleanNarrative = raw
              .replace(/\\n/g, '\n')
              .replace(/\\\*/g, '*')
              .replace(/\\_/g, '_')
              .replace(/\\#/g, '#');
          }

          const nextSec: ArticleSection = {
            id: sec.id,
            heading: sec.heading ? await DecryptionEngine.hydrateText(sec.heading) : "",
            narrative: cleanNarrative,
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
                   if (pt.x === undefined || pt.y === undefined) continue;
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
      }

      if (article.blocks && article.blocks.length > 0) {
        next.blocks = [];
        for (const block of article.blocks) {
          let cleanNarrative = "";
          if (block.content.narrative) {
            const raw = await DecryptionEngine.hydrateText(block.content.narrative);
            cleanNarrative = raw
              .replace(/\\n/g, '\n')
              .replace(/\\\*/g, '*')
              .replace(/\\_/g, '_')
              .replace(/\\#/g, '#');
          }
          
          const nextBlock = { ...block, content: { ...block.content, narrative: cleanNarrative } };
          if (block.content.title) nextBlock.content.title = await DecryptionEngine.hydrateText(block.content.title);
          
          if (block.content.chartSpec) {
            nextBlock.content.chartSpec = { ...block.content.chartSpec, series: [] };
            if (block.content.chartSpec.xAxisLabel) nextBlock.content.chartSpec.xAxisLabel = await DecryptionEngine.hydrateText(block.content.chartSpec.xAxisLabel);
            if (block.content.chartSpec.yAxisLabel) nextBlock.content.chartSpec.yAxisLabel = await DecryptionEngine.hydrateText(block.content.chartSpec.yAxisLabel);
            
            if (block.content.chartSpec.series) {
              for (const series of block.content.chartSpec.series) {
                 if (!series || !series.data) continue;
                 const seriesIdRaw = series.id || "Series";
                 const nextSeries = {
                   id: (await DecryptionEngine.hydrateText(seriesIdRaw)).replace(/\n/g, ' ').trim(),
                   data: [] as any[]
                 };
                 for (const pt of series.data) {
                   if (pt.x === undefined || pt.y === undefined) continue;
                   nextSeries.data.push({
                     x: typeof pt.x === 'string' ? (await DecryptionEngine.hydrateText(pt.x)).replace(/\n/g, ' ').trim() : String(pt.x),
                     y: Number(pt.y) || 0
                   });
                 }
                 nextBlock.content.chartSpec.series.push(nextSeries);
              }
            }
          }
          next.blocks.push(nextBlock);
        }
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
        <div className="flex items-center gap-3 shrink-0 print:hidden">
          {!isPublicView && (
            <>
              <Button onClick={() => window.print()} variant="outline" className="flex items-center gap-2">
                Export PDF
              </Button>
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

      {/* Publish Modal */}
      {isPublishModalOpen && (
        <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4">
          <div className="bg-surface border border-border shadow-2xl rounded-2xl w-full max-w-lg overflow-hidden flex flex-col">
            <div className="flex items-center justify-between p-4 border-b border-border bg-surface-hover">
              <h3 className="font-serif font-bold text-lg text-text-header flex items-center gap-2">
                <Share2 className="w-5 h-5 text-primary" /> Publish Story
              </h3>
              <button onClick={() => setIsPublishModalOpen(false)} className="text-muted-foreground hover:text-text-body transition-colors">
                <X className="w-5 h-5" />
              </button>
            </div>
            
            <div className="p-6 space-y-6">
              {publishStatus ? (
                <div className="text-center py-8">
                  <p className="text-lg font-serif font-medium text-text-header mb-4">{publishStatus}</p>
                  {publishedUrl && (
                    <div className="bg-surface-hover p-4 rounded-lg border border-border mb-4 break-all">
                      <a href={publishedUrl} target="_blank" rel="noopener noreferrer" className="text-blue-500 hover:underline">{publishedUrl}</a>
                    </div>
                  )}
                  {publishedUrl && (
                    <Button onClick={() => { navigator.clipboard.writeText(publishedUrl); setPublishStatus("Link Copied!"); }} variant="outline" className="w-full">
                      Copy Link
                    </Button>
                  )}
                </div>
              ) : (
                <>
                  <div className="space-y-4">
                    <Button onClick={handlePublishToWorkspace} variant="outline" className="w-full h-auto py-4 flex flex-col items-center gap-2 justify-center border-2 border-border hover:border-primary hover:bg-primary/5 transition-all">
                      <span className="font-bold text-lg">Private to Workspace</span>
                      <span className="text-sm font-normal text-muted-foreground text-center">Save this story to your local offline workspace. Fully private.</span>
                    </Button>
                    
                    <Button onClick={handlePublishToWeb} variant="outline" className="w-full h-auto py-4 flex flex-col items-center gap-2 justify-center border-2 border-border hover:border-blue-500 hover:bg-blue-500/5 transition-all">
                      <span className="font-bold text-lg text-blue-600">Publish to Public Web</span>
                      <span className="text-sm font-normal text-muted-foreground text-center px-4">Generate a shareable public URL. An aggressive PII scrubber will automatically redact names, emails, phones, and specific street addresses before publishing.</span>
                    </Button>
                  </div>
                </>
              )}
            </div>
          </div>
        </div>
      )}

      {/* Article Body */}
      <article className="max-w-3xl mx-auto px-8 py-12 space-y-12">
        <header className="mb-12">
          {unsplashData && (
            <div 
              className="w-full h-64 md:h-80 rounded-2xl mb-8 relative overflow-hidden shadow-2xl transition-all duration-500 group"
              style={{
                backgroundImage: `url(${unsplashData.url})`,
                backgroundSize: 'cover',
                backgroundPosition: 'center'
              }}
            >
              <div className="absolute inset-0 bg-gradient-to-t from-[#1A1A1A] via-transparent to-transparent opacity-80" />
              <div className="absolute bottom-4 left-6 text-white">
                <h1 className="text-3xl md:text-4xl font-serif font-bold shadow-sm">{displayArticle.title}</h1>
              </div>
              
              {/* Attribution */}
              <div className="absolute top-4 right-4 opacity-0 group-hover:opacity-100 transition-opacity bg-black/60 backdrop-blur-md text-xs text-white px-3 py-1 rounded-full pointer-events-auto shadow-lg">
                Photo by <a href={unsplashData.photographerUrl} target="_blank" rel="noopener noreferrer" className="underline hover:text-blue-300">{unsplashData.photographerName}</a> on <a href="https://unsplash.com/?utm_source=marigold_insights&utm_medium=referral" target="_blank" rel="noopener noreferrer" className="underline hover:text-blue-300">Unsplash</a>
              </div>
            </div>
          )}
          {!unsplashData && (
            <h1 className="text-4xl md:text-5xl font-serif font-bold text-text-header leading-tight mb-6">
              {displayArticle.title}
            </h1>
          )}
          <hr className="border-border-soft" />
        </header>

        {displayArticle.sections && displayArticle.sections.map((section) => (
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
              <ChartRenderer chart={section.chart} />
            )}
          </section>
        ))}

        {displayArticle.blocks && displayArticle.blocks.map((block) => (
          <section key={block.id} className={`space-y-6 ${block.status === 'proposed' ? 'border-l-4 border-amber-500 pl-4 bg-amber-500/5 py-4 rounded-r-lg' : ''} ${block.status === 'rejected' ? 'hidden' : ''}`}>
            {block.status === 'proposed' && (
              <div className="flex items-center justify-between bg-amber-500/10 p-3 rounded-md mb-4 border border-amber-500/20">
                <div className="flex items-center gap-2">
                  <span className="text-xs font-bold uppercase tracking-wider text-amber-700">Proposed Block</span>
                  <span className="text-xs text-amber-600/70 font-mono">({block.type})</span>
                </div>
                <div className="flex items-center gap-2">
                  {onBlockDiscuss && (
                    <Button variant="outline" size="sm" onClick={() => onBlockDiscuss(block.id, block.content.narrative || '')} className="text-xs h-8 border-amber-500/30 text-amber-700 hover:bg-amber-500/10">
                      Discuss
                    </Button>
                  )}
                  {onBlockReject && (
                    <Button variant="outline" size="sm" onClick={() => onBlockReject(block.id)} className="text-xs h-8 border-rose-500/30 text-rose-700 hover:bg-rose-500/10">
                      Reject
                    </Button>
                  )}
                  {onBlockApprove && (
                    <Button size="sm" onClick={() => onBlockApprove(block.id)} className="text-xs h-8 bg-amber-600 hover:bg-amber-700 text-white">
                      Approve
                    </Button>
                  )}
                </div>
              </div>
            )}

            {block.content.title && (
              <h2 className="text-2xl font-serif font-bold text-text-header mt-8 mb-4">
                {block.content.title}
              </h2>
            )}
            
            {block.content.narrative && (
              <div className={`prose prose-lg max-w-none text-text-body leading-relaxed markdown-content ${block.status === 'proposed' ? 'text-text-body/90' : ''}`}>
                <ReactMarkdown>{block.content.narrative}</ReactMarkdown>
              </div>
            )}

            {block.content.chartSpec && block.content.chartSpec.series && block.content.chartSpec.series.length > 0 && (
              <ChartRenderer chart={block.content.chartSpec} />
            )}
          </section>
        ))}
      </article>
    </div>
  );
}
