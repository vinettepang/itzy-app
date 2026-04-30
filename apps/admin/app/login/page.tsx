'use client';

import { LockOutlined, MailOutlined, UserOutlined } from '@ant-design/icons';
import { Alert, App, Button, Card, Form, Input, Space, Spin, Tabs, Typography } from 'antd';
import { useRouter } from 'next/navigation';
import { useEffect, useState } from 'react';
import { useAuth } from '@/app/contexts/auth-context';
import { apiFetch } from '@/lib/api';

const { Title, Paragraph, Text } = Typography;

export default function LoginPage() {
  const { message } = App.useApp();
  const { login, register, user, ready } = useAuth();
  const router = useRouter();
  const [tab, setTab] = useState<'login' | 'register'>('login');
  const [needsRegistration, setNeedsRegistration] = useState(false);
  const [checked, setChecked] = useState(false);
  const [err, setErr] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const [redirectPath, setRedirectPath] = useState('/albums');

  useEffect(() => {
    const q = new URLSearchParams(window.location.search).get('redirect');
    if (q && q.startsWith('/')) setRedirectPath(q);
  }, []);

  useEffect(() => {
    if (!ready) return;
    if (user) {
      router.replace(redirectPath);
    }
  }, [ready, user, router, redirectPath]);

  useEffect(() => {
    void (async () => {
      try {
        const res = await apiFetch<{ needsRegistration: boolean }>('/api/auth/bootstrap', { skipAuth: true });
        if (res.code === 0 && res.data?.needsRegistration) {
          setNeedsRegistration(true);
          setTab('register');
        } else if (res.code !== 0) {
          message.warning(res.message || '无法检测注册状态，仍可尝试登录');
        }
      } catch {
        message.warning('无法连接 API，请先在 API 管理中配置地址后再试');
      } finally {
        setChecked(true);
      }
    })();
  }, [message]);

  const onLogin = async (v: { email: string; password: string }) => {
    setErr(null);
    setLoading(true);
    try {
      await login(v.email, v.password);
      router.replace(redirectPath);
    } catch (e: unknown) {
      const t = e instanceof Error ? e.message : '登录失败';
      setErr(t);
      message.error(t);
    } finally {
      setLoading(false);
    }
  };

  const onRegister = async (v: { email: string; password: string; name?: string }) => {
    setErr(null);
    setLoading(true);
    try {
      await register({ email: v.email, password: v.password, name: v.name });
      router.replace(redirectPath);
    } catch (e: unknown) {
      const t = e instanceof Error ? e.message : '注册失败';
      setErr(t);
      message.error(t);
    } finally {
      setLoading(false);
    }
  };

  if (!checked) {
    return (
      <div style={{ minHeight: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
        <Spin tip="初始化…" />
      </div>
    );
  }

  return (
    <div
      style={{
        minHeight: '100vh',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        padding: 24,
        background:
          'radial-gradient(800px 400px at 20% 10%, rgba(99,102,241,0.2), transparent 50%), radial-gradient(600px 300px at 90% 20%, rgba(56,189,248,0.12), transparent 45%), #070709',
      }}
    >
      <Card bordered={false} style={{ width: '100%', maxWidth: 420, background: 'rgba(255,255,255,0.04)' }}>
        <Space direction="vertical" size="large" style={{ width: '100%' }}>
          <div style={{ textAlign: 'center' }}>
            <Title level={3} style={{ marginBottom: 8 }}>
              ITZY Admin
            </Title>
            <Paragraph type="secondary" style={{ marginBottom: 0 }}>
              登录后管理相册与用户
            </Paragraph>
          </div>

          {err ? <Alert type="error" showIcon message={err} closable onClose={() => setErr(null)} /> : null}

          <Tabs
            activeKey={tab}
            onChange={(k) => setTab(k as 'login' | 'register')}
            items={[
              {
                key: 'login',
                label: '登录',
                children: (
                  <Form layout="vertical" onFinish={onLogin} requiredMark={false}>
                    <Form.Item name="email" label="邮箱" rules={[{ required: true, type: 'email' }]}>
                      <Input prefix={<MailOutlined />} placeholder="you@example.com" size="large" />
                    </Form.Item>
                    <Form.Item name="password" label="密码" rules={[{ required: true, message: '请输入密码' }]}>
                      <Input.Password prefix={<LockOutlined />} size="large" />
                    </Form.Item>
                    <Form.Item>
                      <Button type="primary" htmlType="submit" block size="large" loading={loading}>
                        登录
                      </Button>
                    </Form.Item>
                  </Form>
                ),
              },
              {
                key: 'register',
                label: needsRegistration ? '注册管理员' : '注册',
                children: (
                  <Form layout="vertical" onFinish={onRegister} requiredMark={false}>
                    {!needsRegistration ? (
                      <Alert
                        type="warning"
                        showIcon
                        style={{ marginBottom: 16 }}
                        message="系统已有账号时，公开注册默认关闭。请联系超级管理员开通账号，或由运维设置 ALLOW_PUBLIC_REGISTER=true。"
                      />
                    ) : (
                      <Alert
                        type="info"
                        showIcon
                        style={{ marginBottom: 16 }}
                        message="当前库中无用户，首个账号将自动成为超级管理员。"
                      />
                    )}
                    <Form.Item name="email" label="邮箱" rules={[{ required: true, type: 'email' }]}>
                      <Input prefix={<MailOutlined />} placeholder="you@example.com" size="large" />
                    </Form.Item>
                    <Form.Item name="password" label="密码" rules={[{ required: true, min: 6 }]}>
                      <Input.Password prefix={<LockOutlined />} size="large" />
                    </Form.Item>
                    <Form.Item name="name" label="显示名">
                      <Input prefix={<UserOutlined />} placeholder="可选" size="large" />
                    </Form.Item>
                    <Form.Item>
                      <Button type="primary" htmlType="submit" block size="large" loading={loading} disabled={!needsRegistration}>
                        注册并登录
                      </Button>
                    </Form.Item>
                  </Form>
                ),
              },
            ]}
          />
        </Space>
      </Card>
    </div>
  );
}
