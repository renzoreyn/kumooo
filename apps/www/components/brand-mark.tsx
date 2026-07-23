import Link from "next/link";

export function BrandMark({ className = "h-9 w-9" }: { className?: string }) {
  return (
    <svg
      className={className}
      viewBox="0 0 32 32"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      aria-hidden
    >
      <rect width="32" height="32" rx="6" fill="#0a0f0d" />
      <path
        d="M9 7h4.2l4.1 7.2L21.4 7H26l-6.2 9.4L26 25h-4.6l-4.1-7.3L13.2 25H9l6.3-9.6L9 7z"
        fill="#6ee7b7"
      />
    </svg>
  );
}

export function BrandWordmark({ size = "md" }: { size?: "md" | "lg" }) {
  const text = size === "lg" ? "text-4xl sm:text-5xl md:text-6xl" : "text-lg";
  return (
    <Link href="/" className="inline-flex items-center gap-3 text-[var(--paper)] no-underline">
      <BrandMark className={size === "lg" ? "h-12 w-12 sm:h-14 sm:w-14" : "h-8 w-8"} />
      <span className={`font-display font-bold tracking-tight ${text}`}>kumooo.js</span>
    </Link>
  );
}
