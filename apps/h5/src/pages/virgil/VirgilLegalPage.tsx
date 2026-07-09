import { Link } from 'react-router-dom';
import { VaaLogo } from './components/VaaLogo';
import { VIRGIL_LINKS } from './content';
import { useVirgilClock } from './hooks/useVirgilClock';
import { useVirgilTheme } from './hooks/useVirgilTheme';
import { useVirgilViewportVars } from './hooks/useVirgilViewportVars';
import './virgil.css';

const PRIVACY_BODY = `Virgil Abloh Archives, LLC ("V.A.A.," "us," and "we") is strongly committed to protecting the privacy of individuals who visit our Website at www.virgilabloh.com and its subdomains (the "Website"). This Privacy Policy, which is part of our Terms and Conditions, describes the information we collect, how we use and share it, and how you can make choices about our use of that information.

While we are based in the United States, we may collect and use personal information of individuals in other jurisdictions. Please note that there are certain aspects of this Privacy Policy which only apply when we are required to comply with jurisdiction-specific laws.

Please note that this Privacy Policy may be amended from time to time, so please check back regularly. By using the Website after we have posted an updated Privacy Policy, you agree to that updated Privacy Policy.`;

const TERMS_BODY = `These Terms and Conditions govern your use of the Virgil Abloh Archive website. By accessing or using the Website, you agree to be bound by these Terms. If you do not agree, please do not use the Website.

The Archive materials are provided for personal, non-commercial study and inspiration unless otherwise noted. All trademarks, logos, and creative works remain the property of their respective owners.`;

type Props = { kind: 'privacy' | 'terms' };

export default function VirgilLegalPage({ kind }: Props) {
  const { clock, date } = useVirgilClock();
  useVirgilViewportVars();
  useVirgilTheme();

  const title = kind === 'privacy' ? 'Privacy policy' : 'Terms and Conditions';
  const body = kind === 'privacy' ? PRIVACY_BODY : TERMS_BODY;
  const tag = kind === 'privacy' ? 'PRIVACY' : 'TERMS';

  return (
    <div className="virgil virgil--legal">
      <div className="virgil__grain" aria-hidden="true" />

      <header className="virgil__header">
        <div className="virgil__metaRow virgil__metaRow--top">
          <span>LAST UPDATED 2026</span>
          <span>{date}</span>
          <span>PAGE N/A</span>
          <span>[ VAA_ANNOUNCEMENT ]</span>
        </div>
        <div className="virgil__headerMain">
          <Link to="/virgil" className="virgil__homeLink">
            <VaaLogo className="virgil__logo" />
          </Link>
          <div className="virgil__headerLinks">
            <a href={VIRGIL_LINKS.nikeX2} target="_blank" rel="noreferrer">
              ↗ NIKE X2
            </a>
            <a href={VIRGIL_LINKS.canaryYellow} target="_blank" rel="noreferrer">
              ↗ CANARY YELLOW
            </a>
            <span className="virgil__clock">{clock}</span>
          </div>
        </div>
        <div className="virgil__rule" />
        <div className="virgil__metaRow">
          <span>V.A.A. ARCHIVE</span>
          <span>{date}</span>
          <span>{tag}</span>
        </div>
      </header>

      <main className="virgil__legalMain">
        <h1 className="virgil__legalTitle">{title}</h1>
        <p className="virgil__legalUpdated">Last Updated: March 2026</p>
        {body.split('\n\n').map((p, i) => (
          <p key={i} className="virgil__legalP">
            {p}
          </p>
        ))}
        <p className="virgil__legalBack">
          <Link to="/virgil">← Back to announcement</Link>
        </p>
      </main>
    </div>
  );
}
