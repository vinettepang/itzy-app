import { type FormEvent, useCallback, useEffect, useRef, useState } from 'react';
import { Link } from 'react-router-dom';
import VirgilCertificate from './components/VirgilCertificate';
import VirgilLetterText from './components/VirgilLetterText';
import { VaaLogo } from './components/VaaLogo';
import { VIRGIL_INTRO, VIRGIL_LINKS, VIRGIL_SIGNUP } from './content';
import { useVirgilClock } from './hooks/useVirgilClock';
import { useVirgilScrollLoop } from './hooks/useVirgilScrollLoop';
import { useVirgilTheme } from './hooks/useVirgilTheme';
import { useVirgilThemeCycle } from './hooks/useVirgilThemeCycle';
import { useVirgilViewportVars } from './hooks/useVirgilViewportVars';
import './virgil.css';

export default function VirgilPage() {
  const contentRef = useRef<HTMLDivElement>(null);
  const rightBlockRef = useRef<HTMLElement>(null);
  const announcementRef = useRef<HTMLHeadingElement>(null);

  const { clock, date } = useVirgilClock();
  useVirgilViewportVars();
  const { themeIndex, advanceTheme } = useVirgilTheme();

  const [resetTrigger, setResetTrigger] = useState(0);
  const [introKey, setIntroKey] = useState(0);
  const [skipIntroDelay, setSkipIntroDelay] = useState(false);

  const handleReset = useCallback(() => {
    setResetTrigger((n) => n + 1);
    setSkipIntroDelay(true);
    setIntroKey((n) => n + 1);
  }, []);

  const { cycleKey, fadeClass, runCycle, cyclingRef } = useVirgilThemeCycle({
    contentRef,
    rightBlockRef,
    announcementRef,
    advanceTheme,
    onReset: handleReset,
  });

  useVirgilScrollLoop({
    contentRef,
    rightBlockRef,
    announcementRef,
    resetTrigger,
    cyclingRef,
    onBottomCycle: runCycle,
  });

  useEffect(() => {
    document.documentElement.classList.add('virgil-page');
    return () => document.documentElement.classList.remove('virgil-page');
  }, []);

  const onSubmit = (e: FormEvent) => {
    e.preventDefault();
    alert('Signup UI restored locally. Connect Klaviyo to enable submissions.');
  };

  return (
    <div className={`virgil ${fadeClass}`.trim()}>
      <div className="virgil__grain virgil__cycleLayer" aria-hidden="true" />

      <div key={cycleKey} className="virgil__watermark virgil__cycleLayer" aria-hidden="true">
        <VaaLogo />
      </div>

      <div className="virgil__certificateWrap virgil__cycleLayer">
        <VirgilCertificate themeIndex={themeIndex} resetTrigger={resetTrigger} />
      </div>

      <div className="virgil__scrollTrack">
        <main className="virgil__stage virgil__cycleLayer">
          <header className="virgil__header">
            <div className="virgil__metaRow virgil__metaRow--top">
              <span>LAST UPDATED 2026</span>
              <span>{date}</span>
              <span>PAGE N/A</span>
              <span>[ VAA_ANNOUNCEMENT ]</span>
            </div>

            <div className="virgil__headerMain">
              <div className="virgil__brandRow">
                <VaaLogo className="virgil__logo" />
                <div className="virgil__crest" aria-hidden="true">
                  <span className="virgil__crestMark">† 26</span>
                  <span className="virgil__crestLabel">V.A.™</span>
                </div>
              </div>
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
              <span>MISSION</span>
            </div>
          </header>

          <div ref={contentRef} className="virgil__body">
            <h1
              key={cycleKey}
              ref={announcementRef}
              className="virgil__announcement virgil__announcement--enter"
            >
              ANNOUNCEMENT
            </h1>

            <div className="virgil__columns">
              <section className="virgil__intro">
                <div className="virgil__metaRow virgil__metaRow--tight">
                  <span>V.A.A. ARCHIVE</span>
                  <span>S-26</span>
                  <span>V. 001</span>
                </div>

                <h2 className="virgil__title">
                  <span>The</span>
                  <span>Virgil</span>
                  <span>Abloh Archive</span>
                </h2>

                <div key={introKey}>
                  {VIRGIL_INTRO.map((para, i) => (
                    <VirgilLetterText
                      key={`${introKey}-${i}`}
                      text={para}
                      baseDelay={skipIntroDelay ? 0 : 0.6 + i * 0.4}
                    />
                  ))}
                </div>
              </section>

              <footer ref={rightBlockRef} className="virgil__signup">
                <div className="virgil__metaRow virgil__metaRow--tight">
                  <span>V.A.A. ARCHIVE</span>
                  <span>S-26</span>
                  <span>V. 001</span>
                </div>

                <h2 className="virgil__joinTitle">
                  <span>Join</span>
                  <span>the</span>
                  <span>archive</span>
                </h2>

                <div className="virgil__metaRow virgil__metaRow--tight">
                  <span>MEMBERSHIP SIGNUP</span>
                  <span>{date}</span>
                  <span>V. 001</span>
                </div>

                <p className="virgil__signupLead">{VIRGIL_SIGNUP.lead}</p>
                <p className="virgil__signupToolkit">{VIRGIL_SIGNUP.toolkit}</p>

                <form className="virgil__form" onSubmit={onSubmit}>
                  <label className="virgil__field">
                    <span className="virgil__srOnly">Name</span>
                    <input type="text" name="name" placeholder="Name" required />
                  </label>
                  <label className="virgil__field">
                    <span className="virgil__srOnly">Email Address</span>
                    <input type="email" name="email" placeholder="Email Address" required />
                  </label>
                  <label className="virgil__checkbox">
                    <input type="checkbox" name="toolkit" />
                    <span>
                      I&apos;m a student / emerging creative – send me the Archive Toolkit
                    </span>
                  </label>
                  <button type="submit" className="virgil__submit">
                    SIGN UP
                  </button>
                </form>

                <p className="virgil__legalNote">
                  By signing up, you agree to our{' '}
                  <Link to={VIRGIL_LINKS.privacy}>Privacy Policy</Link> and{' '}
                  <Link to={VIRGIL_LINKS.terms}>Terms and Conditions</Link>.
                </p>
              </footer>
            </div>
          </div>
        </main>

        <div className="virgil__scrollProxy" aria-hidden="true" />
        <div className="virgil__scrollPost" aria-hidden="true" />
        <div className="virgil__scrollProxyMobile" aria-hidden="true" />
      </div>
    </div>
  );
}
