import { useEffect, useRef } from 'react';
import { createFallingStickersScene } from './createFallingStickersScene';

type Props = {
  onReady?: () => void;
};

/** Haoqi-style falling stickers for the XKM fixed hero. */
export default function NewHomeFallCanvas({ onReady }: Props) {
  const mountRef = useRef<HTMLDivElement>(null);
  const onReadyRef = useRef(onReady);
  onReadyRef.current = onReady;

  useEffect(() => {
    const mount = mountRef.current;
    if (!mount) return;
    const handle = createFallingStickersScene(mount, {
      onReady: () => onReadyRef.current?.(),
    });
    return () => handle.dispose();
  }, []);

  return (
    <div
      ref={mountRef}
      className="xkm-media__fall"
      aria-hidden="true"
    />
  );
}
