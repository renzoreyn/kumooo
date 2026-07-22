import { spawn } from "node:child_process";

export function run(
  cmd: string,
  args: string[],
  opts?: { cwd?: string; env?: NodeJS.ProcessEnv },
): Promise<number> {
  return new Promise((resolve, reject) => {
    const child = spawn(cmd, args, {
      cwd: opts?.cwd,
      env: { ...process.env, ...opts?.env },
      stdio: "inherit",
      shell: process.platform === "win32",
    });
    child.on("error", reject);
    child.on("close", (code) => resolve(code ?? 1));
  });
}

export function runCapture(
  cmd: string,
  args: string[],
  opts?: { cwd?: string; env?: NodeJS.ProcessEnv },
): Promise<{ code: number; stdout: string; stderr: string }> {
  return new Promise((resolve, reject) => {
    const child = spawn(cmd, args, {
      cwd: opts?.cwd,
      env: { ...process.env, ...opts?.env },
      stdio: ["ignore", "pipe", "pipe"],
      shell: process.platform === "win32",
    });
    let stdout = "";
    let stderr = "";
    child.stdout?.on("data", (chunk: Buffer | string) => {
      stdout += String(chunk);
    });
    child.stderr?.on("data", (chunk: Buffer | string) => {
      stderr += String(chunk);
    });
    child.on("error", reject);
    child.on("close", (code) => resolve({ code: code ?? 1, stdout, stderr }));
  });
}

export async function wrangler(args: string[], cwd: string): Promise<number> {
  return run("pnpm", ["exec", "wrangler", ...args], { cwd });
}

export async function wranglerCapture(
  args: string[],
  cwd: string,
): Promise<{ code: number; stdout: string; stderr: string }> {
  return runCapture("pnpm", ["exec", "wrangler", ...args], { cwd });
}
