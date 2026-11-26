/**
 * The rail under the line-up: the six jackets and coats of the looks.
 * Photos are described in docs/prompts-images.md.
 */
import type { RailGarment } from "@/components/ui/product-rail-gallery";
import { products, type ProductId } from "@/data/catalog";
import { formatMoney } from "@/lib/format";

/**
 * Ids whose photos are in `public/rail/<id>-front.webp` and `<id>-back.webp`.
 * New photos: drop PNGs there and run `node scripts/prepare-rail.mjs`.
 * Others stay drawn.
 */
const PHOTOGRAPHED: ProductId[] = [
  "moto-jacket-stripes",
  "blazer-brown",
  "varsity-jacket",
  "coat-leather-long",
  "moto-jacket-cropped",
  "bomber-suede",
];

type Drawing = Pick<RailGarment, "kind" | "color" | "trim" | "sleeveColor" | "stripe">;

const CREAM = "#e9dcc3";

const PIECES: [ProductId, Drawing][] = [
  ["moto-jacket-stripes", { kind: "jacket", color: "#1c1718", trim: "#c9bfb0", stripe: CREAM }],
  ["blazer-brown", { kind: "coat", color: "#46271c", trim: "#24130d" }],
  ["varsity-jacket", { kind: "jacket", color: "#1b181a", trim: CREAM, sleeveColor: CREAM }],
  ["coat-leather-long", { kind: "coat", color: "#171314", trim: "#3a3234" }],
  ["moto-jacket-cropped", { kind: "jacket", color: "#201b1c", trim: "#c9bfb0", sleeveColor: CREAM }],
  ["bomber-suede", { kind: "jacket", color: "#5d3722", trim: "#b9ada0" }],
];

export const railItems: (RailGarment & { id: ProductId })[] = PIECES.map(([id, drawing]) => {
  const p = products[id];
  const photos = PHOTOGRAPHED.includes(id)
    ? { image: `/rail/${id}-front.webp`, backImage: `/rail/${id}-back.webp` }
    : {};
  return {
    id,
    name: p.name,
    description: p.detail,
    tag: formatMoney(p.price),
    ...drawing,
    ...photos,
  };
});
