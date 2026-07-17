import { Link } from 'react-router-dom';
import { studioSound } from '../audio/studioSound';
import DomParallax from '../components/DomParallax';
import { UnseenStudioPage } from '../UnseenStudioLayout';

/**
 * Home overlay · PARTIAL Dom2Webgl.
 * DOM keeps Neue Montreal / Saol type fidelity + CTA; WebGL plane (`createHomeText`) mirrors
 * type in-scene for depth (composite Dom2Webgl stand-in).
 */
export default function UnseenStudioHomePage() {
  return (
    <UnseenStudioPage title="Home" variant="home">
      <div className="us-hero us-hero--home us-hero--depth">
        <DomParallax className="us-hero__parallax" tilt={3.8} shift={14}>
          <p className="us-hero__eyebrow us-hero__layer" data-depth="0.4">
            A brand, digital &amp; motion studio
          </p>
          <h2 className="us-hero__line us-hero__layer" data-depth="1">
            <span className="us-hero__serif">Creating the</span>
            <br />
            <span className="us-hero__sans">unexpected</span>
          </h2>
          <Link
            to="/unseen-studio/projects"
            className="us-hero__cta us-hero__layer"
            data-depth="1.2"
            onMouseEnter={() => studioSound.play('hover')}
            onClick={() => studioSound.play('click')}
          >
            View our work <span aria-hidden>↘</span>
          </Link>
        </DomParallax>
      </div>
    </UnseenStudioPage>
  );
}
