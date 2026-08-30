import { useRegisterSW } from 'virtual:pwa-register/react';
import './OfflineBadge.css';

/**
 * 离线缓存状态提示：
 * - offlineReady：首次联网访问后 Service Worker 已把 app 壳（含歌单/歌词数据）缓存好，断网也能看
 * - needRefresh：检测到新版本已就绪，可点击立即更新
 * 开发环境 SW 未启用，本组件不显示任何内容。
 */
export default function OfflineBadge() {
  const {
    offlineReady: [offlineReady, setOfflineReady],
    needRefresh: [needRefresh, setNeedRefresh],
    updateServiceWorker,
  } = useRegisterSW({
    onRegisteredSW() {
      /* SW 注册成功（首次联网访问即开始缓存） */
    },
  });

  if (!offlineReady && !needRefresh) return null;

  const dismiss = () => {
    setOfflineReady(false);
    setNeedRefresh(false);
  };

  return (
    <div className="offline-badge" role="status" aria-live="polite">
      {offlineReady ? (
        <span className="offline-badge__msg">
          <span className="offline-badge__dot" aria-hidden /> 已可离线使用 · 断网也能看歌单与歌词
        </span>
      ) : (
        <button
          type="button"
          className="offline-badge__msg offline-badge__msg--action"
          onClick={() => updateServiceWorker(true)}
        >
          <span className="offline-badge__dot offline-badge__dot--update" aria-hidden /> 发现新版本，点击更新
        </button>
      )}
      <button
        type="button"
        className="offline-badge__close"
        onClick={dismiss}
        aria-label="关闭"
      >
        ×
      </button>
    </div>
  );
}
