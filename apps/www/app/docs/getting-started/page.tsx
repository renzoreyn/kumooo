import type { Metadata } from "next";
import Link from "next/link";
import { FadeIn } from "@kumooo/ui";

export const metadata: Metadata = { title: "Getting started" };

export default function GettingStartedDoc() {
  return (
    <main className="mx-auto max-w-3xl px-5 py-14 sm:px-8">
      <FadeIn className="prose-learn">
        <p className="text-xs text-[var(--fog)]">
          <Link href="/docs" className="text-[var(--mint)]">
            Docs
          </Link>
        </p>
        <h1 className="font-display text-4xl font-bold text-[var(--paper)]">Getting started</h1>
        <p>
          Fastest doors:{" "}
          <Link href="/">Deploy on Cloudflare</Link>, <Link href="/setup">Guided setup</Link>, or{" "}
          <code>npx create-kumooo</code>.
        </p>
        <p>
          Absolute beginners should use the <Link href="/learn">Learn path</Link> instead of jumping into package
          internals.
        </p>
      </FadeIn>
    </main>
  );
}
