import { forwardRef } from 'react';
import { MeshGradient } from '@paper-design/shaders-react';
import PaperNoise from './PaperNoise';
import TicketOverlay, { type TicketCopy } from './TicketOverlay';
import './ticket-face.css';

export const MESH_COLORS = [
  '#FF6A00',
  '#FC5E10',
  '#FF8A30',
  '#FFCB8E',
  '#FFE4C2',
] as const;

export const PAGE_BG =
  'https://bookface-static.ycombinator.com/vite/assets/page-bg-C27Z9D2J.png';

export const DEFAULT_NAME = 'Anthony Ung';

export type GlassMotion = {
  offsetX: number;
  offsetY: number;
  scale: number;
};

type TicketArtworkProps = {
  name: string;
  reduced: boolean;
  copy?: TicketCopy;
  /** Kept for API compat with machine/detail pages. */
  glass?: GlassMotion;
};

/** Full-bleed MeshGradient + noise + SVG ticket face. */
export const TicketArtwork = forwardRef<HTMLDivElement, TicketArtworkProps>(
  function TicketArtwork({ name, reduced, copy }, ref) {
    const label =
      copy?.titleAttr ?? `Startup School 2026 admission ticket for ${name}`;

    return (
      <div
        ref={ref}
        id="ticket-artwork"
        className="ticket-artwork"
        data-capture-area
        role="img"
        aria-label={label}
      >
        <div className="mesh-layer" aria-hidden>
          <MeshGradient
            width="100%"
            height="100%"
            colors={[...MESH_COLORS]}
            distortion={0.6}
            swirl={0.3}
            speed={reduced ? 0 : 1.8}
            grainMixer={0}
            grainOverlay={0}
            scale={1}
            rotation={0}
            offsetX={0}
            offsetY={0}
            webGlContextAttributes={{ preserveDrawingBuffer: true }}
          />
        </div>
        <PaperNoise />
        <TicketOverlay name={name} copy={copy} />
      </div>
    );
  },
);
