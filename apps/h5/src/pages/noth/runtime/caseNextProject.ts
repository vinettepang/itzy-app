import { nothWorkPath } from '../paths';

type WorkListEntry = { name: string; number: number; href: string };

function parseListItem(item: HTMLElement): WorkListEntry | null {
  const rawHref = item.querySelector('a')?.getAttribute('href') ?? '';
  const divs = [...item.children].filter((c) => c.tagName === 'DIV');
  const name = (divs[0]?.textContent ?? '').trim();
  const number = parseInt((divs[1]?.textContent ?? '').trim(), 10);
  if (!name || Number.isNaN(number)) return null;
  return { name, number, href: normalizeCaseHref(rawHref) };
}

function normalizeCaseHref(href: string): string {
  const rel = href.match(/\.\/([^/]+)\/index\.html/);
  if (rel) return nothWorkPath(rel[1]);
  if (href.startsWith('/noth/works/')) return href;
  const abs = href.match(/\/works\/([^/?#]+)/);
  if (abs) return nothWorkPath(abs[1]);
  return href;
}

/** main `jv` — case 页底部「下一项目」 */
export function initCaseNextProject(scope: HTMLElement): () => void {
  const block = scope.querySelector<HTMLElement>('.next-project-w');
  if (!block) return () => {};

  const title = block.querySelector<HTMLElement>('.h1-case-next');
  const numberEl = block.querySelector<HTMLElement>('.nbr-project-next');
  const link = block.querySelector<HTMLAnchorElement>('.next-work-link');
  const items = [...block.querySelectorAll<HTMLElement>('.next-work-list .next-work-item')];
  if (!title || !numberEl || !items.length) return () => {};

  let current = block.dataset.currentProject;
  if (current == null) {
    const m = (numberEl.getAttribute('aria-label') ?? numberEl.textContent ?? '').match(/\d+/);
    if (!m) return () => {};
    current = m[0];
    block.dataset.currentProject = current;
  }

  const currentNum = parseInt(current, 10);
  if (Number.isNaN(currentNum)) return () => {};

  const parsed = items.map(parseListItem).filter((x): x is WorkListEntry => x !== null);
  if (!parsed.length) return () => {};

  const next =
    parsed.filter((p) => p.number > currentNum).sort((a, b) => a.number - b.number)[0] ??
    parsed.slice().sort((a, b) => a.number - b.number)[0];

  if (!next) return () => {};

  title.textContent = next.name;
  title.setAttribute('aria-label', next.name);
  const label = `W'${String(next.number).padStart(2, '0')}`;
  numberEl.textContent = label;
  numberEl.setAttribute('aria-label', label);
  if (link) {
    link.setAttribute('href', next.href);
    link.dataset.transition = 'flip';
  }

  return () => {};
}
