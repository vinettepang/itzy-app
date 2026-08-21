import { useCallback, useEffect, useRef } from 'react';
import gsap from 'gsap';

export type GalleryItem = {
  url: string;
  color?: string;
  ratio?: number;
};

type Item = {
  img: HTMLImageElement;
  x: number;
  y: number;
  w: number;
  h: number;
  color: string;
};

type Props = {
  images: GalleryItem[];
  paused: boolean;
  view: 'default' | 'zoom';
  onToggleZoom: () => void;
  onCursor?: (label: 'LARGER' | 'SMALLER' | null, x: number, y: number) => void;
};

function hiRes(url: string, w = 2000) {
  if (!url) return url;
  if (/([?&])w=\d+/.test(url)) return url.replace(/([?&])w=\d+/g, `$1w=${w}`);
  return `${url}${url.includes('?') ? '&' : '?'}w=${w}&fit=max&auto=format&q=85`;
}

/**
 * Canvas strip approximating production WebGL product scene:
 * default = horizontal auto-scroll; zoom = full-width vertical scroll.
 */
export default function ProductCanvas({ images, paused, view, onToggleZoom, onCursor }: Props) {
  const canvasRef = useRef<HTMLCanvasElement | null>(null);
  const itemsRef = useRef<Item[]>([]);
  const viewRef = useRef(view);
  const pausedRef = useRef(paused);
  const speedRef = useRef({ v: 0 });
  const rafRef = useRef(0);
  const zoomIndexRef = useRef(0);
  const readyRef = useRef(false);

  viewRef.current = view;
  pausedRef.current = paused;

  const totalWidth = useCallback(() => {
    return itemsRef.current.reduce((s, it) => s + Math.max(it.w - 1, 0), 0) || 1;
  }, []);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas || !images.length) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    let alive = true;
    const dpr = Math.min(window.devicePixelRatio || 1, 2);

    const layoutDefault = () => {
      const items = itemsRef.current;
      const vh = window.innerHeight;
      const targetH = Math.floor(vh * 0.8);
      let x = 0;
      items.forEach((item) => {
        const ratio = item.img.naturalWidth / item.img.naturalHeight || 0.8;
        item.h = targetH;
        item.w = Math.round(targetH * ratio);
        item.x = x;
        item.y = Math.round((vh - targetH) / 2);
        x += item.w - 1;
      });
    };

    const resize = () => {
      const w = window.innerWidth;
      const h = window.innerHeight;
      canvas.width = Math.floor(w * dpr);
      canvas.height = Math.floor(h * dpr);
      canvas.style.width = `${w}px`;
      canvas.style.height = `${h}px`;
      ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
      if (readyRef.current && viewRef.current === 'default') layoutDefault();
      if (readyRef.current && viewRef.current === 'zoom') {
        const it = itemsRef.current[zoomIndexRef.current];
        if (it) {
          it.w = w;
          it.h = w / (it.img.naturalWidth / it.img.naturalHeight || 0.8);
          it.x = 0;
        }
      }
    };

    const wrapDefault = (item: Item) => {
      const vw = window.innerWidth;
      const tw = totalWidth();
      if (item.x + item.w < 0) item.x += tw;
      else if (item.x > vw) item.x -= tw;
    };

    const wrapZoom = (item: Item) => {
      const vh = window.innerHeight;
      if (item.y + item.h < 0) item.y = vh;
      else if (item.y > vh) item.y = -item.h;
    };

    const draw = () => {
      const vw = window.innerWidth;
      const vh = window.innerHeight;
      ctx.fillStyle = '#edeae4';
      ctx.fillRect(0, 0, vw, vh);
      const items = itemsRef.current;
      const v = viewRef.current;
      const spd = pausedRef.current ? 0 : speedRef.current.v;

      if (v === 'default') {
        items.forEach((item) => {
          if (!item.w) return;
          item.x -= spd;
          wrapDefault(item);
          ctx.fillStyle = item.color;
          ctx.fillRect(item.x, item.y, item.w, item.h);
          ctx.drawImage(item.img, item.x, item.y, item.w, item.h);
        });
      } else {
        const item = items[zoomIndexRef.current];
        if (item && item.w) {
          item.y -= spd * 1.15;
          wrapZoom(item);
          ctx.fillStyle = item.color;
          ctx.fillRect(item.x, item.y, item.w, item.h);
          ctx.drawImage(item.img, item.x, item.y, item.w, item.h);
        }
      }
      rafRef.current = requestAnimationFrame(draw);
    };

    const hitIndex = (clientX: number) => {
      if (viewRef.current === 'zoom') return zoomIndexRef.current;
      let best = 0;
      let bestDist = Infinity;
      itemsRef.current.forEach((it, i) => {
        const d = Math.abs(it.x + it.w / 2 - clientX);
        if (d < bestDist) {
          bestDist = d;
          best = i;
        }
      });
      return best;
    };

    const onClick = (e: MouseEvent) => {
      zoomIndexRef.current = hitIndex(e.clientX);
      onToggleZoom();
    };
    const onMove = (e: MouseEvent) => {
      onCursor?.(viewRef.current === 'zoom' ? 'SMALLER' : 'LARGER', e.clientX, e.clientY);
    };
    const onLeave = () => onCursor?.(null, 0, 0);
    const onWheel = (e: WheelEvent) => {
      e.preventDefault();
      const delta = e.deltaY || e.deltaX;
      if (viewRef.current === 'default') {
        itemsRef.current.forEach((it) => {
          it.x -= delta * 0.55;
          wrapDefault(it);
        });
      } else {
        const it = itemsRef.current[zoomIndexRef.current];
        if (it) {
          it.y -= delta * 0.55;
          wrapZoom(it);
        }
      }
    };

    const load = async () => {
      const loaded: Item[] = [];
      await Promise.all(
        images.map(
          (g) =>
            new Promise<void>((resolve) => {
              const img = new Image();
              img.onload = () => {
                loaded.push({ img, x: 0, y: 0, w: 0, h: 0, color: g.color || '#848484' });
                resolve();
              };
              img.onerror = () => resolve();
              img.src = hiRes(g.url);
            }),
        ),
      );
      if (!alive) return;
      itemsRef.current = loaded;
      readyRef.current = true;
      layoutDefault();
      gsap.to(speedRef.current, { v: 0.55, duration: 0.8, ease: 'power2.out' });
    };

    resize();
    void load();
    rafRef.current = requestAnimationFrame(draw);
    window.addEventListener('resize', resize);
    canvas.addEventListener('click', onClick);
    canvas.addEventListener('mousemove', onMove);
    canvas.addEventListener('mouseleave', onLeave);
    canvas.addEventListener('wheel', onWheel, { passive: false });

    return () => {
      alive = false;
      cancelAnimationFrame(rafRef.current);
      window.removeEventListener('resize', resize);
      canvas.removeEventListener('click', onClick);
      canvas.removeEventListener('mousemove', onMove);
      canvas.removeEventListener('mouseleave', onLeave);
      canvas.removeEventListener('wheel', onWheel);
      gsap.killTweensOf(speedRef.current);
      itemsRef.current.forEach((it) => gsap.killTweensOf(it));
    };
  }, [images, onToggleZoom, onCursor, totalWidth]);

  useEffect(() => {
    const items = itemsRef.current;
    if (!readyRef.current || !items.length) return;
    const vh = window.innerHeight;
    const vw = window.innerWidth;
    const idx = zoomIndexRef.current;
    const focus = items[idx];
    if (!focus) return;

    items.forEach((it) => gsap.killTweensOf(it));

    if (view === 'zoom') {
      const targetW = vw;
      const targetH = targetW / (focus.img.naturalWidth / focus.img.naturalHeight || 0.8);
      items.forEach((it, i) => {
        if (i !== idx) gsap.to(it, { w: 0, h: 0, duration: 0.9, ease: 'power3.inOut' });
      });
      gsap.to(focus, {
        x: 0,
        y: Math.min(focus.y, 40),
        w: targetW,
        h: targetH,
        duration: 1.6,
        ease: 'power3.inOut',
      });
      gsap.to(speedRef.current, { v: 0.4, duration: 0.5 });
    } else {
      const targetH = Math.floor(vh * 0.8);
      let x = 0;
      items.forEach((it) => {
        const ratio = it.img.naturalWidth / it.img.naturalHeight || 0.8;
        const w = Math.round(targetH * ratio);
        const y = Math.round((vh - targetH) / 2);
        gsap.to(it, { x, y, w, h: targetH, duration: 1.6, ease: 'power3.inOut' });
        x += w - 1;
      });
      gsap.to(speedRef.current, { v: 0.55, duration: 0.5 });
    }
  }, [view]);

  return <canvas id="c" ref={canvasRef} aria-label="Product gallery" />;
}
