"use client";

import { useEffect, useRef } from "react";
import { useFrame, useThree } from "@react-three/fiber";
import { degrade, perfState } from "../util/perf";

const SAMPLE_WINDOW = 1; // seconds per measurement
const WARMUP = 2.5; // seconds ignored after mount (shader compile, hydration)
const SETTLE = 1.5; // seconds ignored after a step, so a change is not measured as its own cause
const BAD_WINDOWS = 2; // consecutive slow windows before stepping down

/**
 * Watches the frame rate and ratchets quality down when the device cannot keep
 * up. Additive: at level 0 it changes nothing, and util/quality.ts still picks
 * the starting tier.
 *
 * It only ever steps *down*, never back up within a page session. That removes
 * oscillation as a failure mode entirely rather than trying to damp it: worst
 * case over a session is three downgrades, several seconds apart.
 */
export function PerfGovernor({
  maxDpr,
  enabled = true,
  threshold = 46,
}: {
  maxDpr: number;
  enabled?: boolean;
  threshold?: number;
}) {
  const setDpr = useThree((state) => state.setDpr);
  const gl = useThree((state) => state.gl);

  const elapsed = useRef(0);
  const frames = useRef(0);
  const bad = useRef(0);
  const cooldown = useRef(WARMUP);

  // A hidden tab produces meaningless samples; start over when it comes back.
  useEffect(() => {
    const onVisibility = () => {
      cooldown.current = WARMUP;
      elapsed.current = 0;
      frames.current = 0;
    };
    document.addEventListener("visibilitychange", onVisibility);
    return () => document.removeEventListener("visibilitychange", onVisibility);
  }, []);

  useFrame((_, delta) => {
    if (!enabled) return;

    // A long frame means a stall or a tab return, not a slow GPU.
    if (delta > 0.5) {
      cooldown.current = SETTLE;
      elapsed.current = 0;
      frames.current = 0;
      return;
    }
    if (cooldown.current > 0) {
      cooldown.current -= delta;
      return;
    }

    elapsed.current += delta;
    frames.current += 1;
    if (elapsed.current < SAMPLE_WINDOW) return;

    const fps = frames.current / elapsed.current;
    elapsed.current = 0;
    frames.current = 0;

    // <AdaptiveDpr> restores toward the initial dpr after a transient dip,
    // which would quietly undo a step. Re-assert ours if it has drifted up.
    const target = maxDpr * perfState.dprScale;
    if (gl.getPixelRatio() > target + 0.01) setDpr(target);

    if (fps >= threshold) {
      bad.current = 0;
      return;
    }
    bad.current += 1;
    if (bad.current < BAD_WINDOWS) return;

    bad.current = 0;
    if (!degrade()) return;
    setDpr(maxDpr * perfState.dprScale);
    cooldown.current = SETTLE;
  });

  return null;
}
