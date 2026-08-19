/**
 * Samples a piece of text into a cloud of normalised points, used by the load
 * moment to give the starfield a shape to assemble into.
 *
 * The text is drawn once to an offscreen 2D canvas and its alpha channel read
 * back; every sufficiently opaque pixel is a candidate, and `count` of them are
 * chosen with a seeded shuffle so the layout is stable across reloads.
 *
 * Returns x,y pairs in [-0.5, 0.5] on the x axis, with y scaled by the text's
 * aspect ratio. Keeping them normalised means the caller can size and place the
 * wordmark from the live camera frustum without ever rebuilding the buffer.
 */
import { mulberry32 } from "./random";

const SAMPLE_HEIGHT = 180; // px of the offscreen render; detail vs. cost
const ALPHA_CUTOFF = 130;

export type WordmarkSample = {
  /** count * 2 floats: x, y per point */
  points: Float32Array;
  /** height / width of the rendered text, for proportional scaling */
  aspect: number;
};

export function sampleWordmark(
  text: string,
  count: number,
  fontFamily: string
): WordmarkSample | null {
  if (typeof document === "undefined" || count <= 0) return null;

  const canvas = document.createElement("canvas");
  const ctx = canvas.getContext("2d", { willReadFrequently: true });
  if (!ctx) return null;

  const font = `800 ${SAMPLE_HEIGHT}px ${fontFamily}`;
  ctx.font = font;
  const metrics = ctx.measureText(text);
  const width = Math.ceil(metrics.width);
  if (width <= 0) return null;

  const height = Math.ceil(SAMPLE_HEIGHT * 1.35);
  canvas.width = width;
  canvas.height = height;

  // Setting the size resets the context state, so restate the font.
  ctx.font = font;
  ctx.fillStyle = "#fff";
  ctx.textAlign = "center";
  ctx.textBaseline = "middle";
  ctx.fillText(text, width / 2, height / 2);

  const data = ctx.getImageData(0, 0, width, height).data;

  // Collect candidate pixels, then shuffle deterministically and take a prefix.
  // Sampling a prefix of a shuffled list gives an even spread; walking the
  // image in order would bias the cloud toward the first letters.
  const candidates: number[] = [];
  for (let y = 0; y < height; y += 2) {
    for (let x = 0; x < width; x += 2) {
      if (data[(y * width + x) * 4 + 3] >= ALPHA_CUTOFF) {
        candidates.push(y * width + x);
      }
    }
  }
  if (candidates.length === 0) return null;

  const rand = mulberry32(0x7a1d);
  for (let i = candidates.length - 1; i > 0; i--) {
    const j = Math.floor(rand() * (i + 1));
    [candidates[i], candidates[j]] = [candidates[j], candidates[i]];
  }

  const points = new Float32Array(count * 2);
  for (let i = 0; i < count; i++) {
    const index = candidates[i % candidates.length];
    const px = index % width;
    const py = Math.floor(index / width);
    points[i * 2] = px / width - 0.5;
    // Canvas y grows downward; world y grows up.
    points[i * 2 + 1] = (0.5 - py / height) * (height / width);
  }

  return { points, aspect: height / width };
}

/**
 * The font stack Next injected for the display face, so the sampled shape
 * matches the wordmark the reader actually sees. Falls back to a generic sans
 * if the variable is missing.
 */
export function displayFontFamily(): string {
  if (typeof window === "undefined") return "sans-serif";
  const value = getComputedStyle(document.documentElement)
    .getPropertyValue("--font-sora")
    .trim();
  return value || "sans-serif";
}
