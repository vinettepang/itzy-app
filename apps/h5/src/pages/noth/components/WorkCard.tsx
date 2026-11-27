import { Link } from 'react-router-dom';
import { LineReveal } from './LineReveal';
import { NOTH_ROUTES } from '../paths';
import type { NothWork } from '../data/works';

type Props = {
  work: NothWork;
};

export function WorkCard({ work }: Props) {
  return (
    <div
      role="listitem"
      className="work_item w-dyn-item"
      style={{
        gridArea: work.gridArea,
        alignSelf: 'start',
        display: 'flex',
        flexDirection: 'column',
      }}
    >
      <LineReveal as="h2" className="title-work" lines={[work.name]} />
      <LineReveal as="p" className="short-p-work" lines={[work.tagline]} />
      <Link
        to={`${NOTH_ROUTES.works}/${work.slug}`}
        className="work-link w-inline-block"
        style={{ position: 'relative', cursor: 'none' }}
      >
        <div
          className="img-work-w"
          style={{
            width: '100%',
            height: 'auto',
            aspectRatio: work.aspectRatio,
            overflow: 'hidden',
          }}
        >
          <img
            src={work.image}
            alt=""
            className="img-work"
            loading="lazy"
            style={{ top: 0, objectFit: 'cover', width: '100%', height: '100%' }}
          />
        </div>
        <div className="cursor-work">
          <div>explore</div>
        </div>
      </Link>
    </div>
  );
}
