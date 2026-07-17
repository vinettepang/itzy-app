import { useEffect, useRef } from 'react';
import type { ProjectItem } from '../data/types';
import { createProjectMenuScene, type ProjectMenuHandle } from '../scene/createProjectMenuScene';

type Props = {
  active: boolean;
  projects: ProjectItem[];
  filter: string;
  onReady?: () => void;
};

function isStudioEntered() {
  return !!document.querySelector('.unseen-studio.is-entered');
}

/** Set by RouteTransition when navigating to projects; consumed once scene is ready. */
let pendingProjectsEnter = false;

export function markProjectsEnterPending() {
  pendingProjectsEnter = true;
}

export default function ProjectMenuCanvas({ active, projects, filter, onReady }: Props) {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const handleRef = useRef<ProjectMenuHandle | null>(null);
  const filterRef = useRef(filter);
  const activeRef = useRef(active);
  const enterArmedRef = useRef(false);
  filterRef.current = filter;
  activeRef.current = active;

  const tryPlayEnter = () => {
    const handle = handleRef.current;
    if (!handle || !isStudioEntered()) return;
    if (enterArmedRef.current && !pendingProjectsEnter) return;
    enterArmedRef.current = true;
    pendingProjectsEnter = false;
    handle.playEnter();
  };

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    let cancelled = false;
    enterArmedRef.current = false;
    // Navigating onto this page always wants an enter pass
    pendingProjectsEnter = true;

    createProjectMenuScene({
      canvas,
      projects,
      onSelect: (item) => {
        if (item.link) window.open(item.link, '_blank', 'noopener,noreferrer');
      },
    })
      .then((handle) => {
        if (cancelled) {
          handle.dispose();
          return;
        }
        handleRef.current = handle;
        handle.setFilter(filterRef.current, { animate: false });
        handle.setEnabled(activeRef.current || isStudioEntered());
        if (pendingProjectsEnter) tryPlayEnter();
        onReady?.();
      })
      .catch((err) => {
        if (cancelled) return;
        if (String(err?.message || err).includes('stale')) return;
        console.error('[unseen-studio] project-menu load failed', err);
        onReady?.();
      });

    return () => {
      cancelled = true;
      handleRef.current?.dispose();
      handleRef.current = null;
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  useEffect(() => {
    const sync = () => {
      const handle = handleRef.current;
      if (!handle) return;
      handle.setEnabled(activeRef.current || isStudioEntered());
    };

    sync();
    window.addEventListener('us-studio-entered', sync);
    const poll = window.setInterval(sync, 200);
    return () => {
      window.removeEventListener('us-studio-entered', sync);
      window.clearInterval(poll);
    };
  }, [active]);

  useEffect(() => {
    const onRouteEnter = () => {
      pendingProjectsEnter = true;
      if (handleRef.current) tryPlayEnter();
    };
    window.addEventListener('us-projects-enter', onRouteEnter);
    return () => window.removeEventListener('us-projects-enter', onRouteEnter);
  }, []);

  useEffect(() => {
    handleRef.current?.setFilter(filter, { animate: true });
  }, [filter]);

  return <canvas ref={canvasRef} className="us-project-menu-canvas" />;
}
