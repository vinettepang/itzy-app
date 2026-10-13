import { Link } from "react-router-dom";
import type { ReactNode } from "react";

export type ExhibitTileProps = {
  to: string;
  tags: string[];
  title: string;
  subtitle: string;
  status?: string;
  tone?: "paper" | "ink" | "rose" | "sky";
  visual: ReactNode;
  ariaLabel?: string;
};

export default function ExhibitTile({
  to,
  tags,
  title,
  subtitle,
  status,
  tone = "paper",
  visual,
  ariaLabel,
}: ExhibitTileProps) {
  return (
    <Link
      to={to}
      className={`exhibit-tile exhibit-tile--${tone}`}
      aria-label={ariaLabel ?? title}
    >
      <div className="exhibit-tile__tags" aria-hidden="true">
        {tags.map((tag) => (
          <span key={tag} className="exhibit-tile__tag">{tag}</span>
        ))}
        {status ? (
          <span className="exhibit-tile__status">{status}</span>
        ) : null}
      </div>
      <div className="exhibit-tile__head">
        <h3 className="exhibit-tile__title">{title}</h3>
        <p className="exhibit-tile__subtitle">{subtitle}</p>
      </div>
      <div className="exhibit-tile__visual">{visual}</div>
      <span className="exhibit-tile__cta">Open →</span>
    </Link>
  );
}
