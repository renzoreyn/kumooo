export type TenantThemeInfo = {
  id: "haru" | "natsu" | "aki" | "fuyu";
  name: string;
  description: string;
};

export const TENANT_THEMES: TenantThemeInfo[] = [
  { id: "haru", name: "Haru", description: "Spring. Soft paper, calm reading, blossom accent." },
  { id: "natsu", name: "Natsu", description: "Summer. Coastal light, wider measure, high energy." },
  { id: "aki", name: "Aki", description: "Autumn. Warm cream, editorial serif, ochre accent." },
  { id: "fuyu", name: "Fuyu", description: "Winter. Cool ink, crisp type, quiet chrome." },
];

export const DEFAULT_TENANT_THEME = "haru" as const;
