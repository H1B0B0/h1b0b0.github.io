"use client";
import { useEffect, useState, useRef } from "react";
import SimpleStarBackground from "@/components/SimpleStarBackground";
import IntroSection from "@/components/sections/IntroSection";
import AboutSection from "@/components/sections/AboutSection";
import ProjectsSection from "@/components/sections/ProjectsSection";
import SkillsSection from "@/components/sections/SkillsSection";
import ContactSection from "@/components/sections/ContactSection";
import Navigation from "@/components/Navigation";
import LoadingScreen from "@/components/LoadingScreen";
import FPSCounter from "@/components/FPSCounter";

export default function Home() {
  // États de base
  const [loading, setLoading] = useState(true);
  const [currentSectionIndex, setCurrentSectionIndex] = useState(0);
  const [isScrolling, setIsScrolling] = useState(false);
  const [isMobile, setIsMobile] = useState(false);
  const [isSpaceTransition, setIsSpaceTransition] = useState(false);
  const [transitionDirection, setTransitionDirection] = useState(0);
  const [transitionProgress, setTransitionProgress] = useState(0);

  // Références
  const lockScrollRef = useRef(false);
  const sections = ["home", "about", "projects", "skills", "contact"];

  // Détection mobile
  useEffect(() => {
    const checkIfMobile = () => setIsMobile(window.innerWidth < 768);
    checkIfMobile();
    window.addEventListener("resize", checkIfMobile);
    return () => window.removeEventListener("resize", checkIfMobile);
  }, []);

  // Fonction améliorée pour s'assurer que le défilement s'arrête exactement à chaque section
  const navigateToSection = (index: number) => {
    if (index < 0 || index >= sections.length) return;
    if (lockScrollRef.current) return;

    // Verrouiller pour éviter les défilements multiples
    lockScrollRef.current = true;

    console.log(`Navigating to section ${index}: ${sections[index]}`);

    // Préparation des animations
    const direction = index > currentSectionIndex ? 1 : -1;
    setTransitionDirection(direction);
    setIsSpaceTransition(true);
    setIsScrolling(true);
    setCurrentSectionIndex(index);

    // Obtenir la hauteur exacte de la fenêtre pour un positionnement précis
    const windowHeight = window.innerHeight;

    // Calculer la position cible précise = hauteur de la fenêtre * index
    const targetOffset = windowHeight * index;

    // Animation avec durée plus longue pour plus de fluidité
    const startPosition = window.scrollY;
    const startTime = performance.now();
    const duration = 500; // Durée un peu plus longue pour une transition plus fluide

    const animateScroll = (currentTime) => {
      const elapsedTime = currentTime - startTime;
      const progress = Math.min(elapsedTime / duration, 1);

      // Easing cubique pour un mouvement plus naturel
      const easedProgress =
        progress < 0.5
          ? 4 * progress * progress * progress
          : 1 - Math.pow(-2 * progress + 2, 3) / 2;

      // Mettre à jour la progression pour les effets visuels
      setTransitionProgress(easedProgress);

      // Calculer la position précise
      const newPosition = Math.round(
        startPosition + (targetOffset - startPosition) * easedProgress
      );

      // Défiler à la position calculée
      window.scrollTo(0, newPosition);

      // Continuer l'animation si nécessaire
      if (progress < 1) {
        requestAnimationFrame(animateScroll);
      } else {
        // Garantir un positionnement exact à la fin de l'animation
        window.scrollTo(0, targetOffset);
        console.log(`Animation terminée, position finale: ${targetOffset}px`);

        // Réinitialiser les états après un léger délai
        setTimeout(() => {
          setIsSpaceTransition(false);
          setIsScrolling(false);
          setTransitionProgress(0);
          lockScrollRef.current = false;
        }, 50);
      }
    };

    // Démarrer l'animation
    requestAnimationFrame(animateScroll);
  };

  // Capture plus précise des événements de défilement
  const handleWheel = (e: WheelEvent) => {
    e.preventDefault();

    if (lockScrollRef.current) return;

    // Capture uniquement la direction, pas l'amplitude
    const direction = e.deltaY > 0 ? 1 : -1;
    const nextIndex = Math.max(
      0,
      Math.min(sections.length - 1, currentSectionIndex + direction)
    );

    if (nextIndex !== currentSectionIndex) {
      navigateToSection(nextIndex);
    }
  };

  // Initialisation avec configuration améliorée
  useEffect(() => {
    // Chargement simulé
    const loadTimer = setTimeout(() => setLoading(false), 2000);

    // Gestion du scrolling
    document.documentElement.style.overflow = "hidden"; // Empêcher le défilement natif
    document.body.style.overflow = "hidden";
    document.documentElement.style.scrollBehavior = "auto";
    document.documentElement.style.overscrollBehavior = "none";

    // Configuration initiale: forcer la hauteur correcte des sections
    const setUpSections = () => {
      const windowHeight = window.innerHeight;

      sections.forEach((id) => {
        const section = document.getElementById(id);
        if (section) {
          section.style.height = `${windowHeight}px`;
        }
      });

      // Défiler vers la section active
      window.scrollTo(0, windowHeight * currentSectionIndex);
    };

    setUpSections();

    // Capturer tous les événements de défilement
    window.addEventListener("wheel", handleWheel, { passive: false });
    window.addEventListener("resize", setUpSections);

    // Gestion du défilement via clavier (touches flèches/page up/down)
    const handleKeyDown = (e: KeyboardEvent) => {
      if (lockScrollRef.current) return;

      let direction = 0;
      if (e.key === "ArrowDown" || e.key === "PageDown") direction = 1;
      else if (e.key === "ArrowUp" || e.key === "PageUp") direction = -1;
      else return;

      e.preventDefault();
      const nextIndex = Math.max(
        0,
        Math.min(sections.length - 1, currentSectionIndex + direction)
      );
      if (nextIndex !== currentSectionIndex) {
        navigateToSection(nextIndex);
      }
    };

    window.addEventListener("keydown", handleKeyDown);

    // Gestion tactile avec capture précise des gestes
    let touchStartY = 0;

    const handleTouchStart = (e: TouchEvent) => {
      touchStartY = e.touches[0].clientY;
    };

    const handleTouchEnd = (e: TouchEvent) => {
      if (lockScrollRef.current) return;

      const touchEndY = e.changedTouches[0].clientY;
      const difference = touchEndY - touchStartY;

      // Seulement si le geste est significatif (au moins 50px)
      if (Math.abs(difference) < 50) return;

      const direction = difference < 0 ? 1 : -1; // Négatif = swipe up = passage à section suivante
      const nextIndex = Math.max(
        0,
        Math.min(sections.length - 1, currentSectionIndex + direction)
      );

      if (nextIndex !== currentSectionIndex) {
        navigateToSection(nextIndex);
      }
    };

    window.addEventListener("touchstart", handleTouchStart, { passive: true });
    window.addEventListener("touchend", handleTouchEnd);

    return () => {
      clearTimeout(loadTimer);
      window.removeEventListener("wheel", handleWheel);
      window.removeEventListener("keydown", handleKeyDown);
      window.removeEventListener("touchstart", handleTouchStart);
      window.removeEventListener("touchend", handleTouchEnd);
      window.removeEventListener("resize", setUpSections);

      // Restaurer le défilement normal
      document.documentElement.style.overflow = "";
      document.body.style.overflow = "";
    };
  }, [currentSectionIndex]);

  // Désactiver le détecteur de scroll standard pour éviter les conflits
  // Nous gérons manuellement l'index de la section active

  return (
    <>
      {loading ? (
        <LoadingScreen />
      ) : (
        <div className="relative">
          {/* Fond d'étoiles */}
          <SimpleStarBackground
            scrollY={window.scrollY}
            isScrolling={isScrolling}
            isSpaceTransition={isSpaceTransition}
            transitionDirection={transitionDirection}
            transitionProgress={transitionProgress}
          />

          {/* Navigation fixe */}
          <div className="fixed top-0 left-0 right-0 z-50">
            <Navigation
              currentSection={sections[currentSectionIndex]}
              onSectionClick={(id) => {
                const index = sections.indexOf(id);
                if (index !== -1) navigateToSection(index);
              }}
            />
          </div>

          {/* Compteur FPS (facultatif) */}
          <FPSCounter visible={true} />

          {/* Indicateurs de section */}
          <div className="fixed right-8 top-1/2 -translate-y-1/2 z-50 hidden md:flex flex-col">
            {sections.map((section, index) => (
              <button
                key={section}
                className={`section-indicator-dot ${
                  currentSectionIndex === index ? "active" : ""
                }`}
                onClick={() => navigateToSection(index)}
                title={section.charAt(0).toUpperCase() + section.slice(1)}
                aria-label={`Go to ${section} section`}
              />
            ))}
          </div>

          {/* Sections principales */}
          <main className="relative z-10">
            {sections.map((sectionId, idx) => (
              <section
                key={sectionId}
                id={sectionId}
                className="w-full flex items-center justify-center"
                style={{ height: "100vh", minHeight: "100vh" }}
              >
                <div
                  className={`section-content w-full max-w-[1200px] mx-auto ${
                    isMobile ? "overflow-y-auto" : "overflow-hidden"
                  }`}
                >
                  {idx === 0 && <IntroSection />}
                  {idx === 1 && <AboutSection />}
                  {idx === 2 && <ProjectsSection />}
                  {idx === 3 && <SkillsSection />}
                  {idx === 4 && <ContactSection />}
                </div>

                {/* Bouton scroll down */}
                {idx === 0 && currentSectionIndex === 0 && (
                  <button
                    onClick={() => navigateToSection(1)}
                    className="absolute bottom-8 left-1/2 -translate-x-1/2 animate-scrollDown z-10 bg-transparent border-none text-white cursor-pointer"
                    aria-label="Scroll down"
                  >
                    <svg
                      className="w-6 h-6"
                      fill="none"
                      stroke="currentColor"
                      viewBox="0 0 24 24"
                      xmlns="http://www.w3.org/2000/svg"
                    >
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth={2}
                        d="M19 14l-7 7m0 0l-7-7m7 7V3"
                      />
                    </svg>
                  </button>
                )}
              </section>
            ))}
          </main>

          {/* Footer */}
          <footer className="py-6 text-center text-sm text-white/60 bg-black/30 backdrop-blur-sm">
            <div className="container mx-auto px-6">
              <p>
                © {new Date().getFullYear()} Etienne Mentrel | Cosmic Portfolio
              </p>
              <p className="mt-2">Made with Next.js and cosmic dust ✨</p>
            </div>
          </footer>
        </div>
      )}
    </>
  );
}
