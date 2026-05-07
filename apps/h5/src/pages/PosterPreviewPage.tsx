import { useEffect, useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { POSTER_HEIGHT, POSTER_WIDTH } from '@/poster/layout';
import { POSTER_PREVIEW_STORAGE_KEY } from '@/poster/previewBridge';
import './PosterPreviewPage.css';

export default function PosterPreviewPage() {
  const navigate = useNavigate();
  const [src, setSrc] = useState('');
  const [err, setErr] = useState<string | null>(null);

  useEffect(() => {
    let url = '';
    try {
      url = sessionStorage.getItem(POSTER_PREVIEW_STORAGE_KEY) ?? '';
    } catch {
      setErr('无法读取预览数据');
      return;
    }

    if (typeof url === 'string' && url.length > 0) {
      setSrc(url);
      // React 18 StrictMode（dev）会触发 effect 的“挂载→卸载→再挂载”模拟，
      // 若这里 removeItem/revokeObjectURL，会导致第二次挂载拿不到或图片被提前 revoke，出现“图裂”。
      // 清理由海报页在生成新图覆盖写入时统一处理。
      return;
    }
    setErr('未找到预览图，请返回海报页重新生成。');
  }, []);

  return (
    <div className="preview-page">
      {src ? (
        <>
          <div className="preview-page-sub">
            与导出一致 {POSTER_WIDTH}∶{POSTER_HEIGHT}
          </div>
          <div className="preview-frame">
            <img className="preview-img" alt="poster preview" src={src} />
          </div>
          <div className="preview-actions">
            <Link className="btn secondary" to="/poster">
              返回海报页
            </Link>
            <a className="btn" download="itzy-poster.png" href={src}>
              下载 PNG
            </a>
          </div>
        </>
      ) : null}

      {err ? (
        <div className="preview-page-err">
          {err}{' '}
          <button type="button" className="preview-inline-btn" onClick={() => navigate('/poster')}>
            去海报页
          </button>
        </div>
      ) : null}
    </div>
  );
}

