"use client";

import { Canvas } from "@react-three/fiber";
import { AdaptiveDpr, AdaptiveEvents } from "@react-three/drei";
import * as THREE from "three";
import { Orb } from "./scene/Orb";
import { CameraRig } from "./scene/CameraRig";
import { Effects } from "./scene/Effects";
import { PointerTracker } from "./scene/PointerTracker";
import { ScrollRig } from "./scene/ScrollRig";
import { Starfield } from "./scene/Starfield";
import { Dust } from "./scene/Dust";
import { OrbitalParticles } from "./scene/OrbitalParticles";
import { OrbTravel } from "./scene/OrbTravel";
import { PerfGovernor } from "./scene/PerfGovernor";
import { getQuality, type Quality } from "./util/quality";

/**
 * The WebGL layer. Rendered on a transparent canvas so the page's dark
 * background and CSS glows show through and the orb reads as floating in the
 * document, not boxed in a viewport.
 *
 * Layers, back to front: distant starfield, drifting dust and orb-bound
 * orbital particles (the atmosphere), then the orb itself, then post. A single
 * <PointerTracker> feeds cursor state to every reactive system; <ScrollRig>
 * drives the cinematic hero exit.
 *
 * `active` is false once the hero scrolls out of view; the render loop then
 * drops to "demand" and the expensive orb shader stops running off-screen.
 *
 * `onContextLost` fires if the browser drops the GL context (a tab left for
 * hours, a GPU reset, a driver hiccup). The caller swaps in the CSS backdrop
 * rather than leaving a dead black rectangle where the orb was.
 */
export function Experience({
  reduced = false,
  active = true,
  quality = getQuality(),
  traveling = false,
  onContextLost,
}: {
  reduced?: boolean;
  active?: boolean;
  quality?: Quality;
  traveling?: boolean;
  onContextLost?: () => void;
}) {
  return (
    <Canvas
      dpr={[1, quality.maxDpr]}
      gl={{
        alpha: true,
        antialias: true,
        powerPreference: "high-performance",
        toneMapping: THREE.ACESFilmicToneMapping,
      }}
      camera={{ position: [0, 0, 5], fov: 42, near: 0.1, far: 100 }}
      frameloop={reduced || !active ? "demand" : "always"}
      onCreated={({ gl }) => {
        if (!onContextLost) return;
        gl.domElement.addEventListener("webglcontextlost", (event) => {
          // Stop the browser restoring a context we are about to unmount.
          event.preventDefault();
          onContextLost();
        });
      }}
    >
      <PointerTracker reduced={reduced} />
      <ScrollRig reduced={reduced} page={traveling} />
      <CameraRig reduced={reduced} />
      <Starfield reduced={reduced} count={quality.stars} />
      <Dust reduced={reduced} count={quality.dust} />
      {/* The swarm rides inside the travel group so it follows the orb out to
          the margin; the atmosphere layers stay world-anchored. */}
      <OrbTravel reduced={reduced} enabled={traveling}>
        <OrbitalParticles reduced={reduced} count={quality.orbital} />
        <Orb reduced={reduced} detail={quality.orbDetail} traveling={traveling} />
      </OrbTravel>
      <Effects reduced={reduced} />
      <PerfGovernor
        maxDpr={quality.maxDpr}
        enabled={!reduced}
        threshold={quality.tier === "low" ? 34 : 46}
      />
      <AdaptiveDpr pixelated={false} />
      <AdaptiveEvents />
    </Canvas>
  );
}
