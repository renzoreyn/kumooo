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
    <main className="mx-auto max-w-3xl px-5 py-16 sm:px-8">
      <FadeIn>
        <p className="text-sm font-medium text-[var(--mint)]">Learn</p>
        <h1 className="mt-3 text-4xl font-semibold tracking-[-0.03em] text-[var(--fg)]">
          New to websites? Start at 1.
        </h1>
        <p className="mt-3 text-[17px] leading-relaxed text-[var(--fog)]">
          An ordered path. Do them in order if this is your first time. Each one is short on purpose.
        </p>
      </FadeIn>

      <ol className="mt-12 space-y-3">
        {LEARN_PATH.map((item, i) => (
          <li key={item.slug}>
            <FadeIn delay={i * 0.04}>
              <Link
                href={`/learn/${item.slug}`}
                className="block rounded-3xl border border-[var(--line)] bg-white px-6 py-5 shadow-sm transition-colors hover:border-[var(--mint)]/50"
              >
                <div className="flex flex-wrap items-baseline justify-between gap-2">
                  <p className="text-lg font-semibold tracking-[-0.02em] text-[var(--fg)]">
                    <span className="mr-2 text-[var(--mint)]">{item.order}.</span>
                    {item.title}
                  </p>
                  <span className="text-xs font-medium text-[var(--fog)]">~{item.minutes} min</span>
                </div>
                <p className="mt-2 text-sm leading-relaxed text-[var(--fog)]">{item.outcome}</p>
              </Link>
            </FadeIn>
          </li>
        ))}
      </ol>
    </main>
  );
}
