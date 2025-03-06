"use client";
import { useEffect, useState, useRef } from "react";
import CosmicBackground from "@/components/CosmicBackground";
import IntroSection from "@/components/sections/IntroSection";
import AboutSection from "@/components/sections/AboutSection";
import ProjectsSection from "@/components/sections/ProjectsSection";
import SkillsSection from "@/components/sections/SkillsSection";
import ContactSection from "@/components/sections/ContactSection";
import Navigation from "@/components/Navigation";
import LoadingScreen from "@/components/LoadingScreen";

export default function Home() {
  // App state
  const [loading, setLoading] = useState(true);
  const [isScrolling, setIsScrolling] = useState(false);
  const [currentSectionIndex, setCurrentSectionIndex] = useState(0);
  const [isAnimating, setIsAnimating] = useState(false);
  const [scrollProgress, setScrollProgress] = useState(0);
  const [scrollY, setScrollY] = useState(0);

  // Refs
  const mainRef = useRef<HTMLDivElement>(null);
  const sectionRefs = useRef<Array<HTMLElement | null>>([]);
  const scrollTimeout = useRef<NodeJS.Timeout | null>(null);
  const sections = ["home", "about", "projects", "skills", "contact"];
  const isTouchDevice = useRef(false);
  const wheelTimeout = useRef<NodeJS.Timeout | null>(null);
  const lastWheelTime = useRef(0);

  // Initialize
  useEffect(() => {
    // Detect touch device
    isTouchDevice.current =
      "ontouchstart" in window || navigator.maxTouchPoints > 0;

    // Get section elements
    sectionRefs.current = sections.map((id) => document.getElementById(id));

    // Simulate loading assets
    const timer = setTimeout(() => setLoading(false), 2000);

    return () => clearTimeout(timer);
  }, [sections]);

  // Calculate scroll progress
  const calculateScrollProgress = () => {
    const scrollHeight =
      document.documentElement.scrollHeight - window.innerHeight;
    return Math.min(100, Math.max(0, (window.scrollY / scrollHeight) * 100));
  };

  // Smooth scroll to section
  const scrollToSection = (sectionId: string) => {
    if (isAnimating) return;

    const section = document.getElementById(sectionId);
    if (!section) return;

    setIsAnimating(true);
    setIsScrolling(true);

    const startPosition = window.scrollY;
    const targetPosition = section.offsetTop;
    const distance = targetPosition - startPosition;

    // Skip animation if already close
    if (Math.abs(distance) < 10) {
      setIsAnimating(false);
      setTimeout(() => setIsScrolling(false), 50);
      return;
    }

    // Dynamic duration based on distance
    const duration = Math.min(800, Math.max(300, Math.abs(distance) * 0.4));
    const startTime = performance.now();

    // Cubic easing function for smooth animation
    const easeOutCubic = (t: number) => 1 - Math.pow(1 - t, 3);

    // Animation loop
    const animateScroll = (currentTime: number) => {
      const elapsedTime = currentTime - startTime;
      const progress = Math.min(1, elapsedTime / duration);
      const easedProgress = easeOutCubic(progress);

      const currentPos = startPosition + distance * easedProgress;
      window.scrollTo(0, currentPos);
      setScrollY(currentPos);

      if (progress < 1) {
        requestAnimationFrame(animateScroll);
      } else {
        setTimeout(() => {
          setIsAnimating(false);

          // Reset scrolling flag with delay
          if (scrollTimeout.current) clearTimeout(scrollTimeout.current);
          scrollTimeout.current = setTimeout(() => setIsScrolling(false), 300);
        }, 100);
      }
    };

    requestAnimationFrame(animateScroll);
  };

  // Handle scroll events
  useEffect(() => {
    const handleScroll = () => {
      // Update scroll state
      const newScrollY = window.scrollY;
      setScrollY(newScrollY);
      setIsScrolling(true);
      setScrollProgress(calculateScrollProgress());

      // Reset scrolling state with delay
      if (scrollTimeout.current) clearTimeout(scrollTimeout.current);
      scrollTimeout.current = setTimeout(() => setIsScrolling(false), 100);

      // Determine current section
      const viewportMiddle = newScrollY + window.innerHeight / 2;
      let activeIndex = 0;

      sectionRefs.current.forEach((section, index) => {
        if (section) {
          const { offsetTop, offsetHeight } = section;
          if (
            viewportMiddle >= offsetTop &&
            viewportMiddle < offsetTop + offsetHeight
          ) {
            activeIndex = index;
          }
        }
      });

      if (activeIndex !== currentSectionIndex) {
        setCurrentSectionIndex(activeIndex);
      }
    };

    // Better wheel handler with debouncing
    const handleWheel = (e: WheelEvent) => {
      // Skip handling under certain conditions
      if (isAnimating || isTouchDevice.current) return;

      // Debounce wheel events
      const now = Date.now();
      if (now - lastWheelTime.current < 150) return; // Increase to make less sensitive

      // Only trigger on larger wheel movements
      if (Math.abs(e.deltaY) < 30) return;

      // Allow scrolling past last section for footer
      const maxScroll =
        document.documentElement.scrollHeight - window.innerHeight;
      const isNearBottom = window.scrollY > maxScroll - 150;
      if (isNearBottom && e.deltaY > 0) return;

      e.preventDefault();
      lastWheelTime.current = now;

      if (wheelTimeout.current) clearTimeout(wheelTimeout.current);
      wheelTimeout.current = setTimeout(() => {
        // Determine direction and next section
        const direction = e.deltaY > 0 ? 1 : -1;
        const nextIndex = Math.max(
          0,
          Math.min(sections.length - 1, currentSectionIndex + direction)
        );

        if (nextIndex !== currentSectionIndex) {
          setCurrentSectionIndex(nextIndex);
          scrollToSection(sections[nextIndex]);
        }
      }, 50);
    };

    window.addEventListener("scroll", handleScroll, { passive: true });
    window.addEventListener("wheel", handleWheel, { passive: false });

    return () => {
      window.removeEventListener("scroll", handleScroll);
      window.removeEventListener("wheel", handleWheel);
      if (scrollTimeout.current) clearTimeout(scrollTimeout.current);
      if (wheelTimeout.current) clearTimeout(wheelTimeout.current);
    };
  }, [currentSectionIndex, isAnimating, sections]);

  // Handle section changes
  const handleSectionChange = (index: number) => {
    if (isAnimating || index === currentSectionIndex) return;
    setCurrentSectionIndex(index);
    scrollToSection(sections[index]);
  };

  return (
    <>
      {loading ? (
        <LoadingScreen />
      ) : (
        <div ref={mainRef} className="relative w-full">
          {/* Background with stars */}
          <CosmicBackground scrollY={scrollY} isScrolling={isScrolling} />

          {/* Navigation bar */}
          <Navigation
            currentSection={sections[currentSectionIndex]}
            onSectionClick={(id) => {
              const index = sections.indexOf(id);
              if (index !== -1) handleSectionChange(index);
            }}
          />

          {/* Section indicators (dots) */}
          <div className="fixed right-8 top-1/2 -translate-y-1/2 z-[100] hidden md:flex flex-col">
            {sections.map((section, index) => (
              <button
                key={section}
                className={`section-indicator-dot ${
                  currentSectionIndex === index ? "active" : ""
                }`}
                onClick={() => handleSectionChange(index)}
                title={section.charAt(0).toUpperCase() + section.slice(1)}
                aria-label={`Go to ${section} section`}
              />
            ))}
          </div>

          {/* Scroll progress indicator */}
          <div className="fixed bottom-8 left-1/2 -translate-x-1/2 w-24 h-1 bg-white/20 rounded-full overflow-hidden z-30">
            <div
              className="h-full bg-gradient-to-r from-purple-500 to-blue-500 shadow-glow transition-all duration-300"
              style={{ width: `${scrollProgress}%` }}
            />
          </div>

          {/* Main content */}
          <main className="relative z-10">
            <section id="home" className="section">
              <IntroSection />
              {currentSectionIndex === 0 && (
                <button
                  onClick={() => handleSectionChange(1)}
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

            <section id="about" className="section">
              <AboutSection />
            </section>

            <section id="projects" className="section">
              <ProjectsSection />
            </section>

            <section id="skills" className="section">
              <SkillsSection />
            </section>

            <section id="contact" className="section">
              <ContactSection />
            </section>
          </main>

          <footer
            id="footer"
            className="relative z-10 py-12 text-center text-sm text-white/60"
          >
            <div className="container mx-auto px-6">
              <p>
                © {new Date().getFullYear()} Etienne Mentrel | Cosmic Portfolio
              </p>
              <p className="mt-2">
                Made with Next.js, Three.js and cosmic dust ✨
              </p>
            </div>
          </footer>
        </div>
      )}
    </>
  );
}
