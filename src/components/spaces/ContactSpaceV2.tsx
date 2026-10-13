"use client";

import { useEffect, useRef, useState } from "react";
import { useLanguage } from "@/i18n/LanguageContext";
import { INITIAL_COMPOSITION, type CreativeTrace, type FoldComposition } from "@/context/ExperienceContext";
import FoldSignature from "@/components/experience/FoldSignature";
import styles from "./profile-contact.module.css";

export type ContactSpaceV2Props = {
  resumeUrl: string;
  visitedDestinations?: readonly string[];
  traceLevel?: number;
  trace?: Partial<CreativeTrace>;
  composition?: FoldComposition;
  onTrace?: (amount: number) => void;
};
const EMAIL = "etienne.mentrel@gmail.com";

export default function ContactSpaceV2({ resumeUrl, onTrace, composition = INITIAL_COMPOSITION }: ContactSpaceV2Props) {
  const { currentLanguage } = useLanguage();
  const copy = currentLanguage === "fr" ? {
    eyebrow: "Contact", title: "La suite s’écrit", titleAccent: "ensemble.",
    introduction: "Une idée, un projet ou une conversation. Je suis à un message.",
    recipient: "À Etienne Mentrel", letter: composition.authored ? "Signée par votre pli" : "Une lettre ouverte",
    signature: composition.authored ? "La pièce de votre visite." : "Une forme, avant les mots.", colophon: "Fin du folio / début de la conversation",
    write: "Écrire un email", copy: "Copier l’adresse", copying: "Copie en cours…",
    copied: "Adresse copiée — à vous d’écrire.", copyLabel: "Copier l’adresse email d’Etienne Mentrel",
    fallback: "La copie automatique est indisponible. Copiez l’adresse ci-dessous.",
    fallbackLabel: "Adresse email à copier manuellement",
    availability: "Disponible pour des projets sélectionnés",
    resume: "Voir mon CV", github: "Profil GitHub",
  } : {
    eyebrow: "Contact", title: "Let’s write", titleAccent: "what comes next.",
    introduction: "An idea, a project or a conversation. I’m a message away.",
    recipient: "To Etienne Mentrel", letter: composition.authored ? "Signed by your fold" : "An open letter",
    signature: composition.authored ? "The piece from your visit." : "A form, before the words.", colophon: "End of the folio / start of a conversation",
    write: "Write an email", copy: "Copy address", copying: "Copying…",
    copied: "Address copied — your move.", copyLabel: "Copy Etienne Mentrel’s email address",
    fallback: "Automatic copy is unavailable. Copy the address below.",
    fallbackLabel: "Email address to copy manually",
    availability: "Available for selected projects",
    resume: "View resume", github: "GitHub profile",
  };
  const [copyState, setCopyState] = useState<"idle" | "copying" | "copied" | "failed">("idle");
  const headingRef = useRef<HTMLHeadingElement>(null);
  const fallbackRef = useRef<HTMLInputElement>(null);
  useEffect(() => { headingRef.current?.focus({ preventScroll: true }); }, []);
  const handleCopy = async () => {
    setCopyState("copying");
    let timeout = 0;
    try {
      if (!navigator.clipboard) throw new Error("Clipboard API unavailable");
      await Promise.race([
        navigator.clipboard.writeText(EMAIL),
        new Promise<never>((_, reject) => {
          timeout = window.setTimeout(() => reject(new Error("Clipboard did not respond")), 1200);
        }),
      ]);
      setCopyState("copied"); onTrace?.(0.12);
    } catch {
      setCopyState("failed");
      window.requestAnimationFrame(() => { fallbackRef.current?.focus(); fallbackRef.current?.select(); });
    } finally {
      window.clearTimeout(timeout);
    }
  };
  return (
    <section className={styles.contactRoot} data-contact-state={copyState} data-space="contact-v2" aria-labelledby="contact-v2-title">
      <div className={styles.contactShell}>
        <div className={styles.folioMasthead}><p className={styles.contactEyebrow}><span aria-hidden="true">04</span>{copy.eyebrow}</p><span>{copy.colophon}</span></div>
        <header className={styles.contactHeader}>
          <h1 id="contact-v2-title" ref={headingRef} tabIndex={-1} className={styles.contactTitle}>{copy.title}{" "}<em>{copy.titleAccent}</em></h1>
          <p className={styles.contactIntroduction}>{copy.introduction}</p>
        </header>
        <div className={styles.contactConsole} data-letter-authored={composition.authored}>
          <div className={styles.letterHeading}><span>{copy.recipient}</span><span>{copy.letter}</span></div>
          <div className={styles.letterSignature}><div className={styles.letterFold} aria-hidden="true"><FoldSignature form={composition.form} tension={composition.tension} phase={composition.phase} tone="ink" /></div><p>{composition.authored && composition.name ? composition.name : copy.signature}</p></div>
          <a className={styles.emailLink} href={`mailto:${EMAIL}`} aria-label={`${copy.write} — ${EMAIL}`} onClick={() => onTrace?.(0.12)}>
            <strong>etienne.mentrel<wbr />@gmail.com</strong>
            <span className={styles.writeLabel}>{copy.write}<span aria-hidden="true">↗</span></span>
          </a>
          <button type="button" className={styles.copyButton} onClick={handleCopy} aria-label={copy.copyLabel} disabled={copyState === "copying"}>
            <svg className={styles.copyIcon} viewBox="0 0 20 20" fill="none" stroke="currentColor" strokeWidth="1.5" aria-hidden="true" focusable="false">{copyState === "copied" ? <path d="m4 10 4 4 8-8" /> : <><rect x="7" y="7" width="10" height="10" rx="1" /><path d="M12 7V3H3v9h4" /></>}</svg>
            {copyState === "copied" ? copy.copied : copyState === "copying" ? copy.copying : copy.copy}
          </button>
          <p className={styles.copyStatus} aria-live="polite" aria-atomic="true">{copyState === "copied" ? copy.copied : ""}</p>
          {copyState === "failed" && <div className={styles.copyFallback} role="status">
            <label htmlFor="contact-email-fallback">{copy.fallback}</label>
            <input ref={fallbackRef} id="contact-email-fallback" aria-label={copy.fallbackLabel} value={EMAIL} readOnly onFocus={(event) => event.currentTarget.select()} />
          </div>}
        </div>
        <footer className={styles.contactFooter}>
          <p>{copy.availability}</p>
          <div><a href={resumeUrl} target="_blank" rel="noopener noreferrer">{copy.resume}<span aria-hidden="true">↗</span></a><a href="https://github.com/H1B0B0" target="_blank" rel="noopener noreferrer">{copy.github}<span aria-hidden="true">↗</span></a></div>
        </footer>
      </div>
    </section>
  );
}
