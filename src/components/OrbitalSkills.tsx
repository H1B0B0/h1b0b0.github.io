"use client";

import { skillData } from "@/data/skills";

export default function OrbitalSkills() {
  return (
    <div
      className="w-full max-w-2xl border-y border-white/10"
      data-skill-matrix
      aria-label="Compétences techniques par catégorie"
    >
      {skillData.map((category, categoryIndex) => (
        <section
          key={category.category}
          className="grid grid-cols-[6rem_1fr] gap-4 border-b border-white/[0.07] py-3 last:border-b-0 md:grid-cols-[8rem_1fr] md:gap-6 md:py-5"
          aria-labelledby={`skill-category-${categoryIndex}`}
        >
          <div className="flex items-baseline gap-2 pt-1">
            <span className="cinematic-mono text-[8px] tabular-nums text-white/20" aria-hidden="true">
              {String(categoryIndex + 1).padStart(2, "0")}
            </span>
            <h3
              id={`skill-category-${categoryIndex}`}
              className="cinematic-mono text-[9px] uppercase tracking-[0.18em] text-white/45 md:text-[10px]"
            >
              {category.category}
            </h3>
          </div>

          <ul className="flex flex-wrap items-start gap-2 md:justify-end">
            {category.skills.map((skill) => (
              <li
                key={skill.name}
                data-skill-item={skill.name}
                className="border border-white/10 bg-black/20 px-3 py-2 text-[10px] font-medium text-white/65 transition-colors duration-200 hover:border-white/25 hover:bg-white/[0.05] hover:text-white focus-within:border-white/30 md:text-xs"
              >
                {skill.name}
              </li>
            ))}
          </ul>
        </section>
      ))}
    </div>
  );
}
