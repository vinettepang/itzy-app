import { useEffect, useMemo, useRef, useState } from 'react';
import { Link } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { request } from '@/services/request';
import './Home.css';


export default function GalleryHome() {
    const [isLoading, setIsLoading] = useState(true);

    // 模拟加载过程
    useEffect(() => {
      const timer = setTimeout(() => {
        setIsLoading(false);
      }, 2500); // 2.5秒后进入主页
      return () => clearTimeout(timer);
    }, []);

  return (
    <div className="container">
      <AnimatePresence mode="wait">
        {isLoading ? (
          /* 图二：加载界面 */
          <motion.div
            key="loader"
            className="loader-wrapper"
            exit={{ opacity: 0 }}
            transition={{ duration: 0.8 }}
          >
            <div className="loader-content">
              <h1 className="main-logo">
                Oh <span className="jumping-text">IRA</span>.DESIGN
              </h1>
              <p className="sub-tags">
                art direction . identity . logo . web design . package . set design
              </p>
            </div>
          </motion.div>
        ) : (
          /* 图一：主内容界面 */
          <motion.div
            key="content"
            className="main-content"
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 1 }}
          >
            {/* 导航栏 */}
            <header className="header">
              <div className="mini-logo">Oh IRA</div>
              <nav className="nav-links">
                <span>ENG</span> <span>RUS</span> <span>MENU</span>
              </nav>
            </header>

            {/* 英雄区布局 */}
            <main className="hero">
              <div className="image-grid">
                <div className="laptop-box">
                  <img src="/laptop-mockup.jpg" alt="Work" className="full-img" />
                  <div className="text-overlay">
                    <h2>FREELANCE ART DIRECTOR & VISUAL DESIGNER</h2>
                    <ul className="service-list">
                      <li>LOGO</li>
                      <li>BRANDING</li>
                      <li>PACKAGE</li>
                      <li>LANDINGS</li>
                      <li>PROMO PAGES</li>
                      <li>E-COMMERCE</li>
                    </ul>
                  </div>
                </div>
                <div className="floating-img-box">
                  <img src="/angel-girl.jpg" alt="Art" className="floating-img" />
                </div>
              </div>
              
              <div className="footer-logo">
                .DESIGN
              </div>
            </main>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}

