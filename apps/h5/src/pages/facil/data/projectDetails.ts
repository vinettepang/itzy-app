const CDN = 'https://facil.cuchillo-black.tools/wp-content/uploads';

export type ProjectMedia = {
  image: string;
  poster?: string;
  aspect: number;
  label?: string;
};

export type ProjectBlock =
  | { type: 'full'; media: ProjectMedia; pos?: 1 | 2 | 3 | 4 }
  | { type: 'grid'; align?: 'center' | 'top' | 'bottom'; items: ProjectMedia[] };

export type ProjectDetail = {
  slug: string;
  client: string;
  intro: string;
  title: string;
  tagline: string;
  body: string;
  hero: ProjectMedia;
  blocks: ProjectBlock[];
};

export const PROJECT_DETAILS: Record<string, ProjectDetail> = {
  'popeyes-nada-mas-nada-menos': {
    slug: 'popeyes-nada-mas-nada-menos',
    client: 'Popeyes',
    intro:
      'The Chicken Sandwich no tiene ingredientes secretos, ni sabores random. Tampoco tiene toppings locos ni versiones de famosos. The Chicken Sandwich tiene tres ingredientes, nada más.',
    title: 'Pollo, pepinillos y mayonesa. Nada más y nada menos.',
    tagline: 'Es la sencillez hecha hamburguesa... bueno, hecha sandwich.',
    body: `The Chicken Sandwich quiere convertirse en el ícono de la sencillez. Pocos ingredientes pero de la mejor calidad. Frente a la tendencia global de la exageración Popeyes apuesta por mantenerse original en su receta clásica, ya que, según han ido pasando los años, esta receta tan sencilla se ha vuelto relevante y diferencial por la excesiva complicación del resto, y eso tiene mucho valor.`,
    hero: {
      image: `${CDN}/2026/06/PLK_TCS_KV_01-916x515.jpg`,
      poster: `${CDN}/2026/06/PLK_TCS_KV_01-40x23.jpg`,
      aspect: 0.562,
    },
    blocks: [
      {
        type: 'full',
        pos: 4,
        media: {
          image: `${CDN}/2026/06/PLK_TCS_KV_01-916x515.jpg`,
          poster: `${CDN}/2026/06/PLK_TCS_KV_01-40x23.jpg`,
          aspect: 0.562,
          label: 'Ver video',
        },
      },
      {
        type: 'grid',
        align: 'center',
        items: [
          {
            image: `${CDN}/2026/06/PLK_TCS_KV_Coche-916x513.jpg`,
            poster: `${CDN}/2026/06/PLK_TCS_KV_Coche-40x22.jpg`,
            aspect: 0.56,
            label: 'Ver video',
          },
          {
            image: `${CDN}/2026/06/PLK_TCS_KV_Sol-916x513.jpg`,
            poster: `${CDN}/2026/06/PLK_TCS_KV_Sol-40x22.jpg`,
            aspect: 0.56,
            label: 'Ver video',
          },
          {
            image: `${CDN}/2026/06/PLK_TCS_KV_Amigas-916x513.jpg`,
            poster: `${CDN}/2026/06/PLK_TCS_KV_Amigas-40x22.jpg`,
            aspect: 0.56,
            label: 'Ver video',
          },
        ],
      },
    ],
  },
  'la-mejor-rebaja-de-las-rebajas': {
    slug: 'la-mejor-rebaja-de-las-rebajas',
    client: 'Láserum',
    intro: 'Cuando las rebajas se complican, hay que simplificar el mensaje.',
    title: 'La mejor rebaja de las rebajas.',
    tagline: 'Menos ruido, más resultado.',
    body: 'Una campaña directa para Láserum que convierte la promoción en algo fácil de entender y de recordar.',
    hero: {
      image: `${CDN}/2026/01/LASERUM_V2-4-e1769581191194-916x515.jpg`,
      aspect: 0.562,
    },
    blocks: [],
  },
  'popeyes-asi-si-asi-yes': {
    slug: 'popeyes-asi-si-asi-yes',
    client: 'Popeyes',
    intro: 'Así sí, así yes. Una campaña bilingüe con actitud.',
    title: 'Así sí, así yes.',
    tagline: 'Sabor con personalidad.',
    body: 'Popeyes sigue apostando por la claridad y el carácter en cada pieza.',
    hero: {
      image: `${CDN}/2025/12/Popeyes-ASAY-KV-916x515.jpg`,
      aspect: 0.562,
    },
    blocks: [],
  },
  unexpected: {
    slug: 'unexpected',
    client: 'Festina',
    intro: 'Lo inesperado también puede ser fácil de entender.',
    title: 'Unexpected.',
    tagline: 'Conectados con el tiempo.',
    body: 'Festina y Fácil exploran la sorpresa como herramienta de comunicación.',
    hero: {
      image: `${CDN}/2025/12/Festina-Connected-KV-1-916x390.jpg`,
      aspect: 0.426,
    },
    blocks: [],
  },
  'real-madrid-jude': {
    slug: 'real-madrid-jude',
    client: 'Real Madrid',
    intro: 'Un héroe, una historia, un mensaje claro.',
    title: 'Real Madrid × Jude.',
    tagline: 'Grandeza en pocas palabras.',
    body: 'Campaña hero para uno de los fichajes más relevantes del club.',
    hero: {
      image: `${CDN}/2025/09/Real-Madrid-KV-Hero-Jude-916x453.jpg`,
      aspect: 0.495,
    },
    blocks: [],
  },
  'pescanova-lo-bueno-sale-bien': {
    slug: 'pescanova-lo-bueno-sale-bien',
    client: 'Pescanova',
    intro: 'Lo bueno sale bien cuando el mensaje es honesto.',
    title: 'Lo bueno sale bien.',
    tagline: 'Calidad sin complicaciones.',
    body: 'Pescanova y Fácil apuestan por la sencillez como valor de marca.',
    hero: {
      image: `${CDN}/2025/09/Pescanova-2024-KV-916x511.jpg`,
      aspect: 0.558,
    },
    blocks: [],
  },
  'laserum-callao': {
    slug: 'laserum-callao',
    client: 'Láserum',
    intro: 'Una campaña vertical para un formato vertical.',
    title: 'Láserum Callao.',
    tagline: 'Presencia en la calle.',
    body: 'Key visual para la apertura de Láserum en Callao.',
    hero: {
      image: `${CDN}/2025/07/Facil-Laserum-Callao-Ingles_LR.jpg`,
      aspect: 1.429,
    },
    blocks: [],
  },
  'pescanova-ultima': {
    slug: 'pescanova-ultima',
    client: 'Pescanova',
    intro: 'El último spot que resume toda la campaña.',
    title: 'Pescanova. La última.',
    tagline: 'Cierre con fuerza.',
    body: 'Pieza final de la campaña 2024 de Pescanova.',
    hero: {
      image: `${CDN}/2025/09/Pescanova-2024-07-Ultima-20s-KV-916x399.jpg`,
      aspect: 0.436,
    },
    blocks: [],
  },
  serpis: {
    slug: 'serpis',
    client: 'Serpis',
    intro: 'Unas aceitunas Serpis nunca fallan.',
    title: 'Serpis.',
    tagline: 'Sabor que se entiende.',
    body: 'Campaña para una marca con carácter y tradición.',
    hero: {
      image: `${CDN}/2025/09/FacilxSerpis_KV_2-916x515.jpg`,
      aspect: 0.562,
    },
    blocks: [],
  },
  educo: {
    slug: 'educo',
    client: 'Educo',
    intro: 'Comunicar para que se entienda, no para impresionar.',
    title: 'Educo.',
    tagline: 'Educación con claridad.',
    body: 'Proyecto para Educo con un mensaje directo y humano.',
    hero: {
      image: `${CDN}/2025/09/01b-e1758006428599-916x511.jpg`,
      aspect: 0.558,
    },
    blocks: [],
  },
};

export function getProjectDetail(slug: string): ProjectDetail | undefined {
  return PROJECT_DETAILS[slug];
}
