import { Nav } from "@/components/Nav";
import { Hero } from "@/components/Hero";
import { About } from "@/components/About";
import { Experience } from "@/components/Experience";
import { Projects } from "@/components/Projects";
import { Skills } from "@/components/Skills";
import { CodingActivity } from "@/components/CodingActivity";
import { Contact } from "@/components/Contact";
import { Footer } from "@/components/Footer";
import { ThemeShell } from "@/themes/ThemeShell";

/**
 * The default theme.
 *
 * Everything in src/components IS this theme; the other themes live in
 * src/themes/<id> and render the same content from src/content.ts in their own
 * way. ThemeShell renders no wrapper element for "default" on purpose, so this
 * tree's DOM is exactly what it was before themes existed. See ThemeShell.
 */
export default function Home() {
  return (
    <ThemeShell theme="default">
      <Nav />
      <main id="content">
        <Hero />
        <About />
        <div className="mx-auto max-w-[var(--container-page)] px-6 sm:px-8">
          <div className="divider-node scroll-rise" />
        </div>
        <Experience />
        <Projects />
        <Skills />
        <CodingActivity />
        <Contact />
      </main>
      <Footer />
    </ThemeShell>
  );
}
