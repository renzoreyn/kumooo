import type { Metadata } from "next";
import Link from "next/link";
import { Button, CodeBlock, FadeIn } from "@kumooo/ui";
import { DeployButton } from "@/components/deploy-button";
import { createCommand, site } from "@/lib/site";

export const metadata: Metadata = {
  title: "Start",
  description: "Deploy on Cloudflare, follow guided setup, or use the terminal.",
};

export default function StartPage() {
  return (
    <main className="mx-auto max-w-5xl px-5 py-16 sm:px-8">
      <FadeIn className="mx-auto max-w-2xl text-center">
        <p className="text-sm font-medium text-[var(--mint)]">Start</p>
        <h1 className="mt-3 text-4xl font-semibold tracking-[-0.03em] text-[var(--fg)]">Pick a door</h1>
        <p className="mt-3 text-[17px] leading-relaxed text-[var(--fog)]">
          Same destination. Different comfort levels. Never shipped a site? Guided setup or Learn first.
        </p>
      </FadeIn>

      <div className="mt-14 grid gap-5 md:grid-cols-3">
        <FadeIn className="rounded-3xl border border-[var(--line)] bg-white p-7 shadow-sm">
          <h2 className="text-xl font-semibold text-[var(--fg)]">Deploy</h2>
          <p className="mt-2 text-sm leading-relaxed text-[var(--fog)]">One click. Account on Cloudflare, not here.</p>
          <DeployButton className="mt-6" showNote={false} />
        </FadeIn>
        <FadeIn delay={0.05} className="rounded-3xl border border-[var(--line)] bg-white p-7 shadow-sm">
          <h2 className="text-xl font-semibold text-[var(--fg)]">Guided setup</h2>
          <p className="mt-2 text-sm leading-relaxed text-[var(--fog)]">Tools, create, preview, deploy. Step by step.</p>
          <Button asChild className="mt-6 rounded-full bg-[var(--fg)] text-white hover:bg-black">
            <Link href="/setup">Open setup</Link>
          </Button>
        </FadeIn>
        <FadeIn delay={0.1} className="rounded-3xl border border-[var(--line)] bg-white p-7 shadow-sm">
          <h2 className="text-xl font-semibold text-[var(--fg)]">Learn</h2>
          <p className="mt-2 text-sm leading-relaxed text-[var(--fog)]">Absolute beginner path. Four short tutorials.</p>
          <Button
            asChild
            variant="outline"
            className="mt-6 rounded-full border-[var(--line)] text-[var(--fg)] hover:bg-[var(--bg)]"
          >
            <Link href="/learn">Open Learn</Link>
          </Button>
        </FadeIn>
      </div>

      <div className="mx-auto mt-20 max-w-xl scroll-mt-24" id="cli">
        <FadeIn>
          <h2 className="text-2xl font-semibold tracking-[-0.02em] text-[var(--fg)]">Prefer the terminal?</h2>
          <p className="mt-2 text-[var(--fog)]">Fine. This is the whole onboarding for people who already live in a shell.</p>
          <div className="mt-5">
            <CodeBlock language="bash" code={`${createCommand}\ncd my-site\npnpm dev`} />
          </div>
          <p className="mt-4 text-sm text-[var(--fog)]">
            Source:{" "}
            <a href={site.github} className="font-medium text-[var(--fg)] underline" rel="noreferrer" target="_blank">
              GitHub
            </a>
          </p>
        </FadeIn>
      </div>
    </main>
  );
}
