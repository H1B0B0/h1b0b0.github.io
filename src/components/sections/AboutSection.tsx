"use client";
import { motion } from "framer-motion";
import Image from "next/image";

const AboutSection = () => {
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
                src="/avatar.png"
                alt="Etienne Mentrel"
                fill
                sizes="(max-width: 768px) 12rem, 16rem"
                className="object-cover"
                priority
                quality={95}
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
            About Me
          </h2>

          <div className="text-lg text-gray-300 space-y-4">
            <h3 className="text-2xl md:text-2xl font-bold mb-6 text-transparent bg-clip-text bg-gradient-to-r from-blue-400 to-purple-500">
              My Background
            </h3>
            <p>
              I began my professional journey at the end of high school,
              participating in an apprenticeship program at a company
              specializing in RFID technology.
            </p>

            <p>
              During my initial training, I was not destined to become a
              developer but rather a higher-level technician. It was on the job
              that I learned Python. Subsequently, I undertook numerous Python
              projects for my company, leading me to transition into a developer
              role within the organization.
            </p>

            <p>
              After completing my DUT in Electrical Engineering and Industrial
              Computing, I discovered a strong passion for programming and
              decided to enroll at Epitech. Having successfully completed my
              pre-MSc year, I am now continuing my journey as an MSc 1 student
              at Epitech.
            </p>
          </div>

          <div className="mt-8 flex gap-4 flex-wrap">
            <a
              href="https://cvdesignr.com/p/647b251d89bf4?hl=fr_FR"
              target="_blank"
              rel="noopener noreferrer"
              className="cosmic-button flex items-center gap-2"
            >
              <span>Download Resume</span>
            </a>

            <a
              href="https://github.com/H1B0B0"
              target="_blank"
              rel="noopener noreferrer"
              className="cosmic-button"
            >
              GitHub Profile
            </a>
          </div>
        </motion.div>
      </motion.div>
    </div>
  );
};

export default AboutSection;
