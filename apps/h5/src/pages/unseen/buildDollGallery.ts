import type {
  CatalogMember,
  CatalogProduct,
  DollCatalog,
  DollMerch,
  UnseenDoll,
} from '@/types/dollCatalog';

const catalogImages = import.meta.glob<string>('../../data/img/*.png', {
  eager: true,
  import: 'default',
});

const IMAGE_BY_FILENAME = Object.fromEntries(
  Object.entries(catalogImages).map(([path, src]) => {
    const filename = path.split('/').pop() ?? path;
    return [filename, src];
  }),
);

const MEMBER_ORDER = ['Yeji', 'Lia', 'Ryujin', 'Chaeryeong', 'Yuna'] as const;

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

function resolveImage(filename: string) {
  return IMAGE_BY_FILENAME[filename] ?? '';
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
    .flatMap((product) => {
      const member = product.members.find((m) => m.member === memberName);
      if (!member) return [];

      return [
        {
          id: `${product.id}-${memberName}`,
          src: resolveImage(member.filename),
          label: product.productName,
          productName: product.productName,
          category: product.category,
          collection: product.collection,
          year: product.year,
          model: member.model,
          jan: member.jan,
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
      src: resolveImage(member.filename),
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
