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
    <div className="relative" ref={dropdownRef}>
      <button
        className="flex items-center gap-2 px-3 py-1.5 rounded-xl bg-white/5 border border-white/10 text-xs font-black tracking-widest text-gray-300 hover:text-white hover:bg-white/10 transition-all duration-300"
        onClick={() => setIsOpen(!isOpen)}
        aria-expanded={isOpen}
        aria-haspopup="true"
      >
        <span>{currentLanguage.toUpperCase()}</span>
        <motion.svg
          animate={{ rotate: isOpen ? 180 : 0 }}
          className="w-3 h-3 text-gray-500"
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
            initial={{ opacity: 0, y: 15, scale: 0.9 }}
            animate={{ opacity: 1, y: 12, scale: 1 }}
            exit={{ opacity: 0, y: 10, scale: 0.95 }}
            transition={{ type: "spring", damping: 20, stiffness: 350 }}
            className="absolute right-0 w-40 p-2 bg-[#0a0f1d]/90 backdrop-blur-2xl border border-white/10 rounded-2xl shadow-[0_20px_50px_rgba(0,0,0,0.5)] z-[2000]"
          >
            <div className="flex flex-col gap-1">
              {availableLanguages.map((lang) => (
                <button
                  key={lang}
                  className={`px-4 py-2.5 rounded-xl text-[10px] font-black uppercase tracking-[0.2em] transition-all duration-300 text-left w-full ${
                    currentLanguage === lang
                      ? "bg-violet-500/20 text-white shadow-[inset_0_0_10px_rgba(139,92,246,0.1)]"
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
                      <div 
                        className="w-1 h-1 rounded-full bg-violet-400 shadow-[0_0_8px_#a78bfa]" 
                      />
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