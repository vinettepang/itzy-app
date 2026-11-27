/**
 * 行程页英文名映射。
 *
 * 后端 /api/schedules 的 venue 只有 posterDisplayName / city 的中文名，
 * 列表需要展示英文，这里按中文名做映射；查不到时回退原文，避免显示空白。
 */

const VENUE_EN: Record<string, string> = {
  蚕室室内体育馆: 'Jamsil Arena',
  约翰·凯因体育馆: 'John Cain Arena',
  'TikTok 娱乐中心': 'TikTok Entertainment Center',
  史帕克体育馆: 'Spark Arena',
  武藏野之森综合体育广场: 'Musashino Forest Sport Plaza',
  亚洲国际博览馆: 'AsiaWorld-Expo',
  高雄巨蛋: 'Kaohsiung Arena',
  'Impact体育馆': 'IMPACT Arena',
  亚洲购物中心体育馆: 'Mall of Asia Arena',
  威尼斯人综艺馆: 'The Venetian Theatre',
  台北小巨蛋: 'Taipei Arena',
  温布利体育馆: 'Wembley Arena',
  巴黎天顶体育馆: 'Zénith Paris',
  法兰克福展览中心: 'Messe Frankfurt',
  新加坡室内体育馆: 'Singapore Indoor Stadium',
};

const CITY_EN: Record<string, string> = {
  首尔: 'Seoul',
  墨尔本: 'Melbourne',
  悉尼: 'Sydney',
  奥克兰: 'Auckland',
  东京: 'Tokyo',
  香港: 'Hong Kong',
  高雄: 'Kaohsiung',
  台北: 'Taipei',
  曼谷: 'Bangkok',
  马尼拉: 'Manila',
  澳门: 'Macao',
  伦敦: 'London',
  阿姆斯特丹: 'Amsterdam',
  巴黎: 'Paris',
  法兰克福: 'Frankfurt',
  新加坡: 'Singapore',
  纽约: 'New York',
  洛杉矶: 'Los Angeles',
  大阪: 'Osaka',
  横滨: 'Yokohama',
  雅加达: 'Jakarta',
  吉隆坡: 'Kuala Lumpur',
  迪拜: 'Dubai',
  柏林: 'Berlin',
  马德里: 'Madrid',
  米兰: 'Milan',
  多伦多: 'Toronto',
  芝加哥: 'Chicago',
};

function translate(map: Record<string, string>, value?: string | null): string {
  const key = (value ?? '').trim();
  if (!key) return '';
  if (map[key]) return map[key];
  // 兼容「AFAS Live」这类本身已是英文的名字，以及中文名里夹带英文的情况
  if (/^[\x00-\x7F\s·.'&-]+$/.test(key)) return key;
  for (const [zh, en] of Object.entries(map)) {
    if (key.includes(zh)) return key.replace(zh, en);
  }
  return key;
}

export function venueEn(displayName?: string | null): string {
  return translate(VENUE_EN, displayName);
}

export function cityEn(city?: string | null): string {
  return translate(CITY_EN, city);
}
