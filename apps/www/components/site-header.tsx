import Link from "next/link";
import { BrandWordmark } from "@/components/brand-mark";
import { site } from "@/lib/site";

const links = [
  { href: "/learn", label: "Learn" },
  { href: "/setup", label: "Setup" },
  { href: "/start", label: "Start" },
  { href: site.docs, label: "Docs", external: true },
];

export function SiteHeader() {
  return (
    <header className="relative z-20 border-b border-[var(--line)]">
      <div className="mx-auto flex max-w-6xl items-center justify-between gap-6 px-5 py-4 sm:px-8">
        <BrandWordmark />
        <nav className="flex flex-wrap items-center justify-end gap-x-6 gap-y-2 text-[13px] text-[var(--fog)]">
          {links.map((link) =>
            link.external ? (
              <a
                key={link.href}
                href={link.href}
                className="transition-colors hover:text-[var(--fg)]"
                rel="noreferrer"
                target="_blank"
              >
                {link.label}
              </a>
            ) : (
              <Link key={link.href} href={link.href} className="transition-colors hover:text-[var(--fg)]">
                {link.label}
              </Link>
            ),
          )}
          <a
            href={site.github}
            className="transition-colors hover:text-[var(--fg)]"
            rel="noreferrer"
            target="_blank"
          >
            GitHub
          </a>
        </nav>
      </div>
    </header>
  );
}
