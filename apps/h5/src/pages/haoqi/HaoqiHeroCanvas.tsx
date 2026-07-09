import { useEffect, useRef } from 'react';
import { createHaoqiScene } from './scene/createHaoqiScene';
import type { HaoqiSceneRefs } from './scene/types';

type Props = HaoqiSceneRefs & {
  isDark?: boolean;
  onReady?: () => void;
};

export default function HaoqiHeroCanvas({
  isDark = false,
  onReady,
  ...refs
}: Props) {
  const mountRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const mount = mountRef.current;
    if (!mount) return;
    const handle = createHaoqiScene(mount, refs);
    onReady?.();
    return () => handle.dispose();
    // eslint-disable-next-line react-hooks/exhaustive-deps -- scene tied to mount only
  }, []);

  return (
    <div
      ref={mountRef}
      className="haoqi__bg-canvas"
      style={{
        width: '100%',
        height: '100%',
        filter: isDark ? 'brightness(0.55) saturate(0.85)' : undefined,
      }}
      aria-hidden="true"
    />
  );
}
