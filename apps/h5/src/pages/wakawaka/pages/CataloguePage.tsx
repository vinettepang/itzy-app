import { Link } from 'react-router-dom';
import catalogue from '../data/catalogue.json';
import { WAKA_BASE, WakaPage } from '../WakaLayout';

export default function WakaCataloguePage() {
  const title = (catalogue.title || 'Catalogue\nFW/20').split('\n');

  return (
    <WakaPage id="index">
      <div className="scroll-wrapper">
        <div className="catalogue">
          <div className="catalogue__headline">
            <h1>
              {title.map((line, i) => (
                <span key={i}>
                  {line}
                  {i < title.length - 1 ? <br /> : null}
                </span>
              ))}
            </h1>
          </div>
          <div className="catalogue__list">
            {catalogue.chairs.map((chair) => (
              <Link
                key={chair.slug}
                to={`${WAKA_BASE}/${chair.slug}`}
                className="catalogue__list-item"
                data-id={chair.slug}
              >
                <div className="catalogue__list-index">
                  <h5>n°{chair.n}</h5>
                </div>
                <div className="catalogue__list-name">
                  <h2>{chair.name}</h2>
                </div>
                <div className="catalogue__list-material">
                  <h3>{chair.material}</h3>
                </div>
                <div className="catalogue__list-dimensions">
                  <h4>({chair.dimensions})</h4>
                </div>
              </Link>
            ))}
          </div>
        </div>
      </div>
    </WakaPage>
  );
}
