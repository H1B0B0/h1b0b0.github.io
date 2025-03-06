"use client";
import { useEffect, useState, useRef, useMemo } from "react";
import { motion, AnimatePresence } from "framer-motion";

// Générer un tableau d'étoiles avec des propriétés pré-calculées
const generateStars = (count: number) => {
  return Array.from({ length: count }, () => ({
    top: Math.random() * 100,
    left: Math.random() * 100,
    size: Math.random() * 2 + 1, // entre 1 et 3 px
    delay: Math.random() * 2,
    duration: Math.random() * 3 + 2, // entre 2 et 5 secondes
    initialOpacity: Math.random() * 0.5 + 0.3,
    glow: Math.random() > 0.7, // 30% des étoiles brillent plus fort
  }));
};

const LoadingScreen = () => {
  const [progress, setProgress] = useState(0);
  const [loadingText, setLoadingText] = useState("");
  const [isTypingComplete, setIsTypingComplete] = useState(false);
  const planetRef = useRef<HTMLDivElement>(null);
  const textTimerRef = useRef<NodeJS.Timeout | null>(null);

  // Générer les étoiles une seule fois avec useMemo
  const stars = useMemo(() => generateStars(50), []);

  // Effet de machine à écrire simplifié
  useEffect(() => {
    const loadingMessage = "Initializing";
    let currentIndex = 0;

    const typeText = () => {
      if (currentIndex <= loadingMessage.length) {
        setLoadingText(loadingMessage.substring(0, currentIndex));
        currentIndex++;
        textTimerRef.current = setTimeout(typeText, 100);

        if (currentIndex > loadingMessage.length) {
          setIsTypingComplete(true);
        }
      }
    };

    // Démarrer l'effet de machine à écrire
    typeText();

    return () => {
      if (textTimerRef.current) clearTimeout(textTimerRef.current);
    };
  }, []);

  // Gestion de la progression
  useEffect(() => {
    // Durée fixe de 2 secondes pour le chargement
    const duration = 2000;
    const startTime = performance.now();

    // Fonction pour mettre à jour la progression de manière fluide
    const updateProgress = (currentTime: number) => {
      const elapsed = currentTime - startTime;
      const rawProgress = Math.min(elapsed / duration, 1);

      // Utiliser une courbe d'accélération pour simuler un vrai chargement
      // Lent au début, plus rapide en fin de chargement
      const easedProgress =
        rawProgress < 0.5
          ? 2 * rawProgress * rawProgress
          : -1 + (4 - 2 * rawProgress) * rawProgress;

      const newProgress = Math.min(100, Math.round(easedProgress * 100));
      setProgress(newProgress);

      if (rawProgress < 1) {
        // Continuer l'animation
        requestAnimationFrame(updateProgress);
      } else {
        // Garantir que nous atteignons 100% à la fin
        setProgress(100);
      }
    };

    // Démarrer l'animation
    const animationFrame = requestAnimationFrame(updateProgress);

    return () => {
      cancelAnimationFrame(animationFrame);
    };
  }, []);

  // Add this effect to ensure the progress completes
  useEffect(() => {
    // Ensure progress reaches 100% even if the component unmounts quickly
    if (progress >= 100) {
      const timer = setTimeout(() => {
        // Signal to parent that loading is complete if needed
      }, 200);
      return () => clearTimeout(timer);
    }
  }, [progress]);

  return (
    <AnimatePresence>
      <motion.div
        initial={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        className="fixed inset-0 bg-black flex flex-col items-center justify-center z-50 overflow-hidden"
      >
        {/* Cosmic background with fixed stars */}
        <div className="absolute inset-0 overflow-hidden">
          {stars.map((star, i) => (
            <motion.div
              key={i}
              className={`absolute rounded-full ${
                star.glow ? "bg-blue-100" : "bg-white"
              }`}
              style={{
                top: `${star.top}%`,
                left: `${star.left}%`,
                width: `${star.size}px`,
                height: `${star.size}px`,
                boxShadow: star.glow
                  ? "0 0 6px 2px rgba(255, 255, 255, 0.8)"
                  : "0 0 2px 1px rgba(255, 255, 255, 0.4)",
              }}
              animate={{
                opacity: [
                  star.initialOpacity,
                  star.initialOpacity + 0.3,
                  star.initialOpacity,
                ],
                scale: star.glow ? [1, 1.3, 1] : [1, 1.1, 1],
              }}
              transition={{
                repeat: Infinity,
                duration: star.duration,
                delay: star.delay,
                ease: "easeInOut",
              }}
            />
          ))}
        </div>

        <div className="z-10 flex flex-col items-center max-w-md px-4">
          {/* Logo/Icon */}
          <div className="mb-8 relative">
            {/* Glowing planet */}
            <motion.div
              ref={planetRef}
              className="w-32 h-32 rounded-full bg-gradient-to-br from-purple-600 to-blue-500 relative"
              initial={{ scale: 0.8 }}
              animate={{ scale: [0.85, 1, 0.85] }}
              transition={{ duration: 4, repeat: Infinity }}
              style={{
                boxShadow: "0 0 40px 5px rgba(120, 80, 220, 0.6)",
              }}
            >
              {/* Planet rings */}
              <div className="absolute inset-0 border-4 border-white/10 rounded-full opacity-70 transform -rotate-12 scale-[1.2]"></div>
              <div className="absolute inset-0 border-4 border-white/5 rounded-full opacity-50 transform rotate-45 scale-[1.4]"></div>

              {/* Surface details */}
              <div className="absolute left-[15%] top-[20%] w-[20%] h-[15%] bg-white/10 rounded-full backdrop-blur-md"></div>
              <div className="absolute right-[25%] bottom-[30%] w-[15%] h-[25%] bg-white/10 rounded-full backdrop-blur-md"></div>
            </motion.div>

            {/* Orbiting moon */}
            <motion.div
              className="absolute w-6 h-6 rounded-full bg-gray-300"
              initial={{ rotate: 0 }}
              animate={{ rotate: 360 }}
              transition={{
                duration: 10,
                repeat: Infinity,
                ease: "linear",
              }}
              style={{
                top: "50%",
                left: "50%",
                marginLeft: "-3px",
                marginTop: "-3px",
                transformOrigin: "-60px center",
                boxShadow: "0 0 10px rgba(255, 255, 255, 0.5)",
              }}
            />
          </div>

          {/* Loading Title */}
          <motion.div
            className="text-3xl md:text-4xl font-bold text-center mb-6"
            animate={{ opacity: [0.7, 1, 0.7] }}
            transition={{ duration: 2, repeat: Infinity }}
          >
            <span className="text-transparent bg-clip-text bg-gradient-to-r from-purple-400 to-blue-500">
              Entering Cosmic Space
            </span>
          </motion.div>

          {/* Loading text with typewriter effect - simplified to just "Initializing" */}
          <div className="h-6 mb-6 text-gray-300 font-mono min-h-[1.5rem] flex items-center justify-center">
            {loadingText}
            <span
              className={`animate-pulse ${
                !isTypingComplete ? "inline-block" : "hidden"
              }`}
            >
              _
            </span>
          </div>

          {/* Progress bar */}
          <div className="w-full h-2 bg-gray-900 rounded-full overflow-hidden mb-2">
            <motion.div
              className="h-full bg-gradient-to-r from-purple-600 via-blue-500 to-indigo-400"
              initial={{ width: "0%" }}
              animate={{ width: `${progress}%` }}
              transition={{ duration: 0.3 }}
            />
          </div>

          {/* Progress percentage */}
          <div className="text-sm text-gray-400 font-mono">
            {Math.round(progress)}%
          </div>
        </div>
      </motion.div>
    </AnimatePresence>
  );
};

export default LoadingScreen;
