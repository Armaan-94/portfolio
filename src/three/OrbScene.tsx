"use client";

import dynamic from "next/dynamic";
import {
  useEffect,
  useMemo,
  useRef,
  useState,
  useSyncExternalStore,
} from "react";
import { getQuality } from "./util/quality";

/**
 * Static stand-in for the WebGL layer: the orb's glow reduced to two radial
 * gradients. Shown while the Three.js chunk downloads, and kept permanently if
 * WebGL is unavailable or the GL context is lost, so the hero always has depth
 * behind the wordmark instead of flat black.
 */
function OrbFallback() {
  return (
    <div
      aria-hidden
      className="absolute inset-0"
      style={{
        background:
          "radial-gradient(38% 38% at 50% 44%, color-mix(in srgb, var(--color-deep-indigo) 30%, transparent), transparent 70%)," +
          "radial-gradient(26% 26% at 58% 54%, color-mix(in srgb, var(--color-cyan) 18%, transparent), transparent 70%)",
        filter: "blur(14px)",
      }}
    />
  );
}

// WebGL must never render on the server; load it only in the browser.
const Experience = dynamic(
  () => import("./Experience").then((m) => m.Experience),
  { ssr: false, loading: () => <OrbFallback /> }
);

/** Cheap one-off probe: can this browser give us a GL context at all? */
function hasWebGL() {
  try {
    const probe = document.createElement("canvas");
    return Boolean(
      probe.getContext("webgl2") ?? probe.getContext("webgl")
    );
  } catch {
    return false;
  }
}

const REDUCED_QUERY = "(prefers-reduced-motion: reduce)";

function subscribeReducedMotion(callback: () => void) {
  const mq = window.matchMedia(REDUCED_QUERY);
  mq.addEventListener("change", callback);
  return () => mq.removeEventListener("change", callback);
}

function getReducedMotion() {
  return window.matchMedia(REDUCED_QUERY).matches;
}

/**
 * Mounts the WebGL experience as an absolute layer inside its parent (the
 * hero). The heavy Three.js bundle is loaded client-side only (ssr:false), so
 * first paint (the readable hero content) is never blocked. prefers-reduced-
 * motion is tracked via useSyncExternalStore, the idiomatic subscription.
 */
export function OrbScene() {
  const reduced = useSyncExternalStore(
    subscribeReducedMotion,
    getReducedMotion,
    () => false
  );

  // Device-tier quality, chosen once on mount.
  const quality = useMemo(() => getQuality(), []);

  // Pause the render loop when the hero (this layer) leaves the viewport or the
  // tab is hidden, so the expensive orb shader never runs when unseen.
  const ref = useRef<HTMLDivElement>(null);
  const [inView, setInView] = useState(true);
  const [visible, setVisible] = useState(true);

  // null while unprobed. The dynamic import is async anyway, so the extra tick
  // costs nothing visible and saves throwing inside r3f on a GL-less browser.
  const [webgl, setWebgl] = useState<boolean | null>(null);
  useEffect(() => setWebgl(hasWebGL()), []);

  useEffect(() => {
    const el = ref.current;
    if (!el) return;
    const io = new IntersectionObserver(
      ([entry]) => setInView(entry.isIntersecting),
      { threshold: 0 }
    );
    io.observe(el);

    const onVisibility = () => setVisible(!document.hidden);
    document.addEventListener("visibilitychange", onVisibility);

    return () => {
      io.disconnect();
      document.removeEventListener("visibilitychange", onVisibility);
    };
  }, []);

  return (
    <div ref={ref} aria-hidden className="absolute inset-0 z-0">
      {webgl ? (
        <Experience
          reduced={reduced}
          active={inView && visible}
          quality={quality}
          onContextLost={() => setWebgl(false)}
        />
      ) : (
        <OrbFallback />
      )}
    </div>
  );
}
