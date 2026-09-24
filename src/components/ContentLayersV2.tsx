"use client";

import { AnimatePresence, motion, useReducedMotion } from "framer-motion";
import { useCallback, useEffect, useMemo, useRef, useState } from "react";

import ExperienceIndex, {
  type IndexDestination,
} from "@/components/experience/ExperienceIndex";
import LanguageSelector from "@/components/LanguageSelector";
import ContactSpaceV2 from "@/components/spaces/ContactSpaceV2";
import ProfileSpaceV2 from "@/components/spaces/ProfileSpaceV2";
import WorkLabSpace, {
  type WorkLabTrace,
  type WorkLabView,
} from "@/components/spaces/WorkLabSpace";
import {
  EXPERIENCE_DESTINATIONS,
  type ExperienceDestination,
  useExperience,
} from "@/context/ExperienceContext";
import { useSfx } from "@/context/SfxContext";
import { useLanguage } from "@/i18n/LanguageContext";

import styles from "./ContentLayersV2.module.css";

const ENGLISH_RESUME_URL = "https://cvdesignr.com/p/67c9a21b5458a?hl=fr_FR";
const FRENCH_RESUME_URL = "https://cvdesignr.com/p/647b251d89bf4?hl=fr_FR";
const ROUTES = EXPERIENCE_DESTINATIONS.filter(
  (destination): destination is Exclude<ExperienceDestination, "index"> => destination !== "index",
);

const MATTER_TARGETS: Record<ExperienceDestination, number> = {
  index: 0.5,
  work: 0.36,
  lab: 0.62,
  profile: 0.18,
  contact: 0.86,
};

const TRANSITION_COLORS: Record<ExperienceDestination, [string, string]> = {
  index: ["#0b0d14", "#725cff"],
  work: ["#081022", "#315ce8"],
  lab: ["#071512", "#15bfa5"],
  profile: ["#160a18", "#8d56d8"],
  contact: ["#f1eee6", "#ef8358"],
};

function Arrow({ back = false }: { back?: boolean }) {
  return (
    <svg aria-hidden="true" className={styles.arrow} fill="none" viewBox="0 0 24 24">
      <path
        d={back ? "M19 12H5m5 5-5-5 5-5" : "M5 12h14m-5-5 5 5-5 5"}
        stroke="currentColor"
        strokeLinecap="round"
        strokeLinejoin="round"
        strokeWidth="1.5"
      />
    </svg>
  );
}

function isDestination(value: string): value is ExperienceDestination {
  return EXPERIENCE_DESTINATIONS.includes(value as ExperienceDestination);
}

export default function ContentLayersV2() {
  const { currentLanguage, t } = useLanguage();
  const { enabled: sfxEnabled, toggle: toggleSfx } = useSfx();
  const {
    destination,
    setPreviewDestination,
    visited,
    trace,
    travelTo: setDestination,
    addTrace,
    setPointerEnergy,
  } = useExperience();
  const reducedMotion = useReducedMotion();
  const [transitionTarget, setTransitionTarget] = useState<ExperienceDestination | null>(null);
  const commitTimerRef = useRef<number | null>(null);
  const finishTimerRef = useRef<number | null>(null);
  const headingRef = useRef<HTMLHeadingElement>(null);
  const language = currentLanguage === "fr" ? "fr" : "en";
  const resumeUrl = language === "fr" ? FRENCH_RESUME_URL : ENGLISH_RESUME_URL;
  const traceLevel = (trace.form + trace.motion + trace.system) / 3;

  const copy = language === "fr"
    ? {
        role: "Développeur créatif · Ingénieur",
        eyebrow: "La créativité est une infrastructure",
        title: "Je construis des idées",
        accent: "que l'on peut parcourir.",
        description:
          "De l'intention à la production, je réunis direction visuelle, interaction et ingénierie pour créer des sites beaux, clairs et impossibles à confondre avec un template.",
        instruction: "Choisir un espace · déplacer pour influencer la matière",
        visited: "Exploré",
        matter: "Matière vivante",
        traces: "traces",
        channelLabels: { form: "Forme", motion: "Mouvement", system: "Système" },
        edition: "Portfolio vivant · 2026",
        nav: "Navigation principale",
        back: "Retour à l'index",
        current: "Espace actif",
        soundOn: "Désactiver les effets sonores",
        soundOff: "Activer les effets sonores",
        skip: "Aller au contenu principal",
      }
    : {
        role: "Creative developer · Engineer",
        eyebrow: "Creativity is infrastructure",
        title: "I build ideas",
        accent: "you can move through.",
        description:
          "From intention to production, I connect visual direction, interaction and engineering to create websites that are beautiful, clear and impossible to mistake for a template.",
        instruction: "Choose a space · move to influence the matter",
        visited: "Visited",
        matter: "Living matter",
        traces: "traces",
        channelLabels: { form: "Form", motion: "Motion", system: "System" },
        edition: "Living portfolio · 2026",
        nav: "Primary navigation",
        back: "Back to index",
        current: "Current space",
        soundOn: "Disable sound effects",
        soundOff: "Enable sound effects",
        skip: "Skip to main content",
      };

  const destinationCopy = useCallback(
    (id: Exclude<ExperienceDestination, "index">) => t.experience.nodes[id],
    [t.experience.nodes],
  );

  const indexDestinations = useMemo<readonly IndexDestination[]>(
    () => ROUTES.map((id) => ({ id, ...destinationCopy(id) })),
    [destinationCopy],
  );

  const clearTimers = useCallback(() => {
    if (commitTimerRef.current !== null) window.clearTimeout(commitTimerRef.current);
    if (finishTimerRef.current !== null) window.clearTimeout(finishTimerRef.current);
    commitTimerRef.current = null;
    finishTimerRef.current = null;
  }, []);

  const commitDestination = useCallback((next: ExperienceDestination, writeHistory = true) => {
    setDestination(next);
    if (!writeHistory) return;
    const url = next === "index"
      ? `${window.location.pathname}${window.location.search}`
      : `#${next}`;
    window.history.pushState(null, "", url);
  }, [setDestination]);

  const travelTo = useCallback((next: ExperienceDestination, writeHistory = true) => {
    if (next === destination || transitionTarget !== null) return;
    clearTimers();

    if (reducedMotion) {
      commitDestination(next, writeHistory);
      return;
    }

    setTransitionTarget(next);
    commitTimerRef.current = window.setTimeout(() => commitDestination(next, writeHistory), 190);
    finishTimerRef.current = window.setTimeout(() => setTransitionTarget(null), 690);
  }, [clearTimers, commitDestination, destination, reducedMotion, transitionTarget]);

  useEffect(() => {
    const syncFromLocation = () => {
      const rawHash = window.location.hash.replace("#", "").toLowerCase();
      const normalized = rawHash === "bluevidia" ? "work" : rawHash || "index";
      const next = isDestination(normalized) ? normalized : "index";
      clearTimers();
      setTransitionTarget(null);
      commitDestination(next, false);
    };

    syncFromLocation();
    window.addEventListener("popstate", syncFromLocation);
    window.addEventListener("hashchange", syncFromLocation);
    return () => {
      window.removeEventListener("popstate", syncFromLocation);
      window.removeEventListener("hashchange", syncFromLocation);
    };
  }, [clearTimers, commitDestination]);

  useEffect(() => clearTimers, [clearTimers]);

  useEffect(() => {
    setPointerEnergy(0.08);
    // Every destination is a new chapter. Its section owns the scroll (the
    // document stays fixed), so reset that surface before moving focus.
    const frame = window.requestAnimationFrame(() => {
      const spaceName = destination === "profile" || destination === "contact"
        ? `${destination}-v2`
        : destination;
      document.querySelector<HTMLElement>(`[data-space="${spaceName}"]`)?.scrollTo({
        top: 0,
        left: 0,
        behavior: "auto",
      });
      if (destination === "work" || destination === "lab") {
        headingRef.current?.focus({ preventScroll: true });
      }
    });
    return () => window.cancelAnimationFrame(frame);
  }, [destination, setPointerEnergy]);

  useEffect(() => {
    const onKeyDown = (event: KeyboardEvent) => {
      if (event.key !== "Escape" || destination === "index") return;
      if ((event.target as HTMLElement).closest("input, textarea, select, [contenteditable]")) return;
      travelTo("index");
    };
    window.addEventListener("keydown", onKeyDown);
    return () => window.removeEventListener("keydown", onKeyDown);
  }, [destination, travelTo]);

  const handleWorkTrace = (event: WorkLabTrace) => {
    const amount = event.value === undefined ? 0.06 : 0.05 + Math.abs(event.value) * 0.05;
    addTrace(event.channel, amount);
  };

  const handleLocalWorkNavigation = (view: WorkLabView) => travelTo(view);
  const currentLabel = destination === "index" ? "Index" : destinationCopy(destination).label;
  const transitionColors = transitionTarget ? TRANSITION_COLORS[transitionTarget] : TRANSITION_COLORS.index;
  const sectionTitle = destination === "index"
    ? language === "fr" ? "Développeur créatif & ingénieur" : "Creative developer & engineer"
    : currentLabel;
  const pageTitle = `${sectionTitle} — Etienne Mentrel`;

  useEffect(() => {
    const applyTitle = () => {
      if (document.title !== pageTitle) document.title = pageTitle;
    };
    applyTitle();
    const observer = new MutationObserver(applyTitle);
    observer.observe(document.head, { childList: true, subtree: true, characterData: true });
    return () => observer.disconnect();
  }, [pageTitle]);

  return (
    <>
    <a className={styles.skipLink} href="#main-experience">{copy.skip}</a>
    <main
      id="main-experience"
      className={styles.root}
      data-destination={destination}
      style={{
        "--trace-form": trace.form,
        "--trace-motion": trace.motion,
        "--trace-system": trace.system,
        "--trace-completion": traceLevel,
        "--trace-angle": `${(trace.motion - 0.5) * 12}deg`,
        "--trace-scale": 0.96 + trace.form * 0.06,
        "--trace-shift": `${(trace.system - 0.5) * 24}px`,
      } as React.CSSProperties}
    >
      <button
        type="button"
        className={styles.soundToggle}
        data-sfx-control
        aria-label={sfxEnabled ? copy.soundOn : copy.soundOff}
        aria-pressed={sfxEnabled}
        onClick={toggleSfx}
      >
        <svg aria-hidden="true" viewBox="0 0 24 24" fill="none">
          <path d="M5 9v6h4l5 4V5L9 9H5Z" stroke="currentColor" strokeLinejoin="round" />
          {sfxEnabled ? (
            <path d="M17 9.2a4 4 0 0 1 0 5.6M19.4 6.8a7.4 7.4 0 0 1 0 10.4" stroke="currentColor" strokeLinecap="round" />
          ) : (
            <path d="m17 10 4 4m0-4-4 4" stroke="currentColor" strokeLinecap="round" />
          )}
        </svg>
        <span>SFX</span>
        <em>{sfxEnabled ? "ON" : "OFF"}</em>
      </button>

      {destination !== "index" ? (
        <header className={styles.header}>
          <button
            type="button"
            className={styles.back}
            aria-label={copy.back}
            onClick={() => travelTo("index")}
          >
            <span className={styles.backIcon}><Arrow back /></span>
            <span>{copy.back}</span>
          </button>
          <p className={styles.currentSpace} aria-label={`${copy.current}: ${currentLabel}`}>
            <span>{String(ROUTES.indexOf(destination) + 1).padStart(2, "0")}</span>
            {currentLabel}
          </p>
          <LanguageSelector />
        </header>
      ) : null}

      {destination !== "index" ? (
        <nav className={styles.rail} aria-label={copy.nav}>
          <button type="button" onClick={() => travelTo("index")} aria-current={undefined}>
            <span>00</span><strong>Index</strong>
          </button>
          {ROUTES.map((route, index) => (
            <button
              type="button"
              key={route}
              onClick={() => travelTo(route)}
              aria-current={destination === route ? "page" : undefined}
            >
              <span>{String(index + 1).padStart(2, "0")}</span>
              <strong>{destinationCopy(route).label}</strong>
            </button>
          ))}
        </nav>
      ) : null}

      <AnimatePresence mode="wait" initial={false}>
        {destination === "index" ? (
          <motion.div
            key="index"
            className={styles.space}
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: reducedMotion ? 0 : 0.18, ease: "easeOut" }}
          >
            <ExperienceIndex
              role={copy.role}
              eyebrow={copy.eyebrow}
              title={copy.title}
              titleAccent={copy.accent}
              description={copy.description}
              destinations={indexDestinations}
              visited={visited}
              activeDestination={destination}
              instruction={copy.instruction}
              edition={copy.edition}
              visitedLabel={copy.visited}
              matterLabel={copy.matter}
              tracesLabel={copy.traces}
              channels={trace}
              channelLabels={copy.channelLabels}
              onNavigate={(next) => {
                if (isDestination(next)) travelTo(next);
              }}
              onPointerEnergyChange={setPointerEnergy}
              onPreviewDestination={(next) => {
                setPreviewDestination(next && isDestination(next) ? next : null);
              }}
            />
          </motion.div>
        ) : destination === "work" || destination === "lab" ? (
          <motion.div
            key={destination}
            className={`${styles.space} ${styles.spaceWithRail}`}
            initial={{ opacity: 0, y: reducedMotion ? 0 : 12 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0 }}
            transition={{ duration: reducedMotion ? 0 : 0.2, ease: "easeOut" }}
          >
            <WorkLabSpace
              view={destination}
              language={language}
              channels={trace}
              headingRef={headingRef}
              onNavigate={handleLocalWorkNavigation}
              onTrace={handleWorkTrace}
              className={styles.sectionWithRail}
            />
          </motion.div>
        ) : destination === "profile" ? (
          <motion.div key="profile" className={styles.space} initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}>
            <ProfileSpaceV2
              resumeUrl={resumeUrl}
              visitedDestinations={visited}
              traceLevel={traceLevel}
              trace={trace}
              onTrace={(amount) => addTrace("system", amount)}
            />
          </motion.div>
        ) : (
          <motion.div key="contact" className={styles.space} initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}>
            <ContactSpaceV2
              resumeUrl={resumeUrl}
              visitedDestinations={visited}
              traceLevel={traceLevel}
              trace={trace}
              onTrace={(amount) => addTrace("motion", amount)}
            />
          </motion.div>
        )}
      </AnimatePresence>

      <AnimatePresence>
        {transitionTarget ? (
          <motion.div
            className={styles.transition}
            data-target={transitionTarget}
            aria-hidden="true"
            style={{
              "--transition-a": transitionColors[0],
              "--transition-b": transitionColors[1],
            } as React.CSSProperties}
            initial={{ opacity: 0 }}
            animate={{ opacity: [0, 1, 1, 0] }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.69, times: [0, 0.18, 0.68, 1], ease: "easeOut" }}
          >
            {[0, 1, 2, 3].map((band) => (
              <motion.span
                key={band}
                initial={{ scaleX: 0, originX: band % 2 === 0 ? 0 : 1 }}
                animate={{ scaleX: [0, 1, 1, 0], originX: band % 2 === 0 ? 0 : 1 }}
                transition={{ duration: 0.69, delay: band * 0.018, times: [0, 0.3, 0.68, 1], ease: "easeInOut" }}
              />
            ))}
            <motion.p
              initial={{ opacity: 0, y: 8 }}
              animate={{ opacity: [0, 1, 0], y: [8, 0, -8] }}
              transition={{ duration: 0.58, times: [0, 0.42, 1], ease: "easeOut" }}
            >
              <span>
                {String(EXPERIENCE_DESTINATIONS.indexOf(transitionTarget)).padStart(2, "0")}
                {" · "}
                {language === "fr" ? "Matière en recomposition" : "Matter recomposing"}
              </span>
              <strong>{transitionTarget === "index" ? "Index" : destinationCopy(transitionTarget).label}</strong>
            </motion.p>
          </motion.div>
        ) : null}
      </AnimatePresence>

      <span className={styles.srStatus} aria-live="polite">
        {copy.current}: {currentLabel}
      </span>
    </main>
    </>
  );
}

export { MATTER_TARGETS };
