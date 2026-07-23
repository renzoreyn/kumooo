import Link from "next/link";
import { FadeIn } from "@kumooo/ui";
import { getChangelog } from "@/lib/changelog";

export const metadata = {
  title: "Changelog",
  description: "What shipped in kumooo.js, newest first.",
};

export default function ChangelogIndexPage() {
  const entries = getChangelog();

  return (
    <main className="px-5 pb-28 pt-16 sm:px-8 sm:pt-20">
      <div className="mx-auto max-w-2xl">
        <FadeIn>
          <p className="text-sm font-medium text-[var(--mint)]">Changelog</p>
          <h1 className="mt-3 text-4xl font-semibold tracking-[-0.04em] text-[var(--fg)]">Ship log</h1>
          <p className="mt-4 text-[17px] leading-relaxed text-[var(--fog)]">
            Versions go up. Features land. We write it here so you do not have to guess.
          </p>
        </FadeIn>
        <ul className="mt-12 divide-y divide-[var(--line)] border-y border-[var(--line)]">
          {entries.map((entry) => (
            <li key={entry.slug}>
              <Link href={`/changelog/${entry.slug}`} className="group block py-6 no-underline">
                <p className="font-mono text-sm text-[var(--mint)]">{entry.version}</p>
                <ul className="mt-3 space-y-1.5 text-[15px] leading-relaxed text-[var(--fog)] group-hover:text-[var(--fg)]">
                  {entry.bullets.slice(0, 3).map((b) => (
                    <li key={b}>· {b}</li>
                  ))}
                </ul>
                <p className="mt-3 text-sm text-[var(--fog)] group-hover:text-[var(--fg)]">Read notes →</p>
              </Link>
            </li>
          ))}
        </ul>
      </div>
    </main>
  );
}
