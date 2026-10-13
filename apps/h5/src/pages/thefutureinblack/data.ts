export const PRACTICES = [
  { title: 'Editions', desc: 'Publications, research, cultural intelligence' },
  { title: 'Frequencies', desc: 'Podcasts, broadcasts, transmissions' },
  { title: 'Assemblies', desc: 'Dinners, salons, convenings' },
  { title: 'Residencies', desc: 'Workshops, intensives, Play as Practice™' },
  { title: 'Partnerships', desc: 'Strategic brand collaborations' },
  { title: 'Exhibitions', desc: 'Gallery shows, film screenings, installations' },
  { title: 'Commissions', desc: 'Bespoke creative work' },
  { title: 'Archives', desc: 'Case studies, documentation, research' },
  { title: 'Instruments', desc: 'Methodologies, frameworks, tools' },
] as const;

export const WORKS = [
  {
    title: 'AI-driven storyboarding',
    client: 'Clé de Peau Beauté / Shiseido',
    imageKey: 'interconnected1' as const,
  },
  {
    title: 'Tech Couture Highlights – The Future in Black™',
    client: 'Tech Couture',
    imageKey: 'interconnected2' as const,
  },
  {
    title: 'The Play Play',
    client: 'The Play Play',
    imageKey: 'interconnected3' as const,
  },
  {
    title: 'The Future In Black Samsung',
    client: 'The Future In Black Samsung',
    imageKey: 'interconnected4' as const,
  },
  {
    title: 'Times Square Digital Exhibition',
    client: 'Art Innovation Gallery',
    imageKey: 'interconnected5' as const,
  },
  {
    title: 'The Future Table',
    client: 'Curated dinner series',
    imageKey: 'interconnected7' as const,
  },
] as const;

export const AUDIENCES = [
  {
    title: 'For Brands',
    body:
      'A selection of projects across art, culture, and technology—spanning exhibitions, collaborations, and experimental work.',
    cta: 'Begin a partnership',
  },
  {
    title: 'For Institutions',
    body:
      'New visual languages resisting singular narratives. We collaborate with curators, museums, and galleries expanding what AI artistry and representation can be.',
    cta: 'Commission a work',
  },
  {
    title: 'For Your Team',
    body:
      'Bring Play as Practice™ to your organization. We facilitate workshops and retreats for corporations and creative teams ready to unlock imagination and innovation.',
    cta: 'Book a workshop',
  },
  {
    title: 'For Creatives',
    body:
      'Play as serious practice. We work with individual creatives and cultural practitioners ready to reconnect with imagination, innovation, and creative sovereignty.',
    cta: 'Explore workshops',
  },
] as const;

export const SHIFT_LINES = [
  { from: 'Play', line: 'from "nice to have" to essential.' },
  { from: 'For brands', line: 'from reflecting culture to shaping it.' },
  { from: 'For institutions', line: 'from singular narratives to expansive new visual languages.' },
  { from: 'Imagination', line: "isn't reacting to the future. It's building it." },
  { from: 'For creatives', line: 'from self-doubt to creative sovereignty.' },
] as const;
