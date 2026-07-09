import './vite-node-polyfills';
import path from 'node:path';
import type { Connect } from 'vite';
import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';

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
  plugins: [react(), haoqiSpaFallback()],
  resolve: {
    alias: { '@': path.resolve(__dirname, 'src') },
  },
  server: { port: 3002, host: true },
});
