import { createContext, useCallback, useContext, useMemo, type ReactNode } from 'react';
import { useLocation } from 'react-router-dom';
import {
  ROUTES,
  translations,
  type FacilLocale,
  type TranslationKey,
} from '../i18n/translations';

type FacilLocaleContextValue = {
  locale: FacilLocale;
  basePath: string;
  t: (key: TranslationKey | 'home.intro5') => string;
  path: (segment?: keyof typeof ROUTES.es | string) => string;
  switchLocalePath: (target: FacilLocale) => string;
};

const FacilLocaleContext = createContext<FacilLocaleContextValue | null>(null);

function detectLocale(pathname: string): FacilLocale {
  return pathname.startsWith('/facil/en') ? 'en' : 'es';
}

function segmentFromPath(pathname: string, locale: FacilLocale): string {
  const prefix = locale === 'en' ? '/facil/en' : '/facil';
  const rest = pathname.replace(prefix, '').replace(/^\//, '');
  return rest;
}

export function FacilLocaleProvider({ children }: { children: ReactNode }) {
  const location = useLocation();
  const locale = detectLocale(location.pathname);

  const basePath = locale === 'en' ? '/facil/en' : '/facil';

  const t = useCallback(
    (key: TranslationKey | 'home.intro5') => translations[locale][key],
    [locale],
  );

  const path = useCallback(
    (segment?: keyof typeof ROUTES.es | string) => {
      if (!segment) return basePath;
      const routeKey = segment as keyof typeof ROUTES.es;
      const slug = ROUTES[locale][routeKey] ?? segment;
      return slug ? `${basePath}/${slug}` : basePath;
    },
    [basePath, locale],
  );

  const switchLocalePath = useCallback(
    (target: FacilLocale) => {
      if (target === locale) return location.pathname;
      const currentSeg = segmentFromPath(location.pathname, locale);
      if (!currentSeg) return target === 'en' ? '/facil/en' : '/facil';

      const parts = currentSeg.split('/');
      const head = parts[0];

      const map: Record<string, { es: string; en: string }> = {
        trabajos: { es: 'trabajos', en: 'works' },
        works: { es: 'trabajos', en: 'works' },
        filosofia: { es: 'filosofia', en: 'philosophy' },
        philosophy: { es: 'filosofia', en: 'philosophy' },
        people: { es: 'people', en: 'people' },
        contact: { es: 'contact', en: 'contact' },
        projects: { es: 'projects', en: 'projects' },
        'politica-de-privacidad': { es: 'politica-de-privacidad', en: 'privacy-policy' },
        'privacy-policy': { es: 'politica-de-privacidad', en: 'privacy-policy' },
        'aviso-legal': { es: 'aviso-legal', en: 'legal-notice' },
        'legal-notice': { es: 'aviso-legal', en: 'legal-notice' },
        'politica-de-cookies': { es: 'politica-de-cookies', en: 'cookie-policy' },
        'cookie-policy': { es: 'politica-de-cookies', en: 'cookie-policy' },
        'declaracion-de-accesibilidad': { es: 'declaracion-de-accesibilidad', en: 'accessibility-statement' },
        'accessibility-statement': { es: 'declaracion-de-accesibilidad', en: 'accessibility-statement' },
      };

      if (head === 'projects' && parts[1]) {
        const base = target === 'en' ? '/facil/en/projects' : '/facil/projects';
        return `${base}/${parts.slice(1).join('/')}`;
      }

      const mapped = map[head];
      const newHead = mapped ? mapped[target] : head;
      const tail = parts.slice(1).join('/');
      const base = target === 'en' ? '/facil/en' : '/facil';
      return tail ? `${base}/${newHead}/${tail}` : `${base}/${newHead}`;
    },
    [locale, location.pathname],
  );

  const value = useMemo(
    () => ({ locale, basePath, t, path, switchLocalePath }),
    [locale, basePath, t, path, switchLocalePath],
  );

  return <FacilLocaleContext.Provider value={value}>{children}</FacilLocaleContext.Provider>;
}

export function useFacilLocale() {
  const ctx = useContext(FacilLocaleContext);
  if (!ctx) throw new Error('useFacilLocale must be used within FacilLocaleProvider');
  return ctx;
}
