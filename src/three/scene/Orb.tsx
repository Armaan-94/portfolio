"use client";

import { useMemo, useRef } from "react";
import { useFrame, useThree } from "@react-three/fiber";
import * as THREE from "three";
import {
  createOrbMaterial,
  createOrbUniforms,
} from "../materials/OrbMaterial";
import { pointerState, scrollState, sectionState } from "../interaction";
import { swatchFor } from "../palettes";
import { TRAVEL_INERT_AT } from "../config";

const damp = THREE.MathUtils.damp;

type OrbProps = {
  /** world radius of the orb */
  radius?: number;
  /** icosahedron subdivision detail (vertex density) */
  detail?: number;
  /** honor prefers-reduced-motion: freeze morph, rotation, and reactions */
  reduced?: boolean;
  /** page-wide mode: drift the palette per section and go inert off the hero */
  traveling?: boolean;
};

/**
 * The centrepiece: a living, holographic energy core driven entirely by GLSL.
 * The React layer only feeds it time, pointer, and click state; all deformation
 * and shading happen on the GPU.
 */
export function Orb({
  radius = 1.5,
  detail = 42,
  reduced = false,
  traveling = false,
}: OrbProps) {
  const meshRef = useRef<THREE.Mesh>(null);
  const { camera } = useThree();

  const uniforms = useMemo(() => createOrbUniforms(), []);
  const material = useMemo(() => createOrbMaterial(uniforms), [uniforms]);
  const geometry = useMemo(
    () => new THREE.IcosahedronGeometry(radius, detail),
    [radius, detail]
  );

  // Interaction state kept in refs so it never triggers React re-renders.
  const hovered = useRef(false);
  const pulse = useRef(0);

  // Scratch objects reused every frame (no per-frame allocation).
  const worldTarget = useMemo(() => new THREE.Vector3(), []);
  const camRight = useMemo(() => new THREE.Vector3(), []);
  const camUp = useMemo(() => new THREE.Vector3(), []);
  const frontDir = useMemo(() => new THREE.Vector3(), []);
  const invQuat = useMemo(() => new THREE.Quaternion(), []);
  const worldPos = useMemo(() => new THREE.Vector3(), []);

  useFrame((state, delta) => {
    const mesh = meshRef.current;
    if (!mesh) return;

    // Clamp delta so a stalled tab doesn't fling the animation forward.
    const dt = Math.min(delta, 1 / 30);

    if (reduced) {
      // Reduced motion: a calm, near-static core. Advance time barely.
      uniforms.uTime.value += dt * 0.05;
      uniforms.uPointerStrength.value = 0;
      uniforms.uPointerVel.value = 0;
      uniforms.uPulse.value = 0;
      return;
    }

    uniforms.uTime.value += dt;

    // Cursor speed (tracked once, in <PointerTracker>) drives the wake ripple,
    // swell boost and cursor-glow so fast movement disturbs the liquid harder.
    uniforms.uPointerVel.value = pointerState.velocity;

    // Idle rotation + gentle float. Scroll velocity briefly spins it faster;
    // scroll progress sinks and shrinks it so it recedes out of frame.
    const sp = scrollState.progress;
    mesh.rotation.y += dt * (0.08 + scrollState.velocity * 0.5);
    mesh.rotation.x = Math.sin(state.clock.elapsedTime * 0.2) * 0.06;
    mesh.position.y = Math.sin(state.clock.elapsedTime * 0.5) * 0.05 - sp * 1.2;
    mesh.scale.setScalar(1 - sp * 0.12);

    // Pointer direction, resolved in object space so the swell tracks the
    // cursor on screen even as the mesh spins underneath.
    // World position, not local: once <OrbTravel> translates the parent group
    // the local position no longer describes where the orb actually is, and
    // the swell would aim off target. Identical while the parent is identity.
    frontDir.copy(camera.position).sub(mesh.getWorldPosition(worldPos)).normalize();
    camRight.setFromMatrixColumn(camera.matrixWorld, 0);
    camUp.setFromMatrixColumn(camera.matrixWorld, 1);
    worldTarget
      .copy(frontDir)
      .addScaledVector(camRight, state.pointer.x * 0.9)
      .addScaledVector(camUp, state.pointer.y * 0.9)
      .normalize();
    invQuat.copy(mesh.quaternion).invert();
    worldTarget.applyQuaternion(invQuat);
    uniforms.uPointer.value.copy(worldTarget);

    // Once the orb has left the hero it is decorative. R3F only raycasts on
    // pointer events, so if the orb slides out from under a stationary cursor
    // no pointerout ever fires: hover would stick, and with it the "pointer"
    // cursor, for the rest of the session. Release both explicitly.
    const inert = traveling && scrollState.travel > TRAVEL_INERT_AT;
    if (inert && hovered.current) {
      hovered.current = false;
      document.body.style.cursor = "";
    }

    // Hover swells the surface; a low baseline keeps the orb always reactive.
    const targetStrength = inert ? 0 : hovered.current ? 1.0 : 0.28;
    uniforms.uPointerStrength.value = damp(
      uniforms.uPointerStrength.value,
      targetStrength,
      8,
      dt
    );

    // Click pulse decays smoothly.
    pulse.current = damp(pulse.current, 0, 3.5, dt);
    uniforms.uPulse.value = pulse.current;

    // Publish hover + pulse so the orbital particles can react to the orb.
    pointerState.hoverOrb = hovered.current;
    pointerState.pulse = pulse.current;

    // Per-section palette drift. Uniform *values* only, so the fragment stage
    // does exactly the same work it did before: free on the GPU. Color.lerp
    // mutates in place, so this allocates nothing.
    if (traveling) {
      const swatch = swatchFor(sectionState.id);
      const k = 1 - Math.exp(-2.2 * dt);
      uniforms.uColorDeep.value.lerp(swatch.deep, k);
      uniforms.uColorBlue.value.lerp(swatch.blue, k);
      uniforms.uColorCyan.value.lerp(swatch.cyan, k);
      uniforms.uColorViolet.value.lerp(swatch.violet, k);
    }

    // Glow lifts slightly on hover.
    uniforms.uGlow.value = damp(
      uniforms.uGlow.value,
      hovered.current ? 0.85 : 0.5,
      7,
      dt
    );
  });

  return (
    <mesh
      ref={meshRef}
      geometry={geometry}
      material={material}
      onPointerOver={(e) => {
        e.stopPropagation();
        hovered.current = true;
        document.body.style.cursor = "pointer";
      }}
      onPointerOut={() => {
        hovered.current = false;
        document.body.style.cursor = "";
      }}
      onPointerDown={(e) => {
        e.stopPropagation();
        pulse.current = 1;
      }}
    />
  );
}
