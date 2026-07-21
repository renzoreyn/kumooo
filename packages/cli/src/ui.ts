import pc from "picocolors";

export const bold = (s: string) => pc.bold(s);
export const cyan = (s: string) => pc.cyan(s);
export const dim = (s: string) => pc.dim(s);
export const ok = (s: string) => console.log(`${pc.green("✓")} ${s}`);
export const fail = (s: string) => console.error(`${pc.red("✗")} ${s}`);

export function printError(error: unknown): void {
  if (error instanceof Error) fail(error.message);
  else fail(String(error));
}
