"use client";

import { MotionConfig } from "framer-motion";
import ContentLayersV2 from "@/components/ContentLayersV2";
import { ErrorBoundary } from "@/components/ErrorBoundary";
import { ExperienceProvider } from "@/context/ExperienceContext";
import { SfxProvider } from "@/context/SfxContext";

export default function Home() {
  return (
    <ErrorBoundary><MotionConfig reducedMotion="user">
      <SfxProvider>
        <ExperienceProvider>
          <div className="relative h-dvh w-full overflow-hidden bg-black" aria-busy={false}>
            <ContentLayersV2 />
          </div>
        </ExperienceProvider>
      </SfxProvider>
    </MotionConfig></ErrorBoundary>
  );
}
