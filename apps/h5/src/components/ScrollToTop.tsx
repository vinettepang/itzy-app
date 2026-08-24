import { useEffect } from 'react';
import { useLocation } from 'react-router-dom';

/** 路由切换时将窗口滚动重置到顶部 */
export default function ScrollToTop() {
  const { pathname, search, hash } = useLocation();

  useEffect(() => {
    if ('scrollRestoration' in history) {
      history.scrollRestoration = 'manual';
    }

    // 带 hash 的锚点跳转留给浏览器处理
    if (hash) return;

    window.scrollTo(0, 0);
    document.documentElement.scrollTop = 0;
    document.body.scrollTop = 0;
  }, [pathname, search, hash]);

  return null;
}
