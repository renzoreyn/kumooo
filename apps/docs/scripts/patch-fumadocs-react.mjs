import fs from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const root = path.join(__dirname, "../../..");

const polyfillPath = path.join(__dirname, "../lib/use-effect-event.cjs");
const polyfill = fs.readFileSync(polyfillPath, "utf8");

const targets = [
  path.join(root, "node_modules/fumadocs-core/dist"),
  path.join(root, "node_modules/fumadocs-ui/dist"),
];

const importPattern =
  /import\s*\{([^}]*)\}\s*from\s*["']react["'];?/g;

function patchFile(filePath) {
  let source = fs.readFileSync(filePath, "utf8");
  if (!source.includes("useEffectEvent")) return false;

  const next = source.replace(importPattern, (full, specifiers) => {
    const parts = specifiers
      .split(",")
      .map((part) => part.trim())
      .filter(Boolean);

    if (!parts.some((part) => part.replace(/^type\s+/, "") === "useEffectEvent")) {
      return full;
    }

    const kept = parts.filter((part) => part.replace(/^type\s+/, "") !== "useEffectEvent");
    const reactImport = kept.length > 0 ? `import { ${kept.join(", ")} } from "react";` : "";
    return `${reactImport}\nimport { useEffectEvent } from "fumadocs-use-effect-event";`;
  });

  if (next === source) return false;
  fs.writeFileSync(filePath, next);
  return true;
}

function walk(dir) {
  let count = 0;
  for (const entry of fs.readdirSync(dir, { withFileTypes: true })) {
    const full = path.join(dir, entry.name);
    if (entry.isDirectory()) {
      count += walk(full);
    } else if (entry.name.endsWith(".js")) {
      if (patchFile(full)) count += 1;
    }
  }
  return count;
}

const shimDir = path.join(root, "node_modules/fumadocs-use-effect-event");
fs.mkdirSync(shimDir, { recursive: true });
fs.writeFileSync(path.join(shimDir, "package.json"), JSON.stringify({ name: "fumadocs-use-effect-event", type: "commonjs" }, null, 2));
fs.writeFileSync(path.join(shimDir, "index.js"), polyfill);

let patched = 0;
for (const dir of targets) {
  if (fs.existsSync(dir)) patched += walk(dir);
}

console.log(`[patch-fumadocs] patched ${patched} files`);
