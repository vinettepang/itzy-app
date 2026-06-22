/// <reference types="vite/client" />

declare module "*.mp4" {
  const src: string;
  export default src;
}

interface ImportMetaEnv {
  readonly VITE_API_BASE: string | undefined;
}

interface ImportMeta {
  readonly env: ImportMetaEnv;
}
