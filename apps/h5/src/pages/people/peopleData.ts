/**
 * /people 页面数据 —— 逐项对齐 facilagencia.com/people/
 *
 * 字段来源（真站 DOM）：
 *   speed   = .holder 的 --speed      纵向视差速度
 *   speedX  = .holder 的 --speed-x    横向漂移速度
 *   nameSpeed = .name 的 --speed      名字标签自身的纵向视差
 *   aspect  = .media-holder 的 --aspect（高/宽）
 *   colsStart = 12 栏网格中的起始列（错落排布）
 */

const CDN = 'https://facil.cuchillo-black.tools/wp-content/uploads/2026/01';

export type Person = {
  name: string;
  image: string;
  speed: number;
  speedX: number;
  nameSpeed: number;
  aspect: number;
  colsStart: number;
};

export const PEOPLE: Person[] = [
  { name: 'María',   image: `${CDN}/MariaA_Web_Ok.jpg`,                                  speed: 0,   speedX: 0.1,   nameSpeed: -0.05, aspect: 1.1713, colsStart: 9 },
  { name: 'Mónica',  image: `${CDN}/Monica_Web_Ok.jpg`,                                  speed: 0.3, speedX: -0.12, nameSpeed: 0.15,  aspect: 1.1713, colsStart: 1 },
  { name: 'Ana',     image: `${CDN}/Ana_Web_Ok-916x1075.jpg`,                            speed: 0.1, speedX: 0.1,   nameSpeed: -0.05, aspect: 1.1735, colsStart: 4 },
  { name: 'Janet',   image: `${CDN}/Janet_Web_Ok.jpg`,                                   speed: 0.2, speedX: -0.1,  nameSpeed: -0.05, aspect: 1.1713, colsStart: 2 },
  { name: 'Adriana', image: `${CDN}/Adriana_Web_Ok.jpg`,                                 speed: 0,   speedX: -0.1,  nameSpeed: 0.15,  aspect: 1.1713, colsStart: 3 },
  { name: 'Javier',  image: `${CDN}/Javi_Web_Ok.jpg`,                                    speed: 0.3, speedX: 0.12,  nameSpeed: -0.15, aspect: 1.1713, colsStart: 7 },
  { name: 'Gonzaga', image: `${CDN}/Gonzaga_Web_Ok-916x1075.jpg`,                        speed: 0.2, speedX: 0.1,   nameSpeed: 0.1,   aspect: 1.1735, colsStart: 6 },
  { name: 'Néstor',  image: `${CDN}/Nestor_Web_Ok-916x1073.jpg`,                         speed: 0.1, speedX: 0.08,  nameSpeed: -0.1,  aspect: 1.1713, colsStart: 5 },
  { name: 'Rata',    image: `${CDN}/WhatsApp-Image-2026-01-21-at-17.22.59-916x1221.jpeg`, speed: 0,  speedX: 0.08,  nameSpeed: -0.1,  aspect: 1.3329, colsStart: 8 },
];
