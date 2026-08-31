import React, { useState, useEffect } from 'react';
import { Image, ImageOff, RefreshCw, LayoutTemplate, BoxSelect } from 'lucide-react';

interface EditorialBriefingProps {
  narrative: string;
}

interface UnsplashData {
  url: string;
  photographerName: string;
  photographerUrl: string;
  downloadLocation: string;
}

export const EditorialBriefing: React.FC<EditorialBriefingProps> = ({ narrative }) => {
  const [tone, setTone] = useState<'plain' | 'professional'>('plain');
  const [imageStyle, setImageStyle] = useState<'banner' | 'glass' | 'hidden'>('banner');
  const [unsplashData, setUnsplashData] = useState<UnsplashData | null>(null);
  const [isFetchingImage, setIsFetchingImage] = useState(false);

  const fetchImage = async () => {
    setIsFetchingImage(true);
    try {
      // Use a generic term related to the application for the query
      const res = await fetch('/api/unsplash?query=election%20data%20politics');
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
      console.error(e);
    }
    setIsFetchingImage(false);
  };

  useEffect(() => {
    fetchImage();
  }, []);

  return (
    <div className={`relative w-full ${imageStyle === 'glass' ? 'min-h-[600px]' : ''}`}>
      
      {/* Glassmorphism Background layer */}
      {imageStyle === 'glass' && unsplashData && (
        <div 
          className="absolute inset-0 z-0 opacity-40 mix-blend-overlay transition-all duration-1000"
          style={{
            backgroundImage: `url(${unsplashData.url})`,
            backgroundSize: 'cover',
            backgroundPosition: 'center',
            backgroundAttachment: 'fixed',
            filter: 'blur(24px)'
          }}
        />
      )}

      {/* Content Container */}
      <div className="relative z-10 max-w-4xl mx-auto py-8 px-4">
        
        {/* Banner Mode */}
        {imageStyle === 'banner' && unsplashData && (
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
              <h2 className="text-3xl font-serif font-bold shadow-sm">Marigold Intelligence Briefing</h2>
            </div>
            
            {/* Attribution */}
            <div className="absolute top-4 right-4 opacity-0 group-hover:opacity-100 transition-opacity bg-black/60 backdrop-blur-md text-xs text-white px-3 py-1 rounded-full pointer-events-auto shadow-lg">
              Photo by <a href={unsplashData.photographerUrl} target="_blank" rel="noopener noreferrer" className="underline hover:text-blue-300">{unsplashData.photographerName}</a> on <a href="https://unsplash.com/?utm_source=marigold_insights&utm_medium=referral" target="_blank" rel="noopener noreferrer" className="underline hover:text-blue-300">Unsplash</a>
            </div>
          </div>
        )}

        {/* Controls */}
        <div className="flex flex-wrap justify-between items-center mb-8 gap-4 bg-[#2A2D35]/80 backdrop-blur-md p-3 rounded-2xl border border-gray-700/50 shadow-lg">
          {imageStyle !== 'banner' && (
            <h2 className="text-xl font-serif text-white font-bold px-3">Intelligence Briefing</h2>
          )}
          
          <div className="flex items-center gap-2 ml-auto">
            <div className="flex bg-[#1E2025] rounded-xl p-1 border border-gray-800">
              <button
                onClick={() => setTone('plain')}
                className={`px-3 py-1.5 text-xs font-bold rounded-lg transition-colors ${
                  tone === 'plain' ? 'bg-[#D96B27] text-white shadow-md' : 'text-gray-400 hover:text-white hover:bg-gray-800'
                }`}
              >
                Plain English
              </button>
              <button
                onClick={() => setTone('professional')}
                className={`px-3 py-1.5 text-xs font-bold rounded-lg transition-colors ${
                  tone === 'professional' ? 'bg-[#D96B27] text-white shadow-md' : 'text-gray-400 hover:text-white hover:bg-gray-800'
                }`}
              >
                Verbose
              </button>
            </div>

            <div className="h-6 w-px bg-gray-700 mx-1" />

            {/* Visual Controls */}
            <div className="flex bg-[#1E2025] rounded-xl p-1 border border-gray-800 text-gray-400">
              <button
                title="Banner Mode"
                onClick={() => setImageStyle('banner')}
                className={`p-1.5 rounded-lg transition-colors ${imageStyle === 'banner' ? 'bg-gray-700 text-white shadow-sm' : 'hover:text-white hover:bg-gray-800'}`}
              >
                <LayoutTemplate className="w-4 h-4" />
              </button>
              <button
                title="Glassmorphism Mode"
                onClick={() => setImageStyle('glass')}
                className={`p-1.5 rounded-lg transition-colors ${imageStyle === 'glass' ? 'bg-gray-700 text-white shadow-sm' : 'hover:text-white hover:bg-gray-800'}`}
              >
                <BoxSelect className="w-4 h-4" />
              </button>
              <button
                title="Hide Image"
                onClick={() => setImageStyle('hidden')}
                className={`p-1.5 rounded-lg transition-colors ${imageStyle === 'hidden' ? 'bg-gray-700 text-white shadow-sm' : 'hover:text-white hover:bg-gray-800'}`}
              >
                <ImageOff className="w-4 h-4" />
              </button>
            </div>

            {imageStyle !== 'hidden' && (
              <button
                onClick={fetchImage}
                disabled={isFetchingImage}
                title="Regenerate Image"
                className="p-2 ml-1 bg-[#1E2025] border border-gray-800 text-gray-400 hover:text-white hover:bg-gray-800 rounded-xl transition-colors disabled:opacity-50"
              >
                <RefreshCw className={`w-4 h-4 ${isFetchingImage ? 'animate-spin' : ''}`} />
              </button>
            )}

            <div className="h-6 w-px bg-gray-700 mx-1" />

            <button
              onClick={() => {
                navigator.clipboard.writeText(narrative.replace(/\\n/g, '\n'));
                alert("Briefing copied to clipboard!");
              }}
              className="px-4 py-1.5 bg-[#2D3A34] border border-[#8C9E8C] text-[#E5E5E5] text-xs font-bold rounded-lg hover:bg-opacity-80 transition-colors"
            >
              Copy Briefing
            </button>
          </div>
        </div>
        
        {/* Attribution for Glassmorphism */}
        {imageStyle === 'glass' && unsplashData?.photographerName && (
           <div className="mb-6 text-right text-xs text-gray-500 font-medium">
             Background Photo by <a href={unsplashData.photographerUrl} target="_blank" rel="noopener noreferrer" className="underline hover:text-gray-300">{unsplashData.photographerName}</a> on <a href="https://unsplash.com/?utm_source=marigold_insights&utm_medium=referral" target="_blank" rel="noopener noreferrer" className="underline hover:text-gray-300">Unsplash</a>
           </div>
        )}

        <div className={`prose prose-invert prose-lg text-gray-300 max-w-none ${imageStyle === 'glass' ? 'drop-shadow-lg' : ''}`}>
          {narrative.split('\\n').map((paragraph, idx) => (
            <p key={idx} className="mb-6 leading-relaxed font-serif text-[17px] tracking-wide">
              {paragraph}
            </p>
          ))}
        </div>
      </div>
    </div>
  );
};
