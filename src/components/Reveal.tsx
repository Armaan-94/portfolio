"use client";

import { createElement } from "react";
import { motion, useReducedMotion } from "motion/react";
import type { ElementType, ReactNode } from "react";

type RevealTag = "div" | "li" | "section" | "article" | "span";

type RevealProps = {
  children: ReactNode;
  /** stagger delay in seconds */
  delay?: number;
  /** vertical travel in px */
  y?: number;
  className?: string;
  as?: RevealTag;
};

/**
 * Subtle, quick scroll-into-view reveal (fade + translate up).
 * Fully disabled when the user prefers reduced motion.
 *
 * Uses createElement so the dynamic tag (`as`) does not collapse the JSX
 * children type to `never` under a union of element types.
 */
export function Reveal({
  children,
  delay = 0,
  y = 16,
  className,
  as = "div",
}: RevealProps) {
  const reduce = useReducedMotion();

  if (reduce) {
    return createElement(as, { className }, children);
  }

  const MotionTag = motion[as] as ElementType;

  return createElement(
    MotionTag,
    {
      className,
      initial: { opacity: 0, y },
      whileInView: { opacity: 1, y: 0 },
      viewport: { once: true, margin: "-80px" },
      transition: { duration: 0.5, delay, ease: [0.22, 1, 0.36, 1] },
    },
    children
  );
}
