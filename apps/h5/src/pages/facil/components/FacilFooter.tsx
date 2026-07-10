import { Link } from 'react-router-dom';
import { CONTACT_LINKS, CLIENT_LOGOS } from '../data/siteData';
import FacilLogoWordmark from './FacilLogoWordmark';
import { useFacilLocale } from '../context/FacilLocaleContext';

export default function FacilFooter() {
  const { t, path } = useFacilLocale();

  const openCmp = () => window.dispatchEvent(new Event('facil:open-cmp'));

  return (
    <>
      <div id="FooterFake" className="facil-footer-fake" data-scroll-item />
      <footer id="Footer" className="facil-footer">
        <div className="logo">
          <FacilLogoWordmark className="facil-logo-wordmark" />
          <nav className="contact">
            {CONTACT_LINKS.map((link) => (
              <a
                key={link.className}
                className={`link-assertive ${link.className}`}
                href={link.href}
                target="_blank"
                rel="noreferrer"
              >
                <span>{link.label}</span>
              </a>
            ))}
          </nav>
        </div>

        <ul className="clients">
          {CLIENT_LOGOS.map((c) => (
            <li key={c.alt}>
              <figure className="media-holder">
                <img src={c.src} alt={c.alt} loading="lazy" />
              </figure>
            </li>
          ))}
        </ul>

        <div className="Footer__legal">
          <div className="legales">
            <Link to={path('accessibility')} rel="nofollow">
              <span>{t('legal.accessibility')}</span>
            </Link>
            <Link to={path('privacy')} rel="nofollow">
              <span>{t('legal.privacy')}</span>
            </Link>
            <Link to={path('legal')} rel="nofollow">
              <span>{t('legal.legal')}</span>
            </Link>
            <Link to={path('cookies')} rel="nofollow">
              <span>{t('legal.cookies')}</span>
            </Link>
            <button type="button" className="facil-footer__cmp-toggle" onClick={openCmp}>
              <span>{t('cookie.toggleSettings')}</span>
            </button>
          </div>
        </div>
      </footer>
    </>
  );
}
