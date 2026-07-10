export type FacilCookieConsent = {
  necessary: true;
  functional: boolean;
  analytics: boolean;
  advertising: boolean;
};

const STORAGE_KEY = 'facil_cookie_consent';

export const DEFAULT_CONSENT: FacilCookieConsent = {
  necessary: true,
  functional: false,
  analytics: false,
  advertising: false,
};

export function readCookieConsent(): FacilCookieConsent | null {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (!raw) return null;
    return JSON.parse(raw) as FacilCookieConsent;
  } catch {
    return null;
  }
}

export function writeCookieConsent(consent: FacilCookieConsent) {
  localStorage.setItem(STORAGE_KEY, JSON.stringify(consent));
}

export function hasCookieDecision(): boolean {
  return readCookieConsent() !== null;
}
