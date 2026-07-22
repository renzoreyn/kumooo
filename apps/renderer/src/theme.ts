import { resolveThemeId } from "@kumooo/core";
import type { Theme } from "@kumooo/theme-kit";

const themes = new Map<string, Theme>();

export function registerTheme(theme: Theme): void {
  themes.set(theme.name, theme);
}

export function getTheme(name: string): Theme {
  const id = resolveThemeId(name);
  return themes.get(id) ?? themes.get("haru") ?? themes.get("default")!;
}
