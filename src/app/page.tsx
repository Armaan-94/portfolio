import { Nav } from "@/components/Nav";
import { Hero } from "@/components/Hero";
import { About } from "@/components/About";
import { Experience } from "@/components/Experience";
import { Projects } from "@/components/Projects";
import { Skills } from "@/components/Skills";
import { CodingActivity } from "@/components/CodingActivity";
import { Contact } from "@/components/Contact";
import { Footer } from "@/components/Footer";

export default function Home() {
  return (
    <>
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
    </>
  );
}
