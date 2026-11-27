import { useRef } from 'react';
import { Link } from 'react-router-dom';
import { FP_BASE, decodePhotoSrc, felixContent } from './data';
import { useFelixLenisInstance } from './FelixLenisContext';
import { scrollToSeriesIndex, useSeriesMotion } from './useSeriesMotion';

export default function FelixSeriesPage() {
  const mainRef = useRef<HTMLElement>(null);
  const lenis = useFelixLenisInstance();
  const list = felixContent.series;
  const slides = [...list, list[0]];
  const activeIndex = useSeriesMotion(mainRef, list.length);

  return (
    <main
      ref={mainRef}
      className="series svelte-f64fwf"
      style={{ ['--amount' as string]: list.length }}
    >
      {slides.map((item, index) => {
        const isClone = index === slides.length - 1;
        const logicalIndex = index % list.length;
        const isActive = activeIndex === logicalIndex || (isClone && activeIndex === 0);

        return (
          <div
            key={`${item.slug}-${index}`}
            className={`serie container grid svelte-f64fwf${isActive ? ' is-active' : ''}`}
            aria-hidden={isClone ? true : undefined}
          >
            <Link
              className="inner svelte-f64fwf"
              to={`${FP_BASE}/series/${item.slug}`}
              tabIndex={isClone ? -1 : undefined}
            >
              {item.thumbnail ? (
                <img
                  className="image"
                  src={decodePhotoSrc(item.thumbnail)}
                  alt={`${item.name} cover image`}
                  width={600}
                  loading={index === 0 ? 'eager' : 'lazy'}
                  decoding="async"
                />
              ) : null}
              <div className="info svelte-f64fwf">
                <h2 className="info-item name title-small svelte-f64fwf">
                  <span className="svelte-f64fwf">{item.name}</span>
                </h2>
                <time className="info-item year text-small svelte-f64fwf">
                  <span className="svelte-f64fwf">{item.year}</span>
                </time>
              </div>
            </Link>
          </div>
        );
      })}

      <div className="fp-series-gradient-layer" aria-hidden>
        {slides.map((item, index) => (
          <div
            key={`gradient-${item.slug}-${index}`}
            className="gradient svelte-f64fwf"
            data-series-gradient=""
            style={
              {
                ['--start' as string]: item.gradient.start,
                ['--end' as string]: item.gradient.end,
              } as Record<string, string>
            }
          />
        ))}
      </div>

      <ul className="pagination svelte-f64fwf">
        {list.map((_, i) => (
          <li key={i} className={i === activeIndex ? 'is-active svelte-f64fwf' : 'svelte-f64fwf'}>
            <button
              type="button"
              className="svelte-f64fwf"
              title={`Go to serie ${i + 1}`}
              onClick={() => scrollToSeriesIndex(i, lenis)}
            >
              <span className="svelte-f64fwf">{i + 1}</span>
            </button>
          </li>
        ))}
      </ul>
    </main>
  );
}
