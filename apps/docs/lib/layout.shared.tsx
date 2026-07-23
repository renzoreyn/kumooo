import type { BaseLayoutProps } from "fumadocs-ui/layouts/shared";
import { site } from "./site";

export function baseOptions(): BaseLayoutProps {
  return {
    nav: {
      title: site.name,
      url: "/docs",
    },
    githubUrl: site.github,
    links: [
      {
        text: "Site",
        url: site.url,
        external: true,
      },
    ],
  };
}
