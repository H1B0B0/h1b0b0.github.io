"use client";

import { AnimatePresence, motion, useMotionTemplate, useMotionValue, useSpring, useReducedMotion } from "framer-motion";
import Image from "next/image";
import { useCallback, useEffect, useRef, useState } from "react";
import LanguageSelector from "@/components/LanguageSelector";
import ProjectLayers from "@/components/ProjectLayers";
import { useScrollProgress } from "@/context/ScrollProgressContext";
import { useLanguage } from "@/i18n/LanguageContext";

const ENGLISH_RESUME_URL = "https://cvdesignr.com/p/67c9a21b5458a?hl=fr_FR";
const FRENCH_RESUME_URL = "https://cvdesignr.com/p/647b251d89bf4?hl=fr_FR";

const NODE_ORDER = ["bluevidia", "profile", "contact"] as const;
type NodeId = (typeof NODE_ORDER)[number];
type SpaceId = "orbit" | NodeId;

const NODE_SCENE_TARGETS: Record<NodeId, number> = {
  bluevidia: 0.48,
  profile: 0.13,
  contact: 0.83,
};

const LENS_SIGNAL_COORDINATES = [
  { x: 0.3, y: 0.24 },
  { x: 0.7, y: 0.52 },
  { x: 0.34, y: 0.79 },
] as const;

const LENS_SIGNAL_POSITIONS = [
  "left-[1%] top-[10%] md:left-[4%] md:top-[5%]",
  "right-[1%] top-[42%] md:right-[5%] md:top-[39%]",
  "bottom-[5%] left-[8%] md:bottom-[1%] md:left-[16%]",
] as const;

const BLUEVIDIA_FALLBACK = "https://dabvh53eklx61.cloudfront.net/2U9A0008.jpg";

function Arrow({ back = false, diagonal = false }: { back?: boolean; diagonal?: boolean }) {
  const path = back
    ? "M19 12H5m5 5-5-5 5-5"
    : diagonal
      ? "M7 17 17 7M8 7h9v9"
      : "M5 12h14m-5-5 5 5-5 5";

  return (
    <svg aria-hidden="true" className="size-4 shrink-0" fill="none" viewBox="0 0 24 24">
      <path d={path} stroke="currentColor" strokeLinecap="round" strokeLinejoin="round" strokeWidth="1.5" />
    </svg>
  );
}

function SectionLabel({ children }: { children: React.ReactNode }) {
  return (
    <p className="cinematic-mono flex items-center gap-3 text-[8px] uppercase tracking-[0.22em] text-white/45 md:text-[10px]">
      <span className="h-px w-7 bg-white/25" aria-hidden="true" />
      {children}
    </p>
  );
}

export default function ContentLayers() {
  const { currentLanguage, t } = useLanguage();
  const { scrollToProgress } = useScrollProgress();
  const [activeSpace, setActiveSpace] = useState<SpaceId>("orbit");
  const [focusedNode, setFocusedNode] = useState<NodeId>("bluevidia");
  const [projectAngle, setProjectAngle] = useState(0);
  const [transitionTarget, setTransitionTarget] = useState<SpaceId | null>(null);
  const wheelGestureRef = useRef(false);
  const wheelResetTimerRef = useRef<number | null>(null);
  const spaceTransitionTimerRef = useRef<number | null>(null);
  const resumeUrl = currentLanguage === "fr" ? FRENCH_RESUME_URL : ENGLISH_RESUME_URL;

  const closeSpace = useCallback((writeHistory = true) => {
    setActiveSpace("orbit");
    if (writeHistory) {
      window.history.pushState(null, "", `${window.location.pathname}${window.location.search}`);
    }
  }, []);

  const openSpace = useCallback((space: NodeId, writeHistory = true) => {
    setFocusedNode(space);
    setActiveSpace(space);
    if (space === "bluevidia") setProjectAngle(0);
    if (writeHistory) window.history.pushState(null, "", `#${space}`);
  }, []);

  const travelTo = useCallback((space: SpaceId) => {
    if (space === activeSpace || transitionTarget !== null) return;

    const commit = () => {
      if (space === "orbit") closeSpace();
      else openSpace(space);
    };

    if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) {
      commit();
      return;
    }

    setTransitionTarget(space);
    spaceTransitionTimerRef.current = window.setTimeout(commit, 480);
  }, [activeSpace, closeSpace, openSpace, transitionTarget]);

  const cycleNode = useCallback((direction: number) => {
    setFocusedNode((current) => {
      const index = NODE_ORDER.indexOf(current);
      return NODE_ORDER[(index + direction + NODE_ORDER.length) % NODE_ORDER.length];
    });
  }, []);

  const cycleProjectAngle = useCallback((direction: number) => {
    setProjectAngle((current) => (current + direction + 3) % 3);
  }, []);

  useEffect(() => {
    const syncFromHash = () => {
      const hash = window.location.hash.replace("#", "") as NodeId;
      if (NODE_ORDER.includes(hash)) openSpace(hash, false);
      else closeSpace(false);
    };

    syncFromHash();
    window.addEventListener("popstate", syncFromHash);
    window.addEventListener("hashchange", syncFromHash);
    return () => {
      window.removeEventListener("popstate", syncFromHash);
      window.removeEventListener("hashchange", syncFromHash);
    };
  }, [closeSpace, openSpace]);

  useEffect(() => {
    if (activeSpace === "orbit") {
      scrollToProgress(NODE_SCENE_TARGETS[focusedNode]);
      return;
    }

    if (activeSpace === "bluevidia") {
      scrollToProgress([0.39, 0.49, 0.59][projectAngle]);
      return;
    }

    scrollToProgress(NODE_SCENE_TARGETS[activeSpace]);
  }, [activeSpace, focusedNode, projectAngle, scrollToProgress]);

  useEffect(() => {
    const onKeyDown = (event: KeyboardEvent) => {
      if ((event.target as HTMLElement).closest("button, a, input, textarea, select, [contenteditable]")) return;
      if (event.key === "Escape" && activeSpace !== "orbit") {
        travelTo("orbit");
        return;
      }

      if (["ArrowRight", "ArrowDown"].includes(event.key)) {
        event.preventDefault();
        if (activeSpace === "orbit") cycleNode(1);
        else if (activeSpace === "bluevidia") cycleProjectAngle(1);
      }

      if (["ArrowLeft", "ArrowUp"].includes(event.key)) {
        event.preventDefault();
        if (activeSpace === "orbit") cycleNode(-1);
        else if (activeSpace === "bluevidia") cycleProjectAngle(-1);
      }

      if (event.key === "Enter" && activeSpace === "orbit") {
        travelTo(focusedNode);
      }
    };

    window.addEventListener("keydown", onKeyDown);
    return () => window.removeEventListener("keydown", onKeyDown);
  }, [activeSpace, cycleNode, cycleProjectAngle, focusedNode, travelTo]);

  useEffect(() => {
    return () => {
      if (wheelResetTimerRef.current !== null) {
        window.clearTimeout(wheelResetTimerRef.current);
      }
      if (spaceTransitionTimerRef.current !== null) {
        window.clearTimeout(spaceTransitionTimerRef.current);
      }
    };
  }, []);

  const handleWheel = (event: React.WheelEvent<HTMLElement>) => {
    if (window.matchMedia("(max-width: 1199px), (max-height: 650px)").matches) return;
    if (wheelResetTimerRef.current !== null) {
      window.clearTimeout(wheelResetTimerRef.current);
    }
    wheelResetTimerRef.current = window.setTimeout(() => {
      wheelGestureRef.current = false;
    }, 220);

    if (Math.abs(event.deltaY) < 10 || wheelGestureRef.current) return;
    wheelGestureRef.current = true;
    const direction = event.deltaY > 0 ? 1 : -1;
    if (activeSpace === "orbit") cycleNode(direction);
    else if (activeSpace === "bluevidia") cycleProjectAngle(direction);
  };

  return (
    <main className="fixed inset-0 z-10 overflow-hidden" onWheel={handleWheel}>
      <header className={`portfolio-header ${activeSpace === "contact" ? "is-light" : ""} pointer-events-none absolute inset-x-0 top-0 z-40 flex items-center justify-between px-5 pb-4 pt-5 md:px-8 md:pt-7`}>
        <div className="pointer-events-auto">
          {activeSpace === "orbit" ? (
            <p className="cinematic-mono text-[9px] uppercase tracking-[0.24em] text-white/55 md:text-[10px]">
              Etienne Mentrel
            </p>
          ) : (
            <button
              type="button"
              aria-label={t.experience.backToMap}
              onClick={() => travelTo("orbit")}
              className="group flex min-h-10 items-center gap-3 text-[9px] uppercase tracking-[0.2em] text-white/60 transition-colors duration-200 hover:text-white"
            >
              <span className="flex size-8 items-center justify-center rounded-full border border-white/20 transition-colors duration-200 group-hover:border-white/50">
                <Arrow back />
              </span>
              <span className="hidden sm:inline">{t.experience.backToMap}</span>
            </button>
          )}
        </div>

        <div className="pointer-events-auto flex items-center gap-4">
          <span className="hidden cinematic-mono text-[8px] uppercase tracking-[0.2em] text-white/30 sm:block">
            {t.experience.edition}
          </span>
          <LanguageSelector />
        </div>
      </header>

      <AnimatePresence mode="wait">
        {activeSpace === "orbit" ? (
          <OrientationHub
            key="orbit"
            focusedNode={focusedNode}
            onFocus={setFocusedNode}
            onOpen={travelTo}
          />
        ) : activeSpace === "bluevidia" ? (
          <BlueVidiaSpace key="bluevidia" angle={projectAngle} onAngleChange={setProjectAngle} />
        ) : activeSpace === "profile" ? (
          <ProfileSpace key="profile" resumeUrl={resumeUrl} />
        ) : (
          <ContactSpace key="contact" resumeUrl={resumeUrl} />
        )}
      </AnimatePresence>

      <AnimatePresence>
        {transitionTarget !== null && (
          <motion.div
            key={transitionTarget}
            className="space-transition pointer-events-auto fixed inset-0 z-[80] flex items-center justify-center overflow-hidden text-white"
            initial={{ clipPath: "circle(0% at 50% 50%)" }}
            animate={{
              clipPath: [
                "circle(0% at 50% 50%)",
                "circle(150% at 50% 50%)",
                "circle(150% at 50% 50%)",
                "circle(0% at 50% 50%)",
              ],
            }}
            transition={{ duration: 1.08, times: [0, 0.38, 0.62, 1], ease: [0.76, 0, 0.24, 1] }}
            onAnimationComplete={() => setTransitionTarget(null)}
          >
            <motion.span
              aria-hidden="true"
              className="space-transition-ring"
              animate={{ scale: [0.2, 1, 1.18], opacity: [0, 1, 0] }}
              transition={{ duration: 1.08, times: [0, 0.52, 1], ease: [0.16, 1, 0.3, 1] }}
            />
            <motion.div
              className="relative z-10 flex flex-col items-center text-center"
              animate={{ opacity: [0, 1, 1, 0], scale: [0.9, 1, 1, 1.08] }}
              transition={{ duration: 1.08, times: [0, 0.32, 0.68, 1], ease: "easeInOut" }}
            >
              <span className="cinematic-mono text-[9px] uppercase tracking-[0.28em] text-[#ff9466]">
                {transitionTarget === "orbit" ? "00 — index" : `0${NODE_ORDER.indexOf(transitionTarget) + 1} — signal`}
              </span>
              <span className="mt-3 text-[clamp(3.5rem,10vw,9rem)] font-medium leading-none tracking-[-0.08em]">
                {transitionTarget === "orbit" ? "Index" : t.experience.nodes[transitionTarget].label}
              </span>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

    </main>
  );
}

function OrientationHub({
  focusedNode,
  onFocus,
  onOpen,
}: {
  focusedNode: NodeId;
  onFocus: (node: NodeId) => void;
  onOpen: (node: NodeId) => void;
}) {
  const { t } = useLanguage();
  const selected = t.experience.nodes[focusedNode];
  const selectedIndex = NODE_ORDER.indexOf(focusedNode);
  const stageRef = useRef<HTMLDivElement>(null);
  const stageSizeRef = useRef({ width: 0, height: 0 });
  const focusedNodeRef = useRef(focusedNode);
  const pointerTrackingRef = useRef(false);
  const lensX = useMotionValue(0);
  const lensY = useMotionValue(0);
  const smoothLensX = useSpring(lensX, { damping: 24, stiffness: 150, mass: 0.55 });
  const smoothLensY = useSpring(lensY, { damping: 24, stiffness: 150, mass: 0.55 });
  const [lensRadius, setLensRadius] = useState(128);
  const lensClip = useMotionTemplate`circle(${lensRadius}px at ${smoothLensX}px ${smoothLensY}px)`;
  const moveLensToNode = useCallback((node: NodeId) => {
    const index = NODE_ORDER.indexOf(node);
    const { width, height } = stageSizeRef.current;
    lensX.set(width * LENS_SIGNAL_COORDINATES[index].x);
    lensY.set(height * LENS_SIGNAL_COORDINATES[index].y);
  }, [lensX, lensY]);

  useEffect(() => {
    focusedNodeRef.current = focusedNode;
    if (!pointerTrackingRef.current) moveLensToNode(focusedNode);
  }, [focusedNode, moveLensToNode]);

  useEffect(() => {
    document.body.classList.add("lens-navigation-active");
    const stage = stageRef.current;
    if (!stage) return () => document.body.classList.remove("lens-navigation-active");

    const syncSize = () => {
      const bounds = stage.getBoundingClientRect();
      stageSizeRef.current = { width: bounds.width, height: bounds.height };
      setLensRadius(bounds.width < 640 ? 104 : Math.min(190, bounds.width * 0.14));
      moveLensToNode(focusedNodeRef.current);
    };

    syncSize();
    const observer = new ResizeObserver(syncSize);
    observer.observe(stage);
    return () => {
      observer.disconnect();
      document.body.classList.remove("lens-navigation-active");
    };
  }, [moveLensToNode]);

  const handleLensMove = (event: React.PointerEvent<HTMLDivElement>) => {
    if (event.pointerType === "touch" && event.buttons === 0) return;
    pointerTrackingRef.current = true;
    const bounds = event.currentTarget.getBoundingClientRect();
    const x = Math.max(0, Math.min(bounds.width, event.clientX - bounds.left));
    const y = Math.max(0, Math.min(bounds.height, event.clientY - bounds.top));
    lensX.set(x);
    lensY.set(y);

    const normalizedX = x / Math.max(1, bounds.width);
    const normalizedY = y / Math.max(1, bounds.height);
    let closestIndex = 0;
    let closestDistance = Number.POSITIVE_INFINITY;
    LENS_SIGNAL_COORDINATES.forEach((coordinate, index) => {
      const distance = Math.hypot(normalizedX - coordinate.x, normalizedY - coordinate.y);
      if (distance < closestDistance) {
        closestDistance = distance;
        closestIndex = index;
      }
    });

    const closestNode = NODE_ORDER[closestIndex];
    if (closestNode !== focusedNode) onFocus(closestNode);
  };

  const renderSignals = (revealed: boolean) =>
    NODE_ORDER.map((node, index) => {
      const content = t.experience.nodes[node];
      const active = focusedNode === node;
      const sharedClass = `absolute ${LENS_SIGNAL_POSITIONS[index]} text-[clamp(4rem,17vw,10.5rem)] font-medium leading-[0.72] tracking-[-0.09em] md:text-[clamp(6.5rem,11vw,10.5rem)]`;

      if (revealed) {
        return (
          <div
            aria-hidden="true"
            className={`${sharedClass} ${active ? "text-[#f5f2eb]" : "text-white/65"}`}
            key={`revealed-${node}`}
          >
            {content.label}
          </div>
        );
      }

      return (
        <button
          type="button"
          key={node}
          aria-pressed={active}
          onClick={() => (active ? onOpen(node) : onFocus(node))}
          onFocus={() => {
            onFocus(node);
            moveLensToNode(node);
          }}
          className={`${sharedClass} z-10 text-transparent [-webkit-text-stroke:1px_rgba(255,255,255,0.2)] transition-[filter] duration-500 hover:[-webkit-text-stroke-color:rgba(255,255,255,0.45)] ${active ? "[-webkit-text-stroke-color:rgba(255,255,255,0.42)]" : ""}`}
        >
          {content.label}
        </button>
      );
    });

  return (
    <motion.section
      aria-label={t.experience.orientation}
      className="relative h-full w-full bg-black/20 px-5 pb-14 pt-20 md:px-8 md:pb-16 md:pt-24"
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0, scale: 1.02 }}
      transition={{ duration: 0.35, ease: "easeOut" }}
    >
      <div className="mx-auto flex h-full w-full max-w-[94rem] flex-col">
        <div className="flex shrink-0 items-start justify-between gap-6 pt-2 md:pt-4">
          <div className="max-w-xs">
            <SectionLabel>{t.experience.orientation}</SectionLabel>
            <p className="mt-3 max-w-[17rem] text-pretty text-xs leading-relaxed text-white/45 md:text-sm">
              {t.experience.instruction}
            </p>
          </div>
          <p className="hidden cinematic-mono text-[8px] uppercase tracking-[0.2em] text-white/30 md:block">
            Focus 0{selectedIndex + 1} / 03
          </p>
        </div>

        <div
          ref={stageRef}
          data-lens-stage
          className="relative min-h-0 flex-1 touch-none select-none overflow-hidden md:cursor-none"
          onPointerMove={handleLensMove}
          onPointerLeave={() => {
            pointerTrackingRef.current = false;
            moveLensToNode(focusedNode);
          }}
        >
          <div className="absolute inset-0">{renderSignals(false)}</div>
          <motion.div className="pointer-events-none absolute inset-0 z-20" style={{ clipPath: lensClip }}>
            <div className="absolute inset-0 bg-white/[0.025]">{renderSignals(true)}</div>
          </motion.div>

          <motion.div
            aria-hidden="true"
            className="pointer-events-none absolute z-30 rounded-full border border-white/35 shadow-[0_0_80px_rgba(74,112,255,0.09)]"
            style={{
              x: smoothLensX,
              y: smoothLensY,
              left: -lensRadius,
              top: -lensRadius,
              width: lensRadius * 2,
              height: lensRadius * 2,
            }}
          >
            <span className="absolute left-1/2 top-[-4px] size-2 -translate-x-1/2 rounded-full bg-[#ff6b2c] shadow-[0_0_22px_rgba(255,107,44,0.8)]" />
            <span className="absolute left-1/2 top-1/2 h-px w-5 -translate-x-1/2 -translate-y-1/2 bg-white/35" />
            <span className="absolute left-1/2 top-1/2 h-5 w-px -translate-x-1/2 -translate-y-1/2 bg-white/35" />
            <span className="absolute bottom-7 left-1/2 -translate-x-1/2 whitespace-nowrap cinematic-mono text-[7px] uppercase tracking-[0.2em] text-white/45">
              focus · 0{selectedIndex + 1}
            </span>
          </motion.div>
        </div>

        <div className="hub-footer grid shrink-0 grid-cols-[1fr_auto] items-end gap-5 border-t border-white/10 pt-4 md:grid-cols-[auto_minmax(12rem,28rem)_auto]">
          <p className="hub-meta cinematic-mono text-[8px] uppercase tracking-[0.2em] text-[#ff6b2c]">
            0{selectedIndex + 1} — {selected.meta}
          </p>
          <AnimatePresence mode="wait">
            <motion.p
              key={focusedNode}
              initial={{ opacity: 0, y: 8 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -8 }}
              className="hub-description text-pretty text-xs leading-relaxed text-white/58"
            >
              {selected.description}
            </motion.p>
          </AnimatePresence>
          <button
            type="button"
            onClick={() => onOpen(focusedNode)}
            className="inline-flex min-h-11 items-center gap-3 rounded-full bg-white px-6 text-[9px] font-semibold uppercase tracking-[0.16em] text-black transition-transform duration-200 hover:-translate-y-0.5"
          >
            <span>{t.experience.openSignal} <span className="hidden sm:inline">{selected.label}</span></span>
            <Arrow />
          </button>
        </div>
      </div>
    </motion.section>
  );
}

function BlueVidiaSpace({ angle, onAngleChange }: { angle: number; onAngleChange: (angle: number) => void }) {
  const { t, currentLanguage } = useLanguage();
  const reducedMotion = useReducedMotion();
  const videoRef = useRef<HTMLVideoElement>(null);
  const [playing, setPlaying] = useState(false);
  const [projecting, setProjecting] = useState(false);
  useEffect(() => {
    if (angle !== 0) {
      setProjecting(false);
      videoRef.current?.pause();
    } else if (reducedMotion) videoRef.current?.pause();
    else void videoRef.current?.play().catch(() => setPlaying(false));
  }, [reducedMotion, angle]);
  const tiltX = useMotionValue(0);
  const tiltY = useMotionValue(0);
  const smoothTiltX = useSpring(tiltX, { damping: 24, stiffness: 150, mass: 0.8 });
  const smoothTiltY = useSpring(tiltY, { damping: 24, stiffness: 150, mass: 0.8 });
  const angles = [
    { label: t.featured.challenge, title: t.featured.subtitle, text: t.featured.challengeText },
    { label: t.featured.approach, title: t.featured.title, text: t.featured.approachText },
    { label: t.featured.outcome, title: t.featured.status, text: t.featured.outcomeText },
  ];
  const current = angles[angle];
  const currentLabel = current.label.replace(/^0\d\s*·\s*/, "");
  const portalShapes = ["48% 52% 46% 54% / 52% 45% 55% 48%", "3%", "12% 12% 3% 3%"];

  return (
    <motion.section
      data-space="bluevidia"
      className={`space-shell project-space ${projecting ? "is-projecting" : ""}`}
      initial={{ opacity: 0, scale: 0.985 }}
      animate={{ opacity: 1, scale: 1 }}
      exit={{ opacity: 0, scale: 1.015 }}
      transition={{ duration: 0.55, ease: [0.16, 1, 0.3, 1] }}
    >
      <h1 className="sr-only">BlueVidia</h1>
      <div className="project-layout">
        <div className="project-copy">
          <div>
            <SectionLabel>{t.featured.eyebrow}</SectionLabel>
            <p aria-hidden="true" className="mt-5 text-[clamp(3.5rem,8vw,8.5rem)] font-medium leading-[0.7] tracking-[-0.085em] text-white">
              BlueVidia
            </p>
          </div>

          <AnimatePresence mode="wait">
            <motion.div
              key={angle}
              initial={{ opacity: 0, y: 18 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -12 }}
              transition={{ duration: 0.4, ease: [0.16, 1, 0.3, 1] }}
              className="project-story max-w-lg"
            >
              <p className="cinematic-mono text-[8px] uppercase tracking-[0.2em] text-[#ff6b2c]">
                0{angle + 1} / 03 · {currentLabel}
              </p>
              <h2 className="mt-3 max-w-[15ch] text-balance text-[clamp(1.65rem,3.1vw,3.7rem)] font-medium leading-[0.94] tracking-[-0.05em] text-white">
                {current.title}
              </h2>
              <p className="mt-4 max-w-md text-pretty text-sm leading-relaxed text-white/65">
                {current.text}
              </p>
            </motion.div>
          </AnimatePresence>
        </div>

        <div
          className="project-stage"
          data-chapter={angle}
          onPointerMove={(event) => {
            if (reducedMotion || event.pointerType !== "mouse" || angle === 1) return;
            const bounds = event.currentTarget.getBoundingClientRect();
            tiltY.set(((event.clientX - bounds.left) / bounds.width - 0.5) * 8);
            tiltX.set(((event.clientY - bounds.top) / bounds.height - 0.5) * -6);
          }}
          onPointerLeave={() => {
            tiltX.set(0);
            tiltY.set(0);
          }}
        >
          <motion.div
            className="project-aperture"
            style={{ rotateX: reducedMotion ? 0 : smoothTiltX, rotateY: reducedMotion ? 0 : smoothTiltY, transformPerspective: 1200 }}
            animate={{ borderRadius: projecting ? "2%" : portalShapes[angle], rotateZ: projecting || reducedMotion ? 0 : [-1.2, 0.8, -0.4][angle], inset: projecting ? "0%" : "5%" }}
            transition={{ duration: 0.9, ease: [0.16, 1, 0.3, 1] }}
          >
            <Image src={BLUEVIDIA_FALLBACK} alt="" fill unoptimized sizes="(min-width: 768px) 65vw, 100vw" className="object-cover opacity-45" />
            <video
              ref={videoRef}
              src="https://dabvh53eklx61.cloudfront.net/SterlingDio.mp4"
              poster={BLUEVIDIA_FALLBACK}
              muted
              loop
              playsInline
              preload="metadata"
              onPlay={() => setPlaying(true)}
              onPause={() => setPlaying(false)}
              className={`absolute inset-0 size-full object-cover object-[center_35%] saturate-[.85] contrast-[1.06] ${angle === 0 ? "opacity-100" : "opacity-15"}`}
            />
            <div className="pointer-events-none absolute inset-0 bg-[linear-gradient(135deg,rgba(18,43,150,.32),transparent_42%,rgba(0,0,0,.42))]" />
            <AnimatePresence mode="wait">
              {angle === 1 && <motion.div key="layers" className="project-study-panel" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}><ProjectLayers french={currentLanguage === "fr"} /></motion.div>}
              {angle === 2 && <motion.div key="delivery" className="project-delivery" initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0 }}>
                <span className="delivery-status"><i />{t.featured.live}</span>
                <p className="delivery-title">BlueVidia<span>.com ↗</span></p>
                <p>{currentLanguage === "fr" ? "De l'idée au site que vous pouvez explorer." : "From an idea to a website you can explore."}</p>
                <dl>
                  <div><dt>{t.featured.role}</dt><dd>{t.featured.roleValue}</dd></div>
                  <div><dt>{t.featured.stack}</dt><dd>{t.featured.stackValue}</dd></div>
                </dl>
                <span className="delivery-credit">{currentLanguage === "fr" ? "Site : Etienne Mentrel · Images : BlueVidia" : "Website: Etienne Mentrel · Imagery: BlueVidia"}</span>
              </motion.div>}
            </AnimatePresence>
            <div className="sr-only">
              <span className="flex items-center gap-2"><span className="size-1.5 rounded-full bg-[#ff6b2c]" />{t.featured.live}</span>
              <span>bluevidia.com</span>
            </div>
            <div className="sr-only">
              <p className="text-[clamp(2.8rem,7vw,7.5rem)] font-semibold leading-[.7] tracking-[-.085em] text-[#f5f0e7]">BlueVidia</p>
              <p className="mt-4 cinematic-mono text-[7px] uppercase tracking-[.2em] text-white/60">Film · photo · direction visuelle</p>
            </div>
          </motion.div>

          <motion.div
            aria-hidden="true"
            className="pointer-events-none absolute inset-[0_6%_0_0] border border-white/10"
            animate={{ borderRadius: portalShapes[(angle + 1) % portalShapes.length], rotate: [2, -1, 1][angle] }}
            transition={{ duration: 1.1, ease: [0.16, 1, 0.3, 1] }}
          />
          <div className="project-media-tools">
            <span>{angle === 0 ? (currentLanguage === "fr" ? "Images du studio" : "Studio footage") : angle === 1 ? (currentLanguage === "fr" ? "Glissez pour explorer" : "Slide to explore") : (currentLanguage === "fr" ? "Design & développement" : "Design & development")} / BlueVidia</span>
            <div className={angle === 0 ? "" : "invisible"} aria-hidden={angle !== 0} inert={angle !== 0}>
              <button type="button" onClick={() => { if (playing) videoRef.current?.pause(); else void videoRef.current?.play().catch(() => setPlaying(false)); }} aria-label={playing ? "Pause" : (currentLanguage === "fr" ? "Lire la vidéo" : "Play video")}>{playing ? "Ⅱ" : "▶"}</button>
              <button type="button" aria-pressed={projecting} onClick={() => setProjecting(!projecting)}>{currentLanguage === "fr" ? (projecting ? "Refermer ↙" : "Plein cadre ↗") : (projecting ? "Close frame ↙" : "Open frame ↗")}</button>
            </div>
          </div>
        </div>

        <div className="project-controls">
          <div className="grid flex-1 grid-cols-3" aria-label={t.experience.projectAngles}>
            {angles.map((item, index) => (
              <button
                type="button"
                key={item.label}
                onClick={() => onAngleChange(index)}
                aria-pressed={angle === index}
                aria-label={item.label}
                className={`relative min-h-10 text-left cinematic-mono text-[7px] uppercase tracking-[0.13em] transition-colors duration-300 ${angle === index ? "text-white" : "text-white/35 hover:text-white/75"}`}
              >
                <motion.span className="absolute inset-x-0 -top-[13px] h-px origin-left bg-[#ff6b2c]" animate={{ scaleX: angle === index ? 1 : 0 }} />
                {item.label}
              </button>
            ))}
          </div>
          <a
            href="https://bluevidia.com"
            target="_blank"
            rel="noopener noreferrer"
            className="group inline-flex min-h-10 items-center gap-3 rounded-full bg-[#f5f0e7] px-5 text-[8px] font-semibold uppercase tracking-[0.14em] text-black transition-transform duration-300 hover:-translate-y-0.5"
          >
            <span>{t.featured.visit}</span><Arrow diagonal />
          </a>
        </div>
      </div>
    </motion.section>
  );
}

function ProfileSpace({ resumeUrl }: { resumeUrl: string }) {
  const { t, currentLanguage } = useLanguage();
  const reducedMotion = useReducedMotion();
  const [activeCapability, setActiveCapability] = useState(0);
  const capabilityNotes = currentLanguage === "fr" ? [
    "Donner une forme interactive à une idée, du premier prototype au site en ligne.",
    "Construire des interfaces précises, adaptables et agréables à utiliser.",
    "Travailler la lumière, la matière et la profondeur directement dans le navigateur.",
    "Relier chaque mouvement à un geste et rendre les transitions compréhensibles.",
    "Faire tenir ensemble le produit, son infrastructure et son déploiement.",
    "Accompagner le projet jusqu'à une expérience réellement accessible en ligne.",
  ] : [
    "Give an idea an interactive form, from the first prototype to the live site.",
    "Build precise, responsive interfaces that feel good to use.",
    "Work with light, material and depth directly in the browser.",
    "Connect motion to gestures and make transitions understandable.",
    "Bring the product, its infrastructure and its deployment together.",
    "Carry a project through to an experience people can actually visit.",
  ];
  const capabilityPositions = [
    "left-[2%] top-[10%]",
    "right-[0%] top-[13%]",
    "right-[-2%] top-[47%]",
    "right-[8%] bottom-[4%]",
    "left-[5%] bottom-[6%]",
    "left-[-3%] top-[48%]",
  ];
  const capabilityShapes = [
    "46% 54% 48% 52% / 42% 48% 52% 58%",
    "18% 58% 28% 56% / 34% 22% 62% 48%",
    "4% 58% 8% 62% / 48% 14% 58% 20%",
    "54% 22% 58% 26% / 18% 60% 24% 64%",
    "28% 52% 22% 58% / 58% 24% 64% 20%",
    "50%",
  ];
  const signalPositions = [
    { left: "18%", top: "62%" }, { left: "30%", top: "44%" }, { left: "62%", top: "36%" },
    { left: "68%", top: "58%" }, { left: "38%", top: "70%" }, { left: "16%", top: "38%" },
  ];

  return (
    <motion.section
      data-space="profile"
      className="space-shell profile-space"
      initial={{ opacity: 0, rotate: -0.4 }}
      animate={{ opacity: 1, rotate: 0 }}
      exit={{ opacity: 0, rotate: 0.4 }}
      transition={{ duration: 0.55, ease: [0.16, 1, 0.3, 1] }}
    >
      <motion.div
        aria-hidden="true"
        className="profile-signal"
        animate={signalPositions[activeCapability]}
        transition={{ type: "spring", stiffness: 55, damping: 18, mass: 1.2 }}
      />
      <div aria-hidden="true" className="profile-watermark pointer-events-none absolute inset-x-0 top-[42%] -translate-y-1/2 overflow-hidden whitespace-nowrap text-center text-[clamp(5rem,15vw,15rem)] font-medium leading-none tracking-[-0.08em] text-transparent [-webkit-text-stroke:1px_rgba(255,255,255,.08)]">
        {t.profile.capabilities[activeCapability]}
      </div>

      <div className="profile-layout">
        <div className="profile-copy">
          <div>
            <SectionLabel>{t.profile.eyebrow}</SectionLabel>
            <h1 className="mt-4 max-w-[11ch] text-balance text-[clamp(2.1rem,4.6vw,5.2rem)] font-medium leading-[0.89] tracking-[-0.06em] text-white">
              {t.profile.title}
            </h1>
          </div>
          <div className="profile-bio max-w-md">
            <p className="text-pretty text-sm leading-relaxed text-white/52">{t.profile.description}</p>
            <p className="mt-6 cinematic-mono text-[8px] uppercase tracking-[0.2em] text-[#ff6b2c]">
              0{activeCapability + 1} / 06 · {t.profile.capabilities[activeCapability]}
            </p>
          </div>
        </div>

        <div className="profile-stage">
          <motion.div
            className="profile-portrait"
            animate={{ borderRadius: reducedMotion ? "46%" : capabilityShapes[activeCapability] }}
            transition={{ duration: 0.9, ease: [0.16, 1, 0.3, 1] }}
          >
            <Image src="/avatar.jpg" alt="Etienne Mentrel" fill priority sizes="(min-width: 768px) 40vw, 70vw" className="object-cover object-[58%_center] saturate-[.8] contrast-[1.06]" />
            <div className="absolute inset-0 bg-[linear-gradient(180deg,transparent_45%,rgba(1,3,9,.78)_100%)]" />
            <div className="absolute inset-x-[17%] bottom-7 flex flex-col items-center text-center md:bottom-10">
              <div className="flex flex-col items-center">
                <p className="cinematic-mono text-[9px] uppercase tracking-[0.12em] text-white/75">Etienne Mentrel</p>
                <AnimatePresence mode="wait">
                  <motion.p key={activeCapability} initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -8 }} className="mt-2 text-lg font-medium leading-[.95] tracking-[-0.04em] text-white md:text-3xl">
                    {t.profile.capabilities[activeCapability]}
                  </motion.p>
                </AnimatePresence>
              </div>
              <span className="mt-3 cinematic-mono text-[7px] text-white/45">0{activeCapability + 1} / 06</span>
            </div>
          </motion.div>

          <div className="profile-orbit" aria-label={t.profile.capabilitiesTitle}>
            {t.profile.capabilities.map((capability, index) => (
              <button
                type="button"
                key={capability}
                onPointerEnter={() => setActiveCapability(index)}
                onFocus={() => setActiveCapability(index)}
                onClick={() => setActiveCapability(index)}
                aria-pressed={activeCapability === index}
                className={`absolute ${capabilityPositions[index]} flex max-w-[12rem] items-center gap-3 text-left cinematic-mono text-[8px] uppercase tracking-[0.13em] transition-colors duration-300 ${activeCapability === index ? "text-white" : "text-white/35 hover:text-white/75"}`}
              >
                <span className={`flex size-7 shrink-0 items-center justify-center rounded-full border transition-colors ${activeCapability === index ? "border-[#ff6b2c] bg-[#ff6b2c] text-black" : "border-white/20"}`}>0{index + 1}</span>
                {capability}
              </button>
            ))}
          </div>
        </div>

        <div data-capability-list className="profile-capabilities" aria-label={t.profile.capabilitiesTitle}>
          {t.profile.capabilities.map((capability, index) => (
            <button key={capability} type="button" onClick={() => setActiveCapability(index)} aria-pressed={activeCapability === index} className={`min-h-8 text-left cinematic-mono text-[7px] uppercase tracking-[0.1em] ${activeCapability === index ? "text-[#ff6b2c]" : "text-white/38"}`}>
              <span>0{index + 1}</span> {capability}
            </button>
          ))}
        </div>

        <div className="capability-note" aria-live="polite">
          <span className="cinematic-mono text-[10px] text-[#ff6b2c]">0{activeCapability + 1} / 06</span>
          <div>
            <h2>{t.profile.capabilities[activeCapability]}</h2>
            <p>{capabilityNotes[activeCapability]}</p>
          </div>
        </div>

        <div className="profile-links">
          <a data-resume-link href={resumeUrl} target="_blank" rel="noopener noreferrer" className="flex items-center gap-2 text-[8px] uppercase tracking-[0.16em] text-white/50 transition-colors duration-200 hover:text-white">
            {t.profile.resume}<Arrow diagonal />
          </a>
          <a href="https://github.com/H1B0B0" target="_blank" rel="noopener noreferrer" className="text-[8px] uppercase tracking-[0.16em] text-white/50 transition-colors duration-200 hover:text-white">
            {t.profile.github}
          </a>
        </div>
      </div>
    </motion.section>
  );
}

function ContactSpace({ resumeUrl }: { resumeUrl: string }) {
  const { t, currentLanguage } = useLanguage();
  const reducedMotion = useReducedMotion();
  const [copied, setCopied] = useState(false);
  const [copyFailed, setCopyFailed] = useState(false);
  const pullX = useMotionValue(0);
  const pullY = useMotionValue(0);
  const smoothPullX = useSpring(pullX, { damping: 24, stiffness: 150, mass: 0.7 });
  const smoothPullY = useSpring(pullY, { damping: 24, stiffness: 150, mass: 0.7 });

  return (
    <motion.section
      data-space="contact"
      className="space-shell contact-space contact-light"
      initial={{ opacity: 0, scale: 0.975 }}
      animate={{ opacity: 1, scale: 1 }}
      exit={{ opacity: 0, scale: 1.02 }}
      transition={{ duration: 0.55, ease: [0.16, 1, 0.3, 1] }}
      onPointerMove={(event) => {
        if (reducedMotion || event.pointerType !== "mouse") return;
        if ((event.target as HTMLElement).closest("a")) return;
        const bounds = event.currentTarget.getBoundingClientRect();
        pullX.set(((event.clientX - bounds.left) / bounds.width - 0.5) * 34);
        pullY.set(((event.clientY - bounds.top) / bounds.height - 0.5) * 24);
      }}
      onPointerLeave={() => {
        pullX.set(0);
        pullY.set(0);
      }}
    >
      <div aria-hidden="true" className="contact-watermark pointer-events-none absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 whitespace-nowrap text-[clamp(8rem,24vw,24rem)] font-semibold leading-none tracking-[-0.1em] text-transparent">
        CONTACT
      </div>

      <motion.div aria-hidden="true" className="contact-field pointer-events-none absolute left-[58%] top-1/2 aspect-square w-[clamp(18rem,48vw,42rem)] -translate-x-1/2 -translate-y-1/2 border border-white/12 bg-[radial-gradient(circle_at_38%_34%,rgba(255,107,44,.24),transparent_28%),radial-gradient(circle_at_64%_62%,rgba(24,70,190,.28),transparent_48%),rgba(0,0,0,.18)]" style={{ x: smoothPullX, y: smoothPullY }} animate={{ borderRadius: reducedMotion ? "50%" : ["42% 58% 63% 37% / 46% 38% 62% 54%", "57% 43% 39% 61% / 55% 63% 37% 45%", "42% 58% 63% 37% / 46% 38% 62% 54%"] }} transition={{ duration: 16, ease: "easeInOut", repeat: Infinity }} />

      <div className="contact-layout">
        <div className="pt-2 md:pt-6"><SectionLabel>{t.experience.nodes.contact.meta}</SectionLabel></div>

        <div className="contact-main">
          <div className="relative z-10">
            <h1 className="max-w-[10ch] text-balance text-[clamp(2.8rem,6.5vw,7.2rem)] font-medium leading-[0.84] tracking-[-0.07em] text-white">
              {t.profile.contactTitle}
            </h1>
            <p className="mt-5 max-w-md text-pretty text-xs leading-relaxed text-white/52 md:text-sm">{t.profile.contactDescription}</p>
          </div>

          <div className="contact-action relative z-20 flex flex-col items-center justify-center gap-5">
            <motion.a
              href="mailto:etienne.mentrel@gmail.com"
              data-cursor="view"
              className="group relative flex aspect-square w-[clamp(11rem,23vw,18rem)] items-center justify-center rounded-full border border-white/45 bg-black/30 text-center text-white backdrop-blur-sm"
              whileHover={{ scale: 1.06, borderColor: "#ff6b2c", backgroundColor: "rgba(255,107,44,.88)", color: "#050505" }}
              transition={{ duration: 0.35, ease: [0.16, 1, 0.3, 1] }}
            >
              <span className="max-w-[9rem] text-[10px] font-semibold uppercase leading-relaxed tracking-[0.17em]">{t.profile.email}</span>
              <span className="absolute right-[18%] top-[18%] transition-transform duration-300 group-hover:translate-x-1 group-hover:-translate-y-1"><Arrow diagonal /></span>
              <span className="absolute bottom-[16%] cinematic-mono text-[9px] uppercase tracking-[0.12em] opacity-60">{currentLanguage === "fr" ? "À vous de jouer" : "Your move"}</span>
            </motion.a>
            <button className="copy-email" type="button" onClick={async () => {
              try { await navigator.clipboard.writeText("etienne.mentrel@gmail.com"); setCopied(true); setCopyFailed(false); }
              catch { setCopyFailed(true); }
            }}>
              <span>etienne.mentrel@gmail.com</span><span aria-live="polite">{copied ? (currentLanguage === "fr" ? "Copié ✓" : "Copied ✓") : (currentLanguage === "fr" ? "Copier ↗" : "Copy ↗")}</span>
            </button>
            {copyFailed && <p role="status" className="text-xs text-white/70">{currentLanguage === "fr" ? "Sélectionnez l'adresse ci-dessus pour la copier." : "Select the address above to copy it."}</p>}
          </div>
        </div>

        <div className="contact-footer">
          <p className="cinematic-mono text-[10px] text-white/65">{t.intro.availability}</p>
          <div className="flex items-center gap-6">
            <a href={resumeUrl} target="_blank" rel="noopener noreferrer" className="text-[8px] uppercase tracking-[0.16em] text-white/45 transition-colors duration-200 hover:text-white">{t.profile.resume}</a>
            <a href="https://github.com/H1B0B0" target="_blank" rel="noopener noreferrer" className="text-[8px] uppercase tracking-[0.16em] text-white/45 transition-colors duration-200 hover:text-white">{t.profile.github}</a>
          </div>
        </div>
      </div>
    </motion.section>
  );
}
