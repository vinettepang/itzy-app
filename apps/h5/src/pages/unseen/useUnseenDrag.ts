import { type RefObject, useEffect, useRef, useState } from 'react';

type Point = { x: number; y: number };

const FRICTION = 0.9;
const SMOOTHING = 0.14;
const STOP = 0.08;

export function useUnseenDrag(
  targetRef: RefObject<HTMLElement | null>,
  enabled: boolean,
) {
  const [pan, setPan] = useState<Point>({ x: 0, y: 0 });
  const targetPanRef = useRef<Point>({ x: 0, y: 0 });
  const panRef = useRef<Point>({ x: 0, y: 0 });
  const velocityRef = useRef<Point>({ x: 0, y: 0 });
  const draggingRef = useRef(false);
  const lastPointerRef = useRef<Point | null>(null);
  const rafRef = useRef(0);

  useEffect(() => {
    const el = targetRef.current;
    if (!enabled || !el) return undefined;

    const tick = () => {
      if (!draggingRef.current) {
        velocityRef.current.x *= FRICTION;
        velocityRef.current.y *= FRICTION;
        targetPanRef.current.x += velocityRef.current.x;
        targetPanRef.current.y += velocityRef.current.y;
      }

      const dx = targetPanRef.current.x - panRef.current.x;
      const dy = targetPanRef.current.y - panRef.current.y;
      panRef.current.x += dx * SMOOTHING + velocityRef.current.x * 0.08;
      panRef.current.y += dy * SMOOTHING + velocityRef.current.y * 0.08;

      setPan({ x: panRef.current.x, y: panRef.current.y });

      const moving =
        Math.abs(dx) > STOP ||
        Math.abs(dy) > STOP ||
        Math.abs(velocityRef.current.x) > STOP ||
        Math.abs(velocityRef.current.y) > STOP ||
        draggingRef.current;

      if (moving) {
        rafRef.current = requestAnimationFrame(tick);
      } else {
        rafRef.current = 0;
      }
    };

    const startLoop = () => {
      if (!rafRef.current) rafRef.current = requestAnimationFrame(tick);
    };

    const onPointerDown = (e: PointerEvent) => {
      draggingRef.current = true;
      lastPointerRef.current = { x: e.clientX, y: e.clientY };
      el.setPointerCapture(e.pointerId);
    };

    const onPointerMove = (e: PointerEvent) => {
      if (!draggingRef.current || !lastPointerRef.current) return;
      const dx = e.clientX - lastPointerRef.current.x;
      const dy = e.clientY - lastPointerRef.current.y;
      lastPointerRef.current = { x: e.clientX, y: e.clientY };
      targetPanRef.current.x += dx;
      targetPanRef.current.y += dy;
      velocityRef.current.x = dx * 0.35;
      velocityRef.current.y = dy * 0.35;
      startLoop();
    };

    const onPointerUp = (e: PointerEvent) => {
      draggingRef.current = false;
      lastPointerRef.current = null;
      el.releasePointerCapture(e.pointerId);
      startLoop();
    };

    el.addEventListener('pointerdown', onPointerDown);
    el.addEventListener('pointermove', onPointerMove);
    el.addEventListener('pointerup', onPointerUp);
    el.addEventListener('pointercancel', onPointerUp);

    return () => {
      if (rafRef.current) cancelAnimationFrame(rafRef.current);
      el.removeEventListener('pointerdown', onPointerDown);
      el.removeEventListener('pointermove', onPointerMove);
      el.removeEventListener('pointerup', onPointerUp);
      el.removeEventListener('pointercancel', onPointerUp);
    };
  }, [enabled, targetRef]);

  return pan;
}
