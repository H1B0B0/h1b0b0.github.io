"use client";
import { motion } from "framer-motion";

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
            {/* Add your image here */}
            <div className="w-full h-full bg-gradient-to-br from-purple-600 to-blue-500 flex items-center justify-center text-4xl font-bold">
              EM
            </div>

            {/* Orbital ring decoration */}
            <div
              className="absolute inset-0 border-4 border-transparent rounded-full animate-spin-slow"
              style={{
                borderLeftColor: "rgba(139, 92, 246, 0.5)",
                borderRightColor: "rgba(59, 130, 246, 0.3)",
                transformOrigin: "center",
                animation: "spin 15s linear infinite",
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
            <p>
              I'm a passionate software developer with 5+ years of experience
              crafting digital experiences that are both functional and
              beautiful. My journey in tech started with a curiosity about how
              things work, which evolved into a career building solutions that
              make a difference.
            </p>

            <p>
              Specializing in front-end development with React and Next.js, I
              create responsive, accessible, and performant applications. I'm
              also experienced in back-end development with Node.js and Python.
            </p>

            <p>
              When I'm not coding, you'll find me exploring new technologies,
              contributing to open-source projects, or stargazing – both
              literally and in the form of dreaming up new digital creations.
            </p>
          </div>

          <div className="mt-8 flex gap-4 flex-wrap">
            <a
              href="/resume.pdf"
              target="_blank"
              rel="noopener noreferrer"
              className="cosmic-button flex items-center gap-2"
            >
              <span>Download Resume</span>
              <svg
                xmlns="http://www.w3.org/2000/svg"
                width="16"
                height="16"
                fill="currentColor"
                viewBox="0 0 16 16"
              >
                <path d="M8 15A7 7 0 1 1 8 1a7 7 0 0 1 0 14zm0 1A8 8 0 1 0 8 0a8 8 0 0 0 0 16z" />
                <path d="M6.5 5a.5.5 0 0 1 .5.5v3.793l1.146-1.147a.5.5 0 0 1 .708.708l-2 2a.5.5 0 0 1-.708 0l-2-2a.5.5 0 1 1 .708-.708L5.5 9.293V5.5a.5.5 0 0 1 .5-.5z" />
              </svg>
            </a>

            <a
              href="https://github.com/yourusername"
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
