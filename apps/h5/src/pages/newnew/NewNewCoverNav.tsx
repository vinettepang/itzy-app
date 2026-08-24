import { Link } from 'react-router-dom';
import itzyLogoPng from '@/assets/itzy.png';

const INFO_MARQUEE_TEXT = 'MIDZY · ITZY · MIDZY · ITZY';
const HOME_HREF = '/newnew';

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
  return (
    <nav className="xkm-coverNav xkm-coverNav--withHome newnew-shell__nav" aria-label="Site navigation">
      <Link
        to={HOME_HREF}
        className="xkm-coverNav__home"
        aria-label="ITZY home"
        onClick={() => {
          if (window.location.pathname === HOME_HREF) {
            window.scrollTo(0, 0);
          }
        }}
      >
        <img src={itzyLogoPng} alt="ITZY" width={64} height={20} decoding="async" />
      </Link>
      <InfoMarquee />
      <button type="button" className="xkm-coverNav__cell xkm-coverNav__cell--motto">
        MOTTO
      </button>
    </nav>
  );
}
