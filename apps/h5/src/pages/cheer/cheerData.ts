import type { CheerGuide } from './types';
import { girlsWillBeGirlsGuide } from './guides/girls-will-be-girls';
import { goldGuide } from './guides/gold';
import { imaginaryFriendGuide } from './guides/imaginary-friend';
import { kissAndTellGuide } from './guides/kiss-and-tell';
import { locoGuide } from './guides/loco';
import { mafiaInTheMorningGuide } from './guides/mafia-in-the-morning';
import { mottoGuide } from './guides/motto';
import { notShyGuide } from './guides/not-shy';
import { thatsANoNoGuide } from './guides/thats-a-no-no';
import { tunnelVisionGuide } from './guides/tunnel-vision';
import { wannabeGuide } from './guides/wannabe';

export type {
  CheerAccent,
  CheerGuide,
  CheerLine,
  CheerSpan,
  CheerTone,
} from './types';
export { songTitleToCheerSlug } from './types';

const GUIDES: CheerGuide[] = [
  tunnelVisionGuide,
  girlsWillBeGirlsGuide,
  kissAndTellGuide,
  wannabeGuide,
  imaginaryFriendGuide,
  mottoGuide,
  goldGuide,
  mafiaInTheMorningGuide,
  thatsANoNoGuide,
  notShyGuide,
  locoGuide,
];

export const CHEER_GUIDES: Record<string, CheerGuide> = Object.fromEntries(
  GUIDES.map((g) => [g.slug, g]),
);
