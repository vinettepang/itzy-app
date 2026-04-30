'use client';

import {
  ArrowRightOutlined,
  CloudOutlined,
  PictureOutlined,
} from '@ant-design/icons';
import { Button, Card, Col, Row, Space, Typography } from 'antd';
import { useRouter } from 'next/navigation';

const { Title, Paragraph, Text } = Typography;

export default function Home() {
  const router = useRouter();

  return (
    <div
      style={{
        minHeight: '100vh',
        background:
          'radial-gradient(1200px 600px at 10% -10%, rgba(99,102,241,0.25), transparent 55%), radial-gradient(900px 500px at 100% 0%, rgba(56,189,248,0.12), transparent 50%), #070709',
        padding: '48px 24px 64px',
      }}
    >
      <Row justify="center">
        <Col xs={24} lg={18} xl={14}>
          <Space direction="vertical" size="large" style={{ width: '100%' }}>
            <div>
              <Text type="secondary" style={{ letterSpacing: 2, fontSize: 12, textTransform: 'uppercase' }}>
                ITZY Admin
              </Text>
              <Title level={1} style={{ margin: '12px 0 8px', fontWeight: 700, fontSize: 40 }}>
                相册控制台
              </Title>
              <Paragraph type="secondary" style={{ fontSize: 16, marginBottom: 0, maxWidth: 520 }}>
                统一管理相册与图片，发布后由小程序端展示。请先启动 API 服务再进入管理。
              </Paragraph>
            </div>

            <Row gutter={[16, 16]}>
              <Col xs={24} md={12}>
                <Card bordered={false} style={{ height: '100%', background: 'rgba(255,255,255,0.04)' }}>
                  <PictureOutlined style={{ fontSize: 28, color: '#818cf8' }} />
                  <Title level={4} style={{ marginTop: 12, marginBottom: 8 }}>
                    相册与照片
                  </Title>
                  <Paragraph type="secondary" style={{ marginBottom: 0 }}>
                    创建相册、批量上传、发布到小程序端可见列表。
                  </Paragraph>
                </Card>
              </Col>
              <Col xs={24} md={12}>
                <Card bordered={false} style={{ height: '100%', background: 'rgba(255,255,255,0.04)' }}>
                  <CloudOutlined style={{ fontSize: 28, color: '#38bdf8' }} />
                  <Title level={4} style={{ marginTop: 12, marginBottom: 8 }}>
                    对接 API
                  </Title>
                  <Paragraph type="secondary" style={{ marginBottom: 0 }}>
                    使用账号登录获取 JWT；登录后在顶部「API 管理」中配置根地址。
                  </Paragraph>
                </Card>
              </Col>
            </Row>

            <Space wrap>
              <Button
                type="primary"
                size="large"
                icon={<ArrowRightOutlined />}
                onClick={() => router.push('/login?redirect=/albums')}
              >
                登录并进入管理
              </Button>
              <Button size="large" onClick={() => router.push('/albums')}>
                我已登录
              </Button>
            </Space>
          </Space>
        </Col>
      </Row>
    </div>
  );
}
