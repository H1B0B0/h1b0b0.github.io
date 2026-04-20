"use client";
import { useState } from "react";
import { motion } from "framer-motion";
import Image from "next/image";
import { useLanguage } from "@/i18n/LanguageContext";

const projects = [
  {
    id: 1,
    projectKey: "eclatShop",
    image: "/images/projects/EclatShop.png",
    tech: [
      "Symfony",
      "NextJS",
      "React",
      "Tailwind CSS",
      "TypeScript",
      "Docker",
    ],
    link: "https://github.com/H1B0B0/Eclatshop",
    featured: true,
    demo: undefined,
  },
  {
    id: 2,
    projectKey: "timeManager",
    image: "/images/projects/TimeManager.png",
    tech: ["Vue.js", "Docker", "Elixir"],
    link: "https://github.com/H1B0B0/Time-manager",
    featured: true,
    demo: undefined,
  },
  {
    id: 3,
    projectKey: "kuramaChat",
    image: "/images/projects/KuramaChat.png",
    tech: ["Node.js", "Express.js", "React.js", "Next.js", "IRC"],
    link: "https://github.com/H1B0B0/Kurama-chat",
    featured: true,
    demo: undefined,
  },
  {
    id: 4,
    projectKey: "rogueLike",
    image: "/images/projects/RogueLikeJava.png",
    tech: ["Java", "LibGDX"],
    link: "https://github.com/H1B0B0/Rogue-like-LibGDX",
    featured: false,
    demo: undefined,
  },
  {
    id: 5,
    projectKey: "twitchViewerBot",
    image: "/images/projects/TwitchViewerBot.png",
    tech: ["Python", "Flask", "React.js", "TypeScript"],
    link: "https://github.com/H1B0B0/twitch-Viewerbot",
    featured: false,
    demo: undefined,
  },
  {
    id: 6,
    projectKey: "kickViewerBot",
    image: "/images/projects/KickViewerBot.png",
    tech: ["Python", "Flask", "React.js", "TypeScript"],
    link: "https://github.com/H1B0B0/Kick-Viewerbot",
    featured: false,
    demo: undefined,
  },
];

const ProjectsSection = () => {
  const [filter, setFilter] = useState<"all" | "featured">("all");
  // Remove the unused variable but keep the function as it might be used elsewhere
  const [, setActiveProject] = useState<number | null>(null);
  const { t } = useLanguage();

  const filteredProjects =
    filter === "all" ? projects : projects.filter((p) => p.featured);

  return (
    <div className="py-10 md:py-0 overflow-hidden">
      <div className="max-w-6xl mx-auto">
        {/* Section Header */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6 }}
          viewport={{ once: true }}
          className="text-center mb-12"
        >
          <h2 className="text-3xl md:text-4xl font-bold mb-4 text-transparent bg-clip-text bg-gradient-to-r from-blue-400 to-purple-500">
            {t.projects.title}
          </h2>
          <p className="text-lg text-gray-300 max-w-2xl mx-auto">
            {t.projects.description}
          </p>

          {/* Filters */}
          <div className="flex justify-center gap-4 mt-6">
            <button
              className={`px-4 py-2 rounded-full transition ${
                filter === "all"
                  ? "bg-white/10 text-white"
                  : "bg-transparent text-gray-400 hover:text-white"
              }`}
              onClick={() => setFilter("all")}
            >
              {t.projects.allProjects}
            </button>
            <button
              className={`px-4 py-2 rounded-full transition ${
                filter === "featured"
                  ? "bg-white/10 text-white"
                  : "bg-transparent text-gray-400 hover:text-white"
              }`}
              onClick={() => setFilter("featured")}
            >
              {t.projects.featured}
            </button>
          </div>
        </motion.div>

        {/* Projects Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8 px-4">
          {filteredProjects.map((project, index) => (
            <motion.div
              key={project.id}
              initial={{ opacity: 0, y: 30 }}
              whileInView={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6, delay: index * 0.1 }}
              viewport={{ once: true }}
              whileHover={{ rotateY: 5, rotateX: -5, scale: 1.02 }}
              className="premium-card rounded-2xl overflow-hidden flex flex-col group cursor-default"
              onMouseEnter={() => setActiveProject(project.id)}
              onMouseLeave={() => setActiveProject(null)}
            >
              {/* Project Image Container */}
              <div className="w-full h-56 relative overflow-hidden">
                <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-transparent to-transparent z-10" />
                
                <Image
                  src={project.image || "/images/placeholder.jpg"}
                  alt={t.projects.projectsList[project.projectKey as keyof typeof t.projects.projectsList]?.title || "Project"}
                  layout="fill"
                  objectFit="cover"
                  className="transition-transform duration-700 ease-in-out group-hover:scale-110 grayscale-[0.5] group-hover:grayscale-0"
                />

                {/* Overlays and badges */}
                <div className="absolute top-4 left-4 z-20 flex gap-2">
                  {project.featured && (
                    <span className="px-3 py-1 rounded-full bg-violet-500/80 backdrop-blur-md text-[10px] font-bold text-white uppercase tracking-wider">
                      {t.projects.featured}
                    </span>
                  )}
                </div>

                {/* Tech chips overlay on image bottom */}
                <div className="absolute bottom-4 left-4 right-4 z-20 flex flex-wrap gap-2 opacity-0 group-hover:opacity-100 transition-opacity duration-300 translate-y-2 group-hover:translate-y-0">
                  {project.tech.slice(0, 3).map((tech) => (
                    <span key={tech} className="px-2 py-0.5 rounded-md bg-white/10 backdrop-blur-md border border-white/10 text-[10px] text-white/90">
                      {tech}
                    </span>
                  ))}
                  {project.tech.length > 3 && (
                    <span className="px-2 py-0.5 rounded-md bg-white/10 backdrop-blur-md border border-white/10 text-[10px] text-white/90">
                      +{project.tech.length - 3}
                    </span>
                  )}
                </div>
              </div>

              {/* Project Content */}
              <div className="p-6 flex-1 flex flex-col relative">
                <h3 className="text-xl font-black mb-2 tracking-tight group-hover:text-violet-400 transition-colors">
                  {t.projects.projectsList[project.projectKey as keyof typeof t.projects.projectsList]?.title}
                </h3>
                
                <p className="text-gray-400 text-sm mb-6 flex-1 leading-relaxed">
                  {t.projects.projectsList[project.projectKey as keyof typeof t.projects.projectsList]?.description}
                </p>

                {/* Footer Actions */}
                <div className="flex items-center justify-between mt-auto pt-4 border-t border-white/5">
                  <div className="flex gap-4">
                    <a
                      href={project.link}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="text-gray-400 hover:text-white transition-colors"
                      title={t.projects.viewCode}
                    >
                      <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" fill="currentColor" viewBox="0 0 16 16">
                        <path d="M8 0C3.58 0 0 3.58 0 8c0 3.54 2.29 6.53 5.47 7.59.4.07.55-.17.55-.38 0-.19-.01-.82-.01-1.49-2.01.37-2.53-.49-2.69-.94-.09-.23-.48-.94-.82-1.13-.28-.15-.68-.52-.01-.53.63-.01 1.08.58 1.23.82.72 1.21 1.87.87 2.33.66.07-.52.28-.87.51-1.07-1.78-.2-3.64-.89-3.64-3.95 0-.87.31-1.59.82-2.15-.08-.2-.36-1.02.08-2.12 0 0 .67-.21 2.2.82.64-.18 1.32-.27 2-.27.68 0 1.36.09 2 .27 1.53-1.04 2.2-.82 2.2-.82.44 1.1.16 1.92.08 2.12.51.56.82 1.27.82 2.15 0 3.07-1.87 3.75-3.65 3.95.29.25.54.73.54 1.48 0 1.07-.01 1.93-.01 2.2 0 .21.15.46.55.38A8.012 8.012 0 0 0 16 8c0-4.42-3.58-8-8-8z" />
                      </svg>
                    </a>
                    {project.demo && (
                      <a
                        href={project.demo}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="text-gray-400 hover:text-white transition-colors"
                        title={t.projects.demo}
                      >
                        <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" fill="currentColor" viewBox="0 0 16 16">
                          <path d="M8 0a8 8 0 1 0 8 8A8 8 0 0 0 8 0zM3.5 7.5a.5.5 0 0 1 .5-.5h8a.5.5 0 0 1 0 1H4a.5.5 0 0 1-.5-.5zM4 10a.5.5 0 0 1 .5-.5h5a.5.5 0 0 1 0 1h-5A.5.5 0 0 1 4 10z" />
                        </svg>
                      </a>
                    )}
                  </div>
                  
                  <motion.div
                    whileHover={{ x: 5 }}
                    className="flex items-center gap-1 text-[10px] font-bold text-violet-400 tracking-widest uppercase opacity-0 group-hover:opacity-100 transition-opacity"
                  >
                    Details <svg xmlns="http://www.w3.org/2000/svg" width="10" height="10" fill="currentColor" viewBox="0 0 16 16"><path fillRule="evenodd" d="M4.646 1.646a.5.5 0 0 1 .708 0l6 6a.5.5 0 0 1 0 .708l-6 6a.5.5 0 0 1-.708-.708L10.293 8 4.646 2.354a.5.5 0 0 1 0-.708z" /></svg>
                  </motion.div>
                </div>
              </div>

              {/* Decorative corner glow */}
              <div className="absolute -top-12 -right-12 w-24 h-24 bg-violet-500/10 rounded-full blur-2xl group-hover:bg-violet-500/20 transition-colors" />
            </motion.div>
          ))}
        </div>
      </div>
    </div>
  );
};

export default ProjectsSection;
