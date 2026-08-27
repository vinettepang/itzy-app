import { useEffect, useRef, useState } from 'react';
import { Link } from 'react-router-dom';
import { TicketRoll } from './TicketRoll';
import {
  DEFAULT_NAME,
  PAGE_BG,
  TicketArtwork,
} from './TicketArtwork';
import { exportTicketPng } from './exportTicket';
import { useTicketMachine } from './useTicketMachine';
import './yc.css';

function useReducedMotion() {
  const [reduced, setReduced] = useState(false);
  useEffect(() => {
    const mq = window.matchMedia('(prefers-reduced-motion: reduce)');
    const sync = () => setReduced(mq.matches);
    sync();
    mq.addEventListener('change', sync);
    return () => mq.removeEventListener('change', sync);
  }, []);
  return reduced;
}

function useGlassMotion(reduced: boolean) {
  const [motion, setMotion] = useState({
    offsetX: 0.15,
    offsetY: -0.21,
    scale: 2.2,
  });
  useEffect(() => {
    if (reduced) return;
    let frame = 0;
    const start = performance.now();
    let last = 0;
    const tick = (now: number) => {
      const t = (now - start) / 1000;
      if (now - last > 33) {
        last = now;
        setMotion({
          offsetY: -0.21 + 0.2 * Math.sin(0.5 * t),
          offsetX: 0.15 + 0.15 * Math.cos(0.35 * t),
          scale: 2.2 + 0.3 * Math.sin(0.3 * t),
        });
      }
      frame = requestAnimationFrame(tick);
    };
    frame = requestAnimationFrame(tick);
    return () => cancelAnimationFrame(frame);
  }, [reduced]);
  return motion;
}

function useTicketTilt(reduced: boolean) {
  const ref = useRef<HTMLDivElement>(null);
  useEffect(() => {
    const el = ref.current;
    if (!el) return;
    let frame = 0;
    let hovering = false;
    let targetX = 0;
    let targetY = 0;
    let curX = 0;
    let curY = 0;
    let velX = 0;
    let velY = 0;
    let last = performance.now();

    const onMove = (e: PointerEvent) => {
      if (e.pointerType === 'touch' || reduced) return;
      hovering = true;
      const rect = el.getBoundingClientRect();
      targetX = (e.clientX - rect.left) / rect.width - 0.5;
      targetY = (e.clientY - rect.top) / rect.height - 0.5;
    };
    const onLeave = () => {
      hovering = false;
    };
    const tick = (now: number) => {
      const dt = Math.min(0.032, (now - last) / 1000);
      last = now;
      const wantX = reduced || !hovering ? 0 : targetX;
      const wantY = reduced || !hovering ? 0 : targetY;
      velX += (wantX - curX) * 100 * dt;
      velY += (wantY - curY) * 100 * dt;
      velX *= Math.exp(-20 * dt);
      velY *= Math.exp(-20 * dt);
      curX += velX * dt;
      curY += velY * dt;
      el.style.setProperty('--tilt-x', `${(16 * curY).toFixed(3)}deg`);
      el.style.setProperty('--tilt-y', `${(-(16 * curX)).toFixed(3)}deg`);
      el.style.setProperty('--ticket-x', `${(16 * curX).toFixed(3)}px`);
      el.style.setProperty('--ticket-y', `${(-(16 * curY)).toFixed(3)}px`);
      frame = requestAnimationFrame(tick);
    };

    el.addEventListener('pointermove', onMove);
    el.addEventListener('pointerleave', onLeave);
    frame = requestAnimationFrame(tick);
    return () => {
      el.removeEventListener('pointermove', onMove);
      el.removeEventListener('pointerleave', onLeave);
      cancelAnimationFrame(frame);
    };
  }, [reduced]);
  return ref;
}

function tearLabel(phase: string): string {
  if (phase === 'detached') return 'ROLL ANOTHER';
  if (phase === 'attached') return 'TEAR OFF TICKET';
  if (phase === 'perforation') return 'LINE IT UP…';
  if (phase === 'chopping') return 'CHOP!';
  if (phase === 'settling') return 'SETTLING…';
  return 'TEARING…';
}

export default function YcPage() {
  const name = DEFAULT_NAME;
  const reduced = useReducedMotion();
  const glass = useGlassMotion(reduced);
  const tiltRef = useTicketTilt(reduced);
  const artworkRef = useRef<HTMLDivElement>(null);
  const [saving, setSaving] = useState(false);
  const machine = useTicketMachine(reduced);

  useEffect(() => {
    const prev = document.title;
    document.title = 'Startup School 2026 — Anthony Ung';
    return () => {
      document.title = prev;
    };
  }, []);

  const tearBusy =
    machine.phase === 'tension' ||
    machine.phase === 'perforation' ||
    machine.phase === 'chopping' ||
    machine.phase === 'tearing' ||
    machine.phase === 'holding' ||
    machine.phase === 'settling';

  const onSave = async () => {
    if (saving || !artworkRef.current) return;
    setSaving(true);
    try {
      const blob = await exportTicketPng(artworkRef.current);
      if (!blob) throw new Error('Ticket export failed');
      const url = URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `startup-school-2026-${name
        .toLowerCase()
        .replace(/\s+/g, '-')
        .replace(/[^a-z0-9-]/g, '')}.png`;
      a.click();
      setTimeout(() => URL.revokeObjectURL(url), 1000);
    } catch (err) {
      console.error(err);
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="yc-root">
      <img className="page-background" src={PAGE_BG} alt="" aria-hidden />
      <Link className="back-link" to="/menu" aria-label="Back to menu">
        /yc
      </Link>
      <main className="page-shell">
        <section className="ticket-stage" aria-labelledby="ticket-title">
          <h1 id="ticket-title" className="visually-hidden">
            Startup School 2026 admission ticket
          </h1>
          <div className={`ticket-machine is-${machine.phase}`}>
            {machine.phase === 'detached' && (
              <div className="final-ticket-callout" role="status">
                <span>TICKET SECURED</span>
                <strong>Don’t lose it. You only get one… probably.</strong>
              </div>
            )}
            <TicketRoll
              progressRef={machine.progressRef}
              phase={machine.phase}
              reduced={reduced}
              name={name}
            />
            <div className="feed-shadow" aria-hidden />
            <div className="tear-seam" aria-hidden>
              <span />
            </div>
            <div
              ref={machine.dragRef}
              className="ticket-pull"
              onPointerDown={machine.onPointerDown}
              onPointerMove={machine.onPointerMove}
              onPointerUp={machine.onPointerUp}
              onPointerCancel={machine.onPointerUp}
            >
              <div className="ticket-perspective">
                <div ref={tiltRef} className="ticket-tilt">
                  <TicketArtwork
                    ref={artworkRef}
                    name={name}
                    reduced={reduced}
                    glass={glass}
                  />
                </div>
              </div>
            </div>
          </div>
          <div className="ticket-actions">
            <button
              className="tear-button"
              type="button"
              onClick={
                machine.phase === 'detached' ? machine.reset : () => machine.tear()
              }
              disabled={tearBusy}
            >
              <span>{tearLabel(machine.phase)}</span>
              <span aria-hidden>→</span>
            </button>
            {machine.phase === 'detached' && (
              <Link className="save-button" to="/yc/detail">
                <span>DETAIL</span>
              </Link>
            )}
            <button
              className="save-button"
              type="button"
              onClick={onSave}
              disabled={saving || machine.phase !== 'detached'}
            >
              <svg aria-hidden viewBox="0 0 24 24" width="12" height="12">
                <path
                  d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4M7 10l5 5 5-5M12 15V3"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="2"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                />
              </svg>
              <span>{saving ? 'SAVING...' : 'SAVE'}</span>
            </button>
          </div>
          <div className="caption-spacer" aria-hidden />
        </section>
      </main>
    </div>
  );
}
