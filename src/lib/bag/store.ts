/**
 * Local "styling bag": a shortlist kept in localStorage. No order or payment.
 * Framework-agnostic store, read by React through useSyncExternalStore and
 * written by the imperative runway controller.
 */
import { variantIndex } from "@/data/catalog";

export interface BagEntry {
  id: number;
  quantity: number;
}

export interface BagToast {
  id: number;
  text: string;
}

export interface BagState {
  entries: BagEntry[];
  open: boolean;
  toast: BagToast | null;
}

const STORAGE_KEY = "low-and-slow-bag-v1";
const MAX_QTY = 20;
const MAX_ENTRIES = 50;

const EMPTY: BagState = { entries: [], open: false, toast: null };

let state: BagState = EMPTY;
let loaded = false;
const listeners = new Set<() => void>();

function sanitize(raw: unknown): BagEntry[] {
  if (!Array.isArray(raw)) return [];
  return raw
    .filter(
      (e): e is BagEntry =>
        !!e &&
        Number.isSafeInteger(e.id) &&
        Number.isSafeInteger(e.quantity) &&
        e.quantity >= 1 &&
        e.quantity <= MAX_QTY,
    )
    .slice(0, MAX_ENTRIES)
    .map((e) => ({ id: e.id, quantity: e.quantity }));
}

function ensureLoaded() {
  if (loaded || typeof window === "undefined") return;
  loaded = true;
  try {
    const raw = window.localStorage.getItem(STORAGE_KEY);
    state = { ...state, entries: sanitize(raw ? JSON.parse(raw) : []) };
  } catch {
    // Storage blocked or corrupt: start empty.
  }
}

function save() {
  try {
    window.localStorage.setItem(STORAGE_KEY, JSON.stringify(state.entries));
  } catch {
    // Ignore quota / private mode errors.
  }
}

function set(next: Partial<BagState>) {
  state = { ...state, ...next };
  listeners.forEach((l) => l());
}

let toastSeq = 0;

export const bag = {
  subscribe(listener: () => void) {
    ensureLoaded();
    listeners.add(listener);
    return () => listeners.delete(listener);
  },
  getSnapshot(): BagState {
    ensureLoaded();
    return state;
  },
  getServerSnapshot(): BagState {
    return EMPTY;
  },

  /** Adds variants to the bag. Throws when a variant is unknown or unavailable. */
  async add(items: BagEntry[]): Promise<void> {
    ensureLoaded();
    for (const item of items) {
      const match = variantIndex.get(item.id);
      if (!match || !match.available) throw new Error("Veuillez choisir une taille disponible.");
    }
    const entries = state.entries.map((e) => ({ ...e }));
    for (const item of items) {
      const existing = entries.find((e) => e.id === item.id);
      if (existing) existing.quantity = Math.min(MAX_QTY, existing.quantity + item.quantity);
      else if (entries.length < MAX_ENTRIES) entries.push({ id: item.id, quantity: item.quantity });
    }
    set({
      entries,
      toast: {
        id: ++toastSeq,
        text:
          items.length > 1
            ? "Look enregistré dans votre sac de style"
            : "Pièce enregistrée dans votre sac de style",
      },
    });
    save();
  },

  remove(id: number) {
    set({ entries: state.entries.filter((e) => e.id !== id) });
    save();
  },

  setOpen(open: boolean) {
    set({ open });
  },

  dismissToast(id: number) {
    if (state.toast?.id === id) set({ toast: null });
  },
};

export function bagCount(entries: BagEntry[]): number {
  return entries.reduce((sum, e) => sum + e.quantity, 0);
}
