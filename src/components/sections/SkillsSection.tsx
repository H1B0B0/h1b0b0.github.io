"use client";
import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { useLanguage } from "@/i18n/LanguageContext";

interface Skill {
  name: string;
  level: number; // 1-5
  category: string;
  icon?: string;
}

const skills: Skill[] = [
  // Frontend
  { name: "HTML/CSS", level: 5, category: "Frontend" },
  { name: "JavaScript", level: 4, category: "Frontend" },
  { name: "TypeScript", level: 4, category: "Frontend" },
  { name: "React", level: 4, category: "Frontend" },
  { name: "Tailwind CSS", level: 5, category: "Frontend" },

  // Backend
  { name: "NestJS", level: 4, category: "Backend" },
  { name: "MongoDB", level: 5, category: "Backend" },
  { name: "PostgreSQL", level: 5, category: "Backend" },
  { name: "Golang", level: 2, category: "Backend" },

  // Tools
  { name: "Git", level: 5, category: "Tools" },
  { name: "Docker", level: 5, category: "Tools" },
  { name: "CI/CD", level: 5, category: "Tools" },
  { name: "Linux", level: 4, category: "Tools" },
  { name: "Kubernetes", level: 4, category: "Tools" },

  // Cloud
  { name: "AWS", level: 4, category: "Cloud" },
  { name: "Scaleway", level: 3, category: "Cloud" },
];

const categories = ["All", "Frontend", "Backend", "Tools", "Cloud"];

const SkillsSection = () => {
  const [activeCategory, setActiveCategory] = useState("All");
  const { t } = useLanguage();

  // Mapping des catégories pour les traductions
  const categoryMapping: { [key: string]: string } = {
    All: t.skills.categories.all,
    Frontend: t.skills.categories.frontend,
    Backend: t.skills.categories.backend,
    Tools: t.skills.categories.tools,
    Cloud: t.skills.categories.cloud,
  };

  const filteredSkills = skills.filter(
    (skill) => activeCategory === "All" || skill.category === activeCategory
  );

  const titleParts = t.skills.title ? t.skills.title.split(" ") : ["My", "Skills"];
  const firstWord = titleParts[0];
  const restOfTitle = titleParts.slice(1).join(" ");

  return (
    <div className="container mx-auto px-6 py-12">
      <h2 className="text-4xl font-bold mb-8 text-center text-white">
        {firstWord}{" "}
        <span className="text-gradient-premium">
          {restOfTitle}
        </span>
      </h2>

      {/* Category filters */}
      <div className="flex flex-wrap justify-center mb-16 gap-2">
        {categories.map((category) => (
          <button
            key={category}
            onClick={() => setActiveCategory(category)}
            className={`px-4 py-2 rounded-full transition-all duration-300 ${
              activeCategory === category
                ? "bg-gradient-to-r from-purple-600 to-blue-600 text-white"
                : "bg-white/10 text-gray-300 hover:bg-white/20"
            }`}
          >
            {categoryMapping[category]}
          </button>
        ))}
      </div>

      {/* Skills grid */}
      <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4 md:gap-6">
        <AnimatePresence mode="popLayout">
          {filteredSkills && filteredSkills.length > 0 ? (
            filteredSkills.map((skill, index) => {
              if (!skill || !skill.name) return null;
              
              return (
                <motion.div
                  key={`${skill.category}-${skill.name}`}
                  initial={{ opacity: 0, scale: 0.9, y: 20 }}
                  animate={{ opacity: 1, scale: 1, y: 0 }}
                  exit={{ opacity: 0, scale: 0.9, transition: { duration: 0.2 } }}
                  transition={{ duration: 0.4, delay: index * 0.05 }}
                  className="premium-card rounded-xl p-6 group hover:border-violet-500/50"
                >
                  <div className="flex flex-col items-center text-center">
                    <div className="w-12 h-12 rounded-2xl bg-violet-500/10 flex items-center justify-center text-xl mb-4 group-hover:bg-violet-500/20 transition-colors shadow-inner border border-white/5 text-violet-400 font-bold">
                      {skill.icon || skill.name.charAt(0)}
                    </div>
                    <h4 className="text-sm font-black tracking-tighter mb-1 group-hover:text-violet-400 transition-colors uppercase">
                      {skill.name}
                    </h4>
                    <p className="text-[10px] text-gray-500 font-medium uppercase tracking-widest mb-4">
                      {categoryMapping && skill.category ? (categoryMapping[skill.category] || skill.category) : skill.category}
                    </p>
                    
                    <div className="w-full h-1 bg-white/5 rounded-full overflow-hidden">
                      <motion.div
                        initial={{ width: 0 }}
                        whileInView={{ width: `${(Math.min(Math.max(skill.level || 0, 0), 5) / 5) * 100}%` }}
                        transition={{ duration: 1, delay: 0.5 }}
                        className="h-full bg-gradient-to-r from-violet-500 to-cyan-500 shadow-[0_0_10px_rgba(139,92,246,0.5)]"
                      />
                    </div>
                  </div>
                </motion.div>
              );
            })
          ) : (
            <div className="col-span-full py-20 text-center text-gray-500 font-mono text-sm uppercase tracking-widest">
              No skills found in this category
            </div>
          )}
        </AnimatePresence>
      </div>

      <div className="mt-16 text-center">
        <p className="text-lg text-gray-300 max-w-2xl mx-auto mb-8">
          {t.skills.description}
        </p>
        <a href="#projects" className="cosmic-button inline-block">
          {t.skills.seeInAction}
        </a>
      </div>
    </div>
  );
};

export default SkillsSection;
