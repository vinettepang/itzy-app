/** Split display name into 1–2 uppercase lines (SOURCE · fn-split-p). */
export function splitName(name: string): string[] {
  const parts = name.toUpperCase().split(' ').filter(Boolean);
  if (parts.length <= 1) return [parts[0] || 'ANTHONY'];
  if (parts.length === 2) return parts;
  const mid = Math.ceil(parts.length / 2);
  return [parts.slice(0, mid).join(' '), parts.slice(mid).join(' ')];
}
