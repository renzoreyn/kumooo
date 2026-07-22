export type ThemeFiles = {
  "theme.json": string;
  "styles.css": string;
  "templates/home.html": string;
  "templates/post.html": string;
  "templates/page.html": string;
  "templates/archive.html": string;
  "templates/notFound.html": string;
  "client.js"?: string;
};

export type ThemeFilePath = keyof ThemeFiles;
