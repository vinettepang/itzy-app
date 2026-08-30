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

// 斐波那契螺旋：把同一角色的多个 merch 均匀散开，避免固定 6 点布局重叠
function spiralLayout(n: number, spacing = 142) {
  const golden = Math.PI * (3 - Math.sqrt(5)); // ≈137.5°
  return Array.from({ length: n }, (_, i) => {
    const r = spacing * Math.sqrt(i);
    const a = i * golden;
    return { x: Math.round(Math.cos(a) * r), y: Math.round(Math.sin(a) * r) };
  });
}

// 按系列（line: 韩版 KR / 日版 JP / SEGA）把同一角色的 merch 排成整齐的横排：
// 每个系列一行、行内居中、系列从上到下堆叠。作为「混乱→整齐」动画的目标坐标。
function neatLayoutByLine(merch: DollMerch[]) {
  const LINES = ['KR', 'JP', 'SEGA'] as const;
  const groups: Record<string, number[]> = {};
  merch.forEach((m, i) => {
    const key = m.line ?? 'KR';
    (groups[key] ??= []).push(i);
  });
  const present = LINES.filter((l) => (groups[l]?.length ?? 0) > 0);
  const CARD_W = 116; // 与 .unseen-merch 最大宽度一致
  const GAP = 30;
  const ROW_H = 224; // 系列行之间的垂直间距
  const CARD_H = 200; // 卡片近似高度（图 174 + 文字 ~26）
  const result: { x: number; y: number }[] = new Array(merch.length);
  present.forEach((line, gi) => {
    const indices = groups[line];
    const n = indices.length;
    const totalW = n * CARD_W + (n - 1) * GAP;
    const startLeft = -totalW / 2;
    const groupTop = (gi - (present.length - 1) / 2) * ROW_H - CARD_H / 2;
    indices.forEach((idx, i) => {
      result[idx] = {
        x: Math.round(startLeft + i * (CARD_W + GAP)),
        y: Math.round(groupTop),
      };
    });
  });
  return result;
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
          line: product.line,
          size: member.size ?? product.size ?? product.sizes?.[memberName],
          release: product.release,
          region: product.region,
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

    const merchRaw = buildMerchForMember(seriesKey, memberName, catalog, coreProductId);
    const positions = spiralLayout(merchRaw.length);
    const neat = neatLayoutByLine(merchRaw);
    const merch = merchRaw.map((m, i) => ({
      ...m,
      x: positions[i].x,
      y: positions[i].y,
      gridX: neat[i].x,
      gridY: neat[i].y,
    }));

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
      merch,
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
