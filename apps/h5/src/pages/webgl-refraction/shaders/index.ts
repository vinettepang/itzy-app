import bubbleFrag from './bubbleFrag.glsl?raw';
import bubbleVert from './bubbleVert.glsl?raw';
import lightningFrag from './lightningFrag.glsl?raw';
import lightningVert from './lightningVert.glsl?raw';
import maskFrag from './maskFrag.glsl?raw';
import maskVert from './maskVert.glsl?raw';
import skyFrag from './skyFrag.glsl?raw';
import skyVert from './skyVert.glsl?raw';

export const SHADERS = {
  bubbleVert,
  bubbleFrag,
  skyVert,
  skyFrag,
  lightningVert,
  lightningFrag,
  maskVert,
  maskFrag,
} as const;
