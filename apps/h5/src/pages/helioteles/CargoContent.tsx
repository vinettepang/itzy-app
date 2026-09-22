import { createElement, useEffect, useRef, useState, type CSSProperties, type ReactNode } from 'react';
import { Link, useLocation } from 'react-router-dom';
import HelioReveal from './HelioReveal';
import { mediaByHash, resolveHelioPath } from './data';

function samePath(current: string, to: string) {
  const norm = (value: string) => decodeURIComponent(value.replace(/\/+$/, '') || '/');
  return norm(current) === norm(to);
}

function HelioNavLink({
  to,
  className,
  children,
}: {
  to: string;
  className?: string;
  children: ReactNode;
}) {
  const { pathname } = useLocation();
  const active = samePath(pathname, to);
  return (
    <Link to={to} className={`${className || ''}${active ? ' is-active' : ''}`.trim()}>
      {children}
    </Link>
  );
}

function HelioMedia({
  src,
  poster,
  alt,
  isVideo,
  caption,
  linked,
}: {
  src?: string;
  poster?: string | null;
  alt: string;
  isVideo: boolean;
  caption?: string | null;
  linked: boolean;
}) {
  const [loaded, setLoaded] = useState(false);
  const imgRef = useRef<HTMLImageElement>(null);

  useEffect(() => {
    if (!src) {
      setLoaded(true);
      return;
    }
    const node = imgRef.current;
    if (node?.complete && node.naturalWidth > 0) setLoaded(true);
  }, [src]);

  return (
    <figure className={`ht-media${linked ? ' ht-media--linked' : ''}`}>
      {isVideo ? (
        <video
          src={src}
          poster={poster || undefined}
          autoPlay
          muted
          loop
          playsInline
          controls={false}
          className={loaded ? 'is-loaded' : ''}
          onLoadedData={() => setLoaded(true)}
        />
      ) : (
        <img
          ref={imgRef}
          src={src}
          alt={alt}
          className={loaded ? 'is-loaded' : ''}
          onLoad={() => setLoaded(true)}
        />
      )}
      {caption ? <figcaption className="ht-caption">{caption}</figcaption> : null}
    </figure>
  );
}

function attr(el: Element, name: string): string | null {
  return el.getAttribute(name);
}

function childrenOf(el: Element): Element[] {
  return Array.from(el.children);
}

function renderNodes(nodes: NodeListOf<ChildNode> | ChildNode[]): ReactNode[] {
  const out: ReactNode[] = [];
  Array.from(nodes).forEach((node, i) => {
    if (node.nodeType === Node.TEXT_NODE) {
      const text = node.textContent ?? '';
      if (text) out.push(text);
      return;
    }
    if (node.nodeType !== Node.ELEMENT_NODE) return;
    out.push(renderEl(node as Element, i));
  });
  return out;
}

function renderEl(el: Element, key: number): ReactNode {
  const tag = el.tagName.toLowerCase();

  if (tag === 'column-set') {
    const units = childrenOf(el).filter((c) => c.tagName.toLowerCase() === 'column-unit');
    const gutter = attr(el, 'gutter') || '0.5rem';
    const stack = attr(el, 'mobile-stack') !== 'false';
    return (
      <div
        key={key}
        className={`ht-cols${stack ? ' ht-cols--stack' : ''}`}
        style={{ '--ht-gutter': gutter } as CSSProperties}
      >
        {units.map((unit, i) => {
          const span = Number(attr(unit, 'span') || 0) || Math.floor(12 / Math.max(units.length, 1));
          return (
            <div key={i} className="ht-col" style={{ '--ht-span': String(span) } as CSSProperties}>
              {renderNodes(unit.childNodes)}
            </div>
          );
        })}
      </div>
    );
  }

  if (tag === 'gallery-grid') {
    const gutter = attr(el, 'gutter') || '10rem';
    return (
      <div key={key} className="ht-gallery" style={{ gap: gutter }}>
        {renderNodes(el.childNodes)}
      </div>
    );
  }

  if (tag === 'media-item') {
    const hash = attr(el, 'hash') || '';
    const media = mediaByHash(hash);
    const href = resolveHelioPath(attr(el, 'href'), attr(el, 'rel'));
    const caption = el.querySelector('figcaption');
    const fig = (
      <HelioMedia
        src={media?.src}
        poster={media?.poster}
        alt={media?.name || ''}
        isVideo={Boolean(media?.is_video)}
        caption={caption?.textContent}
        linked={attr(el, 'class') === 'linked'}
      />
    );
    if (href && !/^(mailto:|https?:|tel:)/i.test(href)) {
      return (
        <HelioReveal key={key} className="ht-media-link-wrap">
          <HelioNavLink to={href} className="ht-media-link">
            {fig}
          </HelioNavLink>
        </HelioReveal>
      );
    }
    if (href) {
      return (
        <HelioReveal key={key} className="ht-media-link-wrap">
          <a href={href} className="ht-media-link" target="_blank" rel="noreferrer">
            {fig}
          </a>
        </HelioReveal>
      );
    }
    return (
      <HelioReveal key={key}>
        {fig}
      </HelioReveal>
    );
  }

  if (tag === 'br') return <br key={key} />;
  if (tag === 'hr') return <hr key={key} className="ht-rule" />;

  if (tag === 'a') {
    const href = resolveHelioPath(attr(el, 'href'), attr(el, 'rel'));
    const cls = attr(el, 'class') || undefined;
    const kids = renderNodes(el.childNodes);
    if (href && !/^(mailto:|https?:|tel:)/i.test(href)) {
      return (
        <HelioNavLink key={key} to={href} className={cls}>
          {kids}
        </HelioNavLink>
      );
    }
    return (
      <a
        key={key}
        className={cls}
        href={href || attr(el, 'href') || '#'}
        target={attr(el, 'target') || undefined}
        rel={attr(el, 'rel') || undefined}
      >
        {kids}
      </a>
    );
  }

  if (['h1', 'h2', 'h3', 'p', 'div', 'span', 'strong', 'em', 'b', 'i'].includes(tag)) {
    const styleAttr = attr(el, 'style');
    const style: CSSProperties | undefined = styleAttr
      ? Object.fromEntries(
          styleAttr.split(';').filter(Boolean).map((pair) => {
            const [k, ...rest] = pair.split(':');
            const keyName = k.trim().replace(/-([a-z])/g, (_, c: string) => c.toUpperCase());
            return [keyName, rest.join(':').trim()];
          }),
        )
      : undefined;
    return createElement(tag, { key, className: attr(el, 'class'), style }, renderNodes(el.childNodes));
  }

  return (
    <div key={key} className={attr(el, 'class') || undefined}>
      {renderNodes(el.childNodes)}
    </div>
  );
}

export default function CargoContent({ html }: { html: string }) {
  const doc = new DOMParser().parseFromString(`<div class="ht-cargo-root">${html}</div>`, 'text/html');
  const root = doc.body.firstElementChild;
  if (!root) return null;
  return <div className="ht-cargo">{renderNodes(root.childNodes)}</div>;
}
