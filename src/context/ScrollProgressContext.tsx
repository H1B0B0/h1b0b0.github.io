"use client";

import {
  createContext,
  useContext,
  useRef,
  type ReactNode,
} from "react";

/**
 * ScrollProgressContext
 *
 * Exposes a single source of truth for the cinematic scroll progress (0 → 1)
 * driven by Lenis. R3F camera rig, HUD and act overlays all read from the same
 * ref to avoid React re-renders on every animation frame.
 *
 * `progressRef.current` is the live value, mutated inside the RAF loop. Use it
 * inside `useFrame` / RAF callbacks. `useScrollProgress()` returns the context.
 */

export type ScrollProgressContextValue = {
  /** Mutable ref holding the current normalized scroll progress in [0, 1]. */
  progressRef: React.MutableRefObject<number>;
  /** Mutable ref holding the raw scroll offset in pixels. */
  scrollYRef: React.MutableRefObject<number>;
  /** Imperative scroll-to helper (0 → 1 normalized). Implemented by provider. */
  scrollToProgress: (progress: number) => void;
};

const ScrollProgressContext = createContext<ScrollProgressContextValue | null>(
  null,
);

export function ScrollProgressProvider({
  children,
  progressRef,
  scrollYRef,
  scrollToProgress,
}: {
  children: ReactNode;
  progressRef: React.MutableRefObject<number>;
  scrollYRef: React.MutableRefObject<number>;
  scrollToProgress: (progress: number) => void;
}) {
  const value = { progressRef, scrollYRef, scrollToProgress };
  return (
    <ScrollProgressContext.Provider value={value}>
      {children}
    </ScrollProgressContext.Provider>
  );
}

export function useScrollProgress(): ScrollProgressContextValue {
  const ctx = useContext(ScrollProgressContext);
  if (!ctx) {
    throw new Error(
      "useScrollProgress must be used within a ScrollProgressProvider",
    );
  }
  return ctx;
}

/**
 * Convenience hook returning just the live progress ref. Safe to call outside
 * a provider — it will lazily create a local ref so consumers like R3F camera
 * rigs don't crash during SSR / hydration.
 */
export function useProgressRef(): React.MutableRefObject<number> {
  const fallback = useRef(0);
  return useContext(ScrollProgressContext)?.progressRef ?? fallback;
}
