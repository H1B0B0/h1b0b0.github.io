"use client";

import { useEffect, useRef } from "react";
import Lenis from "lenis";

/**
 * useLenis — cinematic smooth scroll driver.
 *
 * Initializes a Lenis instance with a slow lerp (0.05) tuned for the
 * "Interstellar" travel feel. It keeps two refs in sync every RAF frame:
 *   - progressRef : normalized scroll progress in [0, 1] across the page
 *   - scrollYRef  : raw pixel offset
 *
 * It also exposes an imperative `scrollToProgress(progress)` via the returned
 * ref so the HUD nav buttons can jump to a specific act.
 *
 * @param progressRef live progress ref shared with R3F + HUD
 * @param scrollYRef  live pixel offset ref
 * @returns the Lenis instance ref (nullable until mount)
 */
export function useLenis(
  progressRef: React.MutableRefObject<number>,
  scrollYRef: React.MutableRefObject<number>,
): React.RefObject<Lenis | null> {
  const lenisRef = useRef<Lenis | null>(null);

  useEffect(() => {
    // Guard against SSR / reduced motion users who prefer native scroll.
    const prefersReduced =
      typeof window !== "undefined" &&
      window.matchMedia("(prefers-reduced-motion: reduce)").matches;

    const lenis = new Lenis({
      lerp: 0.05,
      smoothWheel: true,
      wheelMultiplier: 1.0,
      // Touch feels better slightly damped for the long cinematic scroll.
      touchMultiplier: 1.2,
      infinite: false,
      // Lenis auto-disables the native CSS smooth behavior; we keep ours.
    });
    lenisRef.current = lenis;

    let frameId = 0;
    const raf = (time: number) => {
      lenis.raf(time);
      const scroll = lenis.scroll ?? window.scrollY;
      const maxScroll =
        document.documentElement.scrollHeight - window.innerHeight;
      const progress = maxScroll > 0 ? Math.min(scroll / maxScroll, 1) : 0;
      progressRef.current = progress;
      scrollYRef.current = scroll;
      frameId = requestAnimationFrame(raf);
    };
    frameId = requestAnimationFrame(raf);

    if (prefersReduced) {
      lenis.destroy();
      lenisRef.current = null;
      cancelAnimationFrame(frameId);
      // Fallback to native scroll progress.
      const onScroll = () => {
        const maxScroll =
          document.documentElement.scrollHeight - window.innerHeight;
        progressRef.current =
          maxScroll > 0 ? Math.min(window.scrollY / maxScroll, 1) : 0;
        scrollYRef.current = window.scrollY;
      };
      window.addEventListener("scroll", onScroll, { passive: true });
      onScroll();
      return () => window.removeEventListener("scroll", onScroll);
    }

    return () => {
      cancelAnimationFrame(frameId);
      lenis.destroy();
      lenisRef.current = null;
    };
  }, [progressRef, scrollYRef]);

  return lenisRef;
}

/**
 * Builds an imperative `scrollToProgress` callback bound to a Lenis instance.
 * Used by the HUD navigation to jump between acts.
 */
export function createScrollToProgress(
  lenisRef: React.RefObject<Lenis | null>,
): (progress: number) => void {
  return (progress: number) => {
    const clamped = Math.max(0, Math.min(1, progress));
    const target =
      (document.documentElement.scrollHeight - window.innerHeight) * clamped;
    const lenis = lenisRef.current;
    if (lenis) {
      lenis.scrollTo(target, { immediate: false });
    } else if (typeof window !== "undefined") {
      window.scrollTo({ top: target, behavior: "smooth" });
    }
  };
}
