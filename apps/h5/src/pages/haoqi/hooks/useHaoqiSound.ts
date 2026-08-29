import { useEffect, useRef } from 'react';

import { assetUrl } from '@/utils/assetUrl';

const AUDIO_URL = assetUrl('/haoqi-static/audio/ambient.mp3');

/** 环境氛围音 — 优先加载生产同款静态音频，回退 Web Audio */
export function useHaoqiSound(enabled: boolean) {
  const audioRef = useRef<HTMLAudioElement | null>(null);
  const ctxRef = useRef<AudioContext | null>(null);
  const synthStopRef = useRef<(() => void) | null>(null);

  useEffect(() => {
    const stopAll = () => {
      synthStopRef.current?.();
      synthStopRef.current = null;
      const a = audioRef.current;
      if (a) {
        a.pause();
        a.currentTime = 0;
      }
    };

    if (!enabled) {
      stopAll();
      return;
    }

    const audio = audioRef.current ?? new Audio(AUDIO_URL);
    audio.loop = true;
    audio.volume = 0.35;
    audioRef.current = audio;

    const startSynth = async () => {
      const ctx = ctxRef.current ?? new AudioContext();
      ctxRef.current = ctx;
      if (ctx.state === 'suspended') await ctx.resume();

      const bufferSize = 2 * ctx.sampleRate;
      const noiseBuffer = ctx.createBuffer(1, bufferSize, ctx.sampleRate);
      const data = noiseBuffer.getChannelData(0);
      for (let i = 0; i < bufferSize; i++) data[i] = (Math.random() * 2 - 1) * 0.28;

      const source = ctx.createBufferSource();
      source.buffer = noiseBuffer;
      source.loop = true;
      const filter = ctx.createBiquadFilter();
      filter.type = 'lowpass';
      filter.frequency.value = 380;
      const gain = ctx.createGain();
      gain.gain.value = 0.022;
      source.connect(filter);
      filter.connect(gain);
      gain.connect(ctx.destination);
      source.start();
      synthStopRef.current = () => {
        try {
          source.stop();
        } catch {
          /* noop */
        }
        source.disconnect();
        filter.disconnect();
        gain.disconnect();
      };
    };

    void audio.play().catch(() => {
      void startSynth();
    });

    return stopAll;
  }, [enabled]);

  useEffect(
    () => () => {
      synthStopRef.current?.();
      void ctxRef.current?.close();
      audioRef.current?.pause();
    },
    [],
  );
}
