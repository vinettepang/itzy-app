import { useEffect, useRef } from 'react';
import { createRefractionScene } from '../scene/createRefractionScene';
import type { RefractionSceneHandle } from '../scene/types';

type Props = {
  onReady?: (handle: RefractionSceneHandle) => void;
  onProgress?: (percent: number) => void;
  onError?: () => void;
  onThemeChange?: (index: 1 | 2) => void;
  onHoldChange?: (holding: boolean) => void;
};

export default function RefractionCanvas({
  onReady,
  onProgress,
  onError,
  onThemeChange,
  onHoldChange,
}: Props) {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const handleRef = useRef<RefractionSceneHandle | null>(null);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    let cancelled = false;
    let cleanupListeners: (() => void) | undefined;

    createRefractionScene({
      canvas,
      onProgress,
      onThemeChange,
      onHoldChange,
    })
      .then((handle) => {
      if (cancelled) {
        handle.dispose();
        return;
      }
      handleRef.current = handle;
      onReady?.(handle);

      const onResize = () => handle.resize();
      const onMove = (e: PointerEvent) => handle.onPointerMove(e.clientX, e.clientY);
      const onDown = () => handle.onPointerDown();
      const onUp = () => handle.onPointerUp();
      const onKey = (e: KeyboardEvent) => {
        if (e.key === 'ArrowLeft') handle.switchToScene1();
        if (e.key === 'ArrowRight') handle.switchToScene2();
      };

      window.addEventListener('resize', onResize);
      window.addEventListener('pointermove', onMove);
      window.addEventListener('pointerdown', onDown);
      window.addEventListener('pointerup', onUp);
      window.addEventListener('keydown', onKey);

      cleanupListeners = () => {
        window.removeEventListener('resize', onResize);
        window.removeEventListener('pointermove', onMove);
        window.removeEventListener('pointerdown', onDown);
        window.removeEventListener('pointerup', onUp);
        window.removeEventListener('keydown', onKey);
      };
    })
      .catch((err) => {
        console.error('Refraction scene failed', err);
        onProgress?.(100);
        onError?.();
      });

    return () => {
      cancelled = true;
      cleanupListeners?.();
      handleRef.current?.dispose();
      handleRef.current = null;
    };
  }, [onError, onHoldChange, onProgress, onReady, onThemeChange]);

  return <canvas ref={canvasRef} className="gl-canvas" aria-hidden="true" />;
}
