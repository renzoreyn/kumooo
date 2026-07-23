import Link from "next/link";
import { site } from "@/lib/site";

export function SiteFooter() {
  return (
    <footer className="relative z-10 mt-24 border-t border-[var(--line)]">
      <div className="mx-auto flex max-w-6xl flex-col gap-6 px-5 py-10 sm:flex-row sm:items-end sm:justify-between sm:px-8">
        <div>
          <p className="font-display text-lg font-semibold text-[var(--paper)]">{site.name}</p>
          <p className="mt-1 max-w-sm text-sm text-[var(--fog)]">{site.tagline}</p>
        </div>
        <div className="flex flex-wrap gap-x-5 gap-y-2 text-sm text-[var(--fog)]">
          <Link href="/learn" className="hover:text-[var(--mint)]">
            Learn
          </Link>
          <Link href="/setup" className="hover:text-[var(--mint)]">
            Setup
          </Link>
          <Link href="/docs" className="hover:text-[var(--mint)]">
            Docs
          </Link>
          <a href={site.github} className="hover:text-[var(--mint)]" rel="noreferrer" target="_blank">
            GitHub
          </a>
          <a href={site.contact} className="hover:text-[var(--mint)]">
            Contact
          </a>
          <a href={site.authorUrl} className="hover:text-[var(--mint)]" rel="noreferrer" target="_blank">
            Ren
          </a>
        </div>
      </div>
    </footer>
  );
}
