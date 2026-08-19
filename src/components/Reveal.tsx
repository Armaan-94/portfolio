"use client";

import { createElement } from "react";
import { motion, useReducedMotion } from "motion/react";
import type { ElementType, ReactNode } from "react";

type RevealTag = "div" | "li" | "section" | "article" | "span";
type RevealVariant = "fade" | "wipe";

type RevealProps = {
  children: ReactNode;
  /** stagger delay in seconds */
  delay?: number;
  /** vertical travel in px */
  y?: number;
  /** entry blur in px, resolved to 0. Left at 0 the reveal stays crisp. */
  blur?: number;
  /** entry scale, resolved to 1. Left at 1 no scale is animated at all. */
  scale?: number;
  /** "wipe" adds a clip-path inset on top of the fade, for headings. */
  variant?: RevealVariant;
  /** seconds */
  duration?: number;
  className?: string;
  as?: RevealTag;
};

/** Shared house easing. Also mirrored in globals.css as --ease-house. */
const EASE = [0.22, 1, 0.36, 1] as const;

/**
 * Subtle, quick scroll-into-view reveal (fade + translate up).
 * Fully disabled when the user prefers reduced motion.
 *
 * `blur`, `scale` and `variant` are opt-in: at their defaults this animates
 * exactly the two properties it always has, so existing call sites are
 * untouched. Each extra property is only emitted when actually in play, which
 * keeps motion from compositing layers nothing asked for.
 *
 * Uses createElement so the dynamic tag (`as`) does not collapse the JSX
 * children type to `never` under a union of element types.
 */
export function Reveal({
  children,
  delay = 0,
  y = 16,
  blur = 0,
  scale = 1,
  variant = "fade",
  duration = 0.5,
  className,
  as = "div",
}: RevealProps) {
  const reduce = useReducedMotion();

  if (reduce) {
    return createElement(as, { className }, children);
  }

  const MotionTag = motion[as] as ElementType;

  const initial: Record<string, unknown> = { opacity: 0, y };
  const inView: Record<string, unknown> = { opacity: 1, y: 0 };

  if (blur > 0) {
    initial.filter = `blur(${blur}px)`;
    inView.filter = "blur(0px)";
  }
  if (scale !== 1) {
    initial.scale = scale;
    inView.scale = 1;
  }
  if (variant === "wipe") {
    initial.clipPath = "inset(0 0 100% 0)";
    inView.clipPath = "inset(0 0 0% 0)";
  }

  return createElement(
    MotionTag,
    {
      className,
      initial,
      whileInView: inView,
      viewport: { once: true, margin: "-80px" },
      transition: { duration, delay, ease: EASE },
    },
    children
  );
}
