// @ts-nocheck
import { browser } from 'fumadocs-mdx/runtime/browser';
import type * as Config from '../source.config';

const create = browser<typeof Config, import("fumadocs-mdx/runtime/types").InternalTypeConfig & {
  DocData: {
  }
}>();
const browserCollections = {
  docs: create.doc("docs", {"architecture.mdx": () => import("../content/docs/architecture.mdx?collection=docs"), "getting-started.mdx": () => import("../content/docs/getting-started.mdx?collection=docs"), "hosting.mdx": () => import("../content/docs/hosting.mdx?collection=docs"), "index.mdx": () => import("../content/docs/index.mdx?collection=docs"), "installation.mdx": () => import("../content/docs/installation.mdx?collection=docs"), "setup.mdx": () => import("../content/docs/setup.mdx?collection=docs"), "learn/edit-and-deploy.mdx": () => import("../content/docs/learn/edit-and-deploy.mdx?collection=docs"), "learn/first-site.mdx": () => import("../content/docs/learn/first-site.mdx?collection=docs"), "learn/index.mdx": () => import("../content/docs/learn/index.mdx?collection=docs"), "learn/setup-your-computer.mdx": () => import("../content/docs/learn/setup-your-computer.mdx?collection=docs"), "learn/what-is-a-website.mdx": () => import("../content/docs/learn/what-is-a-website.mdx?collection=docs"), "guides/custom-domains.mdx": () => import("../content/docs/guides/custom-domains.mdx?collection=docs"), "guides/env-and-secrets.mdx": () => import("../content/docs/guides/env-and-secrets.mdx?collection=docs"), "guides/index.mdx": () => import("../content/docs/guides/index.mdx?collection=docs"), "guides/opennext-cloudflare.mdx": () => import("../content/docs/guides/opennext-cloudflare.mdx?collection=docs"), "guides/project-structure.mdx": () => import("../content/docs/guides/project-structure.mdx?collection=docs"), "guides/troubleshooting.mdx": () => import("../content/docs/guides/troubleshooting.mdx?collection=docs"), "guides/using-ui.mdx": () => import("../content/docs/guides/using-ui.mdx?collection=docs"), }),
};
export default browserCollections;