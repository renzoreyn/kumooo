import Link from "next/link";
import { BrandMark } from "@/components/brand-mark";
import { site } from "@/lib/site";

export function SiteFooter() {
  return (
    <footer className="border-t border-[var(--line)] bg-white">
      <div className="mx-auto flex max-w-5xl flex-col gap-8 px-5 py-14 sm:flex-row sm:items-start sm:justify-between sm:px-8">
        <div className="flex items-start gap-3">
          <BrandMark className="h-8 w-8 shrink-0" />
          <div>
            <p className="text-lg font-semibold tracking-[-0.02em] text-[var(--fg)]">{site.name}</p>
            <p className="mt-1 max-w-xs text-sm leading-relaxed text-[var(--fog)]">{site.tagline}</p>
          </div>
        </div>
        <div className="flex flex-wrap gap-x-6 gap-y-2 text-sm font-medium text-[var(--fog)]">
          <Link href="/learn" className="hover:text-[var(--fg)]">
            Learn
          </Link>
          <Link href="/setup" className="hover:text-[var(--fg)]">
            Setup
          </Link>
          <a href={site.docs} className="hover:text-[var(--fg)]" rel="noreferrer" target="_blank">
            Docs
          </a>
          <a href={site.github} className="hover:text-[var(--fg)]" rel="noreferrer" target="_blank">
            GitHub
          </a>
          <a href={site.contact} className="hover:text-[var(--fg)]">
            Contact
          </a>
        </div>
      </div>
    </footer>
  );
}
