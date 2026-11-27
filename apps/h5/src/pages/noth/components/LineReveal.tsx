import { useEffect, useRef } from 'react';
import gsap from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';

gsap.registerPlugin(ScrollTrigger);

type Props = {
  as?: keyof JSX.IntrinsicElements;
  className?: string;
  lines: string[];
};

/** 行级遮罩揭示（对应原站 [line] + .line-child） */
export function LineReveal({ as: Tag = 'div', className, lines }: Props) {
  const ref = useRef<HTMLElement>(null);

  useEffect(() => {
    const root = ref.current;
    if (!root) return;
    const children = root.querySelectorAll<HTMLElement>('.line-child');
    gsap.set(children, { yPercent: 100 });
    gsap.set(root, { opacity: 1 });

    const st = ScrollTrigger.create({
      trigger: root,
      start: 'top 85%',
      once: true,
      onEnter: () => {
        gsap.to(children, {
          yPercent: 0,
          duration: 0.9,
          ease: 'power3.out',
          stagger: 0.08,
        });
      },
    });

    return () => st.kill();
  }, [lines.join('|')]);

  return (
    <Tag ref={ref as never} className={className} {...{ line: '' }} data-reveal-init="1">
      {lines.map((line) => (
        <div
          key={line}
          className="line-mask-child-mask"
          aria-hidden="true"
          style={{ position: 'relative', display: 'block', textAlign: 'start', overflow: 'clip' }}
        >
          <div
            className="line-child"
            style={{ position: 'relative', display: 'block', textAlign: 'start' }}
          >
            {line}
          </div>
        </div>
      ))}
    </Tag>
  );
}
