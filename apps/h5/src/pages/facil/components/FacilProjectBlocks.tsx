import type { CSSProperties } from 'react';
import type { ProjectBlock, ProjectMedia } from '../data/projectDetails';

function ProjectFigure({ media }: { media: ProjectMedia }) {
  return (
    <figure className="media-holder" style={{ ['--aspect' as string]: media.aspect }}>
      <img src={media.image} alt="" loading="lazy" />
    </figure>
  );
}

function insiderStyle(speed: number, speedX: number): CSSProperties {
  return {
    ['--speed' as string]: speed,
    ['--speed-x' as string]: speedX,
    ['--x' as string]: `calc((var(--y) * (${speedX} * var(--mod-x, 1))) * -1px)`,
  };
}

function ProjectBlockView({ block }: { block: ProjectBlock }) {
  if (block.type === 'full') {
    return (
      <section className={`block-image --full --pos-${block.pos ?? 4}`} data-scroll-item>
        <div className="holder" data-scroll-insider style={insiderStyle(0.1, 0.1)}>
          <div className="block-image__link">
            <ProjectFigure media={block.media} />
            {block.media.label && (
              <span className="tag --base --lime --default">{block.media.label}</span>
            )}
          </div>
        </div>
      </section>
    );
  }

  const speeds = [
    { speed: -0.1, speedX: -0.15 },
    { speed: 0.3, speedX: -0.1 },
    { speed: 0, speedX: 0.2 },
  ];

  return (
    <section
      className={`block-images --${block.align ?? 'center'}`}
      style={{ ['--image-count' as string]: block.items.length }}
      data-scroll-item
    >
      {block.items.map((item, i) => {
        const s = speeds[i] ?? speeds[0];
        return (
          <div key={item.image} className="holder" data-scroll-insider style={insiderStyle(s.speed, s.speedX)}>
            <div className="block-image__link">
              <ProjectFigure media={item} />
              {item.label && <span className="tag --base --lime --default">{item.label}</span>}
            </div>
          </div>
        );
      })}
    </section>
  );
}

export default ProjectBlockView;
