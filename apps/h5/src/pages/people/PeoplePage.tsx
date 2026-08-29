import { useEffect, useRef, useState } from 'react';
import { PEOPLE, type Person } from './peopleData';
import { useParallaxScroll, useVisibilityReveal } from './useParallaxScroll';
import './people.css';

type CardProps = {
  person: Person;
  index: number;
};

function PersonCard({ person, index }: CardProps) {
  const imgRef = useRef<HTMLImageElement | null>(null);
  const [loaded, setLoaded] = useState(false);

  useEffect(() => {
    // 缓存命中时 load 事件可能早于监听，补一次 complete 检查
    const img = imgRef.current;
    if (img?.complete) setLoaded(true);
  }, []);

  return (
    <div
      className="card-person __item"
      data-scroll-item
      style={
        {
          ['--colsStart' as string]: person.colsStart,
          ['--index' as string]: index + 1,
        } as React.CSSProperties
      }
    >
      <div
        className="holder"
        data-scroll-insider
        style={
          {
            ['--speed' as string]: person.speed,
            ['--speed-x' as string]: person.speedX,
          } as React.CSSProperties
        }
      >
        <div className="media">
          <figure
            className="media-holder"
            style={{ ['--aspect' as string]: person.aspect } as React.CSSProperties}
          >
            <img
              ref={imgRef}
              className={loaded ? 'is-loaded' : ''}
              loading="lazy"
              decoding="async"
              alt={person.name}
              src={person.image}
              onLoad={() => setLoaded(true)}
            />
          </figure>
        </div>

        <header>
          <div
            className="name"
            data-scroll-insider
            style={{ ['--speed' as string]: person.nameSpeed } as React.CSSProperties}
          >
            {person.name}
          </div>
        </header>
      </div>
    </div>
  );
}

export default function PeoplePage() {
  const rootRef = useRef<HTMLDivElement | null>(null);

  useParallaxScroll(rootRef);
  useVisibilityReveal(rootRef);

  return (
    <div className="people-page" ref={rootRef}>
      <article className="default about">
        <header className="header-page">
          <h1 className="description">
            <p>
              <span className="people-brand">Fácil</span> es {PEOPLE.map((p) => p.name).join(', ')}{' '}
              y mucha gente que se une para trabajar con nosotros en los proyectos más grandes.
            </p>
          </h1>
        </header>

        <section className="widget-team">
          {PEOPLE.map((person, index) => (
            <PersonCard key={person.name} person={person} index={index} />
          ))}
        </section>
      </article>
    </div>
  );
}
