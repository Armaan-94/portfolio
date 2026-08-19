"use client";

import { useEffect, useRef } from "react";
import { useFrame, useThree } from "@react-three/fiber";
import * as THREE from "three";
import {
  loadMomentState,
  loadMomentAlreadyPlayed,
  markLoadMomentPlayed,
} from "../loadMoment";

const DEG2RAD = Math.PI / 180;

const ASSEMBLE = 0.85; // seconds converging
const HOLD = 0.55; // seconds held as the wordmark
const RELEASE = 0.8; // seconds scattering back out
const TOTAL = ASSEMBLE + HOLD + RELEASE;

const SKIP_RELEASE = 0.35; // seconds to bail out over when skipped

/**
 * The one-shot intro: the starfield converges into the wordmark, holds, then
 * scatters back to its shell.
 *
 * Runs once per browser session, never under reduced motion, and never on the
 * low quality tier. Any deliberate input (pointer, key, wheel, scroll) skips
 * it, because a flourish that blocks someone who came to read is a cost, not a
 * feature. The DOM <h1> is untouched throughout and fades in on its own
 * schedule, so the readable content is never gated on this.
 *
 * The wordmark is positioned by measuring the real <h1> and projecting its box
 * to the orb's depth, so the particles land exactly on the name rather than on
 * a hardcoded guess that would drift with viewport size.
 */
export function LoadMoment({ enabled = false }: { enabled?: boolean }) {
  const camera = useThree((state) => state.camera);
  const elapsed = useRef(0);
  const done = useRef(!enabled);
  const skipped = useRef(false);

  useEffect(() => {
    if (!enabled) return;
    if (loadMomentAlreadyPlayed()) {
      done.current = true;
      return;
    }
    // The <h1> is measured lazily in the frame loop, so nothing to set up here
    // beyond the skip listeners and the session flag.
    markLoadMomentPlayed();

    const skip = () => {
      skipped.current = true;
    };
    const options = { passive: true, once: true } as const;
    window.addEventListener("pointerdown", skip, options);
    window.addEventListener("keydown", skip, options);
    window.addEventListener("wheel", skip, options);
    window.addEventListener("scroll", skip, options);
    return () => {
      window.removeEventListener("pointerdown", skip);
      window.removeEventListener("keydown", skip);
      window.removeEventListener("wheel", skip);
      window.removeEventListener("scroll", skip);
    };
  }, [enabled]);

  useFrame((_, delta) => {
    if (done.current) return;

    const heading = document.querySelector("h1");
    const cam = camera as THREE.PerspectiveCamera;
    if (!heading || !cam.isPerspectiveCamera) {
      done.current = true;
      loadMomentState.assemble = 0;
      loadMomentState.running = false;
      return;
    }

    // Project the heading's box onto the plane through the origin, which is
    // where the orb and the assembled wordmark live.
    const dist = Math.max(cam.position.z, 1);
    const halfHeight = Math.tan((cam.fov * DEG2RAD) / 2) * dist;
    const halfWidth = halfHeight * cam.aspect;

    const rect = heading.getBoundingClientRect();
    const ndcX = ((rect.left + rect.width / 2) / window.innerWidth) * 2 - 1;
    const ndcY = -((rect.top + rect.height / 2) / window.innerHeight) * 2 + 1;

    loadMomentState.center.set(ndcX * halfWidth, ndcY * halfHeight, 0);
    const worldWidth = (rect.width / window.innerWidth) * 2 * halfWidth;
    loadMomentState.scale.set(worldWidth, worldWidth);
    loadMomentState.running = true;

    elapsed.current += Math.min(delta, 1 / 30);
    const t = elapsed.current;

    let assemble: number;
    if (skipped.current) {
      // Fall straight back to the shell from wherever we were.
      assemble = Math.max(
        0,
        loadMomentState.assemble - delta / SKIP_RELEASE
      );
    } else if (t < ASSEMBLE) {
      assemble = THREE.MathUtils.smootherstep(t / ASSEMBLE, 0, 1);
    } else if (t < ASSEMBLE + HOLD) {
      assemble = 1;
    } else {
      const out = (t - ASSEMBLE - HOLD) / RELEASE;
      assemble = 1 - THREE.MathUtils.smootherstep(out, 0, 1);
    }

    loadMomentState.assemble = assemble;

    if ((skipped.current && assemble <= 0) || t >= TOTAL) {
      loadMomentState.assemble = 0;
      loadMomentState.running = false;
      done.current = true;
    }
  });

  return null;
}
