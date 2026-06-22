import { Link } from 'react-router-dom';
import './GamePage.css';

export default function GamePage() {
  return (
    <div className="game-page">
      <div className="game-hero">
        <div className="game-kicker">MIDZY · H5</div>
        <h1 className="game-title">小游戏</h1>
        <p className="game-sub">这里预留一个游戏页入口，你可以后续接入任意小游戏。</p>
        <div className="game-actions">
          <Link className="game-pill" to="/xkm">
            返回 XKM
          </Link>
        </div>
      </div>
    </div>
  );
}

