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

- **Phase 8 - done.** Motion polish outside the canvas: `Reveal` gained
  optional blur/scale/wipe, scroll-driven CSS (nav reading progress, section
  rule draw) behind `@supports (animation-timeline: ...)`, an observer-driven
  cascade on the LeetCode heatmap, card spotlights extended to Skills and
  Experience, and a CSS fallback for the canvas while it loads, when WebGL is
  missing, and on context loss.
- **Phase 9 - done.** The traveling orb. The canvas becomes a fixed
  viewport-height layer so the orb persists past the hero, shrinking and
  drifting to the margin, with its palette drifting per section. Adds a runtime
  FPS governor. See the two invariants below.

- **Phase 10 - on, unverified visually.** The load moment: the starfield
  converges into the wordmark, holds, and scatters back. Enabled via
  `LOAD_MOMENT` in `config.ts`. The guards are all in place and the gate is
  confirmed reaching "armed", but the animation itself has never been watched
  playing, so judge it on a real machine. The wordmark
  shape comes from `util/wordmark.ts` (text sampled to a point cloud once) and
  is placed by measuring the real `<h1>` and projecting its box to the orb's
  depth, so it lands on the name at any viewport size. The lerp is a `uAssemble`
  branch in the star vertex shader: vertex work only, no new fragment cost.

### Gating: capability, not quality tier

`getQuality()`'s tier drops to `low` whenever the smaller viewport side is under
700px. That is correct for *render cost* and wrong as a *feature gate*: it turns
effects off on a perfectly capable desktop in a half-height window, which is
exactly the bug that made the traveling orb and the load moment look like they
were not implemented at all.

Feature gates use `canTravel()` instead: a fine pointer (so no touch devices,
which is where `position: fixed` + 100svh + momentum scrolling misbehaves) and
hardware that is not obviously underpowered. Viewport size does not enter into
it; the tier still scales the render either way.

In development both decisions are published for inspection:
`window.__orb` (why the orb is or is not traveling) and `window.__loadMoment`
(what the intro did). Neither exists in a production build.

### Phase 9 invariants

**The canvas must stay a child of the hero.** In traveling mode it is
`position: fixed`, and its correctness rests on the DOM position never
changing:

- Nothing on the ancestor chain may set `transform`, `filter`, `perspective`
  or `contain`. Any of those would become the containing block, and the layer
  would be clipped by the hero's `overflow-hidden`. `OrbScene` walks the
  ancestors in development and warns if this is ever broken.
- The hero's `isolate` is load-bearing. It keeps the canvas inside the hero's
  stacking context, so the grid, glow, scrim and content still paint in the
  same order, and every later section paints above the canvas with no z-index
  tuning.

**Travel is normalised in viewport units, not document length.** `travel` uses
`TRAVEL_SPAN` viewports; `pageProgress` exists for long-range ambience only.
Keying the orb's position to document height would move it whenever the
LeetCode snapshot changes the page height.

**Traveling is a mid/high-tier, full-motion upgrade.** Reduced motion, the
`low` tier (every touch device), and a hero taller than the viewport all fall
back to the original absolute layer, including the render-loop pause when the
hero leaves the viewport. `TRAVELING_ORB` in `config.ts` disables the whole
system.

## Performance targets

60+ FPS desktop, 30+ FPS laptops. Levers: the `dpr` ceiling, `<AdaptiveDpr>`,
`<AdaptiveEvents>`, a single high-density mesh, and GPU-side displacement.

`<PerfGovernor>` adds a runtime backstop on top of the device-tier heuristic:
it samples frame rate in one-second windows and, after two consecutive slow
ones, ratchets quality down a step (dpr, then particle draw range, then bloom).
It never steps back up within a session, which removes oscillation as a failure
mode rather than trying to damp it. Orb detail is deliberately not a lever: the
geometry is memoised on `[radius, detail]`, so changing it would remount the
mesh, and remount thrash under load costs more than it saves.

The orb fragment stage is the ceiling: six `envColor` evaluations per pixel
plus `flowNoise`. Add per-pixel work only with measurements in hand. Uniform
*values* (the per-section palette) are free by comparison.
