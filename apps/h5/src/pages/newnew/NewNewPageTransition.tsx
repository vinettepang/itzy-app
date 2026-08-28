import { useRef, type ReactNode } from 'react';
import { useLocation, useOutlet } from 'react-router-dom';
import { AnimatePresence, motion, type Variants } from 'framer-motion';

function isSetlist(path: string) {
  return path === '/setlist';
}

function isCheer(path: string) {
  return path.startsWith('/cheer');
}

/** 1 = 前进（右→左推入），-1 = 返回（左→右推入），0 = 其他无滑动 */
function getSlideDirection(from: string, to: string): number {
  if (from === to) return 0;
  if (isSetlist(from) && isCheer(to)) return 1;
  if (isCheer(from) && isSetlist(to)) return -1;
  if (isCheer(from) && isCheer(to)) return 1;
  return 0;
}

const slideVariants: Variants = {
  enter: (dir: number) =>
    dir === 0
      ? { x: 0, opacity: 0 }
      : {
          x: dir > 0 ? '100%' : '-100%',
          opacity: 1,
          position: 'relative',
        },
  center: {
    x: 0,
    opacity: 1,
    position: 'relative',
    transition: { type: 'tween', ease: [0.32, 0.72, 0, 1], duration: 0.38 },
  },
  exit: (dir: number) =>
    dir === 0
      ? {
          x: 0,
          opacity: 0,
          transition: { duration: 0.22 },
        }
      : {
          x: dir > 0 ? '-28%' : '100%',
          opacity: 1,
          position: 'absolute',
          top: 0,
          left: 0,
          width: '100%',
          transition: { type: 'tween', ease: [0.32, 0.72, 0, 1], duration: 0.38 },
        },
};

function TransitionPage({
  direction,
  children,
}: {
  direction: number;
  children: ReactNode;
}) {
  const pageRef = useRef<HTMLDivElement>(null);

  return (
    <motion.div
      ref={pageRef}
      className="newnew-page-transition__page"
      custom={direction}
      variants={slideVariants}
      initial="enter"
      animate="center"
      exit="exit"
      onAnimationStart={() => {
        // 开场/退场需要 transform；页内 fixed 随父级一起动
        pageRef.current?.removeAttribute('data-settled');
      }}
      onAnimationComplete={(definition) => {
        // 静止后清掉 transform 含块，页内 fixed 重新贴视口
        if (definition === 'center') {
          pageRef.current?.setAttribute('data-settled', '');
        }
      }}
    >
      {children}
    </motion.div>
  );
}

/** setlist ↔ cheer 左右推入；其它二级页淡入淡出 */
export default function NewNewPageTransition() {
  const location = useLocation();
  const outlet = useOutlet();
  const prevPathRef = useRef(location.pathname);
  const directionRef = useRef(0);

  if (prevPathRef.current !== location.pathname) {
    directionRef.current = getSlideDirection(
      prevPathRef.current,
      location.pathname,
    );
    prevPathRef.current = location.pathname;
  }

  const direction = directionRef.current;

  return (
    <div className="newnew-page-transition">
      <AnimatePresence mode="sync" custom={direction} initial={false}>
        <TransitionPage key={location.pathname} direction={direction}>
          {outlet}
        </TransitionPage>
      </AnimatePresence>
    </div>
  );
}
