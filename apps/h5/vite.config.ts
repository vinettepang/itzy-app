import './vite-node-polyfills';
import path from 'node:path';
import type { Connect } from 'vite';
import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';
import { VitePWA } from 'vite-plugin-pwa';

const HAOQI_ASSET_PREFIXES = [
  '/haoqi-static/fonts/',
  '/haoqi-static/model/',
  '/haoqi-static/work/',
  '/haoqi-static/sticker_img/',
];

function isHaoqiStaticAsset(url: string) {
  const pathname = url.split('?')[0] ?? '';
  return pathname === '/haoqi-static/icon.svg' || HAOQI_ASSET_PREFIXES.some((p) => pathname.startsWith(p));
}

const HAOQI_PROJECT_SLUGS = new Set([
  'reunimos',
  'inspire_mono',
  'wasm_design_utils',
  'adrive',
  'shore_icon',
  'teambition',
]);

function applyHaoqiSpaFallback(url: string) {
  const pathname = url.split('?')[0] ?? '';
  if (pathname === '/haoqi' || url.startsWith('/haoqi?')) return '/index.html';
  if (pathname.startsWith('/haoqi/') && !isHaoqiStaticAsset(url)) return '/index.html';
  const slug = pathname.slice(1);
  if (HAOQI_PROJECT_SLUGS.has(slug)) return '/index.html';
  return null;
}

/** public/haoqi 与 React 路由 /haoqi 冲突时，将页面请求回退到 SPA */
function haoqiSpaFallback(): import('vite').Plugin {
  const middleware = (req: Connect.IncomingMessage, _res: unknown, next: () => void) => {
    const url = req.url ?? '';
    const fallback = applyHaoqiSpaFallback(url);
    if (fallback) req.url = fallback;
    next();
  };
  return {
    name: 'haoqi-spa-fallback',
    configureServer(server) {
      server.middlewares.use(middleware);
    },
    configurePreviewServer(server) {
      server.middlewares.use(middleware);
    },
  };
}

// https://vite.dev/config/
export default defineConfig({
  plugins: [
    react(),
    haoqiSpaFallback(),
    VitePWA({
      // 自动注册 SW；新版本后台静默激活，无需用户手动刷新
      registerType: 'autoUpdate',
      // 由插件自动注入注册脚本到 index.html
      injectRegister: 'auto',
      // GitHub Pages 子路径部署；本地开发 base 为 '/'
      base: process.env.PAGES_BASE || '/',
      manifest: {
        name: 'ITZY App',
        short_name: 'ITZY',
        description: 'ITZY 粉丝应援 App · 歌单 / 歌词 / 应援法',
        theme_color: '#0e0e0e',
        background_color: '#0e0e0e',
        display: 'standalone',
        start_url: process.env.PAGES_BASE || '/',
        scope: process.env.PAGES_BASE || '/',
        icons: [
          {
            src: 'favicon.svg',
            sizes: 'any',
            type: 'image/svg+xml',
            purpose: 'any',
          },
        ],
      },
      workbox: {
        // 预缓存构建产物（脚本/样式/页面壳/SVG）——歌词数据已打进 js 包，一并缓存。
        // 只缓存文本/UI 所需资源（js/css/html/svg），不缓存 png/jpg/webp/mp4 等大媒体，
        // 避免首次访问下载数十 MB；歌单/歌词页均为文本+CSS，离线完全可用。
        globPatterns: ['**/*.{js,css,html,svg}'],
        // SPA 离线导航回退：断网时任意路径都返回缓存的首页壳再由前端路由渲染
        navigateFallback: `${process.env.PAGES_BASE || '/'}index.html`,
        // 这些真实静态资源/代理路径不要走 SPA 回退
        navigateFallbackDenylist: [/^\/haoqi-static\//, /^\/unseen-proxy\//],
        cleanupOutdatedCaches: true,
        clientsClaim: true,
        skipWaiting: true,
      },
      // 开发环境不启用 SW，避免干扰 HMR
      devOptions: {
        enabled: false,
      },
    }),
  ],
  // GitHub Pages 项目站点部署在 /itzy-app/ 子路径下；本地开发不设置时默认 '/'
  base: process.env.PAGES_BASE || '/',
  resolve: {
    alias: { '@': path.resolve(__dirname, 'src') },
  },
  server: {
    port: 3002,
    host: true,
    proxy: {
      // World / project media → production CDN without browser CORS (WebGL textures)
      '/unseen-proxy': {
        target: 'https://unseen.co',
        changeOrigin: true,
        secure: true,
        rewrite: (p) => p.replace(/^\/unseen-proxy/, ''),
        headers: {
          // Avoid some CDN hotlink edge cases while proxying
          Referer: 'https://unseen.co/',
          'User-Agent':
            'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36',
        },
      },
    },
  },
});
