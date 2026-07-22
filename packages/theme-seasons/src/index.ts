import { akiTheme } from "./aki.js";
import { fuyuTheme } from "./fuyu.js";
import { haruTheme } from "./haru.js";
import { natsuTheme } from "./natsu.js";

export { akiTheme, fuyuTheme, haruTheme, natsuTheme };

export const seasonThemes = [haruTheme, natsuTheme, akiTheme, fuyuTheme] as const;

export const SEASON_THEME_IDS = ["haru", "natsu", "aki", "fuyu"] as const;
