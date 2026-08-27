import { useCallback, useEffect, useRef, useState } from 'react';
import type { TicketRollPhase } from './TicketRoll';

type AudioBus = {
  context: AudioContext;
  master: GainNode;
};

type DragState = {
  active: boolean;
  startX: number;
  startPull: number;
  pull: number;
  history: { pull: number; time: number }[];
};

function makeNoiseBuffer(ctx: AudioContext, duration: number) {
  const length = Math.ceil(ctx.sampleRate * duration);
  const buffer = ctx.createBuffer(1, length, ctx.sampleRate);
  const data = buffer.getChannelData(0);
  for (let i = 0; i < length; i += 1) data[i] = 2 * Math.random() - 1;
  const source = ctx.createBufferSource();
  source.buffer = buffer;
  return source;
}

function makeChopBuffer(ctx: AudioContext, duration: number) {
  const length = Math.ceil(ctx.sampleRate * duration);
  const buffer = ctx.createBuffer(1, length, ctx.sampleRate);
  const data = buffer.getChannelData(0);
  let smooth = 0;
  for (let i = 0; i < length; i += 1) {
    const t = i / length;
    const attack = Math.sin(Math.min(1, t / 0.035) * Math.PI * 0.5);
    const decay = Math.pow(1 - t, 0.72);
    const raw = 2 * Math.random() - 1;
    smooth = 0.62 * smooth + 0.38 * raw;
    const crackle =
      Math.exp(-((23 * t) % 1) * 19) * (2 * Math.random() - 1);
    const spike = Math.random() > 0.988 ? (2 * Math.random() - 1) * 0.85 : 0;
    data[i] = Math.max(
      -1,
      Math.min(1, (0.46 * smooth + 0.16 * raw + 0.72 * crackle + spike) * attack * decay),
    );
  }
  const source = ctx.createBufferSource();
  source.buffer = buffer;
  return source;
}

/** Tear / drag / SFX controller (SOURCE · fn-page-x tear machine). */
export function useTicketMachine(reduced: boolean) {
  const dragRef = useRef<HTMLDivElement>(null);
  const progressRef = useRef(reduced ? 0.68 : 0);
  const [phase, setPhase] = useState<TicketRollPhase>(
    reduced ? 'detached' : 'attached',
  );
  const phaseRef = useRef(phase);
  const drag = useRef<DragState>({
    active: false,
    startX: 0,
    startPull: 0,
    pull: reduced ? 0.68 : 0,
    history: [],
  });
  const animFrame = useRef(0);
  const timers = useRef(0);
  const audioRef = useRef<AudioBus | null>(null);

  const ensureAudio = useCallback(() => {
    if (!audioRef.current) {
      const AC =
        window.AudioContext ||
        (window as unknown as { webkitAudioContext: typeof AudioContext })
          .webkitAudioContext;
      if (!AC) return null;
      const context = new AC();
      const master = context.createGain();
      master.gain.value = 0.18;
      master.connect(context.destination);
      audioRef.current = { context, master };
    }
    const bus = audioRef.current;
    if (bus.context.state === 'suspended') {
      void bus.context.resume().catch(() => {});
    }
    return bus;
  }, []);

  const playChop = useCallback(() => {
    const bus = ensureAudio();
    if (!bus) return;
    const { context, master } = bus;
    const t0 = context.currentTime + 0.008;
    const noise = makeChopBuffer(context, 0.28);
    const bp = context.createBiquadFilter();
    const bg = context.createGain();
    bp.type = 'bandpass';
    bp.frequency.setValueAtTime(2050, t0);
    bp.frequency.exponentialRampToValueAtTime(720, t0 + 0.28);
    bp.Q.value = 0.68;
    bg.gain.setValueAtTime(1e-4, t0);
    bg.gain.linearRampToValueAtTime(0.66, t0 + 0.012);
    bg.gain.exponentialRampToValueAtTime(1e-4, t0 + 0.28);
    const hp = context.createBiquadFilter();
    const hg = context.createGain();
    hp.type = 'highpass';
    hp.frequency.setValueAtTime(2850, t0);
    hg.gain.setValueAtTime(1e-4, t0);
    hg.gain.linearRampToValueAtTime(0.24, t0 + 0.008);
    hg.gain.exponentialRampToValueAtTime(1e-4, t0 + 0.2576);
    noise.connect(bp).connect(bg).connect(master);
    noise.connect(hp).connect(hg).connect(master);
    noise.start(t0);
    noise.stop(t0 + 0.28);
  }, [ensureAudio]);

  const playSettle = useCallback(() => {
    const bus = ensureAudio();
    if (!bus) return;
    const { context, master } = bus;
    const t0 = context.currentTime + 0.012;
    [880, 1108.73, 1318.51, 1760].forEach((freq, i) => {
      const start = t0 + 0.055 * i;
      const osc = context.createOscillator();
      const gain = context.createGain();
      osc.type = i === 0 ? 'triangle' : 'sine';
      osc.frequency.setValueAtTime(freq, start);
      osc.frequency.exponentialRampToValueAtTime(1.018 * freq, start + 0.68);
      gain.gain.setValueAtTime(1e-4, start);
      gain.gain.linearRampToValueAtTime(i === 0 ? 0.115 : 0.085, start + 0.025);
      gain.gain.exponentialRampToValueAtTime(1e-4, start + 0.76);
      osc.connect(gain).connect(master);
      osc.start(start);
      osc.stop(start + 0.78);
    });
    const noise = makeNoiseBuffer(context, 0.62);
    const hp = context.createBiquadFilter();
    const gain = context.createGain();
    hp.type = 'highpass';
    hp.frequency.setValueAtTime(5200, t0);
    gain.gain.setValueAtTime(1e-4, t0);
    gain.gain.linearRampToValueAtTime(0.075, t0 + 0.035);
    gain.gain.exponentialRampToValueAtTime(1e-4, t0 + 0.58);
    noise.connect(hp).connect(gain).connect(master);
    noise.start(t0);
    noise.stop(t0 + 0.62);
  }, [ensureAudio]);

  const setPull = useCallback((value: number) => {
    const pull = Math.max(0, Math.min(1, value));
    drag.current.pull = pull;
    progressRef.current = pull;
    dragRef.current?.style.setProperty('--pull', `${pull}`);
  }, []);

  const easePull = useCallback(
    (target: number, duration: number, onDone?: () => void) => {
      cancelAnimationFrame(animFrame.current);
      const from = drag.current.pull;
      const start = performance.now();
      const tick = (now: number) => {
        const t = Math.min(1, (now - start) / duration);
        setPull(from + (target - from) * (1 - Math.pow(1 - t, 4)));
        if (t < 1) animFrame.current = requestAnimationFrame(tick);
        else onDone?.();
      };
      animFrame.current = requestAnimationFrame(tick);
    },
    [setPull],
  );

  const springPull = useCallback(
    (target: number, velocity = 0, onDone?: () => void) => {
      cancelAnimationFrame(animFrame.current);
      let pull = drag.current.pull;
      let vel = velocity;
      let last = performance.now();
      const omega = (2 * Math.PI) / 0.36;
      const zeta = target === 0 ? 1 : 0.86;
      const tick = (now: number) => {
        const dt = Math.min(0.032, Math.max(0.001, (now - last) / 1000));
        last = now;
        const force = -omega * omega * (pull - target) - 2 * zeta * omega * vel;
        vel += force * dt;
        pull += vel * dt;
        setPull(pull);
        if (Math.abs(pull - target) > 0.001 || Math.abs(vel) > 0.004) {
          animFrame.current = requestAnimationFrame(tick);
        } else {
          setPull(target);
          onDone?.();
        }
      };
      animFrame.current = requestAnimationFrame(tick);
    },
    [setPull],
  );

  const tear = useCallback(
    (releaseVelocity = 0) => {
      if (phaseRef.current !== 'attached' || reduced) return;
      ensureAudio();
      phaseRef.current = 'tension';
      setPhase('tension');
      const vel = Number.isFinite(releaseVelocity)
        ? Math.max(0, releaseVelocity)
        : 0;
      const runSequence = () => {
        phaseRef.current = 'perforation';
        setPhase('perforation');
        timers.current = window.setTimeout(() => {
          phaseRef.current = 'chopping';
          setPhase('chopping');
          playChop();
          timers.current = window.setTimeout(() => {
            phaseRef.current = 'tearing';
            setPhase('tearing');
            timers.current = window.setTimeout(() => {
              phaseRef.current = 'holding';
              setPhase('holding');
              timers.current = window.setTimeout(() => {
                phaseRef.current = 'settling';
                setPhase('settling');
                playSettle();
                timers.current = window.setTimeout(() => {
                  phaseRef.current = 'detached';
                  setPhase('detached');
                  setPull(0.68);
                }, 620);
              }, 240);
            }, 130);
          }, 95);
        }, 480);
      };
      if (vel > 0.01) springPull(1, vel, runSequence);
      else
        easePull(
          1,
          Math.max(300, (1 - drag.current.pull) * 780),
          runSequence,
        );
    },
    [easePull, ensureAudio, playChop, playSettle, reduced, setPull, springPull],
  );

  const reset = useCallback(() => {
    clearTimeout(timers.current);
    phaseRef.current = 'attached';
    setPhase('attached');
    setPull(0);
  }, [setPull]);

  const onPointerDown = useCallback(
    (e: React.PointerEvent) => {
      if (phaseRef.current !== 'attached' || reduced) return;
      ensureAudio();
      cancelAnimationFrame(animFrame.current);
      drag.current.active = true;
      drag.current.startX = e.clientX;
      drag.current.startPull = drag.current.pull;
      drag.current.history = [
        { pull: drag.current.pull, time: e.timeStamp },
      ];
      e.currentTarget.setPointerCapture(e.pointerId);
    },
    [ensureAudio, reduced],
  );

  const onPointerMove = useCallback(
    (e: React.PointerEvent) => {
      if (!drag.current.active) return;
      let next =
        drag.current.startPull + (e.clientX - drag.current.startX) / 150;
      if (next <= 0.74) setPull(next);
      else {
        const over = next - 0.74;
        setPull(0.74 + (0.624 * over) / (0.26 + 2.4 * Math.abs(over)));
      }
      drag.current.history.push({
        pull: drag.current.pull,
        time: e.timeStamp,
      });
      const cutoff = e.timeStamp - 90;
      drag.current.history = drag.current.history
        .filter((h) => h.time >= cutoff)
        .slice(-6);
    },
    [setPull],
  );

  const onPointerUp = useCallback(() => {
    if (!drag.current.active) return;
    drag.current.active = false;
    const hist = drag.current.history;
    const first = hist[0];
    const last = hist[hist.length - 1];
    const dt = first && last ? Math.max(16, last.time - first.time) : 16;
    const velocity =
      first && last ? (last.pull - first.pull) / (dt / 1000) : 0;
    const projected = drag.current.pull + 0.14 * velocity;
    const hard =
      drag.current.pull >= 0.92 && velocity > -0.08;
    const flick =
      drag.current.pull > 0.775 && velocity > 0.12 && projected >= 0.92;
    if (hard || flick) {
      tear(velocity);
      return;
    }
    springPull(
      drag.current.pull > 0.58 && velocity > -0.7 ? 0.74 : 0,
      velocity,
    );
  }, [springPull, tear]);

  useEffect(() => {
    phaseRef.current = phase;
  }, [phase]);

  useEffect(
    () => () => {
      cancelAnimationFrame(animFrame.current);
      clearTimeout(timers.current);
      void audioRef.current?.context.close().catch(() => {});
    },
    [],
  );

  return {
    dragRef,
    progressRef,
    phase,
    tear,
    reset,
    onPointerDown,
    onPointerMove,
    onPointerUp,
  };
}
