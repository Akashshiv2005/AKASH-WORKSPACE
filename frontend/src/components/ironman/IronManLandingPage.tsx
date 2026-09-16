import React, { useCallback, useEffect, useRef, useState } from 'react';
import { Shield, ArrowRight, Layout } from 'lucide-react';

const FRAME_COUNT_1 = 169;
const FRAME_COUNT_2 = 169;

const getFramePath1 = (index: number) => {
  const num = String(index + 1).padStart(4, '0');
  return `/frames/frame_${num}.jpg`;
};

const getFramePath2 = (index: number) => {
  const num = String(index + 1).padStart(4, '0');
  return `/frames2/frame_${num}.jpg`;
};

interface Dialogue {
  id: string;
  show: number;
  hide: number;
  quote: string;
  speaker: string;
  film: string;
}

const DIALOGUES_HERO: Dialogue[] = [
  {
    id: 'd1',
    show: 0.1,
    hide: 0.3,
    quote: 'Sometimes you gotta run before you can walk.',
    speaker: 'Tony Stark',
    film: 'IRON MAN — 2008',
  },
  {
    id: 'd2',
    show: 0.35,
    hide: 0.55,
    quote: 'Genius. Billionaire. Playboy. Philanthropist.',
    speaker: 'Tony Stark',
    film: 'THE AVENGERS — 2012',
  },
  {
    id: 'd3',
    show: 0.6,
    hide: 0.85,
    quote: 'Part of the journey is the end.',
    speaker: 'Tony Stark',
    film: 'AVENGERS: ENDGAME — 2019',
  },
];

const DIALOGUES_CINE: Dialogue[] = [
  {
    id: 'c1',
    show: 0.15,
    hide: 0.4,
    quote: 'I am Inevitable.',
    speaker: 'Thanos',
    film: 'AVENGERS: ENDGAME — 2019',
  },
  {
    id: 'c2',
    show: 0.45,
    hide: 0.75,
    quote: 'And I... am... Iron Man.',
    speaker: 'Tony Stark',
    film: 'AVENGERS: ENDGAME — 2019',
  },
];

interface IronManLandingPageProps {
  onEnterWorkspace: () => void;
}

export const IronManLandingPage: React.FC<IronManLandingPageProps> = ({ onEnterWorkspace }) => {
  const containerRef = useRef<HTMLDivElement | null>(null);
  
  // Section 1: Hero Canvas Refs
  const section1Ref = useRef<HTMLDivElement | null>(null);
  const canvas1Ref = useRef<HTMLCanvasElement | null>(null);
  const frames1Ref = useRef<HTMLImageElement[]>([]);
  const lastFrame1Ref = useRef<number>(0);

  // Section 2: Cinematic Canvas Refs
  const section2Ref = useRef<HTMLDivElement | null>(null);
  const canvas2Ref = useRef<HTMLCanvasElement | null>(null);
  const frames2Ref = useRef<HTMLImageElement[]>([]);
  const lastFrame2Ref = useRef<number>(0);

  const tickingRef = useRef<boolean>(false);
  const [loaded, setLoaded] = useState<boolean>(false);
  const [loadProgress, setLoadProgress] = useState<number>(0);

  const [visibleHeroCards, setVisibleHeroCards] = useState<Set<string>>(new Set());
  const [visibleCineCards, setVisibleCineCards] = useState<Set<string>>(new Set());
  const [scrollPercent2, setScrollPercent2] = useState<number>(0);

  // Preload frame sequences (frames and frames2)
  useEffect(() => {
    let cancelled = false;
    let count1 = 0;
    let count2 = 0;
    const imgs1: HTMLImageElement[] = [];
    const imgs2: HTMLImageElement[] = [];

    const totalToLoad = FRAME_COUNT_1 + FRAME_COUNT_2;

    const checkComplete = () => {
      const totalLoaded = count1 + count2;
      setLoadProgress(Math.round((totalLoaded / totalToLoad) * 100));
      if (totalLoaded >= totalToLoad) {
        setLoaded(true);
      }
    };

    for (let i = 0; i < FRAME_COUNT_1; i++) {
      const img = new Image();
      img.src = getFramePath1(i);
      img.onload = img.onerror = () => {
        if (cancelled) return;
        count1++;
        checkComplete();
      };
      imgs1.push(img);
    }
    frames1Ref.current = imgs1;

    for (let i = 0; i < FRAME_COUNT_2; i++) {
      const img = new Image();
      img.src = getFramePath2(i);
      img.onload = img.onerror = () => {
        if (cancelled) return;
        count2++;
        checkComplete();
      };
      imgs2.push(img);
    }
    frames2Ref.current = imgs2;

    return () => {
      cancelled = true;
    };
  }, []);

  const drawFrame1 = useCallback((index: number) => {
    const canvas = canvas1Ref.current;
    if (!canvas) return;
    const img = frames1Ref.current[index];
    if (!img || !img.complete || !img.naturalWidth) return;

    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    const cw = canvas.width;
    const ch = canvas.height;
    const imgRatio = img.naturalWidth / img.naturalHeight;
    const canvasRatio = cw / ch;

    let drawW: number;
    let drawH: number;

    if (canvasRatio > imgRatio) {
      drawW = cw;
      drawH = cw / imgRatio;
    } else {
      drawH = ch;
      drawW = ch * imgRatio;
    }

    if (window.innerWidth <= 768) {
      drawW *= 1.25;
      drawH *= 1.25;
    }

    const drawX = (cw - drawW) / 2;
    const drawY = (ch - drawH) / 2;

    ctx.clearRect(0, 0, cw, ch);
    ctx.drawImage(img, drawX, drawY, drawW, drawH);
  }, []);

  const drawFrame2 = useCallback((index: number) => {
    const canvas = canvas2Ref.current;
    if (!canvas) return;
    const img = frames2Ref.current[index];
    if (!img || !img.complete || !img.naturalWidth) return;

    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    const cw = canvas.width;
    const ch = canvas.height;
    const imgRatio = img.naturalWidth / img.naturalHeight;
    const canvasRatio = cw / ch;

    let drawW: number;
    let drawH: number;

    if (canvasRatio > imgRatio) {
      drawW = cw;
      drawH = cw / imgRatio;
    } else {
      drawH = ch;
      drawW = ch * imgRatio;
    }

    if (window.innerWidth <= 768) {
      drawW *= 1.25;
      drawH *= 1.25;
    }

    const drawX = (cw - drawW) / 2;
    const drawY = (ch - drawH) / 2;

    ctx.clearRect(0, 0, cw, ch);
    ctx.drawImage(img, drawX, drawY, drawW, drawH);
  }, []);

  const resizeCanvases = useCallback(() => {
    const dpr = window.devicePixelRatio || 1;
    const width = window.innerWidth;
    const height = window.innerHeight;

    if (canvas1Ref.current) {
      const c1 = canvas1Ref.current;
      c1.width = width * dpr;
      c1.height = height * dpr;
      c1.style.width = `${width}px`;
      c1.style.height = `${height}px`;
      const ctx1 = c1.getContext('2d');
      if (ctx1) ctx1.scale(dpr, dpr);
      drawFrame1(lastFrame1Ref.current);
    }

    if (canvas2Ref.current) {
      const c2 = canvas2Ref.current;
      c2.width = width * dpr;
      c2.height = height * dpr;
      c2.style.width = `${width}px`;
      c2.style.height = `${height}px`;
      const ctx2 = c2.getContext('2d');
      if (ctx2) ctx2.scale(dpr, dpr);
      drawFrame2(lastFrame2Ref.current);
    }
  }, [drawFrame1, drawFrame2]);

  useEffect(() => {
    resizeCanvases();
    window.addEventListener('resize', resizeCanvases);
    return () => window.removeEventListener('resize', resizeCanvases);
  }, [resizeCanvases]);

  useEffect(() => {
    if (loaded) {
      drawFrame1(0);
      drawFrame2(0);
    }
  }, [loaded, drawFrame1, drawFrame2]);

  const updateScrollProgress = useCallback(() => {
    if (tickingRef.current) return;
    tickingRef.current = true;

    requestAnimationFrame(() => {
      tickingRef.current = false;

      // Calculate progress for Section 1 (Hero)
      if (section1Ref.current) {
        const rect1 = section1Ref.current.getBoundingClientRect();
        const scrollable1 = section1Ref.current.offsetHeight - window.innerHeight;
        const progress1 = scrollable1 <= 0 ? 0 : Math.min(1, Math.max(0, -rect1.top / scrollable1));

        const frameIndex1 = Math.min(FRAME_COUNT_1 - 1, Math.floor(progress1 * FRAME_COUNT_1));
        if (frameIndex1 !== lastFrame1Ref.current) {
          lastFrame1Ref.current = frameIndex1;
          drawFrame1(frameIndex1);
        }

        const newHeroVisible = new Set<string>();
        for (const d of DIALOGUES_HERO) {
          if (progress1 >= d.show && progress1 <= d.hide) {
            newHeroVisible.add(d.id);
          }
        }
        setVisibleHeroCards(newHeroVisible);
      }

      // Calculate progress for Section 2 (Cinematic Reveal)
      if (section2Ref.current) {
        const rect2 = section2Ref.current.getBoundingClientRect();
        const scrollable2 = section2Ref.current.offsetHeight - window.innerHeight;
        const progress2 = scrollable2 <= 0 ? 0 : Math.min(1, Math.max(0, -rect2.top / scrollable2));
        setScrollPercent2(Math.round(progress2 * 100));

        const frameIndex2 = Math.min(FRAME_COUNT_2 - 1, Math.floor(progress2 * FRAME_COUNT_2));
        if (frameIndex2 !== lastFrame2Ref.current) {
          lastFrame2Ref.current = frameIndex2;
          drawFrame2(frameIndex2);
        }

        const newCineVisible = new Set<string>();
        for (const d of DIALOGUES_CINE) {
          if (progress2 >= d.show && progress2 <= d.hide) {
            newCineVisible.add(d.id);
          }
        }
        setVisibleCineCards(newCineVisible);
      }
    });
  }, [drawFrame1, drawFrame2]);

  useEffect(() => {
    const container = containerRef.current;
    const handleScroll = () => updateScrollProgress();

    window.addEventListener('scroll', handleScroll, { passive: true });
    if (container) {
      container.addEventListener('scroll', handleScroll, { passive: true });
    }
    updateScrollProgress();

    return () => {
      window.removeEventListener('scroll', handleScroll);
      if (container) {
        container.removeEventListener('scroll', handleScroll);
      }
    };
  }, [updateScrollProgress]);

  return (
    <div
      ref={containerRef}
      onScroll={updateScrollProgress}
      className="fixed inset-0 h-screen w-screen overflow-y-auto overflow-x-hidden bg-[#0a0a0b] text-white font-['Sora'] select-none z-40"
    >
      {/* Top Stark Navbar */}
      <header className="fixed inset-x-0 top-0 z-50 bg-transparent border-none pointer-events-auto">
        <div className="max-w-7xl mx-auto px-6 py-4 flex items-center justify-between">
          <div className="flex items-center space-x-3">
            <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-red-600 via-amber-500 to-red-700 flex items-center justify-center text-white shadow-lg shadow-red-950/50">
              <Shield className="w-4 h-4 fill-white text-white" />
            </div>
            <div>
              <span className="font-mono text-[10px] font-black uppercase tracking-[0.3em] text-amber-400 drop-shadow">
                STARK INDUSTRIES
              </span>
              <h1 className="text-xs font-black tracking-wider text-white drop-shadow-md">AKASH WORKSPACE OS</h1>
            </div>
          </div>

          <div className="flex items-center space-x-4">
            <button
              onClick={onEnterWorkspace}
              className="flex items-center space-x-2 px-5 py-2 rounded-full bg-gradient-to-r from-red-600 via-orange-500 to-amber-500 hover:from-red-500 hover:to-amber-400 text-white font-extrabold text-xs shadow-xl shadow-red-600/40 hover:scale-105 active:scale-95 transition-all duration-300 border border-amber-400/40"
            >
              <Layout className="w-4 h-4" />
              <span>MY WORKSPACE</span>
              <ArrowRight className="w-4 h-4" />
            </button>
          </div>
        </div>
      </header>

      {/* SECTION 1: HERO SUIT UP CANVAS */}
      <div ref={section1Ref} className="relative h-[250vh] w-full">
        <div className="sticky top-0 h-screen w-full overflow-hidden">
          <canvas ref={canvas1Ref} className="absolute inset-0 h-full w-full object-cover" />
          <div
            className="absolute inset-0 pointer-events-none"
            style={{
              background:
                'radial-gradient(140% 90% at 50% 50%, transparent 40%, rgba(10,10,11,0.4) 70%, rgba(10,10,11,0.85) 100%)',
            }}
          />

          {/* HUD Corner Accents */}
          <div className="pointer-events-none absolute left-6 top-20 text-amber-500/80">
            <div className="border-l-2 border-t-2 border-amber-500 w-6 h-6" />
          </div>
          <div className="pointer-events-none absolute right-6 top-20 text-amber-500/80">
            <div className="border-r-2 border-t-2 border-amber-500 w-6 h-6" />
          </div>
          <div className="pointer-events-none absolute bottom-16 left-6 text-amber-500/80">
            <div className="border-l-2 border-b-2 border-amber-500 w-6 h-6" />
          </div>
          <div className="pointer-events-none absolute bottom-16 right-6 text-amber-500/80">
            <div className="border-r-2 border-b-2 border-amber-500 w-6 h-6" />
          </div>

          <div className="pointer-events-none absolute left-6 md:left-12 top-20 z-20 flex items-center space-x-2 font-mono text-[10px] uppercase tracking-[0.28em] text-zinc-400">
            <span className="w-2 h-2 rounded-full bg-amber-400 animate-ping" />
            <span>Telemetry Link &mdash; MARK LXXXV ONLINE</span>
          </div>

          <div className="pointer-events-none absolute right-6 md:right-12 top-20 z-20 flex items-center space-x-2 font-mono text-[10px] uppercase tracking-[0.28em] text-amber-400">
            <span>Arc Reactor Power &mdash; 98.7%</span>
          </div>

          {/* Hero Left Text Overlay */}
          <div className="absolute left-6 md:left-12 bottom-24 md:bottom-28 z-20 max-w-sm sm:max-w-md space-y-4">
            <h1 className="text-4xl sm:text-6xl font-black tracking-tight text-white leading-none drop-shadow-2xl">
              I am <br />
              <span className="bg-gradient-to-r from-[#dc2626] via-[#ea580c] to-[#f59e0b] bg-clip-text text-transparent filter drop-shadow">
                Iron Man.
              </span>
            </h1>

            <p className="text-zinc-300 text-xs sm:text-sm leading-relaxed max-w-xs sm:max-w-sm drop-shadow">
              Engineered with precision. Scroll down to suit up or launch the interactive Akash Workspace dashboard.
            </p>

            <div className="pt-2 flex items-center space-x-4">
              <button
                onClick={onEnterWorkspace}
                className="px-5 py-3 rounded-2xl bg-gradient-to-r from-red-700 via-red-600 to-amber-500 hover:from-red-600 hover:to-amber-400 text-white font-black text-xs sm:text-sm shadow-2xl shadow-red-950/60 hover:scale-105 active:scale-95 transition-all flex items-center space-x-2.5 border border-amber-400/40 pointer-events-auto"
              >
                <Layout className="w-4 h-4" />
                <span>ENTER AKASH WORKSPACE</span>
                <ArrowRight className="w-4 h-4" />
              </button>
            </div>
          </div>

          {/* Dialogue Cards for Hero */}
          {DIALOGUES_HERO.map((d) => {
            const isVisible = visibleHeroCards.has(d.id);
            return (
              <div
                key={d.id}
                className={`absolute right-8 top-1/3 z-30 max-w-md p-6 rounded-2xl bg-[#0c0c0e]/95 backdrop-blur-xl border border-red-900/40 text-white shadow-2xl shadow-red-950/50 transition-all duration-500 ${
                  isVisible ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-8 pointer-events-none'
                }`}
              >
                <blockquote className="text-lg font-bold italic leading-relaxed text-zinc-100">
                  "{d.quote}"
                </blockquote>
                <div className="mt-4 flex items-center justify-between border-t border-white/10 pt-3">
                  <span className="text-xs font-semibold text-zinc-300">{d.speaker}</span>
                  <span className="font-mono text-[10px] text-amber-400 uppercase tracking-widest">
                    {d.film}
                  </span>
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* SECTION 2: CINEMATIC REVEAL (MARK III / TITAN II) */}
      <div ref={section2Ref} className="relative h-[250vh] w-full border-t border-white/10">
        <div className="sticky top-0 h-screen w-full overflow-hidden">
          <canvas ref={canvas2Ref} className="absolute inset-0 h-full w-full object-cover" />
          <div
            className="absolute inset-0 pointer-events-none"
            style={{
              background:
                'radial-gradient(140% 90% at 50% 50%, transparent 40%, rgba(10,10,11,0.4) 70%, rgba(10,10,11,0.85) 100%)',
            }}
          />

          <div className="pointer-events-none absolute left-6 md:left-12 top-20 z-20 flex items-center space-x-2 font-mono text-[10px] uppercase tracking-[0.28em] text-amber-400">
            <span>FLIGHT LOG // TITAN II ARCHIVE</span>
          </div>

          <div className="pointer-events-none absolute right-6 md:right-12 top-20 z-20 flex items-center space-x-2 font-mono text-[10px] uppercase tracking-[0.28em] text-zinc-400">
            <span>SEQ 002 // {scrollPercent2}%</span>
          </div>

          {/* Dialogue Cards for Cinematic Reveal */}
          {DIALOGUES_CINE.map((d) => {
            const isVisible = visibleCineCards.has(d.id);
            return (
              <div
                key={d.id}
                className={`absolute left-8 top-1/3 z-30 max-w-md p-6 rounded-2xl bg-[#141416]/90 backdrop-blur-xl border border-amber-500/30 text-white shadow-2xl transition-all duration-500 ${
                  isVisible ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-8 pointer-events-none'
                }`}
              >
                <blockquote className="text-xl font-bold italic leading-relaxed text-amber-400">
                  "{d.quote}"
                </blockquote>
                <div className="mt-4 flex items-center justify-between border-t border-white/10 pt-3">
                  <span className="text-xs font-semibold text-zinc-300">{d.speaker}</span>
                  <span className="font-mono text-[10px] text-zinc-400 uppercase tracking-widest">
                    {d.film}
                  </span>
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* Initial Loading Screen overlay */}
      {!loaded && (
        <div className="fixed inset-0 z-50 bg-[#0a0a0b] flex flex-col items-center justify-center p-6 space-y-4">
          <div className="w-12 h-12 rounded-2xl bg-gradient-to-br from-red-600 to-amber-500 flex items-center justify-center text-white shadow-2xl animate-bounce">
            <Shield className="w-6 h-6" />
          </div>
          <h2 className="text-sm font-mono uppercase tracking-[0.3em] text-amber-400 font-bold">
            SUIT UP PROTOCOL // BOOTING
          </h2>
          <div className="w-64 h-1.5 bg-zinc-800 rounded-full overflow-hidden">
            <div
              className="h-full bg-gradient-to-r from-red-600 to-amber-500 transition-all duration-200"
              style={{ width: `${loadProgress}%` }}
            />
          </div>
          <p className="font-mono text-[11px] text-zinc-500 tracking-wider">
            Loading Mark LXXXV &amp; Mark III &nbsp;&middot;&nbsp; {loadProgress}%
          </p>
        </div>
      )}
    </div>
  );
};
