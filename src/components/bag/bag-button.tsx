"use client";

import { bag, bagCount } from "@/lib/bag/store";
import { useBag } from "@/lib/bag/use-bag";

export function BagButton() {
  const { entries } = useBag();
  return (
    <button
      type="button"
      id="open-bag"
      aria-label="Ouvrir ton sac"
      onClick={() => bag.setOpen(true)}
      className="flex min-h-11 min-w-11 cursor-pointer items-center justify-center gap-2 rounded-full border-[1.5px] border-cream bg-transparent px-4 text-[12px] font-extrabold tracking-[.14em] text-cream uppercase transition-colors hover:bg-cream hover:text-red-dk"
    >
      <svg width="16" height="18" viewBox="0 0 24 26" fill="none" stroke="currentColor" strokeWidth="1.8" aria-hidden="true">
        <path d="M4 8h16l1 16H3L4 8zM8 8V6a4 4 0 0 1 8 0v2" />
      </svg>
      <span className="max-[749px]:hidden">Sac</span>
      <span data-cart-count="" className="tabular-nums">
        {bagCount(entries)}
      </span>
    </button>
  );
}
