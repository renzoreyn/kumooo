import raw from "../content/CHANGELOG.md";

export type ChangelogEntry = {
  version: string;
  slug: string;
  body: string;
  bullets: string[];
};

export function parseChangelog(source: string): ChangelogEntry[] {
  const chunks = source.split(/^## /m).slice(1);
  return chunks.map((chunk) => {
    const lines = chunk.trim().split("\n");
    const version = (lines[0] ?? "").trim();
    const body = lines.slice(1).join("\n").trim();
    const bullets = body
      .split("\n")
      .map((l) => l.replace(/^- /, "").trim())
      .filter((l) => l.length > 0 && !l.startsWith("#"));
    return {
      version,
      slug: version.toLowerCase().replace(/[^a-z0-9.]+/g, "-"),
      body,
      bullets,
    };
  });
}

export function getChangelog(): ChangelogEntry[] {
  return parseChangelog(raw);
}

export function getChangelogEntry(slug: string): ChangelogEntry | undefined {
  return getChangelog().find((e) => e.slug === slug);
}
