import type { Metadata, Viewport } from "next";
import { ThemeShell } from "@/themes/ThemeShell";
import { RetroLayout } from "@/themes/retro/Layout";
import { retroFontVars } from "@/themes/retro/fonts";

/**
 * Static route for the retro theme. The cookie rewrite in next.config.ts
 * resolves "/" here for visitors who picked it, so this URL is an
 * implementation detail rather than the canonical address of the content.
 */
export const viewport: Viewport = {
  themeColor: "#1a1a1a",
  colorScheme: "dark",
};

export const metadata: Metadata = {
  // Same content as "/", so it must not compete with it in search.
  robots: { index: false, follow: true },
  alternates: { canonical: "/" },
};

export default function RetroPage() {
  return (
    <ThemeShell theme="retro" fontVars={retroFontVars}>
      <RetroLayout />
    </ThemeShell>
  );
}
