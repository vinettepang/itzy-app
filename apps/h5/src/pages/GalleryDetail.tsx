import { useCallback, useEffect, useMemo, useState } from 'react';
import { useParams } from 'react-router-dom';
import { request, resolveMediaUrl } from '@/services/request';
import './GalleryDetail.css';

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
  const { id = '' } = useParams<{ id: string }>();
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
      const res = await request<Album>({ url: `/api/albums/${encodeURIComponent(id)}`, method: 'GET' });
      if (res.code !== 0) {
        setError(res.message || '加载失败');
        setAlbum(null);
        return;
      }
      setAlbum(res.data);
      setIndex(0);
      document.title = res.data?.title ? `相册 · ${res.data.title}` : '相册';
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

  const photos = album?.photos ?? [];
  const current = photos[index];

  const images = useMemo(() => photos.map((p) => resolveMediaUrl(p.url)), [photos]);

  useEffect(() => {
    const onScroll = (e: Event) => {
      const el = e.target as HTMLElement | null;
      if (!el) return;
      const w = el.clientWidth || 1;
      const i = Math.round(el.scrollLeft / w);
      setIndex(Math.max(0, Math.min(i, photos.length - 1)));
    };
    const host = document.getElementById('gallery-swiper');
    if (!host) return;
    host.addEventListener('scroll', onScroll, { passive: true });
    return () => host.removeEventListener('scroll', onScroll as EventListener);
  }, [photos.length]);

  if (loading) {
    return (
      <div className="gpage">
        <div className="gmuted">加载中…</div>
      </div>
    );
  }

  if (error || !album) {
    return (
      <div className="gpage">
        <div className="gerror">{error ?? '未找到相册'}</div>
      </div>
    );
  }

  if (!photos.length) {
    return (
      <div className="gpage">
        <div className="gmuted">该相册暂无照片</div>
      </div>
    );
  }

  return (
    <div className="gpage gdetail">
      {album.description ? <div className="gintro">{album.description}</div> : null}
      <div id="gallery-swiper" className="gswiper" aria-label="album swiper">
        {images.map((src, i) => (
          <div key={`${photos[i]?.id ?? i}`} className="gslide">
            <img className="gphoto" draggable={false} src={src} alt="" />
          </div>
        ))}
      </div>
      <div className="gfooter">
        <div className="gcaption">{current?.caption || ' '}</div>
        <div className="gpager">
          {index + 1} / {photos.length}
        </div>
      </div>
    </div>
  );
}

