import gsap from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';

gsap.registerPlugin(ScrollTrigger);

const VIDEO_SCALE_FROM = 1.4;
const VIDEO_SCALE_TO = 0.35;
const VIDEO_SCRUB = 1;
const BG_SCALE_FROM = 1.8;
const BG_SCALE_TO = 1;
const BG_SCRUB = 1;
const ENTER_START = 'top 85%';
const FADE_OUT_DELAY = 1.4;
const VOLUME_FADE = 1.6;
const TOGGLE_FADE = 0.35;
const SYNC_THRESHOLD = 0.08;

function tickOffset(toggle: HTMLElement, tick: HTMLElement): number {
  const t = toggle.getBoundingClientRect();
  const k = tick.getBoundingClientRect();
  const leftGap = k.left - t.left;
  const rightGap = t.right - k.right;
  return Math.max(0, rightGap - leftGap);
}

function initMuseeBlock(musee: HTMLElement, desktop: boolean): () => void {
  const videoWrap = musee.querySelector<HTMLElement>('.video-w');
  if (!videoWrap) return () => {};

  const parent = musee.parentElement;
  if (parent?.classList.contains('pin-spacer')) {
    parent.parentElement?.insertBefore(musee, parent);
    parent.remove();
    musee.removeAttribute('style');
  }

  const bg = musee.querySelector<HTMLElement>('.musee-bg');
  const section = musee.closest<HTMLElement>('.section') || musee.parentElement;
  const soundBtn =
    musee.querySelector<HTMLElement>('.btn-sound') ||
    section?.querySelector<HTMLElement>('.btn-sound');
  const toggle = soundBtn?.querySelector<HTMLElement>('.toggle-sound');
  const tick = soundBtn?.querySelector<HTMLElement>('.tick-sound');

  const videos = [...videoWrap.querySelectorAll<HTMLVideoElement>('video')];
  const scrollTriggers: ScrollTrigger[] = [];

  let soundOn = false;
  let volumeTween: gsap.core.Tween | null = null;
  let muting = false;
  let started = false;
  let syncRaf: number | null = null;

  if (soundBtn) gsap.set(soundBtn, { opacity: 0, pointerEvents: 'none' });

  const setSoundUi = (on: boolean) => {
    soundBtn?.classList.toggle('is-on', on);
    if (tick && toggle) {
      gsap.to(tick, {
        x: on ? tickOffset(toggle, tick) : 0,
        duration: 0.3,
        ease: 'power2.out',
      });
    }
  };

  const fadeVolume = (on: boolean, delay = 0, duration = VOLUME_FADE) => {
    const primary = videos[0];
    if (!primary) return;
    volumeTween?.kill();
    volumeTween = null;

    if (on) {
      muting = false;
      primary.muted = false;
      primary.volume = 0;
      const play = primary.play();
      play?.catch?.(() => {});
      volumeTween = gsap.to(primary, {
        volume: 1,
        duration,
        delay,
        ease: 'power1.out',
        onComplete: () => {
          volumeTween = null;
        },
      });
    } else {
      muting = true;
      volumeTween = gsap.to(primary, {
        volume: 0,
        duration,
        delay,
        ease: 'power1.out',
        onComplete: () => {
          try {
            primary.muted = true;
            primary.volume = 1;
          } catch {
            /* ignore */
          }
          muting = false;
          volumeTween = null;
        },
      });
    }
  };

  const onSoundClick = () => {
    soundOn = !soundOn;
    setSoundUi(soundOn);
    fadeVolume(soundOn, 0, TOGGLE_FADE);
  };

  const muteOnLeave = () => {
    if (soundOn) fadeVolume(false, FADE_OUT_DELAY, VOLUME_FADE);
  };

  const startPlayback = () => {
    if (started || !videos.length) return;
    started = true;
    const t0 = videos[0].currentTime;
    videos.forEach((v) => {
      try {
        v.currentTime = t0;
      } catch {
        /* ignore */
      }
      const play = v.play();
      play?.catch?.(() => {});
    });

    if (videos.length > 1) {
      const sync = () => {
        const lead = videos[0];
        for (let i = 1; i < videos.length; i++) {
          if (Math.abs(videos[i].currentTime - lead.currentTime) > SYNC_THRESHOLD) {
            try {
              videos[i].currentTime = lead.currentTime;
            } catch {
              /* ignore */
            }
          }
        }
        syncRaf = requestAnimationFrame(sync);
      };
      syncRaf = requestAnimationFrame(sync);
    }

    if (soundBtn) {
      gsap.to(soundBtn, { opacity: 1, pointerEvents: 'auto', duration: 0.5, ease: 'power2.out' });
    }
  };

  const onEnterZone = () => {
    const primary = videos[0];
    if (soundOn && (muting || (primary && primary.muted))) fadeVolume(true, 0, VOLUME_FADE);
    else startPlayback();
  };

  soundBtn?.addEventListener('click', onSoundClick);

  videos.forEach((video) => {
    video.autoplay = false;
    video.removeAttribute('autoplay');
    video.preload = 'auto';
    try {
      video.pause();
      if (video.readyState >= 1) video.currentTime = 0.001;
      else {
        if (video.networkState !== HTMLMediaElement.NETWORK_LOADING) video.load();
        video.addEventListener(
          'loadedmetadata',
          () => {
            if (!started) {
              try {
                video.currentTime = 0.001;
              } catch {
                /* ignore */
              }
            }
          },
          { once: true },
        );
      }
    } catch {
      /* ignore */
    }
  });

  const enterSt = ScrollTrigger.create({
    trigger: musee,
    start: ENTER_START,
    onEnter: onEnterZone,
    onEnterBack: onEnterZone,
  });
  scrollTriggers.push(enterSt);

  if (desktop) {
    const pinTween = gsap.fromTo(
      videoWrap,
      { scale: VIDEO_SCALE_FROM },
      {
        scale: VIDEO_SCALE_TO,
        ease: 'none',
        scrollTrigger: {
          trigger: musee,
          start: 'top top',
          end: 'bottom top',
          pin: musee,
          pinSpacing: true,
          scrub: VIDEO_SCRUB,
          invalidateOnRefresh: true,
          refreshPriority: 1,
          onEnter: onEnterZone,
          onEnterBack: onEnterZone,
          onLeave: muteOnLeave,
          onLeaveBack: muteOnLeave,
        },
      },
    );
    if (pinTween.scrollTrigger) scrollTriggers.push(pinTween.scrollTrigger);

    if (bg) {
      const bgTween = gsap.fromTo(
        bg,
        { scale: BG_SCALE_FROM },
        {
          scale: BG_SCALE_TO,
          ease: 'none',
          scrollTrigger: {
            trigger: musee,
            start: 'top top',
            end: 'bottom top',
            scrub: BG_SCRUB,
            invalidateOnRefresh: true,
          },
        },
      );
      if (bgTween.scrollTrigger) scrollTriggers.push(bgTween.scrollTrigger);
    }
  } else {
    const mobileSt = ScrollTrigger.create({
      trigger: musee,
      start: 'top top',
      end: 'bottom top',
      onEnter: onEnterZone,
      onEnterBack: onEnterZone,
      onLeave: muteOnLeave,
      onLeaveBack: muteOnLeave,
    });
    scrollTriggers.push(mobileSt);
  }

  return () => {
    if (syncRaf) cancelAnimationFrame(syncRaf);
    volumeTween?.kill();
    soundBtn?.removeEventListener('click', onSoundClick);
    videos.forEach((v) => {
      try {
        v.pause();
        v.muted = true;
      } catch {
        /* ignore */
      }
    });
    scrollTriggers.forEach((st) => {
      st.animation?.kill();
      st.kill(true);
    });
    gsap.set(musee, { clearProps: 'all' });
    gsap.set([videoWrap, bg].filter(Boolean), { clearProps: 'scale' });
    if (soundBtn) {
      soundBtn.classList.remove('is-on');
      gsap.set(soundBtn, { clearProps: 'opacity,pointerEvents' });
    }
    if (tick) gsap.set(tick, { clearProps: 'transform' });
  };
}

/** main `ux` / `bC` */
export function initStudioMusee(scope: HTMLElement): () => void {
  const blocks = [...scope.querySelectorAll<HTMLElement>('.musee-w')];
  if (!blocks.length) return () => {};

  const desktop = window.matchMedia('(min-width: 992px)').matches;
  const cleanups = blocks.map((b) => initMuseeBlock(b, desktop));

  return () => cleanups.forEach((fn) => fn());
}
