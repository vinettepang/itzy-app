import { useEffect } from 'react';
import { motion, useScroll, useTransform } from 'framer-motion';
import heroImg from '@/assets/hero.png';
import ticketBg from '@/assets/ticket-bg.png';
import emptyHk from '@/assets/empty-hk.png';
import reactLogo from '@/assets/react.svg';
import Lenis from 'lenis'; // 导入平滑滚动库

const images = [
  { src: heroImg, label: 'PYREX_23', x: '10%', y: 100, speed: 0.5 },
  { src: ticketBg, label: 'OFF-WHITE™', x: '60%', y: 400, speed: 1.5 },
  { src: emptyHk, label: 'LOUIS_VUITTON', x: '25%', y: 800, speed: 0.2 },
  { src: reactLogo, label: 'FIGURE_01', x: '55%', y: 1200, speed: 2.0 },
  { src: reactLogo, label: 'ARCHIVE_2016', x: '15%', y: 1600, speed: 0.8 },
];

const VirgilItem = ({ item }: { item: (typeof images)[number] }) => {
  const { scrollYProgress } = useScroll();
  
  // 核心：基于 speed 计算位移。speed > 1 追赶滚动，speed < 1 滞后滚动
  const yTranslate = useTransform(scrollYProgress, [0, 1], [0, 500 * item.speed]);
  const rotate = (item.speed * 10) - 5; // 根据速度给一个固定的随机旋转

  return (
    <motion.div 
      className="v-item"
      style={{ 
        left: item.x, 
        top: item.y,
        y: yTranslate,
        rotate: rotate
      }}
    >
      <div className="v-frame">
        <img src={item.src} alt={item.label} />
        <div className="v-caption">“ {item.label} ”</div>
      </div>
    </motion.div>
  );
};

export default function VirgilCanvas() {
  useEffect(() => {
    // 初始化平滑滚动
    const lenis = new Lenis({
      duration: 1.2,
      easing: (t) => Math.min(1, 1.001 - Math.pow(2, -10 * t)),
    });

    function raf(time: number) {
      lenis.raf(time);
      requestAnimationFrame(raf);
    }
    requestAnimationFrame(raf);
  }, []);

  return (
    <div className="v-container">
      <div className="v-grid-overlay" /> {/* 复现背景细线网格 */}
      <nav className="v-nav">FREE_GAME™</nav>
      
      <main className="v-canvas">
        {images.map((img, i) => (
          <VirgilItem key={i} item={img} />
        ))}
      </main>
      
      <div className="v-footer">© 2026 ARCHIVE</div>
    </div>
  );
}