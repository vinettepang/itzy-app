import { useEffect, useRef, type CSSProperties, type ReactNode } from 'react';

type Props = {
  className?: string;
  /** Max tilt in degrees */
  tilt?: number;
  /** Max translate in px */
  shift?: number;
  children: ReactNode;
  style?: CSSProperties;
};

/**
 * PARTIAL · Dom2Webgl-style depth: CSS perspective follows pointer.
 */
export default function DomParallax({
  className = '',
  tilt = 4.5,
  shift = 10,
  children,
  style,
}: Props) {
  const ref = useRef<HTMLDivElement>(null);
  const target = useRef({ x: 0, y: 0 });
  const smooth = useRef({ x: 0, y: 0 });

  useEffect(() => {
    const el = ref.current;
    if (!el) return;
    let raf = 0;

    const onMove = (e: PointerEvent) => {
      const nx = (e.clientX / window.innerWidth) * 2 - 1;
      const ny = (e.clientY / window.innerHeight) * 2 - 1;
      target.current.x = nx;
      target.current.y = ny;
    };

    const loop = () => {
      raf = requestAnimationFrame(loop);
      smooth.current.x += (target.current.x - smooth.current.x) * 0.06;
      smooth.current.y += (target.current.y - smooth.current.y) * 0.06;
      const x = smooth.current.x;
      const y = smooth.current.y;
      el.style.transform = `translate3d(${x * shift}px, ${y * shift * 0.55}px, 0) rotateX(${-y * tilt}deg) rotateY(${x * tilt}deg)`;
    };

    window.addEventListener('pointermove', onMove, { passive: true });
    raf = requestAnimationFrame(loop);
    return () => {
      window.removeEventListener('pointermove', onMove);
      cancelAnimationFrame(raf);
    };
  }, [shift, tilt]);

  return (
    <div className={`us-dom-parallax ${className}`.trim()} style={style} ref={ref}>
      {children}
    </div>
  );
}
