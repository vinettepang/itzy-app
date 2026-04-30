import { createRequire } from 'module';
import path from 'path';
import { fileURLToPath } from 'url';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const require = createRequire(import.meta.url);

let iconsLibDir;
try {
  const iconsPkg = path.dirname(require.resolve('@ant-design/icons/package.json', { paths: [__dirname] }));
  iconsLibDir = path.join(iconsPkg, 'lib');
} catch {
  iconsLibDir = undefined;
}

/** @type {import('next').NextConfig} */
const nextConfig = {
  reactStrictMode: true,
  transpilePackages: ['antd', '@ant-design/icons', '@ant-design/nextjs-registry'],
  // 避免服务端把 iconv-lite 打进 bundle 后运行时找不到子路径（如 ../encodings）
  experimental: {
    serverComponentsExternalPackages: ['iconv-lite'],
  },
  webpack: (config, { isServer }) => {
    const alias = { ...(config.resolve.alias || {}) };
    if (iconsLibDir) {
      alias['@ant-design/icons/lib'] = iconsLibDir;
    }
    // iconv-lite 仅应在 Node 使用；打进浏览器会触发 Cannot find module '../encodings'
    if (!isServer) {
      alias['iconv-lite'] = false;
      alias.encoding = false;
    }
    config.resolve.alias = alias;
    return config;
  },
};

export default nextConfig;
