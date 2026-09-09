import type { NextConfig } from "next";
import { REWRITABLE_THEMES, THEME_COOKIE } from "./src/themes/registry";

const nextConfig: NextConfig = {
  /**
   * Serve the visitor's remembered theme from "/".
   *
   * Each theme is its own statically prerendered route, and this resolves "/"
   * to whichever one the cookie names, at the routing layer, before any
   * function runs. That keeps the URL clean without giving up the static page:
   * reading the cookie inside page.tsx instead would opt "/" out of
   * prerendering and turn a CDN file into a per-request invocation for every
   * visitor, including the first-time ones who always get the default anyway.
   *
   * The theme routes stay reachable directly, which is what makes the dial's
   * anchors work for middle-click and for visitors without JavaScript.
   */
  async rewrites() {
    return {
      beforeFiles: REWRITABLE_THEMES.map((theme) => ({
        source: "/",
        has: [{ type: "cookie" as const, key: THEME_COOKIE, value: theme }],
        destination: `/${theme}`,
      })),
      afterFiles: [],
      fallback: [],
    };
  },
};

export default nextConfig;
