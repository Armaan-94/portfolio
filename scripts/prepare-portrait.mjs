#!/usr/bin/env node
/**
 * Crops the served portrait out of the original photograph.
 *
 *   npm run portrait
 *
 * The original is a close outdoor selfie in which the head sits low and right
 * and runs off two edges of the frame. Dropped into a square or 4:5 container
 * unmodified, object-fit shows mostly forest with a small face in one corner,
 * and no amount of object-position fixes it, because a square source in a
 * square container has nothing to reposition. So the crop happens once here,
 * at the asset, and every theme can then just center the image.
 *
 * The uncropped original stays in assets/ rather than public/: it is the input
 * to this script and to the ASCII prebake, and nothing should serve it.
 */
import sharp from "sharp";

const SRC = "assets/portrait-source.jpg";
const OUT = "public/portrait.jpg";

// Read off a coordinate grid rendered over the source. The head centres near
// (0.70, 0.58); the box is pushed right and down as far as the frame allows.
const BOX = { cx: 0.70, cy: 0.61, side: 0.60 };

const m = await sharp(SRC).metadata();
const side = Math.round(BOX.side * Math.min(m.width, m.height));
const left = Math.max(0, Math.min(m.width - side, Math.round(BOX.cx * m.width - side / 2)));
const top = Math.max(0, Math.min(m.height - side, Math.round(BOX.cy * m.height - side / 2)));

await sharp(SRC)
  .extract({ left, top, width: side, height: side })
  .resize(640, 640, { kernel: "lanczos3" })
  .jpeg({ quality: 86, mozjpeg: true })
  .toFile(OUT);

console.log(`wrote ${OUT}  from ${left},${top} ${side}x${side} of ${m.width}x${m.height}`);
