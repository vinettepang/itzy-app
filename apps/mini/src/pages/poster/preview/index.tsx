import { Image, Text, View } from '@tarojs/components';
import Taro, { useLoad } from '@tarojs/taro';
import { useCallback, useState } from 'react';
import { POSTER_PREVIEW_STORAGE_KEY } from '../previewBridge';
import { POSTER_HEIGHT, POSTER_WIDTH } from '../layout';
import './index.scss';

export default function PosterPreviewPage() {
  const [src, setSrc] = useState('');
  const [err, setErr] = useState<string | null>(null);
  const [saving, setSaving] = useState(false);

  useLoad(() => {
    const path = Taro.getStorageSync(POSTER_PREVIEW_STORAGE_KEY) as string;
    try {
      Taro.removeStorageSync(POSTER_PREVIEW_STORAGE_KEY);
    } catch {
      /* ignore */
    }
    if (typeof path === 'string' && path.length > 0) {
      setSrc(path);
    } else {
      setErr('未找到预览图，请返回海报页重新生成。');
    }
  });

  const goBackPoster = useCallback(() => {
    void Taro.navigateBack({
      fail: () => {
        void Taro.redirectTo({ url: '/pages/poster/index' });
      },
    });
  }, []);

  const download = useCallback(async () => {
    if (!src) return;
    setErr(null);
    setSaving(true);
    try {
      const setting = await Taro.getSetting();
      if (!setting.authSetting['scope.writePhotosAlbum']) {
        await Taro.authorize({ scope: 'scope.writePhotosAlbum' });
      }
    } catch {
      void Taro.openSetting();
      setSaving(false);
      return;
    }
    try {
      await Taro.saveImageToPhotosAlbum({ filePath: src });
      void Taro.showToast({ title: '已保存到相册', icon: 'success' });
    } catch (e) {
      const msg = e instanceof Error ? e.message : '保存失败';
      setErr(msg);
      void Taro.showToast({ title: msg, icon: 'none' });
    } finally {
      setSaving(false);
    }
  }, [src]);

  return (
    <View className="preview-page">
      {src ? (
        <>
          <Text className="preview-page-sub">
            与导出一致 {POSTER_WIDTH}∶{POSTER_HEIGHT}
          </Text>
          <View className="preview-frame">
            <Image className="preview-img" mode="aspectFit" src={src} />
          </View>
          <View className="preview-actions">
            <View className="btn secondary" onClick={goBackPoster}>
              <Text>返回海报页</Text>
            </View>
            <View className={`btn${saving ? ' disabled' : ''}`} onClick={() => void download()}>
              <Text>{saving ? '保存中…' : '保存到相册'}</Text>
            </View>
          </View>
        </>
      ) : null}
      {err ? <Text className="preview-page-err">{err}</Text> : null}
    </View>
  );
}
