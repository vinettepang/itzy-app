export type SongLine = {
  ko: string;
  zh: string;
  cheer?: string;
};

/** 专辑语种 */
export type AlbumMarket = '韩语' | '日语' | '英语';

/** 专辑形态 */
export type AlbumType = '正规' | '迷你' | '精选' | '单曲';

export type AlbumEntry = {
  /** 专辑名 */
  name: string;
  /** 发行时间 YYYY-MM-DD */
  releaseDate: string;
  /** 正规 / 迷你 / 精选 / 单曲 */
  albumType: AlbumType;
  /** 韩语 / 日语 / 英语专 */
  market: AlbumMarket;
  /** 主打曲应援歌词（可选） */
  lines?: SongLine[];
};

/** 按发行时间排序的完整碟片列表 */
export const ALBUMS: AlbumEntry[] = [
  {
    name: "IT'z ICY",
    releaseDate: '2019-07-29',
    albumType: '迷你',
    market: '韩语',
    lines: [
      { ko: "Sorry, I'm not sorry", zh: '抱歉，但我不感到抱歉' },
      { ko: '눈치는 난 보지 않아', zh: '我不看眼色' },
    ],
  },
  {
    name: "IT'z ME",
    releaseDate: '2020-03-09',
    albumType: '迷你',
    market: '韩语',
    lines: [
      { ko: 'I wanna be me, me, me', zh: '我想做自己', cheer: 'MIDZY!' },
      { ko: "I don't wanna be somebody", zh: '我不想成为别人' },
    ],
  },
  {
    name: 'Not Shy',
    releaseDate: '2020-08-17',
    albumType: '迷你',
    market: '韩语',
    lines: [
      { ko: 'Not shy, not me', zh: '不害羞，这就是我', cheer: 'Yeji!' },
      { ko: '부끄럽지 않아', zh: '并不害羞' },
    ],
  },
  {
    name: 'GUESS WHO',
    releaseDate: '2021-04-30',
    albumType: '迷你',
    market: '韩语',
    lines: [
      { ko: 'You got me loco, loco', zh: '你让我疯狂', cheer: 'Ryujin!' },
      { ko: '난 네게 미쳤어', zh: '我为你着迷' },
    ],
  },
  {
    name: 'CRAZY IN LOVE',
    releaseDate: '2021-09-24',
    albumType: '正规',
    market: '韩语',
    lines: [
      { ko: 'LOCO', zh: '为你疯狂', cheer: 'ITZY!' },
      { ko: 'Crazy in love', zh: '为爱疯狂' },
    ],
  },
  {
    name: "IT'z ITZY",
    releaseDate: '2021-12-22',
    albumType: '精选',
    market: '日语',
    lines: [
      { ko: 'DALLA DALLA', zh: '我与众不同', cheer: 'MIDZY!' },
      { ko: 'WANNABE', zh: '我想做自己' },
    ],
  },
  {
    name: 'Voltage',
    releaseDate: '2022-04-06',
    albumType: '单曲',
    market: '日语',
    lines: [
      { ko: 'Voltage', zh: '电压全开', cheer: 'ITZY!' },
      { ko: 'Spark it up', zh: '点燃全场' },
    ],
  },
  {
    name: 'CHECKMATE',
    releaseDate: '2022-07-15',
    albumType: '迷你',
    market: '韩语',
    lines: [
      { ko: 'Got my sneakers on', zh: '穿上我的球鞋', cheer: 'Lia!' },
      { ko: 'Ready, set, go', zh: '预备，开始' },
    ],
  },
  {
    name: 'Blah Blah Blah',
    releaseDate: '2022-10-05',
    albumType: '单曲',
    market: '日语',
    lines: [
      { ko: 'Blah blah blah', zh: '别再多说', cheer: 'ITZY!' },
      { ko: 'Talk less', zh: '少说废话' },
    ],
  },
  {
    name: 'CHESHIRE',
    releaseDate: '2022-11-30',
    albumType: '迷你',
    market: '韩语',
    lines: [
      { ko: "I'm a cheshire", zh: '我像柴郡猫', cheer: 'Chaeryeong!' },
      { ko: "Smile but I'm sharp", zh: '微笑却很锋利' },
    ],
  },
  {
    name: 'KILL MY DOUBT',
    releaseDate: '2023-07-31',
    albumType: '迷你',
    market: '韩语',
    lines: [
      { ko: 'Cake cake cake', zh: '蛋糕蛋糕蛋糕', cheer: 'ITZY!' },
      { ko: "Can't stop me", zh: '无法阻止我' },
    ],
  },
  {
    name: 'RINGO',
    releaseDate: '2023-10-18',
    albumType: '正规',
    market: '日语',
    lines: [
      { ko: 'RINGO', zh: '苹果之环', cheer: 'ITZY!' },
      { ko: 'Round and round', zh: '轮回不止' },
    ],
  },
  {
    name: 'BORN TO BE',
    releaseDate: '2024-01-08',
    albumType: '迷你',
    market: '韩语',
    lines: [
      { ko: 'Nobody can touch me', zh: '没人能触碰我', cheer: 'Yuna!' },
      { ko: "I'm untouchable", zh: '我遥不可及' },
    ],
  },
  {
    name: 'Algorhythm',
    releaseDate: '2024-05-15',
    albumType: '单曲',
    market: '日语',
    lines: [
      { ko: 'Algorhythm', zh: '算法律动', cheer: 'ITZY!' },
      { ko: 'Feel the beat', zh: '感受节拍' },
    ],
  },
  {
    name: 'GOLD',
    releaseDate: '2024-10-15',
    albumType: '迷你',
    market: '韩语',
    lines: [
      { ko: "We're going gold", zh: '我们奔向金色', cheer: 'GOLD!' },
      { ko: 'Shine like gold', zh: '如金闪耀' },
    ],
  },
  {
    name: 'Girls Will Be Girls',
    releaseDate: '2025-06-09',
    albumType: '迷你',
    market: '韩语',
    lines: [
      { ko: 'Girls will be girls', zh: '女孩就是女孩', cheer: 'MIDZY!' },
      { ko: 'We do what we want', zh: '我们做自己想做的' },
    ],
  },
  {
    name: 'Collector',
    releaseDate: '2025-10-08',
    albumType: '正规',
    market: '日语',
    lines: [
      { ko: 'Collector', zh: '收藏家', cheer: 'ITZY!' },
      { ko: 'Keep collecting', zh: '持续收藏' },
    ],
  },
  {
    name: 'TUNNEL VISION',
    releaseDate: '2025-11-10',
    albumType: '迷你',
    market: '韩语',
    lines: [
      { ko: 'One shot, kill shot', zh: '一击必杀', cheer: 'MIDZY!' },
      { ko: 'Game over', zh: '游戏结束' },
    ],
  },
  {
    name: 'Motto',
    releaseDate: '2026-05-18',
    albumType: '迷你',
    market: '韩语',
    lines: [
      { ko: "You're my imaginary friend", zh: '你是我假想的朋友' },
      { ko: "Don't let me go", zh: '别让我离开' },
    ],
  },
];

/** @deprecated 使用 ALBUMS */
export const SONGS = ALBUMS;
