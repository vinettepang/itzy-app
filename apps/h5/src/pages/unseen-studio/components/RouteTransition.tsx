import { useEffect, useRef, useState } from 'react';
import { useLocation } from 'react-router-dom';
import { markProjectsEnterPending } from './ProjectMenuCanvas';

function routeKind(path: string) {
  if (path.includes('/projects')) return 'projects';
  if (path.includes('/contact')) return 'contact';
  if (path.includes('/world')) return 'world';
  return 'home';
}

/**
 * PARTIAL · theme transitionPass / Highway wipe + SavePass-like flash pulse.
 * Home ↔ Contact share one WebGL scene (camera only) — no cream mask.
 * Home → Projects: longer wipe + `us-projects-enter` (SOURCE cameraY 2vh slide).
 */
export default function RouteTransition() {
  const location = useLocation();
  const [active, setActive] = useState(false);
  const [variant, setVariant] = useState<'default' | 'projects'>('default');
  const prev = useRef(location.pathname);

  useEffect(() => {
    const from = routeKind(prev.current);
    const to = routeKind(location.pathname);
    prev.current = location.pathname;

    if ((from === 'home' || from === 'contact') && (to === 'home' || to === 'contact')) {
      setActive(false);
      window.dispatchEvent(new CustomEvent('us-route-flash', { detail: { soft: true, to } }));
      return;
    }

    setVariant(to === 'projects' || from === 'projects' ? 'projects' : 'default');
    setActive(true);
    window.dispatchEvent(new CustomEvent('us-route-flash', { detail: { soft: false, to } }));

    if (to === 'projects') {
      markProjectsEnterPending();
      // Fire early so ProjectMenu can start the Y-slide under the wipe
      window.dispatchEvent(new CustomEvent('us-projects-enter'));
    }

    const ms = to === 'projects' || from === 'projects' ? 1350 : 520;
    const t = window.setTimeout(() => setActive(false), ms);
    return () => {
      window.clearTimeout(t);
      setActive(false);
    };
  }, [location.pathname]);

  return (
    <div
      className={`us-route-transition${active ? ' is-active' : ''} us-route-transition--${variant}`}
      aria-hidden
    >
      <div className="us-route-transition__save us-route-transition__save--a" />
      <div className="us-route-transition__save us-route-transition__save--b" />
      <div className="us-route-transition__flash" />
      <div className="us-route-transition__slice us-route-transition__slice--a" />
      <div className="us-route-transition__slice us-route-transition__slice--b" />
      <div className="us-route-transition__slice us-route-transition__slice--c" />
      <div className="us-route-transition__band" />
    </div>
  );
}
