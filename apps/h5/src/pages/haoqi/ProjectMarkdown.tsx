import type { ReactNode } from 'react';

function parseInline(text: string): ReactNode[] {
  const nodes: ReactNode[] = [];
  const re = /\[([^\]]+)\]\(([^)]+)\)|`([^`]+)`/g;
  let last = 0;
  let m: RegExpExecArray | null;
  let k = 0;
  while ((m = re.exec(text))) {
    if (m.index > last) nodes.push(text.slice(last, m.index));
    if (m[1] && m[2]) {
      const isExternal = /^https?:\/\//.test(m[2]);
      const href = isExternal ? m[2] : m[2];
      nodes.push(
        <a
          key={k++}
          href={href}
          {...(isExternal ? { target: '_blank', rel: 'noreferrer' } : {})}
          className="haoqi__inlineLink"
        >
          {m[1]}
        </a>,
      );
    } else if (m[3]) {
      nodes.push(
        <code key={k++} className="haoqi__code">
          {m[3]}
        </code>,
      );
    }
    last = m.index + m[0].length;
  }
  if (last < text.length) nodes.push(text.slice(last));
  return nodes;
}

type Block =
  | { type: 'h2'; text: string }
  | { type: 'h3'; text: string }
  | { type: 'h4'; text: string }
  | { type: 'p'; text: string }
  | { type: 'img'; alt: string; src: string }
  | { type: 'ul'; items: string[] }
  | { type: 'ol'; items: string[] }
  | { type: 'code'; lang: string; content: string };

function parseBlocks(source: string): Block[] {
  const lines = source.trim().split('\n');
  const blocks: Block[] = [];
  let i = 0;

  while (i < lines.length) {
    const line = lines[i];
    if (!line.trim()) {
      i++;
      continue;
    }

    if (line.startsWith('```')) {
      const lang = line.slice(3).trim();
      i++;
      const codeLines: string[] = [];
      while (i < lines.length && !lines[i].startsWith('```')) {
        codeLines.push(lines[i]);
        i++;
      }
      if (i < lines.length) i++;
      blocks.push({ type: 'code', lang, content: codeLines.join('\n') });
      continue;
    }

    if (line.startsWith('## ')) {
      blocks.push({ type: 'h2', text: line.slice(3) });
      i++;
      continue;
    }

    if (line.startsWith('#### ')) {
      blocks.push({ type: 'h4', text: line.slice(5) });
      i++;
      continue;
    }

    if (line.startsWith('### ')) {
      blocks.push({ type: 'h3', text: line.slice(4) });
      i++;
      continue;
    }

    if (line.startsWith('![')) {
      const img = /!\[([^\]]*)\]\(([^)]+)\)/.exec(line);
      if (img) {
        blocks.push({ type: 'img', alt: img[1], src: img[2] });
        i++;
        continue;
      }
    }

    if (/^[-*] /.test(line)) {
      const items: string[] = [];
      while (i < lines.length && /^[-*] /.test(lines[i])) {
        items.push(lines[i].replace(/^[-*] /, ''));
        i++;
      }
      blocks.push({ type: 'ul', items });
      continue;
    }

    if (/^\d+\. /.test(line)) {
      const items: string[] = [];
      while (i < lines.length && /^\d+\. /.test(lines[i])) {
        items.push(lines[i].replace(/^\d+\. /, ''));
        i++;
      }
      blocks.push({ type: 'ol', items });
      continue;
    }

    const para: string[] = [line];
    i++;
    while (i < lines.length && lines[i].trim() && !lines[i].startsWith('#') && !lines[i].startsWith('![') && !/^[-*] /.test(lines[i]) && !/^\d+\. /.test(lines[i]) && !lines[i].startsWith('```')) {
      para.push(lines[i]);
      i++;
    }
    blocks.push({ type: 'p', text: para.join(' ') });
  }

  return blocks;
}

export default function ProjectMarkdown({ source }: { source: string }) {
  const blocks = parseBlocks(source);
  return (
    <div className="haoqi__prose">
      {blocks.map((block, i) => {
        if (block.type === 'h2') {
          return (
            <h2 key={i} className="haoqi__proseH2" id={block.text.toLowerCase().replace(/\s+/g, '-')}>
              {block.text}
            </h2>
          );
        }
        if (block.type === 'h3') {
          return (
            <h3 key={i} className="haoqi__proseH3">
              {block.text}
            </h3>
          );
        }
        if (block.type === 'h4') {
          return (
            <h4 key={i} className="haoqi__proseH4">
              {block.text}
            </h4>
          );
        }
        if (block.type === 'img') {
          return (
            <figure key={i} className="haoqi__proseFigure">
              <img src={block.src} alt={block.alt} loading="lazy" />
              {block.alt ? <figcaption>{block.alt}</figcaption> : null}
            </figure>
          );
        }
        if (block.type === 'ul') {
          return (
            <ul key={i} className="haoqi__proseList">
              {block.items.map((item, j) => (
                <li key={j}>{parseInline(item)}</li>
              ))}
            </ul>
          );
        }
        if (block.type === 'ol') {
          return (
            <ol key={i} className="haoqi__proseList haoqi__proseList--ordered">
              {block.items.map((item, j) => (
                <li key={j}>{parseInline(item)}</li>
              ))}
            </ol>
          );
        }
        if (block.type === 'code') {
          return (
            <pre key={i} className="haoqi__prosePre">
              {block.lang ? <span className="haoqi__prosePreLang">{block.lang}</span> : null}
              <code>{block.content}</code>
            </pre>
          );
        }
        return (
          <p key={i} className="haoqi__proseP">
            {parseInline(block.text)}
          </p>
        );
      })}
    </div>
  );
}
