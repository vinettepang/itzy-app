import { Link } from 'react-router-dom';
import { FP_BASE } from './data';

type Props = {
  blendDifference?: boolean;
  isSmall?: boolean;
  hasBio?: boolean;
  bio?: string;
};

export function FelixLogo({ blendDifference, isSmall, hasBio, bio }: Props) {
  const headerClass = [
    'header svelte-1ebabbx',
    blendDifference ? 'is-difference' : '',
    isSmall ? 'is-small' : '',
    hasBio ? 'has-bio' : '',
  ]
    .filter(Boolean)
    .join(' ');

  return (
    <header className={headerClass}>
      <Link className="letter letter-f svelte-1ebabbx" to={FP_BASE} aria-label="Logo letter F">
        <svg xmlns="http://www.w3.org/2000/svg" width="97" height="140" fill="none" viewBox="0 0 97 140" className="svelte-1ebabbx">
          <path
            fill="currentColor"
            d="m.8 140-.8-.8V.8L.8 0h95l.8.8V24l-.8.8H38.4c-8.4 0-12.8 4.4-12.8 12.4v5.2c0 8 4.4 12.4 12.8 12.4h48.8l.6.8v23.2l-.6 1H38.4c-8.4 0-12.8 4.4-12.8 12.6v46.8l-.8.8H.8Z"
          />
        </svg>
      </Link>
      <Link className="letter letter-p svelte-1ebabbx" to={FP_BASE} aria-label="Logo letter P">
        <svg xmlns="http://www.w3.org/2000/svg" width="106" height="140" fill="none" viewBox="0 0 106 140" className="svelte-1ebabbx">
          <path
            fill="currentColor"
            d="m.8 140-.8-.8V.8L.8 0H62c29.8 0 43.6 20.6 43.6 44.4 0 23.8-13.8 42-43.6 42H45.6c-13 0-20 7-20 20v32.8l-.8.8H.8Zm24.8-91.2c0 8.2 4.4 12.8 12.8 12.8h20.2c14.8 0 20-10 20-18.4 0-8.4-5.2-18.4-20-18.4H38.4c-8.4 0-12.8 5.4-12.8 13.6v10.4Z"
          />
        </svg>
      </Link>
      {hasBio && bio ? (
        <div className="bio svelte-1ebabbx">
          <h1 className="title-small">Félix Péault</h1>
          <p className="description text-small">{bio}</p>
        </div>
      ) : null}
    </header>
  );
}
