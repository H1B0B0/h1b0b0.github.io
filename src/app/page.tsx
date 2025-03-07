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
  const [scrollY, setScrollY] = useState(0);
  const [windowHeight, setWindowHeight] = useState(0);
  const [windowWidth, setWindowWidth] = useState(0);

  // Nouvelle référence pour suivre le dernier temps de défilement
  const lastScrollTime = useRef(Date.now());
  const scrollTimeout = useRef<NodeJS.Timeout | null>(null);

  // Références
  const mainRef = useRef<HTMLDivElement>(null);
  const sectionsRef = useRef<HTMLDivElement[]>([]);
  const sections = ["home", "about", "projects", "skills", "contact"];

  // Détection des dimensions de l'écran
  useEffect(() => {
    const handleResize = () => {
      setIsMobile(window.innerWidth < 768);
      setWindowHeight(window.innerHeight);
      setWindowWidth(window.innerWidth);
    };

    handleResize();
    window.addEventListener("resize", handleResize);
    return () => window.removeEventListener("resize", handleResize);
  }, []);

  // Gestion du défilement avec détection améliorée pour plus de précision
  useEffect(() => {
    // Variable pour suivre le dernier temps de mise à jour de l'UI
    let lastUIUpdateTime = Date.now();
    const uiUpdateThreshold = 50; // Empêcher les mises à jour trop fréquentes de l'UI (ms)

    // Observer d'intersection pour détecter les sections visibles
    const setupIntersectionObserver = () => {
      // Ajuster le seuil en fonction de la taille de l'écran
      const thresholdValue = isMobile ? [0.2, 0.3] : [0.4, 0.6];

      const options = {
        root: null, // viewport
        rootMargin: "0px",
        threshold: thresholdValue, // Déclencher quand le pourcentage de la section est visible
      };

      const observer = new IntersectionObserver((entries) => {
        const visibleSections = entries
          .filter((entry) => entry.isIntersecting)
          .sort((a, b) => {
            // En cas de plusieurs sections visibles, prendre celle qui occupe le plus d'espace
            return b.intersectionRatio - a.intersectionRatio;
          });

        if (visibleSections.length > 0) {
          const mostVisibleSection = visibleSections[0].target as HTMLElement;
          const sectionId = mostVisibleSection.id;
          const sectionIndex = sections.indexOf(sectionId);

          // Ne mettre à jour l'UI que si nécessaire et pas trop fréquemment
          if (
            sectionIndex !== currentSectionIndex &&
            Date.now() - lastUIUpdateTime > uiUpdateThreshold
          ) {
            console.log(
              `Section la plus visible: ${sectionId} (${sectionIndex})`
            );
            setCurrentSectionIndex(sectionIndex);
            setIsScrolling(true);
            lastUIUpdateTime = Date.now();

            // Réinitialiser l'état de défilement après un court délai
            if (scrollTimeout.current) {
              clearTimeout(scrollTimeout.current);
            }
            scrollTimeout.current = setTimeout(() => {
              setIsScrolling(false);
            }, 300);
          }
        }
      }, options);

      // Observer toutes les sections
      sections.forEach((id) => {
        const element = document.getElementById(id);
        if (element) {
          observer.observe(element);
        }
      });

      return observer;
    };

    // Fonction traditionnelle de détection par scroll comme fallback
    const handleScroll = () => {
      if (Date.now() - lastUIUpdateTime < uiUpdateThreshold) return;

      const scrollPosition = window.scrollY;
      const viewportHeight = window.innerHeight;
      const viewportMiddle = scrollPosition + viewportHeight / 2;

      // Mise à jour immédiate de la position de défilement pour l'effet de traînée
      setScrollY(scrollPosition);
      setIsScrolling(true);

      // Annuler tout timeout précédent
      if (scrollTimeout.current) {
        clearTimeout(scrollTimeout.current);
      }

      // Reset scroll state after animation
      scrollTimeout.current = setTimeout(() => {
        setIsScrolling(false);
      }, 300);

      // Find which section contains the middle of the viewport
      let activeSectionIndex = -1;

      // Check each section's position
      sections.forEach((id, index) => {
        const section = document.getElementById(id);
        if (section) {
          const rect = section.getBoundingClientRect();
          const sectionTop = scrollPosition + rect.top;
          const sectionMiddle = sectionTop + rect.height / 2;

          // Give more weight to sections near the middle of the viewport
          const distanceFromMiddle = Math.abs(viewportMiddle - sectionMiddle);

          if (
            sectionTop <= viewportMiddle &&
            sectionTop + rect.height > viewportMiddle
          ) {
            activeSectionIndex = index;
          }
        }
      });

      if (
        activeSectionIndex !== -1 &&
        activeSectionIndex !== currentSectionIndex
      ) {
        console.log(`Section active (scroll): ${sections[activeSectionIndex]}`);
        setCurrentSectionIndex(activeSectionIndex);
        lastUIUpdateTime = Date.now();
      }
    };

    // Setup IntersectionObserver for main detection
    const observer = setupIntersectionObserver();

    // Use scroll as backup/supplement
    window.addEventListener("scroll", handleScroll, { passive: true });

    return () => {
      observer.disconnect();
      window.removeEventListener("scroll", handleScroll);
      if (scrollTimeout.current) clearTimeout(scrollTimeout.current);
    };
  }, [currentSectionIndex, sections, isMobile]);

  // Navigation fluide vers une section - version corrigée pour garantir le déplacement correct
  const smoothScrollToSection = (sectionId: string) => {
    console.log(`Tentative de navigation vers la section: ${sectionId}`);

    // Trouver l'élément section par ID
    const section = document.getElementById(sectionId);
    if (section) {
      // Activer l'état de défilement pour les animations
      setIsScrolling(true);

      // Récupérer la position exacte avec getBoundingClientRect pour plus de précision
      const rect = section.getBoundingClientRect();
      const scrollTop =
        window.pageYOffset || document.documentElement.scrollTop;
      const sectionTop = rect.top + scrollTop;

      console.log(
        `Position précise de la section ${sectionId}: ${sectionTop}px`
      );

      try {
        // Défilement avec options
        window.scrollTo({
          top: sectionTop,
          behavior: "smooth",
        });

        // Fallback en cas d'échec de la première méthode
        setTimeout(() => {
          // Vérifier si nous sommes arrivés à la bonne position
          if (Math.abs(window.scrollY - sectionTop) > 50) {
            console.log("Correction de position nécessaire");
            // Forcer une seconde fois le défilement
            window.scrollTo({
              top: sectionTop,
              behavior: "auto", // Instantané cette fois
            });

            // Alternative: utiliser scrollIntoView
            section.scrollIntoView({
              behavior: "smooth",
              block: "start",
            });
          }
        }, 300);

        // Mettre à jour l'index de section active
        const newIndex = sections.indexOf(sectionId);
        if (newIndex !== -1) {
          setCurrentSectionIndex(newIndex);
          console.log(`Index mis à jour: ${newIndex}`);
        }
      } catch (error) {
        console.error("Erreur lors du défilement:", error);
        // Méthode de secours
        section.scrollIntoView({ behavior: "smooth" });
      }

      // Réinitialiser l'état de défilement après l'animation
      setTimeout(() => {
        setIsScrolling(false);
      }, 1000);
    } else {
      console.error(`Section "${sectionId}" non trouvée dans le DOM`);
    }
  };

  // Fonction spécifique pour gérer les clics sur l'indicateur de section - version corrigée
  const handleIndicatorClick = (section: string) => {
    console.log(`Clic sur indicateur pour ${section}`);

    // Force le défilement direct vers la section
    const sectionElement = document.getElementById(section);
    if (sectionElement) {
      // Obtenir la position exacte
      const offsetTop = sectionElement.offsetTop;
      console.log(
        `Position de la section ${section} (offsetTop): ${offsetTop}px`
      );

      // Activer l'animation
      setIsScrolling(true);

      // Mettre à jour l'index immédiatement pour le feedback visuel
      const newIndex = sections.indexOf(section);
      if (newIndex !== -1) {
        setCurrentSectionIndex(newIndex);
      }

      // Utiliser direct offsetTop qui est plus fiable dans ce contexte
      window.scrollTo({
        top: offsetTop,
        behavior: "smooth",
      });

      // Fallback en cas d'échec
      setTimeout(() => {
        const currentScroll = window.pageYOffset;
        if (Math.abs(currentScroll - offsetTop) > 50) {
          console.log("Utilisation du fallback pour le défilement");
          sectionElement.scrollIntoView({ behavior: "smooth", block: "start" });
        }
      }, 300);

      // Réinitialiser l'état après l'animation
      setTimeout(() => setIsScrolling(false), 1000);
    }
  };

  // Initialisation
  useEffect(() => {
    // Chargement simulé
    const loadTimer = setTimeout(() => setLoading(false), 2000);

    // Restaurer le défilement normal du document
    document.documentElement.style.overflow = "";
    document.body.style.overflow = "";
    document.documentElement.style.overscrollBehavior = "";

    return () => {
      clearTimeout(loadTimer);
    };
  }, []);

  return (
    <>
      {loading ? (
        <LoadingScreen />
      ) : (
        <div className="relative">
          {/* Fond d'étoiles avec défilement parallax - paramètre amélioré */}
          <SimpleStarBackground
            scrollY={scrollY}
            isScrolling={isScrolling}
            isSpaceTransition={false}
            transitionDirection={0}
            transitionProgress={0}
          />

          {/* Navigation fixe avec props mises à jour */}
          <div className="fixed top-0 left-0 right-0 z-50">
            <Navigation
              currentSection={sections[currentSectionIndex]}
              onSectionClick={(id) => {
                console.log(`Navigation: clic sur ${id}`);
                smoothScrollToSection(id);
              }}
            />
          </div>

          {/* Compteur FPS (facultatif) */}
          <FPSCounter visible={false} />

          {/* Indicateurs de section optimisés */}
          <div className="section-indicators-container hidden md:flex flex-col z-[1000]">
            {sections.map((section, index) => (
              <div key={section} className="relative indicator-wrapper">
                <button
                  className={`section-indicator-dot ${
                    currentSectionIndex === index ? "active" : ""
                  }`}
                  onClick={() => handleIndicatorClick(section)}
                  aria-label={`Go to ${section} section`}
                  data-section={section}
                  data-active={currentSectionIndex === index}
                >
                  <span className="sr-only">
                    {section.charAt(0).toUpperCase() + section.slice(1)}
                  </span>
                </button>
                <span className="section-indicator-label">
                  {section.charAt(0).toUpperCase() + section.slice(1)}
                </span>
              </div>
            ))}
          </div>

          {/* Sections principales avec hauteur adaptative */}
          <main ref={mainRef} className="relative z-10">
            {sections.map((sectionId, idx) => (
              <section
                key={sectionId}
                id={sectionId}
                className={`w-full flex items-center justify-center section-container ${
                  sectionId === "home" ? "min-h-screen" : "min-h-dynamic"
                }`}
                ref={(el) => {
                  if (el) sectionsRef.current[idx] = el as HTMLDivElement;
                }}
                data-section-index={idx}
              >
                <div
                  className={`section-content w-full max-w-[1200px] mx-auto px-4 sm:px-6 lg:px-8`}
                >
                  {idx === 0 && <IntroSection />}
                  {idx === 1 && <AboutSection />}
                  {idx === 2 && <ProjectsSection />}
                  {idx === 3 && <SkillsSection />}
                  {idx === 4 && <ContactSection />}
                </div>

                {/* Bouton scroll down pour la première section */}
                {idx === 0 && (
                  <button
                    onClick={() => smoothScrollToSection("about")}
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
