/**
 * Static catalog for the runway: products, looks, pins and UI copy.
 * Brand: Low & Slow, a 1990s West Coast (Los Angeles) streetwear label,
 * presented as a swap meet stand. Visible copy is French; identifiers stay in English.
 */

export const BRAND = "Low & Slow";
export const SECTION_ID = "low-and-slow-runway";

/**
 * Flip to `true` once the AI-generated images are in `public/looks/` and
 * `public/pieces/` (file names: see docs/prompts-images.md). Until then the
 * runway uses the original demo cut-outs as stand-ins.
 */
export const ASSETS_READY = false;

const DEMO_BASE = "https://reel-ref-try-the-look.vercel.app/assets";

export type ProductId =
  | "flannel-navy"
  | "tee-xxl-white"
  | "work-pant-khaki"
  | "work-short-black"
  | "baggy-denim-raw"
  | "satin-jacket-black"
  | "wool-overshirt-check"
  | "jersey-mesh-gold"
  | "hoodie-black"
  | "court-white"
  | "court-black"
  | "canvas-slip-on";

export interface Variant {
  id: number;
  /** Available for sale. */
  a: boolean;
  /** Option values (single option here). */
  o: [string];
}

export interface Product {
  id: ProductId;
  name: string;
  /** Short detail line (colour, cut). */
  detail: string;
  /** Short label written on the price star. */
  short: string;
  price: number;
  kind: "shoe" | "apparel" | "bottom";
  variants: Variant[];
  url: string;
  image: { src: string; height: number; sheetHeight: number };
}

const SIZES: Record<Product["kind"], string[]> = {
  shoe: ["40", "41", "42", "43", "44", "45", "46"],
  apparel: ["S", "M", "L", "XL", "XXL"],
  bottom: ["30", "32", "34", "36", "38"],
};

/** Demo stand-in per kind, used until ASSETS_READY. */
const DEMO_IMAGE: Record<Product["kind"], { file: string; height: number; sheetHeight: number }[]> = {
  apparel: [
    { file: "source-hoodie-black.webp", height: 536, sheetHeight: 214 },
    { file: "source-sweatshirt.webp", height: 581, sheetHeight: 232 },
    { file: "source-hoodie.webp", height: 555, sheetHeight: 222 },
  ],
  bottom: [{ file: "source-tshirt.webp", height: 563, sheetHeight: 225 }],
  shoe: [
    { file: "source-tatum-5-orbit.webp", height: 400, sheetHeight: 160 },
    { file: "source-tatum-5-orbit-copy.webp", height: 400, sheetHeight: 160 },
    { file: "source-air-jordan-12-retro-copy.webp", height: 400, sheetHeight: 160 },
  ],
};

let variantSeed = 9100;
let demoTurn = 0;

function product(
  id: ProductId,
  name: string,
  detail: string,
  short: string,
  kind: Product["kind"],
  price: number,
): Product {
  const demos = DEMO_IMAGE[kind];
  const demo = demos[demoTurn++ % demos.length];
  return {
    id,
    name,
    detail,
    short,
    price,
    kind,
    variants: SIZES[kind].map((value) => ({ id: ++variantSeed, a: true, o: [value] })),
    url: `#piece-${id}`,
    image: ASSETS_READY
      ? { src: `/pieces/${id}.png`, height: 500, sheetHeight: 200 }
      : { src: `${DEMO_BASE}/${demo.file}`, height: demo.height, sheetHeight: demo.sheetHeight },
  };
}

export const products: Record<ProductId, Product> = {
  "flannel-navy": product("flannel-navy", "Chemise flanelle", "Carreaux bleu nuit, boutonnée en haut", "Flanelle", "apparel", 48),
  "tee-xxl-white": product("tee-xxl-white", "Tee XXL blanc", "Coton épais, coupe longue", "Tee XXL", "apparel", 28),
  "work-pant-khaki": product("work-pant-khaki", "Pantalon de travail", "Khaki, coupe large, pli marqué", "Work pant", "bottom", 42),
  "work-short-black": product("work-short-black", "Short de travail long", "Noir, sous le genou", "Short", "bottom", 36),
  "baggy-denim-raw": product("baggy-denim-raw", "Denim baggy", "Brut, jambe très large", "Denim", "bottom", 58),
  "satin-jacket-black": product("satin-jacket-black", "Veste en satin", "Noir et or, col côtelé", "Satin", "apparel", 120),
  "wool-overshirt-check": product("wool-overshirt-check", "Surchemise en laine", "Grands carreaux gris et noir", "Laine", "apparel", 85),
  "jersey-mesh-gold": product("jersey-mesh-gold", "Maillot en mesh", "Or et noir, numéro 47", "Maillot", "apparel", 64),
  "hoodie-black": product("hoodie-black", "Sweat à capuche", "Noir, molleton lourd", "Hoodie", "apparel", 70),
  "court-white": product("court-white", "Baskets cuir blanches", "Tige basse, liseré rouge", "Baskets", "shoe", 90),
  "court-black": product("court-black", "Baskets cuir noires", "Tige basse, semelle blanche", "Baskets", "shoe", 90),
  "canvas-slip-on": product("canvas-slip-on", "Chaussons en toile", "Noirs, à porter avec chaussettes hautes", "Toile", "shoe", 45),
};

export interface LookItem {
  product: ProductId;
  pin: { left: number; top: number };
  tag?: string;
}

export interface Look {
  key: string;
  name: string;
  description: string;
  model: { src: string; srcLarge: string };
  items: LookItem[];
}

function model(n: number) {
  return ASSETS_READY
    ? { src: `/looks/look-${n}.png`, srcLarge: `/looks/look-${n}.png` }
    : { src: `${DEMO_BASE}/model-${n}-640.webp`, srcLarge: `${DEMO_BASE}/original-look-${n}.webp` };
}

/** Top, bottom, shoes: same pin layout for every look. */
function pins(top: ProductId, bottom: ProductId, shoes: ProductId, tagTop?: string): LookItem[] {
  return [
    { product: top, pin: { left: 50, top: 28 }, tag: tagTop },
    { product: bottom, pin: { left: 48, top: 62 } },
    { product: shoes, pin: { left: 45, top: 94 } },
  ];
}

export const looks: Look[] = [
  {
    key: "crenshaw",
    name: "Crenshaw Sunday",
    description: "Flanelle boutonnée jusqu’en haut, pantalon de travail large, baskets blanches.",
    model: model(1),
    items: pins("flannel-navy", "work-pant-khaki", "court-white"),
  },
  {
    key: "long-beach",
    name: "Long Beach Drive",
    description: "Tee XXL, short sous le genou, chaussettes montées et chaussons en toile.",
    model: model(2),
    items: pins("tee-xxl-white", "work-short-black", "canvas-slip-on", "Nouveau"),
  },
  {
    key: "slauson",
    name: "Slauson Swap",
    description: "Veste en satin noir et or sur un denim brut très large.",
    model: model(3),
    items: pins("satin-jacket-black", "baggy-denim-raw", "court-white", "Nouveau"),
  },
  {
    key: "whittier",
    name: "Whittier Cruise",
    description: "Surchemise en laine à grands carreaux, denim brut, baskets noires.",
    model: model(4),
    items: pins("wool-overshirt-check", "baggy-denim-raw", "court-black"),
  },
  {
    key: "inglewood",
    name: "Inglewood Court",
    description: "Maillot en mesh sur tee blanc, short long, baskets blanches.",
    model: model(5),
    items: pins("jersey-mesh-gold", "work-short-black", "court-white"),
  },
  {
    key: "compton",
    name: "Compton Night",
    description: "Tout en noir : capuche lourde, pantalon de travail, baskets noires.",
    model: model(6),
    items: pins("hoodie-black", "work-pant-khaki", "court-black"),
  },
];

/** Bundle saving shown in the panel (display only, the bag sums full prices). */
export const BUNDLE_DISCOUNT = 0.1;

export function lookTotals(look: Look) {
  const full = look.items.reduce((sum, item) => sum + products[item.product].price, 0);
  return { full, bundle: Math.round(full * (1 - BUNDLE_DISCOUNT) * 100) / 100 };
}

/** Variant id → product + selected value, used by the bag. */
export const variantIndex = new Map<number, { product: Product; value: string; available: boolean }>();
for (const p of Object.values(products)) {
  for (const v of p.variants) variantIndex.set(v.id, { product: p, value: v.o[0], available: v.a });
}

export const copy = {
  pageTitle: "Low & Slow — Le défilé du stand 47",
  pageDescription:
    "Six looks West Coast montés de la tête aux pieds, au stand 47 du swap meet. Glisse le long du portant et touche une étiquette pour voir la pièce.",
  title: "Sur le portant.",
  subtitle: "Six looks West Coast, montés de la tête aux pieds. Touche une étiquette pour voir la pièce.",
  stageLabel: "Le portant : utilise les flèches ou glisse pour changer de look",
  look: "Look",
  prev: "Look précédent",
  next: "Look suivant",
  autoplay: "Défilement automatique",
  cursorDrag: "Glisse",
  cursorView: "Voir",
  inThisLook: "Dans ce look",
  pieces: (n: number) => `${n} pièces`,
  viewLook: "Voir le look",
  close: "Fermer",
  lbHint: "Touche une étiquette pour voir la pièce",
  addToBag: "Mettre dans le sac",
  addToBagLabel: (name: string) => `Mettre dans le sac : ${name}`,
  addedLabel: (name: string) => `Dans le sac : ${name}`,
  shoeSize: "Pointure",
  size: "Taille",
  closeSizes: "Fermer le choix de taille",
  bundleTitle: "Prends le lot",
  bundleNote: (n: number) => `Les ${n} pièces ensemble : −10 %`,
  ctaAdd: "Prendre le look complet",
  ctaMobile: (price: string) => `Prendre le look — ${price}`,
  ctaDone: "Le look complet est dans ton sac",
  msgChoose: "Choisis une taille pour : [items]",
  msgError: "Impossible de mettre dans le sac. Réessaie.",
  msgSoldOut: "Épuisé",
};
