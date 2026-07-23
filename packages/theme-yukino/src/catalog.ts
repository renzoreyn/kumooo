export type YukinoProduct = {
  id: string;
  slug: string;
  title: string;
  price: string;
  blurb: string;
  art: "a" | "b" | "c";
  /** Free Unsplash photo (Unsplash License). */
  image: string;
  imageAlt: string;
};

/** Unsplash License — free to use; credited in footer. */
export const YUKINO_CATALOG: YukinoProduct[] = [
  {
    id: "drift-parka",
    slug: "drift-parka",
    title: "Drift Parka",
    price: "$420",
    blurb: "Wind-cut shell for whiteout mornings.",
    art: "a",
    image:
      "https://images.unsplash.com/photo-1544923246-77307dd6547b?auto=format&fit=crop&w=1200&q=80",
    imageAlt: "Person in a long winter parka in snow",
  },
  {
    id: "rime-shell",
    slug: "rime-shell",
    title: "Rime Shell",
    price: "$280",
    blurb: "Hardface layer. Quiet hardware.",
    art: "b",
    image:
      "https://images.unsplash.com/photo-1483985988355-763728e1935b?auto=format&fit=crop&w=1200&q=80",
    imageAlt: "Coat detail on a winter street",
  },
  {
    id: "glacier-knit",
    slug: "glacier-knit",
    title: "Glacier Knit",
    price: "$160",
    blurb: "Merino weight for the descent.",
    art: "c",
    image:
      "https://images.unsplash.com/photo-1576566588028-4147f3842f27?auto=format&fit=crop&w=1200&q=80",
    imageAlt: "Folded knit sweater texture",
  },
];

export const YUKINO_HERO_IMAGE =
  "https://images.unsplash.com/photo-1491002052546-bf38f186af56?auto=format&fit=crop&w=2000&q=80";

export const YUKINO_STORY_IMAGE =
  "https://images.unsplash.com/photo-1457269449834-928af64c684d?auto=format&fit=crop&w=1600&q=80";

export const YUKINO_PRODUCT_SLUGS = new Set(YUKINO_CATALOG.map((p) => p.slug));

export function isYukinoProductSlug(slug: string): boolean {
  return YUKINO_PRODUCT_SLUGS.has(slug);
}

export function productBySlug(slug: string): YukinoProduct | undefined {
  return YUKINO_CATALOG.find((p) => p.slug === slug);
}
