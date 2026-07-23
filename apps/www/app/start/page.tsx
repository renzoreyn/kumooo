import type { Metadata } from "next";
import Link from "next/link";
import { Button, CodeBlock, FadeIn } from "@kumooo/ui";
import { DeployButton } from "@/components/deploy-button";
import { createCommand, site } from "@/lib/site";

export const metadata: Metadata = {
  title: "Start",
  description: "Deploy on Vercel, follow guided setup, or use the terminal.",
};

export default function StartPage() {
  return (
    <main className="mx-auto max-w-6xl px-5 py-14 sm:px-8">
      <FadeIn>
        <p className="text-xs font-semibold uppercase tracking-[0.18em] text-[var(--mint)]">Start</p>
        <h1 className="font-display mt-3 text-4xl font-bold tracking-tight text-[var(--paper)]">Pick a door</h1>
        <p className="mt-3 max-w-xl text-[var(--fog)]">
          Same destination. Different comfort levels. If you&apos;ve never shipped a site, Guided setup or Learn first.
        </p>
      </FadeIn>

      <div className="mt-12 grid gap-6 md:grid-cols-3">
        <FadeIn className="rounded-2xl border border-[var(--line)] bg-[var(--ink-elevated)]/50 p-6">
          <h2 className="font-display text-xl font-semibold text-[var(--paper)]">Deploy</h2>
          <p className="mt-2 text-sm text-[var(--fog)]">One click. Account on Vercel, not here.</p>
          <DeployButton className="mt-5" />
        </FadeIn>
        <FadeIn delay={0.06} className="rounded-2xl border border-[var(--line)] bg-[var(--ink-elevated)]/50 p-6">
          <h2 className="font-display text-xl font-semibold text-[var(--paper)]">Guided setup</h2>
          <p className="mt-2 text-sm text-[var(--fog)]">Tools → create → preview → deploy, step by step.</p>
          <Button asChild className="mt-5 bg-[var(--mint)] text-[var(--ink)]">
            <Link href="/setup">Open setup</Link>
          </Button>
        </FadeIn>
        <FadeIn delay={0.12} className="rounded-2xl border border-[var(--line)] bg-[var(--ink-elevated)]/50 p-6">
          <h2 className="font-display text-xl font-semibold text-[var(--paper)]">Learn</h2>
          <p className="mt-2 text-sm text-[var(--fog)]">Absolute beginner path. Four short tutorials.</p>
          <Button asChild variant="outline" className="mt-5 border-[var(--line)]">
            <Link href="/learn">Open Learn</Link>
          </Button>
        </FadeIn>
      </div>

      <div className="mt-16 scroll-mt-24" id="cli">
        <FadeIn delay={0.1}>
          <h2 className="font-display text-2xl font-bold text-[var(--paper)]">Prefer the terminal?</h2>
          <p className="mt-2 max-w-xl text-[var(--fog)]">
            Fine. This is the whole onboarding for people who already live in a shell.
          </p>
          <div className="mt-5 max-w-xl">
            <CodeBlock language="bash" code={`${createCommand}\ncd my-site\npnpm dev`} />
          </div>
          <p className="mt-4 text-sm text-[var(--fog)]">
            Source:{" "}
            <a href={site.github} className="text-[var(--mint)] underline" rel="noreferrer" target="_blank">
              {site.github}
            </a>
          </p>
        </FadeIn>
      </div>
    </main>
  );
}
