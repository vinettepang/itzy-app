import { useEffect } from 'react';
import TfibSiteHost from './TfibSiteHost';

/** 与 thefutureinblack.com /home 完整对齐（Squarespace DOM + 本地资源 + React 宿主）。 */
export default function TheFutureInBlackPage() {
  useEffect(() => {
    const prev = document.title;
    document.title = 'The Future in Black™ | Cultural Intelligence Studio';
    return () => {
      document.title = prev;
    };
  }, []);

  return <TfibSiteHost snapshot="home" />;
}
