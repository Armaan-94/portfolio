import type { Metadata, Viewport } from "next";
import { ThemeShell } from "@/themes/ThemeShell";
import { StudioLayout } from "@/themes/studio/Layout";
import { studioFontVars } from "@/themes/studio/fonts";

/**
 * Static route for the studio theme. The only light theme, hence colorScheme
 * light here AND the html:has() override in themes.css: the CSS property beats
 * this meta tag, and globals.css sets color-scheme:dark on :root.
 */
export const viewport: Viewport = {
  themeColor: "#fdf9f3",
  colorScheme: "light",
};

export const metadata: Metadata = {
  robots: { index: false, follow: true },
  alternates: { canonical: "/" },
};

export default function StudioPage() {
  return (
    <ThemeShell theme="studio" fontVars={studioFontVars}>
      <StudioLayout />
    </ThemeShell>
  );
}
