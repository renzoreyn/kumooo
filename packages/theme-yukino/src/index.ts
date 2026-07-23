import type { Theme } from "@kumooo/theme-kit";
import { raw } from "@kumooo/theme-kit";
import { isYukinoProductSlug } from "./catalog.js";
import { homeMain } from "./home.js";
import {
  archiveMain,
  articleMain,
  notFoundMain,
  productMain,
  shopMain,
} from "./layouts.js";
import { shell } from "./shell.js";

export { YUKINO_CATALOG, isYukinoProductSlug, productBySlug } from "./catalog.js";
export { ic } from "./icons.js";

export const yukinoTheme: Theme = {
  name: "yukino",
  label: "Yukino",
  home: (site, data) => shell(site, { main: homeMain(site, data) }),
  post: (site, data) => {
    if (isYukinoProductSlug(data.post.slug)) {
      return shell(site, { main: productMain(data.post) });
    }
    return shell(site, {
      main: articleMain(data.post.title, raw(data.post.html), data.post.excerpt),
    });
  },
  page: (site, data) => {
    if (data.page.slug === "shop") {
      return shell(site, { main: shopMain(data.page) });
    }
    return shell(site, {
      main: articleMain(data.page.title, raw(data.page.html), data.page.excerpt),
    });
  },
  archive: (site, data) => shell(site, { main: archiveMain(data.title, data.posts) }),
  notFound: (site) => shell(site, { main: notFoundMain() }),
};
