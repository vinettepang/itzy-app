import type * as THREE from 'three';
import type { SceneIndex } from './sceneConfig';

export type RefractionSceneParams = {
  bubbleTransparency: number;
  bubbleScale: number;
  cloudTimeMultiplier: number;
  spriteOpacity: number;
  maskProgress: number;
  bubbleXPos: number;
};

export type RefractionMaterials = {
  sky: THREE.ShaderMaterial;
  bubble: THREE.ShaderMaterial;
  lightning: THREE.ShaderMaterial;
  viewportPlane: THREE.ShaderMaterial;
  fillPlanes: THREE.ShaderMaterial;
  bubbleTextMat: THREE.MeshStandardMaterial;
  metalTextMat: THREE.MeshStandardMaterial;
};

export type RefractionSceneHandle = {
  scene: THREE.Scene;
  renderer: THREE.WebGLRenderer;
  params: RefractionSceneParams;
  materials: RefractionMaterials;
  bubble: THREE.Mesh;
  bubbleTextMesh: THREE.Mesh;
  metalTextMesh: THREE.Mesh;
  sceneIndex: SceneIndex;
  switchToScene1: () => void;
  switchToScene2: () => void;
  onPointerDown: () => void;
  onPointerUp: () => void;
  onPointerMove: (clientX: number, clientY: number) => void;
  resize: () => void;
  dispose: () => void;
  onThemeChange?: (index: SceneIndex) => void;
  onHoldChange?: (holding: boolean) => void;
};
