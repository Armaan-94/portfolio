import { Anton, Bitter } from "next/font/google";

/**
 * Anton is the condensed American-poster grotesque; Bitter is a low-contrast
 * slab drawn for screens, which is what a 70s print body face has to be here.
 * Two families, and JetBrains Mono is deliberately absent: captions are Bitter
 * 500 in small caps, because print does not set metadata in a monospace.
 *
 * preload:false because these are only ever used on /retro. Preloading them
 * from the root layout would make every visitor to / pay for fonts they will
 * never render.
 */
export const anton = Anton({
  variable: "--font-anton",
  subsets: ["latin"],
  weight: "400",
  display: "swap",
  preload: false,
});

export const bitter = Bitter({
  variable: "--font-bitter",
  subsets: ["latin"],
  weight: ["400", "500", "700"],
  display: "swap",
  preload: false,
});

export const retroFontVars = `${anton.variable} ${bitter.variable}`;
