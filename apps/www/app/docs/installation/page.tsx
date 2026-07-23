import type { Metadata } from "next";
import Link from "next/link";
import { FadeIn } from "@kumooo/ui";

export const metadata: Metadata = { title: "Installation" };

export default function InstallationDoc() {
  return (
    <main className="mx-auto max-w-3xl px-5 py-14 sm:px-8">
      <FadeIn className="prose-learn">
        <p className="text-xs text-[var(--fog)]">
          <Link href="/docs" className="text-[var(--mint)]">
            Docs
          </Link>
        </p>
        <h1 className="font-display text-4xl font-bold text-[var(--paper)]">Installation</h1>
        <p>
          Need Node LTS. Then:
        </p>
        <pre>
          <code>{`npx create-kumooo
cd my-site
pnpm install
pnpm dev`}</code>
        </pre>
        <p>
          In this monorepo, packages live under <code>packages/*</code> and starters under <code>starters/*</code>.
          The marketing site is <code>apps/www</code>.
        </p>
        <p>
          Step-by-step with checkboxes: <Link href="/setup">/setup</Link>.
        </p>
      </FadeIn>
    </main>
  );
}
