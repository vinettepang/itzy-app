import { UNSEEN_ASSETS } from '../assetPaths';

/** SOURCE · theme `uo.audio` Howler sprite map (ms) */
export const AUDIO_SPRITES = {
  backing: { start: 0, duration: 30747, loop: true },
  click: { start: 31200, duration: 500, loop: false },
  contact_swoosh: { start: 32400, duration: 4500, loop: false },
  hover: { start: 37600, duration: 500, loop: false },
  menu_close: { start: 38800, duration: 1000, loop: false },
  menu_swoosh: { start: 40000, duration: 1071, loop: false },
  navlinks_hover: { start: 42200, duration: 1567, loop: false },
  new_water_projects: { start: 44400, duration: 2500, loop: false },
  ratchet: { start: 47600, duration: 62, loop: false },
  world_static: { start: 48800, duration: 5295, loop: false },
  'world-intro': { start: 55000, duration: 12800, loop: false },
  'world-loop': { start: 68200, duration: 12800, loop: true },
} as const;

export type CueName = keyof typeof AUDIO_SPRITES;

const SRC = `${UNSEEN_ASSETS}audio/audio.webm`;

type Listener = () => void;

class StudioSound {
  private backing: HTMLAudioElement | null = null;
  private cuePool: HTMLAudioElement[] = [];
  private muted = true;
  private enabled = false;
  private hoverGate = 0;
  private worldTimer: number | null = null;
  private listeners = new Set<Listener>();

  private makeAudio() {
    const a = new Audio(SRC);
    a.preload = 'auto';
    return a;
  }

  private ensureBacking() {
    if (!this.backing) {
      this.backing = this.makeAudio();
      this.backing.volume = 0.55;
      this.backing.addEventListener('timeupdate', this.onBackingTime);
    }
    return this.backing;
  }

  private onBackingTime = () => {
    const a = this.backing;
    if (!a || !this.enabled || this.muted) return;
    const end = AUDIO_SPRITES.backing.duration / 1000;
    if (a.currentTime >= end - 0.04) a.currentTime = AUDIO_SPRITES.backing.start / 1000;
  };

  private acquireCue() {
    let a = this.cuePool.find((x) => x.paused);
    if (!a) {
      a = this.makeAudio();
      a.volume = 0.7;
      this.cuePool.push(a);
      if (this.cuePool.length > 6) {
        const old = this.cuePool.shift();
        if (old) {
          old.pause();
          old.src = '';
        }
      }
    }
    return a;
  }

  setEnabled(on: boolean) {
    this.enabled = on;
    const a = this.ensureBacking();
    a.muted = this.muted;
    if (on && !this.muted) {
      a.currentTime = AUDIO_SPRITES.backing.start / 1000;
      void a.play().catch(() => undefined);
    } else {
      a.pause();
      this.stopWorld();
    }
    this.emit();
  }

  setMuted(muted: boolean) {
    this.muted = muted;
    const a = this.ensureBacking();
    a.muted = muted;
    this.cuePool.forEach((c) => {
      c.muted = muted;
    });
    if (this.enabled && !muted) {
      a.currentTime = Math.max(a.currentTime, AUDIO_SPRITES.backing.start / 1000);
      void a.play().catch(() => undefined);
    } else {
      a.pause();
      this.stopWorld();
    }
    this.emit();
  }

  play(name: CueName) {
    if (!this.enabled || this.muted) return;
    const spr = AUDIO_SPRITES[name];
    if (!spr) return;
    const a = this.acquireCue();
    a.muted = false;
    a.loop = false;
    a.currentTime = spr.start / 1000;
    void a.play().catch(() => undefined);
    window.setTimeout(
      () => {
        if (!a.paused) a.pause();
      },
      Math.max(40, spr.duration + 30),
    );
  }

  playHover() {
    const now = performance.now();
    if (now - this.hoverGate < 180) return;
    this.hoverGate = now;
    this.play('navlinks_hover');
  }

  playRoute(kind: 'home' | 'projects' | 'contact' | 'world') {
    if (kind === 'projects') this.play('new_water_projects');
    else if (kind === 'contact') this.play('contact_swoosh');
    else if (kind === 'world') this.playWorld();
    else this.play('click');
  }

  private playWorld() {
    this.stopWorld();
    this.play('world-intro');
    this.worldTimer = window.setTimeout(() => {
      if (!this.enabled || this.muted) return;
      this.play('world_static');
    }, AUDIO_SPRITES['world-intro'].duration);
  }

  private stopWorld() {
    if (this.worldTimer != null) {
      window.clearTimeout(this.worldTimer);
      this.worldTimer = null;
    }
  }

  subscribe(fn: Listener) {
    this.listeners.add(fn);
    return () => this.listeners.delete(fn);
  }

  private emit() {
    this.listeners.forEach((fn) => fn());
  }

  dispose() {
    this.stopWorld();
    if (this.backing) {
      this.backing.removeEventListener('timeupdate', this.onBackingTime);
      this.backing.pause();
      this.backing.src = '';
      this.backing = null;
    }
    this.cuePool.forEach((c) => {
      c.pause();
      c.src = '';
    });
    this.cuePool = [];
  }
}

export const studioSound = new StudioSound();
