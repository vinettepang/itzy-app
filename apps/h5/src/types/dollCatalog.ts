export type CatalogMember = {
  member: string;
  character?: string;
  twinzyName?: string;
  filename: string;
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
