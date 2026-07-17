import { useState } from 'react';
import DomParallax from '../components/DomParallax';
import { UnseenStudioPage } from '../UnseenStudioLayout';

type Tab = 'new-business' | 'general';

export default function UnseenStudioContactPage() {
  const [tab, setTab] = useState<Tab>('new-business');

  return (
    <UnseenStudioPage title="Contact" variant="contact">
      <div className="us-contact us-contact--depth">
        <DomParallax className="us-contact__parallax" tilt={3.2} shift={12}>
          <div className="us-contact__intro">
            <h2 className="us-contact__hello">
              <span>Say hello</span>
            </h2>
            <p className="us-contact__sub">
              we look forward
              <br />
              to hearing from you
            </p>
          </div>

          <div className="us-contact__panel">
            <div className="us-contact__tabs">
              <button
                type="button"
                className={`us-contact__tab${tab === 'new-business' ? ' is-active' : ''}`}
                onClick={() => setTab('new-business')}
              >
                New Business
              </button>
              <button
                type="button"
                className={`us-contact__tab${tab === 'general' ? ' is-active' : ''}`}
                onClick={() => setTab('general')}
              >
                General
              </button>
            </div>

            {tab === 'new-business' ? (
              <div className="us-contact__body" key="nb">
                <a className="us-contact__mail" href="mailto:projects@unseen.co">
                  ↘&nbsp;&nbsp;projects@unseen.co
                </a>
              </div>
            ) : (
              <div className="us-contact__body" key="gen">
                <a className="us-contact__mail" href="mailto:hello@unseen.co">
                  ↘&nbsp;&nbsp;hello@unseen.co
                </a>
                <div className="us-contact__offices">
                  <div>
                    <span className="us-contact__city">Bristol</span>
                    <p>
                      35a Colston Avenue
                      <br />
                      Bristol, BS1 4TT
                    </p>
                  </div>
                  <div>
                    <span className="us-contact__city">London</span>
                    <p>
                      90 Paul Street
                      <br />
                      London, EC2A 4NE
                    </p>
                  </div>
                </div>
              </div>
            )}
          </div>
        </DomParallax>
      </div>
    </UnseenStudioPage>
  );
}
