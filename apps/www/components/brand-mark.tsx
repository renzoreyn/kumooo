import Link from "next/link";

/** Flat geometric k: currentColor stem + diagonal + mint dot (no plate). */
export function BrandMark({ className = "h-8 w-8" }: { className?: string }) {
  return (
    <svg
      className={className}
      viewBox="0 0 32 32"
      xmlns="http://www.w3.org/2000/svg"
      aria-hidden
      fill="currentColor"
    >
      <g transform="translate(6.811 3.2) scale(0.071508)">
        <rect x="0" y="0" width="85" height="358" />
        <polygon points="85,252 133,185 134,185 147,204 161,223 174,242 187,261 201,280 214,299 228,318 241,337 255,356 256,357 156,357 155,356 142,337 129,318 116,299 103,280 90,261 90,252" />
        <circle cx="191.65" cy="155.3" r="42" fill="#6ee7b7" />
      </g>
    </svg>
  );
}

export function BrandWordmark({ size = "md" }: { size?: "md" | "lg" | "hero" }) {
  const mark = size === "hero" ? "h-12 w-12 sm:h-14 sm:w-14" : size === "lg" ? "h-9 w-9" : "h-7 w-7";
  const text =
    size === "hero"
      ? "text-4xl sm:text-5xl font-semibold tracking-[-0.04em]"
      : size === "lg"
        ? "text-xl font-semibold tracking-[-0.03em]"
        : "text-[15px] font-semibold tracking-[-0.02em]";

  return (
    <Link href="/" className="group inline-flex items-center gap-2.5 text-[var(--fg)] no-underline">
      <BrandMark className={mark} />
      <span className={text}>
        kumooo<span className="text-[var(--mint)]">.js</span>
      </span>
    </Link>
  );
}
