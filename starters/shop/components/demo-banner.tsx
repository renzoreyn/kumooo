export function DemoBanner({ starter }: { starter: "blank" | "blog" | "shop" }) {
  return (
    <div className="border-b border-[hsl(var(--border))] bg-[hsl(var(--muted))]/40 px-4 py-2 text-center text-xs text-[hsl(var(--muted-foreground))] sm:text-sm">
      Live {starter} demo ·{" "}
      <a href="https://kumooo.dev" className="font-medium text-[hsl(var(--foreground))] underline-offset-2 hover:underline">
        kumooo.js
      </a>
      {" · "}
      <a
        href="https://docs.kumooo.dev/docs/setup"
        className="font-medium text-[hsl(var(--foreground))] underline-offset-2 hover:underline"
      >
        make your own
      </a>
    </div>
  );
}
