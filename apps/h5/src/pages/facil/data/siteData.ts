export type FacilProject = {
  slug: string;
  client: string;
  pos: 1 | 2 | 3 | 4;
  speedY: number;
  speedX: number;
  speed: number;
  aspect: number;
  poster: string;
  image: string;
  logo: string;
  video?: string;
};

const CDN = 'https://facil.cuchillo-black.tools/wp-content/uploads';

export const HOME_PROJECTS: FacilProject[] = [
  {
    slug: 'popeyes-nada-mas-nada-menos',
    client: 'Popeyes',
    pos: 2,
    speedY: 0.3,
    speedX: -0.1,
    speed: -0.15,
    aspect: 0.562,
    poster: `${CDN}/2026/06/PLK_TCS_KV_01-40x23.jpg`,
    image: `${CDN}/2026/06/PLK_TCS_KV_01-916x515.jpg`,
    logo: `${CDN}/2025/12/Popeyes_Logo_Gris-2-916x165.png`,
  },
  {
    slug: 'la-mejor-rebaja-de-las-rebajas',
    client: 'Láserum',
    pos: 3,
    speedY: 0.1,
    speedX: 0.12,
    speed: 0.15,
    aspect: 0.562,
    poster: `${CDN}/2026/01/LASERUM_V2-4-e1769581191194-40x23.jpg`,
    image: `${CDN}/2026/01/LASERUM_V2-4-e1769581191194-916x515.jpg`,
    logo: `${CDN}/2025/10/Laserum_Logo_Gris.png`,
  },
  {
    slug: 'popeyes-asi-si-asi-yes',
    client: 'Popeyes',
    pos: 1,
    speedY: 0.2,
    speedX: 0.1,
    speed: 0.05,
    aspect: 0.562,
    poster: `${CDN}/2025/12/Popeyes-ASAY-KV-40x23.jpg`,
    image: `${CDN}/2025/12/Popeyes-ASAY-KV-916x515.jpg`,
    logo: `${CDN}/2025/12/Popeyes_Logo_Gris-2-916x165.png`,
  },
  {
    slug: 'unexpected',
    client: 'Festina',
    pos: 4,
    speedY: 0.3,
    speedX: -0.08,
    speed: -0.1,
    aspect: 0.426,
    poster: `${CDN}/2025/12/Festina-Connected-KV-1-40x17.jpg`,
    image: `${CDN}/2025/12/Festina-Connected-KV-1-916x390.jpg`,
    logo: `${CDN}/2026/01/Festina_Logo_Gris-916x491.png`,
  },
  {
    slug: 'real-madrid-jude',
    client: 'Real Madrid',
    pos: 2,
    speedY: 0.2,
    speedX: -0.1,
    speed: -0.15,
    aspect: 0.495,
    poster: `${CDN}/2025/09/Real-Madrid-KV-Hero-Jude-40x20.jpg`,
    image: `${CDN}/2025/09/Real-Madrid-KV-Hero-Jude-916x453.jpg`,
    logo: `${CDN}/2025/10/Real_Madrid_Logo_Gris-916x1022.png`,
  },
  {
    slug: 'pescanova-lo-bueno-sale-bien',
    client: 'Pescanova',
    pos: 1,
    speedY: 0.2,
    speedX: 0.12,
    speed: 0.1,
    aspect: 0.558,
    poster: `${CDN}/2025/09/Pescanova-2024-KV-40x22.jpg`,
    image: `${CDN}/2025/09/Pescanova-2024-KV-916x511.jpg`,
    logo: `${CDN}/2025/10/Pescanova_Logo_Gris-916x385.png`,
  },
  {
    slug: 'laserum-callao',
    client: 'Láserum',
    pos: 4,
    speedY: 0.15,
    speedX: 0.05,
    speed: 0.05,
    aspect: 1.429,
    poster: `${CDN}/2025/07/Facil-Laserum-Callao-Ingles_LR-40x57.jpg`,
    image: `${CDN}/2025/07/Facil-Laserum-Callao-Ingles_LR.jpg`,
    logo: `${CDN}/2025/10/Laserum_Logo_Gris.png`,
  },
  {
    slug: 'pescanova-ultima',
    client: 'Pescanova',
    pos: 3,
    speedY: 0.1,
    speedX: -0.05,
    speed: -0.05,
    aspect: 0.436,
    poster: `${CDN}/2025/09/Pescanova-2024-07-Ultima-20s-KV-40x17.jpg`,
    image: `${CDN}/2025/09/Pescanova-2024-07-Ultima-20s-KV-916x399.jpg`,
    logo: `${CDN}/2025/10/Pescanova_Logo_Gris-916x385.png`,
  },
  {
    slug: 'serpis',
    client: 'Serpis',
    pos: 1,
    speedY: 0.25,
    speedX: 0.08,
    speed: 0.15,
    aspect: 0.562,
    poster: `${CDN}/2025/09/FacilxSerpis_KV_2-40x23.jpg`,
    image: `${CDN}/2025/09/FacilxSerpis_KV_2-916x515.jpg`,
    logo: `${CDN}/2025/09/Serpis_Logo_Gris.png`,
  },
  {
    slug: 'educo',
    client: 'Educo',
    pos: 2,
    speedY: 0.15,
    speedX: -0.08,
    speed: -0.1,
    aspect: 0.558,
    poster: `${CDN}/2025/09/01b-e1758006428599-40x22.jpg`,
    image: `${CDN}/2025/09/01b-e1758006428599-916x511.jpg`,
    logo: `${CDN}/2025/10/Educo_Logo_Gris-916x309.png`,
  },
];

export const WORKS_IMAGES = [
  `${CDN}/2026/06/PLK_TCS_KV_01-916x515.jpg`,
  `${CDN}/2026/01/LASERUM_V2-4-e1769581191194-916x515.jpg`,
  `${CDN}/2025/12/Popeyes-ASAY-KV-916x515.jpg`,
  `${CDN}/2025/09/Real-Madrid-KV-Hero-Jude-916x453.jpg`,
  `${CDN}/2025/12/Festina-Connected-KV-1-916x390.jpg`,
  `${CDN}/2025/07/Facil-Laserum-Key-Visual-1-916x514.jpg`,
  `${CDN}/2025/09/01b-e1758006428599-916x511.jpg`,
  `${CDN}/2025/09/FacilxSerpis_KV_2-916x515.jpg`,
  `${CDN}/2025/09/Pescanova-2024-KV-916x511.jpg`,
  `${CDN}/2025/12/la-ciudad-x-cabify-facil-agencia-916x708.jpg`,
];

export const CLIENT_LOGOS = [
  { alt: 'Cabify', src: `${CDN}/2025/10/Cabify_Logo_Gris-916x306.png` },
  { alt: 'Davante', src: `${CDN}/2025/10/Davante_logotipo_Gris-916x200.png` },
  { alt: 'educo', src: `${CDN}/2025/10/Educo_Logo_Gris-916x309.png` },
  { alt: 'FESTINA', src: `${CDN}/2026/01/Festina_Logo_Gris-916x491.png` },
  { alt: 'láserum', src: `${CDN}/2025/10/Laserum_Logo_Gris.png` },
  { alt: 'PESCANOVA', src: `${CDN}/2025/10/Pescanova_Logo_Gris-916x385.png` },
  { alt: 'POPEYES', src: `${CDN}/2025/12/Popeyes_Logo_Gris-2-916x165.png` },
  { alt: 'Real Madrid', src: `${CDN}/2025/10/Real_Madrid_Logo_Gris-916x1022.png` },
  { alt: 'SERPIS', src: `${CDN}/2025/09/Serpis_Logo_Gris-916x500.png` },
  { alt: 'Tosta Rica', src: `${CDN}/2025/09/Tosta_Rica_Logo_Blanco-916x282.png` },
];

export const TEAM = [
  { name: 'María', image: `${CDN}/2026/01/MariaA_Web_Ok.jpg`, speed: 0, speedX: 0.1 },
  { name: 'Mónica', image: `${CDN}/2026/01/Monica_Web_Ok.jpg`, speed: 0.3, speedX: -0.12 },
  { name: 'Ana', image: `${CDN}/2026/01/Ana_Web_Ok-916x1075.jpg`, speed: 0.1, speedX: 0.1 },
  { name: 'Janet', image: `${CDN}/2026/01/Janet_Web_Ok.jpg`, speed: 0.2, speedX: -0.1 },
  { name: 'Adriana', image: `${CDN}/2026/01/Adriana_Web_Ok.jpg`, speed: 0, speedX: -0.1 },
  { name: 'Gonzaga', image: `${CDN}/2026/01/Gonzaga_Web_Ok.jpg`, speed: 0.15, speedX: 0.08 },
  { name: 'Néstor', image: `${CDN}/2026/01/Nestor_Web_Ok.jpg`, speed: 0.25, speedX: -0.05 },
];

export const MARQUEE_LINES = [
  ['FACIL', 'es', 'lo', 'contrario', 'de', 'difícil'],
  ['FACIL', 'es', 'algo', 'que', 'entiende', 'todo', 'el', 'mundo'],
  ['20', 'slides', 'son', 'mejor', 'que', '320', 'FACIL'],
  ['Hacerlo', 'FACIL', 'es', 'complicado'],
];

export const FILOSOFIA_TEXT = `Si estamos comunicando algo, es porque hay algo que queremos que se entienda. Así de sencillo. Parece una obviedad —de hecho, lo es—, pero precisamente por eso lo ponemos en primer lugar. Si consigues, además, que tenga algo sorprendente, entonces se convierte en memorable. Memorable no de pasar a la historia de la publicidad; memorable de útil, de que la gente se acuerde de lo que has dicho cuando tiene que hacerlo.`;

export const METHODOLOGY_IMAGE = `${CDN}/2025/12/0fe1156933fd04b70f43239945c32de1.jpg`;

export type MethodologyCard =
  | { type: 'text'; text: string }
  | { type: 'image'; src: string; aspect: number }
  | { type: 'spacer' };

export const METHODOLOGY_CARDS: MethodologyCard[] = [
  { type: 'text', text: FILOSOFIA_TEXT },
  { type: 'spacer' },
  { type: 'spacer' },
  { type: 'spacer' },
  { type: 'image', src: METHODOLOGY_IMAGE, aspect: 0.64 },
  { type: 'spacer' },
  { type: 'spacer' },
  { type: 'text', text: FILOSOFIA_TEXT },
  { type: 'spacer' },
  { type: 'spacer' },
  { type: 'spacer' },
  { type: 'image', src: METHODOLOGY_IMAGE, aspect: 0.64 },
  { type: 'spacer' },
  { type: 'spacer' },
];

export const METHODOLOGY_TAGS = [
  { facil: true, text: 'es algo que entiende todo el mundo.' },
  { facil: false, text: 'Simplificar los problemas es el primer paso para encontrar soluciones sencillas.' },
  { facil: false, text: 'Nos adaptamos bastante a todo. Somos justo lo contrario de difícil.' },
  { facil: false, text: 'Pensamos desde el sentido común y no tener equipo social hoy en día no tendría sentido.' },
  { facil: false, text: 'Creemos en el poder de las relaciones fáciles.' },
  { facil: true, text: 'no es simple. De hecho, nos complicamos la vida un montón para que lo parezca.' },
  { facil: false, text: 'Usamos la Times New Roman porque todo el mundo la tiene instalada y no falla.' },
];

export const CONTACT_LINKS = [
  { className: 'email', href: 'mailto:hola@facilagencia.com', label: 'hola@facilagencia.com' },
  { className: 'tlf', href: 'tel:+34608286478', label: '+34 608 286 478' },
  { className: 'address', href: 'https://maps.app.goo.gl/cSAHrtGL74F3LURi9', label: 'Fernando VI 2, 1º Dcha, 28004, Madrid' },
  { className: 'instagram', href: 'https://www.instagram.com/facilagencia_/', label: 'Instagram' },
  { className: 'linkedin', href: 'https://www.linkedin.com/company/facilagenciaindependiente', label: 'Linkedin' },
];

export const LOGO_LETTERS = ['f', 'a', 'c', 'i', 'l', 'r'] as const;
