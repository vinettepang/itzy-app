'use client';

import { CloudUploadOutlined, DeleteOutlined, PlusOutlined } from '@ant-design/icons';
import {
  Alert,
  App,
  Button,
  Card,
  Col,
  Collapse,
  Image,
  Input,
  Popconfirm,
  Row,
  Space,
  Spin,
  Tag,
  Typography,
  Upload,
} from 'antd';
import Link from 'next/link';
import type { ChangeEvent, MouseEvent } from 'react';
import { useCallback, useEffect, useState } from 'react';
import { apiBase, apiFetch, resolveMediaUrl } from '@/lib/api';

const { Title, Text, Paragraph } = Typography;

type Photo = {
  id: string;
  url: string;
  caption: string | null;
};

type Album = {
  id: string;
  title: string;
  description: string | null;
  coverUrl: string | null;
  published: boolean;
  sortOrder: number;
  photos: Photo[];
};

export default function AlbumsAdminPage() {
  const { message, modal } = App.useApp();
  const [albums, setAlbums] = useState<Album[]>([]);
  const [msg, setMsg] = useState<string | null>(null);
  const [title, setTitle] = useState('新相册');
  const [desc, setDesc] = useState('');
  const [expanded, setExpanded] = useState<string | string[]>([]);
  const [loading, setLoading] = useState(true);
  const [creating, setCreating] = useState(false);
  const [publishingId, setPublishingId] = useState<string | null>(null);
  const [uploadingAlbumId, setUploadingAlbumId] = useState<string | null>(null);
  const [coverBusyAlbumId, setCoverBusyAlbumId] = useState<string | null>(null);
  const [deletingPhotoId, setDeletingPhotoId] = useState<string | null>(null);

  const load = useCallback(async () => {
    setMsg(null);
    setLoading(true);
    try {
      const res = await apiFetch<Album[]>('/api/admin/albums');
      if (res.code !== 0) {
        const t = res.message || '加载失败';
        setMsg(t);
        message.error(t);
        setAlbums([]);
        return;
      }
      setAlbums(res.data ?? []);
    } catch {
      const t = '网络异常，请检查 API 根地址（API 管理）';
      setMsg(t);
      message.error(t);
      setAlbums([]);
    } finally {
      setLoading(false);
    }
  }, [message]);

  useEffect(() => {
    void load();
  }, [load]);

  const createAlbum = async () => {
    setMsg(null);
    setCreating(true);
    try {
      const res = await apiFetch<Album>('/api/admin/albums', {
        method: 'POST',
        body: JSON.stringify({ title, description: desc || null, published: false }),
      });
      if (res.code !== 0) {
        const t = res.message || '创建失败';
        setMsg(t);
        message.error(t);
        return;
      }
      message.success('相册已创建');
      setTitle('新相册');
      setDesc('');
      await load();
    } catch {
      const t = '网络异常，创建失败';
      setMsg(t);
      message.error(t);
    } finally {
      setCreating(false);
    }
  };

  const togglePublish = async (a: Album) => {
    setMsg(null);
    setPublishingId(a.id);
    try {
      const res = await apiFetch<Album>(`/api/admin/albums/${a.id}`, {
        method: 'PUT',
        body: JSON.stringify({ published: !a.published }),
      });
      if (res.code !== 0) {
        const t = res.message || '更新失败';
        setMsg(t);
        message.error(t);
        return;
      }
      message.success(a.published ? '已下架' : '已发布');
      await load();
    } catch {
      const t = '网络异常，更新失败';
      setMsg(t);
      message.error(t);
    } finally {
      setPublishingId(null);
    }
  };

  const removeAlbum = (a: Album) => {
    modal.confirm({
      title: '删除相册',
      content: `确定删除「${a.title}」及其中全部照片？此操作不可恢复。`,
      okText: '删除',
      okType: 'danger',
      cancelText: '取消',
      onOk: async () => {
        setMsg(null);
        try {
          const res = await apiFetch<boolean>(`/api/admin/albums/${a.id}`, { method: 'DELETE' });
          if (res.code !== 0) {
            const t = res.message || '删除失败';
            setMsg(t);
            message.error(t);
            return Promise.reject(new Error(t));
          }
          message.success('已删除');
          await load();
        } catch {
          message.error('网络异常，删除失败');
          return Promise.reject(new Error('network'));
        }
      },
    });
  };

  const uploadOne = async (albumId: string, file: File) => {
    setMsg(null);
    try {
      const fd = new FormData();
      fd.append('file', file);
      const res = await apiFetch<Photo>(`/api/admin/albums/${albumId}/photos`, {
        method: 'POST',
        body: fd,
      });
      if (res.code !== 0) {
        const t = res.message || `上传失败: ${file.name}`;
        setMsg(t);
        message.error(t);
        return false;
      }
      return true;
    } catch {
      const t = `上传失败（网络异常）: ${file.name}`;
      setMsg(t);
      message.error(t);
      return false;
    }
  };

  const removePhoto = async (photoId: string) => {
    setMsg(null);
    setDeletingPhotoId(photoId);
    try {
      const res = await apiFetch<boolean>(`/api/admin/albums/photos/${photoId}`, {
        method: 'DELETE',
      });
      if (res.code !== 0) {
        const t = res.message || '删除失败';
        setMsg(t);
        message.error(t);
        return Promise.reject(new Error(t));
      }
      message.success('已删除照片');
      await load();
    } catch {
      message.error('网络异常，删除失败');
      return Promise.reject(new Error('network'));
    } finally {
      setDeletingPhotoId(null);
    }
  };

  const setCover = async (albumId: string, coverUrl: string) => {
    setMsg(null);
    setCoverBusyAlbumId(albumId);
    try {
      const res = await apiFetch<Album>(`/api/admin/albums/${albumId}`, {
        method: 'PUT',
        body: JSON.stringify({ coverUrl }),
      });
      if (res.code !== 0) {
        const t = res.message || '设置封面失败';
        setMsg(t);
        message.error(t);
        return;
      }
      message.success('已更新封面');
      await load();
    } catch {
      const t = '网络异常，设置封面失败';
      setMsg(t);
      message.error(t);
    } finally {
      setCoverBusyAlbumId(null);
    }
  };

  const clearCover = async (albumId: string) => {
    setMsg(null);
    setCoverBusyAlbumId(albumId);
    try {
      const res = await apiFetch<Album>(`/api/admin/albums/${albumId}`, {
        method: 'PUT',
        body: JSON.stringify({ coverUrl: null }),
      });
      if (res.code !== 0) {
        const t = res.message || '清除封面失败';
        setMsg(t);
        message.error(t);
        return;
      }
      message.success('已清除封面');
      await load();
    } catch {
      const t = '网络异常，清除封面失败';
      setMsg(t);
      message.error(t);
    } finally {
      setCoverBusyAlbumId(null);
    }
  };

  const collapseItems = albums.map((a) => ({
    key: a.id,
    label: (
      <Row justify="space-between" align="middle" gutter={[8, 8]} wrap>
        <Col flex="auto" style={{ minWidth: 0 }}>
          <Space align="center" wrap size="small">
            <Text strong ellipsis style={{ maxWidth: 280 }}>
              {a.title}
            </Text>
            <Tag color={a.published ? 'success' : 'default'}>
              {a.published ? '已发布 · 小程序可见' : '未发布'}
            </Tag>
            <Text type="secondary">{a.photos.length} 张</Text>
          </Space>
        </Col>
        <Col onClick={(e: MouseEvent) => e.stopPropagation()}>
          <Space size="small" wrap>
            <Button
              size="small"
              type={a.published ? 'default' : 'primary'}
              loading={publishingId === a.id}
              disabled={publishingId !== null && publishingId !== a.id}
              onClick={() => void togglePublish(a)}
            >
              {a.published ? '下架' : '发布'}
            </Button>
            <Button size="small" danger icon={<DeleteOutlined />} onClick={() => removeAlbum(a)}>
              删除相册
            </Button>
          </Space>
        </Col>
      </Row>
    ),
    children: (
      <div>
        {a.description ? (
          <Paragraph type="secondary" style={{ marginBottom: 16 }}>
            {a.description}
          </Paragraph>
        ) : null}

        {a.photos.length > 0 ? (
          <Paragraph style={{ marginBottom: 12 }}>
            <Text type="secondary">在下方照片中点击「设为封面」；首张上传会自动设为封面（可再改）。</Text>
            {a.coverUrl ? (
              <>
                {' '}
                <Button
                  type="link"
                  size="small"
                  style={{ padding: 0, height: 'auto' }}
                  loading={coverBusyAlbumId === a.id}
                  disabled={coverBusyAlbumId !== null && coverBusyAlbumId !== a.id}
                  onClick={() => void clearCover(a.id)}
                >
                  清除封面
                </Button>
              </>
            ) : null}
          </Paragraph>
        ) : null}

        <Upload.Dragger
          multiple
          accept="image/*"
          showUploadList={false}
          disabled={uploadingAlbumId === a.id}
          beforeUpload={async (file: File) => {
            setUploadingAlbumId(a.id);
            const hide = message.loading(`正在上传 ${file.name}…`, 0);
            try {
              const ok = await uploadOne(a.id, file);
              if (ok) await load();
            } finally {
              hide();
              setUploadingAlbumId(null);
            }
            return false;
          }}
          style={{ marginBottom: 20, background: 'rgba(255,255,255,0.02)' }}
        >
          <p className="ant-upload-drag-icon">
            <CloudUploadOutlined style={{ color: '#818cf8' }} />
          </p>
          <p className="ant-upload-text">点击或拖拽图片到此处上传</p>
          <p className="ant-upload-hint">支持多选；单张建议不超过 15MB</p>
          {uploadingAlbumId === a.id ? (
            <div style={{ marginTop: 8 }}>
              <Spin size="small" /> <Text type="secondary"> 上传处理中…</Text>
            </div>
          ) : null}
        </Upload.Dragger>

        {a.photos.length ? (
          <Image.PreviewGroup>
            <Row gutter={[12, 12]}>
              {a.photos.map((p) => {
                const isCover = resolveMediaUrl(a.coverUrl) === resolveMediaUrl(p.url);
                return (
                  <Col xs={12} sm={8} md={6} lg={4} key={p.id}>
                    <div
                      style={{
                        position: 'relative',
                        borderRadius: 10,
                        overflow: 'hidden',
                        outline: isCover ? '2px solid #818cf8' : undefined,
                        outlineOffset: 0,
                      }}
                    >
                      <Image
                        src={resolveMediaUrl(p.url)}
                        alt={p.caption ?? ''}
                        style={{ width: '100%', height: 140, objectFit: 'cover', display: 'block' }}
                        preview={{ mask: '预览' }}
                      />
                      <Popconfirm
                        title="删除这张照片？"
                        okText="删除"
                        okType="danger"
                        cancelText="取消"
                        onConfirm={() => removePhoto(p.id)}
                      >
                        <Button
                          type="primary"
                          danger
                          size="small"
                          icon={<DeleteOutlined />}
                          loading={deletingPhotoId === p.id}
                          disabled={deletingPhotoId !== null && deletingPhotoId !== p.id}
                          style={{ position: 'absolute', top: 8, right: 8 }}
                        >
                          删除
                        </Button>
                      </Popconfirm>
                      <div
                        style={{
                          position: 'absolute',
                          bottom: 0,
                          left: 0,
                          right: 0,
                          padding: '10px 8px',
                          background: 'linear-gradient(transparent, rgba(0,0,0,0.72))',
                          display: 'flex',
                          justifyContent: 'center',
                        }}
                      >
                        <Button
                          type="primary"
                          size="small"
                          ghost={!isCover}
                          disabled={isCover || (coverBusyAlbumId !== null && coverBusyAlbumId !== a.id)}
                          loading={coverBusyAlbumId === a.id && !isCover}
                          onClick={(e: MouseEvent) => {
                            e.stopPropagation();
                            void setCover(a.id, p.url);
                          }}
                        >
                          {isCover ? '当前封面' : '设为封面'}
                        </Button>
                      </div>
                    </div>
                  </Col>
                );
              })}
            </Row>
          </Image.PreviewGroup>
        ) : (
          <Text type="secondary">暂无照片，上传后即可在小程序中展示（需发布相册）。</Text>
        )}
      </div>
    ),
  }));

  return (
    <div style={{ padding: '24px 20px 48px', maxWidth: 1120, margin: '0 auto', width: '100%' }}>
      <Space direction="vertical" size="middle" style={{ width: '100%' }}>
        <div>
          <Title level={4} style={{ margin: 0, color: '#f4f4f5' }}>
            相册管理
          </Title>
          <Text type="secondary" style={{ fontSize: 13 }}>
            当前 API 根地址：<Text code>{apiBase()}</Text> ·{' '}
            <Link href="/api">API 管理</Link>
          </Text>
        </div>

        <Alert
          type="info"
          showIcon
          message="鉴权说明"
          description={
            <span>
              管理接口使用登录后获得的 <Text code>JWT</Text>（自动附带在请求头）。根地址与上传域名请在{' '}
              <Link href="/api">API 管理</Link> 中配置。
            </span>
          }
        />

        {msg ? (
          <Alert type="error" showIcon closable message={msg} onClose={() => setMsg(null)} />
        ) : null}

        <Card
          title="新建相册"
          extra={<PlusOutlined style={{ color: '#818cf8' }} />}
          bordered={false}
          style={{ background: 'rgba(255,255,255,0.03)' }}
        >
          <Row gutter={[16, 16]} align="bottom">
            <Col xs={24} md={10}>
              <Text type="secondary" style={{ display: 'block', marginBottom: 8 }}>
                标题
              </Text>
              <Input
                size="large"
                value={title}
                onChange={(e: ChangeEvent<HTMLInputElement>) => setTitle(e.target.value)}
                placeholder="相册名称"
              />
            </Col>
            <Col xs={24} md={10}>
              <Text type="secondary" style={{ display: 'block', marginBottom: 8 }}>
                描述（可选）
              </Text>
              <Input
                size="large"
                value={desc}
                onChange={(e: ChangeEvent<HTMLInputElement>) => setDesc(e.target.value)}
                placeholder="一句话介绍"
              />
            </Col>
            <Col xs={24} md={4}>
              <Button
                type="primary"
                size="large"
                block
                icon={<PlusOutlined />}
                loading={creating}
                onClick={() => void createAlbum()}
              >
                创建
              </Button>
            </Col>
          </Row>
        </Card>

        <div>
          <Title level={5} style={{ marginBottom: 12, color: '#e4e4e7' }}>
            相册列表
          </Title>
          <Spin spinning={loading}>
            {albums.length ? (
              <Collapse
                bordered={false}
                style={{ background: 'transparent' }}
                expandIconPosition="end"
                activeKey={expanded}
                onChange={(keys: string | string[]) => setExpanded(keys)}
                items={collapseItems}
              />
            ) : (
              <Card bordered={false} style={{ background: 'rgba(255,255,255,0.03)' }}>
                <Text type="secondary">暂无相册，请先创建；发布后即可在小程序端展示。</Text>
              </Card>
            )}
          </Spin>
        </div>
      </Space>
    </div>
  );
}
