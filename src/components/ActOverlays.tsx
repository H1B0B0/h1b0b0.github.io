"use client";

import { useEffect, useRef, useState } from "react";
import { useLanguage } from "@/i18n/LanguageContext";
import { useScrollProgress } from "@/context/ScrollProgressContext";

/**
 * ActOverlays
 *
 * Per-act HTML overlays floating above the 3D Canvas. Renders the act title
 * (large, faint, lower-left) that cross-fades as the camera travels between
 * acts. Future chunks can extend this with act-specific copy, captions, etc.
 *
 * State is updated from the shared progress ref inside a throttled RAF loop.
 */
const ACTS = [
  { key: "genesis", start: -0.05, end: 0.33 },
  { key: "constellations", start: 0.33, end: 0.66 },
  { key: "signal", start: 0.66, end: 1.01 },
] as const;

export default function ActOverlays() {
  const { t } = useLanguage();
  const { progressRef } = useScrollProgress();
  const [progress, setProgress] = useState(0);
  const lastSyncRef = useRef(0);

  useEffect(() => {
    let frameId = 0;
    const tick = () => {
      const now = performance.now();
      if (now - lastSyncRef.current > 100) {
        setProgress(progressRef.current);
        lastSyncRef.current = now;
      }
      frameId = requestAnimationFrame(tick);
    };
    frameId = requestAnimationFrame(tick);
    return () => cancelAnimationFrame(frameId);
  }, [progressRef]);

  return (
    <div className="pointer-events-none fixed inset-0 z-0 flex items-center justify-center overflow-hidden cinematic-mono">
      {ACTS.map((act, i) => {
        const fade = actFade(progress, act.start, act.end, 0.05, 0.05) * 0.015;
        if (fade <= 0.001) return null;
        const actTitle = t.cinematic.acts[act.key];
        return (
          <div
            key={act.key}
            className="absolute flex flex-col items-center justify-center w-full"
            style={{ opacity: fade }}
          >
            <div className="text-lg md:text-xl tracking-[0.8em] text-white mb-6">
              ACT&nbsp;{String(i + 1).padStart(2, "0")}
            </div>
            <h1 className="text-[9vw] font-black tracking-[0.08em] text-white leading-none whitespace-nowrap">
              {actTitle.toUpperCase()}
            </h1>
          </div>
        );
      })}
    </div>
  );
}

function actFade(
  progress: number,
  start: number,
  end: number,
  fadeIn: number,
  fadeOut: number,
): number {
  if (progress < start || progress > end) return 0;
  const inT = Math.min(1, (progress - start) / Math.max(0.0001, fadeIn));
  const outT = Math.min(1, (end - progress) / Math.max(0.0001, fadeOut));
  return Math.min(inT, outT);
}
