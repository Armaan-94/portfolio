/**
 * Ink assets/portrait-source.jpg as a manga panel: public/manga-portrait.png
 *
 * Not a generated illustration - a tone conversion, which is how a manga page
 * is actually made from a photo reference. Three passes stacked in order:
 *
 *   1. ZONES      The smoothed image is posterised to four values. Skin goes
 *                 to bare paper, the hair to solid ink, and only the two
 *                 middle bands carry tone. Large flat whites next to solid
 *                 blacks is the whole look; a continuous halftone of the same
 *                 photo reads as newsprint instead.
 *   2. SCREENTONE Each mid band is a real halftone - one dot per cell on a
 *                 15deg lattice, radius from the band density - rather than a
 *                 fixed pattern. Dots that grow and touch are what make tone
 *                 read as shading instead of as texture.
 *   3. INK LINE   XDoG (difference of Gaussians, biased and thresholded) over
 *                 the top. This is the pen: the glasses, the jaw, the hairline.
 *
 * Output is single-colour ink with an alpha channel, so it composites over
 * whatever is behind it - the cream paper and the red screentone wash both
 * show through, which a baked-in background would kill.
 */
import sharp from "sharp";
import path from "node:path";
import { fileURLToPath } from "node:url";
import { inSilhouette } from "./subject-matte.mjs";

const ROOT = path.resolve(path.dirname(fileURLToPath(import.meta.url)), "..");
const SRC = path.join(ROOT, "assets/portrait-source.jpg");
const OUT = path.join(ROOT, "public/manga-portrait.png");

const num = (k, d) => (process.env[k] ? Number(process.env[k]) : d);

/**
 * A 4:5 portrait panel rather than the square face box the photographic themes
 * use. A manga panel wants the whole head - the hair silhouette is half the
 * drawing - and the head is far taller than it is wide, so a square either
 * crops the crown or floats the face in empty paper.
 */
const BOX = { x: 0.42, y: 0.185, w: 0.56, h: 0.715 };
const OUT_W = num("MANGA_W", 720);
// The source frame is square, so the crop's own aspect is simply w:h.
const OUT_H = Math.round((OUT_W * BOX.h) / BOX.w);

/**
 * Zone edges on the smoothed luminance, bright to dark, and the ink density
 * each band prints. 0 is bare paper, 1 is solid.
 *
 * Set off the measured histogram (MANGA_HIST=1), not by eye. This is an
 * overcast outdoor shot, so the subject sits dark and evenly spread - median
 * around 0.4 - and textbook mid-grey edges would put a third of the face into
 * solid black while leaving barely any bare paper. The edges are lifted until
 * the lit side of the face drops out to white entirely and tone is left
 * carrying only the shadowed side and the underside of the jaw, which is the
 * balance a manga face actually has.
 */
const ZONES = [
  { above: 0.46, density: 0 },
  { above: 0.3, density: 0.24 },
  { above: 0.21, density: 0.55 },
  { above: -1, density: 1 },
];

/** Halftone lattice: cell pitch in pixels and screen angle. 15deg is the
 *  traditional single-screen angle and, unlike 0deg, never lines its dots up
 *  with the pixel grid into visible rows. */
const PITCH = num("MANGA_PITCH", 7.5);
const ANGLE = (num("MANGA_ANGLE", 15) * Math.PI) / 180;

/**
 * The pen: a difference of Gaussians, inked where the small blur sits far
 * enough BELOW the large one, which is the dark side of an edge.
 *
 * The textbook sharpened form, (1+p)*G1 - p*G2, is deliberately not used here.
 * In a flat region G1 and G2 agree, so it reduces to the luminance itself and
 * any absolute threshold on it floods the whole face with ink. Thresholding
 * the raw difference has no such degenerate case.
 */
const SIGMA = num("MANGA_SIGMA", 1.0);
const K = num("MANGA_K", 2.2);
const PEN = num("MANGA_PEN", 0.014);
/** Contour weight in pixels at the default output width. */
const CONTOUR = num("MANGA_CONTOUR", 4);

function gaussian(src, w, h, sigma) {
  const r = Math.max(1, Math.ceil(sigma * 3));
  const k = new Float32Array(r * 2 + 1);
  let sum = 0;
  for (let i = -r; i <= r; i++) {
    k[i + r] = Math.exp(-(i * i) / (2 * sigma * sigma));
    sum += k[i + r];
  }
  for (let i = 0; i < k.length; i++) k[i] /= sum;

  const tmp = new Float32Array(w * h);
  const out = new Float32Array(w * h);
  for (let y = 0; y < h; y++) {
    for (let x = 0; x < w; x++) {
      let a = 0;
      for (let i = -r; i <= r; i++) {
        const nx = Math.min(w - 1, Math.max(0, x + i));
        a += src[y * w + nx] * k[i + r];
      }
      tmp[y * w + x] = a;
    }
  }
  for (let y = 0; y < h; y++) {
    for (let x = 0; x < w; x++) {
      let a = 0;
      for (let i = -r; i <= r; i++) {
        const ny = Math.min(h - 1, Math.max(0, y + i));
        a += tmp[ny * w + x] * k[i + r];
      }
      out[y * w + x] = a;
    }
  }
  return out;
}

/** Median of a square window. Flattens skin grain and JPEG mosquito noise
 *  without softening the edges the pen pass is about to trace, which a plain
 *  blur would. */
function median(src, w, h, r) {
  const out = new Float32Array(w * h);
  const buf = [];
  for (let y = 0; y < h; y++) {
    for (let x = 0; x < w; x++) {
      buf.length = 0;
      for (let dy = -r; dy <= r; dy++) {
        for (let dx = -r; dx <= r; dx++) {
          const nx = Math.min(w - 1, Math.max(0, x + dx));
          const ny = Math.min(h - 1, Math.max(0, y + dy));
          buf.push(src[ny * w + nx]);
        }
      }
      buf.sort((a, b) => a - b);
      out[y * w + x] = buf[buf.length >> 1];
    }
  }
  return out;
}

async function main() {
  const meta = await sharp(SRC).metadata();
  const fx0 = BOX.x;
  const fy0 = BOX.y;
  const extract = {
    left: Math.round(BOX.x * meta.width),
    top: Math.round(BOX.y * meta.height),
    width: Math.round(BOX.w * meta.width),
    height: Math.round(BOX.h * meta.height),
  };

  const { data } = await sharp(SRC)
    .extract(extract)
    .resize(OUT_W, OUT_H, { fit: "fill", kernel: "lanczos3" })
    .removeAlpha()
    .raw()
    .toBuffer({ resolveWithObject: true });

  const w = OUT_W;
  const h = OUT_H;
  const n = w * h;

  // Subject only, using the same authored silhouette as the ASCII portrait,
  // mapped from source-frame fractions into this crop.
  const keep = new Uint8Array(n);
  const lum = new Float32Array(n);
  for (let y = 0; y < h; y++) {
    for (let x = 0; x < w; x++) {
      const i = y * w + x;
      const sx = fx0 + ((x + 0.5) / w) * BOX.w;
      const sy = fy0 + ((y + 0.5) / h) * BOX.h;
      const r = data[i * 3];
      const g = data[i * 3 + 1];
      const b = data[i * 3 + 2];
      if (inSilhouette(sx, sy) && !(g > r + 3)) keep[i] = 1;
      lum[i] = (0.2126 * r + 0.7152 * g + 0.0722 * b) / 255;
    }
  }

  // Autolevels over the subject, so the zone edges mean the same thing
  // whatever the exposure was.
  const vals = [];
  for (let i = 0; i < n; i++) if (keep[i]) vals.push(lum[i]);
  vals.sort((a, b) => a - b);
  const lo = vals[Math.floor(vals.length * 0.02)];
  const hi = vals[Math.floor(vals.length * 0.985)];
  const span = Math.max(hi - lo, 1e-3);
  for (let i = 0; i < n; i++) {
    lum[i] = Math.min(1, Math.max(0, (lum[i] - lo) / span));
  }

  // The window is a direct trade. Narrow, and the hair posterises into blotches
  // instead of one solid mass; wide, and the eyes and the bridge of the nose
  // are averaged away entirely. 4px at this size is where both survive.
  const flat = median(lum, w, h, Math.max(2, Math.round((OUT_W / 720) * 4)));

  if (process.env.MANGA_HIST) {
    const bins = new Array(10).fill(0);
    let tot = 0;
    for (let i = 0; i < n; i++) {
      if (!keep[i]) continue;
      bins[Math.min(9, Math.floor(flat[i] * 10))]++;
      tot++;
    }
    console.log("subject luminance histogram");
    bins.forEach((c, b) =>
      console.log(
        `  ${(b / 10).toFixed(1)}-${((b + 1) / 10).toFixed(1)} ${((100 * c) / tot).toFixed(1).padStart(5)}%  ${"#".repeat(Math.round((60 * c) / tot))}`,
      ),
    );
  }

  // 1. zones
  const density = new Float32Array(n);
  for (let i = 0; i < n; i++) {
    for (const z of ZONES) {
      if (flat[i] > z.above) {
        density[i] = z.density;
        break;
      }
    }
  }

  // 2. screentone
  const cos = Math.cos(ANGLE);
  const sin = Math.sin(ANGLE);
  const ink = new Float32Array(n);
  for (let y = 0; y < h; y++) {
    for (let x = 0; x < w; x++) {
      const i = y * w + x;
      const d = density[i];
      if (d <= 0) continue;
      if (d >= 1) {
        ink[i] = 1;
        continue;
      }
      const u = (x * cos + y * sin) / PITCH;
      const v = (-x * sin + y * cos) / PITCH;
      const du = u - Math.floor(u) - 0.5;
      const dv = v - Math.floor(v) - 0.5;
      // Dot AREA is the density, so the radius goes as its square root.
      const radius = Math.sqrt(d / Math.PI) * 1.02;
      const dist = Math.hypot(du, dv);
      // One pixel of softness on the dot edge, so the tone does not alias.
      ink[i] = Math.min(1, Math.max(0, (radius - dist) * PITCH + 0.5));
    }
  }

  // 3. XDoG pen over the top
  const g1 = gaussian(flat, w, h, SIGMA);
  const g2 = gaussian(flat, w, h, SIGMA * K);
  for (let i = 0; i < n; i++) {
    if (g1[i] - g2[i] < -PEN) ink[i] = 1;
  }

  // 4. The contour. The silhouette is an authored polygon, so its edge is
  // smoother than real hair; left bare it reads as a cut-out. Inked as a
  // single confident outline it reads as what it now is, a drawn contour,
  // which is how the boundary of a manga figure is made anyway.
  const R = Math.max(2, Math.round((OUT_W / 720) * CONTOUR));
  for (let y = 0; y < h; y++) {
    for (let x = 0; x < w; x++) {
      const i = y * w + x;
      if (!keep[i]) continue;
      let edge = false;
      for (let dy = -R; dy <= R && !edge; dy++) {
        for (let dx = -R; dx <= R; dx++) {
          if (dx * dx + dy * dy > R * R) continue;
          const nx = x + dx;
          const ny = y + dy;
          if (nx < 0 || ny < 0 || nx >= w || ny >= h || !keep[ny * w + nx]) {
            edge = true;
            break;
          }
        }
      }
      if (edge) ink[i] = 1;
    }
  }

  const out = Buffer.alloc(n * 4);
  const INK = [0x12, 0x35, 0x28]; // --mg-pine
  for (let i = 0; i < n; i++) {
    const a = keep[i] ? Math.min(1, Math.max(0, ink[i])) : 0;
    out[i * 4] = INK[0];
    out[i * 4 + 1] = INK[1];
    out[i * 4 + 2] = INK[2];
    out[i * 4 + 3] = Math.round(a * 255);
  }

  await sharp(out, { raw: { width: w, height: h, channels: 4 } })
    .png({ compressionLevel: 9 })
    .toFile(OUT);

  let subject = 0;
  let inked = 0;
  for (let i = 0; i < n; i++) {
    if (!keep[i]) continue;
    subject++;
    if (ink[i] > 0.5) inked++;
  }
  console.log(
    `wrote ${path.relative(ROOT, OUT)} ${w}x${h}  subject ${((100 * subject) / n).toFixed(1)}%  ink ${((100 * inked) / subject).toFixed(1)}% of subject`,
  );
}

await main();
