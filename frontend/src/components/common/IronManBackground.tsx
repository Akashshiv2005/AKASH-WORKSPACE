import React, { useCallback, useEffect, useRef, useState } from 'react';

const FRAME_COUNT = 169;

const getFramePath = (index: number) => {
  const num = String(index + 1).padStart(4, '0');
  return `/frames/frame_${num}.jpg`;
};

interface IronManBackgroundProps {
  containerRef?: React.RefObject<HTMLElement | null>;
  opacity?: number;
}

export const IronManBackground: React.FC<IronManBackgroundProps> = ({
  containerRef,
  opacity = 0.22,
}) => {
  const canvasRef = useRef<HTMLCanvasElement | null>(null);
  const framesRef = useRef<HTMLImageElement[]>([]);
  const lastFrameRef = useRef<number>(0);
  const tickingRef = useRef<boolean>(false);
  const [loaded, setLoaded] = useState<boolean>(false);

  // Preload frames
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
        if (count === FRAME_COUNT) {
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

    const drawX = (cw - drawW) / 2;
    const drawY = (ch - drawH) / 2;

    ctx.clearRect(0, 0, cw, ch);
    ctx.drawImage(img, drawX, drawY, drawW, drawH);
  }, []);

  const resizeCanvas = useCallback(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const dpr = window.devicePixelRatio || 1;
    const width = canvas.parentElement?.clientWidth || window.innerWidth;
    const height = canvas.parentElement?.clientHeight || window.innerHeight;

    canvas.width = width * dpr;
    canvas.height = height * dpr;
    canvas.style.width = `${width}px`;
    canvas.style.height = `${height}px`;

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

  // Scroll listener on main container or window
  useEffect(() => {
    const targetElement = containerRef?.current || window;

    const handleScroll = () => {
      if (tickingRef.current) return;
      tickingRef.current = true;

      requestAnimationFrame(() => {
        tickingRef.current = false;
        let progress = 0;

        if (containerRef?.current) {
          const el = containerRef.current;
          const scrollable = el.scrollHeight - el.clientHeight;
          if (scrollable > 0) {
            progress = Math.min(1, Math.max(0, el.scrollTop / scrollable));
          }
        } else {
          const totalScroll = document.documentElement.scrollHeight - window.innerHeight;
          if (totalScroll > 0) {
            progress = Math.min(1, Math.max(0, window.scrollY / totalScroll));
          }
        }

        const frameIndex = Math.min(
          FRAME_COUNT - 1,
          Math.floor(progress * FRAME_COUNT)
        );

        if (frameIndex !== lastFrameRef.current) {
          lastFrameRef.current = frameIndex;
          drawFrame(frameIndex);
        }
      });
    };

    targetElement.addEventListener('scroll', handleScroll, { passive: true });
    handleScroll();

    return () => {
      targetElement.removeEventListener('scroll', handleScroll);
    };
  }, [containerRef, drawFrame]);

  return (
    <div
      className="pointer-events-none fixed inset-0 z-0 overflow-hidden transition-opacity duration-700 select-none"
      style={{ opacity }}
    >
      <canvas
        ref={canvasRef}
        className="absolute inset-0 h-full w-full object-cover"
        style={{ willChange: 'contents', transform: 'translateZ(0)' }}
      />
      {/* Stark Dark Vignette Overlay for High Readability & Rich Contrast */}
      <div
        className="absolute inset-0"
        style={{
          background:
            'radial-gradient(120% 80% at 50% 50%, transparent 30%, rgba(10, 10, 12, 0.7) 70%, rgba(10, 10, 12, 0.96) 100%)',
        }}
      />
    </div>
  );
};
