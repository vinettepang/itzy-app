'use client';

import {
  ApiOutlined,
  CalendarOutlined,
  LogoutOutlined,
  MoonOutlined,
  PictureOutlined,
  SunOutlined,
  TeamOutlined,
} from '@ant-design/icons';
import { Button, Flex, Layout, Menu, Spin, theme, Typography } from 'antd';
import { usePathname, useRouter } from 'next/navigation';
import { useEffect, useMemo } from 'react';
import { useAuth } from '@/app/contexts/auth-context';
import { useThemeMode } from '@/app/contexts/theme-context';
import { getStoredJwt } from '@/lib/api';

const { Header, Content } = Layout;

export default function ProtectedLayout({ children }: { children: React.ReactNode }) {
  const { ready, user, logout } = useAuth();
  const { isDark, toggle } = useThemeMode();
  const router = useRouter();
  const pathname = usePathname();
  const { token } = theme.useToken();

  useEffect(() => {
    if (!ready) return;
    if (!getStoredJwt()) {
      const q = encodeURIComponent(pathname || '/albums');
      router.replace(`/login?redirect=${q}`);
    }
  }, [ready, router, pathname]);

  const menuItems = useMemo(() => {
    const items = [
      { key: '/api', icon: <ApiOutlined />, label: 'API 管理' },
      { key: '/albums', icon: <PictureOutlined />, label: '相册管理' },
      { key: '/schedules', icon: <CalendarOutlined />, label: '行程管理' },
    ];
    if (user?.role === 'SUPER_ADMIN') {
      items.push({ key: '/users', icon: <TeamOutlined />, label: '用户管理' });
    }
    return items;
  }, [user?.role]);

  const menuSelectedKey = useMemo(() => {
    if (pathname?.startsWith('/users')) return '/users';
    if (pathname?.startsWith('/api')) return '/api';
    if (pathname?.startsWith('/schedules')) return '/schedules';
    if (pathname?.startsWith('/albums')) return '/albums';
    return '/albums';
  }, [pathname]);

  if (!ready || !getStoredJwt()) {
    return (
      <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', minHeight: '60vh' }}>
        <Spin size="large" tip="验证登录…" />
      </div>
    );
  }

  return (
    <Layout style={{ minHeight: '100vh', background: token.colorBgLayout ?? '#070709' }}>
      <Header
        style={{
          display: 'flex',
          alignItems: 'center',
          gap: 12,
          paddingInline: 20,
          borderBottom: `1px solid ${token.colorSplit}`,
        }}
      >
        <Typography.Title level={4} style={{ margin: 0, color: token.colorTextHeading, flexShrink: 0 }}>
          ITZY Admin
        </Typography.Title>
        <Menu
          theme={isDark ? 'dark' : 'light'}
          mode="horizontal"
          selectedKeys={[menuSelectedKey]}
          items={menuItems}
          style={{ flex: 1, minWidth: 0, borderBottom: 'none', background: 'transparent' }}
          onClick={({ key }) => router.push(String(key))}
        />
        <Flex align="center" gap={4} style={{ marginLeft: 'auto', flexShrink: 0 }}>
          <Button
            type="text"
            icon={isDark ? <SunOutlined /> : <MoonOutlined />}
            onClick={toggle}
            title={isDark ? '切换为亮色' : '切换为暗色'}
            style={{ color: token.colorTextSecondary }}
          />
          <Typography.Text
            type="secondary"
            ellipsis
            style={{
              maxWidth: 200,
              margin: 0,
              lineHeight: `${token.controlHeight}px`,
              display: 'inline-block',
            }}
          >
            {user?.email}
          </Typography.Text>
          <Button
            type="text"
            icon={<LogoutOutlined />}
            onClick={() => {
              logout();
              router.replace('/login');
            }}
            style={{ color: token.colorTextSecondary }}
          >
            退出
          </Button>
        </Flex>
      </Header>
      <Content style={{ padding: 0 }}>{children}</Content>
    </Layout>
  );
}
