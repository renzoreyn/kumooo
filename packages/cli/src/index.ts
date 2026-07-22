#!/usr/bin/env node
import { build } from "./commands/build.js";
import { create } from "./commands/create.js";
import { deploy } from "./commands/deploy.js";
import { dev } from "./commands/dev.js";
import { doctor } from "./commands/doctor.js";
import { migrate } from "./commands/migrate.js";
import { bold, cyan, dim, printError } from "./ui.js";

const VERSION = "0.1.0";

const HELP = `
${bold("kumooo")} ${dim(`v${VERSION}`)} · publishing without the babysitting

${bold("Usage")}
  kumooo <command> [options]

${bold("Commands")}
  ${cyan("create [name]")}   Create a project (local or self-host on Cloudflare)
  ${cyan("dev")}             API + renderer + dashboard locally
  ${cyan("build")}           Production build (no deploy)
  ${cyan("deploy")}          Migrate and deploy API + renderer Workers
  ${cyan("doctor")}          Check your toolchain and layout
  ${cyan("migrate")}         Apply database migrations ${dim("(--local for dev)")}

${bold("Docs")}  https://docs.kumooo.dev
`;

async function main(): Promise<void> {
  const [command, ...args] = process.argv.slice(2);
  switch (command) {
    case "create":
      return create(args[0]);
    case "dev":
      return dev();
    case "build":
      return build();
    case "deploy":
      return deploy();
    case "doctor":
      return doctor();
    case "migrate":
      return migrate(args);
    case "--version":
    case "-v":
      console.log(VERSION);
      return;
    case undefined:
    case "help":
    case "--help":
    case "-h":
      console.log(HELP);
      return;
    default:
      console.log(HELP);
      console.error(`Unknown command: ${bold(command)}.`);
      process.exitCode = 1;
  }
}

main().catch((error: unknown) => {
  printError(error);
  process.exitCode = 1;
});
