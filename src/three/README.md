# 3D Engine (`src/three`)

The immersive WebGL layer, built on React Three Fiber. Delivered in phases so
each system is refactored and verified before the next is stacked on top.

## Architecture

```
three/
  OrbScene.tsx          Client entry. Lazy-loads the canvas (ssr:false),
                        tracks prefers-reduced-motion via useSyncExternalStore,
                        and mounts as an absolute layer behind the hero.
  Experience.tsx        The <Canvas>: transparent, ACES tonemapping, clamped
                        dpr, adaptive dpr/events. Composes the scene.
  interaction.ts        Shared mutable pointer state (ndc, velocity, orb hover,
                        pulse) read by every reactive system — no re-renders.
  scene/
    PointerTracker.tsx  Single writer of cursor position + smoothed velocity;
                        runs at negative priority so consumers read fresh data.
    Orb.tsx             The centrepiece mesh. Feeds time/pointer/click into the
                        shader via refs; all deformation happens on the GPU.
    CameraRig.tsx       Heavily damped cursor-follow drift + idle dolly-breath.
    Starfield.tsx       Distant twinkling shell of points (furthest layer).
    Dust.tsx            Drifting mid-field dust with screen-space cursor repel.
    OrbitalParticles.tsx Great-circle swarm around the orb; hover pulls it in.
    Effects.tsx         Post-processing (bloom + vignette).
  materials/
    OrbMaterial.ts      Uniform schema + brand palette + material factory.
  util/
    random.ts           Seeded PRNG (mulberry32) + uniform sphere sampling.
  shaders/
    orb/
      noise.glsl.ts     Ashima simplex noise, fbm, domain-warp + ridged (shared).
      vertex.glsl.ts    Domain-warped displacement, fine shimmer, breathing,
                        pointer swell, wake ripple, click ripple, FD normals.
      fragment.glsl.ts  Liquid-glass refraction/reflection with chromatic
                        dispersion, energy veins, iridescence, subsurface, rim.
    particles.glsl.ts   Shared soft-sprite fragment + dust / star / orbital
                        vertex programs.
```

Shaders are authored as `.glsl.ts` modules exporting template strings, so they
stay in separate files without needing a bundler GLSL loader.

## Design rules

- **No per-frame allocation.** Scratch vectors/quaternions are memoised and
  reused inside `useFrame`.
- **Refs over state for animation.** Hover and pulse live in refs; they never
  trigger React re-renders.
- **Reduced motion is first-class.** `reduced` flows from `OrbScene` down;
  it freezes morph, rotation, camera drift, and drops MSAA.
- **Imperative render loop.** `useFrame` mutates the camera and uniforms every
  frame (the intended R3F pattern); the React-Compiler immutability lint rules
  are scoped off for `src/three/**` only.

## Phase roadmap

- **Phase 1 — done (ULTRA).** Engine + giant shader orb, camera drift, bloom.
  Orb upgraded to liquid glass: domain-warped displacement + fine shimmer, a
  procedural studio "HDRI" refracted through the body and reflected off the
  edges with per-channel chromatic dispersion, flowing internal energy veins
  (domain-warped ridged noise), brand-biased thin-film iridescence, subsurface
  back-glow. World-space normals; environment lights slowly orbit for
  ever-moving reflections.
- **Phase 2 — done.** Camera system + mouse interaction: velocity-aware pointer
  (tracked once in `PointerTracker`, shared via `interaction.ts`), idle
  dolly-breath + edge pull-back, wake ripple, swell boost, glow + energy that
  follow the cursor.
- **Phase 3 — done.** Atmosphere: three GPU particle layers — distant twinkling
  `Starfield`, drifting `Dust` with screen-space cursor repel, and
  orb-bound `OrbitalParticles` that pull in on hover. Depth-faded for a
  volumetric feel. All additive on the transparent canvas.
- **Phase 4 — done.** Premium glass + magnetic controls: `.glass-premium`
  surface (lit edges, real depth) on the hero chip + secondary button;
  `MagneticButton` (motion springs) slides toward the cursor, leans in 3D,
  lights a cursor-tracked glare, dips on press; `.sheen` sweep on the primary.
  Also a perf pass (orb detail 64→42, lighter per-pixel veins, dpr≤1.75,
  MSAA→2, ~40% fewer particles). Card spotlights extend the glare in Phase 6.
- **Phase 5 — done.** Cinematic scroll (`ScrollRig` → damped `scrollState`, no
  native-scroll hijack): camera dollies back + rises, orb sinks and shrinks,
  atmosphere layers parallax at differing depths, particles accelerate. Render
  loop drops to "demand" once the hero leaves the viewport (perf).
- **Phase 6 — done.** Micro-interactions: `SpotlightCard` (cursor-tracked glow
  on project cards) and hero-content cursor parallax (springed, floats over the
  orb). Both inert under reduced motion.
- **Phase 7 — done.** Device-tier quality scaling (`util/quality.ts`: orb
  detail, particle counts and dpr ceiling per tier), render-loop pause when the
  hero is off-screen or the tab is hidden, reduced-motion verified end to end.
  Production build passes clean.

## Performance targets

60+ FPS desktop, 30+ FPS laptops. Levers: `dpr={[1,2]}`, `<AdaptiveDpr>`,
`<AdaptiveEvents>`, a single high-density mesh (icosahedron detail 64), and
GPU-side displacement. LOD and instancing arrive with the particle systems.
