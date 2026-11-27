import type { CSSProperties } from 'react';
import type { AlbumEntry } from '../songs/songsData';

type Motif = 'figure' | 'face' | 'void' | 'field' | 'bloom' | 'smoke';
type Art = { a: string; b: string; c: string; motif: Motif };

/** 每张专辑一张雾面玻璃板：低饱和油彩 + 虚焦剪影 */
const ART: Record<string, Art> = {
  "IT'z ICY": { a: '#efe6b0', b: '#c8b86a', c: '#8aa8b8', motif: 'bloom' },
  "IT'z ME": { a: '#e8b4c4', b: '#a06078', c: '#4a2838', motif: 'face' },
  'Not Shy': { a: '#e02028', b: '#7a0c12', c: '#2a0608', motif: 'face' },
  'GUESS WHO': { a: '#3a4a68', b: '#121820', c: '#c8c4bc', motif: 'figure' },
  'CRAZY IN LOVE': { a: '#2a080c', b: '#080406', c: '#c01828', motif: 'void' },
  "IT'z ITZY": { a: '#f0ece6', b: '#c8c2ba', c: '#8a847c', motif: 'smoke' },
  Voltage: { a: '#f0e060', b: '#1a2040', c: '#e8d878', motif: 'field' },
  CHECKMATE: { a: '#e8e2d8', b: '#b8b0a4', c: '#2a2624', motif: 'figure' },
  'Blah Blah Blah': { a: '#b8d8e8', b: '#6a8898', c: '#f0f6f8', motif: 'bloom' },
  CHESHIRE: { a: '#3a2048', b: '#120818', c: '#e0b050', motif: 'face' },
  'KILL MY DOUBT': { a: '#d4b060', b: '#3a2810', c: '#f0e0b0', motif: 'field' },
  RINGO: { a: '#d82820', b: '#501010', c: '#f07060', motif: 'bloom' },
  'BORN TO BE': { a: '#2a2a2a', b: '#080808', c: '#b8b8b8', motif: 'void' },
  Algorhythm: { a: '#204060', b: '#0a1420', c: '#48c8e0', motif: 'smoke' },
  GOLD: { a: '#e0b040', b: '#5a3a10', c: '#f4e0a8', motif: 'bloom' },
  'Girls Will Be Girls': { a: '#f0c4d0', b: '#d08098', c: '#4a2830', motif: 'face' },
  Collector: { a: '#4a6860', b: '#1a2820', c: '#e0c070', motif: 'field' },
  'TUNNEL VISION': { a: '#1a1a1a', b: '#060606', c: '#88a050', motif: 'void' },
  Motto: { a: '#ece6dc', b: '#b8b2a8', c: '#2a3048', motif: 'figure' },
};

const FALLBACK: Art = { a: '#c8c2ba', b: '#4a4844', c: '#e8e2da', motif: 'smoke' };
const MOTIFS: Motif[] = ['figure', 'face', 'void', 'field', 'bloom', 'smoke'];

function Ghost({ motif }: { motif: Motif }) {
  if (motif === 'figure') {
    return (
      <svg className="acover__ghost" viewBox="0 0 100 100" aria-hidden>
        <ellipse cx="49" cy="27" rx="7.5" ry="9" />
        <path d="M42 38c4-2 10-2 16 0l3 8-4 40H43l-4-40z" />
        <path d="M43 48l-10 28M57 48l10 26" fill="none" stroke="currentColor" strokeWidth="3.2" strokeLinecap="round" />
      </svg>
    );
  }
  if (motif === 'face') {
    return (
      <svg className="acover__ghost" viewBox="0 0 100 100" aria-hidden>
        <ellipse cx="54" cy="46" rx="22" ry="26" />
        <ellipse cx="46" cy="44" rx="2.4" ry="1.6" fill="var(--b)" />
        <ellipse cx="62" cy="45" rx="2.4" ry="1.6" fill="var(--b)" />
      </svg>
    );
  }
  if (motif === 'field') {
    return (
      <svg className="acover__ghost" viewBox="0 0 100 100" aria-hidden>
        <path d="M0 62 Q28 48 52 60 T100 52 V100 H0z" />
      </svg>
    );
  }
  if (motif === 'smoke') {
    return (
      <svg className="acover__ghost" viewBox="0 0 100 100" aria-hidden>
        <ellipse cx="32" cy="40" rx="18" ry="28" />
        <ellipse cx="68" cy="62" rx="22" ry="16" />
      </svg>
    );
  }
  return (
    <svg className="acover__ghost" viewBox="0 0 100 100" aria-hidden>
      <ellipse cx="42" cy="48" rx="28" ry="22" />
      <ellipse cx="70" cy="30" rx="14" ry="10" opacity="0.55" />
    </svg>
  );
}

type Props = {
  album: AlbumEntry;
  /** 0 为专辑封面，1-3 为同色系的衍生板（拼贴用） */
  variant?: number;
  label?: boolean;
  round?: boolean;
  className?: string;
  style?: CSSProperties;
};

export default function AlbumCover({ album, variant = 0, label = false, round = false, className, style }: Props) {
  const art = ART[album.name] ?? FALLBACK;
  const v = variant % 4;
  const [a, b, c] = v === 1 ? [art.c, art.a, art.b] : v === 2 ? [art.b, art.c, art.a] : v === 3 ? [art.a, art.c, art.b] : [art.a, art.b, art.c];
  const motif = v ? MOTIFS[(MOTIFS.indexOf(art.motif) + v * 2) % MOTIFS.length] : art.motif;

  return (
    <span
      className={`acover${round ? ' acover--round' : ''}${className ? ` ${className}` : ''}`}
      data-motif={motif}
      style={{ ['--a' as string]: a, ['--b' as string]: b, ['--c' as string]: c, ['--shift' as string]: `${v * 18}%`, ...style }}
      aria-hidden
    >
      <i className="acover__fog" />
      <Ghost motif={motif} />
      <i className="acover__grain" />
      <i className="acover__glass" />
      {label && <b className="acover__name">{album.name}</b>}
    </span>
  );
}
