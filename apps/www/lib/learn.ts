export type LearnMeta = {
  slug: string;
  title: string;
  outcome: string;
  minutes: number;
  order: number;
};

export const LEARN_PATH: LearnMeta[] = [
  {
    slug: "what-is-a-website",
    title: "What a website actually is",
    outcome: "Pages, URLs, and what “deploy” means in plain language.",
    minutes: 10,
    order: 1,
  },
  {
    slug: "setup-your-computer",
    title: "Set up your computer",
    outcome: "Install Node, a package manager, and a code editor.",
    minutes: 15,
    order: 2,
  },
  {
    slug: "first-site",
    title: "Your first kumooo.js site",
    outcome: "Run create-kumooo and open a local preview.",
    minutes: 15,
    order: 3,
  },
  {
    slug: "edit-and-deploy",
    title: "Edit text and deploy",
    outcome: "Change a page, push to GitHub, publish on Vercel.",
    minutes: 20,
    order: 4,
  },
];

export function getLearn(slug: string): LearnMeta | undefined {
  return LEARN_PATH.find((item) => item.slug === slug);
}
