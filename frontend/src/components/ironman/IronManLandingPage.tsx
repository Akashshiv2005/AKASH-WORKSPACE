import React, { useCallback, useEffect, useRef, useState } from 'react';
import { Shield, ArrowRight, Layout, ChevronRight } from 'lucide-react';

const FRAME_COUNT = 169;

const getFramePath = (index: number) => {
  const num = String(index + 1).padStart(4, '0');
  return `/frames/frame_${num}.jpg`;
};

interface Dialogue {
  id: string;
  show: number;
  hide: number;
  quote: string;
  speaker: string;
  film: string;
}

const DIALOGUES: Dialogue[] = [
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

interface IronManLandingPageProps {
  onEnterWorkspace: () => void;
}

export const IronManLandingPage: React.FC<IronManLandingPageProps> = ({ onEnterWorkspace }) => {
  const containerRef = useRef<HTMLDivElement | null>(null);
  const sectionRef = useRef<HTMLDivElement | null>(null);
  const canvasRef = useRef<HTMLCanvasElement | null>(null);
  const framesRef = useRef<HTMLImageElement[]>([]);
  const tickingRef = useRef<boolean>(false);
  const lastFrameRef = useRef<number>(0);
  const loadedRef = useRef<boolean>(false);
  const [loaded, setLoaded] = useState<boolean>(false);
  const [loadProgress, setLoadProgress] = useState<number>(0);
  const [visibleCards, setVisibleCards] = useState<Set<string>>(new Set());
  const [scrollPercent, setScrollPercent] = useState<number>(0);

  // Preload frame sequence
  useEffect(() => {
    let cancelled = false;
    let count = 0;
    const imgs: HTMLImageElement[] = [];

    for (let i = 0; i < FRAME_COUNT; i++) {
      const img = new Image();
      img.src = getFramePath(i);
      img.onload = img.onerror = () => {
        if (cancelled) return;
        count++;
        setLoadProgress(Math.round((count / FRAME_COUNT) * 100));
        if (count === FRAME_COUNT) {
          loadedRef.current = true;
          setLoaded(true);
        }
      };
      imgs.push(img);
    }
    framesRef.current = imgs;

    return () => {
      cancelled = true;
    };
  }, []);

  const drawFrame = useCallback((index: number) => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const img = framesRef.current[index];
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

  const resizeCanvas = useCallback(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const dpr = window.devicePixelRatio || 1;
    canvas.width = window.innerWidth * dpr;
    canvas.height = window.innerHeight * dpr;
    canvas.style.width = `${window.innerWidth}px`;
    canvas.style.height = `${window.innerHeight}px`;

    const ctx = canvas.getContext('2d');
    if (ctx) ctx.scale(dpr, dpr);

    drawFrame(lastFrameRef.current);
  }, [drawFrame]);

  useEffect(() => {
    resizeCanvas();
    window.addEventListener('resize', resizeCanvas);
    return () => window.removeEventListener('resize', resizeCanvas);
  }, [resizeCanvas]);

  useEffect(() => {
    if (loaded) {
      drawFrame(0);
    }
  }, [loaded, drawFrame]);

  const updateScrollProgress = useCallback(() => {
    if (tickingRef.current) return;
    tickingRef.current = true;

    requestAnimationFrame(() => {
      tickingRef.current = false;
      const container = containerRef.current;
      const section = sectionRef.current;
      let progress = 0;

      if (container) {
        const scrollable = container.scrollHeight - container.clientHeight;
        if (scrollable > 0) {
          progress = Math.min(1, Math.max(0, container.scrollTop / scrollable));
        }
      } else if (section) {
        const rect = section.getBoundingClientRect();
        const scrollable = section.offsetHeight - window.innerHeight;
        if (scrollable > 0) {
          progress = Math.min(1, Math.max(0, -rect.top / scrollable));
        }
      }

      setScrollPercent(Math.round(progress * 100));

      const frameIndex = Math.min(
        FRAME_COUNT - 1,
        Math.floor(progress * FRAME_COUNT)
      );

      if (frameIndex !== lastFrameRef.current) {
        lastFrameRef.current = frameIndex;
        drawFrame(frameIndex);
      }

      const newVisible = new Set<string>();
      for (const d of DIALOGUES) {
        if (progress >= d.show && progress <= d.hide) {
          newVisible.add(d.id);
        }
      }
      setVisibleCards(newVisible);
    });
  }, [drawFrame]);

  useEffect(() => {
    const container = containerRef.current;
    const handleScrollEvent = () => updateScrollProgress();

    window.addEventListener('scroll', handleScrollEvent, { passive: true });
    if (container) {
      container.addEventListener('scroll', handleScrollEvent, { passive: true });
    }
    updateScrollProgress();

    return () => {
      window.removeEventListener('scroll', handleScrollEvent);
      if (container) {
        container.removeEventListener('scroll', handleScrollEvent);
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

      {/* Main Scroll Container */}
      <div ref={sectionRef} className="relative h-[320vh] w-full">
        <div className="sticky top-0 h-screen w-full overflow-hidden">
          {/* Canvas Background */}
          <canvas
            ref={canvasRef}
            className="absolute inset-0 h-full w-full object-cover"
          />

          {/* Stark Radial Dark Vignette */}
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

          {/* Telemetry Header Badge */}
          <div className="pointer-events-none absolute left-6 md:left-12 top-20 z-20 flex items-center space-x-2 font-mono text-[10px] uppercase tracking-[0.28em] text-zinc-400">
            <span className="w-2 h-2 rounded-full bg-amber-400 animate-ping" />
            <span>Telemetry Link &mdash; MARK LXXXV ONLINE</span>
          </div>

          <div className="pointer-events-none absolute right-6 md:right-12 top-20 z-20 flex items-center space-x-2 font-mono text-[10px] uppercase tracking-[0.28em] text-amber-400">
            <span>Arc Reactor Power &mdash; 98.7%</span>
          </div>

          {/* Hero Left Text Overlay */}
          <div className="absolute left-6 md:left-12 bottom-24 md:bottom-28 z-20 max-w-sm sm:max-w-md space-y-4">
            <h1 className="text-4xl sm:text-6xl font-black tracking-tight text-white leading-none drop-shadow-xl">
              I am <br />
              <span className="bg-gradient-to-r from-red-500 via-amber-400 to-orange-500 bg-clip-text text-transparent">
                Iron Man.
              </span>
            </h1>

            <p className="text-zinc-300 text-xs sm:text-sm leading-relaxed max-w-xs sm:max-w-sm drop-shadow">
              Engineered with precision. Scroll down to suit up or launch the interactive Akash Workspace dashboard.
            </p>

            <div className="pt-2 flex items-center space-x-4">
              <button
                onClick={onEnterWorkspace}
                className="px-5 py-3 rounded-2xl bg-gradient-to-r from-red-600 via-orange-500 to-amber-500 hover:from-red-500 hover:to-amber-400 text-white font-black text-xs sm:text-sm shadow-2xl shadow-red-600/40 hover:scale-105 active:scale-95 transition-all flex items-center space-x-2.5 border border-amber-300/40"
              >
                <Layout className="w-4 h-4" />
                <span>ENTER AKASH WORKSPACE</span>
                <ArrowRight className="w-4 h-4" />
              </button>
            </div>
          </div>

          {/* Dialogues Display Cards */}
          {DIALOGUES.map((d) => {
            const isVisible = visibleCards.has(d.id);
            return (
              <div
                key={d.id}
                className={`absolute right-8 top-1/3 z-30 max-w-md p-6 rounded-2xl bg-[#141416]/90 backdrop-blur-xl border border-amber-500/30 text-white shadow-2xl transition-all duration-500 ${
                  isVisible
                    ? 'opacity-100 translate-y-0'
                    : 'opacity-0 translate-y-8 pointer-events-none'
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

          {/* Progress Bottom Bar */}
          <div className="pointer-events-none absolute inset-x-0 bottom-0 z-20 p-6 flex items-center justify-between font-mono text-[10px] uppercase tracking-[0.25em] text-zinc-400 border-t border-white/10 bg-[#0a0a0b]/80 backdrop-blur-md">
            <span>SUIT DIAGNOSTIC // {scrollPercent}%</span>
            <span>J.A.R.V.I.S. INTERACTIVE SUIT</span>
            <button
              onClick={onEnterWorkspace}
              className="pointer-events-auto text-amber-400 hover:text-white font-bold underline flex items-center space-x-1"
            >
              <span>Click to Enter Workspace</span>
              <ChevronRight className="w-3.5 h-3.5" />
            </button>
          </div>

          {/* Initial Loading Screen overlay */}
          {!loaded && (
            <div className="absolute inset-0 z-50 bg-[#0a0a0b] flex flex-col items-center justify-center p-6 space-y-4">
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
                Loading Mark LXXXV &nbsp;&middot;&nbsp; {loadProgress}%
              </p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
