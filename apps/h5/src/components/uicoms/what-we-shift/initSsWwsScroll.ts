/**
 * WHAT WE SHIFT scroll timeline — copied from TFIB site-inner.html (scoped to root).
 */
export function initSsWwsScroll(root: ParentNode): () => void {
  const section = root.querySelector('.ss-wws-section') as HTMLElement | null;
  const maskWrap = root.querySelector('#ss-wws-mask-wrap') as HTMLElement | null;
  const hint = root.querySelector('#ss-wws-hint') as HTMLElement | null;
  const textEl = root.querySelector('#ss-wws-text') as SVGTextElement | null;
  const notes = Array.from(root.querySelectorAll('.ss-wws-note')) as HTMLElement[];

  if (!section || !maskWrap || !hint || !textEl) {
    return () => {};
  }

  function fitText() {
    if (!textEl) return;
    try {
      textEl.setAttribute('font-size', '130');
      const b = textEl.getBBox();
      if (!b || !b.width) return;
      const scale = Math.min(880 / b.width, 320 / b.height);
      textEl.setAttribute('font-size', String(130 * scale));
    } catch {
      /* SVG not ready */
    }
  }

  fitText();
  const fitT1 = window.setTimeout(fitText, 250);
  const fitT2 = window.setTimeout(fitText, 800);
  window.addEventListener('resize', fitText);

  const clamp = (v: number, a: number, b: number) => Math.min(Math.max(v, a), b);
  const inv = (a: number, b: number, v: number) => clamp((v - a) / (b - a), 0, 1);
  const lerp = (a: number, b: number, t: number) => a + (b - a) * t;
  const easeIn = (t: number, p: number) => Math.pow(t, p);
  const easeOut = (t: number, p: number) => 1 - Math.pow(1 - t, p);

  const NOTES_START = 0.58;
  const NOTES_END = 0.92;

  let ticking = false;
  let active = false;

  function update() {
    ticking = false;
    if (!active) return;

    const rect = section.getBoundingClientRect();
    const total = section.offsetHeight - window.innerHeight;
    const p = clamp(-rect.top / total, 0, 1);

    const scale = lerp(1, 13, easeIn(inv(0.05, 0.55, p), 2.5));
    maskWrap.style.transform = `scale(${scale})`;
    maskWrap.style.opacity = String(1 - easeOut(inv(0.4, 0.58, p), 2));

    const span = NOTES_END - NOTES_START;
    const per = span / notes.length;
    notes.forEach((note, i) => {
      const start = NOTES_START + i * per;
      const t = easeOut(inv(start, start + per * 1.4, p), 2);
      const rot = note.style.getPropertyValue('--r') || '0deg';
      note.style.opacity = String(t);
      note.style.transform = `translateX(${lerp(80, 0, t)}px) rotate(${rot})`;
    });

    hint.style.opacity = String(1 - clamp(p / 0.06, 0, 1));
  }

  function onScroll() {
    if (!ticking) {
      requestAnimationFrame(update);
      ticking = true;
    }
  }

  const io = new IntersectionObserver(
    (entries) => {
      entries.forEach((entry) => {
        if (entry.isIntersecting && !active) {
          active = true;
          window.addEventListener('scroll', onScroll, { passive: true });
          update();
        } else if (!entry.isIntersecting && active) {
          active = false;
          window.removeEventListener('scroll', onScroll);
        }
      });
    },
    { rootMargin: '100px 0px 100px 0px' },
  );

  io.observe(section);
  update();

  return () => {
    window.clearTimeout(fitT1);
    window.clearTimeout(fitT2);
    window.removeEventListener('resize', fitText);
    window.removeEventListener('scroll', onScroll);
    io.disconnect();
  };
}
