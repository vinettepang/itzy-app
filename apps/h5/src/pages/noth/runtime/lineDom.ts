/** 归档里仅有 `[line]` / `[letter]` 而无 `.line-child` 时，补 Webflow 掩膜结构 */

export type DomRestore = { el: HTMLElement; html: string };

function splitLines(text: string): string[] {
  const parts = text.split(/\n+/).map((s) => s.trim()).filter(Boolean);
  return parts.length ? parts : [text.trim()];
}

function appendLineMask(parent: HTMLElement, lineText: string, childClass: 'line-child' | 'letter-child') {
  const mask = document.createElement('div');
  mask.className = childClass === 'line-child' ? 'line-mask-child-mask' : 'letter-mask-child-mask';
  mask.setAttribute('aria-hidden', 'true');
  const child = document.createElement('div');
  child.className = childClass;
  child.setAttribute('aria-hidden', 'true');
  child.textContent = lineText;
  mask.appendChild(child);
  parent.appendChild(mask);
}

export function hydrateLineRevealDom(el: HTMLElement): DomRestore | null {
  if (el.querySelector('.line-child')) return null;
  const label = el.getAttribute('aria-label');
  const text = (label || el.textContent || '').trim();
  if (!text) return null;

  const saved = el.innerHTML;
  el.innerHTML = '';
  if (label) el.setAttribute('aria-label', label);
  splitLines(text).forEach((line) => appendLineMask(el, line, 'line-child'));
  return { el, html: saved };
}

export function hydrateLetterRevealDom(el: HTMLElement): DomRestore | null {
  if (el.querySelector('.letter-child')) return null;
  const label = el.getAttribute('aria-label');
  const text = (label || el.textContent || '').trim();
  if (!text) return null;

  const saved = el.innerHTML;
  el.innerHTML = '';
  if (label) el.setAttribute('aria-label', label);
  for (const ch of text) {
    if (ch === ' ' || ch === '\u00a0') {
      el.appendChild(document.createTextNode(ch));
      continue;
    }
    appendLineMask(el, ch, 'letter-child');
  }
  return { el, html: saved };
}
