import catalogJson from '@/data/wdzy_twinzy_catalog.json';
import { buildDollGallery } from '@/pages/unseen/buildDollGallery';
import { request } from '@/services/request';
import type { DollCatalog, UnseenDoll } from '@/types/dollCatalog';

export type DollGalleryResponse = {
  meta: DollCatalog['meta'];
  dolls: UnseenDoll[];
};

export function getDollById(dolls: UnseenDoll[], id: string) {
  return dolls.find((doll) => doll.id === id);
}

export async function fetchDollGallery() {
  return request<DollGalleryResponse>({
    url: '/api/dolls/gallery',
    method: 'GET',
  });
}

/** 本地直读（测试 / storybook 用） */
export function loadDollGalleryLocal(): DollGalleryResponse {
  const catalog = catalogJson as DollCatalog;
  return {
    meta: catalog.meta,
    dolls: buildDollGallery(catalog),
  };
}
