import { ArrowRightIcon, Button } from "@kumooo/ui";
import { DEPLOY_BLANK_URL, DEPLOY_NOTE } from "@/lib/deploy";

export function DeployButton({
  className,
  showNote = true,
  size = "default",
}: {
  className?: string;
  showNote?: boolean;
  size?: "default" | "lg";
}) {
  return (
    <div className={className}>
      <Button
        asChild
        size={size === "lg" ? "lg" : "default"}
        className="rounded-full bg-[var(--fg)] px-7 font-medium text-[var(--bg)] hover:opacity-90"
      >
        <a href={DEPLOY_BLANK_URL} rel="noreferrer" target="_blank">
          Deploy on Cloudflare
          <ArrowRightIcon />
        </a>
      </Button>
      {showNote ? (
        <p className="mt-2 max-w-sm text-xs leading-relaxed text-[var(--fog)]">{DEPLOY_NOTE}</p>
      ) : null}
    </div>
  );
}
