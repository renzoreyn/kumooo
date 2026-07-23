import type { Metadata } from "next";
import Link from "next/link";
import { FadeIn } from "@kumooo/ui";

export const metadata: Metadata = { title: "Architecture" };

export default function ArchitectureDoc() {
  return (
    <main className="mx-auto max-w-3xl px-5 py-14 sm:px-8">
      <FadeIn className="prose-learn">
        <p className="text-xs text-[var(--fog)]">
          <Link href="/docs" className="text-[var(--mint)]">
            Docs
          </Link>
        </p>
        <h1 className="font-display text-4xl font-bold text-[var(--paper)]">Architecture</h1>
        <p>
          kumooo.js is conventions + kits on <strong>Next.js</strong>, not a fork of Next.
        </p>
        <pre>
          <code>{`create-kumooo
  -> starters/blank|blog|shop
       -> @kumooo/ui
       -> @kumooo/framework
       -> next`}</code>
        </pre>
        <p>
          Official site (<code>apps/www</code>) dogfoods the same UI kit. Hosted multi-tenant manage and the visual
          theme editor are planned later. They are not in this tree yet.
        </p>
      </FadeIn>
    </main>
  );
}
