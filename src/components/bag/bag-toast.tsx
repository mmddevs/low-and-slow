"use client";

import { useEffect } from "react";
import { AnimatePresence, motion, useReducedMotion } from "motion/react";
import { bag } from "@/lib/bag/store";
import { useBag } from "@/lib/bag/use-bag";

const TOAST_MS = 2500;

/** Bottom status toast; each new toast restarts the timer. */
export function BagToast() {
  const { toast } = useBag();
  const reduced = useReducedMotion();

  useEffect(() => {
    if (!toast) return;
    const id = window.setTimeout(() => bag.dismissToast(toast.id), TOAST_MS);
    return () => window.clearTimeout(id);
  }, [toast]);

  return (
    <div
      id="bag-status"
      role="status"
      aria-live="polite"
      className="pointer-events-none fixed bottom-6 left-1/2 z-[2147483002] -translate-x-1/2"
    >
      <AnimatePresence>
        {toast && (
          <motion.p
            key={toast.id}
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: reduced ? 0 : 0.25 }}
            className="m-0 whitespace-nowrap bg-ink px-5 py-3 text-xs text-white"
          >
            {toast.text}
          </motion.p>
        )}
      </AnimatePresence>
    </div>
  );
}
