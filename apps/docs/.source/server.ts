// @ts-nocheck
import * as __fd_glob_20 from "../content/docs/guides/using-ui.mdx?collection=docs"
import * as __fd_glob_19 from "../content/docs/guides/troubleshooting.mdx?collection=docs"
import * as __fd_glob_18 from "../content/docs/guides/project-structure.mdx?collection=docs"
import * as __fd_glob_17 from "../content/docs/guides/opennext-cloudflare.mdx?collection=docs"
import * as __fd_glob_16 from "../content/docs/guides/index.mdx?collection=docs"
import * as __fd_glob_15 from "../content/docs/guides/env-and-secrets.mdx?collection=docs"
import * as __fd_glob_14 from "../content/docs/guides/custom-domains.mdx?collection=docs"
import * as __fd_glob_13 from "../content/docs/learn/what-is-a-website.mdx?collection=docs"
import * as __fd_glob_12 from "../content/docs/learn/setup-your-computer.mdx?collection=docs"
import * as __fd_glob_11 from "../content/docs/learn/index.mdx?collection=docs"
import * as __fd_glob_10 from "../content/docs/learn/first-site.mdx?collection=docs"
import * as __fd_glob_9 from "../content/docs/learn/edit-and-deploy.mdx?collection=docs"
import * as __fd_glob_8 from "../content/docs/setup.mdx?collection=docs"
import * as __fd_glob_7 from "../content/docs/installation.mdx?collection=docs"
import * as __fd_glob_6 from "../content/docs/index.mdx?collection=docs"
import * as __fd_glob_5 from "../content/docs/hosting.mdx?collection=docs"
import * as __fd_glob_4 from "../content/docs/getting-started.mdx?collection=docs"
import * as __fd_glob_3 from "../content/docs/architecture.mdx?collection=docs"
import { default as __fd_glob_2 } from "../content/docs/learn/meta.json?collection=docs"
import { default as __fd_glob_1 } from "../content/docs/guides/meta.json?collection=docs"
import { default as __fd_glob_0 } from "../content/docs/meta.json?collection=docs"
import { server } from 'fumadocs-mdx/runtime/server';
import type * as Config from '../source.config';

const create = server<typeof Config, import("fumadocs-mdx/runtime/types").InternalTypeConfig & {
  DocData: {
  }
}>();

export const docs = await create.docs("docs", "content/docs", {"meta.json": __fd_glob_0, "guides/meta.json": __fd_glob_1, "learn/meta.json": __fd_glob_2, }, {"architecture.mdx": __fd_glob_3, "getting-started.mdx": __fd_glob_4, "hosting.mdx": __fd_glob_5, "index.mdx": __fd_glob_6, "installation.mdx": __fd_glob_7, "setup.mdx": __fd_glob_8, "learn/edit-and-deploy.mdx": __fd_glob_9, "learn/first-site.mdx": __fd_glob_10, "learn/index.mdx": __fd_glob_11, "learn/setup-your-computer.mdx": __fd_glob_12, "learn/what-is-a-website.mdx": __fd_glob_13, "guides/custom-domains.mdx": __fd_glob_14, "guides/env-and-secrets.mdx": __fd_glob_15, "guides/index.mdx": __fd_glob_16, "guides/opennext-cloudflare.mdx": __fd_glob_17, "guides/project-structure.mdx": __fd_glob_18, "guides/troubleshooting.mdx": __fd_glob_19, "guides/using-ui.mdx": __fd_glob_20, });