import { useEffect, useRef, useState } from 'react';
import { tfibAsset } from './assets';
import { tfibInitBlockAnimations, tfibTeardownBlockAnimations } from './tfibInitBlockAnimations';
import { tfibLoadSquarespaceCore } from './tfibLoadSquarespaceCore';
import { tfibReinitTailEffects } from './tfibReinitTailEffects';
import { tfibRunEmbeddedScripts } from './tfibRunEmbeddedScripts';
import './thefutureinblack.css';

type TfibSnapshotId = 'home' | 'forms' | 'index';

type Manifest = {
  bodyClass: string;
  stylesheets: string[];
  headInlineStyles: string[];
  hasStaticContext: boolean;
};

function absolutize(href: string) {
  if (href.startsWith('http') || href.startsWith('//')) return href;
  if (href.startsWith('/')) return href;
  return href;
}

function loadStylesheet(href: string) {
  const key = `tfib-css:${href}`;
  if (document.querySelector(`link[data-tfib="${key}"]`)) return;
  const link = document.createElement('link');
  link.rel = 'stylesheet';
  link.href = absolutize(href);
  link.dataset.tfib = key;
  document.head.appendChild(link);
}

function loadScriptFromSrc(src: string, defer = false) {
  return new Promise<void>((resolve, reject) => {
    const key = `tfib-js:${src}`;
    const existing = document.querySelector(`script[data-tfib="${key}"]`);
    if (existing) {
      resolve();
      return;
    }
    const el = document.createElement('script');
    el.src = absolutize(src);
    el.dataset.tfib = key;
    if (defer) el.defer = true;
    el.onload = () => resolve();
    el.onerror = () => reject(new Error(`script ${src}`));
    document.body.appendChild(el);
  });
}

async function runTailScripts(container: HTMLElement) {
  const tpl = document.createElement('template');
  tpl.innerHTML = container.innerHTML;
  const nodes = [...tpl.content.childNodes];
  for (const node of nodes) {
    if (node.nodeName === 'SCRIPT') {
      const s = node as HTMLScriptElement;
      const el = document.createElement('script');
      if (s.src) {
        el.src = absolutize(s.getAttribute('src') || '');
        el.defer = s.defer;
        await new Promise<void>((resolve, reject) => {
          el.onload = () => resolve();
          el.onerror = () => reject(new Error(el.src));
          document.body.appendChild(el);
        });
      } else {
        el.textContent = s.textContent;
        document.body.appendChild(el);
      }
    } else if (node.nodeName === 'LINK') {
      const l = node as HTMLLinkElement;
      if (l.rel === 'stylesheet' && l.href) loadStylesheet(l.getAttribute('href') || l.href);
    }
  }
}

/**
 * React 宿主：挂载与 Squarespace 镜像一致的 DOM / 样式 / 脚本，实现与线上一致的版式与交互。
 */
export default function TfibSiteHost({ snapshot }: { snapshot: TfibSnapshotId }) {
  const shellRef = useRef<HTMLDivElement>(null);
  const [error, setError] = useState<string | null>(null);
  const [manifest, setManifest] = useState<Manifest | null>(null);

  useEffect(() => {
    const snapBase = tfibAsset(`snapshots/${snapshot}/`);
    let cancelled = false;

    const prevHtmlClass = document.documentElement.className;
    const prevBodyClass = document.body.className;
    const prevOverflow = document.body.style.overflow;

    (async () => {
      try {
        const man: Manifest = await fetch(`${snapBase}manifest.json`).then((r) => {
          if (!r.ok) throw new Error('Run pnpm run build:tfib-snapshot');
          return r.json();
        });
        if (cancelled) return;
        setManifest(man);

        document.documentElement.classList.add('tfib-html', 'sqs-seven-one');
        document.body.classList.add('tfib-body', 'tfib-body--host', ...man.bodyClass.split(/\s+/).filter(Boolean));
        document.body.style.overflow = 'auto';

        for (const block of man.headInlineStyles) {
          const style = document.createElement('style');
          style.dataset.tfib = `inline:${snapshot}:${man.headInlineStyles.indexOf(block)}`;
          style.textContent = block;
          document.head.appendChild(style);
        }
        for (const href of man.stylesheets) {
          loadStylesheet(href);
        }

        if (man.hasStaticContext) {
          const ctx = await fetch(`${snapBase}static-context.js`).then((r) => r.text());
          const el = document.createElement('script');
          el.dataset.tfib = `static-context:${snapshot}`;
          el.textContent = ctx;
          document.head.appendChild(el);
        }

        const inner = await fetch(`${snapBase}site-inner.html`).then((r) => r.text());
        const tail = await fetch(`${snapBase}tail.html`).then((r) => r.text());
        if (cancelled || !shellRef.current) return;

        const wrapper = shellRef.current.querySelector('#siteWrapper');
        if (wrapper) {
          wrapper.innerHTML = inner;
          await tfibRunEmbeddedScripts(wrapper);
        }

        await tfibLoadSquarespaceCore();

        const tailHost = document.createElement('div');
        tailHost.style.display = 'none';
        tailHost.innerHTML = tail;
        document.body.appendChild(tailHost);
        await runTailScripts(tailHost);
        tailHost.remove();

        if (wrapper) {
          await tfibInitBlockAnimations(wrapper);
        }
        tfibReinitTailEffects();

        document.dispatchEvent(new Event('DOMContentLoaded'));
        window.dispatchEvent(new Event('load'));
        tfibReinitTailEffects();
      } catch (e) {
        if (!cancelled) setError(e instanceof Error ? e.message : String(e));
      }
    })();

    return () => {
      cancelled = true;
      tfibTeardownBlockAnimations();
      document.documentElement.className = prevHtmlClass;
      document.body.className = prevBodyClass;
      document.body.style.overflow = prevOverflow;
      document.querySelectorAll('[data-tfib]').forEach((n) => n.remove());
    };
  }, [snapshot]);

  if (error) {
    return (
      <div className="tfib-host-error">
        <p>Failed to load The Future in Black snapshot.</p>
        <p><code>{error}</code></p>
        <p>Run <code>pnpm run build:tfib-snapshot</code> in apps/h5.</p>
      </div>
    );
  }

  return (
    <div ref={shellRef} id="tfib-squarespace-root">
      <div id="siteWrapper" className="clearfix site-wrapper" />
    </div>
  );
}
