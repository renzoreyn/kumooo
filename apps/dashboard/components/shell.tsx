"use client";

import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { client } from "@/lib/api";
import { site } from "@/lib/site";

export function Shell({
  email,
  children,
}: {
  email: string;
  children: React.ReactNode;
}) {
  const pathname = usePathname();
  const router = useRouter();

  async function logout() {
    try {
      await client.logout();
    } catch {
      /* ignore */
    }
    router.replace("/login");
  }

  return (
    <div className="min-h-screen">
      <header className="border-b border-[var(--line)] bg-[var(--bg-2)]/80 backdrop-blur">
        <div className="mx-auto flex max-w-3xl items-center justify-between gap-4 px-5 py-3.5">
          <Link href="/" className="inline-flex items-center gap-2 text-[var(--fg)] no-underline">
            <svg className="size-6" viewBox="0 0 32 32" fill="currentColor" aria-hidden>
              <g transform="translate(6.811 3.2) scale(0.071508)">
                <rect x="0" y="0" width="85" height="358" />
                <polygon points="85,252 133,185 134,185 147,204 161,223 174,242 187,261 201,280 214,299 228,318 241,337 255,356 256,357 156,357 155,356 142,337 129,318 116,299 103,280 90,261 90,252" />
                <circle cx="191.65" cy="155.3" r="42" fill="#6ee7b7" />
              </g>
            </svg>
            <span className="text-sm font-semibold tracking-[-0.02em]">kumooo</span>
          </Link>
          <nav className="flex items-center gap-4 text-[13px] text-[var(--fog)]">
            <Link
              href="/"
              className={pathname === "/" ? "text-[var(--fg)]" : "hover:text-[var(--fg)]"}
            >
              Sites
            </Link>
            <Link
              href="/account"
              className={pathname === "/account" ? "text-[var(--fg)]" : "hover:text-[var(--fg)]"}
            >
              Account
            </Link>
            <a href={site.docs} className="hover:text-[var(--fg)]" rel="noreferrer" target="_blank">
              Docs
            </a>
            <button type="button" onClick={logout} className="hover:text-[var(--fg)]">
              Log out
            </button>
          </nav>
        </div>
      </header>
      <div className="mx-auto max-w-3xl px-5 py-10">
        <p className="mb-8 text-sm text-[var(--fog)]">{email}</p>
        {children}
      </div>
    </div>
  );
}
