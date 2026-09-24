"use client";

import { useState } from "react";
import { AnimatePresence, MotionConfig } from "framer-motion";
import dynamic from "next/dynamic";
import LoadingScreen from "@/components/LoadingScreen";
import ContentLayersV2 from "@/components/ContentLayersV2";
import { ErrorBoundary } from "@/components/ErrorBoundary";
import { ExperienceProvider, useExperience } from "@/context/ExperienceContext";
import { SfxProvider } from "@/context/SfxContext";

const CreativeMatter = dynamic(() => import("@/components/experience/CreativeMatter"), {
  ssr: false,
});

function PortfolioExperience() {
  const { destination, previewDestination, visited, trace, pulse, pointerEnergy, sessionSeed } = useExperience();

  return (
    <>
      <CreativeMatter
        destination={previewDestination ?? destination}
        visited={visited}
        pulse={pulse}
        pointerEnergy={pointerEnergy}
        channels={trace}
        sessionSeed={sessionSeed}
        quality="auto"
        fallbackLabel="Composition créative interactive"
      />
      <ContentLayersV2 />
    </>
  );
}

export default function Home() {
  const [loading, setLoading] = useState(true);

  return (
    <ErrorBoundary><MotionConfig reducedMotion="user">
      <SfxProvider>
        <ExperienceProvider>
          <div className="relative h-dvh w-full overflow-hidden bg-black" aria-busy={loading}>
              <PortfolioExperience />
              <AnimatePresence>
                {loading ? (
                  <LoadingScreen onLoadingComplete={() => setLoading(false)} />
                ) : null}
              </AnimatePresence>
          </div>
        </ExperienceProvider>
      </SfxProvider>
    </MotionConfig></ErrorBoundary>
  );
}
