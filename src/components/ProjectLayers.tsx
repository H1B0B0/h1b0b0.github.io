"use client";

import { motion, useReducedMotion } from "framer-motion";
import { useState } from "react";

/** A compact, interactive art-direction study — deliberately not a fake site screenshot. */
export default function ProjectLayers({ french }: { french: boolean }) {
  const [separation, setSeparation] = useState(58);
  const reducedMotion = useReducedMotion();
  const amount = separation / 100;

  return (
    <div className="project-layers">
      <div className="layers-heading">
        <span>{french ? "Anatomie d'un geste" : "Anatomy of a gesture"}</span>
        <span>02 / Direction</span>
      </div>
      <div className="blueprint-shell" aria-hidden="true">
        <div className="blueprint-grid" />
        <motion.div
          className="blueprint-material"
          animate={{ clipPath: `inset(0 ${Math.max(4, 100 - separation)}% 0 0 round 18px)` }}
          transition={{ duration: reducedMotion ? 0 : 0.45, ease: [0.16, 1, 0.3, 1] }}
        />
        <span className="blueprint-index">BV / 01—03</span>
        <span className="blueprint-note blueprint-note-a">01 · {french ? "Matière" : "Material"}</span>
        <span className="blueprint-note blueprint-note-b">02 · {french ? "Cadrage" : "Framing"}</span>
        <span className="blueprint-note blueprint-note-c">03 · {french ? "Geste" : "Gesture"}</span>
        <div className="blueprint-wordmark">Blue<span>Vidia.</span></div>
        <motion.div
          className="blueprint-lens"
          animate={{ left: `${18 + amount * 64}%`, scale: 0.82 + amount * 0.3 }}
          transition={{ duration: reducedMotion ? 0 : 0.45, ease: [0.16, 1, 0.3, 1] }}
        ><i /></motion.div>
        <span className="blueprint-invitation">{french ? "Entrer dans l'image" : "Enter the image"} ↗</span>
      </div>
      <div className="layers-control">
        <label htmlFor="layer-separation">
          <span>{french ? "Faire varier le point de vue" : "Shift the point of view"}</span>
          <output htmlFor="layer-separation">{String(separation).padStart(2, "0")}</output>
        </label>
        <div className="blueprint-range">
          <motion.span animate={{ width: `${separation}%` }} transition={{ duration: reducedMotion ? 0 : 0.2 }} />
          <motion.i animate={{ left: `${separation}%` }} transition={{ duration: reducedMotion ? 0 : 0.2 }} />
          <input id="layer-separation" type="range" min="0" max="100" value={separation}
            onChange={(event) => setSeparation(Number(event.target.value))}
            aria-valuetext={french ? `${separation} pour cent de matière révélée` : `${separation} percent of material revealed`} />
        </div>
        <div className="blueprint-legend"><span>{french ? "Structure" : "Structure"}</span><span>{french ? "Matière + geste" : "Material + gesture"}</span></div>
        <p>{french
          ? "Le site ne décore pas les images : il change de matière avec elles et répond au mouvement du visiteur."
          : "The website does not decorate the images: it shifts with them and responds to the visitor's movement."}</p>
      </div>
    </div>
  );
}
