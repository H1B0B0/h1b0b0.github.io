"use client";
import { useState, useRef, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { useLanguage } from "@/i18n/LanguageContext";

const LanguageSelector = () => {
  const { currentLanguage, setLanguage, availableLanguages } = useLanguage();
  const [isOpen, setIsOpen] = useState(false);
  const dropdownRef = useRef<HTMLDivElement>(null);

  // Map des codes de langue aux noms d'affichage
  const languageNames: { [key: string]: string } = {
    en: "English",
    fr: "Français",
  };

  // Fermer le menu lors d'un clic à l'extérieur
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (
        dropdownRef.current &&
        !dropdownRef.current.contains(event.target as Node)
      ) {
        setIsOpen(false);
      }
    };

    document.addEventListener("mousedown", handleClickOutside);
    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, []);

  return (
    <div className="relative" ref={dropdownRef} onKeyDown={(event) => { if (event.key === "Escape") { event.stopPropagation(); setIsOpen(false); dropdownRef.current?.querySelector("button")?.focus(); } }}>
      <button
        className="language-trigger flex min-h-11 min-w-11 items-center justify-center gap-2 border-b border-white/20 px-1 text-[11px] font-medium uppercase tracking-[0.18em] text-white/75 transition-colors duration-200 hover:border-white/60 hover:text-white"
        onClick={() => setIsOpen(!isOpen)}
        aria-expanded={isOpen}
        aria-haspopup="true"
      >
        <span>{currentLanguage.toUpperCase()}</span>
        <motion.svg
          animate={{ rotate: isOpen ? 180 : 0 }}
          className="h-3 w-3 text-white/35"
          fill="none"
          stroke="currentColor"
          viewBox="0 0 24 24"
          xmlns="http://www.w3.org/2000/svg"
        >
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            strokeWidth={3}
            d="M19 9l-7 7-7-7"
          />
        </motion.svg>
      </button>

      <AnimatePresence>
        {isOpen && (
          <motion.div
            initial={{ opacity: 0, y: 8 }}
            animate={{ opacity: 1, y: 10 }}
            exit={{ opacity: 0, y: 6 }}
            transition={{ duration: 0.18 }}
            className="language-menu absolute right-0 z-[2000] w-36 border border-white/15 bg-black/90 p-1 shadow-[0_20px_50px_rgba(0,0,0,0.5)]"
          >
            <div className="flex flex-col gap-1">
              {availableLanguages.map((lang) => (
                <button
                  key={lang}
                  aria-current={currentLanguage === lang ? "true" : undefined}
                  className={`language-option min-h-11 w-full px-3 py-2.5 text-left text-[11px] font-medium uppercase tracking-[0.18em] transition-colors duration-200 ${
                    currentLanguage === lang
                      ? "bg-white text-black"
                      : "text-gray-400 hover:text-white hover:bg-white/5"
                  }`}
                  onClick={() => {
                    setLanguage(lang);
                    setIsOpen(false);
                  }}
                >
                  <span className="flex items-center justify-between">
                    {languageNames[lang] || lang}
                    {currentLanguage === lang && (
                      <div className="h-1 w-1 rounded-full bg-[#ff6b2c]" />
                    )}
                  </span>
                </button>
              ))}
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
};

export default LanguageSelector;
