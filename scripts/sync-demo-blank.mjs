import { copyFileSync, mkdirSync, existsSync } from "node:fs";
import { dirname, join } from "node:path";
import { fileURLToPath } from "node:url";

const root = join(fileURLToPath(new URL(".", import.meta.url)), "..");
const src = join(root, "starters", "blank");
const dest = join(root, "apps", "demo-blank");

const files = [
  "app/page.tsx",
  "app/globals.css",
  "components/theme-toggle.tsx",
  "components/site-header.tsx",
  "components/kit-playground.tsx",
  "components/copy-command.tsx",
  "components/brand-mark.tsx",
  "components/accent-picker.tsx",
  "public/favicon.svg",
];

for (const rel of files) {
  const from = join(src, rel);
  const to = join(dest, rel);
  if (!existsSync(from)) {
    console.error(`missing source: ${rel}`);
    process.exit(1);
  }
  mkdirSync(dirname(to), { recursive: true });
  copyFileSync(from, to);
  console.log(`synced ${rel}`);
}

console.log("Note: app/layout.tsx is demo-specific (DemoBanner). Merge fonts/theme by hand if starter layout changes.");
