"use client";

import { motion, useReducedMotion } from "framer-motion";
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
    composition,
    updateComposition,
    travelTo: setDestination,
    addTrace,
    setPointerEnergy,
  } = useExperience();
  const reducedMotion = useReducedMotion();
  const headingRef = useRef<HTMLHeadingElement>(null);
  const hasEnteredSpace = useRef(false);
  const [caseChapter, setCaseChapter] = useState<0 | 1 | 2>(0);
  const language = currentLanguage === "fr" ? "fr" : "en";
  const resumeUrl = language === "fr" ? FRENCH_RESUME_URL : ENGLISH_RESUME_URL;
  const traceLevel = (trace.form + trace.motion + trace.system) / 3;

  const copy = language === "fr"
    ? {
        role: "Développeur créatif · Ingénieur",
        eyebrow: "La créativité au centre du web",
        title: "Je construis des idées",
        accent: "que l'on peut parcourir.",
        description:
          "Des sites beaux, clairs et singuliers. De l’idée à la mise en ligne.",
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
        eyebrow: "Creativity at the heart of the web",
        title: "I build ideas",
        accent: "you can move through.",
        description:
          "Beautiful, clear, distinctive websites. From the first idea to going live.",
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

  const commitDestination = useCallback((next: ExperienceDestination, writeHistory = true) => {
    if (writeHistory && next === "work") setCaseChapter(0);
    setDestination(next);
    if (!writeHistory) return;
    const url = next === "index"
      ? `${window.location.pathname}${window.location.search}`
      : `#${next}`;
    window.history.pushState(null, "", url);
  }, [setDestination]);

  const travelTo = useCallback((next: ExperienceDestination, writeHistory = true) => {
    if (next !== destination) commitDestination(next, writeHistory);
  }, [commitDestination, destination]);

  useEffect(() => {
    const syncFromLocation = () => {
      const rawHash = window.location.hash.replace("#", "").toLowerCase();
      const [routeHash, chapterHash] = rawHash.split("/");
      const normalized = routeHash === "bluevidia" ? "work" : routeHash || "index";
      const next = isDestination(normalized) ? normalized : "index";
      if (next === "work") setCaseChapter(chapterHash === "delivery" ? 2 : chapterHash === "composition" ? 1 : 0);
      commitDestination(next, false);
    };

    syncFromLocation();
    window.addEventListener("popstate", syncFromLocation);
    window.addEventListener("hashchange", syncFromLocation);
    return () => {
      window.removeEventListener("popstate", syncFromLocation);
      window.removeEventListener("hashchange", syncFromLocation);
    };
  }, [commitDestination]);

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
      if (destination !== "index") hasEnteredSpace.current = true;
      const heading = destination === "index"
        ? hasEnteredSpace.current ? document.getElementById("experience-index-title") : null
        : document.querySelector<HTMLElement>(`[data-space="${spaceName}"] h1`);
      if (heading) {
        heading.tabIndex = -1;
        heading.focus({ preventScroll: true });
      }
    });
    return () => window.cancelAnimationFrame(frame);
  }, [caseChapter, destination, setPointerEnergy]);

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
    <a className={styles.skipLink} href="#main-experience" onClick={(event) => {
      event.preventDefault();
      document.getElementById("main-experience")?.focus();
    }}>{copy.skip}</a>
    <main
      id="main-experience"
      tabIndex={-1}
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
        "--folio-hinge": `${Math.max(0, ROUTES.indexOf(destination as typeof ROUTES[number])) * 25}%`,
      } as React.CSSProperties}
    >


      <header className={styles.header}>
        {destination === "index" ? (
          <span className={styles.headerName}>Etienne Mentrel</span>
        ) : (
          <button type="button" className={styles.back} aria-label={copy.back} onClick={() => travelTo("index")}>
            <span className={styles.backIcon}><Arrow back /></span>
            <span>{copy.back}</span>
          </button>
        )}
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
        <LanguageSelector />
      </header>

      {destination !== "index" ? (
        <nav className={styles.rail} aria-label={copy.nav}>
          <button type="button" onClick={() => travelTo("index")} aria-current={undefined}>
            <span aria-hidden="true">00</span><strong>Index</strong>
          </button>
          {ROUTES.map((route, index) => (
            <button
              type="button"
              key={route}
              onClick={() => travelTo(route)}
              aria-current={destination === route ? "page" : undefined}
            >
              <span aria-hidden="true">{String(index + 1).padStart(2, "0")}</span>
              <strong>{destinationCopy(route).label}</strong>
            </button>
          ))}
        </nav>
      ) : null}

      <motion.div
        key={destination}
        className={styles.space}
        data-route-surface={destination}
        initial={reducedMotion ? false : { opacity: .4, rotateY: -7, x: 16 }}
        animate={{ opacity: 1, rotateY: 0, x: 0 }}
        transition={{ duration: reducedMotion ? 0 : .32, ease: [0.22, 1, 0.36, 1] }}
      >
        {destination === "index" ? (
            <ExperienceIndex
              language={language}
              composition={composition}
              onCompositionChange={updateComposition}
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
              onPreviewDestination={(next) => {
                setPreviewDestination(next && isDestination(next) ? next : null);
              }}
            />
        ) : destination === "work" || destination === "lab" ? (
            <WorkLabSpace
              key={destination === "work" ? caseChapter : "lab"}
              initialCaseChapter={caseChapter}
              view={destination}
              language={language}
              channels={trace}
              composition={composition}
              onCompositionChange={updateComposition}
              headingRef={headingRef}
              onNavigate={handleLocalWorkNavigation}
              onTrace={handleWorkTrace}
              className={styles.sectionWithRail}
            />
        ) : destination === "profile" ? (
            <ProfileSpaceV2
              composition={composition}
              resumeUrl={resumeUrl}
              visitedDestinations={visited}
              traceLevel={traceLevel}
              trace={trace}
              onTrace={(amount) => addTrace("system", amount)}
            />
        ) : (
            <ContactSpaceV2
              composition={composition}
              resumeUrl={resumeUrl}
              visitedDestinations={visited}
              traceLevel={traceLevel}
              trace={trace}
              onTrace={(amount) => addTrace("motion", amount)}
            />
        )}
      </motion.div>

      <span className={styles.srStatus} aria-live="polite">
        {copy.current}: {currentLabel}
      </span>
    </main>
    </>
  );
}

export { MATTER_TARGETS };
