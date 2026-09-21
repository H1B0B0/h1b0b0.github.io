"use client";

import { useEffect, useRef, useState } from "react";
import { motion } from "framer-motion";
import { useLanguage } from "@/i18n/LanguageContext";

interface LoadingScreenProps {
  onLoadingComplete?: () => void;
}

export default function LoadingScreen({ onLoadingComplete }: LoadingScreenProps) {
  const { t } = useLanguage();
  const [progress, setProgress] = useState(0);
  const completionRef = useRef(onLoadingComplete);

  useEffect(() => {
    completionRef.current = onLoadingComplete;
  }, [onLoadingComplete]);

  useEffect(() => {
    const startedAt = performance.now();
    let frameId = 0;
    let completionTimer = 0;

    const tick = (now: number) => {
      const next = Math.min(100, ((now - startedAt) / 900) * 100);
      setProgress(next);

      if (next < 100) {
        frameId = requestAnimationFrame(tick);
        return;
      }

      completionTimer = window.setTimeout(() => completionRef.current?.(), 180);
    };

    frameId = requestAnimationFrame(tick);

    return () => {
      cancelAnimationFrame(frameId);
      window.clearTimeout(completionTimer);
    };
  }, []);

  const roundedProgress = Math.round(progress);

  return (
    <motion.div
      className="fixed inset-0 z-50 flex bg-[#050505] p-6 text-white md:p-10"
      exit={{ opacity: 0 }}
      transition={{ duration: 0.2, ease: "easeOut" }}
    >
      <div className="mx-auto flex w-full max-w-[94rem] flex-col justify-between">
        <div className="flex items-start justify-between">
          <p className="cinematic-mono text-[10px] uppercase tracking-[0.22em] text-white/65">
            Etienne Mentrel
          </p>
          <p className="cinematic-mono text-[10px] uppercase tracking-[0.22em] text-white/35">
            Portfolio · 2026
          </p>
        </div>

        <div className="grid items-end gap-8 md:grid-cols-[1fr_auto]">
          <div>
            <p className="cinematic-mono text-[9px] uppercase tracking-[0.2em] text-[#ff6b2c]">
              {t.common.loading}
            </p>
            <h1 className="mt-5 max-w-4xl text-balance text-[clamp(3.5rem,9vw,8rem)] font-medium leading-[0.82] tracking-[-0.065em]">
              Creative
              <span className="font-display block text-white/55">development.</span>
            </h1>
          </div>

          <p className="cinematic-mono text-6xl tabular-nums text-white/20 md:text-8xl">
            {String(roundedProgress).padStart(3, "0")}
          </p>
        </div>

        <div>
          <div className="h-px w-full bg-white/15">
            <div
              className="h-px bg-[#ff6b2c]"
              style={{ transform: `scaleX(${progress / 100})`, transformOrigin: "left" }}
            />
          </div>
          <div className="mt-4 flex items-center justify-between cinematic-mono text-[8px] uppercase tracking-[0.18em] text-white/30">
            <span>Next.js · Three.js · DevOps</span>
            <span className="tabular-nums">{roundedProgress}%</span>
          </div>
        </div>
      </div>
    </motion.div>
  );
}
