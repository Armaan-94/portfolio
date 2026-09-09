import type { Metadata, Viewport } from "next";
import { ThemeShell } from "@/themes/ThemeShell";
import { WeylandLayout } from "@/themes/weyland/Layout";

/**
 * Static route for the weyland theme.
 *
 * No fonts.ts: this theme is entirely JetBrains Mono, which the root layout
 * already loads, so it adds no font cost at all.
 */
export const viewport: Viewport = {
  themeColor: "#08110f",
  colorScheme: "dark",
};

export const metadata: Metadata = {
  robots: { index: false, follow: true },
  alternates: { canonical: "/" },
};

export default function WeylandPage() {
  return (
    <ThemeShell theme="weyland">
      <WeylandLayout />
    </ThemeShell>
  );
}
