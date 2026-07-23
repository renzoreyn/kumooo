export type Post = {
  slug: string;
  title: string;
  excerpt: string;
  date: string;
  body: string;
};

export const posts: Post[] = [
  {
    slug: "hello-kumooo",
    title: "Hello from kumooo.js",
    excerpt: "A framework-first starter for sites that should not need babysitting.",
    date: "2026-07-23",
    body: "kumooo.js sits on Next.js. You get App Router, @kumooo/ui, and starters for blank, blog, and shop. Hosted multi-tenant comes later. Open source first.",
  },
  {
    slug: "why-not-wordpress",
    title: "Why not WordPress",
    excerpt: "PHP plugins and 3 a.m. pages are optional. This stack is not.",
    date: "2026-07-22",
    body: "Versatility without the CMS tax. Ship a blog today, a storefront tomorrow, a blank app when you need total control.",
  },
];

export function getPost(slug: string) {
  return posts.find((p) => p.slug === slug);
}
