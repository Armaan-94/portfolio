#!/usr/bin/env node
/**
 * Turns the headshot into the ASCII portrait data the Weyland theme renders.
 *
 * Run it once after replacing the photo:
 *   npm run ascii            # writes src/data/ascii-portrait.json
 *   npm run ascii -- --preview   # prints to the terminal instead, for tuning
 *
 * The output is COMMITTED, following the precedent set by
 * src/data/leetcode.json: generated data, checked in, read synchronously with
 * a fallback. Generating it in CI would make sharp a build-time dependency on
 * every deploy for an asset that changes about twice a year, and a committed
 * file is diffable, so you can see the face change in a pull request.
 *
 * What it emits is a LUMINANCE GRID, not finished ASCII. The runtime maps
 * level to glyph itself so it can animate gamma, contrast and a pointer lens
 * as cheap array maths, with no image decoding, no canvas, and nothing that
 * can be blocked by a privacy setting. The same tone pipeline runs in both
 * places, so the prebaked frame and the first live frame agree glyph for
 * glyph and the handover is invisible.
 */
import { readFileSync, writeFileSync, mkdirSync } from "node:fs";
import { dirname } from "node:path";
import { fileURLToPath } from "node:url";
import sharp from "sharp";

const ROOT = fileURLToPath(new URL("..", import.meta.url));
const SRC = `${ROOT}public/ascii-source.jpg`;
const OUT = `${ROOT}src/data/ascii-portrait.json`;

/* ---------------------------------------------------------------- tuning -- */

/**
 * Rigid corrections only: rotate, crop, recentre. No warping, no reshaping,
 * so the face itself is exactly the face in the photograph.
 *
 * ROTATE_DEG levels the eye line. Positive is clockwise.
 * CROP is a fraction of the ROTATED frame: head and upper shoulders, centred
 * on the face midline. Tightening it also removes the asymmetric shoulder
 * line, which is the other thing that reads as a distracting angle.
 */
const num = (name, fallback) =>
  process.env[name] === undefined ? fallback : Number(process.env[name]);

const ROTATE_DEG = num("ASCII_ROTATE", 0);

/**
 * Headroom. The subject's hair runs off the top edge of the source, so the
 * frame is extended with backdrop-coloured pixels before cropping. Without it
 * the top row of the portrait is a slice of mid-tone hair cut flat, which
 * reads as damage rather than as a crop.
 */
const HEADROOM = num("ASCII_HEADROOM", 0.04);

/**
 * Crop, as fractions of the extended frame.
 *
 * Measured rather than guessed. Flood-filling the backdrop on the full image
 * and taking the subject's bounding box gives: centre x 0.467, head from the
 * top edge down to y 0.53, shoulders beginning at y 0.605. So the frame is
 * centred on 0.467 (which is what corrects the off-centre head), runs to just
 * past the shoulder line, and is 0.8 wide-over-tall to match the rendered
 * block so the resize introduces no distortion.
 */
const CROP = {
  x: num("ASCII_X", 0.209),
  y: num("ASCII_Y", 0.0),
  w: num("ASCII_W", 0.517),
  h: num("ASCII_H", 0.72),
};

/**
 * Rendered aspect of the whole block, width over height.
 *
 * A monospace advance is 0.6em and, at line-height 1, a cell is 0.6em wide by
 * 1em tall. So block width is cols * 0.6 and block height is rows, giving
 * rows = cols * 0.6 / ASPECT. At 72 columns and a 4:5 block that is 54 rows,
 * which puts the head at roughly 32 rows: about the point where a face stops
 * being "a face" and starts being this specific person.
 */
const ASPECT = num("ASCII_ASPECT", 0.8);
const TIERS = [
  { key: "wide", cols: 72 },
  { key: "narrow", cols: 52 },
];

const GAMMA = num("ASCII_GAMMA", 1.15);
const CONTRAST = num("ASCII_CONTRAST", 1.0);
/** Fraction of the frame's peak Sobel magnitude above which a cell draws an
 *  edge glyph instead of a tone glyph. */
const EDGE_THRESHOLD = num("ASCII_EDGE", 0.42);
/** Cells at or above this lightness, reachable from the border, are the studio
 *  backdrop rather than the subject. */
const BG_LIGHTNESS = num("ASCII_BG", 0.82);
/** How far below the fill threshold a backdrop-adjacent cell may sit and still
 *  count as halo rather than subject. */
const HALO_TOLERANCE = num("ASCII_HALO", 0.35);

/* --------------------------------------------------------------- pipeline -- */

/** sRGB byte triple to CIE L*, 0..1. Mirrored exactly in the runtime sampler:
 *  ink coverage is perceived roughly linearly in lightness, so L* is the space
 *  where evenly spaced ramp steps actually look evenly spaced. */
export function lstar(r, g, b) {
  const s = (c) => {
    const v = c / 255;
    return v <= 0.04045 ? v / 12.92 : ((v + 0.055) / 1.055) ** 2.4;
  };
  const y = 0.2126 * s(r) + 0.7152 * s(g) + 0.0722 * s(b);
  return y <= 0.008856 ? 9.033 * y : 1.16 * Math.cbrt(y) - 0.16;
}

/**
 * Flood fill the studio backdrop from the border.
 *
 * A plain "anything brighter than X is background" test would also delete the
 * shirt, which is nearly as light as the wall. The backdrop is distinguished
 * by being CONNECTED to the frame edge; the shirt is enclosed by the suit and
 * is not reachable. So this walks inward from the border instead of
 * thresholding globally.
 *
 * Keying matters more than it sounds: lightness drives ink density, so an
 * unkeyed white wall renders as a solid field of '@' with the face punched out
 * of it as a hole.
 */
function backdropMask(lum, cols, rows) {
  const bg = new Uint8Array(cols * rows);
  const stack = [];
  const push = (x, y) => {
    if (x < 0 || y < 0 || x >= cols || y >= rows) return;
    const i = y * cols + x;
    if (bg[i] || lum[i] < BG_LIGHTNESS) return;
    bg[i] = 1;
    stack.push(i);
  };
  for (let x = 0; x < cols; x++) {
    push(x, 0);
    push(x, rows - 1);
  }
  for (let y = 0; y < rows; y++) {
    push(0, y);
    push(cols - 1, y);
  }
  while (stack.length) {
    const i = stack.pop();
    const x = i % cols;
    const y = (i / cols) | 0;
    push(x + 1, y);
    push(x - 1, y);
    push(x, y + 1);
    push(x, y - 1);
  }

  // Eat the halo.
  //
  // Downsampling leaves a ring of part-backdrop, part-subject cells around the
  // silhouette. They sit just under the fill threshold, so the flood leaves
  // them, and they are then the brightest thing in the frame: autolevels puts
  // the white point ON the halo and the whole face collapses into the top two
  // ramp steps. Lowering the fill threshold instead just lets the fill leak
  // through the cheeks into the face.
  //
  // So: one dilation pass, taking only cells that touch the backdrop AND are
  // still bright. Dark hair against the backdrop is well under the cutoff and
  // survives, which is what keeps the silhouette intact.
  const halo = BG_LIGHTNESS - HALO_TOLERANCE;
  const grown = Uint8Array.from(bg);
  for (let y = 0; y < rows; y++) {
    for (let x = 0; x < cols; x++) {
      const i = y * cols + x;
      if (bg[i] || lum[i] < halo) continue;
      const touches =
        (x > 0 && bg[i - 1]) ||
        (x < cols - 1 && bg[i + 1]) ||
        (y > 0 && bg[i - cols]) ||
        (y < rows - 1 && bg[i + cols]);
      if (touches) grown[i] = 1;
    }
  }
  return grown;
}

async function sampleTier(cols) {
  const rows = Math.round((cols * 0.6) / ASPECT);

  const meta = await sharp(SRC).metadata();
  const pad = Math.round(HEADROOM * meta.height);

  // Two passes on purpose. sharp runs its operations in a FIXED order, not the
  // order they are called, and extend() happens after resize() in that order:
  // chaining it would pad the finished 72x54 grid instead of the source, which
  // silently produces a buffer of the wrong height. Materialising the padded
  // image first makes the ordering explicit.
  const padded =
    pad > 0
      ? await sharp(SRC).extend({ top: pad, background: "#ffffff" }).toBuffer()
      : SRC;

  const pipeline = sharp(padded);
  if (ROTATE_DEG !== 0) {
    pipeline.rotate(ROTATE_DEG, { background: "#ffffff" });
  }
  // Crop fractions are read off the padded, rotated frame.
  const rw = meta.width;
  const rh = meta.height + pad;

  const data = await pipeline
    .extract({
      left: Math.round(CROP.x * rw),
      top: Math.round(CROP.y * rh),
      width: Math.round(CROP.w * rw),
      height: Math.round(CROP.h * rh),
    })
    // lanczos3 rather than the box filter a canvas drawImage would use: at an
    // 4:1 reduction a box filter visibly smears the eyes and mouth together.
    .resize(cols, rows, { fit: "fill", kernel: "lanczos3" })
    .removeAlpha()
    .raw()
    .toBuffer();

  const n = cols * rows;
  const raw = new Float32Array(n);
  for (let i = 0; i < n; i++) {
    const o = i * 3;
    raw[i] = lstar(data[o], data[o + 1], data[o + 2]);
  }

  const bg = backdropMask(raw, cols, rows);

  // Autolevels over the SUBJECT only. Including the backdrop would put the
  // white point on the wall and crush the whole face into three ramp steps.
  const subject = [];
  for (let i = 0; i < n; i++) if (!bg[i]) subject.push(raw[i]);
  subject.sort((a, b) => a - b);
  const lo = subject[Math.floor(subject.length * 0.02)] ?? 0;
  const hi = subject[Math.floor(subject.length * 0.98)] ?? 1;
  const span = Math.max(hi - lo, 1e-3);

  const tone = new Float32Array(n);
  for (let i = 0; i < n; i++) {
    if (bg[i]) {
      tone[i] = 0;
      continue;
    }
    let t = Math.min(1, Math.max(0, (raw[i] - lo) / span));
    t = Math.min(1, Math.max(0, 0.5 + (t - 0.5) * CONTRAST));
    tone[i] = t ** (1 / GAMMA);
  }

  // Sobel. Border cells stay at zero rather than producing a bright ring
  // around the crop.
  const mag = new Float32Array(n);
  const dir = new Uint8Array(n);
  let peak = 1e-6;
  for (let y = 1; y < rows - 1; y++) {
    for (let x = 1; x < cols - 1; x++) {
      const i = y * cols + x;
      const tl = tone[i - cols - 1], tc = tone[i - cols], tr = tone[i - cols + 1];
      const ml = tone[i - 1], mr = tone[i + 1];
      const bl = tone[i + cols - 1], bc = tone[i + cols], br = tone[i + cols + 1];
      const gx = tl + 2 * ml + bl - tr - 2 * mr - br;
      const gy = tl + 2 * tc + tr - bl - 2 * bc - br;
      const m = Math.hypot(gx, gy);
      if (m > peak) peak = m;
      mag[i] = m;
      // The edge runs perpendicular to the gradient. y grows downward, hence
      // the negated gy. Folded to [0, pi) and quantised into four directions.
      let phi = Math.atan2(gx, -gy);
      phi = ((phi % Math.PI) + Math.PI) % Math.PI;
      dir[i] = Math.round(phi / (Math.PI / 4)) % 4;
    }
  }
  for (let i = 0; i < n; i++) mag[i] /= peak;

  return { cols, rows, tone, mag, dir };
}

/* ----------------------------------------------------------------- output -- */

/** 13 steps, ordered by how much ink each glyph puts on the cell. */
export const RAMP_TONE = " .,:;-~=+*%#@";
/** Indexed by quantised edge direction. */
export const RAMP_EDGE = ["-", "\\", "|", "/"];

/** Tone quantised to 16 steps. This, not the float, is what the runtime
 *  receives, so every derived artefact is computed from it. */
const LEVELS = 16;

/** The one place a level becomes a character. Mirrored by the runtime
 *  renderer, which is why it is exported. */
export function glyphForLevel(level) {
  return RAMP_TONE[
    Math.round((level / (LEVELS - 1)) * (RAMP_TONE.length - 1))
  ];
}

/**
 * Quantise first, then derive everything else FROM the quantised values.
 *
 * Composing the art from the float tone instead disagreed with the levels in
 * about 11% of cells: 16 tone steps do not map cleanly onto a 13 glyph ramp,
 * and the two roundings land on different sides. The baked frame has to be
 * exactly what the runtime draws at rest, or the handover from the static
 * frame to the live one visibly twitches.
 */
function bake({ cols, rows, tone, mag, dir }) {
  const levels = [];
  const edges = [];
  const art = [];

  for (let y = 0; y < rows; y++) {
    let levelRow = "";
    let edgeRow = "";
    let artRow = "";
    for (let x = 0; x < cols; x++) {
      const i = y * cols + x;
      const level = Math.round(tone[i] * (LEVELS - 1));
      // Edges are structural: they carry the jawline, the glasses and the
      // collar, and they must NOT move when the runtime animates gamma or
      // sweeps a pointer lens over the tone. So they ship as their own grid
      // rather than being folded into the levels.
      const isEdge = mag[i] > EDGE_THRESHOLD && tone[i] > 0.12;

      levelRow += level.toString(16);
      edgeRow += isEdge ? String(dir[i]) : ".";
      artRow += isEdge ? RAMP_EDGE[dir[i]] : glyphForLevel(level);
    }
    levels.push(levelRow);
    edges.push(edgeRow);
    art.push(artRow);
  }

  return { levels, edges, art };
}

async function main() {
  const preview = process.argv.includes("--preview");
  const result = {};

  const tiers = preview ? TIERS.slice(0, 1) : TIERS;
  for (const tier of tiers) {
    const sampled = await sampleTier(tier.cols);
    const { levels, edges, art } = bake(sampled);

    if (preview) {
      console.log(`\n--- ${tier.key}: ${sampled.cols} x ${sampled.rows} ---`);
      console.log(art.join("\n"));
      continue;
    }

    result[tier.key] = {
      cols: sampled.cols,
      rows: sampled.rows,
      /** The resting frame, ready to server-render verbatim. */
      art,
      /** Base-16 tone per cell. The runtime animates from these. */
      levels,
      /** "." for no edge, otherwise the quantised direction 0-3. */
      edges,
    };
  }

  if (preview) return;

  result.source = "public/ascii-source.jpg";
  result.generatedBy = "scripts/ascii-prebake.mjs";
  mkdirSync(dirname(OUT), { recursive: true });
  writeFileSync(OUT, JSON.stringify(result, null, 2) + "\n");
  const bytes = readFileSync(OUT).length;
  console.log(`wrote ${OUT} (${bytes} bytes)`);
}

main().catch((err) => {
  console.error(err);
  process.exit(1);
});
