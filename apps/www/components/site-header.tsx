import Link from "next/link";
import { DashboardIcon, GitHubLogoIcon } from "@kumooo/ui";
import { BrandWordmark } from "@/components/brand-mark";
import { ThemeToggle } from "@/components/theme-toggle";
import { site } from "@/lib/site";

const links = [
  { href: "/pricing", label: "Pricing", external: false },
  { href: "/changelog", label: "Changelog", external: false },
  { href: site.docs, label: "Docs", external: true },
  {
    href: site.app,
    label: "Dashboard",
    external: true,
    icon: DashboardIcon,
  },
];

export function SiteHeader() {
  return (
    <header className="sticky top-0 z-20 border-b border-[var(--line)] bg-[var(--header-bg)] backdrop-blur-xl">
      <div className="mx-auto flex max-w-5xl items-center justify-between gap-6 px-5 py-3.5 sm:px-8">
        <BrandWordmark />
        <nav className="flex flex-wrap items-center justify-end gap-x-5 gap-y-2 text-[13px] font-medium text-[var(--fog)]">
          {links.map((link) => {
            const Icon = link.icon;
            const className =
              "inline-flex items-center gap-1.5 transition-colors hover:text-[var(--fg)]";
            const content = (
              <>
                {Icon ? <Icon className="size-3.5 opacity-80" aria-hidden /> : null}
                {link.label}
              </>
            );
            return link.external ? (
              <a
                key={link.href}
                href={link.href}
                className={className}
                rel="noreferrer"
                target="_blank"
              >
                {content}
              </a>
            ) : (
              <Link key={link.href} href={link.href} className={className}>
                {content}
              </Link>
            );
          })}
          <a
            href={site.github}
            className="inline-flex items-center gap-1.5 transition-colors hover:text-[var(--fg)]"
            rel="noreferrer"
            target="_blank"
          >
            <GitHubLogoIcon className="size-3.5 opacity-80" aria-hidden />
            GitHub
          </a>
          <ThemeToggle />
        </nav>
      </div>
    </header>
  );
}
