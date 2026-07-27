import { useEffect, useRef } from 'react';
import { createRefractionScene } from '../webgl-refraction/scene/createRefractionScene';
import type { RefractionSceneHandle } from '../webgl-refraction/scene/types';

type Props = {
  onReady?: () => void;
};

/**
 * Embedded labs/webgl-refraction bubble scene for the new_home hero center.
 * Pointer / resize are scoped to this canvas (createRefractionScene uses client size).
 */
export default function NewHomeRefractionCanvas({ onReady }: Props) {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const onReadyRef = useRef(onReady);
  onReadyRef.current = onReady;

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    let cancelled = false;
    let cleanupListeners: (() => void) | undefined;
    let handle: RefractionSceneHandle | null = null;

    createRefractionScene({ canvas, lettersOnly: true })
      .then((h) => {
        if (cancelled) {
          h.dispose();
          return;
        }
        handle = h;
        h.resize();
        onReadyRef.current?.();

        const onResize = () => h.resize();
        const onMove = (e: PointerEvent) => h.onPointerMove(e.clientX, e.clientY);
        const onDown = (e: PointerEvent) => {
          const rect = canvas.getBoundingClientRect();
          if (
            e.clientX < rect.left ||
            e.clientX > rect.right ||
            e.clientY < rect.top ||
            e.clientY > rect.bottom
          ) {
            return;
          }
          h.onPointerDown();
        };
        const onUp = () => h.onPointerUp();

        window.addEventListener('resize', onResize);
        window.addEventListener('pointermove', onMove);
        window.addEventListener('pointerdown', onDown);
        window.addEventListener('pointerup', onUp);
        const ro = new ResizeObserver(onResize);
        ro.observe(canvas.parentElement ?? canvas);

        cleanupListeners = () => {
          window.removeEventListener('resize', onResize);
          window.removeEventListener('pointermove', onMove);
          window.removeEventListener('pointerdown', onDown);
          window.removeEventListener('pointerup', onUp);
          ro.disconnect();
        };
      })
      .catch((err) => {
        console.error('[new_home] refraction failed', err);
        onReadyRef.current?.();
      });

    return () => {
      cancelled = true;
      cleanupListeners?.();
      handle?.dispose();
    };
  }, []);

  return <canvas ref={canvasRef} className="xkm-media__refraction-canvas" aria-hidden="true" />;
}
