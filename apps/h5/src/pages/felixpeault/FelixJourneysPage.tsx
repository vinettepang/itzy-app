import { felixContent } from './data';

export default function FelixJourneysPage() {
  return (
    <main className="fp-journeys grid container">
      <h1 className="fp-page-title title-large">Elsewhere</h1>
      <p className="fp-journeys-lead title-medium">
        Destination-based archive — extend <code>content.json</code> or add journey regions for a full grid.
      </p>
      <p className="text-small">{felixContent.journeysNote}</p>
    </main>
  );
}
