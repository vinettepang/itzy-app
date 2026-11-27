import './vite-node-polyfills';
import fs from 'node:fs';
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

/** public/fluoro 与 React 路由 /fluoro 冲突时，将页面请求回退到 SPA（静态资源仍直出） */
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

/** public/flustudio 与 React 路由 /flustudio 冲突时，将页面请求回退到 SPA（breathe 序列帧仍直出） */
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

/** React 站：仅保留字体与图标等静态资源；页面走主 SPA */
const FELIXPEAULT_STATIC_PREFIXES = [
  '/felixpeault/_app/',
  '/felixpeault/fonts/',
  '/felixpeault/favicon',
  '/felixpeault/icon.svg',
  '/felixpeault/apple-touch-icon',
  '/felixpeault/manifest.webmanifest',
  '/felixpeault/humans.txt',
];

function isFelixpeaultStaticAsset(url: string) {
  const pathname = url.split('?')[0] ?? '';
  return (
    pathname.endsWith('.ico') ||
    pathname.endsWith('.png') ||
    pathname.endsWith('.woff2') ||
    FELIXPEAULT_STATIC_PREFIXES.some((p) => pathname.startsWith(p))
  );
}

function applyFelixpeaultSpaFallback(url: string) {
  const pathname = url.split('?')[0] ?? '';
  if (pathname === '/felixpeault' || pathname === '/felixpeault/') return '/index.html';
  if (pathname.startsWith('/felixpeault/') && !isFelixpeaultStaticAsset(url)) {
    return '/index.html';
  }
  return null;
}

const FELIXPEAULT_ROOT = path.resolve(__dirname, 'public/felixpeault');

const FELIXPEAULT_ROOT_ROUTES = /^\/(series|info|journeys|fr)(\/|$)/;

/** 浏览器同源拉取线站 JSON（避免 CORS） */
function felixpeaultRemoteProxy(): import('vite').Plugin {
  const middleware: Connect.NextHandleFunction = async (req, res, next) => {
    const url = req.url ?? '';
    const pathname = url.split('?')[0] ?? '';
    if (!pathname.startsWith('/felixpeault-remote/')) {
      next();
      return;
    }
    const originPath = pathname.replace(/^\/felixpeault-remote/, '');
    const qs = url.includes('?') ? url.slice(url.indexOf('?')) : '';
    try {
      const upstream = `https://felixpeault.com${originPath}${qs}`;
      const r = await fetch(upstream, {
        headers: {
          Accept: 'application/json',
          'User-Agent': 'Mozilla/5.0 (compatible; itzy-felix-mirror/1)',
        },
      });
      const body = Buffer.from(await r.arrayBuffer());
      res.statusCode = r.status;
      res.setHeader(
        'Content-Type',
        r.headers.get('content-type') ?? 'application/json',
      );
      res.end(body);
    } catch {
      next();
    }
  };
  return {
    name: 'felixpeault-remote-proxy',
    configureServer(server) {
      server.middlewares.use(middleware);
    },
    configurePreviewServer(server) {
      server.middlewares.use(middleware);
    },
  };
}

/** 本地 __data.json 被 Cloudflare 污染时，从线站拉取并缓存 */
function felixpeaultDataJsonProxy(): import('vite').Plugin {
  const middleware: Connect.NextHandleFunction = async (req, res, next) => {
    const url = req.url ?? '';
    const pathname = url.split('?')[0] ?? '';
    if (!pathname.startsWith('/felixpeault/') || !pathname.endsWith('__data.json')) {
      next();
      return;
    }
    const rel = pathname.replace(/^\/felixpeault\//, '');
    const local = path.join(FELIXPEAULT_ROOT, rel);
    if (fs.existsSync(local)) {
      const head = fs.readFileSync(local, 'utf8').slice(0, 8).trimStart();
      if (head.startsWith('{')) {
        next();
        return;
      }
    }
    try {
      const originPath = pathname.replace(/^\/felixpeault/, '');
      const qs = url.includes('?') ? url.slice(url.indexOf('?')) : '';
      const upstream = `https://felixpeault.com${originPath}${qs}`;
      const r = await fetch(upstream, {
        headers: {
          Accept: 'application/json',
          'User-Agent': 'Mozilla/5.0 (compatible; itzy-felix-mirror/1)',
        },
      });
      const body = Buffer.from(await r.arrayBuffer());
      const text = body.toString('utf8');
      if (!r.ok || !text.trimStart().startsWith('{')) {
        next();
        return;
      }
      fs.mkdirSync(path.dirname(local), { recursive: true });
      fs.writeFileSync(local, body);
      res.statusCode = 200;
      res.setHeader('Content-Type', 'application/json');
      res.end(body);
    } catch {
      next();
    }
  };
  return {
    name: 'felixpeault-data-json-proxy',
    configureServer(server) {
      server.middlewares.use(middleware);
    },
    configurePreviewServer(server) {
      server.middlewares.use(middleware);
    },
  };
}

/** 站内链接为 /series 等根路径时，重定向到 /felixpeault 子路径 */
function felixpeaultRootRouteRedirect(): import('vite').Plugin {
  const middleware = (
    req: Connect.IncomingMessage,
    res: Connect.ServerResponse,
    next: () => void,
  ) => {
    const url = req.url ?? '';
    const pathname = url.split('?')[0] ?? '';
    if (FELIXPEAULT_ROOT_ROUTES.test(pathname)) {
      const qs = url.includes('?') ? url.slice(url.indexOf('?')) : '';
      res.statusCode = 302;
      res.setHeader('Location', `/felixpeault${pathname}${qs}`);
      res.end();
      return;
    }
    next();
  };
  return {
    name: 'felixpeault-root-route-redirect',
    configureServer(server) {
      server.middlewares.use(middleware);
    },
    configurePreviewServer(server) {
      server.middlewares.use(middleware);
    },
  };
}

/** /felixpeault/* 页面走主站 React；仅 fonts 等静态资源直出 public */
function felixpeaultSpaFallback(): import('vite').Plugin {
  const middleware = (req: Connect.IncomingMessage, _res: unknown, next: () => void) => {
    let url = req.url ?? '';
    const pathname = url.split('?')[0] ?? '';
    if (pathname.startsWith('/fonts/')) {
      url = `/felixpeault${pathname}${url.includes('?') ? url.slice(url.indexOf('?')) : ''}`;
      req.url = url;
    }
    const fallback = applyFelixpeaultSpaFallback(url);
    if (fallback) req.url = fallback;
    next();
  };
  return {
    name: 'felixpeault-spa-fallback',
    configureServer(server) {
      server.middlewares.use(middleware);
    },
    configurePreviewServer(server) {
      server.middlewares.use(middleware);
    },
  };
}

/** public/helioteles 与 React 路由 /helioteles 冲突时，将页面请求回退到 SPA（字体/原始HTML/媒体仍直出） */
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
    felixpeaultRemoteProxy(),
    felixpeaultDataJsonProxy(),
    felixpeaultRootRouteRedirect(),
    felixpeaultSpaFallback(),
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
        navigateFallbackDenylist: [
          /^\/haoqi-static\//,
          /^\/unseen-proxy\//,
          /^\/traumclub\//,
          /^\/thefutureinblack\//,
          /^\/felixpeault\//,
        ],
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
