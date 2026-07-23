"use client";

import { useLanguage } from "@/i18n/LanguageContext";
import OrbitalSkills from "@/components/OrbitalSkills";
import { motion } from "framer-motion";
import React, { useRef, useState } from "react";

const ENGLISH_RESUME_URL = "https://cvdesignr.com/p/67c9a21b5458a?hl=fr_FR";
const FRENCH_RESUME_URL = "https://cvdesignr.com/p/647b251d89bf4?hl=fr_FR";

// --- AWWWARDS-STYLE COMPONENTS ---

// 1. Magnetic Element (Pulls towards cursor)
function Magnetic({ children, className }: { children: React.ReactNode, className?: string }) {
  const ref = useRef<HTMLDivElement>(null);
  const [position, setPosition] = useState({ x: 0, y: 0 });

  const handleMouse = (e: React.MouseEvent<HTMLDivElement>) => {
    if (!ref.current) return;
    const { clientX, clientY } = e;
    const { height, width, left, top } = ref.current.getBoundingClientRect();
    const middleX = clientX - (left + width / 2);
    const middleY = clientY - (top + height / 2);
    setPosition({ x: middleX * 0.2, y: middleY * 0.2 });
  };

  const reset = () => setPosition({ x: 0, y: 0 });

  return (
    <motion.div
      ref={ref}
      onMouseMove={handleMouse}
      onMouseLeave={reset}
      animate={{ x: position.x, y: position.y }}
      transition={{ type: "spring", stiffness: 150, damping: 15, mass: 0.1 }}
      className={className}
    >
      {children}
    </motion.div>
  );
}

// 2. Masked Text Reveal
function MaskedText({ text, className, delay = 0, clip = true }: { text: React.ReactNode, className?: string, delay?: number, clip?: boolean }) {
  return (
    <div className={`${clip ? "overflow-hidden" : "overflow-visible"} leading-[1.05]`}>
      <motion.div
        variants={{
          hidden: { y: "120%", rotateZ: 3, opacity: 0 },
          visible: { 
            y: 0, 
            rotateZ: 0, 
            opacity: 1,
            transition: { duration: 1.2, ease: [0.16, 1, 0.3, 1], delay } 
          }
        }}
        className={className}
      >
        {text}
      </motion.div>
    </div>
  );
}

function ProjectRow({ index, project }: { index: number, project: { title: string; description: string; link: string } }) {
  return (
    <a 
      href={project.link}
      target="_blank"
      rel="noopener noreferrer"
      className="project-row group relative block w-full border-b border-white/10 py-10 md:py-16 cursor-none"
    >
      <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/[0.02] to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-700 pointer-events-none" />
      
      <div className="relative z-10 flex flex-col md:flex-row md:items-center justify-between gap-6 md:gap-12">
        <div className="flex items-baseline gap-6 md:gap-12">
          <span className="cinematic-mono text-white/20 text-xs md:text-sm font-light mb-1 md:mb-2">
            [{String(index).padStart(2, '0')}]
          </span>
          <h4 className="text-4xl sm:text-5xl md:text-7xl font-light tracking-tighter text-white/50 group-hover:text-white transition-all duration-700 ease-[0.16,1,0.3,1] origin-left group-hover:scale-105">
            {project.title}
          </h4>
        </div>

        <div className="md:w-1/3 md:absolute md:right-0 md:top-1/2 md:-translate-y-1/2 overflow-hidden pointer-events-none">
          <p className="text-white/40 text-xs leading-relaxed cinematic-mono md:opacity-0 md:translate-y-8 group-hover:opacity-100 group-hover:translate-y-0 transition-all duration-700 ease-[0.16,1,0.3,1] md:pl-12 border-l border-white/10">
            {project.description}
          </p>
        </div>
      </div>
    </a>
  );
}

// --- MAIN COMPONENT ---

export default function ContentLayers() {
  const { currentLanguage, t } = useLanguage();
  const resumeUrl = currentLanguage === "fr" ? FRENCH_RESUME_URL : ENGLISH_RESUME_URL;

  const sectionVariants = {
    hidden: { opacity: 0 },
    visible: { 
      opacity: 1, 
      transition: { staggerChildren: 0.1, delayChildren: 0.1 }
    }
  };
  const projectItemVariants = {
    hidden: { opacity: 0, y: 24, filter: "blur(6px)" },
    visible: {
      opacity: 1,
      y: 0,
      filter: "blur(0px)",
      transition: { duration: 0.8, ease: [0.16, 1, 0.3, 1] as const }
    }
  };

  return (
    <main className="relative min-h-[700dvh] w-full">
      
      {/* --- ACT 1: GENESIS (INTRO) --- */}
      <section id="act-1" className="relative z-10 h-[200dvh] w-full px-4">
        <div className="sticky top-0 flex h-dvh w-full flex-col items-center justify-center">
          <motion.div
            className="relative flex flex-col items-center overflow-visible rounded-3xl border border-white/10 bg-black/20 px-6 py-10 text-center backdrop-blur-[2px] md:px-12 md:py-14"
          initial="hidden"
          whileInView="visible"
          viewport={{ once: false, margin: "-10% 0px" }}
          variants={sectionVariants}
        >
          <motion.div variants={{ hidden: { opacity: 0, scale: 0.9 }, visible: { opacity: 1, scale: 1, transition: { duration: 1.5, ease: [0.16, 1, 0.3, 1] } } }} className="mb-8">
            <span className="cinematic-mono text-white/40 tracking-[0.4em] text-[10px] uppercase border border-white/10 rounded-full px-4 py-1.5 backdrop-blur-md">
              {t.intro.hello}
            </span>
          </motion.div>
          
          <h1 className="relative z-20 mb-8 flex flex-col items-center text-[11vw] leading-[0.92] tracking-tighter text-white drop-shadow-[0_10px_40px_rgba(0,0,0,0.6)] md:text-[7vw]">
            <MaskedText text="ETIENNE" className="font-medium" delay={0.1} />
            <MaskedText text="MENTREL" className="font-display px-[0.12em] pb-[0.08em] italic text-white/70" delay={0.2} clip={false} />
          </h1>
          
          <motion.div
            variants={{ hidden: { scaleX: 0, opacity: 0 }, visible: { scaleX: 1, opacity: 1, transition: { duration: 1.5, ease: [0.16, 1, 0.3, 1], delay: 0.4 } } }} 
            className="h-px w-32 bg-white/20 mb-10 origin-center" 
          />
          
          <MaskedText 
            delay={0.5}
            text={
              <p className="max-w-md text-white/50 text-sm font-light leading-relaxed text-balance relative z-20">
                {t.intro.description}
              </p>
            } 
          />
          </motion.div>
        </div>
      </section>

      {/* --- ACT 2: CONSTELLATIONS (ABOUT & SKILLS) --- */}
      <section id="act-2" className="relative z-10 h-[200dvh] w-full px-6 md:px-12">
        <div className="sticky top-0 flex h-dvh w-full items-center justify-center">
          <motion.div
            className="flex w-full max-w-[90vw] flex-col justify-between gap-8 md:flex-row md:gap-0 2xl:max-w-7xl"
          initial="hidden"
          whileInView="visible"
          viewport={{ once: false, margin: "-20% 0px" }}
          variants={sectionVariants}
        >
          {/* About Column (Left) */}
          <div className="w-full md:w-[35%] max-w-md flex flex-col justify-center">
            <MaskedText delay={0.1} text={
              <h2 className="cinematic-mono mb-4 flex items-center gap-4 text-[10px] uppercase tracking-[0.3em] text-white/30 md:mb-6">
                <span className="w-8 h-px bg-white/20" />
                {t.about.title}
              </h2>
            } />
            
            <MaskedText delay={0.2} text={
              <h3 className="mb-4 text-3xl font-light leading-tight tracking-tight text-white md:mb-8 md:text-5xl">
                {t.about.background}
              </h3>
            } />
            
            <motion.div 
              variants={{ hidden: { opacity: 0, y: 20 }, visible: { opacity: 1, y: 0, transition: { duration: 1, delay: 0.3 } } }}
              className="space-y-3 text-[11px] font-light leading-relaxed text-white/50 md:space-y-6 md:text-sm"
            >
              <p>{t.about.paragraph1}</p>
              <p>{t.about.paragraph2}</p>
              <p>{t.about.paragraph3}</p>
            </motion.div>

            <motion.div
              variants={{ hidden: { opacity: 0, y: 20 }, visible: { opacity: 1, y: 0, transition: { duration: 1, delay: 0.5 } } }}
              className="mt-6 md:mt-12"
            >
              <Magnetic className="w-fit">
                <a 
                  href="https://github.com/H1B0B0" 
                  target="_blank" 
                  rel="noopener noreferrer"
                  className="group relative inline-flex items-center justify-center overflow-hidden rounded-full border border-white/10 bg-white/[0.03] px-6 py-3 text-[9px] tracking-[0.2em] text-white backdrop-blur-md transition-all duration-500 hover:border-white/30 hover:bg-white/[0.08] md:px-8 md:py-4 md:text-[10px]"
                >
                  <span className="relative z-10 flex items-center gap-3">
                    {t.about.githubProfile}
                    <svg className="w-3 h-3 transform group-hover:translate-x-1 group-hover:-translate-y-1 transition-transform" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M14 5l7 7m0 0l-7 7m7-7H3" /></svg>
                  </span>
                  <div className="absolute inset-0 bg-gradient-to-r from-violet-500/10 to-cyan-500/10 opacity-0 group-hover:opacity-100 transition-opacity duration-500" />
                </a>
              </Magnetic>
            </motion.div>
          </div>

          {/* Skills Column (Right) */}
          <div className="w-full md:w-[45%] flex flex-col justify-center md:items-end text-left md:text-right">
            <MaskedText delay={0.2} text={
              <h2 className="cinematic-mono mb-4 flex items-center gap-4 text-[10px] uppercase tracking-[0.3em] text-white/30 md:mb-12 md:flex-row-reverse">
                <span className="w-8 h-px bg-white/20" />
                {t.skills.title}
              </h2>
            } />
            <div className="w-full flex justify-center">
              <OrbitalSkills />
            </div>
          </div>
          </motion.div>
        </div>
      </section>

      {/* --- ACT 3: SIGNAL (PROJECTS & CONTACT) --- */}
      <section id="act-3" className="relative z-10 flex min-h-[300dvh] w-full flex-col items-center justify-center px-4 py-24 md:py-32">
        <motion.div 
          className="w-full max-w-7xl flex flex-col items-center"
          initial="hidden"
          whileInView="visible"
          viewport={{ once: false, margin: "-10% 0px" }}
          variants={sectionVariants}
        >
          <MaskedText delay={0.1} text={
            <h2 className="cinematic-mono text-white/30 tracking-[0.3em] text-[10px] mb-16 uppercase">
              {"// "} {t.projects.title}
            </h2>
          } />
          
          <motion.div variants={sectionVariants} className="flex flex-col w-full max-w-6xl mb-32 border-t border-white/10">
            {Object.entries(t.projects.projectsList).map(([key, project], index) => (
              <motion.div key={key} variants={projectItemVariants}>
                <ProjectRow index={index + 1} project={project} />
              </motion.div>
            ))}
          </motion.div>

          <motion.div 
            variants={{ hidden: { height: 0, opacity: 0 }, visible: { height: "64px", opacity: 1, transition: { duration: 1 } } }} 
            className="w-px bg-gradient-to-b from-transparent via-white/30 to-transparent mb-16" 
          />

          <MaskedText delay={0.3} text={
            <h3 className="text-5xl md:text-7xl font-light tracking-tighter text-white mb-8">
              {t.contact.title}
            </h3>
          } />
          
          <MaskedText delay={0.4} text={
            <p className="text-white/40 font-light text-sm md:text-base max-w-md mb-12 text-balance mx-auto text-center">
              {t.contact.description}
            </p>
          } />

          <motion.div
            variants={{ hidden: { opacity: 0, scale: 0.9 }, visible: { opacity: 1, scale: 1, transition: { duration: 1, delay: 0.5, ease: [0.16, 1, 0.3, 1] } } }}
            className="flex flex-col items-center justify-center gap-3 sm:flex-row"
          >
            <Magnetic>
              <a 
                href={`mailto:etienne.mentrel@gmail.com`}
                className="relative overflow-hidden inline-flex items-center justify-center rounded-full bg-white text-black px-12 py-5 text-xs font-bold tracking-[0.2em] uppercase hover:scale-105 transition-all duration-500 group shadow-[0_0_40px_rgba(255,255,255,0.1)] hover:shadow-[0_0_60px_rgba(255,255,255,0.3)]"
              >
                <span className="relative z-10 flex items-center gap-3">
                  {t.contact.sendEmail}
                  <svg className="w-4 h-4 transform group-hover:translate-x-1 group-hover:-translate-y-1 transition-transform" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M14 5l7 7m0 0l-7 7m7-7H3" /></svg>
                </span>
                <div className="absolute inset-0 bg-gradient-to-r from-violet-200 to-cyan-200 opacity-0 group-hover:opacity-100 transition-opacity duration-500" />
              </a>
            </Magnetic>
            <Magnetic>
              <a
                data-resume-link
                href={resumeUrl}
                target="_blank"
                rel="noopener noreferrer"
                className="group relative inline-flex items-center justify-center overflow-hidden rounded-full border border-white/15 bg-white/[0.03] px-12 py-5 text-xs font-bold uppercase tracking-[0.2em] text-white transition-all duration-500 hover:scale-105 hover:border-white/35 hover:bg-white/[0.08]"
              >
                <span className="relative z-10 flex items-center gap-3">
                  {t.about.downloadResume}
                  <svg className="h-4 w-4 transform transition-transform group-hover:translate-x-1 group-hover:-translate-y-1" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M14 5l7 7m0 0l-7 7m7-7H3" /></svg>
                </span>
              </a>
            </Magnetic>
          </motion.div>
        </motion.div>
      </section>

    </main>
  );
}
