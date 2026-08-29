import NewHomePage from '@/pages/new-home/NewHomePage';
import './newnew.css';

export default function NewNewPage() {
  return (
    <div className="newnew-page">
      <NewHomePage overlayCacheKey="newnew" homeHref="/" />
    </div>
  );
}
