"use client";

import { useSyncExternalStore } from "react";
import { bag, type BagState } from "./store";

export function useBag(): BagState {
  return useSyncExternalStore(bag.subscribe, bag.getSnapshot, bag.getServerSnapshot);
}
