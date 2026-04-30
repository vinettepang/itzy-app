import path from 'path';
import type { UserConfigExport } from '@tarojs/cli';

/** 真机/模拟器访问本机 Nest 须用局域网 IPv4，勿用 localhost；请改成你 ipconfig/ifconfig 里的地址 */
const API_BASE = process.env.TARO_APP_API ?? 'http://10.0.112.146:3000';

export default {
  projectName: 'itzy-mini',
  date: '2026-4-20',
  designWidth: 750,
  deviceRatio: {
    640: 2.34 / 2,
    750: 1,
    828: 1.81 / 2,
  },
  sourceRoot: 'src',
  outputRoot: 'dist',
  plugins: ['@tarojs/plugin-framework-react'],
  framework: 'react',
  compiler: {
    type: 'webpack5',
    prebundle: { enable: false },
  },
  cache: { enable: false },
  mini: {
    postcss: {
      pxtransform: { enable: true, config: {} },
      url: { enable: true, config: { limit: 1024 } },
      cssModules: { enable: false, config: {} },
    },
  },
  /** `USE_LIVE_API` 在 `src/config/dataSource.ts`；默认 false 不请求后端，数据见 `src/mock-data/` */
  defineConstants: {
    TARO_APP_API: JSON.stringify(API_BASE),
  },
  alias: {
    '@': path.resolve(__dirname, '..', 'src'),
  },
} satisfies UserConfigExport;
