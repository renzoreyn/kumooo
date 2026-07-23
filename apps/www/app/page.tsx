import Link from "next/link";
import { Button, FadeIn } from "@kumooo/ui";
import { BrandWordmark } from "@/components/brand-mark";
import { DeployButton } from "@/components/deploy-button";
import { createCommand, site } from "@/lib/site";

export default function HomePage() {
  return (
    <main>
      <section className="px-5 pb-28 pt-16 sm:px-8 sm:pt-24">
        <div className="mx-auto max-w-3xl text-center">
          <FadeIn>
            <div className="flex justify-center">
              <BrandWordmark size="hero" />
            </div>
            <h1 className="mx-auto mt-10 max-w-[16ch] text-[2.75rem] font-semibold leading-[1.05] tracking-[-0.04em] text-[var(--fg)] sm:text-5xl md:text-[3.5rem]">
              Websites without the babysitting.
            </h1>
            <p className="mx-auto mt-6 max-w-xl text-[19px] leading-relaxed text-[var(--fog)]">
              Open source starters on Next.js. Deploy on Cloudflare. Learn from zero if you need to. Hosted manage
              comes later, when it is actually good.
            </p>
            <div className="mt-10 flex flex-wrap items-center justify-center gap-3">
              <DeployButton size="lg" showNote={false} />
              <Button
                asChild
                variant="outline"
                size="lg"
                className="rounded-full border-[var(--line)] bg-white px-7 text-[var(--fg)] shadow-sm hover:bg-[var(--bg)]"
              >
                <Link href="/setup">Guided setup</Link>
              </Button>
            </div>
            <p className="mt-6 text-[15px] text-[var(--fog)]">
              New here?{" "}
              <Link href="/learn" className="font-medium text-[var(--fg)] underline-offset-4 hover:underline">
                Start with Learn
              </Link>
            </p>
          </FadeIn>
        </div>
      </section>

      <section className="border-t border-[var(--line)] bg-white">
        <div className="mx-auto max-w-3xl px-5 py-24 text-center sm:px-8">
          <FadeIn>
            <p className="text-sm font-medium text-[var(--mint)]">One command</p>
            <h2 className="mt-3 text-3xl font-semibold tracking-[-0.03em] text-[var(--fg)] sm:text-4xl">
              From blank laptop to local preview.
            </h2>
            <pre className="mx-auto mt-10 max-w-lg overflow-x-auto rounded-2xl border border-[var(--line)] bg-[var(--bg)] px-5 py-4 text-left font-mono text-[14px] text-[var(--fg)] shadow-sm">
              <code>{`${createCommand}\ncd my-site\npnpm dev`}</code>
            </pre>
            <p className="mt-6 text-[15px] text-[var(--fog)]">
              Or use{" "}
              <Link href="/setup" className="font-medium text-[var(--fg)] underline-offset-4 hover:underline">
                Guided setup
              </Link>{" "}
              if the terminal is new to you.
            </p>
          </FadeIn>
        </div>
      </section>

      <section className="border-t border-[var(--line)]">
        <div className="mx-auto max-w-5xl px-5 py-24 sm:px-8">
          <FadeIn className="mx-auto max-w-2xl text-center">
            <p className="text-sm font-medium text-[var(--mint)]">What you get</p>
            <h2 className="mt-3 text-3xl font-semibold tracking-[-0.03em] text-[var(--fg)] sm:text-4xl">
              Three starters. One kit.
            </h2>
          </FadeIn>
          <div className="mt-16 grid gap-8 sm:grid-cols-3">
            {[
              { title: "Blank", body: "A clean App Router app with @kumooo/ui ready." },
              { title: "Blog", body: "Posts and an index. Write, then ship." },
              { title: "Shop", body: "Lookbook pages with a demo bag. No payments." },
            ].map((item) => (
              <div
                key={item.title}
                className="rounded-3xl border border-[var(--line)] bg-white px-6 py-8 text-center shadow-sm"
              >
                <p className="text-xl font-semibold tracking-[-0.02em] text-[var(--fg)]">{item.title}</p>
                <p className="mt-3 text-[15px] leading-relaxed text-[var(--fog)]">{item.body}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      <section className="border-t border-[var(--line)] bg-white">
        <div className="mx-auto grid max-w-5xl gap-10 px-5 py-24 sm:px-8 lg:grid-cols-2 lg:items-center">
          <FadeIn>
            <p className="text-sm font-medium text-[var(--mint)]">Learn</p>
            <h2 className="mt-3 text-3xl font-semibold tracking-[-0.03em] text-[var(--fg)] sm:text-4xl">
              Four short lessons if you have never shipped a site.
            </h2>
          </FadeIn>
          <FadeIn delay={0.05}>
            <p className="text-[17px] leading-relaxed text-[var(--fog)]">
              Pages, tools, create-kumooo, then deploy. Plain language. No CS degree required.
            </p>
            <div className="mt-6 flex flex-wrap gap-3">
              <Button
                asChild
                className="rounded-full bg-[var(--fg)] px-6 text-white hover:bg-black"
              >
                <Link href="/learn">Open Learn</Link>
              </Button>
              <Button
                asChild
                variant="outline"
                className="rounded-full border-[var(--line)] bg-transparent px-6 text-[var(--fg)] hover:bg-[var(--bg)]"
              >
                <a href={site.docs} rel="noreferrer" target="_blank">
                  Docs
                </a>
              </Button>
            </div>
          </FadeIn>
        </div>
      </section>

      <section className="border-t border-[var(--line)]">
        <div className="mx-auto max-w-3xl px-5 py-24 text-center sm:px-8">
          <FadeIn>
            <p className="text-sm font-medium text-[var(--mint)]">Later</p>
            <h2 className="mt-3 text-3xl font-semibold tracking-[-0.03em] text-[var(--fg)] sm:text-4xl">
              Hosted care when it is ready. Not before.
            </h2>
            <p className="mx-auto mt-5 max-w-lg text-[17px] leading-relaxed text-[var(--fog)]">
              Today you own the repo and Cloudflare runs it. Theme editor and manage tools will ship when they feel
              obvious, not when a roadmap needs a checkbox.
            </p>
          </FadeIn>
        </div>
      </section>
    </main>
  );
}
