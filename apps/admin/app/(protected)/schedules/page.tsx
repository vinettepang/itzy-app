'use client';

import { CalendarOutlined, CloudUploadOutlined, DeleteOutlined, FlagOutlined, PlusOutlined, ShopOutlined } from '@ant-design/icons';
import {
  App,
  Button,
  Card,
  DatePicker,
  Form,
  Image,
  Input,
  InputNumber,
  Modal,
  Popconfirm,
  Select,
  Space,
  Spin,
  Switch,
  Table,
  Tabs,
  Tag,
  Typography,
  Upload,
} from 'antd';
import type { ColumnsType } from 'antd/es/table';
import dayjs from 'dayjs';
import { useCallback, useEffect, useMemo, useState } from 'react';
import { apiFetch, resolveMediaUrl } from '@/lib/api';
import countriesCitiesRaw from '@/data/countries-cities.json';

const { Text, Title } = Typography;

type TagRow = { id: string; name: string; sortOrder: number; createdAt: string; updatedAt: string };

type ScheduleTagLink = { tag: TagRow };

type ScheduleVenueBrief = {
  id: string;
  countryName: string;
  city: string;
  venueName: string;
  posterDisplayName: string;
  peopleCount: number | null;
};

type TourCycleBrief = { id: string; title: string };

type ScheduleRow = {
  id: string;
  title: string;
  description: string | null;
  location: string | null;
  coverUrl: string | null;
  startsAt: string;
  endsAt: string | null;
  published: boolean;
  highlighted: boolean;
  comebackOnHome: boolean;
  sortOrder: number;
  venueId: string | null;
  venue: ScheduleVenueBrief | null;
  tourCycleId: string | null;
  tourCycle: TourCycleBrief | null;
  tags: ScheduleTagLink[];
};

type TourCycleRow = {
  id: string;
  title: string;
  remark: string | null;
  sortOrder: number;
  featuredOnHome: boolean;
  createdAt: string;
  updatedAt: string;
  _count?: { schedules: number };
};

type CountryGeo = {
  code: string;
  name: string;
  nameEn?: string;
  cities: { name: string; nameEn?: string }[];
};

const COUNTRIES: CountryGeo[] = countriesCitiesRaw as CountryGeo[];

/** Select 可能返回 string；兼容 labelInValue 等形态，保证写入接口的为场馆 id 或 null */
function normalizeVenueId(raw: unknown): string | null {
  if (raw == null || raw === '') return null;
  if (typeof raw === 'string') {
    const t = raw.trim();
    return t.length ? t : null;
  }
  if (typeof raw === 'number' && Number.isFinite(raw)) return String(raw);
  if (typeof raw === 'object' && raw !== null && 'value' in raw) {
    const v = (raw as { value?: unknown }).value;
    if (typeof v === 'string' && v.trim()) return v.trim();
    if (typeof v === 'number' && Number.isFinite(v)) return String(v);
  }
  return null;
}

type VenueRow = {
  id: string;
  countryCode: string;
  countryName: string;
  city: string;
  venueName: string;
  peopleCount: number | null;
  remark: string | null;
  posterDisplayName: string;
  sortOrder: number;
  createdAt: string;
  updatedAt: string;
};

export default function SchedulesAdminPage() {
  const { message } = App.useApp();
  const [tags, setTags] = useState<TagRow[]>([]);
  const [schedules, setSchedules] = useState<ScheduleRow[]>([]);
  const [loadingTags, setLoadingTags] = useState(true);
  const [loadingSchedules, setLoadingSchedules] = useState(true);
  const [tagModal, setTagModal] = useState(false);
  const [tagSubmitting, setTagSubmitting] = useState(false);
  const [editingTag, setEditingTag] = useState<TagRow | null>(null);
  const [tagForm] = Form.useForm<{ name: string; sortOrder?: number }>();
  const [scheduleModal, setScheduleModal] = useState(false);
  const [scheduleSubmitting, setScheduleSubmitting] = useState(false);
  const [editingSchedule, setEditingSchedule] = useState<ScheduleRow | null>(null);
  const [scheduleForm] = Form.useForm<{
    title: string;
    description?: string;
    location?: string;
    venueId?: string | null;
    startsAt: dayjs.Dayjs;
    endsAt?: dayjs.Dayjs | null;
    published?: boolean;
    highlighted?: boolean;
    comebackOnHome?: boolean;
    tourCycleId?: string | null;
    sortOrder?: number;
    tagIds?: string[];
  }>();
  const [deletingTagId, setDeletingTagId] = useState<string | null>(null);
  const [deletingScheduleId, setDeletingScheduleId] = useState<string | null>(null);
  const [scheduleCoverUploading, setScheduleCoverUploading] = useState(false);
  const [modalScheduleCoverUrl, setModalScheduleCoverUrl] = useState<string | null>(null);

  const [tourCycles, setTourCycles] = useState<TourCycleRow[]>([]);
  const [loadingTourCycles, setLoadingTourCycles] = useState(true);
  const [tourCycleModal, setTourCycleModal] = useState(false);
  const [tourCycleSubmitting, setTourCycleSubmitting] = useState(false);
  const [editingTourCycle, setEditingTourCycle] = useState<TourCycleRow | null>(null);
  const [deletingTourCycleId, setDeletingTourCycleId] = useState<string | null>(null);
  const [tourCycleFeaturingId, setTourCycleFeaturingId] = useState<string | null>(null);
  const [tourCycleForm] = Form.useForm<{
    title: string;
    remark?: string;
    sortOrder?: number;
    featuredOnHome?: boolean;
  }>();

  const [venues, setVenues] = useState<VenueRow[]>([]);
  const [loadingVenues, setLoadingVenues] = useState(true);
  const [venueModal, setVenueModal] = useState(false);
  const [venueSubmitting, setVenueSubmitting] = useState(false);
  const [editingVenue, setEditingVenue] = useState<VenueRow | null>(null);
  const [deletingVenueId, setDeletingVenueId] = useState<string | null>(null);
  const [venueForm] = Form.useForm<{
    countryCode: string;
    city: string;
    venueName: string;
    peopleCount?: number | null;
    posterDisplayName: string;
    remark?: string;
    sortOrder?: number;
  }>();
  const venueCountryCode = Form.useWatch('countryCode', venueForm);

  const loadTags = useCallback(async () => {
    setLoadingTags(true);
    try {
      const res = await apiFetch<TagRow[]>('/api/admin/tags');
      if (res.code !== 0) {
        message.error(res.message || '加载标签失败');
        setTags([]);
        return;
      }
      setTags(res.data ?? []);
    } catch {
      message.error('网络异常，标签加载失败');
      setTags([]);
    } finally {
      setLoadingTags(false);
    }
  }, [message]);

  const loadSchedules = useCallback(async () => {
    setLoadingSchedules(true);
    try {
      const res = await apiFetch<ScheduleRow[]>('/api/admin/schedules');
      if (res.code !== 0) {
        message.error(res.message || '加载行程失败');
        setSchedules([]);
        return;
      }
      setSchedules(res.data ?? []);
    } catch {
      message.error('网络异常，行程加载失败');
      setSchedules([]);
    } finally {
      setLoadingSchedules(false);
    }
  }, [message]);

  const loadTourCycles = useCallback(async () => {
    setLoadingTourCycles(true);
    try {
      const res = await apiFetch<TourCycleRow[]>('/api/admin/tour-cycles');
      if (res.code !== 0) {
        message.error(res.message || '加载演唱会轮次失败');
        setTourCycles([]);
        return;
      }
      setTourCycles(res.data ?? []);
    } catch {
      message.error('网络异常，轮次加载失败');
      setTourCycles([]);
    } finally {
      setLoadingTourCycles(false);
    }
  }, [message]);

  const loadVenues = useCallback(async () => {
    setLoadingVenues(true);
    try {
      const res = await apiFetch<VenueRow[]>('/api/admin/venues');
      if (res.code !== 0) {
        message.error(res.message || '加载场馆失败');
        setVenues([]);
        return;
      }
      setVenues(res.data ?? []);
    } catch {
      message.error('网络异常，场馆加载失败');
      setVenues([]);
    } finally {
      setLoadingVenues(false);
    }
  }, [message]);

  useEffect(() => {
    void loadTags();
    void loadSchedules();
    void loadTourCycles();
    void loadVenues();
  }, [loadTags, loadSchedules, loadTourCycles, loadVenues]);

  const cityOptions = useMemo(() => {
    const c = COUNTRIES.find((x) => x.code === venueCountryCode);
    return (c?.cities ?? []).map((x) => ({ value: x.name, label: x.nameEn ? `${x.name}（${x.nameEn}）` : x.name }));
  }, [venueCountryCode]);

  const venueScheduleOptions = useMemo(
    () =>
      venues.map((v) => ({
        value: v.id,
        label: `${v.posterDisplayName} · ${v.city} · ${v.countryName}`,
      })),
    [venues],
  );

  const openTagCreate = () => {
    setEditingTag(null);
    tagForm.resetFields();
    tagForm.setFieldsValue({ name: '', sortOrder: tags.length });
    setTagModal(true);
  };

  const openTagEdit = (t: TagRow) => {
    setEditingTag(t);
    tagForm.setFieldsValue({ name: t.name, sortOrder: t.sortOrder });
    setTagModal(true);
  };

  const submitTag = async (): Promise<void> => {
    let v: { name: string; sortOrder?: number };
    try {
      v = await tagForm.validateFields();
    } catch {
      return Promise.reject(new Error('validation'));
    }
    setTagSubmitting(true);
    try {
      const rawSo = v.sortOrder as unknown;
      const sortNum =
        rawSo === undefined || rawSo === '' || rawSo === null ? undefined : Number(rawSo);
      const tagBody: { name: string; sortOrder?: number } = { name: v.name };
      if (sortNum !== undefined && !Number.isNaN(sortNum)) {
        tagBody.sortOrder = sortNum;
      }
      if (editingTag) {
        const res = await apiFetch<TagRow>(`/api/admin/tags/${editingTag.id}`, {
          method: 'PUT',
          body: JSON.stringify(tagBody),
        });
        if (res.code !== 0) {
          message.error(res.message || '更新失败');
          return Promise.reject(new Error('api'));
        }
        message.success('标签已更新');
      } else {
        const res = await apiFetch<TagRow>('/api/admin/tags', {
          method: 'POST',
          body: JSON.stringify(tagBody),
        });
        if (res.code !== 0) {
          message.error(res.message || '创建失败');
          return Promise.reject(new Error('api'));
        }
        message.success('标签已创建');
      }
      setTagModal(false);
      await loadTags();
    } catch {
      message.error('网络异常');
      return Promise.reject(new Error('net'));
    } finally {
      setTagSubmitting(false);
    }
  };

  const removeTag = async (id: string) => {
    setDeletingTagId(id);
    try {
      const res = await apiFetch<boolean>(`/api/admin/tags/${id}`, { method: 'DELETE' });
      if (res.code !== 0) {
        message.error(res.message || '删除失败');
        return Promise.reject(new Error('api'));
      }
      message.success('已删除标签');
      await loadTags();
    } catch {
      message.error('网络异常');
      return Promise.reject(new Error('net'));
    } finally {
      setDeletingTagId(null);
    }
  };

  const openScheduleCreate = () => {
    setEditingSchedule(null);
    setModalScheduleCoverUrl(null);
    scheduleForm.resetFields();
    scheduleForm.setFieldsValue({
      title: '',
      description: '',
      location: '',
      venueId: undefined,
      startsAt: dayjs(),
      endsAt: null,
      published: false,
      highlighted: false,
      comebackOnHome: false,
      tourCycleId: undefined,
      sortOrder: 0,
      tagIds: [],
    });
    setScheduleModal(true);
  };

  const openScheduleEdit = (s: ScheduleRow) => {
    setEditingSchedule(s);
    setModalScheduleCoverUrl(s.coverUrl ?? null);
    const start = dayjs(s.startsAt);
    const end = s.endsAt ? dayjs(s.endsAt) : null;
    scheduleForm.setFieldsValue({
      title: s.title,
      description: s.description ?? '',
      location: s.location ?? '',
      venueId: s.venueId ?? undefined,
      startsAt: start.isValid() ? start : dayjs(),
      endsAt: end && end.isValid() ? end : null,
      published: s.published,
      highlighted: s.highlighted,
      comebackOnHome: s.comebackOnHome,
      tourCycleId: s.tourCycleId ?? undefined,
      sortOrder: s.sortOrder,
      tagIds: s.tags.map((x) => x.tag.id),
    });
    setScheduleModal(true);
  };

  const submitSchedule = async (): Promise<void> => {
    let v: {
      title: string;
      description?: string;
      location?: string;
      venueId?: string | null;
      startsAt: dayjs.Dayjs;
      endsAt?: dayjs.Dayjs | null;
      published?: boolean;
      highlighted?: boolean;
      comebackOnHome?: boolean;
      tourCycleId?: string | null;
      sortOrder?: number;
      tagIds?: string[];
    };
    try {
      v = await scheduleForm.validateFields();
    } catch {
      return Promise.reject(new Error('validation'));
    }
    if (!v.startsAt || typeof v.startsAt.isValid !== 'function' || !v.startsAt.isValid()) {
      message.error('开始时间无效，请在时间选择器里重新选择日期与时间');
      return Promise.reject(new Error('startsAt'));
    }
    if (v.endsAt && (typeof v.endsAt.isValid !== 'function' || !v.endsAt.isValid())) {
      message.error('结束时间无效，请清空后重选或修正结束时间');
      return Promise.reject(new Error('endsAt'));
    }
    setScheduleSubmitting(true);
    const rawSch = v.sortOrder as unknown;
    const sortOrderNum = rawSch === undefined || rawSch === '' || rawSch === null ? 0 : Number(rawSch);
    const body = {
      title: v.title,
      description: v.description || null,
      location: v.location || null,
      venueId: normalizeVenueId(v.venueId),
      startsAt: v.startsAt.toISOString(),
      endsAt: v.endsAt && v.endsAt.isValid() ? v.endsAt.toISOString() : null,
      published: v.published ?? false,
      highlighted: v.highlighted ?? false,
      comebackOnHome: v.comebackOnHome ?? false,
      tourCycleId: normalizeVenueId(v.tourCycleId),
      sortOrder: Number.isNaN(sortOrderNum) ? 0 : sortOrderNum,
      tagIds: v.tagIds ?? [],
    };
    try {
      if (editingSchedule) {
        const res = await apiFetch<ScheduleRow>(`/api/admin/schedules/${editingSchedule.id}`, {
          method: 'PUT',
          body: JSON.stringify(body),
        });
        if (res.code !== 0) {
          message.error(res.message || '更新失败');
          return Promise.reject(new Error('api'));
        }
        message.success('行程已更新');
      } else {
        const res = await apiFetch<ScheduleRow>('/api/admin/schedules', {
          method: 'POST',
          body: JSON.stringify(body),
        });
        if (res.code !== 0) {
          message.error(res.message || '创建失败');
          return Promise.reject(new Error('api'));
        }
        message.success('行程已创建');
      }
      setScheduleModal(false);
      await loadSchedules();
      await loadTourCycles();
    } catch {
      message.error('网络异常');
      return Promise.reject(new Error('net'));
    } finally {
      setScheduleSubmitting(false);
    }
  };

  const uploadScheduleCover = async (file: File) => {
    if (!editingSchedule) return;
    setScheduleCoverUploading(true);
    try {
      const fd = new FormData();
      fd.append('file', file);
      const res = await apiFetch<ScheduleRow>(`/api/admin/schedules/${editingSchedule.id}/cover`, {
        method: 'POST',
        body: fd,
      });
      if (res.code !== 0) {
        message.error(res.message || '上传失败');
        return;
      }
      message.success('封面已更新');
      const url = res.data?.coverUrl ?? null;
      setModalScheduleCoverUrl(url);
      setEditingSchedule((prev) => (prev && prev.id === editingSchedule.id ? { ...prev, coverUrl: url } : prev));
      await loadSchedules();
    } catch {
      message.error('网络异常，上传失败');
    } finally {
      setScheduleCoverUploading(false);
    }
  };

  const clearScheduleCover = async () => {
    if (!editingSchedule) return;
    setScheduleCoverUploading(true);
    try {
      const res = await apiFetch<ScheduleRow>(`/api/admin/schedules/${editingSchedule.id}`, {
        method: 'PUT',
        body: JSON.stringify({ coverUrl: null }),
      });
      if (res.code !== 0) {
        message.error(res.message || '清除失败');
        return;
      }
      message.success('已清除封面');
      setModalScheduleCoverUrl(null);
      setEditingSchedule((prev) => (prev && prev.id === editingSchedule.id ? { ...prev, coverUrl: null } : prev));
      await loadSchedules();
    } catch {
      message.error('网络异常');
    } finally {
      setScheduleCoverUploading(false);
    }
  };

  const removeSchedule = async (id: string) => {
    setDeletingScheduleId(id);
    try {
      const res = await apiFetch<boolean>(`/api/admin/schedules/${id}`, { method: 'DELETE' });
      if (res.code !== 0) {
        message.error(res.message || '删除失败');
        return Promise.reject(new Error('api'));
      }
      message.success('已删除行程');
      await loadSchedules();
      await loadTourCycles();
    } catch {
      message.error('网络异常');
      return Promise.reject(new Error('net'));
    } finally {
      setDeletingScheduleId(null);
    }
  };

  const openVenueCreate = () => {
    setEditingVenue(null);
    venueForm.resetFields();
    const first = COUNTRIES[0];
    venueForm.setFieldsValue({
      countryCode: first?.code ?? '',
      city: first?.cities[0]?.name ?? '',
      venueName: '',
      peopleCount: null,
      posterDisplayName: '',
      remark: '',
      sortOrder: 0,
    });
    setVenueModal(true);
  };

  const openVenueEdit = (v: VenueRow) => {
    setEditingVenue(v);
    venueForm.setFieldsValue({
      countryCode: v.countryCode,
      city: v.city,
      venueName: v.venueName,
      posterDisplayName: v.posterDisplayName,
      remark: v.remark ?? '',
      sortOrder: v.sortOrder,
    });
    setVenueModal(true);
  };

  const submitVenue = async (): Promise<void> => {
    let v: {
      countryCode: string;
      city: string;
      venueName: string;
      peopleCount?: number | null;
      posterDisplayName: string;
      remark?: string;
      sortOrder?: number;
    };
    try {
      v = await venueForm.validateFields();
    } catch {
      return Promise.reject(new Error('validation'));
    }
    const country = COUNTRIES.find((c) => c.code === v.countryCode);
    if (!country) {
      message.error('请选择有效国家');
      return Promise.reject(new Error('country'));
    }
    const rawSo = v.sortOrder as unknown;
    const sortOrderNum = rawSo === undefined || rawSo === '' || rawSo === null ? 0 : Number(rawSo);
    const body = {
      countryCode: v.countryCode,
      countryName: country.name,
      city: v.city,
      venueName: v.venueName,
      peopleCount: v.peopleCount === undefined || v.peopleCount === null ? null : v.peopleCount,
      posterDisplayName: v.posterDisplayName,
      remark: (v.remark || '').trim() || null,
      sortOrder: Number.isNaN(sortOrderNum) ? 0 : sortOrderNum,
    };
    setVenueSubmitting(true);
    try {
      if (editingVenue) {
        const res = await apiFetch<VenueRow>(`/api/admin/venues/${editingVenue.id}`, {
          method: 'PUT',
          body: JSON.stringify(body),
        });
        if (res.code !== 0) {
          message.error(res.message || '更新失败');
          return Promise.reject(new Error('api'));
        }
        message.success('场馆已更新');
      } else {
        const res = await apiFetch<VenueRow>('/api/admin/venues', {
          method: 'POST',
          body: JSON.stringify(body),
        });
        if (res.code !== 0) {
          message.error(res.message || '创建失败');
          return Promise.reject(new Error('api'));
        }
        message.success('场馆已添加');
      }
      setVenueModal(false);
      await loadVenues();
    } catch {
      message.error('网络异常');
      return Promise.reject(new Error('net'));
    } finally {
      setVenueSubmitting(false);
    }
  };

  const tourCycleOptions = useMemo(
    () => tourCycles.map((c) => ({ value: c.id, label: c.title })),
    [tourCycles],
  );

  const openTourCycleCreate = () => {
    setEditingTourCycle(null);
    tourCycleForm.resetFields();
    tourCycleForm.setFieldsValue({
      title: '',
      remark: '',
      sortOrder: 0,
      featuredOnHome: false,
    });
    setTourCycleModal(true);
  };

  const openTourCycleEdit = (r: TourCycleRow) => {
    setEditingTourCycle(r);
    tourCycleForm.setFieldsValue({
      title: r.title,
      remark: r.remark ?? '',
      sortOrder: r.sortOrder,
      featuredOnHome: r.featuredOnHome,
    });
    setTourCycleModal(true);
  };

  const submitTourCycle = async (): Promise<void> => {
    let v: { title: string; remark?: string; sortOrder?: number; featuredOnHome?: boolean };
    try {
      v = await tourCycleForm.validateFields();
    } catch {
      return Promise.reject(new Error('validation'));
    }
    const rawSo = v.sortOrder as unknown;
    const sortOrderNum = rawSo === undefined || rawSo === '' || rawSo === null ? 0 : Number(rawSo);
    const body = {
      title: v.title,
      remark: v.remark?.trim() ? v.remark.trim() : null,
      sortOrder: Number.isNaN(sortOrderNum) ? 0 : sortOrderNum,
      featuredOnHome: v.featuredOnHome ?? false,
    };
    setTourCycleSubmitting(true);
    try {
      if (editingTourCycle) {
        const res = await apiFetch<TourCycleRow>(`/api/admin/tour-cycles/${editingTourCycle.id}`, {
          method: 'PUT',
          body: JSON.stringify(body),
        });
        if (res.code !== 0) {
          message.error(res.message || '更新失败');
          return Promise.reject(new Error('api'));
        }
        message.success('轮次已更新');
      } else {
        const res = await apiFetch<TourCycleRow>('/api/admin/tour-cycles', {
          method: 'POST',
          body: JSON.stringify(body),
        });
        if (res.code !== 0) {
          message.error(res.message || '创建失败');
          return Promise.reject(new Error('api'));
        }
        message.success('轮次已创建');
      }
      setTourCycleModal(false);
      await loadTourCycles();
    } catch {
      message.error('网络异常');
      return Promise.reject(new Error('net'));
    } finally {
      setTourCycleSubmitting(false);
    }
  };

  const removeTourCycle = async (id: string) => {
    setDeletingTourCycleId(id);
    try {
      const res = await apiFetch<boolean>(`/api/admin/tour-cycles/${id}`, { method: 'DELETE' });
      if (res.code !== 0) {
        message.error(res.message || '删除失败');
        return Promise.reject(new Error('api'));
      }
      message.success('已删除轮次');
      await loadTourCycles();
    } catch {
      message.error('网络异常');
      return Promise.reject(new Error('net'));
    } finally {
      setDeletingTourCycleId(null);
    }
  };

  const setTourCycleFeatured = async (id: string, on: boolean) => {
    setTourCycleFeaturingId(id);
    try {
      const res = await apiFetch<TourCycleRow>(`/api/admin/tour-cycles/${id}`, {
        method: 'PUT',
        body: JSON.stringify({ featuredOnHome: on }),
      });
      if (res.code !== 0) {
        message.error(res.message || '更新失败');
        return;
      }
      message.success(on ? '已设为首页展示轮次' : '已取消首页展示');
      await loadTourCycles();
    } catch {
      message.error('网络异常');
    } finally {
      setTourCycleFeaturingId(null);
    }
  };

  const removeVenue = async (id: string) => {
    setDeletingVenueId(id);
    try {
      const res = await apiFetch<boolean>(`/api/admin/venues/${id}`, { method: 'DELETE' });
      if (res.code !== 0) {
        message.error(res.message || '删除失败');
        return Promise.reject(new Error('api'));
      }
      message.success('已删除场馆');
      await loadVenues();
    } catch {
      message.error('网络异常');
      return Promise.reject(new Error('net'));
    } finally {
      setDeletingVenueId(null);
    }
  };

  const tourCycleColumns: ColumnsType<TourCycleRow> = [
    { title: '轮次名称', dataIndex: 'title', key: 'title', ellipsis: true },
    { title: '备注', dataIndex: 'remark', key: 'remark', ellipsis: true, render: (t: string | null) => t || '—' },
    {
      title: '绑定行程',
      key: 'cnt',
      width: 100,
      render: (_, r) => r._count?.schedules ?? 0,
    },
    { title: '排序', dataIndex: 'sortOrder', key: 'sortOrder', width: 80 },
    {
      title: '首页展示',
      key: 'feat',
      width: 120,
      render: (_, r) => (
        <Switch
          checked={r.featuredOnHome}
          loading={tourCycleFeaturingId === r.id}
          onChange={(on) => void setTourCycleFeatured(r.id, on)}
        />
      ),
    },
    {
      title: '操作',
      key: 'tact',
      width: 180,
      render: (_, r) => (
        <Space>
          <Button type="link" size="small" onClick={() => openTourCycleEdit(r)} disabled={deletingTourCycleId !== null}>
            编辑
          </Button>
          <Popconfirm title="删除该轮次？行程上的所属轮次会被清空。" onConfirm={() => removeTourCycle(r.id)}>
            <Button
              type="link"
              size="small"
              danger
              icon={<DeleteOutlined />}
              loading={deletingTourCycleId === r.id}
              disabled={deletingTourCycleId !== null && deletingTourCycleId !== r.id}
            >
              删除
            </Button>
          </Popconfirm>
        </Space>
      ),
    },
  ];

  const tagColumns: ColumnsType<TagRow> = [
    { title: '名称', dataIndex: 'name', key: 'name' },
    { title: '排序', dataIndex: 'sortOrder', key: 'sortOrder', width: 100 },
    {
      title: '操作',
      key: 'a',
      width: 180,
      render: (_, t) => (
        <Space>
          <Button type="link" size="small" onClick={() => openTagEdit(t)} disabled={deletingTagId !== null}>
            编辑
          </Button>
          <Popconfirm title="删除该标签？已从行程上解除关联。" onConfirm={() => removeTag(t.id)}>
            <Button
              type="link"
              size="small"
              danger
              icon={<DeleteOutlined />}
              loading={deletingTagId === t.id}
              disabled={deletingTagId !== null && deletingTagId !== t.id}
            >
              删除
            </Button>
          </Popconfirm>
        </Space>
      ),
    },
  ];

  const scheduleColumns: ColumnsType<ScheduleRow> = [
    {
      title: '封面',
      key: 'cover',
      width: 72,
      render: (_, s) =>
        s.coverUrl ? (
          <Image
            src={resolveMediaUrl(s.coverUrl)}
            alt=""
            width={48}
            height={48}
            style={{ objectFit: 'cover', borderRadius: 6 }}
            preview={{ mask: '预览' }}
          />
        ) : (
          <Text type="secondary">—</Text>
        ),
    },
    { title: '标题', dataIndex: 'title', key: 'title', ellipsis: true, width: 200 },
    { title: '地点', dataIndex: 'location', key: 'location', ellipsis: true, render: (l) => l || '—' },
    {
      title: '场馆',
      key: 'venue',
      width: 160,
      ellipsis: true,
      render: (_, s) =>
        s.venue ? (
          <Text ellipsis title={s.venue.posterDisplayName}>
            {s.venue.posterDisplayName}
          </Text>
        ) : (
          <Text type="secondary">—</Text>
        ),
    },
    {
      title: '演唱会轮次',
      key: 'tourCycle',
      width: 130,
      ellipsis: true,
      render: (_, s) =>
        s.tourCycle ? (
          <Text ellipsis title={s.tourCycle.title}>
            {s.tourCycle.title}
          </Text>
        ) : (
          <Text type="secondary">—</Text>
        ),
    },
    {
      title: '开始',
      dataIndex: 'startsAt',
      key: 'startsAt',
      width: 170,
      render: (t: string) => dayjs(t).format('YYYY-MM-DD HH:mm'),
    },
    {
      title: '标签',
      key: 'tags',
      render: (_, s) => (
        <Space size={[4, 4]} wrap>
          {s.tags.length ? (
            s.tags.map((x) => (
              <Tag key={x.tag.id} color="blue">
                {x.tag.name}
              </Tag>
            ))
          ) : (
            <Text type="secondary">—</Text>
          )}
        </Space>
      ),
    },
    {
      title: '发布',
      dataIndex: 'published',
      key: 'published',
      width: 80,
      render: (p: boolean) => (p ? <Tag color="success">是</Tag> : <Tag>否</Tag>),
    },
    {
      title: '首页精选',
      dataIndex: 'highlighted',
      key: 'highlighted',
      width: 100,
      render: (h: boolean) => (h ? <Tag color="purple">是</Tag> : <Tag>否</Tag>),
    },
    {
      title: '回归日程',
      dataIndex: 'comebackOnHome',
      key: 'comebackOnHome',
      width: 100,
      render: (c: boolean) => (c ? <Tag color="magenta">是</Tag> : <Tag>否</Tag>),
    },
    {
      title: '操作',
      key: 'act',
      width: 180,
      render: (_, s) => (
        <Space>
          <Button type="link" size="small" onClick={() => openScheduleEdit(s)} disabled={deletingScheduleId !== null}>
            编辑
          </Button>
          <Popconfirm title="确定删除该行程？" onConfirm={() => removeSchedule(s.id)}>
            <Button
              type="link"
              size="small"
              danger
              icon={<DeleteOutlined />}
              loading={deletingScheduleId === s.id}
              disabled={deletingScheduleId !== null && deletingScheduleId !== s.id}
            >
              删除
            </Button>
          </Popconfirm>
        </Space>
      ),
    },
  ];

  const venueColumns: ColumnsType<VenueRow> = [
    { title: '国家', dataIndex: 'countryName', key: 'countryName', width: 100, render: (_, r) => `${r.countryName}（${r.countryCode}）` },
    { title: '城市', dataIndex: 'city', key: 'city', width: 100 },
    { title: '场馆名', dataIndex: 'venueName', key: 'venueName', ellipsis: true },
    {
      title: '人数',
      dataIndex: 'peopleCount',
      key: 'peopleCount',
      width: 80,
      render: (n: number | null) => (n === null || n === undefined ? '—' : n),
    },
    { title: '海报显示名', dataIndex: 'posterDisplayName', key: 'posterDisplayName', ellipsis: true },
    { title: '备注', dataIndex: 'remark', key: 'remark', ellipsis: true, render: (t: string | null) => t || '—' },
    { title: '排序', dataIndex: 'sortOrder', key: 'sortOrder', width: 72 },
    {
      title: '操作',
      key: 'vact',
      width: 160,
      render: (_, v) => (
        <Space>
          <Button type="link" size="small" onClick={() => openVenueEdit(v)} disabled={deletingVenueId !== null}>
            编辑
          </Button>
          <Popconfirm title="确定删除该场馆？" onConfirm={() => removeVenue(v.id)}>
            <Button
              type="link"
              size="small"
              danger
              icon={<DeleteOutlined />}
              loading={deletingVenueId === v.id}
              disabled={deletingVenueId !== null && deletingVenueId !== v.id}
            >
              删除
            </Button>
          </Popconfirm>
        </Space>
      ),
    },
  ];

  return (
    <div style={{ padding: '24px 20px 48px', maxWidth: 1100, margin: '0 auto' }}>
      <Space direction="vertical" size="large" style={{ width: '100%' }}>
        <div>
          <Title level={4} style={{ margin: 0, color: '#f4f4f5' }}>
            <CalendarOutlined style={{ marginRight: 8 }} />
            行程管理
          </Title>
          <Text type="secondary">
            维护行程、标签、演唱会轮次与场馆；发布后小程序「全部行程」可见。「首页精选」「回归日程」为首页独立区块；「演唱会轮次」Tab
            中勾选「首页展示」的轮次，将驱动小程序首页「演唱会周期行程」显示该轮次下已发布且时间上最近的一场（优先未开始场次）。国家/城市来自{' '}
            <Text code>data/countries-cities.json</Text>。
          </Text>
        </div>

        <Tabs
          items={[
            {
              key: 'schedules',
              label: '行程列表',
              children: (
                <Card
                  bordered={false}
                  style={{ background: 'rgba(255,255,255,0.03)' }}
                  extra={
                    <Button type="primary" icon={<PlusOutlined />} onClick={openScheduleCreate}>
                      新建行程
                    </Button>
                  }
                >
                  <Spin spinning={loadingSchedules}>
                    <Table rowKey="id" columns={scheduleColumns} dataSource={schedules} pagination={{ pageSize: 8 }} />
                  </Spin>
                </Card>
              ),
            },
            {
              key: 'tour-cycles',
              label: (
                <span>
                  <FlagOutlined style={{ marginRight: 6 }} />
                  演唱会轮次
                </span>
              ),
              children: (
                <Card
                  bordered={false}
                  style={{ background: 'rgba(255,255,255,0.03)' }}
                  extra={
                    <Button type="primary" icon={<PlusOutlined />} onClick={openTourCycleCreate}>
                      新建轮次
                    </Button>
                  }
                >
                  <Spin spinning={loadingTourCycles}>
                    <Table rowKey="id" columns={tourCycleColumns} dataSource={tourCycles} pagination={{ pageSize: 10 }} />
                  </Spin>
                </Card>
              ),
            },
            {
              key: 'tags',
              label: '标签分类',
              children: (
                <Card
                  bordered={false}
                  style={{ background: 'rgba(255,255,255,0.03)' }}
                  extra={
                    <Button type="primary" icon={<PlusOutlined />} onClick={openTagCreate}>
                      新建标签
                    </Button>
                  }
                >
                  <Spin spinning={loadingTags}>
                    <Table rowKey="id" columns={tagColumns} dataSource={tags} pagination={{ pageSize: 10 }} />
                  </Spin>
                </Card>
              ),
            },
            {
              key: 'venues',
              label: (
                <span>
                  <ShopOutlined style={{ marginRight: 6 }} />
                  场馆列表
                </span>
              ),
              children: (
                <Card
                  bordered={false}
                  style={{ background: 'rgba(255,255,255,0.03)' }}
                  extra={
                    <Button type="primary" icon={<PlusOutlined />} onClick={openVenueCreate}>
                      新建场馆
                    </Button>
                  }
                >
                  <Spin spinning={loadingVenues}>
                    <Table rowKey="id" columns={venueColumns} dataSource={venues} pagination={{ pageSize: 10 }} />
                  </Spin>
                </Card>
              ),
            },
          ]}
        />
      </Space>

      <Modal
        title={editingTag ? '编辑标签' : '新建标签'}
        open={tagModal}
        onCancel={() => !tagSubmitting && setTagModal(false)}
        onOk={() => submitTag()}
        confirmLoading={tagSubmitting}
        destroyOnClose
      >
        <Form form={tagForm} layout="vertical" style={{ marginTop: 8 }}>
          <Form.Item name="name" label="标签名称" rules={[{ required: true, message: '请输入名称' }]}>
            <Input placeholder="如：演唱会、签售" />
          </Form.Item>
          <Form.Item name="sortOrder" label="排序（数字越小越靠前）">
            <Input type="number" placeholder="0" />
          </Form.Item>
        </Form>
      </Modal>

      <Modal
        title={editingSchedule ? '编辑行程' : '新建行程'}
        open={scheduleModal}
        onCancel={() => !scheduleSubmitting && !scheduleCoverUploading && setScheduleModal(false)}
        onOk={() => submitSchedule()}
        confirmLoading={scheduleSubmitting}
        okButtonProps={{ disabled: scheduleCoverUploading }}
        destroyOnClose
        width={600}
      >
        <Form form={scheduleForm} layout="vertical" style={{ marginTop: 8 }}>
          <Form.Item name="title" label="标题" rules={[{ required: true, message: '必填' }]}>
            <Input placeholder="行程标题" />
          </Form.Item>
          {editingSchedule ? (
            <div style={{ marginBottom: 16 }}>
              <Text type="secondary" style={{ display: 'block', marginBottom: 8 }}>
                封面图
              </Text>
              {modalScheduleCoverUrl ? (
                <Image
                  src={resolveMediaUrl(modalScheduleCoverUrl)}
                  alt=""
                  width={140}
                  height={140}
                  style={{ objectFit: 'cover', borderRadius: 8, display: 'block' }}
                  preview
                />
              ) : (
                <Text type="secondary">暂无封面</Text>
              )}
              <Space style={{ marginTop: 10 }} wrap>
                <Upload
                  accept="image/*"
                  showUploadList={false}
                  disabled={scheduleCoverUploading}
                  beforeUpload={async (file) => {
                    await uploadScheduleCover(file as File);
                    return false;
                  }}
                >
                  <Button type="default" icon={<CloudUploadOutlined />} loading={scheduleCoverUploading}>
                    上传封面
                  </Button>
                </Upload>
                {modalScheduleCoverUrl ? (
                  <Button danger type="link" disabled={scheduleCoverUploading} onClick={() => void clearScheduleCover()}>
                    清除封面
                  </Button>
                ) : null}
              </Space>
            </div>
          ) : (
            <Text type="secondary" style={{ display: 'block', marginBottom: 16 }}>
              保存行程后可上传封面图。
            </Text>
          )}
          <Form.Item name="description" label="说明">
            <Input.TextArea rows={3} placeholder="可选" />
          </Form.Item>
          <Form.Item name="location" label="地点">
            <Input placeholder="可选" />
          </Form.Item>
          <Form.Item name="venueId" label="关联场馆">
            <Select
              allowClear
              showSearch
              optionFilterProp="label"
              loading={loadingVenues}
              placeholder="可选，从场馆列表选择"
              options={venueScheduleOptions}
            />
          </Form.Item>
          <Form.Item name="tourCycleId" label="演唱会轮次（可选）">
            <Select
              allowClear
              showSearch
              optionFilterProp="label"
              loading={loadingTourCycles}
              placeholder="归属某一轮巡回，用于首页「演唱会周期」最近一场"
              options={tourCycleOptions}
            />
          </Form.Item>
          <Form.Item name="startsAt" label="开始时间" rules={[{ required: true, message: '必选' }]}>
            <DatePicker showTime style={{ width: '100%' }} format="YYYY-MM-DD HH:mm" />
          </Form.Item>
          <Form.Item name="endsAt" label="结束时间（可选）">
            <DatePicker showTime style={{ width: '100%' }} format="YYYY-MM-DD HH:mm" />
          </Form.Item>
          <Form.Item name="tagIds" label="标签">
            <Select
              mode="multiple"
              allowClear
              placeholder="选择分类标签"
              options={tags.map((t) => ({ value: t.id, label: t.name }))}
            />
          </Form.Item>
          <Form.Item name="published" label="发布到小程序" valuePropName="checked">
            <Switch />
          </Form.Item>
          <Form.Item
            name="highlighted"
            label="首页精选"
            valuePropName="checked"
            extra="开启后出现在小程序首页「行程精选」中的精选区（非当日）；与「回归日程」开关无关。"
          >
            <Switch />
          </Form.Item>
          <Form.Item
            name="comebackOnHome"
            label="回归日程"
            valuePropName="checked"
            extra="开启后出现在小程序首页第二行「回归日程」横条，与首页精选、当日行程无关联。"
          >
            <Switch />
          </Form.Item>
          <Form.Item name="sortOrder" label="排序">
            <Input type="number" placeholder="0" />
          </Form.Item>
        </Form>
      </Modal>

      <Modal
        title={editingTourCycle ? '编辑演唱会轮次' : '新建演唱会轮次'}
        open={tourCycleModal}
        onCancel={() => !tourCycleSubmitting && setTourCycleModal(false)}
        onOk={() => submitTourCycle()}
        confirmLoading={tourCycleSubmitting}
        destroyOnClose
        width={520}
      >
        <Form form={tourCycleForm} layout="vertical" style={{ marginTop: 8 }}>
          <Form.Item name="title" label="轮次名称" rules={[{ required: true, message: '必填' }]}>
            <Input placeholder="如：BORN TO BE 世巡" />
          </Form.Item>
          <Form.Item name="remark" label="备注">
            <Input.TextArea rows={2} placeholder="可选" />
          </Form.Item>
          <Form.Item name="sortOrder" label="排序">
            <Input type="number" placeholder="0" />
          </Form.Item>
          <Form.Item
            name="featuredOnHome"
            label="首页展示此轮次"
            valuePropName="checked"
            extra="开启后小程序首页「演唱会周期行程」只认此轮次；同时只会有一条轮次为开启（保存时会自动关闭其它轮次）。"
          >
            <Switch />
          </Form.Item>
        </Form>
      </Modal>

      <Modal
        title={editingVenue ? '编辑场馆' : '新建场馆'}
        open={venueModal}
        onCancel={() => !venueSubmitting && setVenueModal(false)}
        onOk={() => submitVenue()}
        confirmLoading={venueSubmitting}
        destroyOnClose
        width={560}
      >
        <Form form={venueForm} layout="vertical" style={{ marginTop: 8 }}>
          <Form.Item name="countryCode" label="国家" rules={[{ required: true, message: '请选择国家' }]}>
            <Select
              showSearch
              optionFilterProp="label"
              options={COUNTRIES.map((c) => ({
                value: c.code,
                label: `${c.name}（${c.code}）`,
              }))}
              onChange={(code) => {
                const row = COUNTRIES.find((x) => x.code === code);
                venueForm.setFieldsValue({ city: row?.cities[0]?.name ?? '' });
              }}
            />
          </Form.Item>
          <Form.Item name="city" label="城市" rules={[{ required: true, message: '请选择城市' }]}>
            <Select showSearch optionFilterProp="label" options={cityOptions} placeholder="先选国家" />
          </Form.Item>
          <Form.Item name="venueName" label="场馆名" rules={[{ required: true, message: '请输入场馆名' }]}>
            <Input placeholder="如：KSPO DOME" />
          </Form.Item>
          <Form.Item
            name="peopleCount"
            label="人数"
            extra="可选：参考容纳人数或规模，须为非负整数。"
            rules={[
              {
                validator: async (_, value) => {
                  if (value === null || value === undefined || value === '') return;
                  const n = Number(value);
                  if (!Number.isInteger(n) || n < 0) throw new Error('须为非负整数');
                },
              },
            ]}
          >
            <InputNumber min={0} precision={0} style={{ width: '100%' }} placeholder="留空" />
          </Form.Item>
          <Form.Item
            name="posterDisplayName"
            label="海报显示名"
            rules={[{ required: true, message: '请输入海报上展示的名称' }]}
            extra="可写简短文案，供海报/行程引用。"
          >
            <Input placeholder="如：首尔 KSPO DOME" />
          </Form.Item>
          <Form.Item name="remark" label="备注">
            <Input.TextArea rows={2} placeholder="可选" />
          </Form.Item>
          <Form.Item name="sortOrder" label="排序">
            <Input type="number" placeholder="0" />
          </Form.Item>
        </Form>
      </Modal>
    </div>
  );
}
