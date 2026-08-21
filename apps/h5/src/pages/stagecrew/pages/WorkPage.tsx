import { Link, useNavigate } from 'react-router-dom';
import { useEffect, useRef, useState, type MouseEvent } from 'react';
import site from '../data/site.json';
import { SC_BASE } from '../StagecrewLayout';
import { StagecrewMedia } from '../StagecrewMedia';

/** Physics constants from prod Nuxt work index (chunk DP3MPegg) */
const LERP = 0.25;
const DRAG_MULT = 2.5;
const WHEEL_MULT = 1.5;
const AUTO_PX_PER_SEC = 36;
const BUFFER_PX = 500;
const INDEX_EVERY_N = 4;

type Project = (typeof site.projects)[number];

function lerp(a: number, b: number, t: number) {
  return a + (b - a) * t;
}

function isTouchDevice() {
  return typeof window !== 'undefined' && ('ontouchstart' in window || navigator.maxTouchPoints > 0);
}

function isSafari() {
  return typeof navigator !== 'undefined' && /^((?!chrome|android).)*safari/i.test(navigator.userAgent);
}

export default function StagecrewWorkPage() {
  const navigate = useNavigate();
  const containerRef = useRef<HTMLDivElement>(null);
  const trackRef = useRef<HTMLDivElement>(null);
  const baseProjects = site.projects as Project[];

  const [items, setItems] = useState<Project[]>(() => [...baseProjects, ...baseProjects, ...baseProjects]);
  const [active, setActive] = useState(0);
  const [isLg, setIsLg] = useState(() => (typeof window !== 'undefined' ? window.innerWidth >= 1024 : true));

  const scroll = useRef({ target: 0, current: 0, ready: false });
  const drag = useRef({
    down: false,
    moved: false,
    startY: 0,
    startTarget: 0,
  });
  const auto = useRef({ enabled: true, resumeTimer: 0 as number | undefined });
  const raf = useRef(0);
  const lastTs = useRef<number | null>(null);
  const frame = useRef(0);
  const mutating = useRef(false);
  const touch = useRef(isTouchDevice());

  useEffect(() => {
    const onResize = () => setIsLg(window.innerWidth >= 1024);
    onResize();
    window.addEventListener('resize', onResize);
    return () => window.removeEventListener('resize', onResize);
  }, []);

  // Init to middle copy + start RAF loop (SOURCE: me + _)
  useEffect(() => {
    const container = containerRef.current;
    const track = trackRef.current;
    if (!container || !track) return;

    const apply = (y: number) => {
      track.style.transform = `translateY(${-y}px)`;
    };

    const maxScroll = () => Math.max(0, track.scrollHeight - container.clientHeight);

    const updateActive = () => {
      const rows = track.querySelectorAll<HTMLElement>('.sc-work__row');
      if (!rows.length) return;
      const pivot = isLg
        ? container.clientHeight / 2
        : container.getBoundingClientRect().top;
      let idx = 0;
      for (let i = 0; i < rows.length; i++) {
        if (rows[i].getBoundingClientRect().top <= pivot) idx = i;
        else break;
      }
      setActive(idx);
    };

    const prepend = () => {
      if (mutating.current || !baseProjects.length) return;
      mutating.current = true;
      const before = track.scrollHeight;
      setItems((prev) => [...baseProjects, ...prev]);
      requestAnimationFrame(() => {
        requestAnimationFrame(() => {
          const delta = track.scrollHeight - before;
          scroll.current.target += delta;
          scroll.current.current += delta;
          apply(scroll.current.current);
          mutating.current = false;
        });
      });
    };

    const append = () => {
      if (mutating.current || !baseProjects.length) return;
      mutating.current = true;
      setItems((prev) => [...prev, ...baseProjects]);
      requestAnimationFrame(() => {
        requestAnimationFrame(() => {
          mutating.current = false;
        });
      });
    };

    const ensureLoop = (checkIndex: boolean) => {
      if (!scroll.current.ready || mutating.current) return;
      const y = scroll.current.current;
      if (y < BUFFER_PX) prepend();
      if (track.scrollHeight - (y + container.clientHeight) < BUFFER_PX) append();
      if (checkIndex) updateActive();
    };

    const pauseAuto = () => {
      auto.current.enabled = false;
      window.clearTimeout(auto.current.resumeTimer);
      auto.current.resumeTimer = window.setTimeout(() => {
        auto.current.enabled = true;
        if (!drag.current.down) tick();
      }, 0);
    };

    const tick = (ts?: number) => {
      cancelAnimationFrame(raf.current);
      const now = ts ?? performance.now();
      const dt = lastTs.current == null ? 1 / 60 : Math.min((now - lastTs.current) / 1000, 0.1);
      lastTs.current = now;

      if (auto.current.enabled && !drag.current.down) {
        scroll.current.target += AUTO_PX_PER_SEC * dt;
      }

      const o = 1 - Math.pow(1 - LERP, dt * 60);
      frame.current += 1;
      const checkIndex = frame.current % INDEX_EVERY_N === 0;

      const diff = Math.abs(scroll.current.current - scroll.current.target);
      if (diff > 0.1) {
        scroll.current.current = lerp(scroll.current.current, scroll.current.target, o);
        apply(scroll.current.current);
        ensureLoop(checkIndex);
        raf.current = requestAnimationFrame(tick);
      } else {
        scroll.current.current = scroll.current.target;
        apply(scroll.current.current);
        ensureLoop(checkIndex);
        if (auto.current.enabled || drag.current.down) {
          raf.current = requestAnimationFrame(tick);
        } else {
          lastTs.current = null;
        }
      }
    };

    // Start in middle third
    requestAnimationFrame(() => {
      const mid = track.scrollHeight / 3;
      scroll.current.target = mid;
      scroll.current.current = mid;
      scroll.current.ready = true;
      apply(mid);
      updateActive();
      auto.current.enabled = true;
      tick();
    });

    const onWheel = (e: WheelEvent) => {
      e.preventDefault();
      pauseAuto();
      const delta = isSafari() ? e.deltaY : e.deltaY * WHEEL_MULT;
      scroll.current.target = Math.max(0, Math.min(scroll.current.target + delta, maxScroll()));
      tick();
    };

    const onPointerDown = (e: PointerEvent) => {
      if (e.button !== 0) return;
      drag.current = {
        down: true,
        moved: false,
        startY: e.clientY,
        startTarget: scroll.current.target,
      };
      pauseAuto();
      document.body.style.cursor = 'grabbing';
      document.body.style.userSelect = 'none';
      try {
        container.setPointerCapture(e.pointerId);
      } catch {
        /* ignore */
      }
    };

    const onPointerMove = (e: PointerEvent) => {
      if (!drag.current.down) return;
      const dy = (drag.current.startY - e.clientY) * DRAG_MULT;
      if (Math.abs(drag.current.startY - e.clientY) > 3) drag.current.moved = true;
      scroll.current.target = Math.max(0, Math.min(drag.current.startTarget + dy, maxScroll()));
      tick();
    };

    const onPointerUp = (e: PointerEvent) => {
      if (!drag.current.down) return;
      const moved = drag.current.moved;
      drag.current.down = false;
      document.body.style.cursor = '';
      document.body.style.userSelect = '';
      if (!moved) {
        const a = (e.target as Element | null)?.closest?.('a');
        if (a instanceof HTMLAnchorElement && a.href) {
          // let default navigation happen if it's a real link click without drag
        }
      }
    };

    container.addEventListener('wheel', onWheel, { passive: false });
    container.addEventListener('pointerdown', onPointerDown);
    container.addEventListener('pointermove', onPointerMove);
    container.addEventListener('pointerup', onPointerUp);
    container.addEventListener('pointercancel', onPointerUp);

    return () => {
      cancelAnimationFrame(raf.current);
      window.clearTimeout(auto.current.resumeTimer);
      container.removeEventListener('wheel', onWheel);
      container.removeEventListener('pointerdown', onPointerDown);
      container.removeEventListener('pointermove', onPointerMove);
      container.removeEventListener('pointerup', onPointerUp);
      container.removeEventListener('pointercancel', onPointerUp);
      document.body.style.cursor = '';
      document.body.style.userSelect = '';
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [isLg]);

  const activeProject = items[active] ?? baseProjects[0];
  const areaLimit = isLg ? 10 : 2;
  const areas = activeProject?.areas ?? [];
  const shownAreas = areas.slice(0, areaLimit);
  const extra = areas.length - shownAreas.length;

  const onCardClick = (project: Project, e: MouseEvent) => {
    if (drag.current.moved) {
      e.preventDefault();
      return;
    }
    if (project.isComingSoon) {
      e.preventDefault();
      return;
    }
    navigate(`${SC_BASE}/work/${project.slug}`);
  };

  return (
    <section className="sc-work">
      <div className="sc-work__active" aria-live="polite">
        <div className="sc-work__active-title">{activeProject?.title}</div>
        {activeProject?.isComingSoon ? (
          <div className="sc-work__active-soon">Coming Soon</div>
        ) : (
          <ul className="sc-work__active-areas">
            {shownAreas.map((a) => (
              <li key={a}>{a}</li>
            ))}
            {extra > 0 ? (
              <li className="sc-work__active-extra">
                <span>(+{extra})</span>
              </li>
            ) : null}
          </ul>
        )}
      </div>

      <div
        className="sc-work__intro sc-work__intro--desktop"
        dangerouslySetInnerHTML={{ __html: site.work.introHtml }}
      />

      <div className="sc-work__carousel carouselContainer" ref={containerRef}>
        <div className="sc-work__track" ref={trackRef} style={{ willChange: 'transform' }}>
          {items.map((project, i) => {
            const media = (
              <>
                <StagecrewMedia media={project.cover} alt={project.title} className="sc-work__cover" />
                <div className="sc-work__hit" aria-hidden />
              </>
            );

            if (project.isComingSoon) {
              return (
                <div key={`${project.slug}-${i}`} className="sc-work__row is-soon">
                  {media}
                </div>
              );
            }

            if (!isLg || touch.current) {
              return (
                <div key={`${project.slug}-${i}`} className="sc-work__row">
                  <Link
                    to={`${SC_BASE}/work/${project.slug}`}
                    className="sc-work__link"
                    draggable={false}
                    onClick={(e) => {
                      if (drag.current.moved) e.preventDefault();
                    }}
                  >
                    {media}
                  </Link>
                </div>
              );
            }

            return (
              <div key={`${project.slug}-${i}`} className="sc-work__row">
                <div className="sc-work__side-hit" aria-hidden />
                <a
                  href={`${SC_BASE}/work/${project.slug}`}
                  className="sc-work__link"
                  draggable={false}
                  onClick={(e) => onCardClick(project, e)}
                  onAuxClick={(e) => {
                    if (e.button === 1) {
                      e.preventDefault();
                      window.open(`${SC_BASE}/work/${project.slug}`, '_blank', 'noopener,noreferrer');
                    }
                  }}
                >
                  {media}
                </a>
              </div>
            );
          })}
        </div>
      </div>

      <div
        className="sc-work__intro sc-work__intro--mobile"
        dangerouslySetInnerHTML={{ __html: site.work.introHtml }}
      />
    </section>
  );
}
