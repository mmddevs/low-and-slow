// Puts the rail photos on a shared 200 × 310 canvas (collar at the top, front and
// back at one scale) and writes light WebP files next to the PNG sources, which
// can then be deleted.
// Run after adding or replacing photos: node scripts/prepare-rail.mjs
import { existsSync } from "node:fs";
import sharp from "sharp";

const W = 600;
const H = 930;
const TOP = 24; // collar height under the hanger hook
const MAX_W = 590;

/** Garment height on the canvas, so a coat hangs longer than a cropped jacket. */
const HEIGHT = {
  "moto-jacket-stripes": 590,
  "blazer-brown": 690,
  "varsity-jacket": 590,
  "coat-leather-long": 850,
  "moto-jacket-cropped": 520,
  "bomber-suede": 575,
};

for (const [id, height] of Object.entries(HEIGHT)) {
  for (const side of ["front", "back"]) {
    const source = `public/rail/${id}-${side}.png`;
    if (!existsSync(source)) continue;
    const trimmed = await sharp(source).trim({ threshold: 10 }).toBuffer();
    const garment = await sharp(trimmed)
      .resize({ width: MAX_W, height, fit: "inside" })
      .toBuffer({ resolveWithObject: true });
    await sharp({ create: { width: W, height: H, channels: 4, background: "#00000000" } })
      .composite([{ input: garment.data, left: Math.round((W - garment.info.width) / 2), top: TOP }])
      .webp({ quality: 86, alphaQuality: 90 })
      .toFile(`public/rail/${id}-${side}.webp`);
  }
}
