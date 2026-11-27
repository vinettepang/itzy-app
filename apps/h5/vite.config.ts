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

/** public/haoqi 涓?React 璺敱 /haoqi 鍐茬獊鏃讹紝灏嗛〉闈㈣姹傚洖閫€鍒?SPA */
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

const FLUORO_STATIC_PREFIXES = ['/fluoro/assets/', '/fluoro/fonts/', '/fluoro/raw/'];

function isFluoroStaticAsset(url: string) {
  const pathname = url.split('?')[0] ?? '';
  return FLUORO_STATIC_PREFIXES.some((p) => pathname.startsWith(p));
}

function applyFluoroSpaFallback(url: string) {
  const pathname = url.split('?')[0] ?? '';
  if (pathname === '/fluoro' || pathname === '/fluoro/') return '/index.html';
  if (pathname.startsWith('/fluoro/') && !isFluoroStaticAsset(url)) return '/index.html';
  return null;
}

/** public/fluoro 涓?React 璺敱 /fluoro 鍐茬獊鏃讹紝灏嗛〉闈㈣姹傚洖閫€鍒?SPA锛堥潤鎬佽祫婧愪粛鐩村嚭锛?*/
function fluoroSpaFallback(): import('vite').Plugin {
  const middleware = (req: Connect.IncomingMessage, _res: unknown, next: () => void) => {
    const url = req.url ?? '';
    const fallback = applyFluoroSpaFallback(url);
    if (fallback) req.url = fallback;
    next();
  };
  return {
    name: 'fluoro-spa-fallback',
    configureServer(server) {
      server.middlewares.use(middleware);
    },
    configurePreviewServer(server) {
      server.middlewares.use(middleware);
    },
  };
}

const FLUSTUDIO_STATIC_PREFIXES = ['/flustudio/breathe/', '/flustudio/fonts/'];

function isFlustudioStaticAsset(url: string) {
  const pathname = url.split('?')[0] ?? '';
  return FLUSTUDIO_STATIC_PREFIXES.some((p) => pathname.startsWith(p));
}

function applyFlustudioSpaFallback(url: string) {
  const pathname = url.split('?')[0] ?? '';
  if (pathname === '/flustudio' || pathname === '/flustudio/') return '/index.html';
  if (pathname.startsWith('/flustudio/') && !isFlustudioStaticAsset(url)) return '/index.html';
  return null;
}

/** public/flustudio 涓?React 璺敱 /flustudio 鍐茬獊鏃讹紝灏嗛〉闈㈣姹傚洖閫€鍒?SPA锛坆reathe 搴忓垪甯т粛鐩村嚭锛?*/
function flustudioSpaFallback(): import('vite').Plugin {
  const middleware = (req: Connect.IncomingMessage, _res: unknown, next: () => void) => {
    const url = req.url ?? '';
    const fallback = applyFlustudioSpaFallback(url);
    if (fallback) req.url = fallback;
    next();
  };
  return {
    name: 'flustudio-spa-fallback',
    configureServer(server) {
      server.middlewares.use(middleware);
    },
    configurePreviewServer(server) {
      server.middlewares.use(middleware);
    },
  };
}

const HELIOTELES_STATIC_PREFIXES = ['/helioteles/fonts/', '/helioteles/raw/', '/helioteles/media/'];

function isHeliotelesStaticAsset(url: string) {
  const pathname = url.split('?')[0] ?? '';
  return HELIOTELES_STATIC_PREFIXES.some((p) => pathname.startsWith(p));
}

function applyHeliotelesSpaFallback(url: string) {
  const pathname = url.split('?')[0] ?? '';
  if (pathname === '/helioteles' || pathname === '/helioteles/') return '/index.html';
  if (pathname.startsWith('/helioteles/') && !isHeliotelesStaticAsset(url)) return '/index.html';
  if (pathname === '/pv/variety' || pathname === '/pv/variety/') return '/index.html';
  if (pathname.startsWith('/pv/variety/')) return '/index.html';
  return null;
}

/** public/helioteles 涓?React 璺敱 /helioteles 鍐茬獊鏃讹紝灏嗛〉闈㈣姹傚洖閫€鍒?SPA锛堝瓧浣?鍘熷HTML/濯掍綋浠嶇洿鍑猴級 */
function heliotelesSpaFallback(): import('vite').Plugin {
  const middleware = (req: Connect.IncomingMessage, _res: unknown, next: () => void) => {
    const url = req.url ?? '';
    const fallback = applyHeliotelesSpaFallback(url);
    if (fallback) req.url = fallback;
    next();
  };
  return {
    name: 'helioteles-spa-fallback',
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
    fluoroSpaFallback(),
    flustudioSpaFallback(),
    heliotelesSpaFallback(),
    VitePWA({
      // 鑷姩娉ㄥ唽 SW锛涙柊鐗堟湰鍚庡彴闈欓粯婵€娲伙紝鏃犻渶鐢ㄦ埛鎵嬪姩鍒锋柊
      registerType: 'autoUpdate',
      // 鐢辨彃浠惰嚜鍔ㄦ敞鍏ユ敞鍐岃剼鏈埌 index.html
      injectRegister: 'auto',
      // GitHub Pages 瀛愯矾寰勯儴缃诧紱鏈湴寮€鍙?base 涓?'/'
      base: process.env.PAGES_BASE || '/',
      manifest: {
        name: 'ITZY App',
        short_name: 'ITZY',
        description: 'ITZY 绮変笣搴旀彺 App 路 姝屽崟 / 姝岃瘝 / 搴旀彺娉?,
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
        // 棰勭紦瀛樻瀯寤轰骇鐗╋紙鑴氭湰/鏍峰紡/椤甸潰澹?SVG锛夆€斺€旀瓕璇嶆暟鎹凡鎵撹繘 js 鍖咃紝涓€骞剁紦瀛樸€?        // 鍙紦瀛樻枃鏈?UI 鎵€闇€璧勬簮锛坖s/css/html/svg锛夛紝涓嶇紦瀛?png/jpg/webp/mp4 绛夊ぇ濯掍綋锛?        // 閬垮厤棣栨璁块棶涓嬭浇鏁板崄 MB锛涙瓕鍗?姝岃瘝椤靛潎涓烘枃鏈?CSS锛岀绾垮畬鍏ㄥ彲鐢ㄣ€?        globPatterns: ['**/*.{js,css,html,svg}'],
        // SPA 绂荤嚎瀵艰埅鍥為€€锛氭柇缃戞椂浠绘剰璺緞閮借繑鍥炵紦瀛樼殑棣栭〉澹冲啀鐢卞墠绔矾鐢辨覆鏌?        navigateFallback: `${process.env.PAGES_BASE || '/'}index.html`,
        // 杩欎簺鐪熷疄闈欐€佽祫婧?浠ｇ悊璺緞涓嶈璧?SPA 鍥為€€
        navigateFallbackDenylist: [
          /^\/haoqi-static\//,
          /^\/unseen-proxy\//,
          /^\/traumclub\//,
          /^\/thefutureinblack\//,
        ],
        cleanupOutdatedCaches: true,
        clientsClaim: true,
        skipWaiting: true,
      },
      // 寮€鍙戠幆澧冧笉鍚敤 SW锛岄伩鍏嶅共鎵?HMR
      devOptions: {
        enabled: false,
      },
    }),
  ],
  // GitHub Pages 椤圭洰绔欑偣閮ㄧ讲鍦?/itzy-app/ 瀛愯矾寰勪笅锛涙湰鍦板紑鍙戜笉璁剧疆鏃堕粯璁?'/'
  base: process.env.PAGES_BASE || '/',
  resolve: {
    alias: { '@': path.resolve(__dirname, 'src') },
  },
  server: {
    port: 3002,
    host: true,
    proxy: {
      // World / project media 鈫?production CDN without browser CORS (WebGL textures)
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
