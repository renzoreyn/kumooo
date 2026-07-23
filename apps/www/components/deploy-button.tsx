import { ArrowRightIcon } from "@kumooo/ui";
import { Button } from "@kumooo/ui";
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
        className="bg-[var(--mint)] text-[var(--ink)] hover:bg-[var(--mint-dim)]"
      >
        <a href={DEPLOY_BLANK_URL} rel="noreferrer" target="_blank">
          Deploy on Vercel
          <ArrowRightIcon />
        </a>
      </Button>
      {showNote ? <p className="mt-2 max-w-sm text-xs leading-relaxed text-[var(--fog)]">{DEPLOY_NOTE}</p> : null}
    </div>
  );
}
