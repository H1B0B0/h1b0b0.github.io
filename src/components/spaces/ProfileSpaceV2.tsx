"use client";

import Image from "next/image";
import { useEffect, useRef, useState } from "react";

import { useLanguage } from "@/i18n/LanguageContext";
import type { CreativeTrace } from "@/context/ExperienceContext";

import styles from "./profile-contact.module.css";

type ProcessStepId = "frame" | "prototype" | "shape" | "engineer" | "ship";

type ProcessStep = {
  id: ProcessStepId;
  label: string;
  verb: string;
  summary: string;
  proof: readonly string[];
  behavior: string;
};

export type ProfileSpaceV2Props = {
  resumeUrl: string;
  visitedDestinations?: readonly string[];
  traceLevel?: number;
  trace?: Partial<CreativeTrace>;
  onTrace?: (amount: number) => void;
};

const PROCESS_COPY: Record<"fr" | "en", readonly ProcessStep[]> = {
  fr: [
    {
      id: "frame",
      label: "Cadrer",
      verb: "Trouver le vrai sujet",
      summary:
        "Je commence par l’émotion, le public et la contrainte. La technologie arrive quand le projet sait déjà ce qu’il veut provoquer.",
      proof: [
        "Une intention formulée en une phrase",
        "Un parcours priorisé avant les écrans",
        "Un critère de réussite explicite",
      ],
      behavior:
        "Le cadre isole l’essentiel : chaque élément sans rôle narratif disparaît de la composition.",
    },
    {
      id: "prototype",
      label: "Prototyper",
      verb: "Tester le geste central",
      summary:
        "Je rends l’idée manipulable tôt pour vérifier le rythme, la compréhension et le risque technique avant de polir l’interface.",
      proof: [
        "Un prototype navigable avec du contenu réel",
        "Le risque WebGL ou interaction testé en premier",
        "Des décisions observables plutôt qu’un long document",
      ],
      behavior:
        "Les points deviennent un chemin : le prototype vérifie la relation entre les moments, pas leur décoration.",
    },
    {
      id: "shape",
      label: "Donner forme",
      verb: "Construire un langage",
      summary:
        "Typographie, matière, mouvement et hiérarchie sont réglés comme un seul système, puis confrontés aux vrais contenus.",
      proof: [
        "Des règles visuelles réutilisables",
        "Un mouvement relié à une intention",
        "Une composition qui reste lisible sans effet",
      ],
      behavior:
        "La matière se décentre et crée une tension contrôlée ; la forme devient une décision, jamais un habillage.",
    },
    {
      id: "engineer",
      label: "Ingénier",
      verb: "Rendre l’idée robuste",
      summary:
        "J’organise le code, les états et les fallbacks pour que l’ambition visuelle survive au clavier, au mobile et aux appareils modestes.",
      proof: [
        "Composants isolés et états explicites",
        "Clavier, reduced-motion et fallback prévus",
        "Rendu et coût technique mesurés ensemble",
      ],
      behavior:
        "La structure apparaît sous la surface : les couches restent indépendantes tout en partageant le même signal.",
    },
    {
      id: "ship",
      label: "Livrer",
      verb: "Faire exister pour de vrai",
      summary:
        "La mise en ligne fait partie du design. Je vérifie les formats, les erreurs et le déploiement jusqu’à une expérience réellement visitable.",
      proof: [
        "Parcours revu du 320 px au grand écran",
        "États d’échec et actions principales vérifiés",
        "Production, domaine et livraison accompagnés",
      ],
      behavior:
        "Les fragments convergent vers un point de sortie : le projet n’est terminé que lorsqu’il fonctionne hors du prototype.",
    },
  ],
  en: [
    {
      id: "frame",
      label: "Frame",
      verb: "Find the real subject",
      summary:
        "I begin with the emotion, audience and constraint. Technology enters once the project knows what it needs to provoke.",
      proof: [
        "One sentence that states the intention",
        "A journey prioritised before screens",
        "An explicit definition of success",
      ],
      behavior:
        "The frame isolates what matters: anything without a narrative role leaves the composition.",
    },
    {
      id: "prototype",
      label: "Prototype",
      verb: "Test the defining gesture",
      summary:
        "I make the idea tangible early, testing rhythm, understanding and technical risk before polishing the interface.",
      proof: [
        "A navigable prototype using real content",
        "The riskiest WebGL or interaction idea tested first",
        "Observable decisions instead of a long document",
      ],
      behavior:
        "Points become a route: the prototype tests the relationship between moments, not their decoration.",
    },
    {
      id: "shape",
      label: "Shape",
      verb: "Build a language",
      summary:
        "Type, material, motion and hierarchy are tuned as one system, then tested against the actual content.",
      proof: [
        "Reusable visual rules",
        "Motion tied to a clear intention",
        "A composition that remains legible without effects",
      ],
      behavior:
        "The material shifts off-centre and creates controlled tension; form becomes a decision rather than a finish.",
    },
    {
      id: "engineer",
      label: "Engineer",
      verb: "Make the idea resilient",
      summary:
        "I structure code, states and fallbacks so visual ambition survives keyboards, mobile devices and modest hardware.",
      proof: [
        "Isolated components and explicit states",
        "Keyboard, reduced motion and fallback designed in",
        "Rendering cost and creative intent measured together",
      ],
      behavior:
        "The structure surfaces beneath the image: independent layers keep sharing the same signal.",
    },
    {
      id: "ship",
      label: "Ship",
      verb: "Make it real",
      summary:
        "Going live is part of the design. I check formats, failures and deployment until the experience is genuinely visitable.",
      proof: [
        "The journey reviewed from 320 px to wide screens",
        "Failure states and primary actions verified",
        "Production, domain and delivery supported",
      ],
      behavior:
        "Fragments converge on an exit point: the project is only finished when it works beyond the prototype.",
    },
  ],
};

export default function ProfileSpaceV2({
  resumeUrl,
  visitedDestinations = [],
  traceLevel = 0,
  trace = {},
  onTrace,
}: ProfileSpaceV2Props) {
  const { currentLanguage } = useLanguage();
  const language = currentLanguage === "fr" ? "fr" : "en";
  const copy = language === "fr"
    ? {
        eyebrow: "Profil · méthode en mouvement",
        title: "Je transforme une intention en expérience livrée.",
        introduction:
          "Je suis Etienne Mentrel, développeur créatif et ingénieur. Mon travail relie direction, interaction et production au lieu de les traiter comme trois étapes séparées.",
        author: "Auteur du système",
        process: "Processus interactif",
        evidence: "Preuves et comportement",
        liveBehavior: "Ce que le geste montre",
        journey: "Trace de visite",
        visited: "espaces explorés",
        resume: "Voir mon CV",
        github: "Profil GitHub",
        channels: { form: "Forme", motion: "Mouvement", system: "Système" },
      }
    : {
        eyebrow: "Profile · method in motion",
        title: "I turn an intention into a delivered experience.",
        introduction:
          "I am Etienne Mentrel, a creative developer and engineer. My work connects direction, interaction and production instead of treating them as separate phases.",
        author: "System author",
        process: "Interactive process",
        evidence: "Proof and behaviour",
        liveBehavior: "What the gesture reveals",
        journey: "Journey trace",
        visited: "spaces explored",
        resume: "View resume",
        github: "GitHub profile",
        channels: { form: "Form", motion: "Motion", system: "System" },
      };
  const steps = PROCESS_COPY[language];
  const [activeStepId, setActiveStepId] = useState<ProcessStepId>("frame");
  const headingRef = useRef<HTMLHeadingElement>(null);
  const activeStep = steps.find((step) => step.id === activeStepId) ?? steps[0];
  const normalizedTrace = Math.max(0, Math.min(1, traceLevel));
  const visitedCount = new Set(visitedDestinations).size;

  useEffect(() => {
    headingRef.current?.focus({ preventScroll: true });
  }, []);

  const selectStep = (step: ProcessStep, control: HTMLButtonElement) => {
    const rail = control.parentElement;
    if (rail) {
      const reducedMotion = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
      rail.scrollTo({
        left: control.offsetLeft - (rail.clientWidth - control.offsetWidth) / 2,
        behavior: reducedMotion ? "auto" : "smooth",
      });
    }

    if (step.id !== activeStepId) {
      setActiveStepId(step.id);
      onTrace?.(0.08);
    }
  };

  return (
    <section
      className={styles.profileRoot}
      data-profile-step={activeStep.id}
      data-space="profile-v2"
      aria-labelledby="profile-v2-title"
    >
      <div className={styles.profileShell}>
        <header className={styles.profileHeader}>
          <p className={styles.eyebrow}>{copy.eyebrow}</p>
          <div className={styles.profileHeadingGrid}>
            <div>
              <h1
                id="profile-v2-title"
                ref={headingRef}
                tabIndex={-1}
                className={styles.profileTitle}
              >
                {copy.title}
              </h1>
              <p className={styles.profileIntroduction}>{copy.introduction}</p>
            </div>

            <aside className={styles.authorCard} aria-label={copy.author}>
              <div className={styles.authorPortrait}>
                <Image
                  src="/avatar.webp"
                  alt="Etienne Mentrel"
                  fill
                  sizes="(max-width: 700px) 72px, 144px"
                  className={styles.authorImage}
                />
              </div>
              <div>
                <span>{copy.author}</span>
                <strong>Etienne Mentrel</strong>
                <small>Creative developer · DevOps</small>
              </div>
            </aside>
          </div>
        </header>

        <div className={styles.profileInstrument}>
          <nav className={styles.processRail} aria-label={copy.process}>
            {steps.map((step, index) => (
              <button
                key={step.id}
                type="button"
                aria-pressed={step.id === activeStep.id}
                onClick={(event) => selectStep(step, event.currentTarget)}
                className={styles.processButton}
              >
                <span className={styles.processNumber}>{String(index + 1).padStart(2, "0")}</span>
                <span>
                  <strong>{step.label}</strong>
                  <small>{step.verb}</small>
                </span>
              </button>
            ))}
          </nav>

          <div className={styles.processCanvas} aria-hidden="true">
            <div className={styles.canvasIndex}>EM / PROCESS — {activeStep.id.toUpperCase()}</div>
            <div className={styles.canvasAxisHorizontal} />
            <div className={styles.canvasAxisVertical} />

            <div className={styles.frameLayer}>
              <i /><i /><i /><i />
              <span>01</span>
            </div>
            <div className={styles.prototypeLayer}>
              <i /><i /><i /><i /><i />
              <span /><span /><span /><span />
            </div>
            <div className={styles.shapeLayer}>
              <i />
              <span>FORM</span>
            </div>
            <div className={styles.engineerLayer}>
              <span>INPUT</span><i /><span>STATE</span><i /><span>OUTPUT</span>
            </div>
            <div className={styles.shipLayer}>
              <i /><span>LIVE</span>
            </div>

            <div className={styles.traceReadout}>
              <span>{copy.journey}</span>
              <strong>{String(visitedCount).padStart(2, "0")}</strong>
              <small>{copy.visited}</small>
              <div className={styles.traceChannels}>
                {(["form", "motion", "system"] as const).map((channel) => {
                  const value = Math.max(0, Math.min(1, trace[channel] ?? normalizedTrace));
                  return (
                    <div key={channel}>
                      <span>{copy.channels[channel]}</span>
                      <i aria-hidden="true"><b style={{ transform: `scaleX(${value})` }} /></i>
                      <output>{Math.round(value * 100)}</output>
                    </div>
                  );
                })}
              </div>
            </div>
          </div>

          <p className={styles.srOnly} aria-live="polite">
            {copy.journey} — {copy.channels.form}: {Math.round(Math.max(0, Math.min(1, trace.form ?? normalizedTrace)) * 100)}; {copy.channels.motion}: {Math.round(Math.max(0, Math.min(1, trace.motion ?? normalizedTrace)) * 100)}; {copy.channels.system}: {Math.round(Math.max(0, Math.min(1, trace.system ?? normalizedTrace)) * 100)}.
          </p>

          <article className={styles.evidencePanel} aria-live="polite" aria-atomic="true">
            <p className={styles.panelLabel}>{copy.evidence}</p>
            <div className={styles.evidenceHeading}>
              <span>{String(steps.indexOf(activeStep) + 1).padStart(2, "0")} / 05</span>
              <h2>{activeStep.label}</h2>
            </div>
            <p className={styles.evidenceSummary}>{activeStep.summary}</p>
            <ul className={styles.proofList}>
              {activeStep.proof.map((proof) => <li key={proof}>{proof}</li>)}
            </ul>
            <div className={styles.behaviorNote}>
              <span>{copy.liveBehavior}</span>
              <p>{activeStep.behavior}</p>
            </div>
          </article>
        </div>

        <footer className={styles.profileFooter}>
          <a href={resumeUrl} target="_blank" rel="noopener noreferrer">
            {copy.resume}<span aria-hidden="true">↗</span>
          </a>
          <a href="https://github.com/H1B0B0" target="_blank" rel="noopener noreferrer">
            {copy.github}<span aria-hidden="true">↗</span>
          </a>
        </footer>
      </div>
    </section>
  );
}
