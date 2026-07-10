import { useEffect, useRef } from 'react';

/** Fullscreen Canvas2D overlay — mirrors production `#Interface__Canvas` */
export default function FacilInterfaceCanvas() {
  const ref = useRef<HTMLCanvasElement>(null);

  useEffect(() => {
    const canvas = ref.current;
    if (!canvas) return;

    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    const dpr = Math.min(window.devicePixelRatio, 2);
    let w = 0;
    let h = 0;

    const resize = () => {
      w = window.innerWidth;
      h = window.innerHeight;
      canvas.width = w * dpr;
      canvas.height = h * dpr;
      canvas.style.width = `${w}px`;
      canvas.style.height = `${h}px`;
      ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
    };

    resize();
    window.addEventListener('resize', resize);

    let scrollY = 0;
    const onScroll = () => { scrollY = window.scrollY; };
    window.addEventListener('scroll', onScroll, { passive: true });

    let raf = 0;
    const draw = () => {
      ctx.clearRect(0, 0, w, h);
      const progress = Math.min(1, scrollY / (document.body.scrollHeight - h));
      const alpha = Math.max(0, 1 - progress * 1.4);
      if (alpha > 0.02) {
        ctx.globalAlpha = alpha * 0.08;
        ctx.fillStyle = '#1a1a1a';
        ctx.font = `bold ${Math.min(w * 0.22, 280)}px icomoon, sans-serif`;
        ctx.textAlign = 'center';
        ctx.textBaseline = 'middle';
        ctx.fillText('FACIL', w * 0.5, h * 0.55 - scrollY * 0.05);
      }
      raf = requestAnimationFrame(draw);
    };
    raf = requestAnimationFrame(draw);

    return () => {
      cancelAnimationFrame(raf);
      window.removeEventListener('resize', resize);
      window.removeEventListener('scroll', onScroll);
    };
  }, []);

  return <canvas ref={ref} id="Interface__Canvas" aria-hidden />;
}
