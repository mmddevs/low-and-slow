"use client";
/* eslint-disable @next/next/no-img-element -- exact srcset/sizes and alpha cut-outs are required */

import { useRef } from "react";
import { preload } from "react-dom";
import { useGSAP } from "@gsap/react";
import { copy, looks, lookTotals, products, SECTION_ID, type Look } from "@/data/catalog";
import { formatMoney } from "@/lib/format";
import { RunwayController } from "@/lib/runway/controller";

const MODEL_SIZES = "(min-width: 1800px) 540px, (min-width: 750px) 420px, 320px";

const lookLabel = (i: number, look: Look) => `${copy.look} ${i + 1} : ${look.name}`;
const pad = (n: number) => String(n).padStart(2, "0");

function ModelImage({ look, priority }: { look: Look; priority?: boolean }) {
  return (
    <img
      src={look.model.src}
      srcSet={`${look.model.src} 640w, ${look.model.srcLarge} 1080w`}
      sizes={MODEL_SIZES}
      loading="eager"
      decoding="async"
      fetchPriority={priority ? "high" : undefined}
      width={1100}
      height={1956}
      draggable={false}
      data-model-image=""
      alt={look.name}
    />
  );
}

function Figure({ children }: { children: React.ReactNode }) {
  return (
    <div className="rw__figure" style={{ "--rw-ar": 0.5625 } as React.CSSProperties}>
      <div className="rw__art">{children}</div>
    </div>
  );
}

function ArrowIcon({ dir }: { dir: "prev" | "next" }) {
  return (
    <svg width="26" height="14" viewBox="0 0 26 14" fill="none" stroke="currentColor" strokeWidth="1.3" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
      <path d={dir === "prev" ? "M25 7H1M7 1L1 7l6 6" : "M1 7h24M19 1l6 6-6 6"} />
    </svg>
  );
}

function ProductRow({ look, n }: { look: Look; n: number }) {
  const item = look.items[n - 1];
  const p = products[item.product];
  const pickerId = `Picker-${SECTION_ID}-look_${look.key}-${n}`;
  const optName = `Opt-${SECTION_ID}-look_${look.key}-${n}-1`;
  const cardId = `Card-${SECTION_ID}-look_${look.key}-${n}`;

  return (
    <li
      className="rw__item"
      id={cardId}
      data-rw-card={n}
      data-product={p.id}
      data-title={p.name}
      style={{ "--i": n } as React.CSSProperties}
    >
      {item.tag && (
        <span className="rw__tag">
          <span className="rw__tag-text">{item.tag}</span>
        </span>
      )}
      <a className="rw__media" href={p.url} tabIndex={-1} aria-hidden="true">
        <img src={p.image.src} loading="lazy" decoding="async" alt="" width={400} height={p.image.height} />
        <span className="rw__num">{n}</span>
      </a>
      <div className="rw__info">
        <a className="rw__name" href={p.url}>
          {p.name}
        </a>
        <span className="rw__type">{p.detail}</span>
        <span className="rw__price">
          <span>{formatMoney(p.price)}</span>
        </span>
      </div>
      <button
        type="button"
        className="rw__add"
        data-rw-add=""
        aria-expanded="false"
        aria-controls={pickerId}
        aria-label={copy.addToBagLabel(p.name)}
        data-added-label={copy.addedLabel(p.name)}
      >
        <svg className="rw__ico-plus" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.3" strokeLinecap="round" aria-hidden="true">
          <path d="M12 4v16M4 12h16" />
        </svg>
        <svg className="rw__ico-check" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
          <path d="M4.5 12.5l5 5L19.5 7" />
        </svg>
        <svg className="rw__ico-spin" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" aria-hidden="true">
          <path d="M12 3a9 9 0 1 1-9 9" />
        </svg>
      </button>
      <div className="rw__picker" id={pickerId} data-rw-picker="" data-rw-for={cardId} hidden>
        <div className="rw__picker-head">
          <img src={p.image.src} loading="lazy" decoding="async" alt="" width={160} height={p.image.sheetHeight} />
          <div className="rw__picker-copy">
            <span className="rw__picker-title">{p.name}</span>
            <span className="rw__picker-price">{formatMoney(p.price)}</span>
          </div>
          <button type="button" className="rw__pick-close" data-rw-pick-close="" aria-label={copy.closeSizes}>
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" aria-hidden="true">
              <path d="M5 5l14 14M19 5L5 19" />
            </svg>
          </button>
        </div>
        <fieldset className="rw__opt">
          <legend className="rw__opt-name">{p.kind === "shoe" ? copy.shoeSize : copy.size}</legend>
          <div className="rw__values">
            {p.variants.map((v, i) => (
              <label className="rw__pill" key={v.id}>
                <input type="radio" name={optName} value={v.o[0]} data-rw-option="0" defaultChecked={i === 0} />
                <span className="rw__pill-label">{v.o[0]}</span>
              </label>
            ))}
          </div>
        </fieldset>
        <button type="button" className="rw__confirm" data-rw-confirm="">
          <span data-rw-confirm-label="" data-add={copy.addToBag}>
            {copy.addToBag}
          </span>
          <span className="rw__sr"> — {p.name}</span>
        </button>
      </div>
    </li>
  );
}

function LookPanel({ look, index }: { look: Look; index: number }) {
  const { full, bundle } = lookTotals(look);
  const count = look.items.length;
  return (
    <div
      className={`rw__look-panel${index === 0 ? " is-in" : ""}`}
      data-rw-panel={index}
      data-rw-pieces-text={copy.pieces(count)}
      hidden={index !== 0}
    >
      <div className="rw__mhead">
        <span className="rw__mhead-title">{look.name}</span>
        <span className="rw__label">{copy.pieces(count)}</span>
      </div>
      <ul className="rw__items" role="list">
        {look.items.map((_, i) => (
          <ProductRow key={i} look={look} n={i + 1} />
        ))}
      </ul>
      <div className="rw__bundle has-rule">
        <p className="rw__msg" data-rw-msg="" role="status" aria-live="polite" />
        <div className="rw__bundle-row">
          <div className="rw__bundle-copy">
            <span className="rw__bundle-title">{copy.bundleTitle}</span>
            <span className="rw__bundle-note">{copy.bundleNote(count)}</span>
          </div>
          <div className="rw__bundle-price">
            <s>{formatMoney(full)}</s>
            <strong>{formatMoney(bundle)}</strong>
          </div>
        </div>
        <button type="button" className="rw__cta" data-rw-all="">
          <span className="rw__cta-add">{copy.ctaAdd}</span>
          <span className="rw__cta-m">{copy.ctaMobile(formatMoney(bundle))}</span>
          <span className="rw__cta-done">{copy.ctaDone}</span>
          <svg className="rw__cta-arrow" width="22" height="12" viewBox="0 0 26 14" fill="none" stroke="currentColor" strokeWidth="1.4" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
            <path d="M1 7h24M19 1l6 6-6 6" />
          </svg>
          <svg className="rw__cta-spin" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" aria-hidden="true">
            <path d="M12 3a9 9 0 1 1-9 9" />
          </svg>
        </button>
      </div>
    </div>
  );
}

export function RunwaySection() {
  const ref = useRef<HTMLDivElement>(null);
  preload(looks[0].model.src, { as: "image", fetchPriority: "high" });

  useGSAP(
    () => {
      const controller = new RunwayController(ref.current!);
      return () => controller.destroy();
    },
    { scope: ref },
  );

  return (
    <div
      ref={ref}
      id={SECTION_ID}
      className="rw rw--add-icon rw--popup rw--hero-pins rw--list has-dividers has-border"
      data-layout="shelf"
      data-feel="balanced"
      data-blur="true"
      data-style="ring"
      data-mstyle="classic"
      data-fit="true"
      data-mheight-vh="109"
      data-autoplay="true"
      data-speed="5000"
      data-msg-choose={copy.msgChoose}
      data-msg-error={copy.msgError}
      data-msg-soldout={copy.msgSoldOut}
    >
      <div className="rw__sticky">
        <div className="rw__grid">
          <div className="rw__left">
            <div className="rw__head">
              <div className="rw__intro rw__sr">
                <h2 className="rw__title">{copy.title}</h2>
                <p className="rw__sub">{copy.subtitle}</p>
              </div>
              <span className="rw__sr" aria-live="polite" aria-atomic="true" data-rw-live="" />
            </div>

            <div
              className="rw__stage"
              data-rw-stage=""
              tabIndex={0}
              role="region"
              aria-roledescription="carousel"
              aria-label={copy.stageLabel}
            >
              <div className="rw__actors" data-rw-actors="">
                {looks.map((look, i) => (
                  <div className="rw__model" data-rw-model="" data-index={i} aria-hidden="true" key={i}>
                    <span className="rw__shadow" />
                    <Figure>
                      <ModelImage look={look} priority={i === 0} />
                      <button type="button" className="rw__hit" data-rw-go={i} aria-label={lookLabel(i, look)} tabIndex={-1} />
                    </Figure>
                  </div>
                ))}
              </div>

              <div className="rw__heroes" data-rw-heroes="">
                {looks.map((look, i) => (
                  <div
                    className={`rw__hero${i === 0 ? " is-on" : ""}`}
                    data-rw-hero=""
                    data-index={i}
                    data-name={look.name}
                    data-label={lookLabel(i, look)}
                    data-probe={look.model.src}
                    aria-hidden={i !== 0}
                    key={i}
                  >
                    <div className="rw__morph">
                      <span className="rw__shadow" />
                      <Figure>
                        <ModelImage look={look} />
                        <button type="button" className="rw__zoom" data-rw-zoom="" aria-label={`${copy.viewLook} : ${look.name}`} tabIndex={-1} />
                        <div className="rw__pins">
                          {look.items.map((item, k) => {
                            const piece = products[item.product];
                            const name = piece.name;
                            return (
                              <button
                                type="button"
                                className="rw__pin"
                                key={k}
                                data-rw-pin={k + 1}
                                data-tip={`${name} · ${formatMoney(piece.price)}`}
                                style={{ left: `${item.pin.left}%`, top: `${item.pin.top}%`, "--pi": k + 1 } as React.CSSProperties}
                                aria-label={`${name}, ${formatMoney(piece.price)}`}
                                tabIndex={-1}
                              >
                                <span className="rw__pin-dot" aria-hidden="true">
                                  {k + 1}
                                </span>
                              </button>
                            );
                          })}
                        </div>
                      </Figure>
                    </div>
                  </div>
                ))}
              </div>

              <span className="rw__sweep" />
              <span className="rw__cursor" data-rw-cursor="">
                <span className="rw__cursor-in">
                  <span className="rw__cursor-label rw__cursor-drag">{copy.cursorDrag}</span>
                  <span className="rw__cursor-label rw__cursor-view">{copy.cursorView}</span>
                </span>
              </span>
              <span className="rw__walk">
                <span className="rw__walk-line" />
              </span>
            </div>

            <div className="rw__controls">
              <button type="button" className="rw__icon rw__prev" data-rw-prev="" aria-label={copy.prev}>
                <ArrowIcon dir="prev" />
              </button>
              <div className="rw__ticks">
                {looks.map((look, i) => (
                  <button type="button" className="rw__tick" data-rw-tick={i} aria-current={i === 0} aria-label={lookLabel(i, look)} key={i}>
                    <span className="rw__tick-bar" />
                    <span className="rw__tick-label">
                      {pad(i + 1)}
                      <span className="rw__tick-name">{"  "}{look.name}</span>
                    </span>
                  </button>
                ))}
              </div>
              <button type="button" className="rw__icon rw__auto" data-rw-auto="" aria-pressed="false" aria-label={copy.autoplay}>
                <svg className="rw__ico-play" width="14" height="14" viewBox="0 0 24 24" fill="currentColor" aria-hidden="true">
                  <path d="M7 4.5v15l12.5-7.5z" />
                </svg>
                <svg className="rw__ico-pause" width="14" height="14" viewBox="0 0 24 24" fill="currentColor" aria-hidden="true">
                  <path d="M6.5 4.5h3.5v15H6.5zM14 4.5h3.5v15H14z" />
                </svg>
              </button>
              <button type="button" className="rw__icon rw__next" data-rw-next="" aria-label={copy.next}>
                <ArrowIcon dir="next" />
              </button>
            </div>

            <div className="rw__lb" data-rw-lb="" data-word={copy.look} role="region" aria-label={copy.viewLook} aria-hidden="true">
              <div className="rw__lb-stage" data-rw-lb-stage="" />
              <div className="rw__lb-top">
                <p className="rw__lb-cap">
                  <span className="rw__lb-kicker" data-rw-lb-kicker="" />
                  <span className="rw__lb-name" data-rw-lb-name="" />
                </p>
                <button type="button" className="rw__lb-close" data-rw-zoom-close="" aria-label={copy.close}>
                  <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" aria-hidden="true">
                    <path d="M5 5l14 14M19 5L5 19" />
                  </svg>
                </button>
              </div>
              <p className="rw__lb-hint">{copy.lbHint}</p>
            </div>
          </div>

          <aside className="rw__panel has-rule">
            <div className="rw__panel-inner">
              <div className="rw__panel-head">
                <h3 className="rw__panel-title">{copy.inThisLook}</h3>
                <span className="rw__label" data-rw-pieces="">
                  {copy.pieces(looks[0].items.length)}
                </span>
              </div>
              {looks.map((look, i) => (
                <LookPanel look={look} index={i} key={i} />
              ))}
            </div>
          </aside>
        </div>
      </div>
    </div>
  );
}
