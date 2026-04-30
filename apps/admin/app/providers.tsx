'use client';

import '@/lib/dayjs';
import { AntdRegistry } from '@ant-design/nextjs-registry';
import { App, ConfigProvider, theme } from 'antd';
import zhCN from 'antd/locale/zh_CN';
import { useEffect } from 'react';
import { AuthProvider } from './contexts/auth-context';
import { ThemeProvider, useThemeMode } from './contexts/theme-context';

const sharedToken = {
  colorPrimary: '#818cf8',
  colorInfo: '#38bdf8',
  colorSuccess: '#34d399',
  colorWarning: '#fbbf24',
  colorError: '#f87171',
  borderRadiusLG: 14,
  borderRadius: 10,
  fontFamily:
    'ui-sans-serif, system-ui, -apple-system, "Segoe UI", Roboto, "PingFang SC", "Microsoft YaHei", sans-serif',
};

function BodyBackgroundSync() {
  const { isDark } = useThemeMode();
  useEffect(() => {
    document.body.style.background = isDark ? '#070709' : '#f0f0f0';
  }, [isDark]);
  return null;
}

function ThemedTree({ children }: { children: React.ReactNode }) {
  const { isDark } = useThemeMode();

  return (
    <ConfigProvider
      locale={zhCN}
      theme={{
        algorithm: isDark ? theme.darkAlgorithm : theme.defaultAlgorithm,
        token: sharedToken,
        components: {
          Card: { headerBg: 'transparent' },
          Layout: isDark
            ? {
                bodyBg: '#070709',
                headerBg: 'rgba(15,15,18,0.85)',
                headerPadding: '0 28px',
              }
            : {
                bodyBg: '#f5f5f5',
                headerBg: '#ffffff',
                headerPadding: '0 28px',
              },
        },
      }}
    >
      <BodyBackgroundSync />
      <App>
        <AuthProvider>{children}</AuthProvider>
      </App>
    </ConfigProvider>
  );
}

export function Providers({ children }: { children: React.ReactNode }) {
  return (
    <AntdRegistry>
      <ThemeProvider>
        <ThemedTree>{children}</ThemedTree>
      </ThemeProvider>
    </AntdRegistry>
  );
}
