import type { Theme } from "@kumooo/theme-kit";

const themes = new Map<string, Theme>();

export function registerTheme(theme: Theme): void {
  themes.set(theme.name, theme);
}

export function getTheme(name: string): Theme {
  return themes.get(name) ?? themes.get("default")!;
}
