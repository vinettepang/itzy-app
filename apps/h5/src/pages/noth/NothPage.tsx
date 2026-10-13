import { useEffect } from 'react';
import { useSearchParams } from 'react-router-dom';
import './noth.css';

/**
 * 本地 Webflow 快照：`public/noth/index.html`（非 iframe，整页跳转以执行原站脚本）。
 * 更新快照：`pnpm run mirror:noth:full`（Playwright 多页 + 离线资源）。
 */
export default function NothPage() {
  const [params] = useSearchParams();
  const stayInSpa = params.get('spa') === '1';

  useEffect(() => {
    if (stayInSpa) return;
    const base = import.meta.env.BASE_URL || '/';
    const root = base.endsWith('/') ? base : `${base}/`;
    const target = `${root}noth/index.html`;
    if (window.location.pathname.endsWith('/noth/index.html')) return;
    window.location.replace(target);
  }, [stayInSpa]);

  if (stayInSpa) {
    return (
      <div className="noth-shell noth-shell--hint">
        <p>
          本地镜像请打开{' '}
          <a href={`${import.meta.env.BASE_URL || '/'}noth/index.html`}>noth/index.html</a>
          （默认从 <code>/noth</code> 会自动跳转）。
        </p>
      </div>
    );
  }

  return (
    <div className="noth-shell noth-shell--redirect" aria-live="polite">
      <p>Opening Nothin&apos;…</p>
    </div>
  );
}
