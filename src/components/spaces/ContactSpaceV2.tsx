"use client";

import { useEffect, useMemo, useRef, useState, type CSSProperties } from "react";

import { useLanguage } from "@/i18n/LanguageContext";

import styles from "./profile-contact.module.css";

export type ContactSpaceV2Props = {
  resumeUrl: string;
  visitedDestinations?: readonly string[];
  traceLevel?: number;
  onTrace?: (amount: number) => void;
};

type RouteDefinition = {
  id: "index" | "work" | "lab" | "profile";
  fr: string;
  en: string;
};

const ROUTES: readonly RouteDefinition[] = [
  { id: "index", fr: "Index", en: "Index" },
  { id: "work", fr: "Travaux", en: "Work" },
  { id: "lab", fr: "Laboratoire", en: "Lab" },
  { id: "profile", fr: "Profil", en: "Profile" },
];

const EMAIL = "etienne.mentrel@gmail.com";

export default function ContactSpaceV2({
  resumeUrl,
  visitedDestinations = [],
  traceLevel = 0,
  onTrace,
}: ContactSpaceV2Props) {
  const { currentLanguage } = useLanguage();
  const language = currentLanguage === "fr" ? "fr" : "en";
  const copy = language === "fr"
    ? {
        eyebrow: "Contact · transmission finale",
        title: "Vos traces deviennent un point de départ.",
        introduction:
          "Le parcours est recomposé ici, uniquement pour cette visite. Si une idée mérite sa propre présence en ligne, commençons par ce qu’elle doit faire ressentir.",
        composition: "Composition de la visite",
        explored: "exploré",
        waiting: "à découvrir",
        completeJourney: "Vous avez vu le travail, manipulé les idées et regardé derrière le système.",
        partialJourney: "Chaque espace traversé précise un peu plus ce qui mérite d’être construit.",
        nextJourney: "La prochaine trace peut être la vôtre.",
        imprint: "Empreinte de session",
        local: "Session locale · aucune donnée collectée",
        signal: "Signal final",
        write: "Écrire un email",
        copy: "Copier l’adresse",
        copied: "Adresse copiée — à vous d’écrire.",
        copyLabel: "Copier l’adresse email d’Etienne Mentrel",
        fallback: "La copie automatique est indisponible. Copiez l’adresse ci-dessous.",
        fallbackLabel: "Adresse email à copier manuellement",
        availability: "Disponible pour des projets sélectionnés",
        resume: "Voir mon CV",
        github: "Profil GitHub",
      }
    : {
        eyebrow: "Contact · final transmission",
        title: "Your traces become a starting point.",
        introduction:
          "The journey is recomposed here for this visit only. If an idea deserves a presence of its own, let’s begin with what it should make people feel.",
        composition: "Journey composition",
        explored: "explored",
        waiting: "not visited",
        completeJourney: "You saw the work, manipulated the ideas and looked behind the system.",
        partialJourney: "Every space you cross makes what deserves to be built a little clearer.",
        nextJourney: "The next trace could be yours.",
        imprint: "Session imprint",
        local: "Local session · no personal data collected",
        signal: "Final signal",
        write: "Write an email",
        copy: "Copy address",
        copied: "Address copied — your move.",
        copyLabel: "Copy Etienne Mentrel’s email address",
        fallback: "Automatic copy is unavailable. Copy the address below.",
        fallbackLabel: "Email address to copy manually",
        availability: "Available for selected projects",
        resume: "View resume",
        github: "GitHub profile",
      };
  const [copyState, setCopyState] = useState<"idle" | "copied" | "failed">("idle");
  const headingRef = useRef<HTMLHeadingElement>(null);
  const fallbackRef = useRef<HTMLInputElement>(null);
  const normalizedTrace = Math.max(0, Math.min(1, traceLevel));
  const visited = useMemo(
    () => new Set(visitedDestinations.map((destination) => destination.toLowerCase())),
    [visitedDestinations],
  );
  const visitedRoutes = ROUTES.filter((route) => visited.has(route.id));
  const transmissionCode = `TRC-${ROUTES.map((route) => visited.has(route.id) ? route.id[0].toUpperCase() : "·").join("")}-${Math.round(normalizedTrace * 100).toString().padStart(2, "0")}`;

  useEffect(() => {
    headingRef.current?.focus({ preventScroll: true });
  }, []);

  const handleCopy = async () => {
    try {
      if (!navigator.clipboard) throw new Error("Clipboard API unavailable");
      await navigator.clipboard.writeText(EMAIL);
      setCopyState("copied");
      onTrace?.(0.12);
    } catch {
      setCopyState("failed");
      window.requestAnimationFrame(() => {
        fallbackRef.current?.focus();
        fallbackRef.current?.select();
      });
    }
  };

  return (
    <section
      className={styles.contactRoot}
      data-contact-state={copyState}
      data-space="contact-v2"
      aria-labelledby="contact-v2-title"
    >
      <div className={styles.contactShell}>
        <header className={styles.contactHeader}>
          <p className={styles.contactEyebrow}>{copy.eyebrow}</p>
          <div className={styles.contactHeadingGrid}>
            <h1
              id="contact-v2-title"
              ref={headingRef}
              tabIndex={-1}
              className={styles.contactTitle}
            >
              {copy.title}
            </h1>
            <p className={styles.contactIntroduction}>{copy.introduction}</p>
          </div>
        </header>

        <div className={styles.contactMain}>
          <figure className={styles.transmission} aria-labelledby="contact-composition-title">
            <figcaption className={styles.transmissionHeader}>
              <span id="contact-composition-title">{copy.composition}</span>
              <strong>{String(visitedRoutes.length).padStart(2, "0")} / {String(ROUTES.length).padStart(2, "0")}</strong>
            </figcaption>

            <div className={styles.transmissionScene}>
              <div className={styles.journeyStatement}>
                <span>{String(visitedRoutes.length).padStart(2, "0")}</span>
                <p>
                  {visitedRoutes.length === ROUTES.length ? copy.completeJourney : copy.partialJourney}
                </p>
                <strong>{copy.nextJourney}</strong>
              </div>

              <div className={styles.routeRibbon} aria-label={copy.composition}>
                {ROUTES.map((route, index) => {
                  const active = visited.has(route.id);
                  return (
                    <div key={route.id} data-visited={active ? "true" : "false"}>
                      <span>0{index + 1}</span>
                      <strong>{route[language]}</strong>
                      <small>{active ? copy.explored : copy.waiting}</small>
                    </div>
                  );
                })}
              </div>

              <div className={styles.sessionImprint}>
                <span>{copy.imprint}</span>
                <strong>{transmissionCode}</strong>
                <i aria-hidden="true"><span style={{ transform: `scaleX(${normalizedTrace})` } as CSSProperties} /></i>
              </div>
            </div>

            <p className={styles.transmissionPrivacy}>{copy.local}</p>
          </figure>

          <div className={styles.contactConsole}>
            <div className={styles.consoleHeading}>
              <span>TO</span>
              <strong>{EMAIL}</strong>
              <span>2026</span>
            </div>

            <a
              className={styles.emailLink}
              href={`mailto:${EMAIL}`}
              aria-label={`${copy.write} — ${EMAIL}`}
              onClick={() => onTrace?.(0.12)}
            >
              <span>{copy.nextJourney}</span>
              <strong>etienne.mentrel<wbr />@gmail.com</strong>
              <i aria-hidden="true">↗</i>
            </a>

            <button
              type="button"
              className={styles.copyButton}
              onClick={handleCopy}
              aria-label={copy.copyLabel}
            >
              <span aria-hidden="true">{copyState === "copied" ? "✓" : "＋"}</span>
              {copyState === "copied" ? copy.copied : copy.copy}
            </button>

            <p className={styles.copyStatus} aria-live="polite" aria-atomic="true">
              {copyState === "copied" ? copy.copied : ""}
            </p>

            {copyState === "failed" && (
              <div className={styles.copyFallback} role="status" aria-live="polite">
                <label htmlFor="contact-email-fallback">{copy.fallback}</label>
                <input
                  ref={fallbackRef}
                  id="contact-email-fallback"
                  aria-label={copy.fallbackLabel}
                  value={EMAIL}
                  readOnly
                  onFocus={(event) => event.currentTarget.select()}
                />
              </div>
            )}
          </div>
        </div>

        <footer className={styles.contactFooter}>
          <p>{copy.availability}</p>
          <div>
            <a href={resumeUrl} target="_blank" rel="noopener noreferrer">
              {copy.resume}<span aria-hidden="true">↗</span>
            </a>
            <a href="https://github.com/H1B0B0" target="_blank" rel="noopener noreferrer">
              {copy.github}<span aria-hidden="true">↗</span>
            </a>
          </div>
        </footer>
      </div>
    </section>
  );
}
