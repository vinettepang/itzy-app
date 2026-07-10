export type FacilLocale = 'es' | 'en';

export type TranslationKey =
  | 'brand'
  | 'nav.works'
  | 'nav.philosophy'
  | 'nav.people'
  | 'nav.contact'
  | 'nav.worksSub'
  | 'nav.philosophySub'
  | 'nav.peopleSub'
  | 'nav.contactSub'
  | 'index.people'
  | 'index.works'
  | 'index.philosophy'
  | 'index.contact'
  | 'lang.es'
  | 'lang.en'
  | 'home.intro1'
  | 'home.intro2'
  | 'home.intro3'
  | 'home.intro4'
  | 'home.introLink'
  | 'home.infoTitle'
  | 'home.infoBody'
  | 'works.back'
  | 'people.intro'
  | 'contact.intro1'
  | 'contact.intro2'
  | 'contact.introLink'
  | 'filosofia.intro1'
  | 'filosofia.intro2'
  | 'project.for'
  | 'project.notFound'
  | 'project.viewWorks'
  | 'legal.privacy'
  | 'legal.legal'
  | 'legal.cookies'
  | 'legal.accessibility'
  | 'legal.back'
  | 'cookie.banner'
  | 'cookie.settings'
  | 'cookie.cancel'
  | 'cookie.accept'
  | 'cookie.save'
  | 'cookie.policyLink'
  | 'cookie.necessaryTitle'
  | 'cookie.necessaryText'
  | 'cookie.necessaryAlways'
  | 'cookie.functionalTitle'
  | 'cookie.functionalText'
  | 'cookie.analyticsTitle'
  | 'cookie.analyticsText'
  | 'cookie.adsTitle'
  | 'cookie.adsText'
  | 'cookie.toggleSettings';

const es = {
  brand: 'Fácil',
  'nav.works': 'Trabajos',
  'nav.philosophy': 'Filosofía',
  'nav.people': 'Personas',
  'nav.contact': 'Contacto',
  'nav.worksSub': 'Projectos que hemos hecho.',
  'nav.philosophySub': 'Lo qué hacemos.',
  'nav.peopleSub': 'Quiénes somos.',
  'nav.contactSub': 'Ponte en contacto con BI.',
  'index.people': 'Quiénes somos. Quiénes somos. Quiénes somos. Quiénes somos.',
  'index.works': 'Projectos que hemos hecho. Projectos que hemos hecho. Projectos que hemos hecho.',
  'index.philosophy': 'Lo qué hacemos. Lo qué hacemos. Lo qué hacemos. Lo qué hacemos.',
  'index.contact': 'Ponte en contacto con BI. Ponte en contacto con BI. Ponte en contacto con BI.',
  'lang.es': 'Es',
  'lang.en': 'En',
  'home.intro1': 'Hola, somos una agencia creativa independiente.',
  'home.intro2': 'Creemos que aunque los retos en comunicación',
  'home.intro3': 'se van complicando cada día, siempre hay una',
  'home.intro4': 'manera',
  'home.introLink': 'fácil',
  'home.intro5': 'de resolverlos.',
  'home.infoTitle': '¿Cómo es Fácil?',
  'home.infoBody':
    'Creemos en el poder de las relaciones fáciles. Entre nosotros, entre nosotros y los clientes, y entre las marcas y las personas. Sabemos que puede parecer una frase medio tonta y un juego de palabras con nuestro nombre, pero en realidad, nos llamamos así por eso. Fácil es nuestro nombre y nuestra manera de entender la comunicación.',
  'works.back': 'Fácil',
  'people.intro':
    '{brand} es María, Mónica, Ana, Janet, Adriana, Gonzaga, Néstor y mucha gente que se une para trabajar con nosotros en los proyectos más grandes.',
  'contact.intro1':
    'Si crees que hacer las cosas bien no tiene por qué ser complicado, estamos a un mensaje de distancia. Nos gusta trabajar con marcas que buscan una relación cercana, ideas claras y un proceso',
  'contact.intro2': '. ¿Hablamos?',
  'contact.introLink': 'fácil',
  'filosofia.intro1':
    'En {brand} creemos en las ideas por encima de todo. Una estrategia, un reel o un spot se tiene que pensar. Da igual lo rápido que vaya todo hoy en día, para y piensa.',
  'filosofia.intro2': 'Piensa rápido, eso sí, pero piensa.',
  'project.for': 'para',
  'project.notFound': 'Proyecto no encontrado.',
  'project.viewWorks': 'Ver trabajos',
  'legal.privacy': 'Política de privacidad',
  'legal.legal': 'Aviso legal',
  'legal.cookies': 'Política de cookies',
  'legal.accessibility': 'Declaración de accesibilidad',
  'legal.back': '← Volver',
  'cookie.banner':
    'Utilizamos cookies propias y de terceros para mejorar nuestros servicios y mostrarle publicidad relacionada con sus preferencias.',
  'cookie.settings': 'Ajustes',
  'cookie.cancel': 'Cancelar',
  'cookie.accept': 'Aceptar',
  'cookie.save': 'Guarda mis preferencias',
  'cookie.policyLink': 'política de cookies',
  'cookie.necessaryTitle': 'Necesarias',
  'cookie.necessaryText':
    'Las cookies necesarias son requeridas para habilitar las funciones básicas de este sitio. Estas cookies no almacenan ningún dato de identificación personal.',
  'cookie.necessaryAlways': 'Siempre activas',
  'cookie.functionalTitle': 'Funcionales',
  'cookie.functionalText':
    'Las cookies funcionales permiten recordar preferencias y mejorar la experiencia de navegación en el sitio.',
  'cookie.analyticsTitle': 'Analíticas',
  'cookie.analyticsText':
    'Las cookies analíticas se utilizan para comprender cómo interactúan los visitantes con el sitio web.',
  'cookie.adsTitle': 'Publicidad',
  'cookie.adsText':
    'Las cookies de publicidad se utilizan para mostrar anuncios personalizados y medir la efectividad de campañas.',
  'cookie.toggleSettings': 'política de cookies',
} as const;

const en = {
  brand: 'Fácil',
  'nav.works': 'Works',
  'nav.philosophy': 'Philosophy',
  'nav.people': 'People',
  'nav.contact': 'Contact',
  'nav.worksSub': 'Projects we have done.',
  'nav.philosophySub': 'What we do.',
  'nav.peopleSub': 'Who we are.',
  'nav.contactSub': 'Get in touch with us.',
  'index.people': 'Who we are. Who we are. Who we are. Who we are.',
  'index.works': 'Projects we have done. Projects we have done. Projects we have done.',
  'index.philosophy': 'What we do. What we do. What we do. What we do.',
  'index.contact': 'Get in touch with us. Get in touch with us. Get in touch with us.',
  'lang.es': 'Es',
  'lang.en': 'En',
  'home.intro1': 'Hi, we are an independent creative agency.',
  'home.intro2': 'We believe that even though communication challenges',
  'home.intro3': 'become more complicated every day, there is always an',
  'home.intro4': '',
  'home.introLink': 'easy',
  'home.intro5': 'way to solve them.',
  'home.infoTitle': 'What is Fácil like?',
  'home.infoBody':
    'We believe in the power of easy relationships. Between us, between us and clients, and between brands and people. We know it may sound like a silly phrase and a play on words with our name, but that is actually why we are called Fácil. It is our name and our way of understanding communication.',
  'works.back': 'Fácil',
  'people.intro':
    '{brand} is María, Mónica, Ana, Janet, Adriana, Gonzaga, Néstor and many people who join us on the biggest projects.',
  'contact.intro1':
    'If you think doing things right does not have to be complicated, we are one message away. We like working with brands that seek a close relationship, clear ideas and an',
  'contact.intro2': ' process. Shall we talk?',
  'contact.introLink': 'easy',
  'filosofia.intro1':
    'At {brand} we believe in ideas above all else. A strategy, a reel or a spot has to be thought through. No matter how fast everything moves today, stop and think.',
  'filosofia.intro2': 'Think fast, yes, but think.',
  'project.for': 'for',
  'project.notFound': 'Project not found.',
  'project.viewWorks': 'View works',
  'legal.privacy': 'Privacy policy',
  'legal.legal': 'Legal notice',
  'legal.cookies': 'Cookie policy',
  'legal.accessibility': 'Accessibility statement',
  'legal.back': '← Back',
  'cookie.banner':
    'This website uses first-party and third-party cookies necessary for its operation and to analyze your browsing habits.',
  'cookie.settings': 'Settings',
  'cookie.cancel': 'Cancel',
  'cookie.accept': 'Accept',
  'cookie.save': 'Save my preferences',
  'cookie.policyLink': 'cookie policy',
  'cookie.necessaryTitle': 'Necessary',
  'cookie.necessaryText':
    'Necessary cookies are required to enable basic functions of this site. These cookies do not store any personally identifiable data.',
  'cookie.necessaryAlways': 'Always active',
  'cookie.functionalTitle': 'Functional',
  'cookie.functionalText':
    'Functional cookies help remember preferences and improve your browsing experience.',
  'cookie.analyticsTitle': 'Analytics',
  'cookie.analyticsText':
    'Analytics cookies are used to understand how visitors interact with the website.',
  'cookie.adsTitle': 'Advertising',
  'cookie.adsText':
    'Advertising cookies are used to deliver personalized ads and measure campaign effectiveness.',
  'cookie.toggleSettings': 'cookie policy',
} as const;

// Extended keys only in es
type ExtendedKey = 'home.intro5';
type AllKeys = TranslationKey | ExtendedKey;

export const translations: Record<FacilLocale, Record<AllKeys, string>> = {
  es: { ...es, 'home.intro5': 'de resolverlos.' },
  en: { ...en, 'home.intro5': 'way to solve them.' },
};

export const ROUTES = {
  es: {
    home: '',
    works: 'trabajos',
    philosophy: 'filosofia',
    people: 'people',
    contact: 'contact',
    projects: 'projects',
    privacy: 'politica-de-privacidad',
    legal: 'aviso-legal',
    cookies: 'politica-de-cookies',
    accessibility: 'declaracion-de-accesibilidad',
  },
  en: {
    home: '',
    works: 'works',
    philosophy: 'philosophy',
    people: 'people',
    contact: 'contact',
    projects: 'projects',
    privacy: 'privacy-policy',
    legal: 'legal-notice',
    cookies: 'cookie-policy',
    accessibility: 'accessibility-statement',
  },
} as const;

export const MARQUEE = {
  es: [
    ['FACIL', 'es', 'lo', 'contrario', 'de', 'difícil'],
    ['FACIL', 'es', 'algo', 'que', 'entiende', 'todo', 'el', 'mundo'],
    ['20', 'slides', 'son', 'mejor', 'que', '320', 'FACIL'],
    ['Hacerlo', 'FACIL', 'es', 'complicado'],
  ],
  en: [
    ['FACIL', 'is', 'the', 'opposite', 'of', 'difficult'],
    ['FACIL', 'is', 'something', 'everyone', 'understands'],
    ['20', 'slides', 'are', 'better', 'than', '320', 'FACIL'],
    ['Making', 'it', 'FACIL', 'is', 'complicated'],
  ],
} as const;
