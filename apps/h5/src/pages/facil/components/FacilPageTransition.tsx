import { useEffect, useRef, useState, type ReactNode } from 'react';
import { useLocation, useOutlet } from 'react-router-dom';

/**
 * Production Gs page switch:
 * _hide → wrap-out + fade out → swap → wrap-in fade/slide up
 */
export default function FacilPageTransition() {
  const location = useLocation();
  const outlet = useOutlet();
  const [view, setView] = useState<{ path: string; node: ReactNode }>(() => ({
    path: location.pathname,
    node: outlet,
  }));
  const [phase, setPhase] = useState<'idle' | 'out' | 'in'>('idle');
  const first = useRef(true);
  const frozen = useRef<ReactNode>(outlet);
  const timers = useRef<number[]>([]);

  // Always keep a frozen copy of the currently displayed tree
  useEffect(() => {
    if (phase === 'idle' && location.pathname === view.path) {
      frozen.current = outlet;
      setView({ path: location.pathname, node: outlet });
    }
  }, [outlet, location.pathname, view.path, phase]);

  useEffect(() => {
    if (first.current) {
      first.current = false;
      frozen.current = outlet;
      setView({ path: location.pathname, node: outlet });
      return;
    }

    if (location.pathname === view.path) return;

    // Keep showing frozen (old) content while fading out
    setView((v) => ({ path: v.path, node: frozen.current ?? v.node }));
    setPhase('out');
    document.body.classList.add('__noScroll');

    const outMs = 340;
    const inMs = 520;

    const t1 = window.setTimeout(() => {
      frozen.current = outlet;
      setView({ path: location.pathname, node: outlet });
      window.scrollTo(0, 0);
      // force reflow so wrap-in animation restarts
      setPhase('in');
      document.body.classList.remove('__noScroll');

      const t2 = window.setTimeout(() => setPhase('idle'), inMs);
      timers.current.push(t2);
    }, outMs);
    timers.current.push(t1);

    return () => {
      timers.current.forEach((id) => window.clearTimeout(id));
      timers.current = [];
      document.body.classList.remove('__noScroll');
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [location.pathname]);

  const className =
    phase === 'out' ? 'wrap wrap-out' : phase === 'in' ? 'wrap wrap-in' : 'wrap';

  return (
    <div className={className} data-transition={phase}>
      <div key={view.path} className="wrap__page">
        {view.node}
      </div>
    </div>
  );
}
