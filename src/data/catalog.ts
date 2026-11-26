/**
 * Static catalog for the runway: products, looks, pins and UI copy.
 * Brand: Low & Slow, Chicano lowrider streetwear from East LA, presented as
 * a single red room where the six looks stand in one line-up.
 * Visible copy is French; identifiers stay in English.
 */

export const BRAND = "Low & Slow";
export const SECTION_ID = "low-and-slow-runway";

export type ProductId =
  | "moto-jacket-stripes"
  | "trouser-charcoal"
  | "sneaker-black"
  | "blazer-brown"
  | "jean-raw-wide"
  | "boot-pointed"
  | "varsity-jacket"
  | "trouser-black-wide"
  | "sneaker-cream"
  | "coat-leather-long"
  | "trouser-taupe"
  | "loafer-black"
  | "moto-jacket-cropped"
  | "cargo-black"
  | "boot-platform"
  | "bomber-suede"
  | "carpenter-ecru"
  | "boot-tan";

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

let variantSeed = 12400;

function product(
  id: ProductId,
  name: string,
  detail: string,
  short: string,
  kind: Product["kind"],
  price: number,
): Product {
  return {
    id,
    name,
    detail,
    short,
    price,
    kind,
    variants: SIZES[kind].map((value) => ({ id: ++variantSeed, a: true, o: [value] })),
    url: `#piece-${id}`,
    // Square thumbnails cut out of the model images; replace with real product shots.
    image: { src: `/pieces/${id}.png`, height: 400, sheetHeight: 160 },
  };
}

export const products: Record<ProductId, Product> = {
  "moto-jacket-stripes": product("moto-jacket-stripes", "Blouson cuir à bandes", "Noir, deux bandes crème", "Blouson", "apparel", 220),
  "trouser-charcoal": product("trouser-charcoal", "Pantalon anthracite", "Large, à pinces", "Pinces", "bottom", 95),
  "sneaker-black": product("sneaker-black", "Baskets cuir noires", "Semelle épaisse, unies", "Baskets", "shoe", 120),
  "blazer-brown": product("blazer-brown", "Blazer cuir chocolat", "Coupe oversize", "Blazer", "apparel", 240),
  "jean-raw-wide": product("jean-raw-wide", "Jean large brut", "Taille haute, pli marqué", "Denim", "bottom", 85),
  "boot-pointed": product("boot-pointed", "Bottines pointues", "Cuir noir", "Bottines", "shoe", 150),
  "varsity-jacket": product("varsity-jacket", "Blouson teddy", "Laine noire, manches crème", "Teddy", "apparel", 180),
  "trouser-black-wide": product("trouser-black-wide", "Pantalon noir large", "Coupe tailleur", "Tailleur", "bottom", 90),
  "sneaker-cream": product("sneaker-cream", "Baskets cuir crème", "Tige basse, unies", "Baskets", "shoe", 110),
  "coat-leather-long": product("coat-leather-long", "Manteau long en cuir", "Noir, sous le genou", "Manteau", "apparel", 320),
  "trouser-taupe": product("trouser-taupe", "Pantalon taupe", "Taille haute, double pince", "Pinces", "bottom", 95),
  "loafer-black": product("loafer-black", "Mocassins en cuir", "Noirs, cuir ciré", "Mocassins", "shoe", 140),
  "moto-jacket-cropped": product("moto-jacket-cropped", "Blouson moto court", "Noir et crème", "Moto", "apparel", 190),
  "cargo-black": product("cargo-black", "Cargo noir large", "Poches plaquées", "Cargo", "bottom", 95),
  "boot-platform": product("boot-platform", "Bottes à plateforme", "Cuir noir, semelle crantée", "Bottes", "shoe", 160),
  "bomber-suede": product("bomber-suede", "Blouson en daim", "Chocolat, col chemise", "Daim", "apparel", 230),
  "carpenter-ecru": product("carpenter-ecru", "Pantalon charpentier", "Écru, coupe large", "Charpentier", "bottom", 80),
  "boot-tan": product("boot-tan", "Boots à lacets", "Cuir camel, semelle crantée", "Boots", "shoe", 150),
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
  return { src: `/looks/look-${n}.png`, srcLarge: `/looks/look-${n}.png` };
}

/** [piece, pin left %, pin top %], measured on that look's image. */
type Pin = [ProductId, number, number];

/** Top, bottom, shoes. */
function pins(top: Pin, bottom: Pin, shoes: Pin, tagTop?: string): LookItem[] {
  return [top, bottom, shoes].map(([id, left, y], i) => ({
    product: id,
    pin: { left, top: y },
    tag: i === 0 ? tagTop : undefined,
  }));
}

export const looks: Look[] = [
  {
    key: "whittier",
    name: "Whittier Boulevard",
    description: "Blouson cuir à bandes crème, pantalon anthracite, baskets noires.",
    model: model(1),
    items: pins(["moto-jacket-stripes", 63, 29], ["trouser-charcoal", 42, 62], ["sneaker-black", 68, 92]),
  },
  {
    key: "elysian",
    name: "Elysian Park",
    description: "Blazer en cuir chocolat sur un jean brut très large.",
    model: model(2),
    items: pins(["blazer-brown", 67, 27], ["jean-raw-wide", 43, 62], ["boot-pointed", 81, 95], "Nouveau"),
  },
  {
    key: "chrome",
    name: "Chrome",
    description: "Teddy noir et crème, pantalon noir large, baskets crème.",
    model: model(3),
    items: pins(["varsity-jacket", 35, 31], ["trouser-black-wide", 40, 62], ["sneaker-cream", 39, 93], "Nouveau"),
  },
  {
    key: "veterano",
    name: "Veterano",
    description: "Manteau long en cuir, pantalon taupe à pinces, mocassins cirés.",
    model: model(4),
    items: pins(["coat-leather-long", 27, 34], ["trouser-taupe", 52, 62], ["loafer-black", 55, 93]),
  },
  {
    key: "hydraulics",
    name: "Hydraulics",
    description: "Blouson moto court, cargo noir large, bottes à plateforme.",
    model: model(5),
    items: pins(["moto-jacket-cropped", 33, 30], ["cargo-black", 42, 60], ["boot-platform", 28, 95]),
  },
  {
    key: "sunset-cruise",
    name: "Sunset Cruise",
    description: "Blouson en daim, pantalon charpentier écru, boots camel.",
    model: model(6),
    items: pins(["bomber-suede", 32, 29], ["carpenter-ecru", 42, 62], ["boot-tan", 63, 93]),
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
  pageTitle: "Low & Slow - Six silhouettes",
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
  bundleNote: (n: number) => `Les ${n} pièces ensemble : -10 %`,
  ctaAdd: "Prendre la tenue complète",
  ctaMobile: (price: string) => `Prendre la tenue - ${price}`,
  ctaDone: "La tenue complète est dans ton sac",
  msgChoose: "Choisis une taille pour : [items]",
  msgError: "Impossible de mettre dans le sac. Réessaie.",
  msgSoldOut: "Épuisé",
};
