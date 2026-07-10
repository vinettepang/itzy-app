const LEGAL = {
  privacy: {
    es: {
      title: 'Política de privacidad',
      updated: 'Última actualización: marzo 2026',
      body: [
        'Fácil Agencia Independiente S.L. (en adelante, «Fácil») es responsable del tratamiento de los datos personales que nos facilite a través de este sitio web, correo electrónico o formularios de contacto.',
        'Los datos se tratarán con la finalidad de gestionar su consulta, mantener la relación comercial y, en su caso, enviar comunicaciones relacionadas con nuestros servicios cuando exista una base legítima para ello.',
        'Conservaremos sus datos durante el tiempo necesario para cumplir con la finalidad para la que se recabaron y para determinar las posibles responsabilidades que se pudieran derivar.',
        'Puede ejercer sus derechos de acceso, rectificación, supresión, oposición, limitación y portabilidad escribiendo a hola@facilagencia.com.',
      ],
    },
    en: {
      title: 'Privacy policy',
      updated: 'Last updated: March 2026',
      body: [
        'Fácil Agencia Independiente S.L. («Fácil») is responsible for processing personal data you provide through this website, email or contact forms.',
        'Data will be processed to manage your enquiry, maintain the commercial relationship and, where applicable, send communications related to our services when a legitimate basis exists.',
        'We will retain your data for as long as necessary to fulfil the purpose for which it was collected and to determine any liabilities that may arise.',
        'You may exercise your rights of access, rectification, erasure, objection, restriction and portability by writing to hola@facilagencia.com.',
      ],
    },
  },
  legal: {
    es: {
      title: 'Aviso legal',
      updated: 'Última actualización: marzo 2026',
      body: [
        'Titular del sitio web: Fácil Agencia Independiente S.L. — Fernando VI 2, 1º Dcha, 28004, Madrid.',
        'Contacto: hola@facilagencia.com — Teléfono: +34 608 286 478.',
        'El acceso y uso de este sitio web atribuye la condición de usuario e implica la aceptación de las condiciones de uso aquí recogidas.',
        'Queda prohibida la reproducción, distribución o transformación de los contenidos sin autorización expresa de Fácil.',
      ],
    },
    en: {
      title: 'Legal notice',
      updated: 'Last updated: March 2026',
      body: [
        'Website owner: Fácil Agencia Independiente S.L. — Fernando VI 2, 1º Dcha, 28004, Madrid.',
        'Contact: hola@facilagencia.com — Phone: +34 608 286 478.',
        'Access to and use of this website attributes the condition of user and implies acceptance of the terms of use set out herein.',
        'Reproduction, distribution or transformation of the contents without express authorisation from Fácil is prohibited.',
      ],
    },
  },
  cookies: {
    es: {
      title: 'Política de cookies',
      updated: 'Última actualización: marzo 2026',
      body: [
        'Este sitio web utiliza cookies propias y de terceros para su correcto funcionamiento y para analizar hábitos de navegación.',
        'Las cookies necesarias permiten funciones básicas como la gestión del consentimiento. Las cookies analíticas, como Google Analytics, nos ayudan a entender el uso del sitio.',
        'Puede configurar o retirar su consentimiento en cualquier momento desde el panel de cookies disponible en el pie de página.',
      ],
    },
    en: {
      title: 'Cookie policy',
      updated: 'Last updated: March 2026',
      body: [
        'This website uses first-party and third-party cookies for proper operation and to analyze browsing habits.',
        'Necessary cookies enable basic functions such as consent management. Analytics cookies, such as Google Analytics, help us understand site usage.',
        'You can configure or withdraw your consent at any time from the cookie panel available in the footer.',
      ],
    },
  },
  accessibility: {
    es: {
      title: 'Declaración de accesibilidad',
      updated: 'Última actualización: marzo 2026',
      body: [
        'Fácil se compromete a hacer accesible su sitio web conforme al Real Decreto 1112/2018.',
        'La presente declaración de accesibilidad se aplica al sitio web facilagencia.com.',
        'Si detecta barreras de accesibilidad, puede comunicárnoslo en hola@facilagencia.com.',
      ],
    },
    en: {
      title: 'Accessibility statement',
      updated: 'Last updated: March 2026',
      body: [
        'Fácil is committed to making its website accessible in accordance with applicable regulations.',
        'This accessibility statement applies to the facilagencia.com website.',
        'If you encounter accessibility barriers, please contact us at hola@facilagencia.com.',
      ],
    },
  },
} as const;

export type LegalKind = keyof typeof LEGAL;

export function getLegalContent(kind: LegalKind, locale: 'es' | 'en') {
  return LEGAL[kind][locale];
}
