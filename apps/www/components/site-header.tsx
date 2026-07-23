import Link from "next/link";
import { BrandWordmark } from "@/components/brand-mark";

const links = [
  { href: "/learn", label: "Learn" },
  { href: "/setup", label: "Setup" },
  { href: "/docs", label: "Docs" },
  { href: "/start", label: "Start" },
];

export function SiteHeader() {
  return (
    <header className="relative z-20 border-b border-[var(--line)]/80">
      <div className="mx-auto flex max-w-6xl items-center justify-between gap-4 px-5 py-4 sm:px-8">
        <BrandWordmark />
        <nav className="flex flex-wrap items-center justify-end gap-x-5 gap-y-2 text-sm text-[var(--fog)]">
          {links.map((link) => (
            <Link
              key={link.href}
              href={link.href}
              className="transition-colors hover:text-[var(--mint)]"
            >
              {link.label}
            </Link>
          ))}
          <a
            href="https://github.com/renzoreyn/kumooo"
            className="transition-colors hover:text-[var(--mint)]"
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
