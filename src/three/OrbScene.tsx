"use client";

import dynamic from "next/dynamic";
import {
  useEffect,
  useMemo,
  useRef,
  useState,
  useSyncExternalStore,
} from "react";
import { getQuality, canTravel } from "./util/quality";
import { startSectionSpy } from "./sectionSpy";
import { orbLayer } from "./interaction";
import { TRAVELING_ORB } from "./config";

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
 * Mounts the WebGL experience inside its parent (the hero). The heavy Three.js
 * bundle is loaded client-side only (ssr:false), so first paint (the readable
 * hero content) is never blocked. prefers-reduced-motion is tracked via
 * useSyncExternalStore, the idiomatic subscription.
 *
 * In traveling mode (Phase 9) the layer switches from `absolute inset-0` to a
 * fixed viewport-height layer, so the orb persists past the hero. The DOM
 * position never changes, which is what makes hero parity free rather than
 * something to be matched by hand:
 *
 * - Hero's `overflow-hidden` does not clip a fixed layer, because nothing on
 *   the ancestor chain has transform / filter / perspective / contain, so the
 *   containing block is the viewport.
 * - Hero's `isolate` keeps the canvas inside the hero's stacking context, so
 *   the grid, glow, scrim and content still paint in exactly the same order.
 * - Every later section is a later sibling of the hero, so they paint above
 *   the canvas with no z-index tuning at all.
 *
 * Anything that would break those invariants (a transform on Hero, main or
 * body) is flagged by the development-only check below.
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

  // False through SSR and the first render, so the server and the client agree
  // on the classic class string and there is no hydration mismatch.
  //
  // The measurement is a parity guard, not a capability check: if the hero is
  // much taller than the viewport, a fixed 100svh layer sits noticeably higher
  // within it than the absolute layer did, and the hero would not look the
  // same. A hero slightly over one viewport is fine, because the overflow was
  // below the fold and unseen either way, so the tolerance is generous.
  const [eligible, setEligible] = useState(false);
  useEffect(() => {
    if (!TRAVELING_ORB) return;
    const measure = () => {
      const hero = ref.current?.parentElement;
      const fits = !!hero && hero.offsetHeight <= window.innerHeight * 1.25;
      setEligible(fits && canTravel());
    };
    measure();
    window.addEventListener("resize", measure, { passive: true });
    return () => window.removeEventListener("resize", measure);
  }, []);

  useEffect(() => {
    const el = ref.current;
    if (!el) return;
    // Observe the hero section, not this layer. In traveling mode the layer is
    // fixed and therefore always intersects the viewport, so watching it would
    // report "in view" forever and the below-the-fold dimming would never fire.
    // The hero is the same box in fallback mode, so this is equivalent there.
    const io = new IntersectionObserver(
      ([entry]) => setInView(entry.isIntersecting),
      { threshold: 0 }
    );
    io.observe(el.parentElement ?? el);

    const onVisibility = () => setVisible(!document.hidden);
    document.addEventListener("visibilitychange", onVisibility);

    return () => {
      io.disconnect();
      document.removeEventListener("visibilitychange", onVisibility);
    };
  }, []);

  // Traveling mode is a fine-pointer, full-motion upgrade. Every other case
  // keeps today's behavior exactly, including the render-loop pause off the
  // hero. Touch devices are excluded by canTravel(), which retires the fixed +
  // 100svh + momentum-scroll bug class on iOS.
  const traveling = TRAVELING_ORB && eligible && !reduced;

  // Development aid: the travel gate has several independent inputs and a
  // silent "no" is hard to diagnose from the outside. Publish the decision so
  // it can be inspected from the console.
  useEffect(() => {
    if (process.env.NODE_ENV === "production") return;
    (window as Window & { __orb?: unknown }).__orb = {
      traveling,
      reasons: {
        flagEnabled: TRAVELING_ORB,
        eligible,
        reducedMotion: reduced,
        canTravel: canTravel(),
        tier: quality.tier,
        heroHeight: ref.current?.parentElement?.offsetHeight ?? null,
        viewportHeight: window.innerHeight,
      },
    };
  }, [traveling, eligible, reduced, quality.tier]);

  // Expose the decision to CSS. The hero's legibility scrim needs to know:
  // it is sized to the hero's bottom half, so with a persistent canvas behind
  // it, its lower edge draws a hard seam across the orb at the hero boundary.
  useEffect(() => {
    const root = document.documentElement;
    if (traveling) root.dataset.orbTraveling = "1";
    else delete root.dataset.orbTraveling;
    return () => {
      delete root.dataset.orbTraveling;
    };
  }, [traveling]);

  // Publish the wrapper so <LayerFade> can fade it from inside the render loop.
  useEffect(() => {
    orbLayer.el = ref.current;
    return () => {
      if (orbLayer.el) orbLayer.el.style.opacity = "";
      orbLayer.el = null;
    };
  }, []);

  useEffect(() => {
    if (!traveling) return;
    return startSectionSpy();
  }, [traveling]);

  // The fixed layer's correctness rests on no ancestor establishing a
  // containing block. Catch a future transform/filter/contain the moment it
  // lands rather than as a mystery clipping bug. Development only.
  useEffect(() => {
    if (process.env.NODE_ENV === "production" || !traveling) return;
    const risky = ["transform", "filter", "perspective", "contain"] as const;
    let node = ref.current?.parentElement ?? null;
    while (node && node !== document.documentElement) {
      const style = getComputedStyle(node);
      for (const prop of risky) {
        const value = style.getPropertyValue(prop);
        if (value && value !== "none" && value !== "normal") {
          console.warn(
            `[OrbScene] <${node.tagName.toLowerCase()}> sets ${prop}: ${value}. ` +
              "That makes it the containing block for the fixed orb layer, " +
              "which will clip or mis-position it. See OrbScene's docblock."
          );
        }
      }
      node = node.parentElement;
    }
  }, [traveling]);

  return (
    <div
      ref={ref}
      aria-hidden
      className={
        traveling
          ? "fixed inset-x-0 top-0 z-0 h-[100svh]"
          : "absolute inset-0 z-0"
      }
      // Opacity and pointer-events are both written per frame by <LayerFade>,
      // straight to the DOM. Driving them from React state fed by an
      // IntersectionObserver was both too slow and, for pointer-events, wrong
      // often enough to swallow clicks in the footer.
    >
      {webgl ? (
        <Experience
          reduced={reduced}
          // A fixed layer always intersects, so inView stops being meaningful
          // once traveling; tab visibility becomes the only gate.
          active={traveling ? visible : inView && visible}
          quality={quality}
          traveling={traveling}
          onContextLost={() => setWebgl(false)}
        />
      ) : (
        <OrbFallback />
      )}
    </div>
  );
}
