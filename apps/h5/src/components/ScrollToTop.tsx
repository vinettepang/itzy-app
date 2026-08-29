import { useEffect } from 'react';
import { useLocation } from 'react-router-dom';

/**
 * 需要清理的滚动锁标记。
 * 站内多个页面（songs / dolls / unseen-studio / wakawaka / facil / virgil / new-home 的 Lenis）
 * 会在 <html> / <body> 上加 class 或行内样式锁定滚动，若卸载时未清干净，
 * 跳转到其它页面会残留 `overflow: hidden`，导致页面无法下滑。
 */
const HTML_LOCK_CLASSES = [
  'lenis',
  'lenis-smooth',
  'lenis-stopped',
  'facil-scroll-active',
  'virgil-page',
  'virgil-inverted',
];

const BODY_LOCK_CLASSES = [
  '__noScroll',
  'facil-body',
  '__scroll-manual',
  '__cursor',
  'palette-primary',
];

function clearScrollLocks() {
  const html = document.documentElement;
  const body = document.body;

  html.classList.remove(...HTML_LOCK_CLASSES);
  body.classList.remove(...BODY_LOCK_CLASSES);

  html.style.overflow = '';
  body.style.overflow = '';
  body.style.position = '';
  body.style.height = '';
  body.style.top = '';
  body.style.width = '';
  body.style.overscrollBehavior = '';
  body.style.touchAction = '';
}

/** 路由切换时：解除上一页残留的滚动锁，并把窗口滚动重置到顶部 */
export default function ScrollToTop() {
  const { pathname, search, hash } = useLocation();

  useEffect(() => {
    if ('scrollRestoration' in history) {
      history.scrollRestoration = 'manual';
    }

    // 先解锁，再重置滚动位置，否则 scrollTo 会被 overflow: hidden 吞掉
    clearScrollLocks();

    // 带 hash 的锚点跳转留给浏览器处理
    if (hash) return;

    window.scrollTo(0, 0);
    document.documentElement.scrollTop = 0;
    document.body.scrollTop = 0;
  }, [pathname, search, hash]);

  return null;
}
