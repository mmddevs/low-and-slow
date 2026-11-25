# Images Low & Slow : prompts IA

Il faut **18 images** : 6 mannequins (un par look) et 12 pièces.
Les prompts sont en anglais, parce que les IA d'images (Midjourney, ChatGPT/DALL·E, Ideogram, Flux…) les suivent mieux.

## Règles pour que tout s'aligne

1. **Même cadrage pour les 6 mannequins.** Portrait vertical 9:16 (idéalement 1080 × 1920), corps entier de la tête aux pieds, de face, les pieds près du bas de l'image, une petite marge au-dessus de la tête. Les étiquettes de prix sont placées à environ 28 % de la hauteur (haut du corps), 62 % (pantalon ou short) et 94 % (chaussures).
2. **Fond uni gris clair**, puis **détourage** avec un outil de suppression d'arrière-plan (Photoroom, remove.bg, Canva…). Exporte en **PNG transparent**.
3. **Pas de logos ni de marques réelles** (Nike, Dickies, Pendleton, Starter…), pas de texte sur les vêtements sauf le « 47 » du maillot.
4. **Bandanas et accessoires en noir, gris ou motif neutre**, jamais en bleu ou rouge vif : ces couleurs sont associées aux gangs (Crips et Bloods), à éviter pour une boutique.
5. Garde **la même lumière** sur toutes les images : studio doux, venant d'en haut à gauche, ombres légères.

Ajoute à la fin de chaque prompt mannequin le bloc commun ci-dessous.

> **Bloc commun mannequin :** `full body fashion lookbook photo, head to toe, standing straight facing camera, relaxed confident pose, arms down or loosely crossed, feet near the bottom edge of the frame, small margin above the head, plain light grey seamless studio background, soft overhead studio light from upper left, gentle floor shadow, 1990s Los Angeles West Coast hip-hop streetwear, realistic photo, sharp focus, no logos, no brand names, no text, vertical 9:16`

## Les 6 mannequins → `public/looks/`

| Fichier | Look | Prompt |
|---|---|---|
| `look-1.png` | Crenshaw Sunday | `Young Black man, short hair, black paisley bandana folded as a headband, navy-and-black plaid flannel shirt buttoned all the way to the collar, crisp white t-shirt hem showing below, very wide khaki work pants with sharp front crease, clean white leather low-top sneakers with a thin red side stripe` + bloc commun |
| `look-2.png` | Long Beach Drive | `Young Latino man, buzz cut, thin moustache, oversized heavyweight plain white t-shirt reaching mid-thigh, long black work shorts falling below the knee, white tube socks pulled up high, black canvas slip-on shoes, thin silver chain` + bloc commun |
| `look-3.png` | Slauson Swap | `Young Black woman, braids pulled back, small gold hoop earrings, black and gold satin bomber jacket with ribbed collar and cuffs (no lettering), raw indigo extremely wide baggy jeans pooling over the shoes, clean white leather low-top sneakers with a thin red side stripe` + bloc commun |
| `look-4.png` | Whittier Cruise | `Young Mexican-American man, slicked-back hair, dark sunglasses pushed on top of his head, heavy wool overshirt in large grey and black buffalo check worn open over a white tank top, raw indigo extremely wide baggy jeans, black leather low-top sneakers with white soles` + bloc commun |
| `look-5.png` | Inglewood Court | `Young Black man, short twists, gold-and-black mesh basketball jersey with the number 47 only, worn over a white t-shirt, long black work shorts below the knee, white high socks, clean white leather low-top sneakers with a thin red side stripe` + bloc commun |
| `look-6.png` | Compton Night | `Young Black man, close fade haircut, plain black heavyweight hoodie with hood down, very wide khaki work pants with sharp crease, black leather low-top sneakers with white soles, small black beanie` + bloc commun |

## Les 12 pièces → `public/pieces/`

> **Bloc commun pièce :** `product photo of a single garment, flat lay or invisible mannequin, centered, front view, plain light grey studio background, soft even light, realistic fabric texture, no model, no logos, no brand names, no text, vertical 4:5`
> (Pour les chaussures, remplace la fin par : `single sneaker, side profile, centered, plain light grey studio background, soft even light, no logos, vertical 4:5`)

Comme pour les mannequins, détoure chaque image et exporte-la en PNG transparent, idéalement en 800 × 1000.

| Fichier | Pièce | Description à mettre au début du prompt |
|---|---|---|
| `flannel-navy.png` | Chemise flanelle | `navy and black plaid flannel shirt, buttoned to the collar` |
| `tee-xxl-white.png` | Tee XXL blanc | `oversized heavyweight plain white t-shirt, long cut` |
| `work-pant-khaki.png` | Pantalon de travail | `very wide khaki work pants with sharp front crease` |
| `work-short-black.png` | Short de travail long | `long black work shorts, knee length and below` |
| `baggy-denim-raw.png` | Denim baggy | `raw indigo extremely wide baggy jeans` |
| `satin-jacket-black.png` | Veste en satin | `black and gold satin bomber jacket with ribbed collar and cuffs` |
| `wool-overshirt-check.png` | Surchemise en laine | `heavy wool overshirt, large grey and black buffalo check` |
| `jersey-mesh-gold.png` | Maillot en mesh | `gold and black mesh basketball jersey with the number 47` |
| `hoodie-black.png` | Sweat à capuche | `plain black heavyweight hoodie` |
| `court-white.png` | Baskets cuir blanches | `white leather low-top sneaker with a thin red side stripe` |
| `court-black.png` | Baskets cuir noires | `black leather low-top sneaker with white sole` |
| `canvas-slip-on.png` | Chaussons en toile | `black canvas slip-on shoe with white sole` |

## Une fois les images prêtes

1. Place les 6 mannequins dans `public/looks/` et les 12 pièces dans `public/pieces/`, avec exactement les noms ci-dessus.
2. Dans `src/data/catalog.ts`, passe `ASSETS_READY` à `true`.
3. Si une étiquette de prix tombe à côté d'une pièce sur un mannequin, ajuste ses positions `pin` (en %) dans le look concerné.
