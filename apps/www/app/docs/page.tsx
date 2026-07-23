import type { Metadata } from "next";
import Link from "next/link";
import { FadeIn } from "@kumooo/ui";

export const metadata: Metadata = {
  title: "Docs",
  description: "Short kumooo.js docs stubs. Learn path is the beginner route.",
};

const docs = [
  {
    href: "/docs/getting-started",
    title: "Getting started",
    blurb: "Fast path if you already know the basics.",
  },
  {
    href: "/docs/installation",
    title: "Installation",
    blurb: "create-kumooo, workspace packages, local dev.",
  },
  {
    href: "/docs/architecture",
    title: "Architecture",
    blurb: "What kumooo.js is (and is not).",
  },
];

export default function DocsIndexPage() {
  return (
    <main className="mx-auto max-w-6xl px-5 py-14 sm:px-8">
      <FadeIn>
        <p className="text-xs font-semibold uppercase tracking-[0.18em] text-[var(--mint)]">Docs</p>
        <h1 className="font-display mt-3 text-4xl font-bold tracking-tight text-[var(--paper)]">Short stubs</h1>
        <p className="mt-3 max-w-xl text-[var(--fog)]">
          Deep API docs can wait. If you are new, prefer{" "}
          <Link href="/learn" className="text-[var(--mint)] underline">
            Learn
          </Link>
          .
        </p>
      </FadeIn>
      <ul className="mt-10 space-y-3">
        {docs.map((doc) => (
          <li key={doc.href}>
            <Link
              href={doc.href}
              className="block rounded-2xl border border-[var(--line)] bg-[var(--ink-elevated)]/50 px-5 py-4 hover:border-[var(--mint)]/40"
            >
              <p className="font-display text-lg font-semibold text-[var(--paper)]">{doc.title}</p>
              <p className="mt-1 text-sm text-[var(--fog)]">{doc.blurb}</p>
            </Link>
          </li>
        ))}
      </ul>
    </main>
  );
}
