"use client";

import Image from "next/image";
import { useEffect, useId, useMemo, useState, type CSSProperties, type Ref } from "react";
import FoldStudio from "../experience/FoldStudio";
import { buildCompositionSvg } from "../experience/compositionSvg";
import { INITIAL_COMPOSITION, type FoldComposition } from "@/context/ExperienceContext";
import styles from "./work-lab.module.css";

export type WorkLabView = "work" | "lab";
export type WorkLabLanguage = "fr" | "en";
export type CreativeChannel = "form" | "motion" | "system";
export type WorkLabTrace = {
  source: WorkLabView;
  channel: CreativeChannel;
  action: "navigate" | "case-chapter" | "case-media" | "material-tune" | "type-tune" | "system-route";
  value?: number;
};
export type WorkLabSpaceProps = {
  view: WorkLabView; language?: WorkLabLanguage;
  channels?: Partial<Record<CreativeChannel, number>>;
  className?: string; headingRef?: Ref<HTMLHeadingElement>;
  onNavigate?: (destination: WorkLabView) => void;
  onTrace?: (trace: WorkLabTrace) => void;
  composition?: FoldComposition;
  initialCaseChapter?: 0 | 1 | 2;
  onCompositionChange?: (next: Partial<FoldComposition>) => void;
};
type Variables = CSSProperties & Record<`--${string}`, string | number>;
const CHANNELS: readonly CreativeChannel[] = ["form", "motion", "system"];
const COPY = {
  fr: {
    eyebrow: "01 / Travaux · commande client", title: "BlueVidia.",
    intro: "Du caractère à l’interface. Une identité audiovisuelle, un site qui lui ressemble.",
    role: "Design & développement", stack: "Next.js · Three.js · GLSL", visit: "Voir le site", live: "En ligne",
    chaptersLabel: "Explorer les trois temps du projet",
    chapters: [
      { short: "Intention", title: "Faire ressentir, avant d’expliquer.", text: "J’ai placé l’identité avant le catalogue : un nom à grande échelle, une matière bleue, puis une invitation à explorer les films.", choice: "L’identité avant le catalogue", focus: "Typographie / matière", image: "bluevidia-desktop.jpg", alt: "Capture de l’accueil BlueVidia : composition typographique et matière bleue" },
      { short: "Composition", title: "Un parcours, plusieurs rythmes.", text: "J’ai fait du contraste un outil de lecture. Après l’accueil immersif, la page studio devient claire et éditoriale ; la navigation reste le repère.", choice: "Le contraste pour donner du rythme", focus: "Contraste / lecture", image: "bluevidia-studio.jpg", alt: "Capture de la page studio BlueVidia : composition éditoriale claire et photographie client" },
      { short: "Livraison", title: "La même intention, à chaque format.", text: "Sur petit écran, je garde l’essentiel : le nom, une navigation regroupée et l’accès aux films. La composition change, pas ses repères.", choice: "Adapter la composition, garder le sens", focus: "Repères / geste", image: "bluevidia-mobile.jpg", alt: "Capture de l’accueil BlueVidia au format mobile" },
    ],
    attribution: "Interface : Etienne Mentrel. Images, films et identité du studio : BlueVidia et leurs auteurs crédités.",
    capture: "Interface livrée", mobileCapture: "Format mobile · détail agrandi", details: "Détails du projet", choiceLabel: "Le choix de design",
    inspect: "Voir les repères", hideInspection: "Masquer les repères", inspectionLabel: "Lire les choix de composition", inspectionContext: "Annotation du portfolio", comparisonCapture: "Desktop / mobile",
    landmarks: [
      [
        { id: "identity", short: "Nom", note: "Le nom donne l’échelle. La matière reste derrière, au service de sa lisibilité.", bounds: [100, 470, 850, 180] },
        { id: "navigation", short: "Menu", note: "La navigation se détache en haut : un repère stable dans une entrée immersive.", bounds: [540, 18, 865, 74] },
        { id: "access", short: "Accès", note: "L’accès aux films est une action distincte. Le visiteur sait où commencer.", bounds: [56, 790, 197, 56] },
      ],
      [
        { id: "text", short: "Texte", note: "Le texte tient une colonne. Les retours à la ligne dessinent un rythme de lecture.", bounds: [110, 378, 410, 258] },
        { id: "image", short: "Image", note: "La photographie prend une colonne entière. L’interface lui donne sa place, sans la revendiquer.", bounds: [810, 248, 518, 610] },
        { id: "credit", short: "Crédit", note: "Le crédit reste dans l’image. L’interface cadre la photographie ; son auteur reste identifié.", bounds: [810, 810, 518, 48] },
      ],
      [
        { id: "desktop", short: "Desktop", note: "À grande largeur, la navigation se déploie et le nom occupe l’horizontale.", bounds: [0, 0, 1440, 900] },
        { id: "mobile", short: "Mobile", note: "Sur mobile, le menu se regroupe. Le nom et l’accès aux films restent visibles.", bounds: [0, 0, 1440, 900] },
      ],
    ],
    labEyebrow: "02 / Laboratoire · atelier ouvert", labTitle: "À vous de plier.",
    labIntro: "Une feuille, trois gestes. Faites-en une pièce à emporter.", experiments: "Choisir un outil de composition",
    studies: [
      { title: "Matière", description: "Glissez le pli de gauche à droite, ou réglez sa forme ci-dessous.", control: "Plier la matière", low: "Ouverte", high: "Serrée" },
      { title: "Typographie", description: "La tension de la forme devient celle du mot.", control: "Régler la tension", low: "Calme", high: "Radicale" },
      { title: "Système", description: "Six positions. Chaque passage recompose la pièce et monte d’un ton.", control: "Faire circuler le signal", low: "", high: "" },
    ],
    word: "LE PLI", propagate: "Propager", states: ["Origine", "Forme", "Mouvement", "Règle", "Retour", "Boucle complète"],
    piece: "Composition personnelle", name: "Nom de la pièce", export: "Exporter en SVG", reset: "Recommencer", exported: "Téléchargement demandé.", exportFailed: "L’export est indisponible dans ce navigateur.", resetDone: "Composition remise à zéro.", artworkLabel: "Sculpture de ruban plié, composée avec vos réglages", sheet: "Feuille libre",
  },
  en: {
    eyebrow: "01 / Work · client commission", title: "BlueVidia.",
    intro: "From character to interface. An audiovisual identity, a website in its image.",
    role: "Design & development", stack: "Next.js · Three.js · GLSL", visit: "Visit the website", live: "Live",
    chaptersLabel: "Explore the project's three stages",
    chapters: [
      { short: "Intent", title: "Feel it, before explaining it.", text: "I put identity before the catalogue: a large-scale name, blue material, then an invitation to explore the films.", choice: "Identity before the catalogue", focus: "Typography / material", image: "bluevidia-desktop.jpg", alt: "BlueVidia homepage screenshot: typographic composition and blue material" },
      { short: "Composition", title: "One journey, different rhythms.", text: "I used contrast as a reading tool. After the immersive opening, the studio page becomes light and editorial; navigation remains the anchor.", choice: "Contrast to create a rhythm", focus: "Contrast / reading", image: "bluevidia-studio.jpg", alt: "BlueVidia studio screenshot: light editorial composition and client photography" },
      { short: "Delivery", title: "The same intention, at every size.", text: "On smaller screens, I keep the essentials: the name, grouped navigation and access to the films. The composition changes, not its landmarks.", choice: "Adapt the composition, keep its meaning", focus: "Landmarks / gesture", image: "bluevidia-mobile.jpg", alt: "BlueVidia homepage screenshot at mobile size" },
    ],
    attribution: "Interface: Etienne Mentrel. Images, films and studio identity: BlueVidia and their credited authors.",
    capture: "Delivered interface", mobileCapture: "Mobile layout · enlarged detail", details: "Project details", choiceLabel: "The design choice",
    inspect: "Show the landmarks", hideInspection: "Hide the landmarks", inspectionLabel: "Read the composition choices", inspectionContext: "Portfolio annotation", comparisonCapture: "Desktop / mobile",
    landmarks: [
      [
        { id: "identity", short: "Name", note: "The name sets the scale. The material stays behind it, supporting its readability.", bounds: [100, 470, 850, 180] },
        { id: "navigation", short: "Menu", note: "Navigation stands apart at the top: a stable landmark inside an immersive opening.", bounds: [540, 18, 865, 74] },
        { id: "access", short: "Access", note: "Film access is a distinct action. The visitor knows where to begin.", bounds: [56, 790, 197, 56] },
      ],
      [
        { id: "text", short: "Text", note: "The text holds one column. Its line breaks set a reading rhythm.", bounds: [110, 378, 410, 258] },
        { id: "image", short: "Image", note: "Photography takes a whole column. The interface gives it room without claiming authorship.", bounds: [810, 248, 518, 610] },
        { id: "credit", short: "Credit", note: "The credit stays inside the image. The interface frames the photograph; its author remains identified.", bounds: [810, 810, 518, 48] },
      ],
      [
        { id: "desktop", short: "Desktop", note: "At a larger width, navigation unfolds and the name spans the horizontal space.", bounds: [0, 0, 1440, 900] },
        { id: "mobile", short: "Mobile", note: "On mobile, the menu is grouped. The name and film access stay visible.", bounds: [0, 0, 1440, 900] },
      ],
    ],
    labEyebrow: "02 / Laboratory · open studio", labTitle: "Your turn to fold.",
    labIntro: "One sheet, three gestures. Make a piece to take with you.", experiments: "Choose a composition tool",
    studies: [
      { title: "Material", description: "Drag the fold from side to side, or adjust its shape below.", control: "Fold the material", low: "Open", high: "Tight" },
      { title: "Typography", description: "The shape’s tension becomes the word’s tension.", control: "Adjust the tension", low: "Calm", high: "Radical" },
      { title: "System", description: "Six positions. Each move recomposes the piece and raises its pitch.", control: "Move the signal through the system", low: "", high: "" },
    ],
    word: "THE FOLD", propagate: "Propagate", states: ["Origin", "Form", "Motion", "Rule", "Return", "Loop complete"],
    piece: "Personal composition", name: "Name your piece", export: "Export SVG", reset: "Start again", exported: "Download requested.", exportFailed: "SVG export is unavailable in this browser.", resetDone: "Composition reset.", artworkLabel: "Folded ribbon sculpture composed with your settings", sheet: "An open sheet",
  },
};

export default function WorkLabSpace({ view, language = "fr", className, headingRef, onTrace, composition, onCompositionChange, initialCaseChapter = 0 }: WorkLabSpaceProps) {
  const copy = COPY[language];
  return (
    <section className={[styles.shell, styles[view], className].filter(Boolean).join(" ")} data-space={view} aria-labelledby={`${view}-space-title`}>
      <div className={styles.inner}>
        <header className={styles.header}>
          <p className={styles.eyebrow}>{view === "work" ? copy.eyebrow : copy.labEyebrow}</p>
          <h1 id={`${view}-space-title`} ref={headingRef} tabIndex={-1}>{view === "work" ? copy.title : copy.labTitle}</h1>
          <p className={styles.intro}>{view === "work" ? copy.intro : copy.labIntro}</p>
        </header>
        {view === "work" ? <BlueVidiaCase language={language} onTrace={onTrace} initialChapter={initialCaseChapter} /> : <CreativeLab language={language} onTrace={onTrace} composition={composition} onCompositionChange={onCompositionChange} />}
      </div>
    </section>
  );
}

function BlueVidiaCase({ language, onTrace, initialChapter = 0 }: { language: WorkLabLanguage; onTrace?: WorkLabSpaceProps["onTrace"]; initialChapter?: 0 | 1 | 2 }) {
  const copy = COPY[language];
  const [activeChapter, setActiveChapter] = useState<number>(initialChapter);
  const [showGuides, setShowGuides] = useState(false);
  const [activeLandmark, setActiveLandmark] = useState(0);
  const guideId = useId();
  const chapter = copy.chapters[activeChapter];
  const landmarks = copy.landmarks[activeChapter];
  const landmark = landmarks[activeLandmark];
  const [guideX, guideY, guideWidth, guideHeight] = landmark.bounds;
  const zoom = showGuides && activeChapter < 2 ? Math.max(1, Math.min(2.6, 1440 / guideWidth * .72, 900 / guideHeight * .72)) : 1;
  const zoomX = Math.min(0, Math.max(100 - zoom * 100, 50 - (guideX + guideWidth / 2) / 1440 * 100 * zoom));
  const zoomY = Math.min(0, Math.max(100 - zoom * 100, 50 - (guideY + guideHeight / 2) / 900 * 100 * zoom));
  const inspectionTransform = showGuides && activeChapter < 2
    ? `translate(${zoomX}%, ${zoomY}%) scale(${zoom})`
    : undefined;
  return (
    <article className={styles.caseStudy} aria-label="BlueVidia" data-chapter={activeChapter}>
      <nav className={styles.chapterNavigation} aria-label={copy.chaptersLabel}>
        {copy.chapters.map((item, index) => (
          <button type="button" key={item.short} aria-pressed={index === activeChapter} aria-controls="bluevidia-design-choice" onClick={() => {
            setActiveChapter(index);
            setShowGuides(false);
            setActiveLandmark(0);
            onTrace?.({ source: "work", channel: CHANNELS[index], action: "case-chapter", value: index / 2 });
          }}><span aria-hidden="true">0{index + 1}</span><strong>{item.short}</strong><span className={styles.chapterIndicator} aria-hidden="true">{index === activeChapter ? "−" : "+"}</span></button>
        ))}
      </nav>
      <div className={styles.caseBody}>
        <div id="bluevidia-design-choice" className={styles.story}>
          <div className={styles.storyCopy} aria-live="polite" aria-atomic="true">
            <p className={styles.choiceLabel}>{showGuides ? copy.inspectionContext : chapter.focus} <span>0{activeChapter + 1} / 03</span></p>
            <h2>{chapter.title}</h2><p id="bluevidia-inspector-description">{showGuides ? landmark.note : chapter.text}</p>
          </div>
          <a className={styles.visitLink} href="https://bluevidia.com" target="_blank" rel="noopener noreferrer" onClick={() => onTrace?.({ source: "work", channel: "system", action: "case-media", value: 1 })}>{copy.visit}<span aria-hidden="true">↗</span></a>
        </div>
        <figure className={styles.projectFigure} data-case-frame data-case-inspection={showGuides ? landmark.id : "interface"}>
          <div id="bluevidia-capture-view" className={styles.mediaViewport} data-case-viewport data-mobile={activeChapter === 2 && showGuides && landmark.id === "mobile"}>
            <div className={styles.captureSheet} style={{ transform: inspectionTransform }}>
            {activeChapter === 2 && !showGuides ? <div className={styles.breakpointComparison}>
              <div className={styles.desktopOverview}><Image src="/images/projects/bluevidia-desktop.jpg" alt={copy.chapters[0].alt} fill sizes="(max-width: 760px) 60vw, 36vw" className={styles.projectImage} /><span aria-hidden="true">1440</span></div>
              <div className={styles.mobileOverview}><Image src="/images/projects/bluevidia-mobile.jpg" alt={chapter.alt} fill sizes="(max-width: 760px) 28vw, 16vw" className={styles.projectImage} /><span aria-hidden="true">390</span></div>
            </div> : <Image src={`/images/projects/${activeChapter === 2 && landmark.id === "desktop" ? "bluevidia-desktop.jpg" : chapter.image}`} alt={activeChapter === 2 && landmark.id === "desktop" ? copy.chapters[0].alt : chapter.alt} fill sizes="(max-width: 760px) 92vw, 55vw" className={styles.projectImage} priority={activeChapter === 0} />}
            <div id="bluevidia-capture-guide" className={styles.captureGuide} data-visible={activeChapter < 2 && showGuides} aria-hidden="true">
              <svg viewBox="0 0 1440 900" focusable="false">
                <defs><mask id={`${guideId}-focus`}><rect width="1440" height="900" fill="white" /><rect x={guideX} y={guideY} width={guideWidth} height={guideHeight} fill="black" /></mask></defs>
                <rect width="1440" height="900" fill="#08090c" fillOpacity=".72" mask={`url(#${guideId}-focus)`} />
                <rect x={guideX} y={guideY} width={guideWidth} height={guideHeight} fill="none" stroke="currentColor" strokeWidth="1" vectorEffect="non-scaling-stroke" />
              </svg>
            </div>
            </div>
          </div>
          <figcaption data-inspecting={showGuides}>
            {showGuides ? <div className={styles.inspectorChoices} role="group" aria-label={copy.inspectionLabel}>
              {landmarks.map((item, index) => <button type="button" key={item.id} aria-pressed={activeLandmark === index} aria-controls="bluevidia-capture-view bluevidia-inspector-description" onClick={() => {
                setActiveLandmark(index);
                onTrace?.({ source: "work", channel: "form", action: "case-media", value: index / Math.max(1, landmarks.length - 1) });
              }}>{item.short}</button>)}
            </div> : <span>{activeChapter === 2 ? copy.comparisonCapture : copy.capture}</span>}
            <button type="button" className={styles.inspectorButton} aria-label={showGuides ? copy.hideInspection : copy.inspect} aria-pressed={showGuides} aria-controls="bluevidia-capture-view bluevidia-inspector-description" aria-describedby="bluevidia-inspector-description" onClick={() => {
            setShowGuides((current) => !current);
            onTrace?.({ source: "work", channel: "form", action: "case-media", value: showGuides ? 0 : 1 });
          }}><span className={styles.inspectorToggleText}>{showGuides ? copy.hideInspection : copy.inspect}</span><span aria-hidden="true">{showGuides ? "−" : "+"}</span></button>
          </figcaption>
        </figure>
      </div>
      <footer className={styles.caseFooter}>
        <p>{copy.attribution}</p>
        <details className={styles.projectDetails}><summary>{copy.details}</summary><p>{copy.role}<br />{copy.stack}<br />{copy.live}</p></details>
      </footer>
    </article>
  );
}

function CreativeLab({ language, onTrace, composition, onCompositionChange }: { language: WorkLabLanguage } & Pick<WorkLabSpaceProps, "onTrace" | "composition" | "onCompositionChange">) {
  const copy = COPY[language];
  const controlId = useId();
  const [activeStudy, setActiveStudy] = useState(0);
  const [localComposition, setLocalComposition] = useState(INITIAL_COMPOSITION);
  const { form: materialDensity, tension: typeTension, phase: systemStep, name: pieceName } = composition ?? localComposition;
  const changeComposition = (next: Partial<FoldComposition>) => {
    if (onCompositionChange) onCompositionChange(next);
    else setLocalComposition((current) => ({ ...current, ...next }));
  };
  const [feedback, setFeedback] = useState<"" | "exported" | "exportFailed" | "resetDone">("");
  const [exportHref, setExportHref] = useState("");
  const study = copy.studies[activeStudy];
  const value = activeStudy === 0 ? materialDensity : typeTension;
  const title = pieceName.trim() || copy.word;
  const variables: Variables = {
    "--type-scale": 0.9 + typeTension / 1000,
    "--type-slant": `${(typeTension - 50) * -0.08}deg`,
    "--type-weight": 400 + typeTension * 3.5,
    "--title-size": `${Math.min(100, 720 / Math.max(6, title.length))}px`,
    "--title-length": Math.max(6, title.length),
  };
  const reset = () => {
    changeComposition(INITIAL_COMPOSITION);
    setFeedback("resetDone");
  };
  const exportSvg = useMemo(() => buildCompositionSvg({ form: materialDensity, tension: typeTension, phase: systemStep, title }), [materialDensity, typeTension, systemStep, title]);
  useEffect(() => {
    let url = "";
    try {
      url = URL.createObjectURL(new Blob([exportSvg], { type: "image/svg+xml;charset=utf-8" }));
      setExportHref(url);
      setFeedback((current) => current === "exportFailed" ? "" : current);
    } catch {
      setExportHref("");
      setFeedback("exportFailed");
    }
    return () => { if (url) URL.revokeObjectURL(url); };
  }, [exportSvg]);
  return (
    <div className={styles.labInstrument} style={variables}>
      <figure className={styles.composition} data-composition data-form={materialDensity} data-tension={typeTension} data-phase={systemStep}>
        <figcaption>{copy.sheet}<span>0{systemStep + 1} / 06</span></figcaption>
        <FoldStudio className={styles.foldArtwork} form={materialDensity} tension={typeTension} phase={systemStep} tone="ink" label={copy.artworkLabel} interactive onFormChange={(form) => {
          changeComposition({ form, authored: true }); setFeedback("");
          onTrace?.({ source: "lab", channel: "form", action: "material-tune", value: form / 100 });
        }} />
        <div className={styles.pieceTitle} aria-hidden="true">{title}</div>
        <div className={styles.pieceCoordinates} aria-hidden="true"><span>EM / ATELIER</span><span>{materialDensity} · {typeTension} · 0{systemStep + 1}</span></div>
      </figure>
      <div className={styles.composerTools}>
        <nav className={styles.studyNavigation} aria-label={copy.experiments}>
          {copy.studies.map((item, index) => <button type="button" key={item.title} aria-pressed={activeStudy === index} aria-controls={`${controlId}-panel`} onClick={() => setActiveStudy(index)}><span>0{index + 1}</span>{item.title}</button>)}
        </nav>
        <article id={`${controlId}-panel`} className={styles.study} aria-label={study.title}>
          <div className={styles.studyDescription}><h2>{study.title}</h2><p>{study.description}</p></div>
          <div className={styles.studyControl}>
            {activeStudy < 2 ? <>
              <div className={styles.rangeControl}>
                <label htmlFor={controlId}>{study.control}<output htmlFor={controlId}>{value}%</output></label>
                <input id={controlId} type="range" min="0" max="100" value={value} onChange={(event) => {
                  const next = Number(event.currentTarget.value);
                  changeComposition(activeStudy === 0 ? { form: next, authored: true } : { tension: next, authored: true });
                  setFeedback("");
                  onTrace?.({ source: "lab", channel: CHANNELS[activeStudy], action: activeStudy === 0 ? "material-tune" : "type-tune", value: next / 100 });
                }} />
                <div className={styles.controlLegend}><span>{study.low}</span><span>{study.high}</span></div>
              </div>
              {activeStudy === 1 && <div className={styles.nameControl}><label htmlFor={`${controlId}-name`}>{copy.name}</label><input id={`${controlId}-name`} type="text" maxLength={24} value={pieceName} placeholder={copy.word} onChange={(event) => { changeComposition({ name: event.currentTarget.value, authored: true }); setFeedback(""); }} autoComplete="off" spellCheck={false} /></div>}
            </> : <div className={styles.systemControl}>
              <div className={styles.systemProgress} aria-hidden="true">{copy.states.map((state, index) => <span key={state} data-active={index <= systemStep} />)}</div>
              <output aria-live="polite">{copy.states[systemStep]} · {systemStep + 1}/6</output>
              <button type="button" data-sfx="propagate" data-sfx-intensity={((systemStep + 1) % 6) / 5} onClick={() => {
                const next = (systemStep + 1) % 6;
                changeComposition({ phase: next, authored: true }); setFeedback("");
                onTrace?.({ source: "lab", channel: "system", action: "system-route", value: next / 5 });
              }}>{copy.propagate}<span aria-hidden="true">→</span></button>
            </div>}
          </div>
        </article>
        <footer className={styles.composerActions}>
          <a className={styles.exportButton} href={exportHref || undefined} aria-disabled={!exportHref} download={`le-pli-${materialDensity}-${typeTension}-${systemStep + 1}.svg`} onClick={(event) => {
            if (!exportHref) { event.preventDefault(); setFeedback("exportFailed"); return; }
            setFeedback("exported");
          }}>{copy.export}<span aria-hidden="true">↓</span></a>
          <button type="button" className={styles.resetButton} onClick={reset}>{copy.reset}</button>
          <p role="status" aria-live="polite">{feedback ? copy[feedback] : ""}</p>
        </footer>
        </div>
    </div>
  );
}
