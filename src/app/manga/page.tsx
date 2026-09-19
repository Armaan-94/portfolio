import type { Metadata, Viewport } from "next";
import { ThemeShell } from "@/themes/ThemeShell";
import { MangaLayout } from "@/themes/manga/Layout";
import { mangaFontVars } from "@/themes/manga/fonts";

/**
 * Static route for the manga theme. A light theme, so colorScheme is set
 * here and reinforced by the html:has() rule in themes.css: the CSS property
 * beats this tag, and globals.css sets dark on :root.
 */
export const viewport: Viewport = {
  themeColor: "#f7ead9",
  colorScheme: "light",
};

export const metadata: Metadata = {
  robots: { index: false, follow: true },
  alternates: { canonical: "/" },
};

export default function MangaPage() {
  return (
    <ThemeShell theme="manga" fontVars={mangaFontVars}>
      <MangaLayout />
    </ThemeShell>
  );
}
