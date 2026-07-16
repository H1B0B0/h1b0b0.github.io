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
          <div className="film-grain relative w-full h-[400vh] bg-black">
            <CustomCursor />
            <FPSCounter visible={false} onVisibilityChange={() => {}} />

            {/* Fixed Background Layer (3D Scene) */}
            <ScrollDrivenScene />
            <ImmersiveFXOverlay />

            {/* Fixed Overlay Layers */}
            <ActOverlays />
            <ContentLayers />
            <CinematicHUD />

            {/* Scrollable Content Container (for semantic HTML / future content) */}
            <main className="absolute top-0 left-0 w-full pointer-events-none">
              {/* Spacer sections to establish the scroll height. Act content will eventually go here. */}
              <section id="act-1" className="h-[100vh]" aria-label="Act 1" />
              <section id="act-2" className="h-[100vh]" aria-label="Act 2" />
              <section id="act-3" className="h-[200vh]" aria-label="Act 3" />
            </main>
          </div>
        </ScrollProgressProvider>
      )}
    </ErrorBoundary>
  );
}
