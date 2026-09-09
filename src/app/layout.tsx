import type { Metadata, Viewport } from "next";
import { Sora, JetBrains_Mono } from "next/font/google";
import "./globals.css";
import { profile } from "@/content";

const sora = Sora({
  variable: "--font-sora",
  subsets: ["latin"],
  display: "swap",
  weight: ["400", "500", "600", "700", "800"],
});

const jetbrainsMono = JetBrains_Mono({
  variable: "--font-jetbrains",
  subsets: ["latin"],
  display: "swap",
  weight: ["400", "500", "600"],
});

/**
 * The canonical origin for metadataBase, og:url and og:image.
 *
 * This was hard-coded to a hostname that returns 404, so every social preview
 * pointed at a dead image and the canonical tags on the theme routes resolved
 * to nothing. Vercel sets VERCEL_PROJECT_PRODUCTION_URL to the project's
 * production domain, and to a custom domain once one is attached, so reading
 * it means this cannot drift again. The literal is only the local fallback.
 */
const siteUrl = process.env.VERCEL_PROJECT_PRODUCTION_URL
  ? `https://${process.env.VERCEL_PROJECT_PRODUCTION_URL}`
  : "http://localhost:3000";
const description =
  "Armaan Punia is a software engineer building distributed backend systems, applied AI, and cloud infrastructure that ships to production.";

export const metadata: Metadata = {
  metadataBase: new URL(siteUrl),
  title: {
    default: `${profile.name} · ${profile.title}`,
    template: `%s · ${profile.name}`,
  },
  description,
  keywords: [
    "Armaan Punia",
    "Software Engineer",
    "Backend Engineer",
    "Spring Cloud",
    "Microservices",
    "AI Engineering",
    "RAG",
    "Next.js",
  ],
  authors: [{ name: profile.name, url: profile.links.github }],
  creator: profile.name,
  openGraph: {
    type: "website",
    url: siteUrl,
    title: `${profile.name} · ${profile.title}`,
    description,
    siteName: `${profile.name} · Portfolio`,
  },
  twitter: {
    card: "summary_large_image",
    title: `${profile.name} · ${profile.title}`,
    description,
  },
  robots: { index: true, follow: true },
};

export const viewport: Viewport = {
  themeColor: "#0d1117",
  colorScheme: "dark",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html
      lang="en"
      className={`${sora.variable} ${jetbrainsMono.variable} antialiased`}
      // The pre-paint script below stamps data-theme-entering on this element
      // before React hydrates, so the client html tag carries an attribute the
      // server never rendered and React reports a mismatch. Suppression is the
      // documented fix for exactly this case and is scoped to this element
      // alone, not its subtree, so a genuine mismatch anywhere inside the page
      // is still reported.
      suppressHydrationWarning
    >
      <body>
        {/* Runs before the body paints. The previous page set this flag on its
            way out, so an arriving theme fades up instead of snapping in. The
            reduced-motion rule in globals.css collapses the fade to nothing
            for free, since it clamps every animation duration. */}
        <script
          dangerouslySetInnerHTML={{
            __html:
              'try{if(sessionStorage.getItem("theme:entering")){sessionStorage.removeItem("theme:entering");document.documentElement.dataset.themeEntering="1"}}catch(e){}',
          }}
        />
        <a
          href="#content"
          className="sr-only focus:not-sr-only focus:fixed focus:top-4 focus:left-4 focus:z-[100] focus:rounded-md focus:bg-indigo focus:px-4 focus:py-2 focus:text-sm focus:font-semibold focus:text-canvas"
        >
          Skip to content
        </a>
        {children}
      </body>
    </html>
  );
}
