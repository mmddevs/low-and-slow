# Images Low & Slow : prompts IA

Il faut **21 images** : 6 mannequins (un par look) et 15 pièces.
Les prompts sont en anglais, parce que les IA d'images (Midjourney, ChatGPT/DALL·E, Ideogram, Flux…) les suivent mieux.

Le style est **lowrider chicano d'East LA**, la tenue du dimanche au car show : chemises en laine boutonnées en haut, pantalons au pli repassé, chemises de bowling, satin. Le casting est varié : deux femmes, un veterano d'une cinquantaine d'années et trois jeunes hommes.

## Règles pour que tout s'aligne

1. **Même cadrage pour les 6 mannequins.** Portrait vertical 9:16 (idéalement 1080 × 1920), corps entier de la tête aux pieds, de face, les pieds près du bas de l'image, une petite marge au-dessus de la tête. Les points des pièces sont placés à environ 28 % de la hauteur (haut du corps), 62 % (pantalon ou short) et 94 % (chaussures).
2. **Fond uni gris clair**, puis **détourage** avec un outil de suppression d'arrière-plan (Photoroom, remove.bg, Canva…). Exporte en **PNG transparent**. Le site pose ensuite le mannequin sur le fond rouge, dans la rangée.
3. **Pas de logos ni de marques réelles** (Pendleton, Dickies, Nike, Vans…). Seule exception : le mot « Low & Slow » brodé en script dans le dos de la veste en satin, s'il apparaît.
4. **Pas de signes de gang** : pas de bandana bleu ou rouge vif, pas de numéros de quartier, pas de gestes de la main. Ce sont des tenues de car show, pas de rue.
5. Garde **la même lumière** sur toutes les images : studio doux, venant d'en haut, ombres légères.

Ajoute à la fin de chaque prompt mannequin le bloc commun ci-dessous.

> **Bloc commun mannequin :** `full body fashion lookbook photo, head to toe, standing straight facing camera, calm proud pose, arms relaxed, feet near the bottom edge of the frame, small margin above the head, plain light grey seamless studio background, soft overhead studio light, gentle floor shadow, Chicano lowrider Sunday style from East Los Angeles, crisp pressed clothes, realistic photo, sharp focus, no logos, no brand names, no text, vertical 9:16`

## Les 6 mannequins → `public/looks/`

| Fichier | Look | Prompt |
|---|---|---|
| `look-1.png` | Whittier Boulevard | `Young Mexican-American man, short slicked-back hair, thin moustache, heavy wool shirt in grey and black check buttoned only at the top collar button, white ribbed tank top visible underneath, navy work pants with a sharp pressed crease, black leather low-top sneakers with a white side stripe` + bloc commun |
| `look-2.png` | Elysian Park | `Young Latina woman, dark hair pulled back tight, large gold hoop earrings, defined dark lip liner, oversized heavyweight plain white t-shirt tucked into high-waisted black pleated trousers with a sharp crease, white canvas slip-on shoes, white socks` + bloc commun |
| `look-3.png` | Candy Apple | `Young Black man, short fade haircut, small gold chain, wine-red burgundy satin bomber jacket with ribbed collar and cuffs, plain white tee underneath, wide sand-coloured chino trousers with a pressed crease, white leather low-top sneakers with a thin burgundy side stripe` + bloc commun |
| `look-4.png` | Veterano | `Mexican-American man in his fifties, grey goatee, black short-brim fedora hat, two-tone black and cream short-sleeve bowling shirt, high-waisted black pleated trousers with a sharp crease, polished black leather loafers, a watch` + bloc commun |
| `look-5.png` | Hydraulics | `Young Latina woman, long dark hair in a high ponytail, small hoop earrings, short black cropped Eisenhower-style work jacket with shirt collar, plain white crop top, raw indigo extremely wide baggy jeans, white leather low-top sneakers with a thin burgundy side stripe` + bloc commun |
| `look-6.png` | Sunset Cruise | `Young Mexican-American man, buzz cut, dark sunglasses, black short-sleeve camp collar shirt with a cream palm tree print worn open over a white tank top, long grey work shorts falling below the knee, white socks pulled up high, white canvas slip-on shoes` + bloc commun |

## Les 15 pièces → `public/pieces/`

> **Bloc commun pièce :** `product photo of a single garment, flat lay or invisible mannequin, centered, front view, plain light grey studio background, soft even light, realistic fabric texture, crisp pressed, no model, no logos, no brand names, no text, vertical 4:5`
> (Pour les chaussures, remplace la fin par : `single shoe, side profile, centered, plain light grey studio background, soft even light, no logos, vertical 4:5`)

Comme pour les mannequins, détoure chaque image et exporte-la en PNG transparent, idéalement en 800 × 1000.

| Fichier | Pièce | Description à mettre au début du prompt |
|---|---|---|
| `wool-shirt-check.png` | Chemise en laine | `heavy wool shirt, grey and black check, buttoned at the collar` |
| `tee-white-heavy.png` | Tee blanc épais | `oversized heavyweight plain white t-shirt` |
| `satin-jacket-wine.png` | Veste en satin | `wine-red burgundy satin bomber jacket with ribbed collar and cuffs` |
| `bowling-two-tone.png` | Chemise de bowling | `two-tone black and cream short-sleeve bowling shirt` |
| `ike-jacket-black.png` | Blouson court | `short black cropped Eisenhower-style work jacket with shirt collar` |
| `camp-shirt-palm.png` | Chemise à palmiers | `black short-sleeve camp collar shirt with cream palm tree print` |
| `work-pant-navy.png` | Pantalon de travail | `navy work pants with sharp pressed front crease` |
| `pleated-pant-black.png` | Pantalon taille haute | `high-waisted black pleated trousers with sharp crease` |
| `chino-sand.png` | Chino large | `wide sand-coloured chino trousers with pressed crease` |
| `baggy-denim-raw.png` | Denim baggy | `raw indigo extremely wide baggy jeans` |
| `work-short-grey.png` | Short long | `long grey work shorts, below-the-knee length` |
| `court-black.png` | Baskets cuir noires | `black leather low-top sneaker with a white side stripe` |
| `court-white.png` | Baskets cuir blanches | `white leather low-top sneaker with a thin burgundy side stripe` |
| `canvas-slip-white.png` | Chaussons en toile | `white canvas slip-on shoe` |
| `loafer-black.png` | Mocassins en cuir | `polished black leather penny loafer` |

## Une fois les images prêtes

1. Place les 6 mannequins dans `public/looks/` et les 15 pièces dans `public/pieces/`, avec exactement les noms ci-dessus.
2. Dans `src/data/catalog.ts`, passe `ASSETS_READY` à `true`.
3. Si un point tombe à côté d'une pièce sur un mannequin, ajuste ses positions `pin` (en %) dans le look concerné.
