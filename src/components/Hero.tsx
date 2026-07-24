"use client";

import { motion, useMotionValue, useSpring, useReducedMotion } from "motion/react";
import { profile } from "@/content";
import { ArrowRightIcon, MailIcon, MapPinIcon } from "./Icons";
import { OrbScene } from "@/three/OrbScene";
import { MagneticButton } from "./MagneticButton";

export function Hero() {
  const reduce = useReducedMotion();

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

      {/* legibility scrim: darkens the lower third where the identity sits */}
      <div
        aria-hidden
        className="pointer-events-none absolute inset-x-0 bottom-0 z-[1] h-1/2"
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

      {/* bottom hairline */}
      <div className="relative z-10 mx-auto w-full max-w-[var(--container-page)] px-6 sm:px-8">
        <div className="divider-node" />
      </div>
    </section>
  );
}
