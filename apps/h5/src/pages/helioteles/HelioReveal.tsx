import { useEffect, useRef, useState, type ReactNode } from 'react';
import { useHelioScrollRef } from './HelioScroll';

type Props = {
  children: ReactNode;
  className?: string;
};

export default function HelioReveal({ children, className }: Props) {
  const ref = useRef<HTMLDivElement>(null);
  const [visible, setVisible] = useState(false);
  const scrollRef = useHelioScrollRef();

  useEffect(() => {
    const el = ref.current;
    if (!el) return;

    if (window.matchMedia('(prefers-reduced-motion: reduce)').matches) {
      setVisible(true);
      return;
    }

    const io = new IntersectionObserver(
      ([entry]) => {
        if (!entry.isIntersecting) return;
        setVisible(true);
        io.unobserve(el);
      },
      { root: scrollRef?.current ?? null, threshold: 0.06, rootMargin: '0px 0px -6% 0px' },
    );

    io.observe(el);
    return () => io.disconnect();
  }, [scrollRef]);

  return (
    <div ref={ref} className={`ht-reveal${visible ? ' is-in' : ''}${className ? ` ${className}` : ''}`}>
      {children}
    </div>
  );
}
