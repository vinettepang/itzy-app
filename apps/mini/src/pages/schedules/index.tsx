import { View, Text, ScrollView, Image } from '@tarojs/components';
import Taro, { useDidShow } from '@tarojs/taro';
import { useCallback, useState } from 'react';
import { request, resolveMediaUrl } from '@/services/request';
import './index.scss';

type Tag = { id: string; name: string };
type ScheduleTagLink = { tag: Tag };
type ScheduleVenueBrief = {
  id: string;
  posterDisplayName: string;
  city: string;
  countryName: string;
};
type Schedule = {
  id: string;
  title: string;
  description: string | null;
  location: string | null;
  coverUrl?: string | null;
  startsAt: string;
  endsAt: string | null;
  published: boolean;
  highlighted?: boolean;
  venue?: ScheduleVenueBrief | null;
  tags: ScheduleTagLink[];
};

export default function SchedulesPage() {
  const [list, setList] = useState<Schedule[]>([]);
  const [loading, setLoading] = useState(true);
  const [err, setErr] = useState<string | null>(null);

  const load = useCallback(async () => {
    setLoading(true);
    setErr(null);
    try {
      const res = await request<Schedule[]>({ url: '/api/schedules' });
      if (res.code !== 0) {
        setErr(res.message || '加载失败');
        setList([]);
        return;
      }
      setList(res.data ?? []);
    } catch (e) {
      setErr(e instanceof Error ? e.message : String(e));
      setList([]);
    } finally {
      setLoading(false);
    }
  }, []);

  useDidShow(() => {
    void load();
  });

  return (
    <ScrollView scrollY className="schedules-page">
      <View className="schedules-back" onClick={() => void Taro.navigateTo({ url: '/pages/gallery/index' })}>
        <Text className="schedules-back-text">‹ 首页</Text>
      </View>
      <View className="schedules-header">
        <Text className="schedules-header-title">全部行程</Text>
        <Text className="schedules-header-sub">以下为已发布行程；首页「近期/精选」为子集。</Text>
      </View>
      {loading ? (
        <Text className="schedules-muted">加载中…</Text>
      ) : err ? (
        <Text className="schedules-err">{err}</Text>
      ) : list.length === 0 ? (
        <Text className="schedules-muted">暂无已发布行程</Text>
      ) : (
        list.map((s) => (
          <View key={s.id} className="schedules-card">
            {s.highlighted ? <Text className="schedules-pick">精选</Text> : null}
            {s.coverUrl ? (
              <Image className="schedules-cover" src={resolveMediaUrl(s.coverUrl)} mode="aspectFill" />
            ) : null}
            <Text className="schedules-title">{s.title}</Text>
            <Text className="schedules-time">
              {new Date(s.startsAt).toLocaleString('zh-CN', {
                year: 'numeric',
                month: '2-digit',
                day: '2-digit',
                hour: '2-digit',
                minute: '2-digit',
              })}
              {s.endsAt ? ` — ${new Date(s.endsAt).toLocaleString('zh-CN', { hour: '2-digit', minute: '2-digit' })}` : ''}
            </Text>
            {s.location ? <Text className="schedules-loc">{s.location}</Text> : null}
            {s.venue ? (
              <Text className="schedules-loc">
                场馆：{s.venue.posterDisplayName}（{s.venue.city}）
              </Text>
            ) : null}
            {s.description ? <Text className="schedules-desc">{s.description}</Text> : null}
            <View className="schedules-tags">
              {s.tags.map((x) => (
                <Text key={x.tag.id} className="schedules-tag">
                  {x.tag.name}
                </Text>
              ))}
            </View>
          </View>
        ))
      )}
    </ScrollView>
  );
}
