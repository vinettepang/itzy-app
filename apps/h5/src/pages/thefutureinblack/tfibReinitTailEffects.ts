/** 尾部脚本在 React 注入 DOM 之后需手动再跑一遍（如 Nine Practices 轮播）。 */
export function tfibReinitTailEffects() {
  const w = window as Window & { Swiper?: unknown };
  if (typeof w.Swiper === 'undefined') return;

  const script = document.createElement('script');
  script.dataset.tfib = 'tfib-reinit-cflow';
  script.textContent = `
    (function(){
      if (typeof initCflowCarousels === 'function') {
        initCflowCarousels();
        setTimeout(initCflowCarousels, 200);
      }
    })();
  `;
  document.body.appendChild(script);
  script.remove();
}
