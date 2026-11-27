import raw from './content.json';

export const FP_BASE = '/felixpeault';
export const FP_FONT_BASE = `${import.meta.env.BASE_URL}felixpeault/fonts`;

export type FelixContent = typeof raw;

export const felixContent: FelixContent = raw;

export function decodePhotoSrc(src: string) {
  return src.replace(/&amp;/g, '&');
}
