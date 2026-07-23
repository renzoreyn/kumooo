import type { Metadata } from "next";
import Link from "next/link";
import { FadeIn } from "@kumooo/ui";
import { LEARN_PATH } from "@/lib/learn";

export const metadata: Metadata = {
  title: "Learn",
  description: "Beginner path: what a website is, set up your computer, create a site, deploy.",
};

export default function LearnPage() {
  return (
    <main className="mx-auto max-w-6xl px-5 py-14 sm:px-8">
      <FadeIn>
        <p className="text-xs font-semibold uppercase tracking-[0.18em] text-[var(--mint)]">Learn</p>
        <h1 className="font-display mt-3 text-4xl font-bold tracking-tight text-[var(--paper)]">
          New to websites? Start at 1.
        </h1>
        <p className="mt-3 max-w-xl text-[var(--fog)]">
          An ordered path. Do them in order if this is your first time. Each one is short on purpose.
        </p>
      </FadeIn>

      <ol className="mt-12 space-y-4">
        {LEARN_PATH.map((item, i) => (
          <li key={item.slug}>
            <FadeIn delay={i * 0.05}>
              <Link
                href={`/learn/${item.slug}`}
                className="block rounded-2xl border border-[var(--line)] bg-[var(--ink-elevated)]/50 px-5 py-5 transition-colors hover:border-[var(--mint)]/40"
              >
                <div className="flex flex-wrap items-baseline justify-between gap-2">
                  <p className="font-display text-xl font-semibold text-[var(--paper)]">
                    <span className="mr-3 text-[var(--mint)]">{item.order}.</span>
                    {item.title}
                  </p>
                  <span className="text-xs text-[var(--fog)]">~{item.minutes} min</span>
                </div>
                <p className="mt-2 text-sm text-[var(--fog)]">{item.outcome}</p>
              </Link>
            </FadeIn>
          </li>
        ))}
      </ol>
    </main>
  );
}
