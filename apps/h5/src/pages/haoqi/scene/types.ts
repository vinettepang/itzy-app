import type { RefObject } from 'react';

export type HaoqiPointer = {
  x: number;
  y: number;
  ndcX: number;
  ndcY: number;
  active: boolean;
};

export type HaoqiSceneRefs = {
  bannerProgressRef: RefObject<number>;
  footerProgressRef: RefObject<number>;
  pointerRef: RefObject<HaoqiPointer>;
  hoveredWorkRef: RefObject<number>;
  workRevealRef: RefObject<number[]>;
  scrollRootRef: RefObject<HTMLElement | null>;
};

export type HaoqiSceneHandle = {
  dispose: () => void;
};
