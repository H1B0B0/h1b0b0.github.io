"use client";
import { motion } from "framer-motion";
import { useEffect, useState } from "react";

const IntroSection = () => {
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  // Only render animations on the client side
  if (!mounted) {
    return <div className="w-full h-full flex items-center justify-center" />;
  }

  return (
    <div className="relative w-full flex flex-col items-center justify-center text-center pb-12 md:pb-0 z-10">
      {/* Animated cosmic elements - avec z-index contrôlé */}
      <motion.div
        className="absolute w-40 h-40 rounded-full bg-gradient-to-br from-purple-700/30 to-transparent blur-2xl z-0"
        animate={{
          x: [0, 20, 0],
          opacity: [0.4, 0.6, 0.4],
        }}
        transition={{
          duration: 10,
          repeat: Infinity,
          ease: "easeInOut",
        }}
        style={{ top: "10%", left: "15%" }}
      />

      <motion.div
        className="absolute w-52 h-52 rounded-full bg-gradient-to-bl from-blue-500/20 to-transparent blur-3xl z-0"
        animate={{
          x: [0, -30, 0],
          opacity: [0.3, 0.5, 0.3],
        }}
        transition={{
          duration: 13,
          repeat: Infinity,
          ease: "easeInOut",
        }}
        style={{ bottom: "20%", right: "10%" }}
      />

      {/* Main content with staggered animations - z-index plus élevé */}
      <div className="z-20 relative">
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8 }}
          className="relative z-20"
        >
          <h1 className="text-3xl md:text-5xl lg:text-6xl font-bold mb-3">
            <span className="text-transparent bg-clip-text bg-gradient-to-r from-blue-400 to-purple-500">
              Hello, I&apos;m Etienne Mentrel
            </span>
          </h1>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8, delay: 0.2 }}
        >
          <h2 className="text-2xl md:text-4xl font-medium mb-6 md:mb-8 text-white/80">
            <TypewriterEffect
              phrases={[
                "DevOps Engineer",
                "Software Developer",
                "Tech Enthusiast",
                "Passionate Learner",
              ]}
              typingSpeed={100}
              deletingSpeed={80}
              delayBetweenPhrases={2000}
            />
          </h2>
        </motion.div>

        <motion.p
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8, delay: 0.4 }}
          className="max-w-2xl text-lg md:text-xl text-gray-300 mb-10 mx-auto"
        >
          Welcome to my cosmic portfolio. Explore my universe of projects and
          discover how I combine creativity and technology to build stellar
          digital experiences.
        </motion.p>

        <motion.div
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8, delay: 0.6 }}
          className="flex flex-wrap justify-center gap-4"
        >
          <button
            className="cosmic-button flex items-center gap-2"
            onClick={() => {
              const projectsSection = document.getElementById("projects");
              if (projectsSection) {
                projectsSection.scrollIntoView({ behavior: "smooth" });
              }
            }}
          >
            <span>View Projects</span>
            <svg
              xmlns="http://www.w3.org/2000/svg"
              width="16"
              height="16"
              fill="currentColor"
              viewBox="0 0 16 16"
            >
              <path
                fillRule="evenodd"
                d="M4.646 1.646a.5.5 0 0 1 .708 0l6 6a.5.5 0 0 1 0 .708l-6 6a.5.5 0 0 1-.708-.708L10.293 8 4.646 2.354a.5.5 0 0 1 0-.708z"
              />
            </svg>
          </button>

          <a
            href="#contact"
            className="cosmic-button"
            onClick={(e) => {
              e.preventDefault();
              const contactSection = document.getElementById("contact");
              if (contactSection) {
                contactSection.scrollIntoView({ behavior: "smooth" });
              }
            }}
          >
            Get In Touch
          </a>
        </motion.div>
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
