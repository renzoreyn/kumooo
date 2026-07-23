import Link from "next/link";
import { Button, Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger, FadeIn } from "@kumooo/ui";
import { BrandWordmark } from "@/components/brand-mark";
import { DeployButton } from "@/components/deploy-button";
import { SitePlayground } from "@/components/playground/site-playground";
import { site } from "@/lib/site";

export default function HomePage() {
  return (
    <main>
      <section className="relative overflow-hidden">
        <div className="mx-auto grid max-w-6xl gap-10 px-5 pb-16 pt-10 sm:px-8 lg:grid-cols-[minmax(0,0.95fr)_minmax(0,1.05fr)] lg:items-center lg:gap-8 lg:pb-20 lg:pt-14">
          <FadeIn className="relative z-10">
            <BrandWordmark size="lg" />
            <h1 className="font-display mt-8 max-w-xl text-3xl font-bold leading-[1.1] tracking-tight text-[var(--paper)] sm:text-4xl md:text-5xl">
              Make a website without the babysitting.
            </h1>
            <p className="mt-4 max-w-md text-base leading-relaxed text-[var(--fog)] sm:text-lg">
              {site.name} is a Next.js toolkit for beginners and builders. Deploy in one click, or follow a guided
              setup. We help you learn. Hosted care and a dead-simple theme editor come later.
            </p>
            <div className="mt-8 flex flex-wrap items-start gap-4">
              <DeployButton size="lg" />
              <div className="flex flex-col gap-2">
                <Button
                  asChild
                  variant="outline"
                  size="lg"
                  className="border-[var(--line)] text-[var(--paper)] hover:bg-white/5"
                >
                  <Link href="/setup">Guided setup</Link>
                </Button>
                <Link href="/learn" className="text-sm text-[var(--mint)] hover:underline">
                  New to websites? Start learning
                </Link>
                <Link href="/start#cli" className="text-xs text-[var(--fog)] hover:text-[var(--paper)]">
                  Prefer the terminal?
                </Link>
              </div>
            </div>
          </FadeIn>
          <FadeIn delay={0.12} className="min-w-0 lg:-mr-8 xl:-mr-16">
            <SitePlayground />
          </FadeIn>
        </div>
      </section>

      <section className="border-t border-[var(--line)]">
        <div className="mx-auto max-w-6xl px-5 py-20 sm:px-8">
          <FadeIn>
            <p className="text-xs font-semibold uppercase tracking-[0.18em] text-[var(--mint)]">For beginners</p>
            <h2 className="font-display mt-3 max-w-2xl text-3xl font-bold tracking-tight text-[var(--paper)] sm:text-4xl">
              Never built a site? Start here.
            </h2>
            <p className="mt-3 max-w-xl text-[var(--fog)]">
              Short tutorials in plain language. No assumed CS degree. Just the path from blank laptop to a live URL.
            </p>
            <Button asChild className="mt-8 bg-[var(--mint)] text-[var(--ink)] hover:bg-[var(--mint-dim)]">
              <Link href="/learn">Open the Learn path</Link>
            </Button>
          </FadeIn>
        </div>
      </section>

      <section className="border-t border-[var(--line)] bg-black/20">
        <div className="mx-auto max-w-6xl px-5 py-20 sm:px-8">
          <FadeIn>
            <p className="text-xs font-semibold uppercase tracking-[0.18em] text-[var(--mint)]">The kit</p>
            <h2 className="font-display mt-3 max-w-2xl text-3xl font-bold tracking-tight text-[var(--paper)] sm:text-4xl">
              Power without the plugin graveyard.
            </h2>
            <p className="mt-3 max-w-xl text-[var(--fog)]">
              Serious React UI with motion baked in. Same components your starters use.
            </p>
          </FadeIn>
          <FadeIn delay={0.1} className="mt-10 grid gap-4 sm:grid-cols-3">
            <div className="rounded-2xl border border-[var(--line)] bg-[var(--ink-elevated)]/60 p-5">
              <p className="font-display text-lg font-semibold text-[var(--paper)]">Motion</p>
              <p className="mt-2 text-sm text-[var(--fog)]">FadeIn, Stagger, and friends. Respect reduced motion.</p>
            </div>
            <div className="rounded-2xl border border-[var(--line)] bg-[var(--ink-elevated)]/60 p-5">
              <p className="font-display text-lg font-semibold text-[var(--paper)]">Primitives</p>
              <p className="mt-2 text-sm text-[var(--fog)]">Buttons, dialogs, inputs. shadcn-style, Kibo-ready.</p>
              <Dialog>
                <DialogTrigger asChild>
                  <Button variant="outline" size="sm" className="mt-4 border-[var(--line)]">
                    Try a dialog
                  </Button>
                </DialogTrigger>
                <DialogContent className="border-[var(--line)] bg-[var(--ink-elevated)] text-[var(--paper)]">
                  <DialogHeader>
                    <DialogTitle>Yep, it works</DialogTitle>
                    <DialogDescription className="text-[var(--fog)]">
                      This is the same Dialog from @kumooo/ui that starters ship with.
                    </DialogDescription>
                  </DialogHeader>
                </DialogContent>
              </Dialog>
            </div>
            <div className="rounded-2xl border border-[var(--line)] bg-[var(--ink-elevated)]/60 p-5">
              <p className="font-display text-lg font-semibold text-[var(--paper)]">Starters</p>
              <p className="mt-2 text-sm text-[var(--fog)]">Blank, blog, or shop. Pick a shape and ship.</p>
            </div>
          </FadeIn>
        </div>
      </section>

      <section className="border-t border-[var(--line)]">
        <div className="mx-auto max-w-6xl px-5 py-20 sm:px-8">
          <FadeIn>
            <p className="text-xs font-semibold uppercase tracking-[0.18em] text-[var(--mint)]">What&apos;s coming</p>
            <h2 className="font-display mt-3 max-w-2xl text-3xl font-bold tracking-tight text-[var(--paper)] sm:text-4xl">
              We&apos;ll help manage it. The editor will be obvious.
            </h2>
            <p className="mt-3 max-w-xl text-[var(--fog)]">
              Open source you run today. Later: hosted care so you are not alone with DNS at 1am, and a theme editor
              that feels like the playground above. Not shipping those yet. We won&apos;t pretend otherwise.
            </p>
          </FadeIn>
        </div>
      </section>
    </main>
  );
}
