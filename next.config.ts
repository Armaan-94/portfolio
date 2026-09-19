import type { NextConfig } from "next";

/**
 * Deliberately close to empty.
 *
 * "/" used to carry a cookie-conditioned rewrite that resolved it to whichever
 * theme the visitor last chose. That is gone: the front door is always the
 * default theme, and a theme is something you navigate to. Removing it also
 * removes the one failure mode in the whole design that could have been
 * user-visible and wrong for everyone at once, a CDN caching "/" without
 * varying on the theme cookie.
 */
const nextConfig: NextConfig = {};

export default nextConfig;
