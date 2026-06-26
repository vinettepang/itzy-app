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
  /** 主打曲 */
  titleTrack: string;
  /** 专辑曲目 */
  tracks: string[];
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
    titleTrack: 'ICY',
    tracks: [
      'ICY',
      'CHERRY',
      "IT'z SUMMER",
      "DON'T GIVE WHAT THEY WANT",
      'SHOOT!',
      'TOUCH',
      "THAT'S A NO NO",
    ],
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
    titleTrack: 'WANNABE',
    tracks: [
      'WANNABE',
      'ICY (Remix)',
      'LAZY',
      '24HOURS',
      'WANT IT?',
      'HONEY',
    ],
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
    titleTrack: 'Not Shy',
    tracks: [
      'Not Shy',
      'YOU MAKE ME',
      'SHOOT TO KILL',
      'TALK',
      'BE IN LOVE',
      'LOCO',
    ],
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
    titleTrack: 'LOCO',
    tracks: [
      'In the morning',
      'Kidding Me',
      'WHAT I WANT',
      'Sorry Not Sorry',
      'LOCO',
      'DALLA DALLA (English Ver.)',
    ],
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
    titleTrack: 'LOCO',
    tracks: [
      'LOCO',
      'SWIPE',
      'Sooo LUCKY',
      '#Twenty',
      'B[OO]M-BOXX',
      'GAS ME UP',
      'LOVE is',
      "Chillin' Chillin'",
    ],
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
    titleTrack: 'DALLA DALLA',
    tracks: [
      'DALLA DALLA (Japanese Ver.)',
      'WANNABE (Japanese Ver.)',
      'ICY (Japanese Ver.)',
      'Not Shy (Japanese Ver.)',
      'In the morning (Japanese Ver.)',
      'LOCO (Japanese Ver.)',
    ],
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
    titleTrack: 'Voltage',
    tracks: ['Voltage', 'Voltage (Instrumental)'],
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
    titleTrack: 'Sneakers',
    tracks: [
      'Sneakers',
      'RACER',
      'WHAT I WANT',
      'Free Fall',
      '365',
      'Domino',
      'LOVE is',
    ],
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
    titleTrack: 'Blah Blah Blah',
    tracks: ['Blah Blah Blah', 'Blah Blah Blah (Instrumental)'],
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
    titleTrack: 'Cheshire',
    tracks: ['Cheshire', 'Nobody', 'Freak', 'VEHICLE', 'Shoot'],
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
    titleTrack: 'CAKE',
    tracks: [
      'CAKE',
      'Bet On Me',
      'None of My Business',
      'Psychic Lover',
      'Kill Shot',
      'Bricks',
      'Highway with you',
    ],
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
    titleTrack: 'RINGO',
    tracks: [
      'RINGO',
      'Mine',
      'Blah Blah Blah',
      'Buzz Buzz',
      'What is Love?',
    ],
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
    titleTrack: 'UNTOUCHABLE',
    tracks: [
      'BORN TO BE',
      'UNTOUCHABLE',
      'Run Away',
      'MISFIT',
      'Yet, but',
      'You Want More',
      'BORN TO BE (OT5 Ver.)',
      'Dynamite',
    ],
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
    titleTrack: 'Algorhythm',
    tracks: ['Algorhythm', 'Algorhythm (Instrumental)'],
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
    titleTrack: 'GOLD',
    tracks: [
      'GOLD',
      'Imaginary Friend',
      'Bad Days',
      'DESIRE',
      'TREASURE',
      'Officer',
    ],
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
    titleTrack: 'Girls Will Be Girls',
    tracks: ['Girls Will Be Girls', 'Like Friends', 'Never Ever'],
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
    titleTrack: 'Collector',
    tracks: [
      'Collector',
      'Kiss & Tell',
      'Playlist',
      'Diamond',
      'Rewind',
    ],
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
    titleTrack: 'KILL SHOT',
    tracks: ['KILL SHOT', 'TUNNEL VISION', 'No Limit', 'Fever'],
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
    titleTrack: 'Imaginary Friend',
    tracks: ['Imaginary Friend', 'Motto', 'Supernatural', 'On Your Mark'],
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

export function formatAlbumLine(album: AlbumEntry) {
  return `${album.name} · ${album.titleTrack}`;
}
