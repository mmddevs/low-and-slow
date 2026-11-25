import { BagButton } from "@/components/bag/bag-button";

const linkClass =
  "py-3 font-extrabold uppercase tracking-[.08em] decoration-signal-red decoration-[3px] underline-offset-[6px] hover:underline";

/**
 * Vinyl banner header of the stand. The `shopify-section-group-header-group`
 * class is measured by the runway controller to fit the section under it.
 */
export function SiteHeader() {
  return (
    <header className="site-header shopify-section-group-header-group relative z-50 bg-peg px-3 pt-3 pb-2 min-[750px]:px-6 min-[750px]:pt-4">
      <div className="relative flex h-[60px] items-center gap-4 border-[3px] border-ink bg-vinyl px-4 shadow-[0_6px_12px_-6px_rgb(20_18_16/.45)] min-[750px]:h-[72px] min-[750px]:gap-7 min-[750px]:px-6">
        {/* banner grommets */}
        <span aria-hidden="true" className="absolute top-1.5 left-1.5 size-2.5 rounded-full border-2 border-[#7d8288] bg-peg" />
        <span aria-hidden="true" className="absolute top-1.5 right-1.5 size-2.5 rounded-full border-2 border-[#7d8288] bg-peg" />

        <a href="./" className="mr-auto inline-flex items-center gap-4 min-[750px]:gap-6" aria-label="Low & Slow, accueil du défilé">
          <span className="font-display text-[30px] leading-none text-signal-red min-[750px]:text-[40px]">
            LOW <span className="text-signal-blue">&amp;</span> SLOW
          </span>
          <span className="hidden border-l-[3px] border-ink pl-5 text-[11px] leading-tight font-extrabold tracking-[.16em] text-signal-blue uppercase min-[900px]:block">
            Stand 47
            <br />
            Swap meet · South LA
          </span>
        </a>

        <nav aria-label="Navigation principale" className="flex items-center gap-4 text-[12px] min-[750px]:gap-7 min-[750px]:text-[13px]">
          <a href="./" className={`${linkClass} max-[749px]:hidden`}>
            Accueil
          </a>
          <a href="./" aria-current="page" className={`${linkClass} underline`}>
            Le défilé
          </a>
        </nav>
        <BagButton />
      </div>
    </header>
  );
}
