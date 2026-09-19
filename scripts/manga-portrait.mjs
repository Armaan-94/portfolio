/**
 * Prepare the manga panel portrait: assets/armaan2.png -> public/manga-portrait.png
 *
 * The source is a drawn illustration, black ink and screentone on white paper.
 * All this does is turn the paper into transparency and the ink into the
 * theme's own colour, so the drawing sits ON the panel rather than in a white
 * box pasted over it: the cream ground and the red tone sheet behind both read
 * through every dot of the halftone.
 *
 * This replaced a tone conversion of a photograph - posterised zones, a
 * generated halftone, an XDoG pen. That was a filter standing in for a drawing
 * because no drawing existed. One does now, so the filter is gone; there is
 * nothing to synthesise and the honest job is a colour space change.
 *
 * Alpha comes from luminance, which is exactly right for a bitonal drawing:
 * solid black becomes solid ink, a screentone dot becomes a dot, and the
 * hatching keeps its partial coverage instead of being thresholded away.
 */
import sharp from "sharp";
import path from "node:path";
import { fileURLToPath } from "node:url";

const ROOT = path.resolve(path.dirname(fileURLToPath(import.meta.url)), "..");
const SRC = path.join(ROOT, "assets/armaan2.png");
const OUT = path.join(ROOT, "public/manga-portrait.png");

const num = (k, d) => (process.env[k] ? Number(process.env[k]) : d);

/** --mg-pine, the theme's body ink. */
const INK = [0x12, 0x35, 0x28];

/** Output width. See the note in main(). */
const WIDTH = num("MANGA_W", 900);

/**
 * Coverage at or below which a pixel is paper, not ink.
 *
 * The scan's white is 253 to 254 rather than 255, and without a floor that
 * couple of levels becomes a uniform 1% wash of ink across the whole panel.
 * It is invisible on white and clearly dirty over cream.
 */
const FLOOR = num("MANGA_FLOOR", 0.06);

/** Gamma on the coverage. Below 1 thickens the mid greys, which keeps the
 *  finer hatching from thinning out once it is tinted rather than black. */
const GAMMA = num("MANGA_GAMMA", 0.92);

async function main() {
  // Downscaled before the conversion, not after. The panel renders at 15rem,
  // so 900px still covers a 3x display twice over, and resampling the halftone
  // while it is still grey is cleaner than resampling it once it has become
  // alpha. Full resolution costs a megabyte of PNG for no visible gain.
  const { data, info } = await sharp(SRC)
    .resize(WIDTH, null, { kernel: "lanczos3" })
    .removeAlpha()
    .raw()
    .toBuffer({ resolveWithObject: true });

  const n = info.width * info.height;
  const out = Buffer.alloc(n * 4);
  let inked = 0;

  for (let i = 0; i < n; i++) {
    const lum =
      (0.2126 * data[i * 3] +
        0.7152 * data[i * 3 + 1] +
        0.0722 * data[i * 3 + 2]) /
      255;
    let cover = 1 - lum;
    cover = cover <= FLOOR ? 0 : (cover - FLOOR) / (1 - FLOOR);
    cover = cover ** GAMMA;
    if (cover > 0.5) inked++;
    out[i * 4] = INK[0];
    out[i * 4 + 1] = INK[1];
    out[i * 4 + 2] = INK[2];
    out[i * 4 + 3] = Math.round(Math.min(1, Math.max(0, cover)) * 255);
  }

  await sharp(out, {
    raw: { width: info.width, height: info.height, channels: 4 },
  })
    .png({ compressionLevel: 9 })
    .toFile(OUT);

  console.log(
    `wrote ${path.relative(ROOT, OUT)} ${info.width}x${info.height}  ink ${((100 * inked) / n).toFixed(1)}% of frame`,
  );
}

await main();
