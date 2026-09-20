"use client";

import { useEffect, useRef, type CSSProperties } from "react";
import portrait from "@/data/ascii-portrait.json";
import { useMedia } from "@/lib/useMedia";

/* Mirrors scripts/ascii-prebake.mjs. The baked resting frame is composed from
   the same two tables, so the server-rendered frame and the first animated
   frame are identical and the handover is invisible. */
const RAMP_TONE = " .,:;-~=+*%#@";
const RAMP_EDGE = ["-", "\\", "|", "/"] as const;
const LEVELS = 16;

const FPS = 12;
const LENS_R = 14;

type Tier = { cols: number; rows: number; art: string[]; levels: string[]; edges: string[] };

const WIDE = portrait.wide as Tier;
const NARROW = portrait.narrow as Tier;

/** Stateless sibling of the seeded PRNG in src/three/util/random.ts: a cell's
 *  grain is a pure function of (x, y, frame), so nothing has to be carried. */
function hash3(x: number, y: number, z: number): number {
  let h = (x * 374761393 + y * 668265263 + z * 2147483647) | 0;
  h = Math.imul(h ^ (h >>> 13), 1274126177);
  return ((h ^ (h >>> 16)) >>> 0) / 4294967296;
}

function decode(tier: Tier) {
  const { cols, rows, levels, edges } = tier;
  const n = cols * rows;
  const tone = new Float32Array(n);
  const edge = new Int8Array(n);
  for (let y = 0; y < rows; y++) {
    for (let x = 0; x < cols; x++) {
      const i = y * cols + x;
      tone[i] = parseInt(levels[y][x], 16) / (LEVELS - 1);
      const e = edges[y][x];
      edge[i] = e === "." ? -1 : Number(e);
    }
  }
  return { cols, rows, tone, edge };
}

/**
 * The ASCII portrait.
 *
 * Renders from a prebaked luminance grid rather than sampling an image at
 * runtime. That means no image decode, no canvas, nothing a privacy setting
 * can blank out, and a resting frame that server-renders as plain text, so it
 * is a correct static portrait even with JavaScript disabled. Animation is
 * then array maths over the grid rather than repeated pixel reads.
 *
 * It ticks at 12Hz, not 60. A 60fps ASCII portrait looks like video; 12Hz
 * looks like a CRT refresh, and the whole loop costs about half a millisecond
 * per 83ms window. The sweeping highlight is a separate compositor-only
 * gradient, so it runs at full frame rate for free and cannot desync from the
 * glyphs beneath it.
 */
export function AsciiPortrait({ className = "" }: { className?: string }) {
  const preRef = useRef<HTMLPreElement>(null);
  const pointer = useRef({ x: 0, y: 0, inside: false });

  const reduced = useMedia("(prefers-reduced-motion: reduce)", false);
  const narrow = useMedia("(max-width: 639px)", false);
  const fine = useMedia("(pointer: fine)", false);

  const tier = narrow ? NARROW : WIDE;

  useEffect(() => {
    if (reduced) return;
    const pre = preRef.current;
    if (!pre) return;

    const { cols, rows, tone, edge } = decode(tier);

    // The <pre> owns exactly one Text node for its whole life. Writing
    // nodeValue mutates it in place; textContent would destroy and recreate it
    // on every tick.
    let text = pre.firstChild as Text | null;
    if (!text || text.nodeType !== 3) {
      pre.textContent = "";
      text = document.createTextNode("");
      pre.appendChild(text);
    }

    const line = new Array<string>(cols);
    const buf = new Array<string>(rows);
    const interval = 1000 / FPS;
    const origin = performance.now();

    let raf = 0;
    let last = 0;
    let glitchUntil = 0;
    let glitchTimer = 0;
    let lx = cols / 2;
    let ly = rows / 2;

    const scheduleGlitch = () => {
      glitchTimer = window.setTimeout(
        () => {
          // rAF suspends itself in a hidden tab; setTimeout does not, so this
          // has to check or it keeps firing on a page nobody is looking at.
          if (!document.hidden) {
            glitchUntil = performance.now() + 220;
            pre.classList.add("is-glitching");
            window.setTimeout(() => pre.classList.remove("is-glitching"), 220);
          }
          scheduleGlitch();
        },
        8000 + Math.random() * 9000
      );
    };

    const loop = (now: number) => {
      raf = requestAnimationFrame(loop);
      const hot = now < glitchUntil;
      if (now - last < (hot ? interval / 2 : interval)) return;
      last = now;

      const t = (now - origin) / 1000;
      const frame = (t * FPS) | 0;

      // A scan pass ACROSS the portrait, not a reveal of it from nothing.
      //
      // The server already painted the finished frame, so animating up from a
      // field of dots would blank a complete picture the moment the component
      // hydrates, which reads as a page breaking rather than as an effect.
      // Instead one bright row sweeps down over an image that is already
      // there, which is also what a scanner actually does.
      const boot = Math.min(1, t / 1.15);
      const scanRow = boot >= 1 ? -1 : Math.floor(easeOut(boot) * rows);

      // Under half a ramp step, so most cells are byte-identical tick to tick
      // and only boundary cells flip. That is the difference between "alive"
      // and "noisy".
      const breathe = 0.035 * Math.sin((t * Math.PI * 2) / 7.4);

      const p = pointer.current;
      lx += (p.x - lx) * 0.18;
      ly += (p.y - ly) * 0.18;
      const lens = fine && p.inside;

      for (let y = 0; y < rows; y++) {
        // Clamped, never wrapped: a wrapped row reads as a bug, a clamped one
        // reads as a torn scanline.
        const shift = hot ? rowShift(y, frame) : 0;

        for (let x = 0; x < cols; x++) {
          const sx = x + shift;
          const i = y * cols + (sx < 0 ? 0 : sx >= cols ? cols - 1 : sx);

          if (y === scanRow) {
            line[x] = RAMP_TONE[1 + ((hash3(x, y, frame) * 11) | 0)];
            continue;
          }

          const e = edge[i];
          if (e >= 0) {
            line[x] = RAMP_EDGE[e];
            continue;
          }

          let v = tone[i] + breathe + (hash3(x, y, frame) - 0.5) * 0.02;
          if (lens) {
            const dx = (x - lx) / LENS_R;
            const dy = (y - ly) / LENS_R;
            const f = 1 - dx * dx - dy * dy;
            if (f > 0) v += f * 0.16;
          }
          v = v < 0 ? 0 : v > 1 ? 1 : v;
          line[x] = RAMP_TONE[(v * (RAMP_TONE.length - 1) + 0.5) | 0];
        }
        buf[y] = line.join("");
      }
      text.nodeValue = buf.join("\n");
    };

    raf = requestAnimationFrame(loop);
    scheduleGlitch();

    return () => {
      cancelAnimationFrame(raf);
      // rAF self-throttles in a hidden tab but setTimeout does not, so the
      // glitch has to be cleared explicitly or it keeps firing in the
      // background.
      window.clearTimeout(glitchTimer);
      pre.classList.remove("is-glitching");
    };
  }, [reduced, tier, fine]);

  function onMove(e: React.PointerEvent<HTMLDivElement>) {
    const r = e.currentTarget.getBoundingClientRect();
    pointer.current = {
      x: ((e.clientX - r.left) / r.width) * tier.cols,
      y: ((e.clientY - r.top) / r.height) * tier.rows,
      inside: true,
    };
  }

  return (
    <figure className={className}>
      <div
        className="wy-ascii-frame wy-ticks border border-[var(--wy-line-hot)]"
        onPointerMove={onMove}
        onPointerLeave={() => {
          pointer.current = { ...pointer.current, inside: false };
        }}
      >
        {/* Decoration. The figcaption below is the actual content: a wall of
            punctuation must never reach a screen reader. */}
        <pre
          ref={preRef}
          aria-hidden="true"
          className="wy-ascii"
          style={{ "--ascii-cols": tier.cols } as CSSProperties}
        >
          {tier.art.join("\n")}
        </pre>
        {reduced ? null : <span aria-hidden className="wy-scan" />}
      </div>
      <figcaption className="wy-micro mt-2 flex justify-between">
        <span>Subject: A. Punia / Epoch 2026</span>
        <span>
          Render: {tier.cols} x {tier.rows} / ASCII
        </span>
      </figcaption>
    </figure>
  );
}

/** Mirrors --ease-house so the reveal matches the rest of the site's timing. */
function easeOut(x: number) {
  return 1 - Math.pow(1 - x, 3);
}

/** Two to four contiguous bands displaced during a glitch burst. */
function rowShift(y: number, frame: number) {
  const band = (y / 4) | 0;
  const r = hash3(band, 0, frame >> 1);
  if (r > 0.72) return Math.round((r - 0.72) * 25) - 3;
  return 0;
}
