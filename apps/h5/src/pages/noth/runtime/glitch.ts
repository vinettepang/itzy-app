import gsap from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';

gsap.registerPlugin(ScrollTrigger);

const GLYPHS = 'abcdefghijklmnopqrstuvwxyzABCDEFGHJKMNPQRSTUVWXYZ0123456789#$()!?"§&<>@*+-';
const SCRAMBLE_TAIL = 22;
const RAF_EVERY = 8;
const FINAL_SCRAMBLE_TAIL = 4;

type CharSpan = { span: HTMLSpanElement; original: string };

function randomGlyph() {
  return GLYPHS[Math.floor(Math.random() * GLYPHS.length)];
}

function splitTextToSpans(root: HTMLElement): CharSpan[] {
  const spans: CharSpan[] = [];

  const walk = (node: Node) => {
    if (node.nodeType === Node.TEXT_NODE) {
      const frag = document.createDocumentFragment();
      for (const ch of node.textContent ?? '') {
        if (ch === ' ' || ch === '\u00a0' || ch === '\n') {
          frag.appendChild(document.createTextNode(ch));
        } else {
          const span = document.createElement('span');
          span.style.display = 'inline-block';
          span.textContent = ch;
          frag.appendChild(span);
          spans.push({ span, original: ch });
        }
      }
      node.parentNode?.replaceChild(frag, node);
    } else if (node.nodeType === Node.ELEMENT_NODE) {
      [...node.childNodes].forEach(walk);
    }
  };

  [...root.childNodes].forEach(walk);
  return spans;
}

function scrambleLine(line: CharSpan[], offset: number, intensity: number) {
  const n = line.length;
  if (!n) return;
  const base = (Math.floor(offset) % n + n) % n;
  line.forEach(({ span, original }, i) => {
    let dist = i - base;
    if (dist < 0) dist += n;
    if (dist < SCRAMBLE_TAIL) {
      const chance = intensity * Math.pow(1 - dist / SCRAMBLE_TAIL, 0.6);
      span.textContent = Math.random() < chance ? randomGlyph() : original;
    } else {
      span.textContent = original;
    }
  });
}

function revealFinalText(chars: CharSpan[], progress: number) {
  if (!chars.length) return;
  const threshold = progress * chars.length;
  chars.forEach(({ span, original }, i) => {
    if (i < threshold - FINAL_SCRAMBLE_TAIL) {
      span.style.opacity = '1';
      span.textContent = original;
    } else if (i < threshold) {
      span.style.opacity = '1';
      span.textContent = randomGlyph();
    } else {
      span.style.opacity = '0';
      span.textContent = original;
    }
  });
}

function initGlitchSection(section: HTMLElement): () => void {
  const textBlocks = [...section.querySelectorAll<HTMLElement>('.text-block-6')];
  if (!textBlocks.length) return () => {};

  const originalHtml = textBlocks.map((el) => el.innerHTML);
  const lineSpans = textBlocks.map((el) => splitTextToSpans(el));
  const flatSpans = lineSpans.flat();
  const maxLen = Math.max(...lineSpans.map((l) => l.length), 1);

  const finalEl = section.querySelector<HTMLElement>('.finaltext');
  const finalOriginalHtml = finalEl?.innerHTML ?? null;
  const finalSpans = finalEl ? splitTextToSpans(finalEl) : [];
  finalSpans.forEach(({ span }) => {
    span.style.opacity = '0';
  });

  let smoothIntensity = 0;
  let targetIntensity = 0;
  let scrambleOffset = 0;
  let rafId: number | null = null;
  let running = false;
  let frame = 0;
  let fallTl: gsap.core.Timeline | null = null;
  let lastFinalProgress = -1;

  const imgScrollTriggers: ScrollTrigger[] = [];

  const tick = () => {
    if (!running) return;
    frame++;
    smoothIntensity += (targetIntensity - smoothIntensity) * 0.14;
    targetIntensity *= 0.9;

    if (frame % RAF_EVERY === 0) {
      if (smoothIntensity > 0.01) {
        scrambleOffset = (scrambleOffset + 1 + smoothIntensity * 10) % maxLen;
        lineSpans.forEach((line) => scrambleLine(line, scrambleOffset, smoothIntensity));
      } else {
        flatSpans.forEach(({ span, original }) => {
          span.textContent = original;
        });
      }

      if (finalSpans.length && fallTl) {
        const progress = fallTl.scrollTrigger?.progress ?? 0;
        if (Math.abs(progress - lastFinalProgress) > 0.0002) {
          revealFinalText(finalSpans, progress);
        } else {
          const threshold = progress * finalSpans.length;
          finalSpans.forEach(({ span, original }, i) => {
            span.style.opacity = i < threshold ? '1' : '0';
            span.textContent = original;
          });
        }
        lastFinalProgress = progress;
      }
    }

    rafId = requestAnimationFrame(tick);
  };

  const startGlitch = () => {
    if (running) return;
    running = true;
    frame = 0;
    rafId = requestAnimationFrame(tick);
  };

  const stopGlitch = () => {
    running = false;
    targetIntensity = 0;
    smoothIntensity = 0;
    if (rafId) cancelAnimationFrame(rafId);
    rafId = null;
    flatSpans.forEach(({ span, original }) => {
      span.textContent = original;
    });
    finalSpans.forEach(({ span, original }) => {
      span.style.opacity = '0';
      span.textContent = original;
    });
    lastFinalProgress = -1;
  };

  const glitchSt = ScrollTrigger.create({
    trigger: section,
    start: 'top bottom',
    end: 'bottom top',
    onEnter: startGlitch,
    onLeave: stopGlitch,
    onEnterBack: startGlitch,
    onLeaveBack: stopGlitch,
    onUpdate(self) {
      targetIntensity = Math.min(Math.abs(self.getVelocity()) / 3400, 0.45);
    },
  });

  fallTl = gsap.timeline({
    scrollTrigger: {
      trigger: section,
      start: 'top top',
      end: 'center 30%',
      scrub: 2,
    },
  });

  lineSpans.forEach((line, blockIndex) => {
    const at = blockIndex * 0.06;
    line.forEach(({ span }) => {
      fallTl!.to(
        span,
        {
          y: gsap.utils.random(40, 160),
          x: gsap.utils.random(-10, 10),
          rotation: gsap.utils.random(-20, 20),
          opacity: 0,
          ease: 'power2.in',
          duration: gsap.utils.random(0.25, 0.7),
        },
        at + gsap.utils.random(0, 0.6),
      );
    });
  });

  const glitchImgW = section.querySelector<HTMLElement>('.glitch-img-w');
  const imgGlitchW = section.querySelector<HTMLElement>('.img-glitch-w');

  if (glitchImgW) {
    const st = gsap
      .to(glitchImgW, {
        opacity: 0.3,
        ease: 'none',
        immediateRender: false,
        scrollTrigger: {
          trigger: section,
          start: 'top top',
          end: 'center center',
          scrub: 2,
        },
      })
      .scrollTrigger;
    if (st) imgScrollTriggers.push(st);
  }

  if (imgGlitchW) {
    const [merguez, ballon] = [...imgGlitchW.children] as HTMLElement[];
    if (merguez) {
      const st = gsap
        .fromTo(
          merguez,
          { y: 100 },
          {
            y: -300,
            ease: 'none',
            scrollTrigger: { trigger: section, start: 'top top', end: 'bottom top', scrub: 1.5 },
          },
        )
        .scrollTrigger;
      if (st) imgScrollTriggers.push(st);
    }
    if (ballon) {
      const st = gsap
        .fromTo(
          ballon,
          { y: 100 },
          {
            y: -800,
            ease: 'none',
            scrollTrigger: { trigger: section, start: 'top top', end: 'bottom top', scrub: 3 },
          },
        )
        .scrollTrigger;
      if (st) imgScrollTriggers.push(st);
    }
  }

  const parallaxItems = [
    { wrapperSel: '.merguez', imgSel: '.merguez-img', yPercent: -8 },
    { wrapperSel: '.ballon', imgSel: '.ballon-img', yPercent: 10 },
  ] as const;

  parallaxItems.forEach(({ wrapperSel, imgSel, yPercent }) => {
    const wrap = section.querySelector<HTMLElement>(wrapperSel);
    const img = section.querySelector<HTMLImageElement>(imgSel);
    if (!wrap || !img) return;
    gsap.set(wrap, { overflow: 'hidden' });
    gsap.set(img, { height: '110%', width: '100%', objectFit: 'cover', top: 0 });
    const st = gsap
      .fromTo(
        img,
        { yPercent: 0 },
        {
          yPercent,
          ease: 'none',
          scrollTrigger: {
            trigger: section,
            start: '20% top',
            end: 'bottom top',
            scrub: 3,
          },
        },
      )
      .scrollTrigger;
    if (st) imgScrollTriggers.push(st);
  });

  return () => {
    stopGlitch();
    glitchSt.kill(true);
    fallTl?.scrollTrigger?.kill(true);
    fallTl?.kill();
    imgScrollTriggers.forEach((st) => {
      st.animation?.kill();
      st.kill(true);
    });
    if (imgGlitchW) [...imgGlitchW.children].forEach((el) => gsap.set(el, { clearProps: 'y' }));
    if (glitchImgW) gsap.set(glitchImgW, { clearProps: 'opacity' });
    parallaxItems.forEach(({ wrapperSel, imgSel }) => {
      const wrap = section.querySelector(wrapperSel);
      const img = section.querySelector(imgSel);
      if (wrap) gsap.set(wrap, { clearProps: 'overflow' });
      if (img) gsap.set(img, { clearProps: 'height,width,objectFit,top,yPercent' });
    });
    textBlocks.forEach((el, i) => {
      el.innerHTML = originalHtml[i];
    });
    if (finalEl && finalOriginalHtml !== null) finalEl.innerHTML = finalOriginalHtml;
  };
}

/** main `cx` / `pC` */
export function initGlitch(scope: HTMLElement): () => void {
  const sections = [...scope.querySelectorAll<HTMLElement>('.section.glitch')];
  if (!sections.length) return () => {};

  const cleanups = sections.map(initGlitchSection);
  return () => cleanups.forEach((fn) => fn());
}
