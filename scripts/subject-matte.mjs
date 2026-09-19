/**
 * The subject silhouette for assets/portrait-source.jpg.
 *
 * This is hand-authored rather than detected, and that is deliberate. The photo
 * is a selfie against dense forest, and every automatic cue was measured and
 * found not to separate subject from backdrop:
 *
 *   - skin chroma (YCbCr)  - the dirt path and dry grass are skin-toned;
 *                            44.9% of the frame classifies as skin.
 *   - texture (local sd)   - the blurred backdrop is smoother than the hair.
 *   - focus (regional      - INVERTED here: the forest twigs carry more
 *     max |Laplacian|)       high-frequency energy (median 98-122) than the
 *                            hair does (43). The lens has deep depth of field.
 *   - green (G > R)        - only catches live foliage, not the brown branches
 *                            or the tan path.
 *
 * So the gross boundary is authored by hand, and the automatic skin/hair mask
 * is used only *inside* it, to carry the fine detail along the hairline that a
 * polygon cannot describe. One fixed photo, one fixed matte.
 *
 * It follows the head and the neck and stops at the collar. The navy shirt and
 * the bag strap are excluded deliberately: the brief is the face, and in ASCII
 * a dark shoulder mass is a slab of low-density glyphs that reads as noise.
 *
 * Coordinates are fractions of the source frame, clockwise from the crown.
 */
export const SILHOUETTE = [
  [0.670, 0.222], [0.762, 0.198], [0.845, 0.234], [0.872, 0.272],
  [0.892, 0.350], [0.908, 0.450], [0.900, 0.558], [0.884, 0.638],
  [0.868, 0.700], [0.845, 0.775], [0.812, 0.835], [0.780, 0.890],
  [0.752, 0.950], [0.738, 1.000], [0.592, 1.000], [0.568, 0.950],
  [0.542, 0.900], [0.515, 0.850], [0.498, 0.780], [0.492, 0.700],
  [0.497, 0.620], [0.516, 0.550], [0.536, 0.500], [0.560, 0.450],
  [0.576, 0.400], [0.594, 0.350], [0.620, 0.300], [0.640, 0.260],
];

/** Even-odd point-in-polygon over the normalised silhouette. */
export function inSilhouette(fx, fy) {
  let inside = false;
  for (let i = 0, j = SILHOUETTE.length - 1; i < SILHOUETTE.length; j = i++) {
    const [xi, yi] = SILHOUETTE[i], [xj, yj] = SILHOUETTE[j];
    if ((yi > fy) !== (yj > fy) && fx < ((xj - xi) * (fy - yi)) / (yj - yi) + xi)
      inside = !inside;
  }
  return inside;
}

/** Signed distance to the silhouette edge, in fractions of the frame. */
export function silhouetteDistance(fx, fy) {
  let best = Infinity;
  for (let i = 0, j = SILHOUETTE.length - 1; i < SILHOUETTE.length; j = i++) {
    const [xi, yi] = SILHOUETTE[i], [xj, yj] = SILHOUETTE[j];
    const dx = xj - xi, dy = yj - yi;
    const t = Math.max(0, Math.min(1, ((fx - xi) * dx + (fy - yi) * dy) / (dx * dx + dy * dy)));
    const px = xi + t * dx - fx, py = yi + t * dy - fy;
    best = Math.min(best, Math.hypot(px, py));
  }
  return inSilhouette(fx, fy) ? best : -best;
}

/**
 * Build the soft cell matte for one ASCII tier: 0 = keep, 1 = discard.
 *
 * Sampled at SS times the cell grid and box-averaged down, then thresholded at
 * half coverage, so the silhouette lands on whole cells.
 *
 * Inside the silhouette a green test still runs. The polygon cannot follow
 * individual curls, so a few slivers of foliage survive along the hairline;
 * live leaves are the one part of this backdrop that is reliably greener than
 * it is red, and nothing on the subject is (hair, skin, glasses, the navy
 * shirt and the grey strap are all neutral or warm).
 */
export async function buildMatte({ sharp, src, crop, cols, rows, ss = 4 }) {
  const w = cols * ss, h = rows * ss;
  const { data } = await sharp(src)
    .extract(crop)
    .resize(w, h, { fit: "fill", kernel: "lanczos3" })
    .removeAlpha()
    .raw()
    .toBuffer({ resolveWithObject: true });

  // Crop fractions, so a sample can be placed back in the source frame.
  const { fx0, fy0, fw, fh } = crop;

  const keep = new Uint8Array(w * h);
  for (let y = 0; y < h; y++) {
    for (let x = 0; x < w; x++) {
      const i = y * w + x;
      const sx = fx0 + ((x + 0.5) / w) * fw;
      const sy = fy0 + ((y + 0.5) / h) * fh;
      if (!inSilhouette(sx, sy)) continue;
      const r = data[i * 3], g = data[i * 3 + 1];
      if (g > r + 3) continue; // live foliage
      keep[i] = 1;
    }
  }

  // Open then close at sample resolution: drop isolated specks of backdrop that
  // survived the green test, then re-close the pinholes the open leaves in the
  // hair. Both are smaller than one cell, so neither moves the silhouette.
  const R = Math.max(1, Math.round(ss / 2));
  const cleaned = closeMask(openMask(keep, w, h, R), w, h, R);

  const matte = new Float32Array(cols * rows);
  const per = ss * ss;
  for (let cy = 0; cy < rows; cy++) {
    for (let cx = 0; cx < cols; cx++) {
      let hit = 0;
      for (let dy = 0; dy < ss; dy++)
        for (let dx = 0; dx < ss; dx++)
          hit += cleaned[(cy * ss + dy) * w + cx * ss + dx];
      // Thresholded, not left as coverage. A fractional cell renders as a
      // mid-ramp glyph, and a one-cell band of those around the head reads as
      // speckle rather than as a soft edge: at 72 columns there is no room for
      // a gradient, so the silhouette is better crisp.
      matte[cy * cols + cx] = hit / per >= 0.5 ? 0 : 1;
    }
  }
  return matte;
}

function morphMask(src, w, h, r, dilate) {
  const out = new Uint8Array(w * h);
  for (let y = 0; y < h; y++) {
    for (let x = 0; x < w; x++) {
      let hit = dilate ? 0 : 1;
      for (let dy = -r; dy <= r && hit === (dilate ? 0 : 1); dy++) {
        for (let dx = -r; dx <= r; dx++) {
          if (dx * dx + dy * dy > r * r) continue;
          const nx = x + dx, ny = y + dy;
          const v =
            nx < 0 || ny < 0 || nx >= w || ny >= h
              ? dilate ? 0 : 1
              : src[ny * w + nx];
          if (dilate ? v : !v) { hit = dilate ? 1 : 0; break; }
        }
      }
      out[y * w + x] = hit;
    }
  }
  return out;
}
const openMask = (m, w, h, r) => morphMask(morphMask(m, w, h, r, false), w, h, r, true);
const closeMask = (m, w, h, r) => morphMask(morphMask(m, w, h, r, true), w, h, r, false);
