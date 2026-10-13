"use client";

import Image from "next/image";
import { useRef, useState } from "react";
import { INITIAL_COMPOSITION, type FoldComposition, type ExperienceDestination } from "@/context/ExperienceContext";
import type { CreativeDestination } from "./CreativeMatter";
import FoldSignature from "./FoldSignature";
import styles from "./ExperienceIndex.module.css";

export type IndexDestination = {
  id: Exclude<ExperienceDestination, "index">;
  label: string;
  description?: string;
  meta?: string;
};

export interface ExperienceIndexProps {
  name?: string;
  role: string;
  eyebrow?: string;
  title: string;
  titleAccent?: string;
  description?: string;
  destinations: readonly IndexDestination[];
  visited?: readonly CreativeDestination[];
  activeDestination?: CreativeDestination;
  instruction?: string;
  edition?: string;
  visitedLabel?: string;
  matterLabel?: string;
  tracesLabel?: string;
  channels?: Partial<Record<"form" | "motion" | "system", number>>;
  channelLabels?: Partial<Record<"form" | "motion" | "system", string>>;
  onNavigate: (destination: IndexDestination["id"], source?: HTMLElement) => void;
  transitionLeaf?: IndexDestination["id"];
  onPreviewDestination?: (destination: IndexDestination["id"] | null) => void;
  onPointerEnergyChange?: (energy: number) => void;
  className?: string;
  language?: "fr" | "en";
  composition?: FoldComposition;
  onCompositionChange?: (next: Partial<FoldComposition>) => void;
}

/** A physical folio: every exposed sheet is a direct entrance, never a hidden carousel. */
export default function ExperienceIndex({
  role, eyebrow, destinations, visited = [], visitedLabel = "Visited", onNavigate,
  onPreviewDestination, className = "", language = "fr", composition = INITIAL_COMPOSITION, transitionLeaf,
}: ExperienceIndexProps) {
  const [preview, setPreview] = useState<IndexDestination["id"] | null>(null);
  const focusedLeaf = useRef<IndexDestination["id"] | null>(null);
  const french = language === "fr";
  const notes = french ? {
    work: "Une idée livrée. BlueVidia.", lab: "Une idée entre vos mains.",
    profile: "Les idées derrière les gestes.", contact: "La prochaine idée, ensemble.",
  } : {
    work: "An idea, delivered. BlueVidia.", lab: "An idea in your hands.",
    profile: "The ideas behind the choices.", contact: "The next idea, together.",
  };
  const select = (id: IndexDestination["id"] | null) => {
    setPreview(id);
    onPreviewDestination?.(id);
  };

  return (
    <section className={`${styles.index} ${className}`} data-space="index" data-experience-index data-preview={preview ?? undefined} aria-labelledby="experience-index-title">
      <div className={styles.introduction}>
        <div>
          <p className={styles.eyebrow}>{eyebrow}</p>
          <h1 id="experience-index-title" className={styles.title}>
            {french ? "La créativité" : "Creativity"}<br />
            <em>{french ? "prend forme." : "takes shape."}</em>
          </h1>
        </div>
        <p className={styles.intent}>{french ? "Un portfolio à déplier. Des sites à ressentir." : "A portfolio to unfold. Websites to feel."}</p>
      </div>

      <nav className={styles.folio} aria-label={french ? "Explorer le portfolio" : "Explore the portfolio"}>
        {destinations.map((destination, index) => (
          <button
            type="button" key={destination.id} className={styles.leaf} data-leaf={destination.id}
            data-selected={preview === destination.id || undefined}
            style={{ viewTransitionName: transitionLeaf === destination.id ? "folio-sheet" : undefined }}
            aria-label={`${destination.label}${visited.includes(destination.id) ? ` · ${visitedLabel}` : ""}`}
            onPointerEnter={(event) => { if (event.pointerType === "mouse") select(destination.id); }}
            onPointerMove={(event) => {
              if (event.pointerType !== "mouse") return;
              const bounds = event.currentTarget.getBoundingClientRect();
              event.currentTarget.style.setProperty("--light-position", `${Math.round((event.clientX - bounds.left) / bounds.width * 100)}%`);
              event.currentTarget.style.setProperty("--paper-tilt", `${((event.clientY - bounds.top) / bounds.height - .5) * -4}deg`);
            }}
            onPointerLeave={(event) => {
              event.currentTarget.style.removeProperty("--light-position");
              event.currentTarget.style.removeProperty("--paper-tilt");
              select(focusedLeaf.current);
            }}
            onFocus={() => { focusedLeaf.current = destination.id; select(destination.id); }}
            onBlur={() => { focusedLeaf.current = null; select(null); }}
            onClick={(event) => onNavigate(destination.id, event.currentTarget)}
          >
            <span className={styles.leafTop}><span>{String(index + 1).padStart(2, "0")}</span><span className={styles.leafHint}>{french ? "Ouvrir" : "Open"}<span aria-hidden="true"> ↗</span></span></span>
            <span className={styles.artwork} aria-hidden="true">
              {destination.id === "work" ? <><span className={styles.printCaption}>BlueVidia<span>WEB / CLIENT</span></span><span className={styles.sitePrint}><Image src="/images/projects/bluevidia-desktop.jpg" alt="" fill sizes="(max-width: 700px) 240px, 36vw" priority className={styles.siteImage} /></span></>
              : destination.id === "lab" ? <FoldSignature as="span" className={styles.fold} form={composition.form} tension={composition.tension} phase={composition.phase} />
              : destination.id === "profile" ? <><span className={styles.authorInitials}>em.</span><span className={styles.portraitPrint}><Image src="/avatar.webp" alt="" fill sizes="(max-width: 700px) 160px, 24vw" className={styles.portrait} /></span></>
              : <span className={styles.invitation}>{french ? <>Et si<br />on lui<br />donnait<br /><em>forme ?</em></> : <>What<br />could<br />we<br /><em>make?</em></>}<span className={styles.letterFold} /></span>}
            </span>
            <span className={styles.leafBottom}><span className={styles.destinationLabel}>{destination.label}</span><span className={styles.leafNote}>{notes[destination.id]}</span></span>
          </button>
        ))}
      </nav>

      <footer className={styles.footer}><span>{role}</span><span>{french ? "À déplier dans l’ordre de vos envies." : "Unfold in any order you like."}</span></footer>
    </section>
  );
}
