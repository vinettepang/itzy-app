import NewNewExhibitHome from '@/pages/newnew/NewNewExhibitHome';
import './newnew.css';
import './newnew-exhibit.css';

/** 展览 + 工具融合试验页，不影响首页 `/` */
export default function NewNewExhibitPage() {
  return (
    <div className="newnew-page newnew-page--exhibit">
      <NewNewExhibitHome />
    </div>
  );
}
