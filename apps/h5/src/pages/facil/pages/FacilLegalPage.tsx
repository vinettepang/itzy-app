import { Link } from 'react-router-dom';
import { getLegalContent, type LegalKind } from '../data/legalContent';
import { useFacilLocale } from '../context/FacilLocaleContext';

type Props = { kind: LegalKind };

export default function FacilLegalPage({ kind }: Props) {
  const { locale, path, t } = useFacilLocale();
  const content = getLegalContent(kind, locale);

  return (
    <article className="default legal" data-page="legal">
      <header className="header-page">
        <h1 className="description">
          <p>{content.title}</p>
        </h1>
        <p className="facil-legal-updated">{content.updated}</p>
      </header>

      <div className="facil-legal-body">
        {content.body.map((paragraph) => (
          <p key={paragraph.slice(0, 24)}>{paragraph}</p>
        ))}
      </div>

      <p className="facil-legal-back">
        <Link to={path()}>{t('legal.back')}</Link>
      </p>
    </article>
  );
}
