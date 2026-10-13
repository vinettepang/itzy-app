import { useEffect } from 'react';
import './traumclub.css';

/** 离线镜像入口：跳转到 public/traumclub/index.html */
export default function TraumclubPage() {
  useEffect(() => {
    const base = import.meta.env.BASE_URL || '/';
    const root = base.endsWith('/') ? base : `${base}/`;
    const target = `${root}traumclub/index.html`;
    if (!window.location.pathname.endsWith('/traumclub/index.html')) {
      window.location.replace(target);
    }
  }, []);

  useEffect(() => {
    const prev = document.title;
    document.title = 'Traum Club';
    return () => {
      document.title = prev;
    };
  }, []);

  return (
    <div className="traumclub-shell traumclub-shell--redirect">
      <p>Opening Traum Club…</p>
    </div>
  );
}
