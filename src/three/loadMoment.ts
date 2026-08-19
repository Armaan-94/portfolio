import * as THREE from "three";

/**
 * Shared state for the one-shot load moment, in which the starfield converges
 * into the wordmark and then scatters back out.
 *
 * Same plain-singleton pattern as `pointerState`: written once per frame by
 * <LoadMoment> and read by <Starfield> inside its own useFrame, so no React
 * render is involved.
 */
export const loadMomentState = {
  /** 0 = scattered (normal starfield), 1 = fully assembled into the wordmark */
  assemble: 0,
  /** world-space centre of the wordmark, matched to the DOM <h1> */
  center: new THREE.Vector3(),
  /** world width and height the normalised sample should be scaled to */
  scale: new THREE.Vector2(1, 1),
  /** true only while the moment is running, so Starfield can skip the work */
  running: false,
};

export const LOAD_MOMENT_KEY = "orb:load-moment";

/** Once per browser session, not once per page view. */
export function loadMomentAlreadyPlayed(): boolean {
  try {
    return sessionStorage.getItem(LOAD_MOMENT_KEY) === "1";
  } catch {
    // Private mode or blocked storage: treat as played and skip. Better to
    // miss the flourish than to replay it on every navigation.
    return true;
  }
}

export function markLoadMomentPlayed() {
  try {
    sessionStorage.setItem(LOAD_MOMENT_KEY, "1");
  } catch {
    // Nothing to do; the moment simply may replay next navigation.
  }
}
