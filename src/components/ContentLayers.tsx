"use client";

import { AnimatePresence, motion, useMotionTemplate, useMotionValue, useSpring } from "framer-motion";
import { useCallback, useEffect, useRef, useState } from "react";
import LanguageSelector from "@/components/LanguageSelector";
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
    return () => window.removeEventListener("popstate", syncFromHash);
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
      <header className="pointer-events-none absolute inset-x-0 top-0 z-40 flex items-center justify-between px-5 pb-4 pt-5 md:px-8 md:pt-7">
        <div className="pointer-events-auto">
          {activeSpace === "orbit" ? (
            <p className="cinematic-mono text-[9px] uppercase tracking-[0.24em] text-white/55 md:text-[10px]">
              Etienne Mentrel
            </p>
          ) : (
            <button
              type="button"
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
            className="pointer-events-auto fixed inset-0 z-[80] flex items-center justify-center overflow-hidden bg-[#ff6b2c] text-black"
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
            <motion.div
              className="flex flex-col items-center text-center"
              animate={{ opacity: [0, 1, 1, 0], scale: [0.9, 1, 1, 1.08] }}
              transition={{ duration: 1.08, times: [0, 0.32, 0.68, 1], ease: "easeInOut" }}
            >
              <span className="cinematic-mono text-[9px] uppercase tracking-[0.28em] text-black/55">
                {transitionTarget === "orbit" ? "00 — index" : `0${NODE_ORDER.indexOf(transitionTarget) + 1} — signal`}
              </span>
              <span className="mt-2 text-[clamp(4.5rem,14vw,12rem)] font-medium leading-none tracking-[-0.08em]">
                {transitionTarget === "orbit" ? "Index" : t.experience.nodes[transitionTarget].label}
              </span>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      <div className={`pointer-events-none absolute inset-x-5 bottom-4 z-40 items-end justify-between md:inset-x-8 md:bottom-6 ${activeSpace === "orbit" ? "hidden" : "flex"}`}>
        <p className="cinematic-mono text-[8px] uppercase tracking-[0.2em] text-white/30">
          {activeSpace === "orbit"
            ? `0${NODE_ORDER.indexOf(focusedNode) + 1} / 03`
            : `// ${activeSpace}`}
        </p>
        <p className="hidden cinematic-mono text-[8px] uppercase tracking-[0.2em] text-white/30 sm:block">
          {activeSpace === "orbit" || activeSpace === "bluevidia" ? t.experience.wheelHint : "Esc · map"}
        </p>
      </div>
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
          className="relative min-h-0 flex-1 touch-none overflow-hidden md:cursor-none"
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

        <div className="grid shrink-0 grid-cols-[1fr_auto] items-end gap-5 border-t border-white/10 pt-4 md:grid-cols-[auto_minmax(12rem,28rem)_auto]">
          <p className="cinematic-mono text-[8px] uppercase tracking-[0.2em] text-[#ff6b2c]">
            0{selectedIndex + 1} — {selected.meta}
          </p>
          <AnimatePresence mode="wait">
            <motion.p
              key={focusedNode}
              initial={{ opacity: 0, y: 8 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -8 }}
              className="hidden text-pretty text-xs leading-relaxed text-white/45 md:block"
            >
              {selected.description}
            </motion.p>
          </AnimatePresence>
          <button
            type="button"
            onClick={() => onOpen(focusedNode)}
            className="inline-flex min-h-11 items-center gap-3 rounded-full bg-white px-6 text-[9px] font-semibold uppercase tracking-[0.16em] text-black transition-transform duration-200 hover:-translate-y-0.5"
          >
            {t.experience.openSignal}
            <Arrow />
          </button>
        </div>
      </div>
    </motion.section>
  );
}

function BlueVidiaAperture({ angle, visitLabel, liveLabel }: { angle: number; visitLabel: string; liveLabel: string }) {
  const tiltX = useMotionValue(0);
  const tiltY = useMotionValue(0);
  const smoothTiltX = useSpring(tiltX, { damping: 24, stiffness: 180, mass: 0.7 });
  const smoothTiltY = useSpring(tiltY, { damping: 24, stiffness: 180, mass: 0.7 });
  const palettes = [
    "radial-gradient(circle at 72% 28%, rgba(59,130,246,.72), transparent 18%), radial-gradient(circle at 30% 72%, rgba(30,64,175,.48), transparent 34%), #02040b",
    "radial-gradient(circle at 35% 42%, rgba(91,125,255,.72), transparent 20%), radial-gradient(circle at 72% 68%, rgba(76,29,149,.42), transparent 32%), #03040c",
    "radial-gradient(circle at 65% 58%, rgba(14,116,144,.64), transparent 20%), radial-gradient(circle at 24% 24%, rgba(37,99,235,.4), transparent 30%), #020609",
  ];

  return (
    <motion.a
      href="https://bluevidia.com"
      target="_blank"
      rel="noopener noreferrer"
      aria-label={visitLabel}
      data-cursor="view"
      onPointerMove={(event) => {
        const bounds = event.currentTarget.getBoundingClientRect();
        const x = (event.clientX - bounds.left) / bounds.width - 0.5;
        const y = (event.clientY - bounds.top) / bounds.height - 0.5;
        tiltX.set(y * -5);
        tiltY.set(x * 7);
      }}
      onPointerLeave={() => {
        tiltX.set(0);
        tiltY.set(0);
      }}
      style={{ rotateX: smoothTiltX, rotateY: smoothTiltY, transformPerspective: 1100 }}
      className="group relative min-h-[11rem] overflow-hidden border border-white/10 bg-[#02040a] p-5 shadow-[0_35px_100px_rgba(0,0,0,0.45)] md:p-7"
    >
      <AnimatePresence mode="popLayout">
        <motion.div
          key={angle}
          className="absolute inset-0"
          style={{ background: palettes[angle] }}
          initial={{ opacity: 0, scale: 1.08 }}
          animate={{ opacity: 1, scale: 1 }}
          exit={{ opacity: 0, scale: 0.96 }}
          transition={{ duration: 0.75, ease: [0.16, 1, 0.3, 1] }}
        />
      </AnimatePresence>

      <motion.div
        className="absolute -right-[8%] top-[4%] aspect-square w-[62%] rounded-full border border-white/15"
        animate={{ rotate: 360 }}
        transition={{ duration: 38, ease: "linear", repeat: Infinity }}
      >
        <span className="absolute left-[17%] top-[3%] size-2 rounded-full bg-[#ff6b2c] shadow-[0_0_20px_rgba(255,107,44,.75)]" />
        <span className="absolute inset-[17%] rounded-full border border-white/[0.08]" />
      </motion.div>
      <div className="absolute -bottom-[36%] -left-[8%] aspect-square w-[58%] rounded-full border border-blue-300/10" />
      <div className="absolute inset-0 bg-[linear-gradient(110deg,rgba(255,255,255,.06),transparent_28%,transparent_72%,rgba(255,255,255,.03))] opacity-70" />

      <div className="relative flex h-full flex-col justify-between [transform:translateZ(34px)]">
        <div className="flex items-center justify-between cinematic-mono text-[8px] uppercase tracking-[0.18em] text-white/55">
          <span>BlueVidia Pictures®</span>
          <span className="flex items-center gap-2">
            <span className="size-1.5 rounded-full bg-[#ff6b2c]" />
            {liveLabel}
          </span>
        </div>

        <div className="flex items-end justify-between gap-5">
          <div>
            <p className="mb-3 cinematic-mono text-[8px] uppercase tracking-[0.2em] text-white/40">
              Paris · Nancy · Firenze / 0{angle + 1}
            </p>
            <p className="text-[clamp(3.4rem,10vw,9.5rem)] font-medium leading-[0.7] tracking-[-0.09em] text-[#f5f2ec] transition-transform duration-700 group-hover:-translate-y-1">
              BlueVidia
            </p>
          </div>
          <span className="mb-1 hidden size-14 items-center justify-center rounded-full border border-white/30 bg-black/10 text-white backdrop-blur-sm transition-all duration-300 group-hover:rotate-45 group-hover:border-[#ff6b2c] group-hover:bg-[#ff6b2c] group-hover:text-black sm:flex">
            <Arrow diagonal />
          </span>
        </div>
      </div>
    </motion.a>
  );
}

function BlueVidiaSpace({ angle, onAngleChange }: { angle: number; onAngleChange: (angle: number) => void }) {
  const { t } = useLanguage();
  const angles = [
    { label: t.featured.challenge, title: t.featured.subtitle, text: t.featured.challengeText },
    { label: t.featured.approach, title: t.featured.title, text: t.featured.approachText },
    { label: t.featured.outcome, title: t.featured.status, text: t.featured.outcomeText },
  ];
  const current = angles[angle];

  return (
    <motion.section
      data-space="bluevidia"
      className="h-full w-full px-5 pb-14 pt-20 md:px-8 md:pb-16 md:pt-24"
      initial={{ opacity: 0, scale: 0.98 }}
      animate={{ opacity: 1, scale: 1 }}
      exit={{ opacity: 0, scale: 1.02 }}
      transition={{ duration: 0.35, ease: "easeOut" }}
    >
      <div className="mx-auto grid h-full max-w-[94rem] grid-rows-[auto_minmax(0,1fr)_auto] gap-4">
        <div className="flex items-end justify-between gap-4">
          <div>
            <SectionLabel>{t.featured.eyebrow}</SectionLabel>
            <h1 className="mt-3 text-[clamp(2.7rem,6vw,6rem)] font-medium leading-[0.82] tracking-[-0.065em] text-white">
              BlueVidia
            </h1>
          </div>
          <p className="hidden max-w-sm text-right text-pretty text-xs leading-relaxed text-white/45 md:block">
            {t.featured.description}
          </p>
        </div>

        <div className="grid min-h-0 gap-4 md:grid-cols-[minmax(0,1.5fr)_minmax(18rem,0.62fr)]">
          <BlueVidiaAperture angle={angle} visitLabel={t.featured.visit} liveLabel={t.featured.live} />

          <div className="flex min-h-0 flex-col justify-between border-t border-white/15 bg-black/25 py-5 md:border-l md:border-t-0 md:px-7 md:py-1">
            <AnimatePresence mode="wait">
              <motion.div
                key={angle}
                initial={{ opacity: 0, y: 12 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -12 }}
                transition={{ duration: 0.2 }}
              >
                <p className="cinematic-mono text-[8px] uppercase tracking-[0.18em] text-[#ff6b2c]">{current.label}</p>
                <h2 className="mt-3 text-balance text-2xl font-medium leading-[0.95] tracking-[-0.04em] text-white md:text-4xl">
                  {current.title}
                </h2>
                <p className="mt-4 text-pretty text-xs leading-relaxed text-white/55 md:text-sm">{current.text}</p>
              </motion.div>
            </AnimatePresence>

            <dl className="mt-4 grid grid-cols-2 gap-4 border-t border-white/10 pt-4">
              <div>
                <dt className="cinematic-mono text-[7px] uppercase tracking-[0.16em] text-white/30">{t.featured.role}</dt>
                <dd className="mt-1 text-[10px] text-white/65">{t.featured.roleValue}</dd>
              </div>
              <div>
                <dt className="cinematic-mono text-[7px] uppercase tracking-[0.16em] text-white/30">{t.featured.stack}</dt>
                <dd className="mt-1 text-[10px] text-white/65">{t.featured.stackValue}</dd>
              </div>
            </dl>
          </div>
        </div>

        <div className="flex flex-col gap-3 border-t border-white/10 pt-3 sm:flex-row sm:items-center sm:justify-between">
          <div className="grid grid-cols-3" aria-label={t.experience.projectAngles}>
            {angles.map((item, index) => (
              <button
                type="button"
                key={item.label}
                onClick={() => onAngleChange(index)}
                aria-pressed={angle === index}
                className={`relative min-h-10 px-3 text-left cinematic-mono text-[7px] uppercase tracking-[0.14em] transition-colors duration-200 md:px-5 md:text-[8px] ${
                  angle === index ? "text-white" : "text-white/35 hover:text-white/70"
                }`}
              >
                <motion.span
                  className="absolute inset-x-3 top-0 h-px bg-[#ff6b2c] md:inset-x-5"
                  animate={{ scaleX: angle === index ? 1 : 0 }}
                  transition={{ duration: 0.35, ease: [0.16, 1, 0.3, 1] }}
                />
                {item.label}
              </button>
            ))}
          </div>
          <a
            href="https://bluevidia.com"
            target="_blank"
            rel="noopener noreferrer"
            className="inline-flex min-h-10 items-center justify-center gap-3 rounded-full bg-[#ff6b2c] px-5 text-[9px] font-semibold uppercase tracking-[0.15em] text-black transition-transform duration-200 hover:-translate-y-0.5"
          >
            {t.featured.visit}<Arrow diagonal />
          </a>
        </div>
      </div>
    </motion.section>
  );
}

function ProfileSpace({ resumeUrl }: { resumeUrl: string }) {
  const { t } = useLanguage();

  return (
    <motion.section
      data-space="profile"
      className="h-full w-full bg-black/65 px-5 pb-14 pt-20 md:px-8 md:pb-16 md:pt-24"
      initial={{ opacity: 0, x: -24 }}
      animate={{ opacity: 1, x: 0 }}
      exit={{ opacity: 0, x: 24 }}
      transition={{ duration: 0.35, ease: "easeOut" }}
    >
      <div className="mx-auto grid h-full max-w-[94rem] min-h-0 grid-rows-[auto_minmax(0,1fr)_auto] gap-5 md:gap-8">
        <div className="grid gap-4 md:grid-cols-[minmax(0,1.2fr)_minmax(20rem,0.55fr)] md:items-end md:gap-14">
          <div>
            <SectionLabel>{t.profile.eyebrow}</SectionLabel>
            <h1 className="mt-4 max-w-5xl text-balance text-[clamp(2.45rem,6vw,6.5rem)] font-medium leading-[0.87] tracking-[-0.06em] text-white">
              {t.profile.title}
            </h1>
          </div>
          <p className="max-w-lg text-pretty text-xs leading-relaxed text-white/55 md:pb-1 md:text-sm">
            {t.profile.description}
          </p>
        </div>

        <div className="flex min-h-0 flex-col justify-end">
          <p className="mb-3 cinematic-mono text-[8px] uppercase tracking-[0.18em] text-white/35">
            {t.profile.capabilitiesTitle}
          </p>
          <ul className="grid grid-cols-2 border-t border-white/15 md:grid-cols-3" aria-label={t.profile.capabilitiesTitle}>
            {t.profile.capabilities.map((capability, index) => (
              <li
                key={capability}
                className="flex min-h-14 items-center gap-3 border-b border-white/10 py-3 pr-2 text-[10px] leading-tight text-white/65 md:min-h-20 md:text-sm"
              >
                <span className="cinematic-mono text-[7px] text-[#ff6b2c]">0{index + 1}</span>
                <span>{capability}</span>
              </li>
            ))}
          </ul>
        </div>

        <div className="flex items-center justify-between border-t border-white/10 pt-4">
            <a
              data-resume-link
              href={resumeUrl}
              target="_blank"
              rel="noopener noreferrer"
              className="flex items-center gap-2 text-[8px] uppercase tracking-[0.16em] text-white/50 transition-colors duration-200 hover:text-white"
            >
              {t.profile.resume}<Arrow diagonal />
            </a>
            <a
              href="https://github.com/H1B0B0"
              target="_blank"
              rel="noopener noreferrer"
              className="text-[8px] uppercase tracking-[0.16em] text-white/50 transition-colors duration-200 hover:text-white"
            >
              {t.profile.github}
            </a>
        </div>
      </div>
    </motion.section>
  );
}

function ContactSpace({ resumeUrl }: { resumeUrl: string }) {
  const { t } = useLanguage();

  return (
    <motion.section
      data-space="contact"
      className="flex h-full w-full items-center px-5 pb-14 pt-20 md:px-8 md:pb-16 md:pt-24"
      initial={{ opacity: 0, scale: 0.96 }}
      animate={{ opacity: 1, scale: 1 }}
      exit={{ opacity: 0, scale: 1.03 }}
      transition={{ duration: 0.35, ease: "easeOut" }}
    >
      <div className="relative mx-auto flex h-full w-full max-w-[94rem] flex-col items-center justify-center text-center">
        <SectionLabel>{t.experience.nodes.contact.meta}</SectionLabel>
        <h1 className="mt-6 max-w-5xl text-balance text-[clamp(3rem,7.2vw,7.5rem)] font-medium leading-[0.86] tracking-[-0.065em] text-white drop-shadow-[0_3px_10px_rgba(0,0,0,0.9)]">
          {t.profile.contactTitle}
        </h1>
        <p className="mt-5 max-w-lg text-pretty text-sm leading-relaxed text-white/50 md:text-base">
          {t.profile.contactDescription}
        </p>

        <a
          href="mailto:etienne.mentrel@gmail.com"
          className="group mt-8 flex size-36 flex-col items-center justify-center rounded-full border border-white/25 bg-black/55 text-white transition-colors duration-200 hover:border-[#ff6b2c] hover:text-[#ff6b2c] md:mt-10 md:size-44"
        >
          <span className="max-w-[7rem] text-[9px] font-semibold uppercase tracking-[0.16em]">{t.profile.email}</span>
          <span className="mt-3 transition-transform duration-200 group-hover:translate-x-1"><Arrow /></span>
        </a>

        <div className="mt-7 flex items-center gap-6">
          <a href={resumeUrl} target="_blank" rel="noopener noreferrer" className="text-[8px] uppercase tracking-[0.16em] text-white/45 underline decoration-white/20 underline-offset-4 transition-colors duration-200 hover:text-white">
            {t.profile.resume}
          </a>
          <a href="https://github.com/H1B0B0" target="_blank" rel="noopener noreferrer" className="text-[8px] uppercase tracking-[0.16em] text-white/45 underline decoration-white/20 underline-offset-4 transition-colors duration-200 hover:text-white">
            {t.profile.github}
          </a>
        </div>
      </div>
    </motion.section>
  );
}
