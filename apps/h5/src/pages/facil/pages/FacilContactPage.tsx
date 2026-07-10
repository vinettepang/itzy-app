import { CONTACT_LINKS } from '../data/siteData';
import { useFacilLocale } from '../context/FacilLocaleContext';

export default function FacilContactPage() {
  const { t } = useFacilLocale();

  return (
    <article className="default contact" data-page="contact">
      <header className="header-page">
        <h1 className="description">
          <p>
            {t('contact.intro1')}{' '}
            <span className="facil-font">{t('contact.introLink')}</span>
            {t('contact.intro2')}
          </p>
        </h1>
      </header>

      <div className="facil-contact-links">
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
      </div>
    </article>
  );
}
