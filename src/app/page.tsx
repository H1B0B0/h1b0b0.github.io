"use client";

import { useState, useRef } from "react";
import LoadingScreen from "@/components/LoadingScreen";
import CustomCursor from "@/components/CustomCursor";
import FPSCounter from "@/components/FPSCounter";
import ScrollDrivenScene from "@/components/ScrollDrivenScene";
import CinematicHUD from "@/components/CinematicHUD";
import ActOverlays from "@/components/ActOverlays";
import ContentLayers from "@/components/ContentLayers";
import ImmersiveFXOverlay from "@/components/ImmersiveFXOverlay";
import { ScrollProgressProvider } from "@/context/ScrollProgressContext";
import { useLenis, createScrollToProgress } from "@/hooks/useLenis";
import { ErrorBoundary } from "@/components/ErrorBoundary";

export default function Home() {
  const [loading, setLoading] = useState(true);

  const progressRef = useRef(0);
  const scrollYRef = useRef(0);
  const lenisRef = useLenis(progressRef, scrollYRef);
  const scrollToProgress = createScrollToProgress(lenisRef);

  return (
    <ErrorBoundary>
      {loading ? (
        <LoadingScreen onLoadingComplete={() => setLoading(false)} />
      ) : (
        <ScrollProgressProvider
          progressRef={progressRef}
          scrollYRef={scrollYRef}
          scrollToProgress={scrollToProgress}
        >
          <div className="film-grain relative min-h-[700dvh] w-full bg-black">
            <CustomCursor />
            <FPSCounter visible={false} onVisibilityChange={() => {}} />

            {/* Fixed Background Layer (3D Scene) */}
            <ScrollDrivenScene />
            <ImmersiveFXOverlay />

            {/* Fixed Overlay Layers */}
            <ActOverlays />
            <ContentLayers />
            <CinematicHUD />

          </div>
        </ScrollProgressProvider>
      )}
    </ErrorBoundary>
  );
}
