/**
 * The themes a visitor can choose between.
 *
 * Each theme is a full remodel rather than a recolour, so each is its own
 * statically prerendered route, served static off the CDN.
 *
 * "/" is ALWAYS the default theme. An earlier build resolved "/" to whichever
 * theme a cookie remembered, which meant a return visit opened on whatever was
 * picked last rather than on the front door. Choosing a theme now simply
 * navigates to its route, so the address bar always says which one you are
 * looking at and "/" is never a surprise.
 *
 * Order here is the order in the switcher.
 *
 * Adding a theme means adding an entry here and an app/<id>/page.tsx. Nothing
 * else needs to know about it: the switcher and the cookie validator both
 * derive from this array.
 */
export type ThemeId = "default" | "manga" | "weyland" | "retro";

export type ThemeMeta = {
  id: ThemeId;
  /** Shown in the dial. */
  label: string;
  /** One line, shown under the label. */
  tagline: string;
  /** Route that renders this theme. */
  href: string;
  /** [ground, ink, accent] for the dial's mini preview. */
  swatch: readonly [string, string, string];
  /** Drives <meta name="color-scheme"> and the CSS override for form controls. */
  scheme: "dark" | "light";
  /** Browser chrome colour on mobile. */
  themeColor: string;
};

export const THEMES: readonly ThemeMeta[] = [
  {
    id: "default",
    label: "Default",
    tagline: "Dark, indigo, a liquid-glass orb",
    href: "/",
    swatch: ["#0d1117", "#e6edf3", "#818cf8"],
    scheme: "dark",
    themeColor: "#0d1117",
  },
  {
    id: "manga",
    label: "Manga",
    tagline: "Retro comic print, three inks on cream",
    href: "/manga",
    swatch: ["#f7ead9", "#d4472f", "#123528"],
    scheme: "light",
    themeColor: "#f7ead9",
  },
  {
    id: "weyland",
    label: "Weyland",
    tagline: "Instrument panel, mint on black",
    href: "/weyland",
    swatch: ["#08110f", "#d9f2e6", "#e8b04b"],
    scheme: "dark",
    themeColor: "#08110f",
  },
  {
    id: "retro",
    label: "Retro",
    tagline: "Cream and brick on charcoal",
    href: "/retro",
    swatch: ["#1a1a1a", "#dcc9a9", "#b83a2d"],
    scheme: "dark",
    themeColor: "#1a1a1a",
  },
] as const;

export const DEFAULT_THEME: ThemeId = "default";

const BY_ID = new Map(THEMES.map((t) => [t.id, t]));

/**
 * Narrows an untrusted string (a cookie value, a query param) to a theme that
 * actually exists. Deliberately checks THEMES rather than the ThemeId union,
 * so a value that names a theme which has not shipped is still rejected.
 */
export function isThemeId(value: unknown): value is ThemeId {
  return typeof value === "string" && BY_ID.has(value as ThemeId);
}

export function themeMeta(id: ThemeId): ThemeMeta {
  return BY_ID.get(id) ?? BY_ID.get(DEFAULT_THEME)!;
}

export const THEME_COOKIE = "theme";
