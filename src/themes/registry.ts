/**
 * The themes a visitor can choose between.
 *
 * Each theme is a full remodel rather than a recolour, so each is its own
 * statically prerendered route. The cookie-conditioned rewrite in
 * next.config.ts resolves "/" to the remembered one, which keeps the URL clean
 * without giving up the CDN-served static page.
 *
 * Adding a theme means adding an entry here and an app/<id>/page.tsx. Nothing
 * else needs to know about it: the dial, the cookie validator and the rewrite
 * list all derive from this array.
 */
export type ThemeId = "default" | "weyland" | "studio" | "retro";

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
    id: "studio",
    label: "Studio",
    tagline: "Warm paper, pastel cards",
    href: "/studio",
    swatch: ["#fdf9f3", "#2c3145", "#d6efe0"],
    scheme: "light",
    themeColor: "#fdf9f3",
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
 * actually exists. Deliberately checks THEMES rather than the ThemeId union:
 * the union names themes that are planned, and rewriting "/" to a route that
 * has not shipped yet would 404.
 */
export function isThemeId(value: unknown): value is ThemeId {
  return typeof value === "string" && BY_ID.has(value as ThemeId);
}

export function themeMeta(id: ThemeId): ThemeMeta {
  return BY_ID.get(id) ?? BY_ID.get(DEFAULT_THEME)!;
}

/** Theme ids that need a cookie rewrite, i.e. everything but the default. */
export const REWRITABLE_THEMES = THEMES.filter((t) => t.id !== DEFAULT_THEME).map(
  (t) => t.id
);

export const THEME_COOKIE = "theme";
