"use client";
import { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import LanguageSelector from "./LanguageSelector";
import { useLanguage } from "@/i18n/LanguageContext";

interface NavigationProps {
  currentSection?: string;
  onSectionClick?: (sectionId: string) => void;
}

const Navigation = ({
  currentSection = "home",
  onSectionClick,
}: NavigationProps) => {
  const [activeSection, setActiveSection] = useState(currentSection);
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [isScrolled, setIsScrolled] = useState(false);
  const { t } = useLanguage();

  const sections = [
    { id: "home", label: t.navigation.home },
    { id: "about", label: t.navigation.about },
    { id: "projects", label: t.navigation.projects },
    { id: "skills", label: t.navigation.skills },
    { id: "contact", label: t.navigation.contact },
  ];

  useEffect(() => {
    if (currentSection !== activeSection) {
      setActiveSection(currentSection);
    }
  }, [currentSection, activeSection]);

  useEffect(() => {
    const handleScroll = () => {
      console.log("Navigation: scroll");
      console.log("window.scrollY", window.scrollY);
      setIsScrolled(window.scrollY > 50);
    };

    window.addEventListener("scroll", handleScroll);
    handleScroll();
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  const handleNavClick = (
    e: React.MouseEvent<HTMLAnchorElement>,
    id: string
  ) => {
    e.preventDefault();

    if (onSectionClick) {
      onSectionClick(id);
    } else {
      const section = document.getElementById(id);
      if (section) {
        section.scrollIntoView({ behavior: "smooth" });
      }
    }

    // Fermer le menu mobile
    if (isMenuOpen) {
      setIsMenuOpen(false);
    }
  };

  return (
    <nav
      className={`fixed top-6 left-1/2 -translate-x-1/2 z-[1000] w-[90%] max-w-4xl transition-all duration-700 ease-[cubic-bezier(0.22,1,0.36,1)] ${
        isScrolled ? "top-4 scale-[0.98]" : "top-6"
      }`}
      aria-label="Main navigation"
    >
      <div className="premium-nav-card rounded-2xl px-6 py-3 flex justify-between items-center">
        {/* Decorative corner glow inside nav */}
        <div className="absolute -top-10 -left-10 w-20 h-20 bg-violet-500/10 rounded-full blur-2xl pointer-events-none" />
        
        <a
          href="#home"
          className="text-xl md:text-2xl font-black tracking-tighter text-gradient-premium relative z-10"
          onClick={(e) => handleNavClick(e, "home")}
        >
          E.MENTREL
        </a>

        {/* Desktop Navigation */}
        <div
          className="hidden md:flex space-x-1 items-center relative z-10"
          role="navigation"
        >
          {sections.map(({ id, label }) => (
            <a
              key={id}
              href={`#${id}`}
              onClick={(e) => handleNavClick(e, id)}
              className={`px-4 py-2 rounded-xl transition-all duration-500 relative text-xs font-bold tracking-widest uppercase ${
                activeSection === id
                  ? "text-white"
                  : "text-gray-400 hover:text-gray-200"
              }`}
              aria-current={activeSection === id ? "page" : undefined}
            >
              {label}
              {activeSection === id && (
                <motion.div
                  layoutId="activeSection"
                  className="absolute inset-0 bg-white/5 border border-white/10 rounded-xl -z-10 shadow-[0_0_20px_rgba(255,255,255,0.05)]"
                  transition={{ type: "spring", bounce: 0.2, duration: 0.6 }}
                />
              )}
            </a>
          ))}

          <div className="h-4 w-px bg-white/10 mx-4" />
          <LanguageSelector />
        </div>

        {/* Mobile Toggle */}
        <div className="md:hidden flex items-center gap-3 relative z-10">
          <LanguageSelector />
          <button
            className="p-2.5 rounded-xl bg-white/5 border border-white/10 hover:bg-white/10 transition-all duration-300"
            onClick={() => setIsMenuOpen(!isMenuOpen)}
            aria-label={isMenuOpen ? "Close menu" : "Open menu"}
          >
            <div className="w-5 h-5 flex flex-col justify-center items-center relative">
              <span className={`w-5 h-0.5 bg-white rounded-full transition-all duration-300 absolute ${isMenuOpen ? "rotate-45" : "-translate-y-1.5"}`} />
              <span className={`w-5 h-0.5 bg-white rounded-full transition-opacity duration-300 ${isMenuOpen ? "opacity-0" : "opacity-100"}`} />
              <span className={`w-5 h-0.5 bg-white rounded-full transition-all duration-300 absolute ${isMenuOpen ? "-rotate-45" : "translate-y-1.5"}`} />
            </div>
          </button>
        </div>
      </div>

      {/* Mobile Menu */}
      <AnimatePresence>
        {isMenuOpen && (
          <motion.div
            initial={{ opacity: 0, y: -10, scale: 0.95 }}
            animate={{ opacity: 1, y: 12, scale: 1 }}
            exit={{ opacity: 0, y: -10, scale: 0.95 }}
            transition={{ type: "spring", damping: 25, stiffness: 300 }}
            className="md:hidden premium-nav-card rounded-2xl p-4 shadow-2xl border border-white/10"
          >
            <div className="flex flex-col gap-1">
              {sections.map(({ id, label }) => (
                <a
                  key={id}
                  href={`#${id}`}
                  onClick={(e) => handleNavClick(e, id)}
                  className={`px-4 py-3 rounded-xl transition-all duration-300 flex justify-between items-center ${
                    activeSection === id
                      ? "bg-violet-500/20 text-white border border-violet-500/20"
                      : "text-gray-400 hover:text-white hover:bg-white/5"
                  }`}
                >
                  <span className="font-bold text-xs uppercase tracking-widest">{label}</span>
                  {activeSection === id && (
                    <motion.div 
                      layoutId="activeDot"
                      className="w-1.5 h-1.5 rounded-full bg-violet-400 shadow-[0_0_10px_#a78bfa]" 
                    />
                  )}
                </a>
              ))}
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </nav>
  );
};

export default Navigation;
