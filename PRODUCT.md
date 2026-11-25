# Product

<!-- impeccable:product-schema 1 -->

## Platform

web

## Users

Visitors of a streetwear label's shop who want to see complete outfits worn head to toe before buying, mostly on mobile. They browse looks, isolate one, tap a piece to see it, and add pieces or the full look to the bag.

## Product Purpose

A "try the look" runway: six styled looks shown as full-body models, each with pinned pieces (top, bottom, shoes) and a full-look bundle at −10 %. Success: the visitor adds a full look to the bag.

## Positioning

Low & Slow, the label's own brand: Chicano lowrider streetwear from East Los Angeles, the pressed Sunday car show outfit. Presented as one red room where six looks stand in a line-up, the pieces on a shelf below (earlier iterations: swap meet in git history, a rejected gold "candy paint" car show). Not Nike: the previous Nike reference was the 21st.dev demo it was ported from.

## Capabilities and Constraints

- Next.js 16 App Router, Tailwind v4, GSAP + Motion. Runway controller in `src/lib/runway/controller.ts`, data in `src/data/catalog.ts`.
- Models are full-body cutouts, front-facing, transparent background, 640×1138 (plus a large variant). Product images are cutouts too.
- Bag is local (no checkout yet). Product links currently point to the demo Shopify store and must be replaced.
- UI copy is French.

## Brand Commitments

- Style binding: Chicano lowrider Sunday style (buttoned wool shirts, pressed work pants and pleated trousers, bowling shirts, satin jackets, loafers and canvas slip-ons). Cast includes women and an older veterano.
- Own label, no real brand names or logos (Nike, Dickies, etc.) in the shipped UI.
- No gang-affiliation insignia or territorial signs used as decoration.

## Evidence on Hand

- New model and product images: to be produced by the user with an image AI from the prompts in docs/prompts-images.md. Until then, placeholders. Do not present invented images as real products.
- Prices, product names and sizes: none confirmed for the new label; current values are demo values.
