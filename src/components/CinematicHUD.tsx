"use client";

import { useEffect, useRef, useState } from "react";
import { useLanguage } from "@/i18n/LanguageContext";
import { useScrollProgress } from "@/context/ScrollProgressContext";
import LanguageSelector from "@/components/LanguageSelector";

/**
 * CinematicHUD
 *
 * Fixed overlay UI sitting on top of the 3D Canvas. Renders:
 *   - top-left    : "ETIENNE MENTREL" wordmark
 *   - top-right   : 3-act navigation (clickable → scroll-to)
 *   - bottom-left : current act counter "01 / 03"
 *   - bottom-right: thin vertical progress bar (lerped)
 *   - bottom-center: scroll hint that fades out after first interaction
 *   - 4 corners   : thin crosshair frame lines
 *
 * The HUD reads the live scroll-progress ref and updates its visuals inside a
 * RAF loop. It does not subscribe to React state for progress to avoid
 * triggering re-renders every frame.
 */

const ACTS = [
  { key: "genesis", start: -0.05, end: 0.33 },
  { key: "constellations", start: 0.33, end: 0.66 },
  { key: "signal", start: 0.66, end: 1.01 },
] as const;

type ActKey = (typeof ACTS)[number]["key"];

function currentActIndex(progress: number): number {
  for (let i = 0; i < ACTS.length; i++) {
    if (progress < ACTS[i].end) return i;
  }
  return ACTS.length - 1;
}

export default function CinematicHUD() {
  const { t } = useLanguage();
  const { progressRef, scrollToProgress } = useScrollProgress();

  // Display values: held in refs for the RAF loop, mirrored to state on a
  // throttled cadence so React re-renders stay cheap.
  const [displayProgress, setDisplayProgress] = useState(0);
  const [displayAct, setDisplayAct] = useState(0);
  const [hintVisible, setHintVisible] = useState(true);

  const displayProgressRef = useRef(0);
  const lastUiSyncRef = useRef(0);
  const lastActSyncRef = useRef(0);

  // Fade out the scroll hint as soon as the user starts travelling.
  useEffect(() => {
    const onFirstInput = () => setHintVisible(false);
    window.addEventListener("wheel", onFirstInput, { passive: true, once: true });
    window.addEventListener("touchmove", onFirstInput, { passive: true, once: true });
    window.addEventListener("keydown", onFirstInput, { once: true });
    const timeout = window.setTimeout(() => setHintVisible(false), 6000);
    return () => {
      window.removeEventListener("wheel", onFirstInput);
      window.removeEventListener("touchmove", onFirstInput);
      window.removeEventListener("keydown", onFirstInput);
      window.clearTimeout(timeout);
    };
  }, []);

  // RAF loop: lerp the display progress and sync act/progress state ~15fps.
  useEffect(() => {
    let frameId = 0;
    const tick = () => {
      const target = progressRef.current;
      // Lerp toward the real progress for a smooth HUD readout.
      displayProgressRef.current +=
        (target - displayProgressRef.current) * 0.1;

      const now = performance.now();
      // Throttle React state writes to ~15fps to avoid render thrash.
      if (now - lastUiSyncRef.current > 66) {
        setDisplayProgress(displayProgressRef.current);
        lastUiSyncRef.current = now;
      }
      const newAct = currentActIndex(target);
      if (now - lastActSyncRef.current > 120) {
        setDisplayAct(newAct);
        lastActSyncRef.current = now;
      }
      frameId = requestAnimationFrame(tick);
    };
    frameId = requestAnimationFrame(tick);
    return () => cancelAnimationFrame(frameId);
  }, [progressRef]);

  const handleNav = (actKey: ActKey) => {
    const act = ACTS.find((a) => a.key === actKey);
    if (!act) return;
    // Jump to the midpoint of the act for a clean framing.
    scrollToProgress((act.start + act.end) / 2);
    setHintVisible(false);
  };

  const progressPct = Math.max(0, Math.min(1, displayProgress));
  const actCounter = t.cinematic.actCounter
    .replace("{current}", String(displayAct + 1).padStart(2, "0"))
    .replace("{total}", String(ACTS.length).padStart(2, "0"));

  return (
    <div
      className="pointer-events-none fixed inset-0 z-40 select-none cinematic-mono text-white/50"
      aria-hidden={false}
    >
      {/* Crosshair corner frame lines */}
      <CornerFrame />

      {/* Top-left: wordmark */}
      <div className="absolute top-6 left-6 text-[11px] tracking-[0.25em]">
        ETIENNE&nbsp;MENTREL
      </div>

      {/* Top-right: 3-act navigation & Language Selector */}
      <nav className="pointer-events-auto absolute top-6 right-6 flex items-center gap-5 text-[11px] tracking-[0.25em]">
        {ACTS.map((act, i) => {
          const isActive = displayAct === i;
          return (
            <button
              key={act.key}
              type="button"
              onClick={() => handleNav(act.key)}
              className={
                "transition-colors duration-300 " +
                (isActive
                  ? "text-white"
                  : "text-white/40 hover:text-white/80")
              }
            >
              {t.cinematic.acts[act.key]}
            </button>
          );
        })}
        <div className="w-px h-3 bg-white/20" />
        <LanguageSelector />
      </nav>

      {/* Bottom-left: act counter */}
      <div className="absolute bottom-6 left-6 text-[11px] tracking-[0.3em]">
        {actCounter}
      </div>

      {/* Bottom-right: vertical progress bar */}
      <div className="absolute bottom-6 right-6 flex flex-col items-end gap-2">
        <div
          className="relative h-24 w-px bg-white/15 overflow-hidden"
          aria-label={`Scroll progress ${Math.round(progressPct * 100)}%`}
        >
          <div
            className="absolute left-0 top-0 w-full bg-white transition-[height] duration-150 ease-out"
            style={{ height: `${progressPct * 100}%` }}
          />
        </div>
        <span className="text-[10px] tracking-[0.3em] text-white/40">
          {String(Math.round(progressPct * 100)).padStart(3, "0")}
        </span>
      </div>

      {/* Bottom-center: scroll hint */}
      <div
        className={
          "absolute bottom-6 left-1/2 -translate-x-1/2 text-[10px] tracking-[0.4em] text-white/40 transition-opacity duration-700 " +
          (hintVisible ? "opacity-100" : "opacity-0")
        }
      >
        {t.cinematic.scrollHint}
      </div>
    </div>
  );
}

/** Thin crosshair-style frame lines at the 4 corners. */
function CornerFrame() {
  return (
    <>
      {/* Horizontal full-width hairlines (very faint) */}
      <div className="absolute top-0 left-0 right-0 h-px bg-white/5" />
      <div className="absolute bottom-0 left-0 right-0 h-px bg-white/5" />
      {/* Vertical hairlines on sides */}
      <div className="absolute top-0 bottom-0 left-0 w-px bg-white/5" />
      <div className="absolute top-0 bottom-0 right-0 w-px bg-white/5" />

      {/* Corner brackets (cinematic viewfinder) */}
      <span className="absolute top-3 left-3 h-3 w-3 border-l border-t border-white/30" />
      <span className="absolute top-3 right-3 h-3 w-3 border-r border-t border-white/30" />
      <span className="absolute bottom-3 left-3 h-3 w-3 border-l border-b border-white/30" />
      <span className="absolute bottom-3 right-3 h-3 w-3 border-r border-b border-white/30" />
    </>
  );
}
