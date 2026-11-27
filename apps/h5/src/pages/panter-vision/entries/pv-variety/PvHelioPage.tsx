import { Navigate, useParams } from 'react-router-dom';
import CargoContent from './CargoContent';
import { pageByPurl, slugToPurl } from './data';

export default function PvHelioPage() {
  const { slug } = useParams();
  const purl = slugToPurl(slug);
  const page = pageByPurl(purl);

  if (!page) {
    if (!slug) return null;
    return <Navigate to="/pv/variety" replace />;
  }

  return (
    <article className="ht-page">
      <CargoContent html={page.content} />
    </article>
  );
}
