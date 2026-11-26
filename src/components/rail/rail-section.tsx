"use client";
/* eslint-disable @next/next/no-img-element -- transparent cut-outs */

import { Fragment, useState } from "react";
import ClothingRailHero from "@/components/ui/product-rail-gallery";
import { copy, looks, products, type ProductId } from "@/data/catalog";
import { railItems } from "@/data/rail";
import { bag } from "@/lib/bag/store";
import { formatMoney } from "@/lib/format";

const LABELS = { front: "Face", back: "Dos", close: "Fermer", show: "Voir" };

const lookOf = (id: ProductId) => looks.find((look) => look.items.some((item) => item.product === id));

/** The model wearing the lifted piece. */
function WornBy({ id }: { id: ProductId }) {
  const look = lookOf(id);
  if (!look) return null;
  return (
    <figure className="m-0 flex flex-col items-center gap-3 text-center">
      <img src={look.model.src} alt={`${products[id].name} porté dans le look ${look.name}`} width={576} height={1024} className="h-[min(64vh,600px)] w-auto max-w-full object-contain" />
      <figcaption className="flex flex-col gap-1">
        <span className="text-3xl leading-none font-black uppercase font-stretch-extra-condensed">{look.name}</span>
        <span className="max-w-[30ch] text-[13px] leading-relaxed text-muted-foreground">{look.description}</span>
      </figcaption>
    </figure>
  );
}

/** One of the other pieces of the outfit, with its own size choice. */
function OutfitRow({ id }: { id: ProductId }) {
  const p = products[id];
  const [variant, setVariant] = useState("");
  const [message, setMessage] = useState("");

  async function add() {
    if (!variant) {
      setMessage("Choisis d’abord une taille.");
      return;
    }
    try {
      await bag.add([{ id: Number(variant), quantity: 1 }]);
      setMessage("Dans le sac");
    } catch {
      setMessage(copy.msgError);
    }
  }

  return (
    <li className="grid grid-cols-[56px_minmax(0,1fr)] items-center gap-3 border-t border-border py-3 text-left">
      <img src={p.image.src} alt="" width={56} height={56} className="size-14 rounded-xl bg-cream" />
      <div className="flex min-w-0 flex-col gap-1.5">
        <p className="m-0 flex justify-between gap-3 text-[13px] font-bold">
          <span>{p.name}</span>
          <span className="whitespace-nowrap tabular-nums">{formatMoney(p.price)}</span>
        </p>
        <div className="flex flex-wrap items-center gap-2">
          <select
            aria-label={`${p.kind === "shoe" ? copy.shoeSize : copy.size} : ${p.name}`}
            value={variant}
            onChange={(e) => {
              setVariant(e.target.value);
              setMessage("");
            }}
            className="min-h-11 cursor-pointer rounded-full border-[1.5px] border-border bg-red-dk px-3 text-[13px] font-bold text-cream"
          >
            <option value="">{p.kind === "shoe" ? copy.shoeSize : copy.size}</option>
            {p.variants.map((v) => (
              <option key={v.id} value={v.id} disabled={!v.a}>
                {v.o[0]}
              </option>
            ))}
          </select>
          <button
            type="button"
            onClick={add}
            aria-label={copy.addToBagLabel(p.name)}
            className="min-h-11 cursor-pointer rounded-full border-[1.5px] border-cream px-4 text-xs font-extrabold tracking-[.12em] uppercase transition-colors hover:bg-cream hover:text-red-dk"
          >
            Ajouter
          </button>
          <span role="status" className="text-xs font-medium">
            {message}
          </span>
        </div>
      </div>
    </li>
  );
}

function CompleteOutfit({ id }: { id: ProductId }) {
  const others = lookOf(id)?.items.filter((item) => item.product !== id) ?? [];
  if (!others.length) return null;
  return (
    <div className="mt-2 w-full">
      <h4 className="m-0 mb-2 text-left text-2xl font-black uppercase font-stretch-extra-condensed">Complète la tenue</h4>
      <ul className="m-0 list-none p-0">
        {others.map((item) => (
          <OutfitRow key={item.product} id={item.product} />
        ))}
      </ul>
    </div>
  );
}

/** Size choice and add to bag, shown beside the lifted piece. */
function AddPiece({ id }: { id: ProductId }) {
  const p = products[id];
  const [variant, setVariant] = useState<number | null>(null);
  const [message, setMessage] = useState("");

  async function add() {
    if (variant === null) {
      setMessage("Choisis d’abord une taille.");
      return;
    }
    try {
      await bag.add([{ id: variant, quantity: 1 }]);
      setMessage(copy.addedLabel(p.name));
    } catch {
      setMessage(copy.msgError);
    }
  }

  return (
    <div className="mt-3 flex flex-col items-center gap-3 md:items-start">
      <div role="group" aria-label={copy.size} className="flex flex-wrap justify-center gap-2 md:justify-start">
        {p.variants.map((v) => (
          <button
            key={v.id}
            type="button"
            disabled={!v.a}
            aria-pressed={variant === v.id}
            onClick={() => {
              setVariant(v.id);
              setMessage("");
            }}
            className="min-h-11 min-w-11 cursor-pointer rounded-full border-[1.5px] border-border px-3 text-[13px] font-bold transition-colors hover:border-cream aria-pressed:border-cream aria-pressed:bg-cream aria-pressed:text-red-dk disabled:cursor-default disabled:opacity-40"
          >
            {v.o[0]}
          </button>
        ))}
      </div>
      <button
        type="button"
        onClick={add}
        className="min-h-12 cursor-pointer rounded-full bg-cream px-7 text-xs font-extrabold tracking-[.14em] text-red-dk uppercase transition-transform active:scale-[.97]"
      >
        {copy.addToBag} - {formatMoney(p.price)}
      </button>
      <p role="status" className="m-0 text-[13px] font-medium empty:hidden">
        {message}
      </p>
    </div>
  );
}

export function RailSection() {
  return (
    <ClothingRailHero
      id="portant"
      aria-label="Le portant"
      className="flex min-h-[calc(100svh-4rem)] flex-col justify-center py-6 min-[750px]:min-h-[calc(100svh-4.5rem)]"
      items={railItems}
      heading="Le portant"
      caption="Passe sur les cintres, puis attrape une pièce pour voir le dos."
      labels={LABELS}
      detailAction={(item) => (
        <Fragment key={item.id}>
          <AddPiece id={item.id as ProductId} />
          <CompleteOutfit id={item.id as ProductId} />
        </Fragment>
      )}
      detailAside={(item) => <WornBy key={item.id} id={item.id as ProductId} />}
    />
  );
}
