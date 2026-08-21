export type CheerTone = 'lyric' | 'cheer' | 'echo';

export type CheerAccent = 'cyan' | 'pink' | 'red' | 'orange' | 'blue';

export type CheerSpan = {
  text: string;
  tone: CheerTone;
};

export type CheerLine = {
  spans: CheerSpan[];
};

export type CheerGuide = {
  slug: string;
  title: string;
  credit: string;
  accent?: CheerAccent;
  columns: [CheerLine[], CheerLine[]];
};

export function L(...parts: Array<string | CheerSpan>): CheerLine {
  return {
    spans: parts.map((p) =>
      typeof p === 'string' ? { text: p, tone: 'lyric' as const } : p,
    ),
  };
}

export function cheer(text: string): CheerSpan {
  return { text, tone: 'cheer' };
}

export function echo(text: string): CheerSpan {
  return { text, tone: 'echo' };
}

export function songTitleToCheerSlug(title: string): string {
  return title
    .trim()
    .toLowerCase()
    .replace(/&/g, 'and')
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-|-$/g, '');
}
