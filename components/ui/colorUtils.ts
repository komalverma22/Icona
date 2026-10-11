/** Accepts "#abc", "abc", "#aabbcc", "aabbcc" → "#aabbcc" (lowercase), otherwise null. */
export function normalizeHex(input: string): string | null {
  const raw = input.trim().replace(/^#/, "").toLowerCase();
  if (/^[0-9a-f]{3}$/.test(raw)) return `#${raw.replace(/./g, (ch) => ch + ch)}`;
  if (/^[0-9a-f]{6}$/.test(raw)) return `#${raw}`;
  return null;
}
