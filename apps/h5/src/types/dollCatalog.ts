export type CatalogMember = {
  member: string;
  character?: string;
  twinzyName?: string;
  filename: string;
  image?: string;
  model?: string;
  jan?: string;
  size?: string;
};

export type CatalogProduct = {
  id: string;
  series: string;
  collection: string;
  year: number;
  category: string;
  productName: string;
  region: string[];
  members: CatalogMember[];
  status: string;
  tags: string[];
  image: string;
  officialSource: string;
  line?: 'KR' | 'JP' | 'SEGA';
  release?: string;
  size?: string;
  sizes?: Record<string, string>;
};

export type DollCatalog = {
  meta: {
    project: string;
    version: string;
    description: string;
    note: string;
    created: string;
  };
  wdzy: CatalogProduct[];
  twinzy: CatalogProduct[];
};

export type DollMerch = {
  id: string;
  src: string;
  label: string;
  productName: string;
  category: string;
  collection: string;
  year: number;
  model?: string;
  jan?: string;
  line?: 'KR' | 'JP' | 'SEGA';
  size?: string;
  release?: string;
  region?: string[];
  x?: number;
  y?: number;
  gridX?: number;
  gridY?: number;
};

export type UnseenDoll = {
  id: string;
  name: string;
  series: string;
  characterName: string;
  src: string;
  collection: string;
  year: number;
  category: string;
  productName: string;
  status: string;
  officialSource: string;
  description: string;
  worldX: number;
  worldY: number;
  merch: DollMerch[];
};
