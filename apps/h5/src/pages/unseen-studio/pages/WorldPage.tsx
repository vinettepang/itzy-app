import { useCallback, useEffect, useRef, useState } from 'react';
import { UnseenStudioPage } from '../UnseenStudioLayout';
import type { WorldItem } from '../data/types';
import worldData from '../data/world.slim.json';
import { createWorldScene, type WorldSceneHandle } from '../scene/createWorldScene';

const items = worldData as WorldItem[];

export default function UnseenStudioWorldPage() {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const handleRef = useRef<WorldSceneHandle | null>(null);
  const [active, setActive] = useState<WorldItem | null>(null);
  const [showIntro, setShowIntro] = useState(true);
  const [ready, setReady] = useState(false);

  const onSelect = useCallback((item: WorldItem | null) => {
    setActive(item);
    setShowIntro(false);
  }, []);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    let cancelled = false;

    createWorldScene({ canvas, items, onSelect })
      .then((handle) => {
        if (cancelled) {
          handle.dispose();
          return;
        }
        handleRef.current = handle;
        handle.setEnabled(true);
        setReady(true);
      })
      .catch((err) => console.error('[unseen-studio] world scene failed', err));

    return () => {
      cancelled = true;
      handleRef.current?.dispose();
      handleRef.current = null;
    };
  }, [onSelect]);

  useEffect(() => {
    if (!ready) return;
    const t = window.setTimeout(() => setShowIntro(false), 2800);
    return () => window.clearTimeout(t);
  }, [ready]);

  return (
    <UnseenStudioPage title="World" variant="world">
      <div className="us-world us-world--globe">
        <canvas ref={canvasRef} className="us-world__canvas" />

        {showIntro && (
          <div className="us-world__intro" aria-hidden>
            <p>Drag to explore our world</p>
          </div>
        )}

        {active && (
          <div className="us-world__details">
            <button type="button" className="us-world__close" onClick={() => setActive(null)} aria-label="Close">
              ×
            </button>
            {active.title ? <h2 className="us-world__details-title">{active.title}</h2> : null}
            {active.author ? (
              <p className="us-world__details-author">
                By&nbsp;<span>{active.author}</span>
              </p>
            ) : null}
            {(active.showCaption || active.caption) && active.caption ? (
              <p className="us-world__details-caption">{active.caption}</p>
            ) : null}
            {active.link ? (
              <a className="us-btn" href={active.link} target="_blank" rel="noreferrer">
                View more
              </a>
            ) : null}
          </div>
        )}
      </div>
    </UnseenStudioPage>
  );
}
