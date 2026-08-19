/**
 * Runtime quality state, stepped down by <PerfGovernor> when frames get
 * expensive. A plain mutable singleton plus a version counter, so consumers
 * detect a change with an integer compare inside their existing useFrame and
 * React is never involved.
 *
 * This sits on top of the device-tier heuristic in util/quality.ts, which
 * still picks the starting point once on mount. The governor only ratchets
 * down from there.
 */
export const perfState = {
  level: 0,
  dprScale: 1,
  particleScale: 1,
  bloomScale: 1,
  version: 0,
};

/**
 * Successive degradations. DPR first and hardest: the orb is fragment-bound
 * (six envColor evaluations plus flowNoise per pixel), so resolution is by far
 * the dominant lever.
 *
 * Note what is absent. Orb detail is baked into a useMemo'd geometry keyed on
 * [radius, detail], so changing it would remount the mesh, and remount thrash
 * under load costs more than the frame it saves. Effect multisampling would
 * rebuild the composer for the same reason.
 */
const STEPS = [
  { dprScale: 1, particleScale: 1, bloomScale: 1 },
  { dprScale: 0.85, particleScale: 0.75, bloomScale: 0.85 },
  { dprScale: 0.7, particleScale: 0.5, bloomScale: 0.6 },
  { dprScale: 0.55, particleScale: 0.3, bloomScale: 0.4 },
];

export const MAX_PERF_LEVEL = STEPS.length - 1;

/** Steps down one level. Returns false when already at the floor. */
export function degrade(): boolean {
  if (perfState.level >= MAX_PERF_LEVEL) return false;
  perfState.level += 1;
  Object.assign(perfState, STEPS[perfState.level]);
  perfState.version += 1;
  return true;
}

/** Reset to full quality. Only for unmount, never mid-session. */
export function resetPerf() {
  perfState.level = 0;
  Object.assign(perfState, STEPS[0]);
  perfState.version = 0;
}
