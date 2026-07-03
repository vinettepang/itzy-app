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
import img0072 from '@/assets/img/albumhead/0072.jpg';
import img0074 from '@/assets/img/albumhead/0074.jpg';
import img0075 from '@/assets/img/albumhead/0075.jpg';
import img0077 from '@/assets/img/albumhead/0077.jpg';
import img0078 from '@/assets/img/albumhead/0078.jpg';
import heroImg from '@/assets/hero.png';
import tourPoster from '@/assets/tour-poster.webp';

export type DollMerch = {
  id: string;
  src: string;
  label: string;
};

export type UnseenDoll = {
  id: string;
  name: string;
  series: string;
  src: string;
  size: string;
  tourCycle: string;
  description: string;
  worldX: number;
  worldY: number;
  merch: DollMerch[];
};

const MERCH_POOL: DollMerch[] = [
  { id: 'm-pc', src: img0048, label: 'Photocard' },
  { id: 'm-key', src: img0050, label: 'Keyring' },
  { id: 'm-pouch', src: img0052, label: 'Pouch' },
  { id: 'm-stand', src: img0054, label: 'Standee' },
  { id: 'm-badge', src: img0055, label: 'Badge' },
  { id: 'm-mini', src: img0063, label: 'Mini Plush' },
  { id: 'm-tote', src: img0067, label: 'Tote' },
  { id: 'm-pin', src: img0072, label: 'Pin Set' },
  { id: 'm-acrylic', src: img0074, label: 'Acrylic' },
  { id: 'm-ticket', src: tourPoster, label: 'Tour Goods' },
  { id: 'm-poster', src: img0075, label: 'Poster' },
  { id: 'm-sticker', src: img0077, label: 'Sticker' },
  { id: 'm-card', src: img0078, label: 'Trading Card' },
  { id: 'm-hero', src: heroImg, label: 'Archive Print' },
];

function dollMerch(start: number): DollMerch[] {
  return MERCH_POOL.slice(start, start + 6).map((item, i) => ({
    ...item,
    id: `${item.id}-${start + i}`,
  }));
}

function worldPos(index: number) {
  const col = (index % 5) - 2;
  const row = Math.floor(index / 5);
  return { worldX: col * 400, worldY: row * 520 - 260 };
}

/** 娃娃展示：第一行 WDZY，第二行 Twinzy，各五位成员 */
export const UNSEEN_DOLLS: UnseenDoll[] = [
  {
    id: 'wdzy-yeji',
    name: 'Yeji',
    series: 'WDZY',
    src: img0004,
    size: '10cm',
    tourCycle: 'Tour 3',
    description: 'WDZY Yeji from the 3rd world tour cycle. Soft body with signature stage outfit details.',
    ...worldPos(0),
    merch: dollMerch(0),
  },
  {
    id: 'wdzy-lia',
    name: 'Lia',
    series: 'WDZY',
    src: img0010,
    size: '10cm',
    tourCycle: 'Tour 3',
    description: 'WDZY Lia plush with braided hairstyle and tour-exclusive color palette.',
    ...worldPos(1),
    merch: dollMerch(1),
  },
  {
    id: 'wdzy-ryujin',
    name: 'Ryujin',
    series: 'WDZY',
    src: img0011,
    size: '10cm',
    tourCycle: 'Tour 3',
    description: 'WDZY Ryujin edition featuring iconic short hair and performance jacket sculpt.',
    ...worldPos(2),
    merch: dollMerch(2),
  },
  {
    id: 'wdzy-chaeryeong',
    name: 'Chaeryeong',
    series: 'WDZY',
    src: img0016,
    size: '10cm',
    tourCycle: 'Tour 3',
    description: 'WDZY Chaeryeong with long hair variant and delicate accessory set.',
    ...worldPos(3),
    merch: dollMerch(3),
  },
  {
    id: 'wdzy-yuna',
    name: 'Yuna',
    series: 'WDZY',
    src: img0021,
    size: '10cm',
    tourCycle: 'Tour 3',
    description: 'WDZY Yuna doll with bright twin-tail styling from the tour merchandise line.',
    ...worldPos(4),
    merch: dollMerch(4),
  },
  {
    id: 'twinzy-yeji',
    name: 'Yeji',
    series: 'Twinzy',
    src: img0023,
    size: '15cm',
    tourCycle: 'FM 2',
    description: 'Twinzy Yeji from the 2nd fan meeting series. Larger format with paired outfit theme.',
    ...worldPos(5),
    merch: dollMerch(5),
  },
  {
    id: 'twinzy-lia',
    name: 'Lia',
    series: 'Twinzy',
    src: img0027,
    size: '15cm',
    tourCycle: 'FM 2',
    description: 'Twinzy Lia plush designed for display pairs alongside the Twinzy lineup.',
    ...worldPos(6),
    merch: dollMerch(6),
  },
  {
    id: 'twinzy-ryujin',
    name: 'Ryujin',
    series: 'Twinzy',
    src: img0029,
    size: '15cm',
    tourCycle: 'FM 2',
    description: 'Twinzy Ryujin with FM-exclusive styling and premium fabric finish.',
    ...worldPos(7),
    merch: dollMerch(7),
  },
  {
    id: 'twinzy-chaeryeong',
    name: 'Chaeryeong',
    series: 'Twinzy',
    src: img0036,
    size: '15cm',
    tourCycle: 'FM 2',
    description: 'Twinzy Chaeryeong featuring fan meeting photocard-matched costume details.',
    ...worldPos(8),
    merch: dollMerch(8),
  },
  {
    id: 'twinzy-yuna',
    name: 'Yuna',
    series: 'Twinzy',
    src: img0039,
    size: '15cm',
    tourCycle: 'FM 2',
    description: 'Twinzy Yuna closing the FM 2 set with high-saturation hair and stage boots.',
    ...worldPos(9),
    merch: dollMerch(9),
  },
];

export function getDollById(id: string) {
  return UNSEEN_DOLLS.find((doll) => doll.id === id);
}

export const UNSEEN_OVERVIEW_SCALE = 0.3;

/** 周边图平整网格：上排 3 + 下排 3，娃娃居中置顶 */
export const UNSEEN_MERCH_LAYOUT = [
  { x: -166, y: 24 },
  { x: -50, y: 24 },
  { x: 66, y: 24 },
  { x: -166, y: 190 },
  { x: -50, y: 190 },
  { x: 66, y: 190 },
] as const;
