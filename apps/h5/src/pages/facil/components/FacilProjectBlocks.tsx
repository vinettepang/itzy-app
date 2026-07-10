import type { ProjectBlock, ProjectMedia } from '../data/projectDetails';

function ProjectFigure({ media }: { media: ProjectMedia }) {
  return (
    <figure className="media-holder" style={{ ['--aspect' as string]: media.aspect }}>
      <img src={media.image} alt="" loading="lazy" />
    </figure>
  );
}

function ProjectBlockView({ block }: { block: ProjectBlock }) {
  if (block.type === 'full') {
    return (
      <section className={`block-image --full --pos-${block.pos ?? 4}`} data-scroll-item>
        <div className="holder" data-scroll-insider data-speed={0.1} data-speed-x={0.1}>
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

  return (
    <section
      className={`block-images --${block.align ?? 'center'}`}
      style={{ ['--image-count' as string]: block.items.length }}
      data-scroll-item
    >
      {block.items.map((item, i) => (
        <div
          key={item.image}
          className="holder"
          data-scroll-insider
          data-speed={i === 0 ? -0.1 : i === 1 ? 0.3 : 0}
          data-speed-x={i === 0 ? -0.15 : i === 1 ? -0.1 : 0.2}
        >
          <div className="block-image__link">
            <ProjectFigure media={item} />
            {item.label && <span className="tag --base --lime --default">{item.label}</span>}
          </div>
        </div>
      ))}
    </section>
  );
}

export default ProjectBlockView;
