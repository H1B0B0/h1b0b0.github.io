"use client";

import type { CSSProperties, Ref } from "react";
import { useId, useState } from "react";

import ProjectLayers from "@/components/ProjectLayers";

import styles from "./work-lab.module.css";

export type WorkLabView = "work" | "lab";
export type WorkLabLanguage = "fr" | "en";
export type CreativeChannel = "form" | "motion" | "system";

export type WorkLabTrace = {
  source: WorkLabView;
  channel: CreativeChannel;
  action:
    | "navigate"
    | "case-chapter"
    | "case-media"
    | "material-tune"
    | "type-tune"
    | "system-route";
  value?: number;
};

export type WorkLabSpaceProps = {
  view: WorkLabView;
  language?: WorkLabLanguage;
  channels?: Partial<Record<CreativeChannel, number>>;
  className?: string;
  headingRef?: Ref<HTMLHeadingElement>;
  onNavigate?: (destination: WorkLabView) => void;
  onTrace?: (trace: WorkLabTrace) => void;
};

type StyleWithVariables = CSSProperties & Record<`--${string}`, string | number>;

const COPY = {
  fr: {
    navigation: "Travaux et recherches",
    workNav: "Travaux",
    labNav: "Laboratoire",
    work: {
      eyebrow: "Travail sélectionné · Commande client",
      title: "Une idée juste, construite jusqu'au réel.",
      intro:
        "BlueVidia est une commande livrée pour un studio audiovisuel. Le projet montre une manière de travailler ; son univers n'est pas celui de tout le portfolio.",
      clientLabel: "Commande client · Projet phare",
      caseIntro:
        "Une vitrine immersive conçue et développée autour des films, des photographies et du regard du studio.",
      role: "Rôle",
      roleValue: "Design & développement",
      stack: "Socle",
      stackValue: "Next.js · Three.js · GLSL",
      status: "Statut",
      statusValue: "En ligne",
      chaptersLabel: "Explorer les trois temps du projet",
      chapters: [
        {
          short: "Enjeu",
          title: "Faire ressentir un studio avant de l'expliquer.",
          text: "Traduire une identité audiovisuelle premium sans produire un énième site d'agence statique.",
        },
        {
          short: "Réponse",
          title: "L'image devient l'interface.",
          text: "Faire du rythme, de la matière visuelle et du geste une partie du récit — jamais un décor gratuit.",
        },
        {
          short: "Résultat",
          title: "Une expérience réellement en ligne.",
          text: "Un site responsive construit autour des contenus du studio, livré et accessible aujourd'hui.",
        },
      ],
      frameHint: "Choisir un chapitre",
      challengeWords: ["Ressentir", "avant", "d’expliquer"],
      challengeSignals: ["Image · matière", "Rythme · navigation", "Geste · récit"],
      deliveryKicker: "Système livré · 200 OK",
      deliveryTitle: "Une présence mise en production.",
      deliverySignals: ["Responsive", "Déployé", "Maintenable"],
      delivered: "Conception et développement : Etienne Mentrel · Contenus client : BlueVidia",
      visit: "Visiter le site livré",
    },
    lab: {
      eyebrow: "Laboratoire · Recherches personnelles",
      title: "La créativité se prouve en la manipulant.",
      intro:
        "Trois études auto-initiées — aucun faux client, aucune métrique inventée. Chaque geste rend visible une capacité différente.",
      researchLabel: "Recherche personnelle",
      gesture: "Geste principal",
      studies: {
        material: {
          title: "Matière",
          description: "Explorer comment une surface numérique peut sembler respirer, résister et changer de densité.",
          control: "Comprimer la matière",
          low: "Diffuse",
          high: "Dense",
        },
        type: {
          title: "Typographie",
          description: "Transformer la voix d'un mot sans sacrifier sa lecture ni sa place dans la composition.",
          control: "Mettre le mot sous tension",
          low: "Calme",
          high: "Radicale",
          word: "CRÉER",
        },
        system: {
          title: "Interaction / système",
          description: "Montrer qu'un geste simple peut produire un état lisible et une conséquence dans tout un système.",
          control: "Faire circuler le signal",
          action: "Propager",
          states: ["Origine", "Forme", "Mouvement", "Règle", "Retour", "Boucle complète"],
        },
      },
    },
  },
  en: {
    navigation: "Work and research",
    workNav: "Work",
    labNav: "Laboratory",
    work: {
      eyebrow: "Selected work · Client commission",
      title: "A strong idea, built all the way to reality.",
      intro:
        "BlueVidia is a delivered commission for an audiovisual studio. The project demonstrates a way of working; its world does not define the entire portfolio.",
      clientLabel: "Client commission · Featured case",
      caseIntro:
        "An immersive showcase designed and developed around the studio's films, photography and point of view.",
      role: "Role",
      roleValue: "Design & development",
      stack: "Core",
      stackValue: "Next.js · Three.js · GLSL",
      status: "Status",
      statusValue: "Live",
      chaptersLabel: "Explore the project's three stages",
      chapters: [
        {
          short: "Challenge",
          title: "Make the studio felt before it is explained.",
          text: "Translate a premium audiovisual identity without building another static agency website.",
        },
        {
          short: "Response",
          title: "The image becomes the interface.",
          text: "Make rhythm, visual matter and gesture part of the narrative — never gratuitous decoration.",
        },
        {
          short: "Outcome",
          title: "An experience that is genuinely live.",
          text: "A responsive website built around the studio's content, delivered and available today.",
        },
      ],
      frameHint: "Choose a chapter",
      challengeWords: ["Feel it", "before", "explaining it"],
      challengeSignals: ["Image · material", "Rhythm · navigation", "Gesture · narrative"],
      deliveryKicker: "Delivered system · 200 OK",
      deliveryTitle: "A presence put into production.",
      deliverySignals: ["Responsive", "Deployed", "Maintainable"],
      delivered: "Design and development: Etienne Mentrel · Client content: BlueVidia",
      visit: "Visit the delivered website",
    },
    lab: {
      eyebrow: "Laboratory · Personal research",
      title: "Creativity is proven through manipulation.",
      intro:
        "Three self-initiated studies — no fake client and no invented metric. Each gesture makes a different capability visible.",
      researchLabel: "Personal research",
      gesture: "Primary gesture",
      studies: {
        material: {
          title: "Material",
          description: "Explore how a digital surface can appear to breathe, resist and change density.",
          control: "Compress the material",
          low: "Diffuse",
          high: "Dense",
        },
        type: {
          title: "Typography",
          description: "Transform a word's voice without sacrificing its readability or place in the composition.",
          control: "Put the word under tension",
          low: "Calm",
          high: "Radical",
          word: "CREATE",
        },
        system: {
          title: "Interaction / system",
          description: "Show how one simple gesture can create a legible state and a consequence across a system.",
          control: "Move the signal through the system",
          action: "Propagate",
          states: ["Origin", "Form", "Motion", "Rule", "Return", "Loop complete"],
        },
      },
    },
  },
} as const;

const CHAPTER_CHANNELS: readonly CreativeChannel[] = ["form", "motion", "system"];

export default function WorkLabSpace({
  view,
  language = "fr",
  channels = {},
  className,
  headingRef,
  onNavigate,
  onTrace,
}: WorkLabSpaceProps) {
  const copy = COPY[language];
  const rootClassName = [styles.shell, styles[view], className].filter(Boolean).join(" ");
  const channelCopy = language === "fr"
    ? { title: "Signal de visite", form: "Forme", motion: "Mouvement", system: "Système" }
    : { title: "Journey signal", form: "Form", motion: "Motion", system: "System" };

  const navigate = (destination: WorkLabView) => {
    onTrace?.({ source: view, channel: "system", action: "navigate" });
    onNavigate?.(destination);
  };

  return (
    <section className={rootClassName} data-space={view} aria-labelledby={`${view}-space-title`}>
      <div className={styles.ambient} aria-hidden="true" />
      <div className={styles.inner}>
        <header className={styles.header}>
          <div className={styles.headingBlock}>
            <p className={styles.eyebrow}>{view === "work" ? copy.work.eyebrow : copy.lab.eyebrow}</p>
            <h1 id={`${view}-space-title`} ref={headingRef} tabIndex={-1}>
              {view === "work" ? copy.work.title : copy.lab.title}
            </h1>
            <p className={styles.intro}>{view === "work" ? copy.work.intro : copy.lab.intro}</p>
          </div>

          <div className={styles.headerTools}>
            {onNavigate ? (
              <nav className={styles.localNavigation} aria-label={copy.navigation}>
                <button
                  type="button"
                  aria-current={view === "work" ? "page" : undefined}
                  onClick={() => navigate("work")}
                >
                  <span>01</span>{copy.workNav}
                </button>
                <button
                  type="button"
                  aria-current={view === "lab" ? "page" : undefined}
                  onClick={() => navigate("lab")}
                >
                  <span>02</span>{copy.labNav}
                </button>
              </nav>
            ) : null}

            <aside className={styles.signalLedger} aria-labelledby={`${view}-signal-title`}>
              <p id={`${view}-signal-title`}>{channelCopy.title}</p>
              {CHAPTER_CHANNELS.map((channel) => {
                const value = Math.max(0, Math.min(1, channels[channel] ?? 0));
                return (
                  <div key={channel}>
                    <span>{channelCopy[channel]}</span>
                    <i aria-hidden="true"><b style={{ transform: `scaleX(${value})` }} /></i>
                    <output>{Math.round(value * 100).toString().padStart(2, "0")}</output>
                  </div>
                );
              })}
            </aside>
          </div>
        </header>

        {view === "work" ? (
          <BlueVidiaCase language={language} onTrace={onTrace} />
        ) : (
          <CreativeLab language={language} onTrace={onTrace} />
        )}
      </div>
    </section>
  );
}

function BlueVidiaCase({
  language,
  onTrace,
}: {
  language: WorkLabLanguage;
  onTrace?: WorkLabSpaceProps["onTrace"];
}) {
  const copy = COPY[language].work;
  const [activeChapter, setActiveChapter] = useState(0);
  const chapter = copy.chapters[activeChapter];

  const selectChapter = (index: number) => {
    setActiveChapter(index);
    onTrace?.({
      source: "work",
      channel: CHAPTER_CHANNELS[index],
      action: "case-chapter",
      value: index / Math.max(1, copy.chapters.length - 1),
    });
  };

  return (
    <article className={styles.caseStudy} aria-labelledby="bluevidia-case-title">
      <header className={styles.caseHeader}>
        <div>
          <p className={styles.caseKind}>{copy.clientLabel}</p>
          <h2 id="bluevidia-case-title">BlueVidia</h2>
          <p className={styles.caseIntro}>{copy.caseIntro}</p>
        </div>
        <dl className={styles.facts}>
          <div><dt>{copy.role}</dt><dd>{copy.roleValue}</dd></div>
          <div><dt>{copy.stack}</dt><dd>{copy.stackValue}</dd></div>
          <div><dt>{copy.status}</dt><dd><i aria-hidden="true" />{copy.statusValue}</dd></div>
        </dl>
      </header>

      <div className={styles.caseBody}>
        <div className={styles.story} aria-live="polite">
          <p className={styles.storyIndex}>0{activeChapter + 1} / 03 · {chapter.short}</p>
          <h3>{chapter.title}</h3>
          <p>{chapter.text}</p>

          <div className={styles.chapterNavigation} aria-label={copy.chaptersLabel}>
            {copy.chapters.map((item, index) => (
              <button
                key={item.short}
                type="button"
                aria-pressed={activeChapter === index}
                onClick={() => selectChapter(index)}
              >
                <span>0{index + 1}</span>
                <span>{item.short}</span>
              </button>
            ))}
          </div>
        </div>

        <div className={styles.cinemaFrame} data-chapter={activeChapter} data-case-frame>
          <span className={styles.perforationsLeft} aria-hidden="true" />
          <span className={styles.perforationsRight} aria-hidden="true" />
          <div className={styles.mediaViewport} data-case-viewport>
            {activeChapter === 0 ? (
              <div className={styles.challengeFrame} aria-hidden="true">
                <div className={styles.challengeTopline}>
                  <span>BV / 01—03</span>
                  <span>DESIGN INTENT</span>
                </div>
                <div className={styles.challengeStatement}>
                  {copy.challengeWords.map((word, index) => (
                    <span key={word} data-accent={index === 1 ? "true" : "false"}>{word}</span>
                  ))}
                </div>
                <div className={styles.challengeSignals}>
                  {copy.challengeSignals.map((signal, index) => (
                    <span key={signal}><i>0{index + 1}</i>{signal}</span>
                  ))}
                </div>
              </div>
            ) : activeChapter === 1 ? (
              <div className={styles.directionStudy}>
                <ProjectLayers french={language === "fr"} />
              </div>
            ) : (
              <div className={styles.deliveryFrame} aria-hidden="true">
                <div className={styles.deliveryGrid} />
                <div className={styles.deliveryChrome}>
                  <span>BLUEVIDIA.COM</span>
                  <span>LIVE / 2026</span>
                </div>
                <div className={styles.deliveryCopy}>
                  <span><i />{copy.deliveryKicker}</span>
                  <strong>{copy.deliveryTitle}</strong>
                </div>
                <div className={styles.deliverySignals}>
                  {copy.deliverySignals.map((signal, index) => (
                    <span key={signal}><i>0{index + 1}</i>{signal}</span>
                  ))}
                </div>
              </div>
            )}
          </div>

          <div className={styles.frameStrip} aria-label={copy.frameHint}>
            {copy.chapters.map((item, index) => (
              <button
                key={item.short}
                type="button"
                aria-label={`${copy.frameHint} 0${index + 1} — ${item.short}`}
                aria-pressed={activeChapter === index}
                onClick={() => selectChapter(index)}
              >
                <span>0{index + 1}</span>
                <strong>{item.short}</strong>
                <i aria-hidden="true" />
              </button>
            ))}
          </div>
        </div>
      </div>

      <footer className={styles.caseFooter}>
        <p>{copy.delivered}</p>
        <a
          href="https://bluevidia.com"
          target="_blank"
          rel="noopener noreferrer"
          onClick={() => onTrace?.({ source: "work", channel: "system", action: "case-media", value: 1 })}
        >
          {copy.visit}<span aria-hidden="true">↗</span>
        </a>
      </footer>
    </article>
  );
}

function CreativeLab({
  language,
  onTrace,
}: {
  language: WorkLabLanguage;
  onTrace?: WorkLabSpaceProps["onTrace"];
}) {
  const copy = COPY[language].lab;
  const materialId = useId();
  const typeId = useId();
  const [materialDensity, setMaterialDensity] = useState(46);
  const [typeTension, setTypeTension] = useState(38);
  const [systemStep, setSystemStep] = useState(0);

  const materialStyle: StyleWithVariables = {
    "--density": materialDensity / 100,
    "--material-scale": 0.72 + materialDensity / 185,
    "--material-echo-scale": 0.9 + materialDensity / 185,
    "--material-rotate": `${materialDensity * 0.38}deg`,
    "--material-echo-rotate": `${materialDensity * -0.24}deg`,
    "--material-radius": `${58 - materialDensity * 0.26}%`,
    "--material-shadow-alpha": 0.14 + (materialDensity / 100) * 0.28,
    "--material-saturation": 0.74 + (materialDensity / 100) * 0.7,
    "--material-echo-opacity": 0.18 + (materialDensity / 100) * 0.36,
    "--material-blur": `${1.5 - (materialDensity / 100)}rem`,
  };
  const typeScale = 0.78 + typeTension / 170;
  const typeSlant = (typeTension - 50) * -0.13;
  const typeStyle: StyleWithVariables = {
    "--type-space": `${-0.08 + typeTension * 0.00135}em`,
    "--type-scale": typeScale,
    "--type-outline-scale": typeScale * 0.97,
    "--type-slant": `${typeSlant}deg`,
    "--type-outline-slant": `${typeSlant * -0.7}deg`,
    "--type-weight": 410 + typeTension * 3.8,
    "--type-line-width": `${12 + typeScale * 12}%`,
  };

  const routeSignal = () => {
    const next = (systemStep + 1) % copy.studies.system.states.length;
    setSystemStep(next);
    onTrace?.({
      source: "lab",
      channel: "system",
      action: "system-route",
      value: next / Math.max(1, copy.studies.system.states.length - 1),
    });
  };

  return (
    <div className={styles.labGrid}>
      <article className={`${styles.study} ${styles.materialStudy}`}>
        <StudyHeader index="01" label={copy.researchLabel} title={copy.studies.material.title} />
        <p className={styles.studyDescription}>{copy.studies.material.description}</p>
        <div className={styles.materialStage} style={materialStyle} aria-hidden="true">
          <span className={styles.materialMass} />
          <span className={styles.materialEcho} />
          <span className={styles.materialCore} />
        </div>
        <div className={styles.studyControl}>
          <label htmlFor={materialId}>
            <span>{copy.gesture} · {copy.studies.material.control}</span>
            <output htmlFor={materialId}>{materialDensity}%</output>
          </label>
          <input
            id={materialId}
            type="range"
            min="0"
            max="100"
            value={materialDensity}
            onChange={(event) => {
              const value = Number(event.currentTarget.value);
              setMaterialDensity(value);
              onTrace?.({ source: "lab", channel: "form", action: "material-tune", value: value / 100 });
            }}
          />
          <div className={styles.controlLegend}><span>{copy.studies.material.low}</span><span>{copy.studies.material.high}</span></div>
        </div>
      </article>

      <article className={`${styles.study} ${styles.typeStudy}`}>
        <StudyHeader index="02" label={copy.researchLabel} title={copy.studies.type.title} />
        <p className={styles.studyDescription}>{copy.studies.type.description}</p>
        <div className={styles.typeStage} style={typeStyle} aria-hidden="true">
          <span data-outline="true">{copy.studies.type.word}</span>
          <span>{copy.studies.type.word}</span>
          <i />
        </div>
        <div className={styles.studyControl}>
          <label htmlFor={typeId}>
            <span>{copy.gesture} · {copy.studies.type.control}</span>
            <output htmlFor={typeId}>{typeTension}%</output>
          </label>
          <input
            id={typeId}
            type="range"
            min="0"
            max="100"
            value={typeTension}
            onChange={(event) => {
              const value = Number(event.currentTarget.value);
              setTypeTension(value);
              onTrace?.({ source: "lab", channel: "motion", action: "type-tune", value: value / 100 });
            }}
          />
          <div className={styles.controlLegend}><span>{copy.studies.type.low}</span><span>{copy.studies.type.high}</span></div>
        </div>
      </article>

      <article className={`${styles.study} ${styles.systemStudy}`}>
        <StudyHeader index="03" label={copy.researchLabel} title={copy.studies.system.title} />
        <p className={styles.studyDescription}>{copy.studies.system.description}</p>
        <div className={styles.systemStage} data-step={systemStep} aria-hidden="true">
          <div className={styles.systemNodes}>
            <div className={styles.systemPath}>
              {Array.from({ length: 5 }, (_, index) => (
                <i key={index} data-active={index < systemStep} />
              ))}
            </div>
            {copy.studies.system.states.map((state, index) => (
              <span key={state} data-active={index <= systemStep}>
                <b>0{index + 1}</b>
                <small>{state}</small>
              </span>
            ))}
          </div>
        </div>
        <div className={`${styles.studyControl} ${styles.systemControl}`}>
          <div>
            <span>{copy.gesture} · {copy.studies.system.control}</span>
            <output aria-live="polite">{copy.studies.system.states[systemStep]}</output>
          </div>
          <button
            type="button"
            data-sfx="propagate"
            data-sfx-intensity={((systemStep + 1) % copy.studies.system.states.length) / Math.max(1, copy.studies.system.states.length - 1)}
            onClick={routeSignal}
          >
            {copy.studies.system.action}<span aria-hidden="true">→</span>
          </button>
        </div>
      </article>
    </div>
  );
}

function StudyHeader({ index, label, title }: { index: string; label: string; title: string }) {
  return (
    <header className={styles.studyHeader}>
      <div><span>{index}</span><span>{label}</span></div>
      <h2>{title}</h2>
    </header>
  );
}
