import { useEffect, useRef } from 'react';
import { createHomeScene, type HomeSceneHandle, type SceneMode } from '../scene/createHomeScene';

type Props = {
  active: boolean;
  mode: SceneMode;
  onProgress?: (pct: number) => void;
  onReady?: () => void;
  onError?: (err: Error) => void;
};

export default function HomeCanvas({ active, mode, onProgress, onReady, onError }: Props) {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const handleRef = useRef<HomeSceneHandle | null>(null);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    let cancelled = false;

    createHomeScene({
      canvas,
      onProgress,
    })
      .then((handle) => {
        if (cancelled) {
          handle.dispose();
          return;
        }
        handleRef.current = handle;
        handle.setMode(mode);
        handle.setEnabled(active);
        onReady?.();
      })
      .catch((err: unknown) => {
        if (cancelled) return;
        onError?.(err instanceof Error ? err : new Error(String(err)));
      });

    return () => {
      cancelled = true;
      handleRef.current?.dispose();
      handleRef.current = null;
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps -- boot once
  }, []);

  useEffect(() => {
    handleRef.current?.setEnabled(active);
  }, [active]);

  useEffect(() => {
    handleRef.current?.setMode(mode);
  }, [mode]);

  return <canvas ref={canvasRef} id="gl" />;
}
