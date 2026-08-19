"use client";

import { useMemo, useRef, type ReactNode } from "react";
import { useFrame, useThree } from "@react-three/fiber";
import * as THREE from "three";
import { scrollState } from "../interaction";
import {
  AMBIENT_SCALE,
  TRAVEL_EASE_START,
  TRAVEL_OFFSET,
} from "../config";

const damp = THREE.MathUtils.damp;
const DEG2RAD = Math.PI / 180;

/**
 * Carries the orb out of the hero and into the margin as the page scrolls.
 *
 * A wrapper group rather than extra terms inside <Orb>'s render loop, for
 * three reasons:
 *
 * 1. Orb.tsx's existing position and scale lines stay literally untouched, so
 *    the hero exit is provably unregressed. At travel 0 this group is identity.
 * 2. <OrbitalParticles> has to travel with the orb. Its vertex shader composes
 *    through modelViewMatrix, so a parent transform carries the swarm; editing
 *    the orb mesh directly would leave the particles behind mid-screen.
 * 3. It must not rotate. Orb.tsx resolves the pointer direction into object
 *    space using the mesh's own quaternion, so translation and uniform scale
 *    are safe but a group rotation would silently corrupt the cursor swell.
 *
 * The destination is expressed as a fraction of the camera frustum at the
 * orb's depth rather than as a world offset, so the composition holds across
 * aspect ratios and while CameraRig is still dollying back.
 */
export function OrbTravel({
  reduced = false,
  enabled = false,
  children,
}: {
  reduced?: boolean;
  enabled?: boolean;
  children: ReactNode;
}) {
  const group = useRef<THREE.Group>(null);
  const camera = useThree((state) => state.camera);

  // Scratch, allocated once: the scene forbids per-frame allocation.
  const right = useMemo(() => new THREE.Vector3(), []);
  const up = useMemo(() => new THREE.Vector3(), []);
  const target = useMemo(() => new THREE.Vector3(), []);

  useFrame((_, delta) => {
    const g = group.current;
    if (!g) return;

    const t = enabled && !reduced ? scrollState.travel : 0;

    // Exact-identity fast path. At the top of the page this returns before
    // touching anything, so the hero frame is what it has always been.
    if (
      t <= 1e-4 &&
      g.position.lengthSq() < 1e-8 &&
      Math.abs(g.scale.x - 1) < 1e-4
    ) {
      return;
    }

    const cam = camera as THREE.PerspectiveCamera;
    if (!cam.isPerspectiveCamera) return;

    const dt = Math.max(Math.min(delta, 1 / 30), 1e-4);
    const eased = THREE.MathUtils.smootherstep(t, TRAVEL_EASE_START, 1);

    // Frustum half-extents at the orb's depth (the orb sits near z = 0).
    const dist = Math.max(cam.position.z, 1);
    const halfHeight = Math.tan((cam.fov * DEG2RAD) / 2) * dist;
    const halfWidth = halfHeight * cam.aspect;

    right.setFromMatrixColumn(cam.matrixWorld, 0);
    up.setFromMatrixColumn(cam.matrixWorld, 1);

    const offset = cam.aspect < 1 ? TRAVEL_OFFSET.portrait : TRAVEL_OFFSET.landscape;
    target
      .set(0, 0, 0)
      .addScaledVector(right, offset.x * halfWidth * eased)
      .addScaledVector(up, offset.y * halfHeight * eased);

    g.position.x = damp(g.position.x, target.x, 3, dt);
    g.position.y = damp(g.position.y, target.y, 3, dt);
    g.position.z = damp(g.position.z, target.z, 3, dt);
    g.scale.setScalar(
      damp(g.scale.x, 1 - eased * (1 - AMBIENT_SCALE), 3, dt)
    );
  });

  return <group ref={group}>{children}</group>;
}
