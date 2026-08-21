type Media = {
  type: string;
  src: string | null;
  poster?: string | null;
  width?: number | null;
  height?: number | null;
  filename?: string | null;
};

/** Bunny CDN requires path with extension (uuid.jpg) — SOURCE: prod Nuxt img URLs */
function bunnySrc(src: string | null | undefined, filename?: string | null) {
  if (!src) return null;
  if (!src.includes('stagecrew-media.b-cdn.net/')) return src;
  try {
    const u = new URL(src);
    const base = u.pathname.split('/').pop() || '';
    if (!base.includes('.')) {
      const disk = filename && filename.includes('.') ? filename : `${base}.jpg`;
      u.pathname = `/${disk}`;
    }
    return u.toString();
  } catch {
    return src;
  }
}

export function StagecrewMedia({
  media,
  className = '',
  alt = '',
}: {
  media: Media | null | undefined;
  className?: string;
  alt?: string;
}) {
  if (!media?.src) {
    return <div className={`sc-media sc-media--empty ${className}`} />;
  }

  if (media.type === 'video') {
    return (
      <div className={`sc-media ${className}`}>
        <video
          className="sc-media__el"
          src={media.src}
          poster={media.poster || undefined}
          muted
          loop
          playsInline
          autoPlay
        />
      </div>
    );
  }

  const src = bunnySrc(media.src, media.filename);

  return (
    <div className={`sc-media ${className}`}>
      <img className="sc-media__el" src={src || media.src} alt={alt} loading="lazy" decoding="async" />
    </div>
  );
}
