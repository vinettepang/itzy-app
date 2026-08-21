import { Link } from 'react-router-dom';
import {
  CHEER_GUIDES,
  songTitleToCheerSlug,
} from '@/pages/cheer/cheerData';
import { useScrollDamping } from '@/hooks/useScrollDamping';
import './TourSetlistPage.css';

type SetlistSong = { title: string; hasCheer: boolean };

const SETLIST: SetlistSong[] = [
  { title: 'Tunnel Vision', hasCheer: true },
  { title: 'DYT', hasCheer: false },
  { title: 'Girls Will Be Girls', hasCheer: true },
  { title: 'Walk', hasCheer: false },
  { title: 'Kiss & Tell', hasCheer: true },
  { title: 'Wannabe', hasCheer: true },
  { title: 'Supernatural', hasCheer: false },
  { title: 'Imaginary Friend', hasCheer: true },
  { title: 'Motto', hasCheer: true },
  { title: 'Pocket (Yeji Solo)', hasCheer: false },
  { title: 'Asylum (Lia Solo)', hasCheer: false },
  { title: 'Look (Ryujin Solo)', hasCheer: false },
  { title: 'Undefined (Chaeryeong Solo)', hasCheer: false },
  { title: 'Tangerine (Yuna Solo)', hasCheer: false },
  { title: 'GOLD', hasCheer: true },
  { title: 'Wild Wild West', hasCheer: false },
  { title: 'Mafia In the morning', hasCheer: true },
  { title: "That's a no no", hasCheer: true },
  { title: 'Sorry Not Sorry', hasCheer: false },
  { title: 'Not Shy', hasCheer: true },
  { title: 'LOCO', hasCheer: true },
  { title: 'Mirror', hasCheer: false },
  { title: 'Five', hasCheer: false },
  { title: '8-bit Heart', hasCheer: false },
  { title: 'SNEAKERS', hasCheer: true },
  { title: 'CAKE', hasCheer: true },
  { title: 'Dalla Dalla', hasCheer: true },
];

function cheerHref(title: string) {
  const slug = songTitleToCheerSlug(title);
  return `/cheer/${slug}`;
}

export default function TourSetlistPage() {
  useScrollDamping();
  const cheerCount = SETLIST.filter((s) => s.hasCheer).length;

  return (
    <div className="setlist-page">
      <header className="setlist-header">
        <p className="setlist-kicker">ITZY 3RD WORLD TOUR</p>
        <h1 className="setlist-title">&lt;TUNNEL VISION&gt;</h1>
        <p className="setlist-sub">
          {SETLIST.length} 首曲目 · {cheerCount} 首含应援法 · 已录入{' '}
          {Object.keys(CHEER_GUIDES).length} 首全文
        </p>
      </header>

      <ol className="setlist-list" aria-label="三巡歌单">
        {SETLIST.map((song, index) => (
          <li key={song.title} className="setlist-row">
            <span className="setlist-num">{String(index + 1).padStart(2, '0')}</span>
            <span className="setlist-name">{song.title}</span>
            {song.hasCheer ? (
              <Link
                className="setlist-cheer"
                to={cheerHref(song.title)}
                aria-label={`${song.title} 应援法`}
              >
                应援法
              </Link>
            ) : null}
          </li>
        ))}
      </ol>
    </div>
  );
}
