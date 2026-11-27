import { useId, type CSSProperties } from 'react';

export type MoodId = 'awful' | 'bad' | 'neutral' | 'good' | 'great';
export type FinishId = 'glass' | 'neon' | 'jelly' | 'bubble';

export const MOODS: { id: MoodId; label: string; en: string; word: string; color: string }[] = [
  { id: 'awful', label: '糟透了', en: 'Awful', word: 'GLOOMY', color: '#a45cff' },
  { id: 'bad', label: '不太好', en: 'Bad', word: 'EXPECTANT', color: '#4c7bff' },
  { id: 'neutral', label: '一般般', en: 'Neutral', word: 'PEACEFUL', color: '#2fc4e0' },
  { id: 'good', label: '还不错', en: 'Good', word: 'VIBRANT', color: '#33c873' },
  { id: 'great', label: '超开心', en: 'Great', word: 'AMICABLE', color: '#ff5b86' },
];

export const FINISHES: { id: FinishId; label: string }[] = [
  { id: 'glass', label: '玻璃泡泡' },
  { id: 'neon', label: '霓虹发光' },
  { id: 'jelly', label: '果冻' },
  { id: 'bubble', label: '透明气泡' },
];

/** 尺寸足够大时，透明气泡外沿绕一圈心情英文 */
const ARC_MIN_SIZE = 56;

export const moodOf = (id: MoodId) => MOODS.find((m) => m.id === id) ?? MOODS[3];

function Face({ mood }: { mood: MoodId }) {
  const eyes =
    mood === 'great' ? (
      <path d="M9.5 15.5q2.5-3 5 0M21.5 15.5q2.5-3 5 0" fill="none" strokeWidth="1.8" strokeLinecap="round" />
    ) : (
      <>
        <ellipse cx="12.5" cy="15" rx="1.6" ry="2.1" />
        <ellipse cx="23.5" cy="15" rx="1.6" ry="2.1" />
      </>
    );
  const mouth = {
    awful: <path d="M12.5 25.5q5.5-5 11 0" fill="none" strokeWidth="1.8" strokeLinecap="round" />,
    bad: <path d="M13.5 24q4.5-3 9 0" fill="none" strokeWidth="1.8" strokeLinecap="round" />,
    neutral: <path d="M14 23h8" fill="none" strokeWidth="1.8" strokeLinecap="round" />,
    good: <path d="M13.5 21.5q4.5 4 9 0" fill="none" strokeWidth="1.8" strokeLinecap="round" />,
    great: <path d="M12.5 20.5q5.5 7.5 11 0z" strokeWidth="1.2" strokeLinejoin="round" />,
  }[mood];
  const brows =
    mood === 'awful' ? (
      <path d="M9.5 10.5l5 1.6M26.5 10.5l-5 1.6" fill="none" strokeWidth="1.5" strokeLinecap="round" />
    ) : null;
  return (
    <svg className="mood-orb__face" viewBox="0 0 36 36" aria-hidden>
      {brows}
      {eyes}
      {mouth}
    </svg>
  );
}

function ArcLabel({ text }: { text: string }) {
  const id = useId().replace(/:/g, '');
  return (
    <svg className="mood-orb__arc" viewBox="0 0 100 100" aria-hidden>
      <path id={`arc-${id}`} d="M7 54 A43 43 0 0 1 93 54" fill="none" />
      <text>
        <textPath href={`#arc-${id}`} startOffset="50%" textAnchor="middle">
          {text}
        </textPath>
      </text>
    </svg>
  );
}

type Props = {
  mood: MoodId;
  finish?: FinishId;
  size?: number;
  /** 0–1，错开气泡的形变节奏 */
  seed?: number;
  className?: string;
  style?: CSSProperties;
};

export default function MoodOrb({ mood, finish = 'glass', size = 40, seed = 0, className, style }: Props) {
  const m = moodOf(mood);
  const bubble = finish === 'bubble';
  return (
    <span
      className={`mood-orb mood-orb--${finish}${className ? ` ${className}` : ''}`}
      data-mood={mood}
      style={{
        ['--c' as string]: m.color,
        ['--size' as string]: `${size}px`,
        ['--seed' as string]: seed,
        ...style,
      }}
    >
      {bubble && (
        <span className="mood-orb__core">
          <span className="mood-orb__core-fill" />
        </span>
      )}
      <Face mood={mood} />
      {bubble && size >= ARC_MIN_SIZE && <ArcLabel text={m.word} />}
    </span>
  );
}
