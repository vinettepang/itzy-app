import { Link } from 'react-router-dom';
import { useHaoqiLiveStatus } from './hooks/useHaoqiLiveStatus';
import { useHaoqiSound } from './hooks/useHaoqiSound';

function HoverBox({
  as = 'button',
  className = '',
  children,
  ...rest
}: {
  as?: 'button' | 'a';
  className?: string;
  children: React.ReactNode;
} & Record<string, unknown>) {
  const cls = `haoqi__hoverbox ${className}`.trim();
  if (as === 'a') {
    return (
      <a className={cls} {...(rest as object)}>
        {children}
      </a>
    );
  }
  return (
    <button type="button" className={cls} {...(rest as object)}>
      {children}
    </button>
  );
}

type NavProps = {
  themeLabel: string;
  onThemeCycle: () => void;
  sound: boolean;
  onSoundToggle: () => void;
  onWork: () => void;
  onContact: () => void;
};

function FrameNav({ themeLabel, onThemeCycle, sound, onSoundToggle, onWork, onContact }: NavProps) {
  return (
    <nav className="haoqi__nav" aria-label="Primary">
      <HoverBox onClick={onWork}>
        <span>Work</span>
      </HoverBox>
      <HoverBox onClick={onContact}>
        <span>Contact</span>
      </HoverBox>
      <HoverBox onClick={onThemeCycle} aria-label={`Theme: ${themeLabel}`}>
        <span>Theme[{themeLabel}]</span>
      </HoverBox>
      <HoverBox
        onClick={onSoundToggle}
        aria-label={sound ? 'Sound playing, click to pause' : 'Sound paused, click to play'}
        aria-pressed={sound}
      >
        <span>Sound[{sound ? '|' : '-'}]</span>
      </HoverBox>
    </nav>
  );
}

type HaoqiFrameChromeProps = NavProps & {
  logoAs?: 'a' | 'link';
};

export default function HaoqiFrameChrome({
  logoAs = 'a',
  themeLabel,
  onThemeCycle,
  sound,
  onSoundToggle,
  onWork,
  onContact,
}: HaoqiFrameChromeProps) {
  useHaoqiSound(sound);
  const { clock, coordsLabel, weatherLabel } = useHaoqiLiveStatus();

  return (
    <div className="haoqi__frame">
      <header className="haoqi__topbar">
        <div className="haoqi__topLeft">
          {logoAs === 'link' ? (
            <Link className="haoqi__hoverbox haoqi__logo" to="/haoqi">
              <span>haoqi</span>
              <span>.design</span>
            </Link>
          ) : (
            <HoverBox as="a" href="/haoqi" className="haoqi__logo">
              <span>haoqi</span>
              <span>.design</span>
            </HoverBox>
          )}
        </div>
        <FrameNav
          themeLabel={themeLabel}
          onThemeCycle={onThemeCycle}
          sound={sound}
          onSoundToggle={onSoundToggle}
          onWork={onWork}
          onContact={onContact}
        />
      </header>

      <footer className="haoqi__botbar">
        <span className="haoqi__status">
          GMT+8 CN {clock} {weatherLabel}
        </span>
        <span className="haoqi__status">{coordsLabel}</span>
      </footer>
    </div>
  );
}

export function HaoqiProjectFrameChrome(props: Omit<HaoqiFrameChromeProps, 'logoAs' | 'onWork' | 'onContact'>) {
  return (
    <HaoqiFrameChrome
      {...props}
      logoAs="link"
      onWork={() => {
        window.location.href = '/haoqi#selected-work';
      }}
      onContact={() => {
        window.location.href = '/haoqi#contact';
      }}
    />
  );
}
