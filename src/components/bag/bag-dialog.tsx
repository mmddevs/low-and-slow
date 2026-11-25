"use client";
/* eslint-disable @next/next/no-img-element -- transparent product cut-outs */

import { useEffect, useRef } from "react";
import { motion, useReducedMotion } from "motion/react";
import { BRAND, variantIndex } from "@/data/catalog";
import { bag, type BagEntry } from "@/lib/bag/store";
import { useBag } from "@/lib/bag/use-bag";
import { formatMoney } from "@/lib/format";

function resolve(entry: BagEntry) {
  const match = variantIndex.get(entry.id);
  if (!match) return null;
  return { ...match, entry };
}

/** Builds and downloads the plain-text outfit shortlist. */
function downloadShortlist(rows: NonNullable<ReturnType<typeof resolve>>[]) {
  const lines = rows.map(
    (r) => `${r.product.name} · Taille ${r.value} · Quantité ${r.entry.quantity} · ${formatMoney(r.product.price)}`,
  );
  const text = [
    `${BRAND.toUpperCase()} — STAND 47 — TA SÉLECTION`,
    "Prix indicatifs. Aucune commande ni paiement n’a été effectué.",
    "",
    ...lines,
  ].join("\n\n");
  const url = URL.createObjectURL(new Blob([text], { type: "text/plain;charset=utf-8" }));
  const a = document.createElement("a");
  a.href = url;
  a.download = "low-and-slow-selection.txt";
  a.click();
  window.setTimeout(() => URL.revokeObjectURL(url), 1000);
}

export function BagDialog() {
  const { entries, open } = useBag();
  const ref = useRef<HTMLDialogElement>(null);
  const reduced = useReducedMotion();

  useEffect(() => {
    const dialog = ref.current;
    if (!dialog) return;
    if (open && !dialog.open) dialog.showModal();
    if (!open && dialog.open) dialog.close();
  }, [open]);

  const rows = entries.map(resolve).filter((r): r is NonNullable<typeof r> => r !== null);
  const total = rows.reduce((sum, r) => sum + r.product.price * r.entry.quantity, 0);

  return (
    <dialog
      ref={ref}
      id="bag-dialog"
      aria-labelledby="bag-title"
      onClose={() => bag.setOpen(false)}
      onClick={(e) => {
        const r = e.currentTarget.getBoundingClientRect();
        const outside = e.clientX < r.left || e.clientX > r.right || e.clientY < r.top || e.clientY > r.bottom;
        if (outside) bag.setOpen(false);
      }}
      className="m-auto max-h-[85dvh] w-[min(560px,calc(100vw-32px))] overflow-auto border-[3px] border-ink bg-kraft p-6 text-ink shadow-[0_24px_48px_-16px_rgb(20_18_16/.6)]"
    >
      {open && (
        <motion.div
          initial={reduced ? false : { opacity: 0, y: 12 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.45, ease: [0.16, 1, 0.3, 1] }}
        >
          <div className="bag-heading flex items-center justify-between gap-5">
            <h2 id="bag-title" className="m-0 font-display text-[32px] leading-none font-normal uppercase">
              Ton sac
            </h2>
            <button
              type="button"
              id="close-bag"
              aria-label="Fermer le sac"
              onClick={() => bag.setOpen(false)}
              className="grid size-11 cursor-pointer place-items-center border-2 border-ink bg-vinyl hover:bg-signal-yellow"
            >
              <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" aria-hidden="true">
                <path d="M5 5l14 14M19 5L5 19" />
              </svg>
            </button>
          </div>
          <p className="bag-note text-[13px] leading-normal font-semibold text-muted">
            Ta sélection reste sur cet appareil. Aucun paiement ni commande n’est fait ici : télécharge la liste
            et passe au stand.
          </p>

          <div id="bag-items">
            {rows.length === 0 ? (
              <p className="bag-note text-[13px] leading-normal font-semibold text-muted">
                Ton sac est vide. Choisis une taille à côté d’une pièce pour la mettre de côté.
              </p>
            ) : (
              rows.map((r) => (
                <div
                  key={r.entry.id}
                  className="bag-row grid grid-cols-[60px_1fr_auto] items-center gap-[18px] border-b-2 border-dashed border-ink/30 py-[18px]"
                >
                  <img src={r.product.image.src} alt={r.product.name} width={60} height={80} className="h-20 w-[60px] border-2 border-ink bg-vinyl object-contain p-1" />
                  <div>
                    <h3 className="m-0 mb-1 text-[15px] font-extrabold">{r.product.name}</h3>
                    <p className="m-0 text-[13px] font-semibold">
                      Taille {r.value} · Quantité {r.entry.quantity} · {formatMoney(r.product.price)}
                    </p>
                  </div>
                  <button
                    type="button"
                    aria-label={`Retirer ${r.product.name}`}
                    onClick={() => bag.remove(r.entry.id)}
                    className="grid size-11 cursor-pointer place-items-center border-0 bg-transparent hover:text-signal-red"
                  >
                    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" aria-hidden="true">
                      <path d="M5 5l14 14M19 5L5 19" />
                    </svg>
                  </button>
                </div>
              ))
            )}
          </div>

          <p id="bag-total" className="m-0 py-3 text-right text-[16px] font-extrabold">
            {rows.length ? `Sous-total indicatif ${formatMoney(total)}` : ""}
          </p>
          <button
            type="button"
            id="export-bag"
            disabled={rows.length === 0}
            onClick={() => downloadShortlist(rows)}
            className="w-full cursor-pointer border-0 bg-ink px-5 py-4 font-display text-[19px] tracking-[.06em] text-signal-yellow uppercase transition-colors hover:bg-signal-red hover:text-vinyl disabled:cursor-not-allowed disabled:opacity-40 disabled:hover:bg-ink disabled:hover:text-signal-yellow"
          >
            Télécharger ma sélection
          </button>
        </motion.div>
      )}
    </dialog>
  );
}
