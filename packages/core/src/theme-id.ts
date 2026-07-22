/** Normalize site theme ids. Legacy `default` maps to free spring theme `haru`. */
export function resolveThemeId(name: string | null | undefined): string {
  const n = (name ?? "").trim();
  if (!n || n === "default") return "haru";
  return n;
}
