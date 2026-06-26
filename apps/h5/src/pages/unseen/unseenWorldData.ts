import heroImg from '@/assets/hero.png';
import ticketBg from '@/assets/ticket-bg.png';
import emptyHk from '@/assets/empty-hk.png';
import tourPoster from '@/assets/tour-poster.webp';

export const UNSEEN_LETTERS = ['I', 'T', 'Z', 'Y'] as const;

export type UnseenTile = {
  id: string;
  src: string;
  label: string;
  x: number;
  y: number;
  w: number;
  rotate: number;
  depth: number;
};

/** 世界坐标中的浮动卡片（拖拽时按 depth 做视差） */
export const UNSEEN_TILES: UnseenTile[] = [
  {
    id: 'comeback',
    src: tourPoster,
    label: 'GOLD · Comeback',
    x: -420,
    y: -280,
    w: 280,
    rotate: -4,
    depth: 1.2,
  },
  {
    id: 'hero',
    src: heroImg,
    label: 'ITZY · Archive',
    x: 180,
    y: -120,
    w: 240,
    rotate: 3,
    depth: 0.9,
  },
  {
    id: 'ticket',
    src: ticketBg,
    label: 'World Tour',
    x: -120,
    y: 220,
    w: 300,
    rotate: -2,
    depth: 1.4,
  },
  {
    id: 'hk',
    src: emptyHk,
    label: 'MIDZY Zone',
    x: 520,
    y: 360,
    w: 260,
    rotate: 5,
    depth: 0.75,
  },
  {
    id: 'poster-2',
    src: tourPoster,
    label: 'Tunnel Vision',
    x: -680,
    y: 420,
    w: 220,
    rotate: -6,
    depth: 1.1,
  },
  {
    id: 'hero-2',
    src: heroImg,
    label: 'Born To Be',
    x: 760,
    y: -360,
    w: 200,
    rotate: 2,
    depth: 0.85,
  },
];

/** 背景巨型竖排字母锚点 */
export const UNSEEN_MONOLITHS = [
  { x: -900, y: -200, scale: 1 },
  { x: 0, y: 100, scale: 1.15 },
  { x: 880, y: -80, scale: 0.95 },
] as const;
