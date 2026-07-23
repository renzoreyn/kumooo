import { readFile } from "node:fs/promises";
import path from "node:path";
import { getLearn, type LearnMeta } from "@/lib/learn";

export async function readTutorial(slug: string): Promise<{ meta: LearnMeta; body: string } | null> {
  const meta = getLearn(slug);
  if (!meta) return null;
  const file = path.join(process.cwd(), "content", "learn", `${slug}.md`);
  const raw = await readFile(file, "utf8");
  const body = raw.replace(/^#\s.+\n+/, "");
  return { meta, body };
}
