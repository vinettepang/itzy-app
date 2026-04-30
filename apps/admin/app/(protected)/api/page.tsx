'use client';

import { ApiOutlined, CheckCircleOutlined } from '@ant-design/icons';
import { Alert, App, Button, Card, Input, Space, Typography } from 'antd';
import type { ChangeEvent } from 'react';
import { useEffect, useState } from 'react';
import { apiBase, apiFetch, setStoredApiBase } from '@/lib/api';

const { Title, Text, Paragraph } = Typography;

export default function ApiAdminPage() {
  const { message } = App.useApp();
  const [baseInput, setBaseInput] = useState('http://192.168.1.100:3000');
  const [testing, setTesting] = useState(false);

  useEffect(() => {
    if (typeof window === 'undefined') return;
    const b = window.localStorage.getItem('api_base');
    if (b) setBaseInput(b);
    else setBaseInput(apiBase());
  }, []);

  const saveAndTest = async () => {
    setTesting(true);
    setStoredApiBase(baseInput);
    try {
      const res = await apiFetch<{ needsRegistration: boolean }>('/api/auth/bootstrap', { skipAuth: true });
      if (res.code === 0) {
        message.success('已保存，连接正常');
      } else {
        message.error(res.message || '已保存地址，但接口校验失败');
      }
    } catch {
      message.error('无法连接该地址，请检查协议、主机、端口与网络');
    } finally {
      setTesting(false);
    }
  };

  return (
    <div style={{ padding: '24px 20px 48px', maxWidth: 720, margin: '0 auto', width: '100%' }}>
      <Space direction="vertical" size="large" style={{ width: '100%' }}>
        <div>
          <Space align="center" style={{ marginBottom: 4 }}>
            <ApiOutlined style={{ fontSize: 22 }} />
            <Title level={4} style={{ margin: 0 }}>
              API 管理
            </Title>
          </Space>
          <Text type="secondary">配置 Nest 服务根地址；相册上传与后台请求均使用该地址。</Text>
        </div>

        <Alert
          type="info"
          showIcon
          message="鉴权说明"
          description={
            <span>
              管理接口在登录后自动附带 <Text code>JWT</Text>。此处仅配置 API 根路径（与上传图片返回的 URL 域名一致）。
            </span>
          }
        />

        <Card title="API 根地址" bordered={false} style={{ background: 'rgba(255,255,255,0.03)' }}>
          <Paragraph type="secondary" style={{ marginTop: 0 }}>
            与 Nest 一致（含协议与端口），请填本机局域网 IPv4，例如 <Text code>http://192.168.1.100:3000</Text>
            （勿用 localhost，真机无法访问）。保存后将请求{' '}
            <Text code>/api/auth/bootstrap</Text> 做连通性检测。
          </Paragraph>
          <Text type="secondary" style={{ display: 'block', marginBottom: 8 }}>
            当前生效：<Text code>{typeof window !== 'undefined' ? apiBase() : baseInput}</Text>
          </Text>
          <Space.Compact style={{ width: '100%' }}>
            <Input
              size="large"
              value={baseInput}
              onChange={(e: ChangeEvent<HTMLInputElement>) => setBaseInput(e.target.value)}
              placeholder="http://192.168.1.100:3000"
            />
            <Button
              type="primary"
              size="large"
              icon={<CheckCircleOutlined />}
              loading={testing}
              onClick={() => void saveAndTest()}
            >
              保存并检测
            </Button>
          </Space.Compact>
        </Card>
      </Space>
    </div>
  );
}
