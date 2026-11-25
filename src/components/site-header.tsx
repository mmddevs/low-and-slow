import { BagButton } from "@/components/bag/bag-button";

const linkClass =
  "py-3 text-[12px] font-bold tracking-[.16em] uppercase text-cream/80 transition-colors hover:text-cream underline-offset-[7px] decoration-[1.5px]";

/**
 * Transparent header on the red room. The `shopify-section-group-header-group`
 * class is measured by the runway controller to fit the section under it.
 */
export function SiteHeader() {
  return (
    <header className="site-header shopify-section-group-header-group relative z-50 flex h-[64px] items-center gap-5 bg-red px-4 text-cream min-[750px]:h-[72px] min-[750px]:gap-8 min-[750px]:px-10">
      <a href="./" className="mr-auto text-[26px] leading-none font-black uppercase font-stretch-extra-condensed min-[750px]:text-[30px]" aria-label="Low & Slow, accueil du défilé">
        Low &amp; Slow
      </a>
      <nav aria-label="Navigation principale" className="flex items-center gap-7">
        <a href="./" className={`${linkClass} max-[749px]:hidden`}>
          Accueil
        </a>
        <a href="./" aria-current="page" className={`${linkClass} text-cream underline`}>
          Le défilé
        </a>
      </nav>
      <BagButton />
    </header>
  );
}
