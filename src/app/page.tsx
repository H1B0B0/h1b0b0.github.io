"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import { MotionConfig } from "framer-motion";
import LoadingScreen from "@/components/LoadingScreen";
import CustomCursor from "@/components/CustomCursor";
import FPSCounter from "@/components/FPSCounter";
import ScrollDrivenScene from "@/components/ScrollDrivenScene";
import ContentLayers from "@/components/ContentLayers";
import { ScrollProgressProvider } from "@/context/ScrollProgressContext";
import { ErrorBoundary } from "@/components/ErrorBoundary";

export default function Home() {
  const [loading, setLoading] = useState(true);

  const progressRef = useRef(0.48);
  const targetProgressRef = useRef(0.48);
  const scrollYRef = useRef(0);

  const moveScene = useCallback((progress: number) => {
    targetProgressRef.current = Math.max(0, Math.min(1, progress));
  }, []);

  useEffect(() => {
    const prefersReduced = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    let frameId = 0;

    const tick = () => {
      const target = targetProgressRef.current;
      const current = progressRef.current;
      progressRef.current = prefersReduced
        ? target
        : current + (target - current) * 0.055;
      frameId = requestAnimationFrame(tick);
    };

    frameId = requestAnimationFrame(tick);
    return () => cancelAnimationFrame(frameId);
  }, []);

  return (
    <ErrorBoundary><MotionConfig reducedMotion="user">
      {loading ? (
        <LoadingScreen onLoadingComplete={() => setLoading(false)} />
      ) : (
        <ScrollProgressProvider
          progressRef={progressRef}
          scrollYRef={scrollYRef}
          scrollToProgress={moveScene}
        >
          <div className="film-grain relative h-dvh w-full overflow-hidden bg-black">
            <CustomCursor />
            <FPSCounter visible={false} onVisibilityChange={() => {}} />

            {/* Fixed Background Layer (3D Scene) */}
            <ScrollDrivenScene />
            <ContentLayers />

          </div>
        </ScrollProgressProvider>
      )}
    </MotionConfig></ErrorBoundary>
  );
}
