/**
 * Imperative engine for the runway section.
 *
 * React renders the static markup once; this controller owns everything that
 * runs per frame (springs, ring/line placement, cursor inertia) and every
 * interaction (drag, wheel, keys, autoplay, pins, size pickers, popup, bag).
 * All numbers come from the original Shopify section.
 */
import gsap from "gsap";
import { products, type ProductId } from "@/data/catalog";
import { bag } from "@/lib/bag/store";

type Mode = "ring" | "classic";

interface Body {
  el: HTMLElement;
  hit: HTMLButtonElement | null;
  look: number;
  w: number;
  /** Classic mode: rendered place in line, its velocity and follow target. */
  x: number;
  v: number;
  g: number;
  goal: number;
  trip: boolean;
  from: number;
  blur: number;
}

interface DragState {
  id: number;
  x0: number;
  y0: number;
  t: number;
  dx: number;
  active: boolean;
  samples: { x: number; t: number }[];
}

/** Feel "balanced": critically damped spring. */
const K = 95;
const C = 2 * Math.sqrt(K);
const LAG = 0.04;
const START = 1.15;
const SUBSTEPS = 3;
const PHONE_MAX = 749;

/** Classic (diagonal line) constants. */
const CLASSIC = {
  phone: { ax: 0.3, ay: 22, sx: 0.32, sy: 22, sr: 0.76, ex: 0.55, d: 4 },
  desktop: { ax: 0.4, ay: 36, sx: 0.125, sy: 58, sr: 0.76, ex: 0.38, d: 5 },
};

const clamp = (v: number, min: number, max: number) => Math.min(max, Math.max(min, v));
const mod = (v: number, m: number) => ((v % m) + m) % m;

/** Custom properties copied onto the body-level size-sheet host. */
const SHEET_VARS = [
  "--rw-panel", "--rw-text", "--rw-muted", "--rw-line", "--rw-accent", "--rw-on-accent",
  "--rw-btn-bg", "--rw-btn-fg", "--rw-btn-radius", "--rw-pill-radius", "--rw-bar-r",
  "--rw-thumb-radius", "--rw-pt-size", "--rw-price", "--rw-opt", "--rw-ease",
  "--rw-ease-sheet", "--rw-ease-spring",
];

export class RunwayController {
  private readonly root: HTMLElement;
  private readonly stage: HTMLElement;
  private readonly actors: HTMLElement;
  private readonly heroes: HTMLElement[];
  private readonly ticks: HTMLElement[];
  private readonly panels: HTMLElement[];
  private readonly panelEl: HTMLElement | null;
  private readonly live: HTMLElement | null;
  private readonly piecesLabel: HTMLElement | null;
  private readonly autoBtn: HTMLElement | null;
  private cursor: HTMLElement | null;
  private readonly lb: HTMLElement;
  private readonly lbStage: HTMLElement;

  private readonly n: number;
  private readonly N: number;
  private bodies: Body[] = [];

  private index = 0;
  private target = 0;
  private cur = 0;
  private vel = 0;
  private first = true;

  private mode: Mode = "ring";
  private mobile = false;
  private readonly reduced: boolean;
  private readonly blurOn: boolean;
  private readonly speed: number;

  private W = 0;
  private H = 0;
  private fs = 1;
  private unit = 120;
  private vh = 0;
  private lastW = 0;

  private raf = 0;
  private lastT = 0;
  private visible = false;
  private still = false;

  private playing = false;
  private timer = 0;
  private engaged = false;
  private panelHover = false;
  private zoomed = false;
  private lbHero: HTMLElement | null = null;
  private lbClearTimer = 0;

  private drag: DragState | null = null;
  private dragging = false;
  private suppressClickUntil = 0;
  private wheelAcc = 0;
  private wheelLockUntil = 0;

  private sheetHost: HTMLElement | null = null;
  private sheetCard: HTMLElement | null = null;

  private cursorState = { x: 0, y: 0, tx: 0, ty: 0, on: false, running: false };

  private readonly ac = new AbortController();
  private readonly observers: { disconnect(): void }[] = [];
  private resizeTimer = 0;

  constructor(root: HTMLElement) {
    this.root = root;
    const q = <T extends HTMLElement>(sel: string) => root.querySelector<T>(sel);
    this.stage = q("[data-rw-stage]")!;
    this.actors = q("[data-rw-actors]")!;
    this.heroes = [...root.querySelectorAll<HTMLElement>("[data-rw-hero]")];
    this.ticks = [...root.querySelectorAll<HTMLElement>("[data-rw-tick]")];
    this.panels = [...root.querySelectorAll<HTMLElement>("[data-rw-panel]")];
    this.panelEl = q(".rw__panel");
    this.live = q("[data-rw-live]");
    this.piecesLabel = q("[data-rw-pieces]");
    this.autoBtn = q("[data-rw-auto]");
    this.cursor = q("[data-rw-cursor]");
    this.lb = q("[data-rw-lb]")!;
    this.lbStage = q("[data-rw-lb-stage]")!;

    this.reduced = matchMedia("(prefers-reduced-motion: reduce)").matches;
    this.blurOn = root.dataset.blur === "true";
    this.speed = Number(root.dataset.speed) || 5000;

    this.n = this.heroes.length;
    this.N = this.n * Math.ceil(8 / this.n);

    this.init();
  }

  /* ───────────────────────── setup ───────────────────────── */

  private init() {
    const { root } = this;
    root.classList.add("rw--js");

    this.buildBodies();
    this.root.querySelectorAll<HTMLImageElement>("img[data-model-image]").forEach((img) => this.decode(img));

    const start = this.reduced ? 0 : START;
    this.cur = -start;
    this.target = 0;
    for (const b of this.bodies) {
      b.goal = mod(Number(b.el.dataset.index), this.N);
      b.x = b.g = b.goal + start;
    }

    this.measure();
    this.setIndex(0);
    this.panels.forEach((p) => p.querySelectorAll<HTMLElement>("[data-rw-card]").forEach((c) => this.syncPicker(c, false)));

    this.bindEvents();
    this.observe();
    this.setupCursor();
    this.detectFeet();

    if (root.dataset.autoplay === "true" && !this.reduced) this.play(true);
  }

  private buildBodies() {
    const originals = [...this.actors.querySelectorAll<HTMLElement>("[data-rw-model]")];
    for (let a = originals.length; a < this.N; a++) {
      const clone = originals[a % this.n].cloneNode(true) as HTMLElement;
      clone.dataset.rwClone = "";
      clone.dataset.index = String(a);
      clone.querySelectorAll("img").forEach((img) => (img.loading = "lazy"));
      this.actors.appendChild(clone);
    }
    this.bodies = [...this.actors.querySelectorAll<HTMLElement>("[data-rw-model]")].map((el, a) => ({
      el,
      hit: el.querySelector<HTMLButtonElement>(".rw__hit"),
      look: a % this.n,
      w: 0,
      x: 0,
      v: 0,
      g: 0,
      goal: 0,
      trip: false,
      from: 0,
      blur: -1,
    }));
  }

  private decode(img: HTMLImageElement) {
    const done = () => img.classList.add("is-decoded");
    if (img.complete && img.naturalWidth) {
      done();
      return;
    }
    img.decode().then(done, () => {
      if (img.naturalWidth) done();
      else img.addEventListener("load", done, { once: true, signal: this.ac.signal });
    });
  }

  /** Measures the visible header stack that sits above the section. */
  private headerHeight() {
    let h = 0;
    document
      .querySelectorAll<HTMLElement>(
        ".shopify-section-group-header-group, #shopify-section-header, #shopify-section-announcement-bar",
      )
      .forEach((el) => {
        if (el.contains(this.root) || el.offsetParent === null) return;
        h += el.offsetHeight;
      });
    return h;
  }

  private measure() {
    const wasMobile = this.mobile;
    this.mobile = innerWidth <= PHONE_MAX;
    const nextMode: Mode = this.mobile ? "classic" : "ring";
    const modeChanged = nextMode !== this.mode || this.first;
    this.mode = nextMode;

    let frameH: number;
    if (this.mobile) {
      if (!this.vh || innerWidth !== this.lastW || Math.abs(innerHeight - this.vh) >= 160) this.vh = innerHeight;
      this.lastW = innerWidth;
      frameH = (this.vh * clamp(109, 50, 120)) / 100;
    } else {
      frameH = Math.max(380, innerHeight - this.headerHeight());
    }
    this.root.style.setProperty("--rw-frame-h", `${Math.round(frameH)}px`);

    const rect = this.stage.getBoundingClientRect();
    this.W = rect.width;
    this.H = rect.height;
    const ring = this.mode === "ring";
    this.fs = ring ? 1.08 : 1;

    const modelH = ring
      ? Math.max(200, Math.round((this.H - 34 - 18) / 1.08))
      : Math.max(200, Math.round(this.H - (this.mobile ? 24 : 36) - 18));
    this.stage.style.setProperty("--rw-model-h", `${modelH}px`);
    this.stage.style.setProperty("--rw-fs", String(this.fs));

    const c = this.mobile ? CLASSIC.phone : CLASSIC.desktop;
    const hx = ring ? 0.5 * this.W : c.ax * this.W;
    const hy = ring ? 34 : c.ay;
    this.stage.style.setProperty("--rw-hx", `${hx}px`);
    this.stage.style.setProperty("--rw-hy", `${hy}px`);
    this.root.style.setProperty("--rw-ax", `${this.W ? (hx / this.W) * 100 : 40}%`);

    this.unit = ring
      ? Math.max(this.mobile ? 90 : 120, 0.3 * this.W)
      : Math.max(90, this.W * c.sx * 1.6);

    for (const b of this.bodies) b.w = b.el.offsetWidth;

    if (modeChanged && !this.first) {
      // Jump the new layout straight to where the carousel is heading.
      this.cur = this.target;
      this.vel = 0;
      for (const b of this.bodies) {
        b.goal = mod(this.bodies.indexOf(b) - this.target, this.N);
        b.x = b.g = b.goal;
        b.v = 0;
        b.trip = false;
      }
      this.updateRanks();
    }
    if (wasMobile && !this.mobile) this.closeSheet(false);

    this.renderAll();
    this.kick();
  }

  /* ───────────────────────── render ───────────────────────── */

  private put(b: Body, x: number, bottom: number, scale: number, opacity: number, blur: number, z: number) {
    const half = (b.w * scale) / 2;
    if (x + half < -4 || x - half > this.W + 4) opacity = 0;
    const s = b.el.style;
    s.transform = `translate3d(${x.toFixed(2)}px,${(-bottom).toFixed(2)}px,0) translateX(-50%) scale(${scale.toFixed(4)})`;
    s.opacity = opacity.toFixed(3);
    s.zIndex = String(z);
    s.visibility = opacity < 0.01 ? "hidden" : "";
    s.pointerEvents = opacity < 0.5 ? "none" : "";
    const r = this.blurOn ? Math.round(blur * 10) / 10 : 0;
    if (r !== b.blur) {
      s.filter = r > 0.05 ? `blur(${r}px)` : "";
      b.blur = r;
    }
  }

  private renderAll() {
    if (this.mode === "ring") this.renderRing();
    else this.renderClassic();
  }

  private renderRing() {
    const { W, H, fs } = this;
    const cx = 0.5 * W;
    const R = (this.mobile ? 0.72 : 0.62) * W;
    const P = (this.mobile ? 1.9 : 1.65) * W;
    const floor = H - 34;
    const horizon = 0.36 * H;
    const step = (2 * Math.PI) / this.N;

    this.bodies.forEach((b, a) => {
      let phi = mod((a - this.cur) * step, 2 * Math.PI);
      if (phi > Math.PI) phi -= 2 * Math.PI;
      const z = R * (1 - Math.cos(phi));
      const persp = P / (P + z);
      const sl = Math.abs(phi) / step;
      const scale = persp * (1 + (fs - 1) * clamp(1 - sl, 0, 1));
      const x = cx + R * Math.sin(phi) * persp;
      const feet = horizon + (floor - horizon) * persp;
      const blur = sl <= 1 ? 1.8 * sl : Math.min(1.8 + (sl - 1) * 2, 6.5);
      let opacity = clamp((Math.cos(phi) + 0.55) / 0.3, 0, 1);
      if (this.still && sl < 0.02) opacity = 0;
      this.put(b, x, H - feet, scale, opacity, blur, Math.round(scale * 1000));
    });
  }

  private renderClassic() {
    const c = this.mobile ? CLASSIC.phone : CLASSIC.desktop;
    const { W } = this;
    for (const b of this.bodies) {
      let k = b.x;
      let e = -1;
      if (b.trip) {
        const span = Math.abs(b.goal - b.from) || 1;
        const u = clamp(Math.abs(b.x - b.from) / span, 0, 1);
        if (b.goal > b.from) {
          if (u < 0.5) e = 2 * u * 1.4;
          else k = b.goal + 2 * (1 - u);
        } else if (u < 0.5) k = b.from + 2 * u;
        else e = 2 * (1 - u) * 1.4;
      } else if (k < 0) e = Math.min(-k, 1.4);

      if (e >= 0) {
        this.put(b, W * (c.ax - c.ex * e), c.ay - 22 * e, 1 + 0.14 * e, Math.max(0, 1 - 1.05 * e), 4 * Math.min(e, 1), 1100);
        continue;
      }
      let opacity = k <= c.d - 1 ? 1 - 0.13 * k : Math.max(0, 0.61 * (c.d - k));
      if (this.still && Math.abs(k) < 0.02) opacity = 0;
      this.put(
        b,
        W * (c.ax + c.sx * k),
        c.ay + c.sy * k,
        Math.pow(c.sr, k),
        opacity,
        Math.min(0.9 * k, 3.2),
        1000 - Math.round(10 * k),
      );
    }
  }

  /* ───────────────────────── loop ───────────────────────── */

  private kick() {
    if (this.raf || !this.visible || document.hidden) return;
    this.lastT = 0;
    this.raf = requestAnimationFrame(this.tick);
  }

  private tick = (t: number) => {
    this.raf = 0;
    const dt = this.lastT ? Math.min(0.034, (t - this.lastT) / 1000) : 1 / 60;
    this.lastT = t;
    const settled = this.mode === "ring" ? this.stepRing(dt) : this.stepClassic(dt);
    const still = settled && !this.dragging;
    this.setStill(still);
    this.renderAll();
    if (!still) this.raf = requestAnimationFrame(this.tick);
  };

  private stepRing(dt: number) {
    if (this.reduced && !this.dragging) {
      this.cur = this.target;
      this.vel = 0;
      return true;
    }
    const h = dt / SUBSTEPS;
    for (let i = 0; i < SUBSTEPS; i++) {
      const acc = -K * (this.cur - this.target) - C * this.vel;
      this.vel += acc * h;
      this.cur += this.vel * h;
    }
    if (Math.abs(this.cur - this.target) <= 0.0005 && Math.abs(this.vel) <= 0.0005) {
      this.cur = this.target;
      this.vel = 0;
      return true;
    }
    return false;
  }

  private stepClassic(dt: number) {
    let all = true;
    const h = dt / SUBSTEPS;
    this.bodies.forEach((b, a) => {
      const goal = mod(a - this.target, this.N);
      if (Math.abs(goal - b.goal) > this.N / 2) {
        b.trip = true;
        b.from = b.x;
        b.g = goal;
      }
      b.goal = goal;
      if (this.reduced) {
        b.x = b.g = goal;
        b.v = 0;
        b.trip = false;
        return;
      }
      const tau = this.dragging ? 0.016 : b.trip ? 0.1 : 0.03 + LAG * Math.min(goal, 4);
      b.g += (goal - b.g) * (1 - Math.exp(-dt / tau));
      for (let i = 0; i < SUBSTEPS; i++) {
        const acc = -K * (b.x - b.g) - C * b.v;
        b.v += acc * h;
        b.x += b.v * h;
      }
      if (b.trip && Math.abs(b.x - goal) < 0.02) b.trip = false;
      if (!b.trip && Math.abs(b.x - goal) <= 0.0006 && Math.abs(b.v) <= 0.0006 && Math.abs(b.g - goal) <= 0.0006) {
        b.x = b.g = goal;
        b.v = 0;
      } else all = false;
    });
    return all;
  }

  private setStill(still: boolean) {
    if (still === this.still) return;
    this.still = still;
    this.root.classList.toggle("rw--still", still);
  }

  /* ───────────────────────── index ───────────────────────── */

  private rank(a: number) {
    const base = Math.round(this.target);
    if (this.mode === "ring") {
      let k = mod(a - base, this.N);
      if (k > this.N / 2) k -= this.N;
      return k;
    }
    return mod(a - base, this.N);
  }

  private updateRanks() {
    const limit = this.mode === "ring" ? 2 : 3;
    this.bodies.forEach((b, a) => {
      const k = this.rank(a);
      const reachable = k !== 0 && Math.abs(k) <= limit;
      if (b.hit) b.hit.tabIndex = reachable ? 0 : -1;
      if (reachable) b.el.removeAttribute("aria-hidden");
      else b.el.setAttribute("aria-hidden", "true");
    });
  }

  private setIndex(i: number) {
    i = mod(i, this.n);
    const changed = i !== this.index || this.first;
    const silent = this.first;
    this.index = i;
    this.updateRanks();
    this.kick();
    if (!changed) return;
    this.first = false;

    this.closePopup();
    if (this.mobile) this.closeSheet(false);
    this.root.style.setProperty("--rw-progress", ((i + 1) / this.n).toFixed(3));

    this.heroes.forEach((hero, j) => {
      const on = j === i;
      hero.classList.toggle("was", hero.classList.contains("is-on") && !on);
      hero.classList.toggle("is-on", on);
      hero.setAttribute("aria-hidden", String(!on));
      const zoom = hero.querySelector<HTMLElement>("[data-rw-zoom]");
      if (zoom) zoom.tabIndex = on ? 0 : -1;
    });

    if (!silent) {
      if (!this.reduced) this.replay(this.stage, "is-sweep");
      if (this.live) this.live.textContent = this.heroes[i].dataset.label ?? "";
    }

    this.ticks.forEach((tick, j) => {
      tick.setAttribute("aria-current", String(j === i));
      tick.classList.toggle("is-past", j < i);
    });

    if (!silent) {
      this.panels.forEach((p, j) => {
        p.hidden = j !== i;
        p.classList.remove("is-in");
      });
      void this.panels[i].offsetWidth;
      this.panels[i].classList.add("is-in");
    }
    const text = this.panels[i].dataset.rwPiecesText ?? "";
    if (this.piecesLabel) {
      this.piecesLabel.textContent = text;
      if (!silent) this.replay(this.piecesLabel, "is-swap");
    }

    this.clearHot();
    this.restartBar();
  }

  private replay(el: HTMLElement, cls: string) {
    el.classList.remove(cls);
    void el.offsetWidth;
    el.classList.add(cls);
  }

  private moveTo(T: number) {
    this.target = T;
    this.setStill(false);
    this.setIndex(mod(T, this.n));
    this.kick();
  }

  next() {
    this.moveTo(Math.round(this.target) + 1);
  }

  prev() {
    this.moveTo(Math.round(this.target) - 1);
  }

  go(i: number) {
    let d = mod(i - this.index, this.n);
    if (d > this.n / 2) d -= this.n;
    this.moveTo(Math.round(this.target) + d);
  }

  /* ───────────────────────── autoplay ───────────────────────── */

  private play(on: boolean) {
    this.playing = on;
    this.root.classList.toggle("is-playing", on);
    this.autoBtn?.setAttribute("aria-pressed", String(on));
    this.restartBar();
  }

  private restartBar() {
    this.ticks.forEach((t) => t.classList.remove("is-run"));
    window.clearTimeout(this.timer);
    if (!this.playing) return;
    const tick = this.ticks[this.index];
    void tick?.offsetWidth;
    tick?.classList.add("is-run");
    this.timer = window.setTimeout(() => {
      const free =
        this.playing && this.visible && !this.dragging && !document.hidden && !this.panelHover && !this.zoomed && !this.engaged;
      if (free) this.next();
      else this.restartBar();
    }, this.speed);
  }

  private engage() {
    this.engaged = true;
    if (this.playing) this.play(false);
  }

  /* ───────────────────────── events ───────────────────────── */

  private bindEvents() {
    const opts = { signal: this.ac.signal };
    const { root, stage } = this;

    root.addEventListener(
      "click",
      (e) => {
        if (performance.now() < this.suppressClickUntil) {
          e.preventDefault();
          e.stopPropagation();
        }
      },
      { capture: true, signal: this.ac.signal },
    );
    root.addEventListener("click", (e) => this.onClick(e), opts);
    root.addEventListener("change", (e) => this.onChange(e), opts);
    root.addEventListener("keydown", (e) => this.onKey(e), opts);

    stage.addEventListener("keydown", (e) => {
      if (e.key === "ArrowRight") {
        e.preventDefault();
        this.next();
      } else if (e.key === "ArrowLeft") {
        e.preventDefault();
        this.prev();
      }
    }, opts);

    stage.addEventListener("pointerdown", (e) => this.onPointerDown(e), opts);
    stage.addEventListener("pointermove", (e) => this.onPointerMove(e), opts);
    stage.addEventListener("pointerup", (e) => this.onPointerUp(e), opts);
    stage.addEventListener("pointercancel", (e) => this.onPointerUp(e), opts);
    stage.addEventListener("wheel", (e) => this.onWheel(e), { passive: false, signal: this.ac.signal });

    const panel = this.panelEl;
    if (panel) {
      panel.addEventListener("pointerenter", (e) => {
        if (e.pointerType !== "mouse") return;
        this.panelHover = true;
      }, opts);
      panel.addEventListener("pointerleave", (e) => {
        if (e.pointerType !== "mouse") return;
        this.panelHover = false;
        this.restartBar();
      }, opts);
      panel.addEventListener("pointerover", (e) => {
        if (e.pointerType !== "mouse") return;
        const card = (e.target as Element).closest<HTMLElement>("[data-rw-card]");
        if (card && !card.classList.contains("is-hot")) this.hot(Number(card.dataset.rwCard));
      }, opts);
      panel.addEventListener("pointerout", (e) => {
        const card = (e.target as Element).closest<HTMLElement>("[data-rw-card]");
        if (card && !card.contains(e.relatedTarget as Node | null)) this.clearHot();
      }, opts);
    }

    window.addEventListener("resize", () => {
      window.clearTimeout(this.resizeTimer);
      this.resizeTimer = window.setTimeout(() => this.measure(), 120);
    }, opts);
    document.addEventListener("visibilitychange", () => {
      this.kick();
      this.restartBar();
    }, opts);
  }

  private observe() {
    const io = new IntersectionObserver(
      ([entry]) => {
        this.visible = entry.isIntersecting;
        if (this.visible) this.kick();
      },
      { threshold: 0 },
    );
    io.observe(this.root);
    this.observers.push(io);

    if (this.reduced) {
      this.root.classList.add("is-revealed");
    } else {
      const reveal = new IntersectionObserver(
        ([entry]) => {
          if (!entry.isIntersecting) return;
          reveal.disconnect();
          requestAnimationFrame(() => requestAnimationFrame(() => this.root.classList.add("is-revealed")));
        },
        { threshold: 0, rootMargin: "0px 0px -22% 0px" },
      );
      reveal.observe(this.root);
      this.observers.push(reveal);
    }

    let lastSize = "";
    const ro = new ResizeObserver(([entry]) => {
      const size = `${Math.round(entry.contentRect.width)}x${Math.round(entry.contentRect.height)}`;
      if (size === lastSize) return;
      lastSize = size;
      this.measure();
    });
    ro.observe(this.stage);
    this.observers.push(ro);
  }

  private onClick(e: MouseEvent) {
    const t = e.target as Element;
    if (t.closest(".rw__panel") && t.closest("button, a, input, select, label")) this.engage();
    this.route(t);
  }

  /** Delegated click router, shared by the section and the size-sheet host. */
  private route(t: Element) {
    const closest = <T extends HTMLElement>(sel: string) => t.closest<T>(sel);

    if (closest("[data-rw-pick-close]")) return this.closePicker(this.cardOfPicker(closest("[data-rw-picker]")) ?? this.sheetCard, true);
    if (closest("[data-rw-zoom-close]")) return this.closePopup();
    if (this.zoomed && (t === this.lb || t === this.lbStage)) return this.closePopup();
    if (closest("[data-rw-zoom]")) return this.openPopup();
    if (closest("[data-rw-next]")) return this.next();
    if (closest("[data-rw-prev]")) return this.prev();

    const tick = closest("[data-rw-tick]");
    if (tick) return this.go(Number(tick.dataset.rwTick));

    if (closest("[data-rw-auto]")) {
      if (!this.playing) this.engaged = false;
      return this.play(!this.playing);
    }

    const pin = closest("[data-rw-pin]");
    if (pin) {
      this.engage();
      return this.hot(Number(pin.dataset.rwPin), true);
    }

    const go = closest("[data-rw-go]");
    if (go) {
      const body = go.closest<HTMLElement>("[data-rw-model]");
      const k = this.rank(Number(body?.dataset.index));
      if (k !== 0 && Math.abs(k) < 6) this.moveTo(Math.round(this.target) + k);
      else if (k === 0) this.openPopup();
      return;
    }

    const confirm = closest("[data-rw-confirm]");
    if (confirm) {
      const card = this.cardOfPicker(confirm.closest("[data-rw-picker]"));
      if (card) {
        card.dataset.touched = "1";
        void this.addCards([card]);
      }
      return;
    }

    const add = closest("[data-rw-add]");
    if (add) {
      const card = add.closest<HTMLElement>("[data-rw-card]");
      if (card) this.togglePicker(card);
      return;
    }

    const all = closest("[data-rw-all]");
    if (all) void this.addFullLook(all);
  }

  private onChange(e: Event) {
    const input = (e.target as Element).closest<HTMLInputElement>("input[data-rw-option]");
    this.engage();
    if (!input) return;
    const card = this.cardOfPicker(input.closest("[data-rw-picker]"));
    if (card) this.syncPicker(card, true);
  }

  private onKey(e: KeyboardEvent) {
    if (e.key !== "Escape") return;
    if (this.sheetCard) {
      this.closePicker(this.sheetCard, true);
      return;
    }
    if (this.zoomed) this.closePopup();
  }

  /* ───────────────────────── drag ───────────────────────── */

  private onPointerDown(e: PointerEvent) {
    if (e.pointerType === "mouse" && e.button !== 0) return;
    if (this.zoomed) return;
    this.drag = {
      id: e.pointerId,
      x0: e.clientX,
      y0: e.clientY,
      t: this.target,
      dx: 0,
      active: false,
      samples: [{ x: e.clientX, t: e.timeStamp }],
    };
  }

  private onPointerMove(e: PointerEvent) {
    if (e.pointerType === "mouse") this.moveCursor(e);
    const d = this.drag;
    if (!d || e.pointerId !== d.id) return;
    if (e.pointerType === "mouse" && !(e.buttons & 1)) {
      this.onPointerUp(e);
      return;
    }
    const dx = e.clientX - d.x0;
    const dy = e.clientY - d.y0;
    if (!d.active) {
      if (Math.abs(dy) > 10 && Math.abs(dy) >= Math.abs(dx)) {
        this.drag = null;
        return;
      }
      if (!(Math.abs(dx) > 8 && Math.abs(dx) > 1.2 * Math.abs(dy))) return;
      d.active = true;
      this.dragging = true;
      this.root.classList.add("is-dragging");
      this.cursor?.classList.remove("is-view", "is-link");
      try {
        this.stage.setPointerCapture(e.pointerId);
      } catch {
        // Pointer already released.
      }
      this.setStill(false);
    }
    d.dx = dx;
    d.samples.push({ x: e.clientX, t: e.timeStamp });
    if (d.samples.length > 6) d.samples.shift();
    this.target = d.t - dx / this.unit;
    this.kick();
  }

  private onPointerUp(e: PointerEvent) {
    const d = this.drag;
    if (!d || e.pointerId !== d.id) return;
    this.drag = null;
    if (!d.active) return;
    this.dragging = false;
    this.root.classList.remove("is-dragging");
    this.suppressClickUntil = performance.now() + 60;

    const first = d.samples[0];
    const last = d.samples[d.samples.length - 1];
    const vx = last.t > first.t ? (last.x - first.x) / (last.t - first.t) : 0;
    const sign = -1;
    const from = Math.round(d.t);

    if (this.mobile) {
      const swiped = Math.abs(d.dx) > 30 || Math.abs(vx) > 0.3;
      this.moveTo(swiped ? from + sign * (d.dx > 0 ? 1 : -1) : from);
      return;
    }
    let i = Math.round(this.target + (sign * vx * 160) / this.unit);
    if (i === from && Math.abs(vx) > 0.3) i = from + sign * Math.sign(vx);
    this.moveTo(clamp(i, from - 2, from + 2));
  }

  private onWheel(e: WheelEvent) {
    if (Math.abs(e.deltaX) <= Math.abs(e.deltaY)) return;
    e.preventDefault();
    if (performance.now() < this.wheelLockUntil) return;
    this.wheelAcc += e.deltaX;
    if (Math.abs(this.wheelAcc) > 45) {
      if (this.wheelAcc > 0) this.next();
      else this.prev();
      this.wheelAcc = 0;
      this.wheelLockUntil = performance.now() + 520;
    }
  }

  /* ───────────────────────── cursor ───────────────────────── */

  private setupCursor() {
    if (!this.cursor) return;
    if (!matchMedia("(hover: hover) and (pointer: fine)").matches) {
      this.cursor.remove();
      this.cursor = null;
      return;
    }
    this.root.classList.add("rw--cursor");
    this.stage.addEventListener(
      "pointerleave",
      () => {
        this.cursorState.on = false;
        this.cursor?.classList.remove("is-on", "is-link", "is-view");
      },
      { signal: this.ac.signal },
    );
  }

  private moveCursor(e: PointerEvent) {
    const el = this.cursor;
    if (!el) return;
    const r = this.stage.getBoundingClientRect();
    const c = this.cursorState;
    c.tx = e.clientX - r.left;
    c.ty = e.clientY - r.top;
    if (!c.on) {
      c.on = true;
      c.x = c.tx;
      c.y = c.ty;
      el.classList.add("is-on");
      this.paintCursor();
    }
    const t = e.target as Element;
    el.classList.toggle("is-view", !this.dragging && !!t.closest("[data-rw-zoom]"));
    el.classList.toggle("is-link", !this.dragging && !!t.closest(".rw__pin, .rw__hit"));
    if (!c.running) {
      c.running = true;
      gsap.ticker.add(this.cursorTick);
    }
  }

  private cursorTick = () => {
    const c = this.cursorState;
    const f = this.reduced ? 1 : 0.18;
    c.x += (c.tx - c.x) * f;
    c.y += (c.ty - c.y) * f;
    if (Math.hypot(c.tx - c.x, c.ty - c.y) < 0.2) {
      c.x = c.tx;
      c.y = c.ty;
      c.running = false;
      gsap.ticker.remove(this.cursorTick);
    }
    this.paintCursor();
  };

  private paintCursor() {
    if (this.cursor) this.cursor.style.transform = `translate3d(${this.cursorState.x}px,${this.cursorState.y}px,0)`;
  }

  /* ───────────────────────── hot linking ───────────────────────── */

  private clearHot() {
    this.root.querySelectorAll(".is-hot").forEach((el) => el.classList.remove("is-hot"));
  }

  private hot(n: number, scroll = false) {
    this.clearHot();
    const scope = this.zoomed ? this.lbStage : this.heroes[this.index];
    scope.querySelector(`[data-rw-pin="${n}"]`)?.classList.add("is-hot");
    const card = this.panels[this.index].querySelector<HTMLElement>(`[data-rw-card="${n}"]`);
    if (!card) return;
    card.classList.add("is-hot");
    if (scroll) this.revealCard(card);
  }

  private revealCard(card: HTMLElement) {
    const list = card.closest<HTMLElement>(".rw__items");
    const behavior: ScrollBehavior = this.reduced ? "auto" : "smooth";
    if (list && list.scrollWidth > list.clientWidth + 1) {
      const left = list.scrollLeft + card.getBoundingClientRect().left - list.getBoundingClientRect().left - 20;
      list.scrollTo({ left, behavior });
    } else if (list && list.scrollHeight > list.clientHeight + 1) {
      list.scrollTo({ top: card.offsetTop - list.offsetTop - 12, behavior });
    } else {
      const r = card.getBoundingClientRect();
      if (r.top < 0 || r.bottom > innerHeight - 140) window.scrollBy({ top: r.top - 0.3 * innerHeight, behavior });
    }
  }

  /* ───────────────────────── pickers ───────────────────────── */

  private pickerOf(card: HTMLElement) {
    const id = card.querySelector("[data-rw-add]")?.getAttribute("aria-controls");
    return id ? document.getElementById(id) : null;
  }

  private cardOfPicker(picker: Element | null) {
    const id = (picker as HTMLElement | null)?.dataset.rwFor;
    return id ? document.getElementById(id) : null;
  }

  /** Recomputes availability, the confirm state and the selected variant. */
  private syncPicker(card: HTMLElement, touched: boolean) {
    const picker = this.pickerOf(card);
    const product = products[card.dataset.product as ProductId];
    if (!picker || !product) return;
    const checked = picker.querySelector<HTMLInputElement>("input[data-rw-option]:checked");
    const match = product.variants.find((v) => v.a && v.o[0] === checked?.value);

    picker.querySelectorAll<HTMLInputElement>("input[data-rw-option]").forEach((input) => {
      const available = product.variants.some((v) => v.a && v.o[0] === input.value);
      input.closest(".rw__pill")?.classList.toggle("is-unavailable", !available);
    });

    const confirm = picker.querySelector<HTMLButtonElement>("[data-rw-confirm]");
    const label = picker.querySelector<HTMLElement>("[data-rw-confirm-label]");
    if (confirm) confirm.disabled = !match;
    if (label) label.textContent = match ? label.dataset.add ?? "" : this.root.dataset.msgSoldout ?? "";

    if (match) card.dataset.selected = String(match.id);
    else delete card.dataset.selected;
    if (touched) card.dataset.touched = "1";
  }

  private togglePicker(card: HTMLElement) {
    if (card.classList.contains("is-added") || card.classList.contains("is-loading")) return;
    if (card.classList.contains("is-picking")) this.closePicker(card, false);
    else this.openPicker(card);
  }

  private openPicker(card: HTMLElement) {
    const picker = this.pickerOf(card);
    if (!picker) return;
    if (this.mobile) {
      if (this.sheetCard && this.sheetCard !== card) this.closePicker(this.sheetCard, false);
      const host = this.ensureSheetHost();
      host.appendChild(picker);
      this.sheetCard = card;
      host.classList.add("is-open");
      this.root.classList.add("rw--picking");
    }
    picker.hidden = false;
    card.classList.add("is-picking");
    card.querySelector("[data-rw-add]")?.setAttribute("aria-expanded", "true");
    picker.querySelector<HTMLInputElement>("input:checked")?.focus({ preventScroll: true });
    if (!this.mobile) this.revealCard(card);
  }

  private closePicker(card: HTMLElement | null, focusBack: boolean) {
    if (!card) return;
    const picker = this.pickerOf(card);
    if (picker) {
      picker.hidden = true;
      if (picker.parentElement !== card) card.appendChild(picker);
    }
    card.classList.remove("is-picking");
    const add = card.querySelector<HTMLElement>("[data-rw-add]");
    if (add && !card.classList.contains("is-added")) add.setAttribute("aria-expanded", "false");
    if (this.sheetCard === card) {
      this.sheetCard = null;
      this.sheetHost?.classList.remove("is-open");
      this.root.classList.remove("rw--picking");
    }
    if (focusBack) add?.focus({ preventScroll: true });
  }

  private closeSheet(focusBack: boolean) {
    if (this.sheetCard) this.closePicker(this.sheetCard, focusBack);
  }

  private ensureSheetHost() {
    if (!this.sheetHost) {
      const host = document.createElement("div");
      host.className = "rw-sheet-host";
      const scrim = document.createElement("button");
      scrim.type = "button";
      scrim.className = "rw__pick-scrim";
      scrim.dataset.rwPickClose = "";
      scrim.tabIndex = -1;
      scrim.setAttribute("aria-hidden", "true");
      host.appendChild(scrim);
      const opts = { signal: this.ac.signal };
      host.addEventListener("click", (e) => this.route(e.target as Element), opts);
      host.addEventListener("change", (e) => this.onChange(e), opts);
      host.addEventListener("keydown", (e) => this.onKey(e), opts);
      document.body.appendChild(host);
      this.sheetHost = host;
    }
    const cs = getComputedStyle(this.root);
    for (const v of SHEET_VARS) this.sheetHost.style.setProperty(v, cs.getPropertyValue(v));
    this.sheetHost.style.fontFamily = cs.fontFamily;
    this.sheetHost.style.color = cs.color;
    return this.sheetHost;
  }

  /* ───────────────────────── bag ───────────────────────── */

  private setMsg(panel: HTMLElement, text: string) {
    const msg = panel.querySelector<HTMLElement>("[data-rw-msg]");
    if (!msg) return;
    msg.textContent = text;
    if (text) this.replay(msg, "is-in");
  }

  private markAdded(card: HTMLElement) {
    card.classList.remove("is-loading");
    this.closePicker(card, false);
    card.classList.add("is-added");
    const add = card.querySelector<HTMLElement>("[data-rw-add]");
    if (add) {
      add.setAttribute("aria-label", add.dataset.addedLabel ?? "");
      add.removeAttribute("aria-expanded");
    }
    if (!this.reduced && "vibrate" in navigator) navigator.vibrate?.(12);
  }

  private checkComplete(panel: HTMLElement) {
    const cards = [...panel.querySelectorAll<HTMLElement>("[data-rw-card]")];
    if (cards.length >= 2 && cards.every((c) => c.classList.contains("is-added"))) {
      panel.classList.add("is-complete");
      this.setMsg(panel, "");
    }
  }

  private async addCards(cards: HTMLElement[]) {
    const panel = cards[0]?.closest<HTMLElement>("[data-rw-panel]");
    if (!panel) return;
    const ready = cards.filter((c) => c.dataset.selected && !c.classList.contains("is-added"));
    if (!ready.length) return;
    this.setMsg(panel, "");
    ready.forEach((c) => c.classList.add("is-loading"));
    try {
      await bag.add(ready.map((c) => ({ id: Number(c.dataset.selected), quantity: 1 })));
      ready.forEach((c) => this.markAdded(c));
      this.checkComplete(panel);
    } catch {
      ready.forEach((c) => c.classList.remove("is-loading"));
      this.setMsg(panel, this.root.dataset.msgError ?? "");
    }
  }

  private async addFullLook(cta: HTMLElement) {
    const panel = cta.closest<HTMLElement>("[data-rw-panel]");
    if (!panel || panel.classList.contains("is-complete") || cta.classList.contains("is-loading")) return;
    this.setMsg(panel, "");
    const cards = [...panel.querySelectorAll<HTMLElement>("[data-rw-card]")].filter((c) => !c.classList.contains("is-added"));
    // Sizes are never guessed: the pre-checked default only counts once touched.
    const ready = cards.filter((c) => c.dataset.touched === "1" && c.dataset.selected);
    const pending = cards.filter((c) => !ready.includes(c));

    if (ready.length) {
      cta.classList.add("is-loading");
      await this.addCards(ready);
      cta.classList.remove("is-loading");
    }
    if (pending.length) {
      (this.mobile ? pending.slice(0, 1) : pending).forEach((c) => {
        if (!c.classList.contains("is-picking")) this.openPicker(c);
      });
      this.revealCard(pending[0]);
      const titles = pending.map((c) => c.dataset.title).join(", ");
      this.setMsg(panel, (this.root.dataset.msgChoose ?? "").replace("[items]", titles));
    }
  }

  /* ───────────────────────── popup ───────────────────────── */

  private openPopup() {
    if (this.zoomed) return;
    const hero = this.heroes[this.index];
    const srcFigure = hero.querySelector<HTMLElement>(".rw__figure");
    if (!srcFigure) return;
    this.engage();
    this.clearHot();
    window.clearTimeout(this.lbClearTimer);

    const model = document.createElement("div");
    model.className = "rw__lb-model";
    const shadow = hero.querySelector(".rw__shadow")?.cloneNode(true);
    const figure = srcFigure.cloneNode(true) as HTMLElement;
    figure.querySelector("[data-rw-zoom]")?.remove();
    figure.querySelectorAll<HTMLElement>(".rw__pin").forEach((p) => (p.tabIndex = 0));
    figure.querySelectorAll("img").forEach((img) => {
      img.loading = "eager";
      img.classList.add("is-decoded");
    });
    const foot = hero.style.getPropertyValue("--rw-foot");
    if (foot) model.style.setProperty("--rw-foot", foot);
    if (shadow) model.appendChild(shadow);
    model.appendChild(figure);
    this.lbStage.replaceChildren(model);

    const word = this.lb.dataset.word ?? "Look";
    const kicker = this.lb.querySelector("[data-rw-lb-kicker]");
    const name = this.lb.querySelector("[data-rw-lb-name]");
    if (kicker) kicker.textContent = `${word} ${String(this.index + 1).padStart(2, "0")}`;
    if (name) name.textContent = hero.dataset.name ?? "";

    this.zoomed = true;
    this.lbHero = hero;
    this.root.classList.add("rw--zoom");
    this.lb.setAttribute("aria-hidden", "false");

    const sr = this.lbStage.getBoundingClientRect();
    const h = Math.max(160, Math.min(sr.height, sr.width / 0.5625));
    model.style.setProperty("--rw-model-h", `${h}px`);
    figure.querySelectorAll("img").forEach((img) => (img.sizes = `${Math.round(h * 0.5625)}px`));

    if (!this.reduced) {
      gsap.set(model, { transformOrigin: "0% 100%" });
      gsap.from(model, { ...this.flipFrom(srcFigure, figure), duration: 0.95, ease: "expo.out" });
    }
    this.lb.querySelector<HTMLElement>("[data-rw-zoom-close]")?.focus({ preventScroll: true });
  }

  /** Transform that puts the popup figure exactly over the runway figure. */
  private flipFrom(runway: HTMLElement, popup: HTMLElement) {
    const a = runway.getBoundingClientRect();
    const b = popup.getBoundingClientRect();
    return { x: a.left - b.left, y: a.bottom - b.bottom, scale: b.height ? a.height / b.height : 1 };
  }

  private closePopup() {
    if (!this.zoomed) return;
    this.zoomed = false;
    const model = this.lbStage.firstElementChild as HTMLElement | null;
    const runway = this.lbHero?.querySelector<HTMLElement>(".rw__figure");
    const figure = model?.querySelector<HTMLElement>(".rw__figure");
    if (model && runway && figure && !this.reduced) {
      gsap.killTweensOf(model);
      gsap.set(model, { x: 0, y: 0, scale: 1 });
      gsap.to(model, { ...this.flipFrom(runway, figure), duration: 0.95, ease: "expo.out" });
    }
    this.root.classList.remove("rw--zoom");
    const hadFocus = this.lb.contains(document.activeElement);
    this.lb.setAttribute("aria-hidden", "true");
    if (hadFocus) this.stage.focus({ preventScroll: true });
    this.clearHot();
    this.lbClearTimer = window.setTimeout(() => {
      if (!this.zoomed) this.lbStage.replaceChildren();
    }, 950);
  }

  /* ───────────────────────── feet detection ───────────────────────── */

  /** Finds the lowest opaque row so soles touch the floor line. */
  private detectFeet() {
    this.heroes.forEach((hero, i) => {
      const src = hero.dataset.probe;
      if (!src) return;
      const img = new Image();
      img.crossOrigin = "anonymous";
      img.onload = () => {
        try {
          const w = 48;
          const h = Math.max(1, Math.round((w * img.naturalHeight) / img.naturalWidth));
          const canvas = document.createElement("canvas");
          canvas.width = w;
          canvas.height = h;
          const ctx = canvas.getContext("2d", { willReadFrequently: true });
          if (!ctx) return;
          ctx.drawImage(img, 0, 0, w, h);
          const data = ctx.getImageData(0, 0, w, h).data;
          let last = -1;
          for (let y = h - 1; y >= 0 && last < 0; y--) {
            for (let x = 0; x < w; x++) {
              if (data[(y * w + x) * 4 + 3] > 40) {
                last = y;
                break;
              }
            }
          }
          if (last < 0) return;
          const foot = clamp((h - 1 - last) / h, 0, 0.4).toFixed(4);
          hero.style.setProperty("--rw-foot", foot);
          this.bodies.forEach((b) => b.look === i && b.el.style.setProperty("--rw-foot", foot));
        } catch {
          // Tainted canvas: keep offset 0.
        }
      };
      img.src = src;
    });
  }

  /* ───────────────────────── teardown ───────────────────────── */

  destroy() {
    cancelAnimationFrame(this.raf);
    this.raf = 0;
    window.clearTimeout(this.timer);
    window.clearTimeout(this.resizeTimer);
    window.clearTimeout(this.lbClearTimer);
    gsap.ticker.remove(this.cursorTick);
    this.ac.abort();
    this.observers.forEach((o) => o.disconnect());
    this.closeSheet(false);
    this.sheetHost?.remove();
    this.sheetHost = null;
    this.lbStage.replaceChildren();
    this.actors.querySelectorAll("[data-rw-clone]").forEach((el) => el.remove());
    this.root.classList.remove("rw--js", "is-revealed", "rw--still", "is-playing", "rw--zoom", "rw--cursor", "is-dragging", "rw--picking");
  }
}
