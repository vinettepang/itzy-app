import { useEffect, useRef } from 'react';
import gsap from 'gsap';

/** 首页全屏渐变（与镜像 3.Bj10hmur.css 一致，不依赖 Svelte 内联样式） */
export default function FelixHomeGradient() {
  const ref = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const el = ref.current;
    if (!el) return;

    gsap.set(el, { opacity: 0, scaleY: 0.5, transformOrigin: '50% 0%' });
    const tl = gsap.timeline({ defaults: { ease: 'power4.out' } });
    tl.to(el, { opacity: 1, scaleY: 1, duration: 2 }, 0);
    return () => {
      tl.kill();
      gsap.killTweensOf(el);
    };
  }, []);

  return <div ref={ref} className="fp-home-gradient background svelte-c5vyf9" aria-hidden />;
}
