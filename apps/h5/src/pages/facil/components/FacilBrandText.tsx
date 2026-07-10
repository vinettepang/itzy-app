import { Link } from 'react-router-dom';
import { useFacilLocale } from '../context/FacilLocaleContext';

export function FacilBrandText({ text }: { text: string }) {
  const { path } = useFacilLocale();
  const parts = text.split('{brand}');

  if (parts.length === 1) return <>{text}</>;

  return (
    <>
      {parts[0]}
      <Link to={path()} className="facil-font">
        Fácil
      </Link>
      {parts[1]}
    </>
  );
}
