import { Plus_Jakarta_Sans } from "next/font/google";

/**
 * Plus Jakarta Sans: geometric with slightly rounded terminals, genuinely warm
 * in a way Inter is not, and it has real tabular figures for the stats.
 * Rejected alternatives: Nunito turns childish at display sizes, Poppins has a
 * single-storey 'a' that reads poorly at 14px, Outfit is weak as body copy.
 *
 * JetBrains Mono is not re-declared here. It is already loaded by the root
 * layout, and the keycaps want exactly its slab-ish shapes, so a third family
 * would be cost with no gain.
 *
 * preload:false because these are only used on /studio.
 */
export const jakarta = Plus_Jakarta_Sans({
  variable: "--font-jakarta",
  subsets: ["latin"],
  weight: ["400", "500", "700", "800"],
  display: "swap",
  preload: false,
});

export const studioFontVars = jakarta.variable;
