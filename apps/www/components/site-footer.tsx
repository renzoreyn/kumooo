import { BrandMark } from "@/components/brand-mark";
import { MarqueeFooter } from "@/components/marquee-footer";
import { site } from "@/lib/site";

export function SiteFooter() {
  return (
    <footer className="bg-[var(--bg-2)]">
      <MarqueeFooter />
      <div className="border-t border-[var(--line)]">
        <div className="mx-auto max-w-5xl px-5 py-8 sm:px-8">
          <div className="flex items-start gap-3">
            <BrandMark className="mt-0.5 h-7 w-7 shrink-0 text-[var(--fg)]" />
            <div>
              <p className="text-[15px] font-semibold tracking-[-0.02em] text-[var(--fg)]">{site.name}</p>
              <p className="mt-1 max-w-md text-sm leading-relaxed text-[var(--fog)]">
                Next.js sites. Less babysitting. More shipping. A little attitude included free of charge.
              </p>
              <p className="mt-3 text-sm text-[var(--fog)]">
                <a href={site.contact} className="hover:text-[var(--fg)]">
                  Contact
                </a>
                <span className="mx-2 opacity-40" aria-hidden>
                  ·
                </span>
                <a href={site.docs} className="hover:text-[var(--fg)]" rel="noreferrer" target="_blank">
                  Docs
                </a>
                <span className="mx-2 opacity-40" aria-hidden>
                  ·
                </span>
                <a href={site.github} className="hover:text-[var(--fg)]" rel="noreferrer" target="_blank">
                  GitHub
                </a>
              </p>
            </div>
          </div>
        </div>
      </div>
    </footer>
  );
}
