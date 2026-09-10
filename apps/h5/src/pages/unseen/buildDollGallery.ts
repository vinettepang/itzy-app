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

export type MerchLineLayout = {
  positions: Record<string, { x: number; y: number }>;
  labels: { line: string; x: number; y: number }[];
  titleY: number;
  overflows: boolean;
  cardW: number;
};

const LINE_ORDER = ['KR', 'JP', 'SEGA'] as const;

/** 按当前视口把系列行排进屏幕宽度；高度超出时顶部对齐，底部溢出靠下滑查看。 */
export function layoutMerchByLineForViewport(
  merch: DollMerch[],
  viewportW: number,
  viewportH: number,
): MerchLineLayout {
  const padXLeft = viewportW < 560 ? 16 : 40;
  const padXRight = viewportW < 560 ? 108 : 64;
  const padTop = 72;
  const padBottom = 96;
  const availW = Math.max(180, viewportW - padXLeft - padXRight);
  const shiftX = (padXLeft - padXRight) / 2;
  const availH = Math.max(180, viewportH - padTop - padBottom);

  const minCard = 74;
  const maxCard = 116;
  const gap = viewportW < 560 ? 10 : 24;
  const rowGap = 14;
  const labelH = 22;
  const groupGap = 22;
  const titleH = 28;

  const groups: Record<string, DollMerch[]> = {};
  merch.forEach((item) => {
    const key = item.line ?? 'KR';
    (groups[key] ??= []).push(item);
  });
  const present = LINE_ORDER.filter((line) => (groups[line]?.length ?? 0) > 0);

  const maxCols = Math.max(1, Math.floor((availW + gap) / (minCard + gap)));
  const cardW = Math.min(maxCard, (availW - (maxCols - 1) * gap) / maxCols);
  const cardH = cardW * 1.5 + 48;

  const positions: Record<string, { x: number; y: number }> = {};
  const labels: { line: string; x: number; y: number }[] = [];
  let yCursor = titleH;

  present.forEach((line, groupIndex) => {
    const items = groups[line];
    const cols = Math.min(maxCols, items.length);
    const rows = Math.ceil(items.length / cols);

    labels.push({ line, x: Math.round(shiftX), y: yCursor });
    yCursor += labelH;

    for (let row = 0; row < rows; row += 1) {
      const rowItems = items.slice(row * cols, row * cols + cols);
      const totalW = rowItems.length * cardW + (rowItems.length - 1) * gap;
      const startLeft = -totalW / 2;
      rowItems.forEach((item, i) => {
        positions[item.id] = {
          x: Math.round(startLeft + i * (cardW + gap) + shiftX),
          y: Math.round(yCursor),
        };
      });
      yCursor += cardH;
      if (row < rows - 1) yCursor += rowGap;
    }

    if (groupIndex < present.length - 1) yCursor += groupGap;
  });

  const totalH = yCursor;
  const overflows = totalH > availH;
  const visibleTop = -viewportH / 2 + padTop;
  const originY = overflows ? visibleTop : visibleTop + (availH - totalH) / 2;

  labels.forEach((label) => {
    label.y = Math.round(originY + label.y);
  });
  Object.values(positions).forEach((point) => {
    point.y = Math.round(originY + point.y);
  });

  return {
    positions,
    labels,
    titleY: Math.round(originY),
    overflows,
    cardW: Math.round(cardW),
  };
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
