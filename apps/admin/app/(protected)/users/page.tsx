'use client';

import { DeleteOutlined, PlusOutlined } from '@ant-design/icons';
import {
  Alert,
  App,
  Button,
  Card,
  Form,
  Input,
  Modal,
  Popconfirm,
  Select,
  Space,
  Spin,
  Table,
  Tag,
  Typography,
} from 'antd';
import type { ColumnsType } from 'antd/es/table';
import { useCallback, useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/app/contexts/auth-context';
import { apiFetch } from '@/lib/api';

const { Text } = Typography;

type UserRow = {
  id: string;
  email: string;
  name: string | null;
  role: string;
  createdAt: string;
  updatedAt: string;
};

export default function UsersAdminPage() {
  const { message } = App.useApp();
  const { user, ready } = useAuth();
  const router = useRouter();
  const [rows, setRows] = useState<UserRow[]>([]);
  const [loading, setLoading] = useState(true);
  const [modalOpen, setModalOpen] = useState(false);
  const [modalSubmitting, setModalSubmitting] = useState(false);
  const [editing, setEditing] = useState<UserRow | null>(null);
  const [deletingUserId, setDeletingUserId] = useState<string | null>(null);
  const [form] = Form.useForm<{ email?: string; password?: string; name?: string; role?: string }>();

  const load = useCallback(async () => {
    setLoading(true);
    try {
      const res = await apiFetch<UserRow[]>('/api/admin/users');
      if (res.code !== 0) {
        message.error(res.message || '加载失败');
        setRows([]);
        return;
      }
      setRows(res.data ?? []);
    } catch {
      message.error('网络错误');
      setRows([]);
    } finally {
      setLoading(false);
    }
  }, [message]);

  useEffect(() => {
    if (!ready) return;
    if (user?.role !== 'SUPER_ADMIN') {
      router.replace('/albums');
      return;
    }
    void load();
  }, [ready, user?.role, router, load]);

  const openCreate = () => {
    setEditing(null);
    form.resetFields();
    form.setFieldsValue({ role: 'ADMIN' });
    setModalOpen(true);
  };

  const openEdit = (r: UserRow) => {
    setEditing(r);
    form.setFieldsValue({ email: r.email, name: r.name ?? '', role: r.role });
    setModalOpen(true);
  };

  const submit = async () => {
    let v: { email?: string; password?: string; name?: string; role?: string };
    try {
      v = await form.validateFields();
    } catch {
      return;
    }
    setModalSubmitting(true);
    try {
      if (editing) {
        const res = await apiFetch<UserRow>(`/api/admin/users/${editing.id}`, {
          method: 'PUT',
          body: JSON.stringify({
            name: v.name || null,
            role: v.role,
            password: v.password?.length ? v.password : undefined,
          }),
        });
        if (res.code !== 0) {
          message.error(res.message || '更新失败');
          return;
        }
        message.success('已更新');
      } else {
        if (!v.email?.trim() || !v.password || v.password.length < 6) {
          message.error('请填写邮箱与至少 6 位密码');
          return;
        }
        const res = await apiFetch<UserRow>('/api/admin/users', {
          method: 'POST',
          body: JSON.stringify({
            email: v.email,
            password: v.password,
            name: v.name || null,
            role: v.role ?? 'ADMIN',
          }),
        });
        if (res.code !== 0) {
          message.error(res.message || '创建失败');
          return;
        }
        message.success('用户已创建');
      }
      setModalOpen(false);
      await load();
    } catch {
      message.error('网络异常，请重试');
    } finally {
      setModalSubmitting(false);
    }
  };

  const remove = async (id: string) => {
    setDeletingUserId(id);
    try {
      const res = await apiFetch<boolean>(`/api/admin/users/${id}`, { method: 'DELETE' });
      if (res.code !== 0) {
        message.error(res.message || '删除失败');
        return Promise.reject(new Error('api'));
      }
      message.success('已删除');
      await load();
    } catch {
      message.error('网络异常，删除失败');
      return Promise.reject(new Error('network'));
    } finally {
      setDeletingUserId(null);
    }
  };

  const columns: ColumnsType<UserRow> = [
    { title: '邮箱', dataIndex: 'email', key: 'email', ellipsis: true },
    { title: '姓名', dataIndex: 'name', key: 'name', render: (n) => n || '—' },
    {
      title: '角色',
      dataIndex: 'role',
      key: 'role',
      render: (r: string) => (
        <Tag color={r === 'SUPER_ADMIN' ? 'purple' : 'blue'}>{r === 'SUPER_ADMIN' ? '超级管理员' : '管理员'}</Tag>
      ),
    },
    {
      title: '创建时间',
      dataIndex: 'createdAt',
      key: 'createdAt',
      width: 200,
      render: (t: string) => new Date(t).toLocaleString('zh-CN'),
    },
    {
      title: '操作',
      key: 'actions',
      width: 200,
      render: (_, r) => (
        <Space>
          <Button type="link" size="small" onClick={() => openEdit(r)} disabled={deletingUserId !== null}>
            编辑
          </Button>
          <Popconfirm title="确定删除该用户？" okText="删除" okType="danger" onConfirm={() => remove(r.id)}>
            <Button
              type="link"
              size="small"
              danger
              icon={<DeleteOutlined />}
              loading={deletingUserId === r.id}
              disabled={deletingUserId !== null && deletingUserId !== r.id}
            >
              删除
            </Button>
          </Popconfirm>
        </Space>
      ),
    },
  ];

  if (!ready || user?.role !== 'SUPER_ADMIN') {
    return (
      <div style={{ padding: 48, textAlign: 'center' }}>
        <Spin tip="检查权限…" />
      </div>
    );
  }

  return (
    <div style={{ padding: '24px 20px 48px', maxWidth: 1000, margin: '0 auto' }}>
      <Space direction="vertical" size="large" style={{ width: '100%' }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: 12 }}>
          <div>
            <Typography.Title level={4} style={{ margin: 0, color: '#f4f4f5' }}>
              用户管理
            </Typography.Title>
            <Text type="secondary">仅超级管理员可创建、编辑、删除账号。</Text>
          </div>
          <Button type="primary" icon={<PlusOutlined />} onClick={openCreate}>
            新建用户
          </Button>
        </div>

        <Alert
          type="info"
          showIcon
          message="首个注册用户自动成为超级管理员；之后新用户需由超级管理员在此创建（或将环境变量 ALLOW_PUBLIC_REGISTER 设为 true 开放注册）。"
        />

        <Card bordered={false} style={{ background: 'rgba(255,255,255,0.03)' }}>
          <Table rowKey="id" loading={loading} columns={columns} dataSource={rows} pagination={{ pageSize: 10 }} />
        </Card>
      </Space>

      <Modal
        title={editing ? '编辑用户' : '新建用户'}
        open={modalOpen}
        onCancel={() => !modalSubmitting && setModalOpen(false)}
        onOk={() => void submit()}
        okText="保存"
        confirmLoading={modalSubmitting}
        destroyOnClose
        width={480}
      >
        <Form form={form} layout="vertical" style={{ marginTop: 8 }}>
          {!editing ? (
            <Form.Item name="email" label="邮箱" rules={[{ required: true, type: 'email', message: '请输入有效邮箱' }]}>
              <Input placeholder="name@example.com" />
            </Form.Item>
          ) : (
            <Form.Item label="邮箱">
              <Text>{editing.email}</Text>
            </Form.Item>
          )}
          <Form.Item
            name="password"
            label={editing ? '新密码（留空不修改）' : '密码'}
            rules={
              editing
                ? [
                    {
                      validator: async (_, v: string) => {
                        if (v && v.length < 6) {
                          return Promise.reject(new Error('至少 6 位'));
                        }
                        return Promise.resolve();
                      },
                    },
                  ]
                : [{ required: true, min: 6, message: '至少 6 位' }]
            }
          >
            <Input.Password placeholder={editing ? '不修改请留空' : '至少 6 位'} />
          </Form.Item>
          <Form.Item name="name" label="显示名">
            <Input placeholder="可选" />
          </Form.Item>
          <Form.Item name="role" label="角色" rules={[{ required: true }]}>
            <Select
              options={[
                { value: 'ADMIN', label: '管理员（相册）' },
                { value: 'SUPER_ADMIN', label: '超级管理员（相册 + 用户）' },
              ]}
            />
          </Form.Item>
        </Form>
      </Modal>
    </div>
  );
}
