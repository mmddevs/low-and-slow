/**
 * Static catalog for the runway: products, looks, pins and UI copy.
 * Brand: Low & Slow, Chicano lowrider streetwear from East LA, presented as
 * a single red room where the six looks stand in one line-up.
 * Visible copy is French; identifiers stay in English.
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
  | "wool-shirt-check"
  | "tee-white-heavy"
  | "satin-jacket-wine"
  | "bowling-two-tone"
  | "ike-jacket-black"
  | "camp-shirt-palm"
  | "work-pant-navy"
  | "pleated-pant-black"
  | "chino-sand"
  | "baggy-denim-raw"
  | "work-short-grey"
  | "court-black"
  | "court-white"
  | "canvas-slip-white"
  | "loafer-black";

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
  /** Short label engraved on the plaque. */
  short: string;
  price: number;
  kind: "shoe" | "apparel" | "bottom";
  variants: Variant[];
  url: string;
  image: { src: string; height: number; sheetHeight: number };
}

const SIZES: Record<Product["kind"], string[]> = {
  shoe: ["36", "38", "40", "41", "42", "43", "44", "45"],
  apparel: ["XS", "S", "M", "L", "XL", "XXL"],
  bottom: ["26", "28", "30", "32", "34", "36", "38"],
};

/** Demo stand-in per kind, used until ASSETS_READY. */
const DEMO_IMAGE: Record<Product["kind"], { file: string; height: number; sheetHeight: number }[]> = {
  apparel: [
    { file: "source-hoodie-black.webp", height: 536, sheetHeight: 214 },
    { file: "source-sweatshirt.webp", height: 581, sheetHeight: 232 },
    { file: "source-hoodie.webp", height: 555, sheetHeight: 222 },
    { file: "source-sweatshirt-plus.webp", height: 610, sheetHeight: 244 },
  ],
  bottom: [{ file: "source-tshirt.webp", height: 563, sheetHeight: 225 }],
  shoe: [
    { file: "source-tatum-5-orbit.webp", height: 400, sheetHeight: 160 },
    { file: "source-tatum-5-orbit-copy.webp", height: 400, sheetHeight: 160 },
    { file: "source-air-jordan-12-retro-copy.webp", height: 400, sheetHeight: 160 },
  ],
};

let variantSeed = 12400;
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
  "wool-shirt-check": product("wool-shirt-check", "Chemise en laine", "Carreaux gris et noir, boutonnée en haut", "Laine", "apparel", 85),
  "tee-white-heavy": product("tee-white-heavy", "Tee blanc épais", "Coton lourd, coupe ample, à rentrer", "Tee", "apparel", 28),
  "satin-jacket-wine": product("satin-jacket-wine", "Veste en satin", "Bordeaux, script brodé dans le dos", "Satin", "apparel", 120),
  "bowling-two-tone": product("bowling-two-tone", "Chemise de bowling", "Bicolore noir et crème, manches courtes", "Bowling", "apparel", 68),
  "ike-jacket-black": product("ike-jacket-black", "Blouson court", "Noir, coupe Eisenhower, col chemise", "Blouson", "apparel", 95),
  "camp-shirt-palm": product("camp-shirt-palm", "Chemise à palmiers", "Noire, imprimé palmiers crème", "Palmiers", "apparel", 56),
  "work-pant-navy": product("work-pant-navy", "Pantalon de travail", "Bleu marine, pli repassé", "Work pant", "bottom", 42),
  "pleated-pant-black": product("pleated-pant-black", "Pantalon taille haute", "Noir, à pinces, pli repassé", "Pinces", "bottom", 74),
  "chino-sand": product("chino-sand", "Chino large", "Sable, pli repassé", "Chino", "bottom", 52),
  "baggy-denim-raw": product("baggy-denim-raw", "Denim baggy", "Brut, jambe très large", "Denim", "bottom", 58),
  "work-short-grey": product("work-short-grey", "Short long", "Gris, sous le genou", "Short", "bottom", 36),
  "court-black": product("court-black", "Baskets cuir noires", "Tige basse, bande blanche", "Baskets", "shoe", 90),
  "court-white": product("court-white", "Baskets cuir blanches", "Tige basse, bande bordeaux", "Baskets", "shoe", 90),
  "canvas-slip-white": product("canvas-slip-white", "Chaussons en toile", "Blancs, avec chaussettes hautes", "Toile", "shoe", 45),
  "loafer-black": product("loafer-black", "Mocassins en cuir", "Noirs, cuir ciré", "Mocassins", "shoe", 110),
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
    key: "whittier",
    name: "Whittier Boulevard",
    description: "Chemise en laine boutonnée en haut, pantalon marine au pli net, baskets noires.",
    model: model(1),
    items: pins("wool-shirt-check", "work-pant-navy", "court-black"),
  },
  {
    key: "elysian",
    name: "Elysian Park",
    description: "Tee blanc rentré dans un pantalon taille haute, chaussons en toile.",
    model: model(2),
    items: pins("tee-white-heavy", "pleated-pant-black", "canvas-slip-white", "Nouveau"),
  },
  {
    key: "candy-apple",
    name: "Candy Apple",
    description: "Veste en satin bordeaux, chino sable, baskets blanches.",
    model: model(3),
    items: pins("satin-jacket-wine", "chino-sand", "court-white", "Nouveau"),
  },
  {
    key: "veterano",
    name: "Veterano",
    description: "Chemise de bowling, pantalon à pinces, mocassins cirés. La tenue du dimanche.",
    model: model(4),
    items: pins("bowling-two-tone", "pleated-pant-black", "loafer-black"),
  },
  {
    key: "hydraulics",
    name: "Hydraulics",
    description: "Blouson court noir sur un denim brut très large.",
    model: model(5),
    items: pins("ike-jacket-black", "baggy-denim-raw", "court-white"),
  },
  {
    key: "sunset-cruise",
    name: "Sunset Cruise",
    description: "Chemise à palmiers, short long, chaussettes hautes et toile blanche.",
    model: model(6),
    items: pins("camp-shirt-palm", "work-short-grey", "canvas-slip-white"),
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
  pageTitle: "Low & Slow — Six silhouettes",
  pageDescription:
    "Six silhouettes lowrider d’East LA, alignées de la tête aux pieds. Fais défiler la rangée et touche un point pour voir la pièce.",
  title: "Six silhouettes",
  subtitle: "Lowrider, d’East LA. Touche un point pour voir la pièce.",
  stageLabel: "La rangée : utilise les flèches ou glisse pour changer de silhouette",
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
  lbHint: "Touche un point pour voir la pièce",
  addToBag: "Mettre dans le sac",
  addToBagLabel: (name: string) => `Mettre dans le sac : ${name}`,
  addedLabel: (name: string) => `Dans le sac : ${name}`,
  shoeSize: "Pointure",
  size: "Taille",
  closeSizes: "Fermer le choix de taille",
  bundleTitle: "Prends la tenue",
  bundleNote: (n: number) => `Les ${n} pièces ensemble : −10 %`,
  ctaAdd: "Prendre la tenue complète",
  ctaMobile: (price: string) => `Prendre la tenue — ${price}`,
  ctaDone: "La tenue complète est dans ton sac",
  msgChoose: "Choisis une taille pour : [items]",
  msgError: "Impossible de mettre dans le sac. Réessaie.",
  msgSoldOut: "Épuisé",
};
