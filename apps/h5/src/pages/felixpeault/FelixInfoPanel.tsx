import { useEffect, useRef } from 'react';
import gsap from 'gsap';
import { felixContent } from './data';

type Props = {
  onClose: () => void;
};

export default function FelixInfoPanel({ onClose }: Props) {
  const panelRef = useRef<HTMLElement>(null);
  const { bio, infoBlocks, contact } = felixContent;

  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      if (e.key === 'Escape') onClose();
    };
    window.addEventListener('keydown', onKey);
    return () => window.removeEventListener('keydown', onKey);
  }, [onClose]);

  useEffect(() => {
    const root = panelRef.current;
    if (!root) return;
    const lines = Array.from(root.querySelectorAll<HTMLElement>('.bio .line'));
    if (!lines.length) return;
    gsap.set(lines, { yPercent: 110 });
    const tl = gsap.timeline({ delay: 0.3, defaults: { ease: 'power4.inOut', duration: 1.2 } });
    tl.to(lines, { yPercent: 0, stagger: 0.125 }, 0);
    return () => {
      tl.kill();
      gsap.killTweensOf(lines);
    };
  }, []);

  return (
    <aside ref={panelRef} className="info-panel grid svelte-bz21c8 is-overlay" aria-label="About">
      <h2 className="bio title-big svelte-bz21c8">
        {bio.split('\n').map((paragraph, pi) => (
          <span key={pi} style={{ overflow: 'clip', display: 'block' }}>
            <span className="line" style={{ display: 'block' }}>{paragraph}</span>
          </span>
        ))}
      </h2>
      <div className="blocks svelte-bz21c8">
        {infoBlocks.map((block) => (
          <div key={block.title} className="block svelte-bz21c8">
            <span className="title-caps svelte-bz21c8">{block.title}</span>
            <span className="svelte-bz21c8">{block.text}</span>
          </div>
        ))}
        <div className="block svelte-bz21c8 contact svelte-bz21c8">
          <span className="title-caps svelte-bz21c8">Contact</span>
          <div className="contact svelte-bz21c8">
            <div className="socials svelte-bz21c8">
              <span className="title-caps svelte-bz21c8">{contact.instagram.label}</span>
              <a href={contact.instagram.url} target="_blank" rel="noopener noreferrer">
                {contact.instagram.handle}
              </a>
            </div>
            <div>
              <span className="title-caps svelte-bz21c8">{contact.email.label}</span>
              <a href={`mailto:${contact.email.address}`}>{contact.email.address}</a>
            </div>
          </div>
        </div>
      </div>
    </aside>
  );
}
