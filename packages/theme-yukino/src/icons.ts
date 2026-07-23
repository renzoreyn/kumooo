/** Lucide-style stroke icons for Yukino. */
const svg = (path: string) =>
  `<svg class="yk-i" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true">${path}</svg>`;

export const ic: Record<string, string> = {
  bag: svg(
    `<path d="M6 2 3 6v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2V6l-3-4Z"/><line x1="3" y1="6" x2="21" y2="6"/><path d="M16 10a4 4 0 0 1-8 0"/>`,
  ),
  close: svg(`<line x1="18" y1="6" x2="6" y2="18"/><line x1="6" y1="6" x2="18" y2="18"/>`),
  chevron: svg(`<polyline points="6 9 12 15 18 9"/>`),
  snow: svg(
    `<line x1="12" y1="2" x2="12" y2="22"/><line x1="2" y1="12" x2="22" y2="12"/><line x1="4.9" y1="4.9" x2="19.1" y2="19.1"/><line x1="19.1" y1="4.9" x2="4.9" y2="19.1"/>`,
  ),
  plus: svg(`<line x1="12" y1="5" x2="12" y2="19"/><line x1="5" y1="12" x2="19" y2="12"/>`),
  minus: svg(`<line x1="5" y1="12" x2="19" y2="12"/>`),
  check: svg(`<polyline points="20 6 9 17 4 12"/>`),
};

export function icon(name: keyof typeof ic | string): string {
  return ic[name] ?? "";
}
