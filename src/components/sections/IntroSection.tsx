"use client";
import { motion } from "framer-motion";
import { useEffect, useState } from "react";
import { useLanguage } from "@/i18n/LanguageContext";

const IntroSection = () => {
  const [mounted, setMounted] = useState(false);
  const { t } = useLanguage();

  useEffect(() => {
    setMounted(true);
  }, []);

  // Only render animations on the client side
  if (!mounted) {
    return <div className="w-full h-full flex items-center justify-center" />;
  }

  return (
    <div className="relative w-full flex flex-col items-center justify-center text-center pb-12 md:pb-0 z-10 min-h-screen">
      {/* Background Decorations - Space Travel Warp Lines */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        <div className="absolute top-1/4 left-1/4 w-[500px] h-[500px] bg-violet-600/5 rounded-full blur-[140px] animate-pulse" />
        <div className="absolute bottom-1/4 right-1/4 w-[500px] h-[500px] bg-cyan-600/5 rounded-full blur-[140px] animate-pulse" style={{ animationDelay: '2s' }} />
      </div>

      {/* Technical HUD elements */}
      <div className="absolute inset-0 pointer-events-none opacity-20">
        <div className="absolute top-10 left-10 w-32 h-32 border-l border-t border-white/20" />
        <div className="absolute top-10 right-10 w-32 h-32 border-r border-t border-white/20" />
        <div className="absolute bottom-10 left-10 w-32 h-32 border-l border-b border-white/20" />
        <div className="absolute bottom-10 right-10 w-32 h-32 border-r border-b border-white/20" />
      </div>

      {/* Main content */}
      <div className="z-20 relative px-4 mt-12 md:mt-0">
        <motion.div
          initial={{ opacity: 0, scale: 0.8 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ duration: 1.2, ease: [0.22, 1, 0.36, 1] }}
          className="mb-8 inline-block"
        >
          <div className="px-6 py-2 rounded-full border border-white/10 bg-white/5 backdrop-blur-xl text-[10px] font-black tracking-[0.3em] text-violet-400 uppercase shadow-2xl">
            {t.intro.hello}
          </div>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 40 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 1, delay: 0.2, ease: [0.22, 1, 0.36, 1] }}
        >
          <h1 className="text-6xl md:text-8xl lg:text-9xl font-black mb-8 tracking-tighter leading-[0.85] text-white">
            ETIENNE <br />
            <span className="text-gradient-premium">MENTREL</span>
          </h1>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8, delay: 0.4 }}
        >
          <h2 className="text-xl md:text-4xl font-light mb-12 text-white/50 tracking-tightest uppercase">
            <TypewriterEffect
              phrases={t.intro.titles}
              typingSpeed={80}
              deletingSpeed={50}
              delayBetweenPhrases={2500}
            />
          </h2>
        </motion.div>

        <motion.p
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8, delay: 0.6 }}
          className="max-w-2xl text-base md:text-xl text-gray-400 mb-16 mx-auto leading-relaxed font-medium"
        >
          {t.intro.description}
        </motion.p>

        <motion.div
          initial={{ opacity: 0, scale: 0.9 }}
          whileInView={{ opacity: 1, scale: 1 }}
          transition={{ duration: 0.8, delay: 0.8 }}
          className="flex flex-wrap justify-center gap-8"
        >
          <button
            className="cosmic-button group px-12 py-5"
            onClick={() => {
              const projectsSection = document.getElementById("projects");
              if (projectsSection) {
                projectsSection.scrollIntoView({ behavior: "smooth" });
              }
            }}
          >
            <span className="flex items-center gap-3 font-black tracking-widest uppercase text-xs">
              {t.intro.viewProjects}
              <motion.svg
                animate={{ x: [0, 5, 0] }}
                transition={{ repeat: Infinity, duration: 1.5 }}
                className="w-5 h-5"
                fill="currentColor"
                viewBox="0 0 16 16"
              >
                <path fillRule="evenodd" d="M4.646 1.646a.5.5 0 0 1 .708 0l6 6a.5.5 0 0 1 0 .708l-6 6a.5.5 0 0 1-.708-.708L10.293 8 4.646 2.354a.5.5 0 0 1 0-.708z" />
              </motion.svg>
            </span>
          </button>

          <a
            href="#contact"
            className="px-12 py-5 rounded-full border border-white/10 bg-white/5 backdrop-blur-md hover:border-white/40 transition-all duration-500 text-xs font-black tracking-widest uppercase text-white/70 hover:text-white"
            onClick={(e) => {
              e.preventDefault();
              const contactSection = document.getElementById("contact");
              if (contactSection) {
                contactSection.scrollIntoView({ behavior: "smooth" });
              }
            }}
          >
            {t.intro.getInTouch}
          </a>
        </motion.div>
      </div>

      {/* Decorative technical lines */}
      <div className="absolute bottom-12 left-12 hidden lg:block opacity-30">
        <div className="text-[11px] font-mono space-y-2 text-violet-400/60">
          <p className="flex items-center gap-2 animate-pulse"><span className="w-2 h-2 rounded-full bg-violet-500" /> SYSTEM.ONLINE</p>
          <p>0x00A4F - 2938.Q - 01</p>
          <p>WARP_DRIVE: ACTIVE</p>
        </div>
      </div>
      
      <div className="absolute bottom-12 right-12 hidden lg:block opacity-30 text-right">
        <div className="text-[11px] font-mono space-y-2 text-cyan-400/60">
          <p>LAT: 48.8566</p>
          <p>LON: 2.3522</p>
          <p>PARIS, FR</p>
        </div>
      </div>
    </div>
  );
};

interface TypewriterEffectProps {
  phrases: string[];
  typingSpeed?: number;
  deletingSpeed?: number;
  delayBetweenPhrases?: number;
}

// Simple typewriter effect component
const TypewriterEffect = ({
  phrases,
  typingSpeed = 150,
  deletingSpeed = 100,
  delayBetweenPhrases = 2000,
}: TypewriterEffectProps) => {
  const [displayText, setDisplayText] = useState("");
  const [currentPhrase, setCurrentPhrase] = useState(0);
  const [isDeleting, setIsDeleting] = useState(false);
  const [isWaiting, setIsWaiting] = useState(false);

  useEffect(() => {
    let timer: NodeJS.Timeout;

    if (isWaiting) {
      timer = setTimeout(() => {
        setIsWaiting(false);
        setIsDeleting(true);
      }, delayBetweenPhrases);
      return () => clearTimeout(timer);
    }

    const currentText = phrases[currentPhrase];

    if (isDeleting) {
      if (displayText === "") {
        setIsDeleting(false);
        setCurrentPhrase((prev) => (prev + 1) % phrases.length);
      } else {
        timer = setTimeout(() => {
          setDisplayText(currentText.substring(0, displayText.length - 1));
        }, deletingSpeed);
      }
    } else {
      if (displayText === currentText) {
        setIsWaiting(true);
      } else {
        timer = setTimeout(() => {
          setDisplayText(currentText.substring(0, displayText.length + 1));
        }, typingSpeed);
      }
    }

    return () => clearTimeout(timer);
  }, [
    displayText,
    currentPhrase,
    isDeleting,
    isWaiting,
    phrases,
    typingSpeed,
    deletingSpeed,
    delayBetweenPhrases,
  ]);

  return (
    <>
      {displayText}
      <span className="animate-blink">|</span>
    </>
  );
};

export default IntroSection;
