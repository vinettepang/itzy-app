import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { useFacilLocale } from '../context/FacilLocaleContext';
import {
  DEFAULT_CONSENT,
  hasCookieDecision,
  readCookieConsent,
  writeCookieConsent,
  type FacilCookieConsent,
} from '../hooks/useFacilCookieConsent';

export default function FacilCookieBanner() {
  const { t, path } = useFacilLocale();
  const [open, setOpen] = useState(false);
  const [advanced, setAdvanced] = useState(false);
  const [consent, setConsent] = useState<FacilCookieConsent>(DEFAULT_CONSENT);

  useEffect(() => {
    const saved = readCookieConsent();
    if (saved) {
      setConsent(saved);
      setOpen(false);
    } else {
      setOpen(true);
    }
  }, []);

  useEffect(() => {
    const onOpen = () => setOpen(true);
    window.addEventListener('facil:open-cmp', onOpen);
    return () => window.removeEventListener('facil:open-cmp', onOpen);
  }, []);

  const save = (next: FacilCookieConsent) => {
    writeCookieConsent(next);
    setConsent(next);
    setOpen(false);
    setAdvanced(false);
    if (next.analytics) window.location.reload();
  };

  const acceptAll = () =>
    save({ necessary: true, functional: true, analytics: true, advertising: true });

  const savePreferences = () => save(consent);

  if (!open && hasCookieDecision()) return null;

  return (
    <div className="facil-windows">
      <div id="CMP" className="facil-cmp" role="dialog" aria-expanded={open}>
        <div className="content">
          {t('cookie.banner')}{' '}
          <Link to={path('cookies')} rel="nofollow">
            {t('cookie.policyLink')}
          </Link>
        </div>

        <div className="btns">
          <button type="button" className="btn" onClick={() => setAdvanced((v) => !v)}>
            <span className="text">{t('cookie.settings')}</span>
          </button>
          <button type="button" className="btn" onClick={() => setOpen(false)}>
            <span className="text">{t('cookie.cancel')}</span>
          </button>
          <button type="button" className="btn --full" onClick={acceptAll}>
            <span className="text">{t('cookie.accept')}</span>
          </button>
        </div>

        <div className="information" aria-expanded={advanced} data-information>
          <div className="information__type">
            <div className="title">{t('cookie.necessaryTitle')}</div>
            <div className="text">{t('cookie.necessaryText')}</div>
            <div className="checks">{t('cookie.necessaryAlways')}</div>
          </div>

          <div className="information__type">
            <div className="title">{t('cookie.functionalTitle')}</div>
            <div className="text">{t('cookie.functionalText')}</div>
            <div className="checks">
              <button
                type="button"
                className={`check${consent.functional ? ' is-on' : ''}`}
                aria-pressed={consent.functional}
                onClick={() => setConsent((c) => ({ ...c, functional: !c.functional }))}
              />
            </div>
          </div>

          <div className="information__type">
            <div className="title">{t('cookie.analyticsTitle')}</div>
            <div className="text">{t('cookie.analyticsText')}</div>
            <div className="checks">
              <button
                type="button"
                className={`check${consent.analytics ? ' is-on' : ''}`}
                aria-pressed={consent.analytics}
                onClick={() => setConsent((c) => ({ ...c, analytics: !c.analytics }))}
              />
            </div>
          </div>

          <div className="information__type">
            <div className="title">{t('cookie.adsTitle')}</div>
            <div className="text">{t('cookie.adsText')}</div>
            <div className="checks">
              <button
                type="button"
                className={`check${consent.advertising ? ' is-on' : ''}`}
                aria-pressed={consent.advertising}
                onClick={() => setConsent((c) => ({ ...c, advertising: !c.advertising }))}
              />
            </div>
          </div>

          <div className="information__controls">
            <button type="button" className="btn --big" onClick={savePreferences}>
              <span className="text">{t('cookie.save')}</span>
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
