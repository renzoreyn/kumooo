import Link from "next/link";
import { notFound } from "next/navigation";
import { FadeIn } from "@kumooo/ui";
import { getChangelog, getChangelogEntry } from "@/lib/changelog";

export function generateStaticParams() {
  return getChangelog().map((e) => ({ slug: e.slug }));
}

export function generateMetadata({ params }: { params: Promise<{ slug: string }> }) {
  return params.then(({ slug }) => {
    const entry = getChangelogEntry(slug);
    return {
      title: entry ? `${entry.version}` : "Changelog",
      description: entry?.bullets[0] ?? "Release notes",
    };
  });
}

export default async function ChangelogEntryPage({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params;
  const entry = getChangelogEntry(slug);
  if (!entry) notFound();

  return (
    <main className="px-5 pb-28 pt-16 sm:px-8 sm:pt-20">
      <article className="mx-auto max-w-2xl">
        <FadeIn>
          <Link href="/changelog" className="text-sm text-[var(--fog)] hover:text-[var(--fg)]">
            ← Changelog
          </Link>
          <p className="mt-8 font-mono text-sm text-[var(--mint)]">{entry.version}</p>
          <h1 className="mt-2 text-4xl font-semibold tracking-[-0.04em] text-[var(--fg)]">Release notes</h1>
          <ul className="prose-learn mt-10 space-y-3 text-[16px] leading-relaxed text-[var(--fog)]">
            {entry.bullets.map((b) => (
              <li key={b} className="flex gap-2">
                <span className="mt-2 h-1 w-1 shrink-0 rounded-full bg-[var(--mint)]" aria-hidden />
                <span>{b}</span>
              </li>
            ))}
          </ul>
        </FadeIn>
      </article>
    </main>
  );
}
