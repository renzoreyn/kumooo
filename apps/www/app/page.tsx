import Link from "next/link";
import { Button, FadeIn } from "@kumooo/ui";
import { BrandWordmark } from "@/components/brand-mark";
import { DeployButton } from "@/components/deploy-button";
import { SitePlayground } from "@/components/playground/site-playground";
import { site } from "@/lib/site";

export default function HomePage() {
  return (
    <main>
      <section className="relative">
        <div className="mx-auto grid max-w-6xl items-center gap-14 px-5 pb-24 pt-20 sm:px-8 lg:grid-cols-2 lg:gap-16 lg:pb-28 lg:pt-24">
          <FadeIn>
            <BrandWordmark size="hero" />
            <h1 className="mt-8 max-w-[13ch] text-[2.5rem] font-semibold leading-[1.05] tracking-[-0.035em] text-[var(--fg)] sm:text-5xl">
              A website toolkit that stays out of your way.
            </h1>
            <p className="mt-5 max-w-md text-[17px] leading-relaxed text-[var(--fog)]">
              Starters on Next.js. Real UI. Deploy to Cloudflare. Tutorials if you have never shipped a site. We are
              not pretending the theme editor ships today.
            </p>
            <div className="mt-10 flex flex-wrap items-end gap-3">
              <DeployButton size="lg" showNote={false} />
              <Button
                asChild
                variant="outline"
                size="lg"
                className="rounded-full border-[var(--line)] bg-transparent px-6 text-[var(--fg)] hover:bg-white/5"
              >
                <Link href="/setup">Guided setup</Link>
              </Button>
            </div>
            <p className="mt-4 text-sm text-[var(--fog)]">
              <Link href="/learn" className="text-[var(--fg)] underline-offset-4 hover:underline">
                Never built a site?
              </Link>{" "}
              Start with Learn.
            </p>
          </FadeIn>
          <FadeIn delay={0.08} className="min-w-0">
            <SitePlayground />
          </FadeIn>
        </div>
      </section>

      <section className="border-t border-[var(--line)]">
        <div className="mx-auto grid max-w-6xl gap-8 px-5 py-24 sm:px-8 lg:grid-cols-2 lg:items-end">
          <FadeIn>
            <p className="text-sm font-medium text-[var(--mint)]">Beginners</p>
            <h2 className="mt-3 text-3xl font-semibold tracking-[-0.03em] text-[var(--fg)] sm:text-4xl">
              Four short lessons. Then a live URL.
            </h2>
          </FadeIn>
          <FadeIn delay={0.05}>
            <p className="text-[17px] leading-relaxed text-[var(--fog)]">
              What a website is. How to install tools. How to run{" "}
              <code className="font-mono text-[15px] text-[var(--fg)]">create-kumooo</code>. How to edit and deploy.
            </p>
            <Button
              asChild
              className="mt-6 rounded-full bg-[var(--mint)] px-6 text-black hover:bg-[var(--mint-dim)]"
            >
              <Link href="/learn">Open Learn</Link>
            </Button>
          </FadeIn>
        </div>
      </section>

      <section className="border-t border-[var(--line)]">
        <div className="mx-auto max-w-6xl px-5 py-24 sm:px-8">
          <FadeIn>
            <p className="text-sm font-medium text-[var(--mint)]">What you get</p>
            <h2 className="mt-3 max-w-xl text-3xl font-semibold tracking-[-0.03em] text-[var(--fg)] sm:text-4xl">
              Blank, blog, or shop. Same kit underneath.
            </h2>
          </FadeIn>
          <div className="mt-14 grid gap-10 sm:grid-cols-3">
            {[
              { title: "UI", body: "Buttons, dialogs, motion. Same package the starters use." },
              { title: "CLI", body: "npx create-kumooo and you are in a running Next app." },
              { title: "Docs", body: "Reference on docs.kumooo.dev. Learn path stays here." },
            ].map((item) => (
              <div key={item.title}>
                <p className="text-xl font-semibold tracking-[-0.02em] text-[var(--fg)]">{item.title}</p>
                <p className="mt-2 text-[15px] leading-relaxed text-[var(--fog)]">{item.body}</p>
              </div>
            ))}
          </div>
          <p className="mt-12 text-sm text-[var(--fog)]">
            Reference:{" "}
            <a href={site.docs} className="text-[var(--fg)] underline-offset-4 hover:underline" rel="noreferrer" target="_blank">
              docs.kumooo.dev
            </a>
          </p>
        </div>
      </section>

      <section className="border-t border-[var(--line)]">
        <div className="mx-auto max-w-6xl px-5 py-24 sm:px-8">
          <FadeIn>
            <p className="text-sm font-medium text-[var(--mint)]">Later</p>
            <h2 className="mt-3 max-w-lg text-3xl font-semibold tracking-[-0.03em] text-[var(--fg)] sm:text-4xl">
              Hosted care. An editor that does not feel like 2009.
            </h2>
            <p className="mt-4 max-w-lg text-[17px] leading-relaxed text-[var(--fog)]">
              Open source you run today. Manage and theme tools when they are actually good. We will say so when they
              ship.
            </p>
          </FadeIn>
        </div>
      </section>
    </main>
  );
}
