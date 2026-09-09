import { Zen_Kaku_Gothic_New, Zen_Old_Mincho } from "next/font/google";

/**
 * Both faces are by Japanese foundries, which is the point.
 *
 * The brief was English text that still feels like an old manga print, and the
 * honest way to get that is to set Latin in type that was drawn in Japan rather
 * than to reach for a novelty "comic" font. Zen Kaku Gothic New is a modern
 * gothic whose Latin is properly drawn rather than an afterthought, and Zen Old
 * Mincho is a traditional mincho that carries the vintage-print register for
 * labels and stamps.
 *
 * Only the latin subset is requested, so none of the CJK weight is downloaded.
 * preload:false because these are used on /manga alone.
 */
export const zenKaku = Zen_Kaku_Gothic_New({
  variable: "--font-zen-kaku",
  subsets: ["latin"],
  weight: ["400", "500", "700", "900"],
  display: "swap",
  preload: false,
});

export const zenMincho = Zen_Old_Mincho({
  variable: "--font-zen-mincho",
  subsets: ["latin"],
  weight: ["400", "700", "900"],
  display: "swap",
  preload: false,
});

export const mangaFontVars = `${zenKaku.variable} ${zenMincho.variable}`;
