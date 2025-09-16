"use client";
import { motion } from "framer-motion";
import Image from "next/image";
import { useLanguage } from "@/i18n/LanguageContext";

const AboutSection = () => {
  const { t } = useLanguage();

  return (
    <div className="py-10 md:py-0">
      <motion.div
        initial={{ opacity: 0 }}
        whileInView={{ opacity: 1 }}
        transition={{ duration: 0.8 }}
        viewport={{ once: true }}
        className="max-w-4xl mx-auto grid md:grid-cols-5 gap-8 items-center"
      >
        {/* Photo/Avatar */}
        <motion.div
          initial={{ opacity: 0, scale: 0.9 }}
          whileInView={{ opacity: 1, scale: 1 }}
          transition={{ duration: 0.8, delay: 0.2 }}
          viewport={{ once: true }}
          className="md:col-span-2 flex justify-center"
        >
          <div className="relative w-48 h-48 md:w-64 md:h-64 rounded-full overflow-hidden border-4 border-white/10 shadow-lg shadow-purple-500/20">
            {/* Enhanced glow effect behind the image */}
            <div className="absolute -inset-4 bg-gradient-to-r from-purple-600 to-blue-500 opacity-70 blur-xl rounded-full animate-pulse"></div>

            {/* Improved image container */}
            <div className="relative w-full h-full bg-gradient-to-br from-gray-900 to-gray-800 flex items-center justify-center z-10 rounded-full">
              <Image
                src="/avatar.jpg"
                alt="Etienne Mentrel"
                fill
                className="object-cover rounded-full"
                priority
              />
            </div>

            {/* Enhanced orbital rings */}
            <div
              className="absolute inset-0 border-4 border-transparent rounded-full animate-spin-slow"
              style={{
                borderLeftColor: "rgba(139, 92, 246, 0.5)",
                borderRightColor: "rgba(59, 130, 246, 0.3)",
                transformOrigin: "center",
                animation: "spin 15s linear infinite",
              }}
            ></div>

            {/* Second orbital ring */}
            <div
              className="absolute inset-0 border-2 border-transparent rounded-full animate-spin-slow"
              style={{
                borderTopColor: "rgba(219, 39, 119, 0.4)",
                borderBottomColor: "rgba(16, 185, 129, 0.3)",
                transformOrigin: "center",
                animation: "spin 10s linear infinite reverse",
                margin: "10px",
              }}
            ></div>
          </div>
        </motion.div>

        {/* About content */}
        <motion.div
          initial={{ opacity: 0, x: 30 }}
          whileInView={{ opacity: 1, x: 0 }}
          transition={{ duration: 0.8, delay: 0.4 }}
          viewport={{ once: true }}
          className="md:col-span-3"
        >
          <h2 className="text-3xl md:text-4xl font-bold mb-6 text-transparent bg-clip-text bg-gradient-to-r from-blue-400 to-purple-500">
            {t.about.title}
          </h2>

          <div className="text-lg text-gray-300 space-y-4">
            <h3 className="text-2xl md:text-2xl font-bold mb-6 text-transparent bg-clip-text bg-gradient-to-r from-blue-400 to-purple-500">
              {t.about.background}
            </h3>
            <p>{t.about.paragraph1}</p>
            <p>{t.about.paragraph2}</p>
            <p>{t.about.paragraph3}</p>
          </div>

          <div className="mt-8 flex gap-4 flex-wrap">
            <a
              href="https://cvdesignr.com/p/647b251d89bf4?hl=fr_FR"
              target="_blank"
              rel="noopener noreferrer"
              className="cosmic-button flex items-center gap-2"
            >
              <span>{t.about.downloadResume}</span>
            </a>

            <a
              href="https://github.com/H1B0B0"
              target="_blank"
              rel="noopener noreferrer"
              className="cosmic-button"
            >
              {t.about.githubProfile}
            </a>
          </div>
        </motion.div>
      </motion.div>
    </div>
  );
};

export default AboutSection;
