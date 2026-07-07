import img0004 from '@/assets/img/albumhead/0004.jpg';
import img0010 from '@/assets/img/albumhead/0010.jpg';
import img0011 from '@/assets/img/albumhead/0011.jpg';
import img0016 from '@/assets/img/albumhead/0016.jpg';
import img0021 from '@/assets/img/albumhead/0021.jpg';
import img0023 from '@/assets/img/albumhead/0023.jpg';
import img0027 from '@/assets/img/albumhead/0027.jpg';
import img0029 from '@/assets/img/albumhead/0029.jpg';
import img0036 from '@/assets/img/albumhead/0036.jpg';
import img0039 from '@/assets/img/albumhead/0039.jpg';
import img0048 from '@/assets/img/albumhead/0048.jpg';
import img0050 from '@/assets/img/albumhead/0050.jpg';
import img0052 from '@/assets/img/albumhead/0052.jpg';
import img0054 from '@/assets/img/albumhead/0054.jpg';
import img0055 from '@/assets/img/albumhead/0055.jpg';
import img0063 from '@/assets/img/albumhead/0063.jpg';
import img0067 from '@/assets/img/albumhead/0067.jpg';
import type {
  CatalogMember,
  CatalogProduct,
  DollCatalog,
  DollMerch,
  UnseenDoll,
} from '@/types/dollCatalog';

const MEMBER_ORDER = ['Yeji', 'Lia', 'Ryujin', 'Chaeryeong', 'Yuna'] as const;

const MEMBER_IMAGES: Record<string, string> = {
  Yeji: img0004,
  Lia: img0010,
  Ryujin: img0011,
  Chaeryeong: img0016,
  Yuna: img0021,
};

const MERCH_IMAGES = [
  img0048,
  img0050,
  img0052,
  img0054,
  img0055,
  img0063,
  img0067,
  img0023,
  img0027,
  img0029,
  img0036,
  img0039,
];

const WDZY_CORE_ID = 'wdzy_plush_doll_2021';
const TWINZY_CORE_ID = 'twinzy_original_plush_2024';

function worldPos(index: number) {
  const col = (index % 5) - 2;
  const row = Math.floor(index / 5);
  return { worldX: col * 400, worldY: row * 520 - 260 };
}

function memberCharacter(member: CatalogMember) {
  return member.character ?? member.twinzyName ?? member.member;
}

function resolveImage(_filename: string, index: number, member?: string) {
  if (member && MEMBER_IMAGES[member]) {
    return MEMBER_IMAGES[member];
  }
  return MERCH_IMAGES[index % MERCH_IMAGES.length];
}

function buildDescription(product: CatalogProduct, member: CatalogMember) {
  const alias = memberCharacter(member);
  return `${product.series} ${alias} · ${product.productName} (${product.collection}, ${product.year}). Source: ${product.officialSource}.`;
}

function buildMerchForMember(
  seriesKey: 'wdzy' | 'twinzy',
  memberName: string,
  catalog: DollCatalog,
  coreProductId: string,
): DollMerch[] {
  return catalog[seriesKey]
    .filter((product) => product.id !== coreProductId)
    .flatMap((product, productIndex) => {
      const member = product.members.find((m) => m.member === memberName);
      if (!member) return [];

      return [
        {
          id: `${product.id}-${memberName}`,
          src: resolveImage(member.filename, productIndex, memberName),
          label: product.productName,
          productName: product.productName,
          category: product.category,
          collection: product.collection,
          year: product.year,
        },
      ];
    });
}

function buildRow(
  seriesKey: 'wdzy' | 'twinzy',
  coreProductId: string,
  catalog: DollCatalog,
  rowOffset: number,
): UnseenDoll[] {
  const core = catalog[seriesKey].find((p) => p.id === coreProductId);
  if (!core) return [];

  return MEMBER_ORDER.map((memberName, index) => {
    const member = core.members.find((m) => m.member === memberName);
    if (!member) {
      throw new Error(`Missing member ${memberName} in ${coreProductId}`);
    }

    const globalIndex = rowOffset + index;
    const seriesLabel = core.series;

    return {
      id: `${seriesKey}-${memberName.toLowerCase()}`,
      name: memberName,
      series: seriesLabel,
      characterName: memberCharacter(member),
      src: resolveImage(member.filename, globalIndex, memberName),
      collection: core.collection,
      year: core.year,
      category: core.category,
      productName: core.productName,
      status: core.status,
      officialSource: core.officialSource,
      description: buildDescription(core, member),
      ...worldPos(globalIndex),
      merch: buildMerchForMember(seriesKey, memberName, catalog, coreProductId),
    };
  });
}

export function buildDollGallery(catalog: DollCatalog): UnseenDoll[] {
  const wdzyRow = buildRow('wdzy', WDZY_CORE_ID, catalog, 0);
  const twinzyRow = buildRow('twinzy', TWINZY_CORE_ID, catalog, 5);
  return [...wdzyRow, ...twinzyRow];
}

export const UNSEEN_OVERVIEW_SCALE = 0.3;

export const UNSEEN_MERCH_LAYOUT = [
  { x: -166, y: -16 },
  { x: -50, y: -16 },
  { x: 66, y: -16 },
  { x: -166, y: 150 },
  { x: -50, y: 150 },
  { x: 66, y: 150 },
] as const;
