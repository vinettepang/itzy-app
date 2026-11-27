import { useRef } from 'react';
import { Link } from 'react-router-dom';
import { FP_BASE, decodePhotoSrc, felixContent } from './data';
import { HERO_LINES, useHomepageMotion } from './useHomepageMotion';

export default function FelixHomePage() {
  const photos = felixContent.homepagePhotos;
  const photosRef = useRef<HTMLAnchorElement>(null);
  const descriptionRef = useRef<HTMLHeadingElement>(null);
  useHomepageMotion(photosRef, descriptionRef, photos.length);

  return (
    <>
      <main className="homepage grid container svelte-c5vyf9">
        <Link
          ref={photosRef}
          className="photos svelte-c5vyf9"
          to={`${FP_BASE}/series`}
          title="View series"
          aria-label="View series"
        >
          {photos.map((photo, i) => (
            <picture
              key={photo.src}
              className={`photo svelte-yfq5s3 is-loaded${i === 0 ? ' is-active is-priority' : ''}`}
            >
              <img
                src={decodePhotoSrc(photo.src)}
                alt={photo.alt}
                loading={i === 0 ? 'eager' : 'lazy'}
                decoding="async"
                fetchPriority={i === 0 ? 'high' : undefined}
              />
            </picture>
          ))}
        </Link>
        <h1 ref={descriptionRef} className="description title-big svelte-c5vyf9">
          <span className="fp-sr-only">{felixContent.heroText}</span>
          {HERO_LINES.map((line, i) => (
            <span key={i} style={{ overflow: 'clip', display: 'block' }}>
              <span className="line" data-line={i} aria-hidden="true" style={{ display: 'block' }}>
                {line}
              </span>
            </span>
          ))}
        </h1>
      </main>
    </>
  );
}
