"use client";

import { useEffect, useRef } from "react";
import { motion, useMotionValue, useSpring, useReducedMotion } from "motion/react";
import { profile } from "@/content";
import { ArrowRightIcon, MailIcon, MapPinIcon } from "./Icons";
import { OrbScene } from "@/three/OrbScene";
import { MagneticButton } from "./MagneticButton";

// Mirrors the `animation-range: 0 3vh` in the globals.css scrim-out rule.
const SCRIM_FADE_VH = 0.03;

// Numeric cubic-bezier evaluator (Newton-Raphson on the bezier's own X, same
// technique the CSS engine uses), so the JS fallback path eases identically
// to var(--ease-house) on the CSS path rather than merely approximating it.
function cubicBezier(p1x: number, p1y: number, p2x: number, p2y: number) {
  const cx = 3 * p1x;
  const bx = 3 * (p2x - p1x) - cx;
  const ax = 1 - cx - bx;
  const cy = 3 * p1y;
  const by = 3 * (p2y - p1y) - cy;
  const ay = 1 - cy - by;
  const sampleX = (t: number) => ((ax * t + bx) * t + cx) * t;
  const sampleY = (t: number) => ((ay * t + by) * t + cy) * t;
  const sampleDerivX = (t: number) => (3 * ax * t + 2 * bx) * t + cx;
  return (x: number) => {
    if (x <= 0) return 0;
    if (x >= 1) return 1;
    let t = x;
    for (let i = 0; i < 8; i++) {
      const dx = sampleX(t) - x;
      const d = sampleDerivX(t);
      if (Math.abs(dx) < 1e-4 || d === 0) break;
      t -= dx / d;
    }
    return sampleY(t);
  };
}
// Matches --ease-house: cubic-bezier(0.22, 1, 0.36, 1) in globals.css.
const easeHouse = cubicBezier(0.22, 1, 0.36, 1);

export function Hero() {
  const reduce = useReducedMotion();
  const scrimRef = useRef<HTMLDivElement>(null);
  const edgeRef = useRef<HTMLDivElement>(null);

  // Fallback for browsers without scroll-driven animations (e.g. Firefox,
  // which does not implement `animation-timeline: scroll()`): without it the
  // scrim and hairline never fade, and the seam they exist to hide reappears
  // every time the orb travels past the hero on scroll. Inert whenever the
  // native CSS animation already handles it, so this never double-drives
  // opacity in browsers that support it.
  useEffect(() => {
    if (reduce) return;
    if (
      typeof CSS !== "undefined" &&
      CSS.supports("animation-timeline", "scroll()")
    ) {
      return;
    }

    let raf = 0;
    const apply = () => {
      raf = 0;
      const traveling = document.documentElement.dataset.orbTraveling === "1";
      if (!traveling) {
        if (scrimRef.current) scrimRef.current.style.opacity = "";
        if (edgeRef.current) edgeRef.current.style.opacity = "";
        return;
      }
      const raw = Math.min(
        1,
        Math.max(0, window.scrollY / (window.innerHeight * SCRIM_FADE_VH))
      );
      const opacity = String(1 - easeHouse(raw));
      if (scrimRef.current) scrimRef.current.style.opacity = opacity;
      if (edgeRef.current) edgeRef.current.style.opacity = opacity;
    };
    const onScroll = () => {
      if (!raf) raf = requestAnimationFrame(apply);
    };

    apply();
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => {
      window.removeEventListener("scroll", onScroll);
      if (raf) cancelAnimationFrame(raf);
    };
  }, [reduce]);

  // Cursor parallax: the whole hero content block drifts a few pixels against
  // the pointer, so it floats in depth over the orb. Spring-damped; disabled
  // under reduced motion.
  const px = useMotionValue(0);
  const py = useMotionValue(0);
  const spring = { stiffness: 180, damping: 22, mass: 0.5 } as const;
  const sx = useSpring(px, spring);
  const sy = useSpring(py, spring);

  function handleParallax(e: React.PointerEvent<HTMLElement>) {
    if (reduce) return;
    const nx = (e.clientX / window.innerWidth - 0.5) * 2;
    const ny = (e.clientY / window.innerHeight - 0.5) * 2;
    px.set(-nx * 7);
    py.set(-ny * 7);
  }
  function resetParallax() {
    px.set(0);
    py.set(0);
  }

  const container = {
    hidden: {},
    show: {
      transition: { staggerChildren: reduce ? 0 : 0.06, delayChildren: 0.06 },
    },
  };
  const item = reduce
    ? { hidden: { opacity: 1 }, show: { opacity: 1 } }
    : {
        hidden: { opacity: 0, y: 16 },
        show: {
          opacity: 1,
          y: 0,
          transition: { duration: 0.5, ease: [0.22, 1, 0.36, 1] as const },
        },
      };

  return (
    <section
      id="hero"
      onPointerMove={handleParallax}
      onPointerLeave={resetParallax}
      className="hero-glow relative isolate flex min-h-[100svh] flex-col overflow-hidden"
    >
      {/* faint grid, furthest back */}
      <div className="bg-grid absolute inset-0 -z-10 [mask-image:radial-gradient(ellipse_65%_55%_at_50%_35%,black,transparent)]" />

      {/* the living orb, behind the content */}
      <OrbScene />

      {/* legibility scrim: darkens the lower third where the identity sits.
          Its bottom edge is the hero's bottom edge, so once the canvas persists
          past the hero it draws a hard seam across the orb there. The
          .hero-scrim rule fades it out on scroll, when its job is done. */}
      <div
        ref={scrimRef}
        aria-hidden
        className="hero-scrim pointer-events-none absolute inset-x-0 bottom-0 z-[1] h-1/2"
        style={{
          background:
            "linear-gradient(to top, var(--color-base) 8%, color-mix(in srgb, var(--color-base) 55%, transparent) 45%, transparent 100%)",
        }}
      />

      {/* content: click-through everywhere except the interactive controls */}
      <div className="pointer-events-none relative z-10 mx-auto flex w-full max-w-[var(--container-page)] flex-1 flex-col items-center justify-end px-6 pb-20 pt-28 text-center sm:px-8 sm:pb-28">
        <motion.div
          variants={container}
          initial="hidden"
          animate="show"
          style={reduce ? undefined : { x: sx, y: sy }}
          className="flex flex-col items-center"
        >
          <motion.div
            variants={item}
            className="flex flex-wrap items-center justify-center gap-3"
          >
            <span className="font-mono text-xs tracking-[0.25em] text-cyan uppercase">
              {profile.eyebrow}
            </span>
            <span className="glass-premium inline-flex items-center gap-1.5 rounded-full px-2.5 py-0.5 font-mono text-[11px] text-muted">
              <MapPinIcon width={12} height={12} />
              {profile.location}
            </span>
          </motion.div>

          <motion.h1
            variants={item}
            className="text-gradient mt-5 text-6xl font-extrabold leading-[1.02] tracking-tight sm:text-7xl md:text-8xl"
          >
            {profile.name}
          </motion.h1>

          <motion.p
            variants={item}
            className="mt-6 max-w-2xl text-balance text-lg leading-relaxed text-body sm:text-xl"
          >
            {profile.headline}{" "}
            <span className="text-ink">{profile.headlineAccent}.</span>
          </motion.p>

          <motion.div
            variants={item}
            className="pointer-events-auto mt-9 mb-2 flex flex-col gap-3 sm:flex-row sm:items-center"
          >
            <MagneticButton
              href="#projects"
              className="btn-magnetic sheen group inline-flex items-center justify-center gap-2 rounded-lg bg-indigo px-5 py-3 text-sm font-semibold text-base transition-colors hover:bg-violet"
            >
              <span className="relative z-[1] inline-flex items-center gap-2">
                View work
                <ArrowRightIcon
                  width={18}
                  height={18}
                  className="transition-transform group-hover:translate-x-0.5"
                />
              </span>
            </MagneticButton>
            <MagneticButton
              href="#contact"
              strength={0.24}
              className="btn-magnetic glass-premium group inline-flex items-center justify-center gap-2 rounded-lg px-5 py-3 text-sm font-semibold text-body transition-colors hover:text-ink"
            >
              <span className="relative z-[1] inline-flex items-center gap-2">
                <MailIcon width={18} height={18} />
                Get in touch
              </span>
            </MagneticButton>
          </motion.div>
        </motion.div>
      </div>

      {/* Bottom hairline. It marked the hero's edge back when the canvas ended
          there too; with the orb persisting past it, the hairline and its
          glowing node cut a visible line straight across the orb. Faded on
          scroll by the same rule as the scrim, so the hero at rest is
          unchanged. */}
      <div
        ref={edgeRef}
        className="hero-edge relative z-10 mx-auto w-full max-w-[var(--container-page)] px-6 sm:px-8"
      >
        <div className="divider-node" />
      </div>
    </section>
  );
}
