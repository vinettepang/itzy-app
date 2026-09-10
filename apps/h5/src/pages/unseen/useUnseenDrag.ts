import { type RefObject, useCallback, useEffect, useRef } from 'react';

type Point = { x: number; y: number };

const FRICTION = 0.9;
const DRAG_SMOOTHING = 0.42;
const RELEASE_SMOOTHING = 0.16;
const STOP = 0.08;

export function useUnseenDrag(
  stageRef: RefObject<HTMLElement | null>,
  enabled: boolean,
  sessionId = 0,
  options?: {
    dragOnInteractive?: boolean;
    scaleRef?: RefObject<number>;
    /** 接收拖拽事件的容器，默认与 stage 相同；传 world 可覆盖空白区域 */
    surfaceRef?: RefObject<HTMLElement | null>;
  },
) {
  const surfaceRef = options?.surfaceRef ?? stageRef;
  const targetPanRef = useRef<Point>({ x: 0, y: 0 });
  const panRef = useRef<Point>({ x: 0, y: 0 });
  const velocityRef = useRef<Point>({ x: 0, y: 0 });
  const draggingRef = useRef(false);
  const lastPointerRef = useRef<Point | null>(null);
  const rafRef = useRef(0);
  const dragOnInteractiveRef = useRef(options?.dragOnInteractive ?? false);
  const scaleRef = options?.scaleRef;

  dragOnInteractiveRef.current = options?.dragOnInteractive ?? false;

  const applyTransform = useCallback(() => {
    const el = stageRef.current;
    if (!el) return;
    const x = panRef.current.x;
    const y = panRef.current.y;
    const scale = scaleRef?.current ?? 1;
    el.style.transform = `translate3d(${x}px, ${y}px, 0) scale(${scale})`;
  }, [stageRef, scaleRef]);

  const resetPan = useCallback((x = 0, y = 0) => {
    targetPanRef.current = { x, y };
    panRef.current = { x, y };
    velocityRef.current = { x: 0, y: 0 };
    draggingRef.current = false;
    lastPointerRef.current = null;
    applyTransform();
  }, [applyTransform]);

  useEffect(() => {
    const el = surfaceRef.current;
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
      const smoothing = draggingRef.current ? DRAG_SMOOTHING : RELEASE_SMOOTHING;
      panRef.current.x += dx * smoothing + velocityRef.current.x * 0.08;
      panRef.current.y += dy * smoothing + velocityRef.current.y * 0.08;

      applyTransform();

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
      const target = e.target as HTMLElement | null;
      if (!dragOnInteractiveRef.current && target?.closest('button, a, [data-no-drag]')) {
        return;
      }
      if (dragOnInteractiveRef.current && target?.closest('[data-no-drag="strict"]')) {
        return;
      }

      draggingRef.current = true;
      lastPointerRef.current = { x: e.clientX, y: e.clientY };
      velocityRef.current = { x: 0, y: 0 };
      el.setPointerCapture(e.pointerId);
      startLoop();
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
      if (el.hasPointerCapture(e.pointerId)) {
        el.releasePointerCapture(e.pointerId);
      }
      startLoop();
    };

    el.addEventListener('pointerdown', onPointerDown);
    el.addEventListener('pointermove', onPointerMove);
    el.addEventListener('pointerup', onPointerUp);
    el.addEventListener('pointercancel', onPointerUp);

    applyTransform();

    return () => {
      draggingRef.current = false;
      lastPointerRef.current = null;
      if (rafRef.current) cancelAnimationFrame(rafRef.current);
      rafRef.current = 0;
      el.removeEventListener('pointerdown', onPointerDown);
      el.removeEventListener('pointermove', onPointerMove);
      el.removeEventListener('pointerup', onPointerUp);
      el.removeEventListener('pointercancel', onPointerUp);
    };
  }, [enabled, surfaceRef, sessionId, applyTransform]);

  return { panRef, resetPan, draggingRef, applyTransform };
}
