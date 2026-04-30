import { useCallback, useState } from 'react';
import { Image, ScrollView, Text, View } from '@tarojs/components';
import Taro, { useDidShow } from '@tarojs/taro';
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
type HomeSchedule = {
  id: string;
  title: string;
  description: string | null;
  location: string | null;
  coverUrl?: string | null;
  startsAt: string;
  highlighted: boolean;
  venue?: ScheduleVenueBrief | null;
  tags: ScheduleTagLink[];
};

type HomeSchedulesPayload = {
  today: HomeSchedule[];
  featured: HomeSchedule[];
  comeback: HomeSchedule[];
  tourSpotlight: HomeSchedule | null;
  tourSpotlightCycleTitle: string | null;
};

type CardSection = 'today' | 'featured' | 'comeback' | 'tour';

/** 门票简笔画：左右圆口 + 中间虚线，与紫色主题一致 */
function PosterTicketIcon({ variant }: { variant: 'card' | 'btn' }) {
  return (
    <View className={`poster-ticket-icon poster-ticket-icon--${variant}`}>
      <View className="poster-ticket-icon__hole poster-ticket-icon__hole--l" />
      <View className="poster-ticket-icon__hole poster-ticket-icon__hole--r" />
      <View className="poster-ticket-icon__dash" />
    </View>
  );
}

function HomeScheduleCardView({ s, section }: { s: HomeSchedule; section: CardSection }) {
  const showFeatured = section === 'featured' || (section === 'today' && s.highlighted);
  const showComebackBadge = section === 'comeback';
  const showTourBadge = section === 'tour';
  const comebackFullPoster = section === 'comeback' && Boolean(s.coverUrl);
  return (
    <View
      className={`home-schedule-card${comebackFullPoster ? ' home-schedule-card--comeback-poster' : ''}`}
    >
      {showFeatured ? <Text className="home-schedule-badge">精选</Text> : null}
      {showComebackBadge ? <Text className="home-schedule-badge home-schedule-badge--comeback">回归</Text> : null}
      {showTourBadge ? <Text className="home-schedule-badge home-schedule-badge--tour">巡演</Text> : null}
      {s.coverUrl ? (
        <Image className="home-schedule-card-cover" src={resolveMediaUrl(s.coverUrl)} mode="aspectFill" />
      ) : null}
      <View className="home-schedule-card-body">
        <Text className="home-schedule-card-title">{s.title}</Text>
        <Text className="home-schedule-card-time">
          {new Date(s.startsAt).toLocaleString('zh-CN', {
            month: 'numeric',
            day: 'numeric',
            hour: '2-digit',
            minute: '2-digit',
          })}
        </Text>
        {s.location ? <Text className="home-schedule-card-loc">{s.location}</Text> : null}
        {s.venue ? (
          <Text className="home-schedule-card-loc">
            {s.venue.posterDisplayName} · {s.venue.city}
          </Text>
        ) : null}
        {section !== 'comeback' ? (
          <View className="home-schedule-card-tags">
            {s.tags.slice(0, 3).map((x) => (
              <Text key={x.tag.id} className="home-schedule-chip">
                {x.tag.name}
              </Text>
            ))}
          </View>
        ) : null}
      </View>
    </View>
  );
}

export default function GalleryIndex() {
  const [homeToday, setHomeToday] = useState<HomeSchedule[]>([]);
  const [homeFeatured, setHomeFeatured] = useState<HomeSchedule[]>([]);
  const [homeComeback, setHomeComeback] = useState<HomeSchedule[]>([]);
  const [tourSpotlight, setTourSpotlight] = useState<HomeSchedule | null>(null);
  const [tourSpotlightCycleTitle, setTourSpotlightCycleTitle] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const load = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const hRes = await request<HomeSchedulesPayload>({ url: '/api/schedules/home?limit=12', method: 'GET' });
      if (hRes.code === 0 && hRes.data && !Array.isArray(hRes.data)) {
        setHomeToday(hRes.data.today ?? []);
        setHomeFeatured(hRes.data.featured ?? []);
        setHomeComeback(hRes.data.comeback ?? []);
        setTourSpotlight(hRes.data.tourSpotlight ?? null);
        setTourSpotlightCycleTitle(hRes.data.tourSpotlightCycleTitle ?? null);
      } else if (hRes.code === 0 && Array.isArray(hRes.data)) {
        setHomeToday([]);
        setHomeFeatured([]);
        setHomeComeback([]);
        setTourSpotlight(null);
        setTourSpotlightCycleTitle(null);
      } else {
        setHomeToday([]);
        setHomeFeatured([]);
        setHomeComeback([]);
        setTourSpotlight(null);
        setTourSpotlightCycleTitle(null);
      }
    } catch (e) {
      setError(e instanceof Error ? e.message : String(e));
      setHomeToday([]);
      setHomeFeatured([]);
      setHomeComeback([]);
      setTourSpotlight(null);
      setTourSpotlightCycleTitle(null);
    } finally {
      setLoading(false);
    }
  }, []);

  useDidShow(() => {
    void load();
  });

  const openAllSchedules = () => {
    void Taro.navigateTo({ url: '/pages/schedules/index' });
  };

  const openPoster = () => {
    void Taro.navigateTo({ url: '/pages/poster/index' });
  };

  if (loading) {
    return (
      <View className="page page--center">
        <Text className="muted muted--splash">加载中…</Text>
      </View>
    );
  }

  if (error) {
    return (
      <View className="page page--center">
        <Text className="error">{error}</Text>
        <View className="btn btn--primary" onClick={() => void load()}>
          <Text>重试</Text>
        </View>
      </View>
    );
  }

  const hasHomeSchedules =
    homeToday.length > 0 ||
    homeFeatured.length > 0 ||
    homeComeback.length > 0 ||
    tourSpotlight !== null;

  const showFeaturedTier = homeToday.length > 0 || homeFeatured.length > 0;
  const showComebackTier = homeComeback.length > 0;
  const showTourTier = tourSpotlight !== null;

  if (!hasHomeSchedules) {
    return (
      <View className="page page--center">
        <Text className="muted muted--empty">当前没有可展示的行程内容。</Text>
        <View className="btn btn--primary" onClick={openAllSchedules}>
          <Text>查看全部行程</Text>
        </View>
        <Text className="home-schedule-block-title poster-entry-section-title poster-entry-section-title--center">
          一击play
        </Text>
        <View className="btn btn--ghost-accent poster-cta poster-cta--ticket" onClick={openPoster}>
          <PosterTicketIcon variant="btn" />
          <View className="poster-cta-texts">
            <Text>MAKE YOUR TICKET</Text>
            <Text className="poster-cta-sub">制作自己的门票卡吧</Text>
          </View>
        </View>
      </View>
    );
  }

  return (
    <ScrollView scrollY className="page page-scroll">
      <View className="home-schedule-block">
        {/* {!showFeaturedTier && (showComebackTier || showTourTier) ? (
          <View className="home-schedule-floating-more" onClick={openAllSchedules}>
            <Text className="home-schedule-more-text">全部行程</Text>
            <Text className="home-schedule-more-arrow">›</Text>
          </View>
        ) : null} */}

        {showFeaturedTier ? (
          <View className="home-schedule-tier">
            <View className="home-schedule-head">
              <Text className="home-schedule-title">行程精选</Text>
              <View className="home-schedule-more" onClick={openAllSchedules}>
                <Text className="home-schedule-more-text">全部</Text>
                <Text className="home-schedule-more-arrow">›</Text>
              </View>
            </View>
            <Text className="home-schedule-sub">今日按开始时间；精选为管理端「首页精选」且非今日</Text>
            {homeToday.length > 0 ? (
              <View className="home-schedule-section">
                <Text className="home-schedule-section-label">今日</Text>
                <View className="home-schedule-stack">
                  {homeToday.map((s) => (
                    <HomeScheduleCardView key={`today-${s.id}`} s={s} section="today" />
                  ))}
                </View>
              </View>
            ) : null}
            {homeFeatured.length > 0 ? (
              <View className="home-schedule-section">
                <Text className="home-schedule-section-label">精选</Text>
                <View className="home-schedule-stack">
                  {homeFeatured.map((s) => (
                    <HomeScheduleCardView key={`featured-${s.id}`} s={s} section="featured" />
                  ))}
                </View>
              </View>
            ) : null}
          </View>
        ) : null}

        {showComebackTier ? (
          <View className={`home-schedule-tier${showFeaturedTier  ? ' home-schedule-tier--second' : ''}`}>
            {/* <Text className="home-schedule-block-title">COMEBACK 日程</Text>
            <Text className="home-schedule-sub home-schedule-sub--tight">
              请多多关心吧~
            </Text> */}
            <View className="home-schedule-stack">
              {homeComeback.map((s) => (
                <HomeScheduleCardView key={`comeback-${s.id}`} s={s} section="comeback" />
              ))}
            </View>
          </View>
        ) : null}

        {showTourTier ? (
          <View
            className={`home-schedule-tier${showFeaturedTier || showComebackTier ? ' home-schedule-tier--second' : ''}`}
          >
            <Text className="home-schedule-block-title">「{tourSpotlightCycleTitle}」concert行程</Text>
            {tourSpotlightCycleTitle ? (
              <Text className="home-schedule-sub home-schedule-sub--tight">
                {`目前为三巡演唱会周期哦~最近一场为：`}
              </Text>
            ) : null}
            <View className="home-schedule-stack">
              {tourSpotlight ? <HomeScheduleCardView s={tourSpotlight} section="tour" /> : null}
            </View>
          </View>
        ) : null}

      

        <Text className="home-schedule-block-title poster-entry-section-title poster-entry-section-title--in-scroll">
          秘籍PLAY
        </Text>
        <View className="poster-entry poster-entry--after-schedules" onClick={openPoster}>
          <PosterTicketIcon variant="card" />
          <View className="poster-entry-body">
            <Text className="poster-entry-text">MAKE YOUR TICKET</Text>
            <Text className="poster-entry-hint">制作自己的门票卡吧</Text>
          </View>
          <Text className="poster-entry-arrow">›</Text>
        </View>
      </View>
    </ScrollView>
  );
}
