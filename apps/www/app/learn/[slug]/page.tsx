import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import ReactMarkdown from "react-markdown";
import { FadeIn } from "@kumooo/ui";
import { LEARN_PATH } from "@/lib/learn";
import { readTutorial } from "@/lib/tutorials";

type Props = { params: Promise<{ slug: string }> };

export function generateStaticParams() {
  return LEARN_PATH.map((item) => ({ slug: item.slug }));
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { slug } = await params;
  const tutorial = await readTutorial(slug);
  if (!tutorial) return { title: "Tutorial" };
  return { title: tutorial.meta.title, description: tutorial.meta.outcome };
}

export default async function LearnTutorialPage({ params }: Props) {
  const { slug } = await params;
  const tutorial = await readTutorial(slug);
  if (!tutorial) notFound();

  const idx = LEARN_PATH.findIndex((item) => item.slug === slug);
  const prev = idx > 0 ? LEARN_PATH[idx - 1] : null;
  const next = idx >= 0 && idx < LEARN_PATH.length - 1 ? LEARN_PATH[idx + 1] : null;

  return (
    <main className="mx-auto max-w-6xl px-5 py-14 sm:px-8">
      <FadeIn>
        <p className="text-xs text-[var(--fog)]">
          <Link href="/learn" className="text-[var(--mint)] hover:underline">
            Learn
          </Link>
          <span className="mx-2">/</span>
          Step {tutorial.meta.order}
        </p>
        <h1 className="font-display mt-3 text-4xl font-bold tracking-tight text-[var(--paper)]">
          {tutorial.meta.title}
        </h1>
        <p className="mt-2 text-sm text-[var(--fog)]">
          {tutorial.meta.outcome} · ~{tutorial.meta.minutes} min
        </p>
      </FadeIn>
      <FadeIn delay={0.08} className="prose-learn mt-10">
        <ReactMarkdown>{tutorial.body}</ReactMarkdown>
      </FadeIn>
      <nav className="mt-14 flex flex-wrap justify-between gap-4 border-t border-[var(--line)] pt-8 text-sm">
        {prev ? (
          <Link href={`/learn/${prev.slug}`} className="text-[var(--fog)] hover:text-[var(--mint)]">
            ← {prev.title}
          </Link>
        ) : (
          <span />
        )}
        {next ? (
          <Link href={`/learn/${next.slug}`} className="text-[var(--mint)] hover:underline">
            {next.title} →
          </Link>
        ) : (
          <Link href="/start" className="text-[var(--mint)] hover:underline">
            Done? Pick a door on Start →
          </Link>
        )}
      </nav>
    </main>
  );
}
