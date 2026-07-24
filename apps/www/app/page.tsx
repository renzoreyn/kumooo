import Link from "next/link";
import { Button, FadeIn } from "@kumooo/ui";
import { BrandWordmark } from "@/components/brand-mark";
import { DeployButton } from "@/components/deploy-button";
import { HeroAtmosphere } from "@/components/hero-atmosphere";
import { getChangelog } from "@/lib/changelog";
import { createCommand, site } from "@/lib/site";

const flexes = [
  {
    title: "Next.js. Not a religion.",
    body: "App Router. We add starters, UI, and enough opinions that you stop rearranging folders for sport.",
  },
  {
    title: "Your Cloudflare. Or ours.",
    body: "Self-host on your account, or park it on {slug}.kumooo.site. Nimbus: two sites, 150 MB. We counted.",
  },
  {
    title: "UI that does not apologize",
    body: "@kumooo/ui is primitives and motion. Your blank starter should not look like abandoned coursework.",
  },
  {
    title: "Docs that assume you can read",
    body: "Learn path, guided setup, guides. If you have never deployed anything, we still talk to you like an adult.",
  },
];

export default function HomePage() {
  const changelog = getChangelog().slice(0, 4);

  return (
    <main>
      <section className="relative min-h-[88vh] overflow-hidden px-5 pb-28 pt-16 sm:px-8 sm:pt-24">
        <HeroAtmosphere />
        <div className="relative mx-auto max-w-3xl text-center">
          <FadeIn>
            <div className="flex justify-center">
              <BrandWordmark size="hero" />
            </div>
            <h1 className="mx-auto mt-10 max-w-[16ch] text-[2.75rem] font-semibold leading-[1.05] tracking-[-0.04em] text-[var(--fg)] sm:text-5xl md:text-[3.5rem]">
              Websites without the babysitting.
            </h1>
            <p className="mx-auto mt-6 max-w-xl text-[19px] leading-relaxed text-[var(--fog)]">
              Next.js starters. Deploy on Cloudflare yourself, or host with us. Either way, the site stops being a
              side quest.
            </p>
            <div className="mt-10 flex flex-wrap items-center justify-center gap-3">
              <DeployButton size="lg" showNote={false} />
              <Button
                asChild
                variant="outline"
                size="lg"
                className="rounded-full border-[var(--line)] bg-transparent px-7 text-[var(--fg)] hover:bg-white/5"
              >
                <a href={site.app}>Dashboard</a>
              </Button>
            </div>
            <p className="mt-6 text-[15px] text-[var(--fog)]">
              Never shipped a site?{" "}
              <a
                href={site.docsLearn}
                className="font-medium text-[var(--fg)] underline-offset-4 hover:underline"
                rel="noreferrer"
                target="_blank"
              >
                Start with Learn
              </a>
              . Short. Blunt. No pep talk.
            </p>
          </FadeIn>
        </div>
      </section>

      <section className="border-t border-[var(--line)] bg-[var(--bg-2)]">
        <div className="mx-auto max-w-3xl px-5 py-24 text-center sm:px-8">
          <FadeIn>
            <p className="text-sm font-medium text-[var(--mint)]">One command. Applause optional.</p>
            <h2 className="mt-3 text-3xl font-semibold tracking-[-0.03em] text-[var(--fg)] sm:text-4xl">
              Laptop to localhost.
            </h2>
            <pre className="mx-auto mt-10 max-w-lg overflow-x-auto rounded-2xl border border-[var(--line)] bg-[var(--bg)] px-5 py-4 text-left font-mono text-[14px] text-[var(--fg)]">
              <code>{`${createCommand}\ncd my-site\npnpm dev`}</code>
            </pre>
            <p className="mt-6 text-[15px] text-[var(--fog)]">
              Terminal feels hostile?{" "}
              <a
                href={site.docsSetup}
                className="font-medium text-[var(--fg)] underline-offset-4 hover:underline"
                rel="noreferrer"
                target="_blank"
              >
                Guided setup
              </a>
              . Still no pep talk.
            </p>
          </FadeIn>
        </div>
      </section>

      <section className="border-t border-[var(--line)]">
        <div className="mx-auto max-w-5xl px-5 py-24 sm:px-8">
          <FadeIn className="mx-auto max-w-2xl text-center">
            <p className="text-sm font-medium text-[var(--mint)]">Flexes</p>
            <h2 className="mt-3 text-3xl font-semibold tracking-[-0.03em] text-[var(--fg)] sm:text-4xl">
              Why people stop fighting their stack.
            </h2>
            <p className="mt-4 text-[16px] leading-relaxed text-[var(--fog)]">
              Not magic. Fewer toys. Less theater.
            </p>
          </FadeIn>
          <div className="mt-14 grid gap-8 sm:grid-cols-2">
            {flexes.map((item, i) => (
              <FadeIn key={item.title} delay={i * 0.04}>
                <div className="h-full border-l border-[var(--mint)]/40 pl-5">
                  <h3 className="text-xl font-semibold tracking-[-0.02em] text-[var(--fg)]">{item.title}</h3>
                  <p className="mt-3 text-[15px] leading-relaxed text-[var(--fog)]">{item.body}</p>
                </div>
              </FadeIn>
            ))}
          </div>
        </div>
      </section>

      <section className="border-t border-[var(--line)] bg-[var(--bg-2)]">
        <div className="mx-auto max-w-5xl px-5 py-24 sm:px-8">
          <FadeIn className="mx-auto max-w-2xl text-center">
            <p className="text-sm font-medium text-[var(--mint)]">Starters</p>
            <h2 className="mt-3 text-3xl font-semibold tracking-[-0.03em] text-[var(--fg)] sm:text-4xl">
              Three shapes. Pick one. Stop browsing.
            </h2>
          </FadeIn>
          <div className="mt-16 grid gap-8 sm:grid-cols-3">
            {[
              {
                title: "Blank",
                body: "App Router + @kumooo/ui. Empty on purpose.",
                href: site.demos.blank,
              },
              {
                title: "Blog",
                body: "Posts and an index. You type words. Wild.",
                href: site.demos.blog,
              },
              {
                title: "Shop",
                body: "Catalog and a fake bag. Real payments are homework.",
                href: site.demos.shop,
              },
            ].map((item) => (
              <a
                key={item.title}
                href={item.href}
                target="_blank"
                rel="noreferrer"
                className="group rounded-2xl border border-[var(--line)] bg-[var(--bg)]/40 px-6 py-8 text-center no-underline transition-colors hover:border-[var(--mint)]/50 hover:bg-[var(--bg)]"
              >
                <p className="text-xl font-semibold tracking-[-0.02em] text-[var(--fg)]">{item.title}</p>
                <p className="mt-3 text-[15px] leading-relaxed text-[var(--fog)] group-hover:text-[var(--fg)]">
                  {item.body}
                </p>
                <p className="mt-5 text-sm font-medium text-[var(--mint)]">Open live demo{" ->"}</p>
              </a>
            ))}
          </div>
        </div>
      </section>

      <section className="border-t border-[var(--line)]">
        <div className="mx-auto max-w-3xl px-5 py-24 sm:px-8">
          <FadeIn>
            <div className="flex flex-wrap items-end justify-between gap-4">
              <div>
                <p className="text-sm font-medium text-[var(--mint)]">Changelog</p>
                <h2 className="mt-3 text-3xl font-semibold tracking-[-0.03em] text-[var(--fg)]">
                  We ship. Then we document the crime.
                </h2>
              </div>
              <Link
                href="/changelog"
                className="text-sm font-medium text-[var(--fog)] underline-offset-4 hover:text-[var(--fg)] hover:underline"
              >
                Full log
              </Link>
            </div>
            <ul className="mt-10 divide-y divide-[var(--line)] border-y border-[var(--line)]">
              {changelog.map((entry) => (
                <li key={entry.slug}>
                  <Link
                    href={`/changelog/${entry.slug}`}
                    className="group flex items-start justify-between gap-6 py-5 no-underline"
                  >
                    <div>
                      <p className="font-mono text-sm text-[var(--mint)]">{entry.version}</p>
                      <p className="mt-1 text-[15px] leading-relaxed text-[var(--fog)] group-hover:text-[var(--fg)]">
                        {entry.bullets[0] ?? "Release notes"}
                      </p>
                    </div>
                    <span className="shrink-0 text-sm text-[var(--fog)] group-hover:text-[var(--fg)]">Open{" ->"}</span>
                  </Link>
                </li>
              ))}
            </ul>
          </FadeIn>
        </div>
      </section>

      <section className="border-t border-[var(--line)] bg-[var(--bg-2)]">
        <div className="mx-auto max-w-3xl px-5 py-24 text-center sm:px-8">
          <FadeIn>
            <p className="text-sm font-medium text-[var(--mint)]">Hosting</p>
            <h2 className="mt-3 text-3xl font-semibold tracking-[-0.03em] text-[var(--fg)] sm:text-4xl">
              Nimbus on kumooo.site. Ambition costs extra later.
            </h2>
            <p className="mx-auto mt-5 max-w-lg text-[17px] leading-relaxed text-[var(--fog)]">
              Dashboard with email code or password. Two sites on Nimbus. Paid plans when billing stops being vapor. Or
              keep your own Cloudflare account. We will survive.
            </p>
            <div className="mt-8 flex flex-wrap justify-center gap-3">
              <Button asChild className="rounded-full bg-[var(--fg)] px-7 text-[var(--bg)] hover:opacity-90">
                <a href={site.app}>Open dashboard</a>
              </Button>
              <Button
                asChild
                variant="outline"
                className="rounded-full border-[var(--line)] bg-transparent px-7 text-[var(--fg)] hover:bg-white/5"
              >
                <Link href="/pricing">See plans</Link>
              </Button>
            </div>
          </FadeIn>
        </div>
      </section>
    </main>
  );
}
