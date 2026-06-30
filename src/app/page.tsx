"use client";

import React, { useState, useEffect } from "react";
import Link from "next/link";

const REGIONS = [
  {
    id: 0,
    tab: '🔔 Constitutional Foundation',
    lyric: '"Proclaim liberty throughout all the land unto all the inhabitants thereof." — Inscription on the Liberty Bell (Leviticus 25:10)',
    region: 'Founding Heritage',
    location: 'Reflecting Alexis de Tocqueville: "The institutions of a free people must be guarded by vigilance; our democratic heritage relies not on passive inheritance, but on active, transparent civic inquiry."',
    bg: '/bg-0.jpg',
    video: '/vid-0.mp4',
  },
  {
    id: 1,
    tab: '🌲 The American Wilderness',
    lyric: '"In wildness is the preservation of the world." — Henry David Thoreau',
    region: 'Ancient Woodlands',
    location: 'As John Muir wrote, going to the woods is going home. These towering ancient redwood stands remind us of deep time, ecological stewardship, and the peaceful grounding essential to a thriving democratic society.',
    bg: '/bg-1.jpg',
    video: '/vid-1.mp4',
  },
  {
    id: 2,
    tab: '🏜️ The Open Highway',
    lyric: '"Something hidden. Go and find it. Go and look behind the Ranges—Something lost behind the Ranges. Lost and waiting for you. Go!" — Rudyard Kipling',
    region: 'American Southwest',
    location: 'The open road is the ultimate American metaphor for rebirth and discovery. Wallace Stegner called the West the native home of hope, where boundless horizons invite limitless human potential.',
    bg: '/bg-2.jpg',
    video: '/vid-2.mp4',
  },
  {
    id: 3,
    tab: '🌄 Pastoral Heartlands',
    lyric: '"I know of no pursuit in which more real and important services can be rendered to any country than by improving its agriculture." — George Washington',
    region: 'Pastoral Heartlands',
    location: 'Agrarian localism and independent self-governance form the bedrock of American democracy. Wendell Berry reminds us that true community is rooted in affection for our local soil and neighbors.',
    bg: '/bg-3.jpg',
    video: '/vid-3.mp4',
  },
  {
    id: 4,
    tab: '🏔️ Desert Solitaire',
    lyric: '"Wilderness is not a luxury but a necessity of the human spirit." — Edward Abbey, Desert Solitaire',
    region: 'Monument Valley',
    location: 'Standing amidst the monolithic sandstone spires of Monument Valley, Edward Abbey urged us to preserve the silent, untamed sanctuaries of the American West as vital refuges for individual freedom.',
    bg: '/bg-4.jpg',
    video: '/vid-4.mp4',
  },
  {
    id: 5,
    tab: '✨ The Urban Frontier',
    lyric: '"Cities have the capability of providing something for everybody, only because, and only when, they are created by everybody." — Jane Jacobs, The Death and Life of Great American Cities',
    region: 'Metropolitan Core',
    location: 'The American metropolis is a dynamic engine of economic vitality and cultural melting pots, thriving through spontaneous human cooperation and transparent public innovation.',
    bg: '/bg-5.jpg',
    video: '/vid-5.mp4',
  },
  {
    id: 6,
    tab: '🇺🇸 Sovereign Unity',
    lyric: '"We are not enemies, but friends. We must not be enemies. Though passion may have strained, it must not break our bonds of affection." — Abraham Lincoln, First Inaugural Address',
    region: 'National Unity',
    location: 'The American republic endured through principled compromise and civic dedication. Our flag represents fifty distinct states united under the rule of law and constitutional liberty.',
    bg: '/bg-6.jpg',
    video: '/vid-6.mp4',
  },
  {
    id: 7,
    tab: '🏛️ The Public Commons',
    lyric: '"The public square is where our democratic discourse breathes." — Frederick Law Olmsted',
    region: 'Civic Life',
    location: 'From New England town greens to modern civic commons, well-designed public spaces nurture civic trust, open public dialogue, and active community engagement.',
    bg: '/bg-7.jpg',
    video: '/vid-7.mp4',
  },
  {
    id: 8,
    tab: '🌃 Eternal Vigilance',
    lyric: '"Sunlight is said to be the best of disinfectants; electric light the most efficient policeman." — Louis D. Brandeis, Other People\'s Money',
    region: 'Urban Transit',
    location: 'As modern cities operate around the clock, civic accountability and open public records ensure that our democratic institutions remain transparent, honest, and responsive to the people.',
    bg: '/bg-8.jpg',
    video: '/vid-8.mp4',
  },
  {
    id: 9,
    tab: '🏙️ City of Big Shoulders',
    lyric: '"Hog Butcher for the World, Tool Maker, Stacker of Wheat... Stormy, husky, brawling, City of the Big Shoulders." — Carl Sandburg, Chicago',
    region: 'Midwest Metropolis',
    location: 'Rising boldly along Lake Michigan, Chicago embodies American industrial muscle, monumental architecture inspired by Daniel Burnham, and relentless Midwestern determination.',
    bg: '/bg-9.jpg',
    video: '/vid-9.mp4',
  },
  {
    id: 10,
    tab: '🌅 Maritime Heritage',
    lyric: '"They that go down to the sea in ships, that do business in great waters; these see the works of the Lord, and his wonders in the deep." — Psalm 107:23',
    region: 'Coastal Promenades',
    location: 'America\'s deep-water ports and coastal harbors have connected domestic commerce to the globe for centuries, fostering trade, exploration, and vibrant maritime culture.',
    bg: '/bg-10.jpg',
    video: '/vid-10.mp4',
  },
  {
    id: 11,
    tab: '🎏 The Banner of Freedom',
    lyric: '"Let it be known that he who wears the flag of the United States wears the symbol of universal liberty." — Henry Ward Beecher',
    region: 'Patriotic Pride',
    location: 'Against clear blue skies, the emblem of our constitutional republic reminds us of our shared civic duty to preserve civil liberties and ensure equal justice under law.',
    bg: '/bg-11.jpg',
    video: '/vid-11.mp4',
  },
  {
    id: 12,
    tab: '🦅 Untamed Sovereignty',
    lyric: '"Nature holds the key to our aesthetic, intellectual, cognitive and even spiritual satisfaction." — E.O. Wilson',
    region: 'Untamed Wildlife',
    location: 'Chosen in 1782 as the national emblem, the bald eagle symbolizes strength, independence, and the resilience of historic American wildlife conservation efforts.',
    bg: '/bg-12.jpg',
    video: '/vid-12.mp4',
  },
  {
    id: 13,
    tab: '🥧 Hearth & Heritage',
    lyric: '"No matter what happens, the family dining table remains the center of American warmth and storytelling." — M.F.K. Fisher',
    region: 'Home & Hearth',
    location: 'Generational family recipes and neighborly gatherings reflect the grassroots hospitality, warmth, and enduring culinary traditions of American community life.',
    bg: '/bg-13.jpg',
    video: '/vid-13.mp4',
  },
  {
    id: 14,
    tab: '⚾ The National Pastime',
    lyric: '"Whoever wants to know the heart and mind of America had better learn baseball." — Jacques Barzun',
    region: 'Championship Stadiums',
    location: 'Under summer ballpark lights, baseball brings together diverse communities in shared celebration, embodying patience, teamwork, and timeless sporting tradition.',
    bg: '/bg-14.jpg',
    video: '/vid-14.mp4',
  },
  {
    id: 15,
    tab: '🏎️ Mechanical Ingenuity',
    lyric: '"I invented nothing new. I simply assembled the discoveries of other men behind whom were centuries of work." — Henry Ford',
    region: 'Automotive Ingenuity',
    location: 'From Detroit assembly lines to Route 66 car clubs, American automotive heritage celebrates mechanical craftsmanship, V8 horsepower, and the freedom of mobility.',
    bg: '/bg-15.jpg',
    video: '/vid-15.mp4',
  },
  {
    id: 16,
    tab: '🍔 Backyard Fellowship',
    lyric: '"Sharing a meal around an open grill is one of the oldest communal institutions in human history." — American Culinary Tradition',
    region: 'Backyard Barbecues',
    location: 'Summer backyard cookouts break down barriers, uniting neighbors and families over open grills, storytelling, and relaxed weekend camaraderie.',
    bg: '/bg-16.jpg',
    video: '/vid-16.mp4',
  },
  {
    id: 17,
    tab: '🌭 Summer Traditions',
    lyric: '"To roast an ear of corn or grill over an open flame is to partake in the unpretentious joys of American summer." — James Beard',
    region: 'Family Cookouts',
    location: 'Classic comfort food served straight from the flame highlights the accessible, communal, and festive spirit of neighborhood block parties across the nation.',
    bg: '/bg-17.jpg',
    video: '/vid-17.mp4',
  },
  {
    id: 18,
    tab: '🍋 Midsummer Independence',
    lyric: '"The Fourth of July is the day when we celebrate the birth of American independence with gratitude, picnic tables, and community joy." — David McCullough',
    region: 'Holiday Gatherings',
    location: 'Ice-Cold lemonade, star-spangled banners, and community picnics commemorate our founding charter, reminding us that democracy thrives best among friends.',
    bg: '/bg-18.jpg',
    video: '/vid-18.mp4',
  },
];

function RegionBackground({ reg, isActive, isNext }: { reg: typeof REGIONS[0], isActive: boolean, isNext: boolean }) {
  const [hasMounted, setHasMounted] = useState(isActive || isNext || reg.id === 0);
  const videoRef = React.useRef<HTMLVideoElement>(null);

  useEffect(() => {
    if (isActive || isNext) {
      setHasMounted(true);
    }
  }, [isActive, isNext]);

  useEffect(() => {
    if (!videoRef.current) return;
    if (isActive) {
      // Ensure smooth playback from the very beginning when transitioning in
      videoRef.current.currentTime = 0;
      videoRef.current.play().catch(() => {});
    } else if (isNext) {
      // Warm up decoder quietly
      videoRef.current.play().catch(() => {});
    } else {
      // Pause inactive videos so hardware decoders are not overloaded
      videoRef.current.pause();
    }
  }, [isActive, isNext, hasMounted]);

  return (
    <div 
      className={`absolute inset-0 pointer-events-none overflow-hidden transition-opacity duration-1000 ease-in-out ${
        isActive ? 'opacity-100' : 'opacity-0'
      }`}
      style={{ zIndex: isActive ? 1 : 0 }}
    >
      <div 
        className="absolute inset-0 bg-cover bg-center bg-no-repeat transform origin-center scale-[1.12]"
        style={{ backgroundImage: `url("${reg.bg}")` }}
      />
      {hasMounted && (
        <video
          ref={videoRef}
          src={reg.video}
          poster={reg.bg}
          loop
          muted
          playsInline
          preload="auto"
          className="absolute inset-0 w-full h-full object-cover transform origin-center scale-[1.12]"
        />
      )}
    </div>
  );
}

export default function MarketingHomePage() {
  const [shuffledIndices, setShuffledIndices] = useState<number[]>([]);
  const [currentIndex, setCurrentIndex] = useState(0);

  useEffect(() => {
    // Generate indices 0 to 18
    const indices = Array.from({ length: REGIONS.length }, (_, i) => i);
    // Fisher-Yates shuffle to randomize the order
    for (let i = indices.length - 1; i > 0; i--) {
      const j = Math.floor(Math.random() * (i + 1));
      [indices[i], indices[j]] = [indices[j], indices[i]];
    }
    setShuffledIndices(indices);

    const timer = setInterval(() => {
      setCurrentIndex((prev) => (prev + 1) % REGIONS.length);
    }, 6000);
    return () => clearInterval(timer);
  }, []);

  const activeRegion = shuffledIndices.length > 0 ? shuffledIndices[currentIndex] : 0;
  const nextRegion = shuffledIndices.length > 0 ? shuffledIndices[(currentIndex + 1) % REGIONS.length] : 0;
  const current = REGIONS[activeRegion];

  return (
    <div className="pb-24 font-sans">
      {/* Full-Width Edge-to-Edge Hero Section */}
      <section className="w-full text-center space-y-8 py-24 sm:py-32 bg-slate-950 text-white relative overflow-hidden border-b border-slate-800 shadow-2xl px-4 sm:px-6">
        {/* Optimized Layered Background Streams */}
        {REGIONS.map((reg) => (
          <RegionBackground 
            key={reg.id} 
            reg={reg} 
            isActive={activeRegion === reg.id} 
            isNext={nextRegion === reg.id} 
          />
        ))}
        {/* Dual Scrim Overlays for Perfect Text Readability */}
        <div className="absolute inset-0 bg-slate-950/30 pointer-events-none z-[2]" />
        <div className="absolute inset-0 bg-gradient-to-b from-slate-950/45 via-slate-950/15 to-slate-950 pointer-events-none z-[3]" />

        {/* Top Badges */}
        <div className="relative z-10 flex flex-wrap justify-center gap-3 mb-4">
          <span className="bg-amber-400/20 text-amber-300 font-bold text-xs px-3.5 py-1.5 rounded-full uppercase tracking-wider border border-amber-400/30 shadow-sm">
            FY26 FEMA HSGP Compliant
          </span>
          <span className="bg-slate-800/80 text-slate-200 font-bold text-xs px-3.5 py-1.5 rounded-full uppercase tracking-wider border border-slate-600 shadow-sm">
            Zero Cloud PII Exposure
          </span>
          <a 
            href="https://github.com/rorshockbtc/marigold" 
            target="_blank" 
            rel="noopener noreferrer"
            className="bg-white text-slate-950 font-bold text-xs px-3.5 py-1.5 rounded-full uppercase tracking-wider hover:bg-slate-200 transition-colors shadow-sm flex items-center gap-1.5"
          >
            <span>GitHub Open Source ↗</span>
          </a>
        </div>

        {/* Main Heading */}
        <h1 className="relative z-10 text-4xl sm:text-6xl lg:text-7xl font-serif font-bold tracking-tight text-white max-w-5xl mx-auto leading-tight drop-shadow-[0_4px_12px_rgba(0,0,0,0.9)]">
          Non-Partisan Civic Data Exploration
        </h1>
        
        <p className="relative z-10 text-lg sm:text-xl text-slate-200 max-w-3xl mx-auto leading-relaxed font-normal drop-shadow-[0_2px_8px_rgba(0,0,0,0.95)]">
          Making local public record review straightforward, safe, and transparent. Verify civic data directly on your own personal computer without programming expertise, expensive server costs, or transmitting private records across the internet.
        </p>

        {/* Editorial Reflection & Literary Facet Display */}
        <div className="relative z-10 pt-4 pb-2 max-w-3xl mx-auto flex flex-col items-center gap-3">
          <div className="inline-flex items-center gap-2 bg-slate-900/90 backdrop-blur-md border border-amber-500/40 px-5 py-2 rounded-full text-xs sm:text-sm text-amber-300 font-serif italic tracking-wide shadow-xl transition-all duration-500">
            <span>✨ {current.lyric}</span>
          </div>
          <div className="bg-slate-950/80 backdrop-blur-md border border-slate-700/80 px-6 py-3 rounded-2xl text-xs sm:text-sm text-slate-300 font-normal leading-relaxed shadow-2xl max-w-2xl text-center transition-all duration-500">
            {current.location}
          </div>
        </div>

        {/* Streamlined Action Buttons */}
        <div className="relative z-10 pt-4 flex flex-wrap justify-center items-center gap-4">
          <Link href="/sandbox" className="h-13 py-3.5 flex items-center justify-center px-8 text-base font-bold rounded-xl shadow-xl bg-amber-500 text-slate-950 hover:bg-amber-400 transition-all transform hover:-translate-y-0.5">
            Try Public Sandbox →
          </Link>
          <a href="#stakeholders" className="h-13 py-3.5 flex items-center justify-center px-8 text-base font-bold rounded-xl shadow-xl bg-slate-800 text-white border border-slate-600 hover:bg-slate-700 transition-all">
            Find Your Role Guide ↓
          </a>
        </div>

        <div className="relative z-10 pt-8 flex flex-wrap justify-center items-center gap-6 text-xs text-slate-400 font-bold uppercase tracking-wider border-t border-slate-800/80 max-w-2xl mx-auto mt-8">
          <span>100% Client-Side Memory</span>
          <span>•</span>
          <span>No PII Uploads</span>
          <span>•</span>
          <span>Wyoming LLC Built</span>
        </div>
      </section>

      {/* Main Container for Rest of Content */}
      <div className="space-y-20 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pt-16">
        {/* The Three Major Stakeholder Groups */}
        <section id="stakeholders" className="space-y-10 max-w-6xl mx-auto px-2 scroll-mt-24">
          <div className="text-center space-y-3">
          <h2 className="text-3xl sm:text-4xl font-serif font-bold text-primary">Engineered for Every Civic Stakeholder</h2>
          <p className="text-muted-foreground text-lg max-w-2xl mx-auto">Click any overview card below to read a clear, non-technical walkthrough tailored specifically for your role.</p>
        </div>

        <div className="grid md:grid-cols-3 gap-8">
          {/* Group 1: State Administrative Agencies */}
          <Link href="/solutions/state-agencies" className="bg-white p-8 rounded-2xl border border-border shadow-sm space-y-4 flex flex-col justify-between hover:border-sky-400 hover:shadow-md transition-all group cursor-pointer block">
            <div className="space-y-3">
              <span className="text-xs font-bold uppercase tracking-wider text-sky-700 bg-sky-100 px-3 py-1 rounded-md border border-sky-200 inline-block">
                State Level
              </span>
              <h3 className="text-2xl font-serif font-bold text-primary group-hover:text-sky-700 transition-colors">State Administrative Agencies (SAAs)</h3>
              <p className="text-sm text-slate-600 leading-relaxed">
                Safely fulfill mandatory **FEMA election security spend requirements** with zero embarrassing audit surprises. Professional verification structured as a flat-rate micro-purchase ($1,500/yr) that processes data inside local RAM without cloud risk.
              </p>
            </div>
            <div className="pt-4 border-t border-slate-100 flex items-center justify-between text-sm font-bold text-sky-700 group-hover:underline">
              <span>Read State Guide &amp; Procurement Details</span>
              <span className="transform group-hover:translate-x-1 transition-transform">→</span>
            </div>
          </Link>

          {/* Group 2: Citizens & Volunteers */}
          <Link href="/solutions/citizens" className="bg-white p-8 rounded-2xl border border-border shadow-sm space-y-4 flex flex-col justify-between hover:border-amber-400 hover:shadow-md transition-all group cursor-pointer block">
            <div className="space-y-3">
              <span className="text-xs font-bold uppercase tracking-wider text-amber-800 bg-amber-100 px-3 py-1 rounded-md border border-amber-200 inline-block">
                Citizen Level
              </span>
              <h3 className="text-2xl font-serif font-bold text-primary group-hover:text-amber-700 transition-colors">Citizen Auditors &amp; Volunteers</h3>
              <p className="text-sm text-slate-600 leading-relaxed">
                Written in plain, everyday language. You don&apos;t need to be a programmer to help maintain accurate community records. Think of Marigold as a smart magnifying glass that runs right on your computer desk with total privacy.
              </p>
            </div>
            <div className="pt-4 border-t border-slate-100 flex items-center justify-between text-sm font-bold text-amber-700 group-hover:underline">
              <span>Read Plain-Language Citizen Guide</span>
              <span className="transform group-hover:translate-x-1 transition-transform">→</span>
            </div>
          </Link>

          {/* Group 3: Civic Lead Groups */}
          <Link href="/solutions/organizations" className="bg-white p-8 rounded-2xl border border-border shadow-sm space-y-4 flex flex-col justify-between hover:border-emerald-400 hover:shadow-md transition-all group cursor-pointer block">
            <div className="space-y-3">
              <span className="text-xs font-bold uppercase tracking-wider text-emerald-800 bg-emerald-100 px-3 py-1 rounded-md border border-emerald-200 inline-block">
                Organization Level
              </span>
              <h3 className="text-2xl font-serif font-bold text-primary group-hover:text-emerald-700 transition-colors">Civic Integrity Networks</h3>
              <p className="text-sm text-slate-600 leading-relaxed">
                Unify your volunteer chapters across county lines. Share effective search queries and standardized review checklists exclusively with your trusted network—ensuring strategic alignment without broadcasting public data.
              </p>
            </div>
            <div className="pt-4 border-t border-slate-100 flex items-center justify-between text-sm font-bold text-emerald-700 group-hover:underline">
              <span>Read Coalition Collaboration Guide</span>
              <span className="transform group-hover:translate-x-1 transition-transform">→</span>
            </div>
          </Link>
        </div>
      </section>

      {/* How It Works (The In-Memory Engine) */}
      <section className="bg-slate-900 text-white rounded-3xl p-8 sm:p-14 shadow-xl space-y-10 max-w-6xl mx-auto">
        <div className="text-center space-y-3">
          <span className="bg-slate-800 text-amber-400 font-bold text-xs px-3.5 py-1.5 rounded uppercase tracking-wider border border-slate-700">
            The Technological Breakthrough
          </span>
          <h2 className="text-3xl sm:text-4xl font-serif font-bold">Inverting Traditional Cloud Architecture</h2>
          <p className="text-slate-300 text-base max-w-2xl mx-auto leading-relaxed">
            Traditional platforms force counties to upload sensitive citizen records to centralized cloud servers. Marigold brings the algorithms down to the local file instead.
          </p>
        </div>

        <div className="grid md:grid-cols-3 gap-8 pt-2">
          <div className="bg-slate-800/90 p-8 rounded-2xl border border-slate-700 space-y-3">
            <div className="text-sm font-bold text-amber-400 font-mono tracking-widest uppercase">Step 01</div>
            <h4 className="font-serif font-bold text-white text-xl">Download Checklist</h4>
            <p className="text-sm text-slate-300 leading-relaxed">
              Browse the public library and download a standardized text file (e.g., National Change of Address verification filter) directly to your computer.
            </p>
          </div>

          <div className="bg-slate-800/90 p-8 rounded-2xl border border-slate-700 space-y-3">
            <div className="text-sm font-bold text-amber-400 font-mono tracking-widest uppercase">Step 02</div>
            <h4 className="font-serif font-bold text-white text-xl">Select Local File</h4>
            <p className="text-sm text-slate-300 leading-relaxed">
              Open your jurisdiction&apos;s official spreadsheet on your computer. The browser maps columns securely in local computer RAM without internet upload.
            </p>
          </div>

          <div className="bg-slate-800/90 p-8 rounded-2xl border border-slate-700 space-y-3">
            <div className="text-sm font-bold text-amber-400 font-mono tracking-widest uppercase">Step 03</div>
            <h4 className="font-serif font-bold text-white text-xl">Instant Audit Results</h4>
            <p className="text-sm text-slate-300 leading-relaxed">
              Client-side memory processes up to 100,000 rows per second, isolating clerical formatting errors and formatting clean verification reports instantly.
            </p>
          </div>
        </div>
      </section>

      {/* Feature Showcase Grid */}
      <section className="space-y-8 max-w-6xl mx-auto px-2">
        <h2 className="text-3xl font-serif font-bold text-primary text-center">Explore Core System Modules</h2>
        <div className="grid sm:grid-cols-2 gap-6">
          <Link href="/store" className="bg-white p-8 rounded-2xl border border-border shadow-sm hover:shadow-md transition-all group flex justify-between items-center">
            <div className="space-y-2">
              <span className="text-xs font-bold text-accent uppercase tracking-wider font-mono">Shared Library</span>
              <h3 className="text-xl font-serif font-bold text-primary group-hover:text-accent transition-colors">National Audit Checklists</h3>
              <p className="text-sm text-muted-foreground leading-relaxed">Crowdsourced verification parameters shareable across state lines.</p>
            </div>
            <span className="text-2xl group-hover:translate-x-1 transition-transform font-light text-slate-400">→</span>
          </Link>

          <Link href="/data-linkage" className="bg-white p-8 rounded-2xl border border-border shadow-sm hover:shadow-md transition-all group flex justify-between items-center">
            <div className="space-y-2">
              <span className="text-xs font-bold text-emerald-700 uppercase tracking-wider font-mono">Statistical Matching</span>
              <h3 className="text-xl font-serif font-bold text-primary group-hover:text-emerald-700 transition-colors">Smart Duplicate Finder</h3>
              <p className="text-sm text-muted-foreground leading-relaxed">Test our probabilistic fuzzy linkage simulator directly in your browser.</p>
            </div>
            <span className="text-2xl group-hover:translate-x-1 transition-transform font-light text-slate-400">→</span>
          </Link>

          <Link href="/registry" className="bg-white p-8 rounded-2xl border border-border shadow-sm hover:shadow-md transition-all group flex justify-between items-center">
            <div className="space-y-2">
              <span className="text-xs font-bold text-sky-700 uppercase tracking-wider font-mono">50-State Index</span>
              <h3 className="text-xl font-serif font-bold text-primary group-hover:text-sky-700 transition-colors">State Acquisition Registry</h3>
              <p className="text-sm text-muted-foreground leading-relaxed">View formatting parameters and cost structures nationwide.</p>
            </div>
            <span className="text-2xl group-hover:translate-x-1 transition-transform font-light text-slate-400">→</span>
          </Link>

          <Link href="/roadmap" className="bg-white p-8 rounded-2xl border border-border shadow-sm hover:shadow-md transition-all group flex justify-between items-center">
            <div className="space-y-2">
              <span className="text-xs font-bold text-purple-700 uppercase tracking-wider font-mono">Civic Integration</span>
              <h3 className="text-xl font-serif font-bold text-primary group-hover:text-purple-700 transition-colors">Technical Roadmap</h3>
              <p className="text-sm text-muted-foreground leading-relaxed">Cross-agency integrations and federal grant alignment milestones.</p>
            </div>
            <span className="text-2xl group-hover:translate-x-1 transition-transform font-light text-slate-400">→</span>
          </Link>
        </div>
      </section>
      </div>
    </div>
  );
}
