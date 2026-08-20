"use client";

import { useEffect, useRef } from "react";
import { useFrame } from "@react-three/fiber";
import * as THREE from "three";
import { scrollState } from "../interaction";
import { TRAVEL_SPAN } from "../config";

const damp = THREE.MathUtils.damp;

/**
 * Reads the native scroll position each frame and turns it into a damped
 * {@link scrollState}. Progress runs 0→1 across the first viewport (the hero);
 * damping gives the scene inertia so it glides rather than snaps. Velocity is
 * the smoothed rate of change, used to accelerate the particle field. Frozen
 * under reduced motion so the hero exit is a plain scroll.
 *
 * With `page` set (Phase 9) it additionally publishes `travel` and
 * `pageProgress`. `progress` and `velocity` keep their exact formulas and
 * damping constants either way, so the hero exit is unchanged.
 */
export function ScrollRig({
  reduced = false,
  page = false,
}: {
  reduced?: boolean;
  page?: boolean;
}) {
  const prev = useRef(0);
  const maxScroll = useRef(1);

  // scrollHeight forces a layout flush, so it is measured on change and never
  // read per frame. A ResizeObserver rather than just window.resize because
  // CodingActivity's data can change the document height after hydration.
  useEffect(() => {
    if (!page) return;
    const measure = () => {
      maxScroll.current = Math.max(
        document.documentElement.scrollHeight - window.innerHeight,
        1
      );
    };
    measure();
    const observer = new ResizeObserver(measure);
    observer.observe(document.body);
    window.addEventListener("resize", measure, { passive: true });
    return () => {
      observer.disconnect();
      window.removeEventListener("resize", measure);
    };
  }, [page]);

  useFrame((_, delta) => {
    if (reduced) {
      scrollState.progress = 0;
      scrollState.velocity = 0;
      scrollState.travel = 0;
      scrollState.travelRaw = 0;
      scrollState.pageProgress = 0;
      scrollState.pageRaw = 0;
      return;
    }
    // Floor dt so a zero-length frame can't produce a divide-by-zero (which
    // would poison velocity with NaN and hide every object that reads it).
    const dt = Math.max(Math.min(delta, 1 / 30), 1e-4);
    const vh = window.innerHeight || 1;
    const y = window.scrollY;
    const raw = Math.min(Math.max(y / vh, 0), 1);

    scrollState.progress = damp(scrollState.progress, raw, 5.5, dt);

    const instant = Math.abs(scrollState.progress - prev.current) / dt;
    prev.current = scrollState.progress;
    scrollState.velocity = damp(
      scrollState.velocity,
      Math.min(instant * 3, 1),
      6,
      dt
    );

    if (!page) return;

    // Softer damping than progress: the journey should glide, and it turns the
    // smooth-scroll anchor jumps into a sweep rather than a teleport.
    const rawTravel = Math.min(Math.max(y / (vh * TRAVEL_SPAN), 0), 1);
    scrollState.travelRaw = rawTravel;
    scrollState.travel = damp(scrollState.travel, rawTravel, 3.2, dt);

    const rawPage = Math.min(Math.max(y / maxScroll.current, 0), 1);
    scrollState.pageRaw = rawPage;
    scrollState.pageProgress = damp(scrollState.pageProgress, rawPage, 4, dt);
  });

  return null;
}
