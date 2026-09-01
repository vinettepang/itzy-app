import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { stripBase } from '@/utils/assetUrl';
import itzyLogoPng from '@/assets/itzy.png';

const INFO_MARQUEE_TEXT = 'MIDZY · ITZY · MIDZY · ITZY';
const HOME_HREF = '/';
const NAV_PINNED_CLASS = 'xkm-coverNav--pinned';

function InfoMarquee() {
  const items = [INFO_MARQUEE_TEXT, INFO_MARQUEE_TEXT];

  return (
    <div className="xkm-coverNav__cell xkm-coverNav__cell--marquee" aria-label="Information">
      <div className="xkm-infoMarquee__viewport" role="marquee" aria-label="Information ticker">
        <div className="xkm-infoMarquee__track">
          {items.map((text, i) => (
            <span
              key={i}
              className="xkm-infoMarquee__item"
              aria-hidden={i > 0 ? true : undefined}
            >
              {text}
            </span>
          ))}
        </div>
      </div>
      <span className="xkm-infoMarquee__label">Information</span>
    </div>
  );
}

export default function NewNewCoverNav() {
  const [pinned, setPinned] = useState(false);
  const [menuOpen, setMenuOpen] = useState(false);

  useEffect(() => {
    const onScroll = () => {
      setPinned(window.scrollY > 0);
    };
    onScroll();
    window.addEventListener('scroll', onScroll, { passive: true });
    return () => window.removeEventListener('scroll', onScroll);
  }, []);

  return (
    <>
      <nav
        className={`xkm-coverNav xkm-coverNav--withHome newnew-shell__nav${
          pinned ? ` ${NAV_PINNED_CLASS}` : ''
        }`}
        aria-label="Site navigation"
      >
        <Link
          to={HOME_HREF}
          className="xkm-coverNav__home"
          aria-label="ITZY home"
          onClick={() => {
            if (stripBase(window.location.pathname) === HOME_HREF) {
              window.scrollTo(0, 0);
            }
          }}
        >
          <img src={itzyLogoPng} alt="ITZY" width={64} height={20} decoding="async" />
        </Link>
        <InfoMarquee />
        <button
          type="button"
          className={`xkm-coverNav__cell xkm-coverNav__cell--menu${
            menuOpen ? ' is-open' : ''
          }`}
          aria-expanded={menuOpen}
          aria-label={menuOpen ? '关闭菜单' : '打开菜单'}
          onClick={() => setMenuOpen((v) => !v)}
        >
          <span className="xkm-coverNav__menuIcon" aria-hidden="true">
            <span />
            <span />
            <span />
          </span>
        </button>
      </nav>

      {/* 顶部下滑菜单 */}
      <div
        className={`xkm-menuPanel${menuOpen ? ' xkm-menuPanel--open' : ''}`}
        aria-hidden={!menuOpen}
      >
        <button
          type="button"
          className="xkm-menuClose"
          aria-label="关闭菜单"
          onClick={() => setMenuOpen(false)}
        >
          <span className="xkm-menuClose__icon" aria-hidden="true">
            <span />
            <span />
          </span>
        </button>
        <Link
          to="/"
          className="xkm-menuLink"
          onClick={() => setMenuOpen(false)}
        >
          首页<span className="xkm-menuLink__en">Home</span>
        </Link>
        <Link
          to="/setlist"
          className="xkm-menuLink"
          onClick={() => setMenuOpen(false)}
        >
          应援法<span className="xkm-menuLink__en">Fanchant</span>
        </Link>
        <Link
          to="/dolls"
          className="xkm-menuLink"
          onClick={() => setMenuOpen(false)}
        >
          娃娃图鉴<span className="xkm-menuLink__en">Doll Guide</span>
        </Link>
        <Link
          to="/schedules"
          className="xkm-menuLink"
          onClick={() => setMenuOpen(false)}
        >
          演唱会行程<span className="xkm-menuLink__en">Tour Dates</span>
        </Link>
      </div>
    </>
  );
}
