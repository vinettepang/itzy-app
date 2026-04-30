import { useCallback, useEffect, useState } from 'react';
import { Image, Swiper, SwiperItem, Text, View } from '@tarojs/components';
import Taro, { useRouter } from '@tarojs/taro';
import { request, resolveMediaUrl } from '@/services/request';
import './index.scss';

type Photo = {
  id: string;
  url: string;
  caption: string | null;
};

type Album = {
  id: string;
  title: string;
  description: string | null;
  photos: Photo[];
};

export default function GalleryDetail() {
  const router = useRouter();
  const id = router.params.id ?? '';
  const [album, setAlbum] = useState<Album | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [index, setIndex] = useState(0);

  const load = useCallback(async () => {
    if (!id) {
      setError('缺少相册 ID');
      setLoading(false);
      return;
    }
    setLoading(true);
    setError(null);
    try {
      const res = await request<Album>({ url: `/api/albums/${id}`, method: 'GET' });
      if (res.code !== 0) {
        setError(res.message || '加载失败');
        setAlbum(null);
        return;
      }
      setAlbum(res.data);
      void Taro.setNavigationBarTitle({ title: res.data?.title ?? '相册' });
    } catch (e) {
      setError(e instanceof Error ? e.message : String(e));
      setAlbum(null);
    } finally {
      setLoading(false);
    }
  }, [id]);

  useEffect(() => {
    void load();
  }, [load]);

  const current = album?.photos[index];

  if (loading) {
    return (
      <View className="page">
        <Text className="muted">加载中…</Text>
      </View>
    );
  }

  if (error || !album) {
    return (
      <View className="page">
        <Text className="error">{error ?? '未找到相册'}</Text>
      </View>
    );
  }

  if (!album.photos.length) {
    return (
      <View className="page">
        <Text className="muted">该相册暂无照片</Text>
      </View>
    );
  }

  return (
    <View className="page detail">
      {album.description ? <Text className="intro">{album.description}</Text> : null}
      <Swiper
        className="swiper"
        circular
        onChange={(e) => setIndex(e.detail.current)}
      >
        {album.photos.map((p) => (
          <SwiperItem key={p.id} className="slide">
            <Image className="photo" mode="aspectFit" src={resolveMediaUrl(p.url)} />
          </SwiperItem>
        ))}
      </Swiper>
      <View className="footer">
        <Text className="caption">{current?.caption || ' '}</Text>
        <Text className="pager">
          {index + 1} / {album.photos.length}
        </Text>
      </View>
    </View>
  );
}
