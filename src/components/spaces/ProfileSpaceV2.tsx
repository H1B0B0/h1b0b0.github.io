"use client";

import Image from "next/image";
import { useEffect, useRef, useState } from "react";

import { useLanguage } from "@/i18n/LanguageContext";
import { INITIAL_COMPOSITION, type CreativeTrace, type FoldComposition } from "@/context/ExperienceContext";
import FoldSignature from "@/components/experience/FoldSignature";

import styles from "./profile-contact.module.css";

type PrincipleId = "intention" | "gesture" | "precision";
type Principle = {
  id: PrincipleId;
  label: string;
  title: string;
  description: string;
  note: string;
  action: string;
  destination: "work" | "lab";
};

export type ProfileSpaceV2Props = {
  resumeUrl: string;
  visitedDestinations?: readonly string[];
  traceLevel?: number;
  trace?: Partial<CreativeTrace>;
  composition?: FoldComposition;
  onTrace?: (amount: number) => void;
};

const PRINCIPLES: Record<"fr" | "en", readonly Principle[]> = {
  fr: [
    { id: "intention", label: "Intention", title: "Faire ressentir quelque chose.", description: "Pour BlueVidia, j’ai placé l’identité avant le catalogue. Le nom, la matière et l’accès aux films composent l’accueil : une entrée dans l’univers du studio, pas une liste de contenus.", note: "BlueVidia · interface d’accueil livrée", action: "Découvrir ce choix dans Travaux", destination: "work" },
    { id: "gesture", label: "Geste", title: "Donner envie de parcourir.", description: "Ici, vous pouvez changer le pli plutôt que simplement le regarder. Il garde votre forme d’une page à l’autre. Une interaction doit laisser quelque chose, pas seulement faire un effet.", note: "Le pli de cette visite · une seule pièce conservée", action: "Continuer cette pièce au laboratoire", destination: "lab" },
    { id: "precision", label: "Précision", title: "Faire tenir l’ensemble.", description: "Sur BlueVidia, je ne réduis pas l’accueil desktop pour le faire entrer sur un téléphone. La composition change ; le nom, la navigation et l’accès aux films restent les repères.", note: "BlueVidia · accueil au format mobile", action: "Voir l’adaptation dans Travaux", destination: "work" },
  ],
  en: [
    { id: "intention", label: "Intention", title: "Make someone feel something.", description: "For BlueVidia, I put identity before the catalogue. The name, material and access to films shape the homepage: a way into the studio’s world, not a list of content.", note: "BlueVidia · delivered homepage interface", action: "Explore this choice in Work", destination: "work" },
    { id: "gesture", label: "Gesture", title: "Make exploring feel natural.", description: "Here, you can change the fold rather than just look at it. It keeps your shape as you move between pages. An interaction should leave something with you, not just make an effect.", note: "This visit’s fold · one piece kept throughout", action: "Continue this piece in the laboratory", destination: "lab" },
    { id: "precision", label: "Precision", title: "Make the whole thing hold.", description: "On BlueVidia, I do not shrink the desktop homepage to fit a phone. The composition changes; the name, navigation and access to films remain the landmarks.", note: "BlueVidia · mobile homepage", action: "Explore the adaptation in Work", destination: "work" },
  ],
};

export default function ProfileSpaceV2({ resumeUrl, onTrace, composition = INITIAL_COMPOSITION }: ProfileSpaceV2Props) {
  const { currentLanguage } = useLanguage();
  const language = currentLanguage === "fr" ? "fr" : "en";
  const copy = language === "fr" ? {
    eyebrow: "Profil", title: "Etienne", titleAccent: "Mentrel.",
    belief: "Le beau n’est pas un supplément.",
    conviction: "Un bon site doit être beau, bien construit et simple à parcourir. Mais surtout, il doit raconter quelque chose qui lui appartient.",
    method: "Notes de travail.", process: "Explorer mes choix de design", illustration: "Exemple réel du choix de design sélectionné",
    colophon: "Direction visuelle / interaction / production",
    authorRole: "Développeur créatif · Ingénieur", resume: "Voir mon CV", github: "Profil GitHub",
    turn: "Les idées derrière le portrait", return: "Revenir au portrait", recto: "Recto / La personne", verso: "Verso / Les idées",
    desktopAlt: "Interface de l’accueil BlueVidia conçue par Etienne Mentrel, avec le nom du studio et la matière bleue", mobileAlt: "Interface de l’accueil BlueVidia adaptée au format mobile", foldLabel: "Le pli conservé depuis l’accueil ou le laboratoire",
  } : {
    eyebrow: "Profile", title: "Etienne", titleAccent: "Mentrel.",
    belief: "Beauty is not an afterthought.",
    conviction: "A good website should be beautiful, well built and easy to explore. Above all, it should tell a story of its own.",
    method: "Working notes.", process: "Explore my design choices", illustration: "An actual example of the selected design choice",
    colophon: "Visual direction / interaction / production",
    authorRole: "Creative developer · Engineer", resume: "View resume", github: "GitHub profile",
    turn: "The ideas behind the portrait", return: "Return to the portrait", recto: "Front / The person", verso: "Back / The ideas",
    desktopAlt: "BlueVidia homepage interface designed by Etienne Mentrel, with the studio name and blue material", mobileAlt: "BlueVidia homepage interface adapted for mobile", foldLabel: "The fold kept from the homepage or the laboratory",
  };
  const [activePrincipleId, setActivePrincipleId] = useState<PrincipleId>("intention");
  const [portraitTurned, setPortraitTurned] = useState(false);
  const principles = PRINCIPLES[language];
  const activePrinciple = principles.find((principle) => principle.id === activePrincipleId) ?? principles[0];
  const headingRef = useRef<HTMLHeadingElement>(null);
  useEffect(() => { headingRef.current?.focus({ preventScroll: true }); }, []);

  return (
    <section className={styles.profileRoot} data-profile-step={activePrinciple.id} data-space="profile-v2" aria-labelledby="profile-v2-title">
      <div className={styles.profileShell}>
        <div className={styles.folioMasthead}><p className={styles.eyebrow}><span aria-hidden="true">03</span>{copy.eyebrow}</p><span>{copy.colophon}</span></div>
        <header className={styles.profileHeader}>
          <div className={styles.profileCopy}>
            <h1 id="profile-v2-title" ref={headingRef} tabIndex={-1} className={styles.profileTitle}>{copy.title}{" "}<em>{copy.titleAccent}</em></h1>
          </div>
          <figure className={styles.authorCard} data-portrait-turned={portraitTurned || undefined}>
            <div id="profile-portrait" className={styles.portraitStage}>
              <div className={styles.portraitSheet}>
                <div className={styles.authorPortrait} aria-hidden={portraitTurned}>
                  <Image src="/avatar.webp" alt="Etienne Mentrel" fill sizes="(max-width: 700px) 220px, (max-width: 900px) 260px, 340px" className={styles.authorImage} />
                  <span className={styles.portraitMark} aria-hidden="true">em.</span>
                </div>
                <div className={styles.portraitVerso} aria-hidden={!portraitTurned} data-principle={activePrinciple.id}>
                  <span className={styles.versoIndex} aria-hidden="true">0{principles.indexOf(activePrinciple) + 1} / {activePrinciple.label}</span>
                  <div className={styles.decisionProof} data-profile-proof={activePrinciple.id}>
                    {activePrinciple.id === "gesture" ? <div className={styles.proofFold}><FoldSignature form={composition.form} tension={composition.tension} phase={composition.phase} tone="ink" label={copy.foldLabel} /></div> : <div className={activePrinciple.id === "precision" ? styles.proofMobile : styles.proofDesktop}>
                      <Image src={`/images/projects/bluevidia-${activePrinciple.id === "precision" ? "mobile" : "desktop"}.jpg`} alt={activePrinciple.id === "precision" ? copy.mobileAlt : copy.desktopAlt} fill sizes={activePrinciple.id === "precision" ? "180px" : "340px"} className={styles.proofImage} />
                    </div>}
                  </div>
                  <p className={styles.versoCaption}>{activePrinciple.note}</p>
                </div>
              </div>
            </div>
            <figcaption className={styles.portraitColophon}>
              <span>{portraitTurned ? copy.verso : copy.recto}</span>
              <button type="button" className={styles.turnPortrait} aria-pressed={portraitTurned} aria-controls="profile-portrait" onClick={() => { setPortraitTurned(!portraitTurned); onTrace?.(0.08); }}>{portraitTurned ? copy.return : copy.turn}<span aria-hidden="true">↶</span></button>
              <nav className={styles.processRail} aria-label={copy.process}>
                {principles.map((principle, index) => (
                  <button key={principle.id} type="button" aria-pressed={principle.id === activePrinciple.id && portraitTurned} aria-controls="profile-portrait profile-principle-panel" className={styles.processButton} onClick={() => {
                    setPortraitTurned(true);
                    if (principle.id !== activePrincipleId) { setActivePrincipleId(principle.id); onTrace?.(0.08); }
                  }}><span className={styles.noteNumber} aria-hidden="true">0{index + 1}</span>{principle.label}</button>
                ))}
              </nav>
            </figcaption>
          </figure>
          <div className={styles.convictionBlock}><p className={styles.profileRole}>{copy.authorRole}</p><p className={styles.belief}>{copy.belief}</p><p className={styles.conviction}>{copy.conviction}</p></div>
        </header>

        <section className={styles.methodSection} aria-label={copy.method} hidden={!portraitTurned}>
          <div className={styles.methodHeading}>
            <h2>{copy.method}</h2>
          </div>
          <div id="profile-principle-panel" className={styles.profileInstrument}>
            <article className={styles.evidencePanel} aria-live="polite" aria-atomic="true">
              <h3>{activePrinciple.title}</h3>
              <p>{activePrinciple.description}</p>
              <a className={styles.specimenAction} href={`#${activePrinciple.destination}${activePrinciple.id === "precision" ? "/delivery" : ""}`} onClick={() => onTrace?.(0.08)}>{activePrinciple.action}<span aria-hidden="true">→</span></a>
            </article>
          </div>
        </section>

        <footer className={styles.profileFooter}>
          <a href={resumeUrl} target="_blank" rel="noopener noreferrer">{copy.resume}<span aria-hidden="true">↗</span></a>
          <a href="https://github.com/H1B0B0" target="_blank" rel="noopener noreferrer">{copy.github}<span aria-hidden="true">↗</span></a>
        </footer>
      </div>
    </section>
  );
}
