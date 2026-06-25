import { useEffect, useRef } from 'react';
import { Link } from 'react-router-dom';
import { ALBUMS } from '@/pages/songs/songsData';
import { initSongsPlayer } from '@/pages/songs/songsPlayer';
import './SongsPage.css';

const pad = (n: number) => String(n).padStart(2, '0');

export default function SongsPage() {
  const pageRef = useRef<HTMLDivElement>(null);
  const listRef = useRef<HTMLDivElement>(null);
  const trackRef = useRef<HTMLDivElement>(null);
  const lyricsRef = useRef<HTMLDivElement>(null);
  const indexRef = useRef<HTMLSpanElement>(null);
  const hintRef = useRef<HTMLParagraphElement>(null);

  useEffect(() => {
    const prevHtmlOverflow = document.documentElement.style.overflow;
    const prevBodyOverflow = document.body.style.overflow;
    document.documentElement.style.overflow = 'hidden';
    document.body.style.overflow = 'hidden';

    return () => {
      document.documentElement.style.overflow = prevHtmlOverflow;
      document.body.style.overflow = prevBodyOverflow;
    };
  }, []);

  useEffect(() => {
    const rootEl = pageRef.current;
    const listEl = listRef.current;
    const trackEl = trackRef.current;
    const lyricsLayer = lyricsRef.current;
    const indexLabel = indexRef.current;

    if (!rootEl || !listEl || !trackEl || !lyricsLayer || !indexLabel) {
      return undefined;
    }

    return initSongsPlayer({
      rootEl,
      listEl,
      trackEl,
      lyricsLayer,
      indexLabel,
      hint: hintRef.current,
    });
  }, []);

  return (
    <div className="songs-page" ref={pageRef}>
      <header className="songs-header">
        <Link to="/" className="songs-header__back">
          ← Home
        </Link>
        <span className="songs-header__label">Filosofía · Cheer</span>
        <span className="songs-header__idx" ref={indexRef}>
          {pad(1)} / {pad(ALBUMS.length)}
        </span>
      </header>

      <div className="songs-watermark" aria-hidden="true">
        ITZY
      </div>

      <div className="songs-list" ref={listRef} role="list" aria-label="Album list">
        <div className="songs-list__track" ref={trackRef} />
      </div>

      <div className="lyrics-layer" ref={lyricsRef} aria-hidden="true" />

      <p className="songs-hint" ref={hintRef}>
        Scroll ↓
      </p>
    </div>
  );
}
