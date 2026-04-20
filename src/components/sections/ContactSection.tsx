"use client";
import { useState } from "react";
import { motion } from "framer-motion";
import { useLanguage } from "@/i18n/LanguageContext";

const ContactSection = () => {
  const [copied, setCopied] = useState(false);
  const email = "etienne.mentrel@gmail.com";
  const { t, currentLanguage } = useLanguage();

  const handleCopyEmail = () => {
    navigator.clipboard.writeText(email);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  // Créer des textes différents pour l'email selon la langue
  const emailSubject =
    currentLanguage === "fr"
      ? "Collaboration%20sur%20un%20projet"
      : "Let's%20Collaborate";

  const emailBody =
    currentLanguage === "fr"
      ? "Bonjour%20Etienne,%0D%0A%0D%0AJ'aimerais%20discuter%20d'un%20projet%20avec%20vous."
      : "Hello%20Etienne,%0D%0A%0D%0AI'd%20like%20to%20discuss%20a%20project%20with%20you.";

  return (
    <div className="container mx-auto px-6 py-12 text-center pb-24">
      <div className="max-w-3xl mx-auto">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.6 }}
        >
          <h2 className="text-4xl md:text-6xl font-black mb-8 tracking-tighter text-gradient-premium">
            {t.contact.title}
          </h2>

          <p className="text-lg text-gray-400 mb-16 max-w-xl mx-auto leading-relaxed">
            {t.contact.description}
          </p>
        </motion.div>

        <div className="relative group">
          {/* Animated background glow */}
          <div className="absolute inset-x-0 -top-16 -bottom-16 bg-gradient-to-r from-violet-600/20 via-cyan-600/20 to-fuchsia-600/20 opacity-0 group-hover:opacity-100 blur-3xl transition-opacity duration-1000 -z-10" />
          
          <div className="premium-card rounded-3xl p-8 md:p-12 border-white/5 shadow-2xl relative overflow-hidden">
            <div className="absolute top-0 right-0 p-4 opacity-10">
              <svg xmlns="http://www.w3.org/2000/svg" width="120" height="120" fill="currentColor" viewBox="0 0 16 16">
                <path d="M15.964.686a.5.5 0 0 0-.65-.65L.767 5.855H.766l-.452.18a.5.5 0 0 0-.082.887l.41.26.001.002 4.995 3.178 3.178 4.995.002.002.26.41a.5.5 0 0 0 .886-.083l6-15Zm-1.833 1.89L6.637 10.07l-.215-.338a.5.5 0 0 0-.154-.154l-.338-.215 7.494-7.494 1.178-.471-.47 1.178Z"/>
              </svg>
            </div>

            <div className="relative z-10">
              <a
                href={`mailto:${email}?subject=${emailSubject}&body=${emailBody}`}
                className="cosmic-button w-full md:w-auto inline-flex items-center justify-center px-12 py-4 text-lg font-black tracking-tighter"
              >
                <span className="flex items-center gap-3">
                  {t.contact.sendEmail}
                  <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M14 5l7 7m0 0l-7 7m7-7H3" />
                  </svg>
                </span>
              </a>

              <div className="mt-12 space-y-6">
                <p className="text-gray-500 font-bold uppercase tracking-[0.2em] text-[10px]">
                  {t.contact.copyEmail}
                </p>

                <div className="flex items-center justify-center max-w-sm mx-auto">
                  <div className="flex-grow p-4 bg-black/20 rounded-l-2xl border border-white/10 font-mono text-sm text-gray-300">
                    {email}
                  </div>
                  <button
                    onClick={handleCopyEmail}
                    className="p-4 bg-white/5 rounded-r-2xl border-t border-r border-b border-white/10 hover:bg-white/10 transition-colors group/copy"
                  >
                    {copied ? (
                      <svg className="w-5 h-5 text-cyan-400 animate-pulse" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                      </svg>
                    ) : (
                      <svg className="w-5 h-5 text-gray-400 group-hover/copy:text-white transition-colors" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 16H6a2 2 0 01-2-2V6a2 2 0 012-2h8a2 2 0 012 2v2m-6 12h8a2 2 0 002-2v-8a2 2 0 00-2-2h-8a2 2 0 00-2 2v8a2 2 0 002 2z" />
                      </svg>
                    )}
                  </button>
                </div>
              </div>

              <div className="mt-16 flex justify-center space-x-8">
                <a
                  href="https://github.com/H1B0B0"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="w-12 h-12 rounded-full border border-white/5 bg-white/5 flex items-center justify-center text-gray-400 hover:text-white hover:border-white/20 transition-all duration-300"
                >
                  <svg className="w-6 h-6" fill="currentColor" viewBox="0 0 24 24">
                    <path fillRule="evenodd" d="M12 2C6.477 2 2 6.484 2 12.017c0 4.425 2.865 8.18 6.839 9.504.5.092.682-.217.682-.483 0-.237-.008-.868-.013-1.703-2.782.605-3.369-1.343-3.369-1.343-.454-1.158-1.11-1.466-1.11-1.466-.908-.62.069-.608.069-.608 1.003.07 1.531 1.032 1.531 1.032.892 1.53 2.341 1.088 2.91.832.092-.647.35-1.088.636-1.338-2.22-.253-4.555-1.113-4.555-4.951 0-1.093.39-1.988 1.029-2.688-.103-.253-.446-1.272.098-2.65 0 0 .84-.27 2.75 1.026A9.564 9.564 0 0112 6.844c.85.004 1.705.115 2.504.337 1.909-1.296 2.747-1.027 2.747-1.027.546 1.379.202 2.398.1 2.651.64.7 1.028 1.595 1.028 2.688 0 3.848-2.339 4.695-4.566 4.943.359.309.678.92.678 1.855 0 1.338-.012 2.419-.012 2.747 0 .268.18.58.688.482A10.019 10.019 0 0022 12.017C22 6.484 17.522 2 12 2z" clipRule="evenodd" />
                  </svg>
                </a>
                <a
                  href="https://www.linkedin.com/in/etiennementrel/"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="w-12 h-12 rounded-full border border-white/5 bg-white/5 flex items-center justify-center text-gray-400 hover:text-white hover:border-white/20 transition-all duration-300"
                >
                  <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 24 24">
                    <path d="M20.447 20.452h-3.554v-5.569c0-1.328-.027-3.037-1.852-3.037-1.853 0-2.136 1.445-2.136 2.939v5.667H9.351V9h3.414v1.561h.046c.477-.9 1.637-1.85 3.37-1.85 3.601 0 4.267 2.37 4.267 5.455v6.286zM5.337 7.433a2.062 2.062 0 01-2.063-2.065 2.064 2.064 0 112.063 2.065zm1.782 13.019H3.555V9h3.564v11.452zM22.225 0H1.771C.792 0 0 .774 0 1.729v20.542C0 23.227.792 24 1.771 24h20.451C23.2 24 24 23.227 24 22.271V1.729C24 .774 23.2 0 22.222 0h.003z" />
                  </svg>
                </a>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ContactSection;
