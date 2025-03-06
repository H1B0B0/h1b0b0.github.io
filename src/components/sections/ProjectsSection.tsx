"use client";
import { useState, useEffect, useRef } from "react";
import Image from "next/image";

interface Project {
  id: number;
  title: string;
  description: string;
  technologies: string[];
  imageSrc: string;
  link: string;
}

const projects: Project[] = [
  {
    id: 1,
    title: "Cosmic Explorer",
    description:
      "An interactive 3D visualization of the cosmos using Three.js and WebGL.",
    technologies: ["Next.js", "Three.js", "WebGL", "GSAP"],
    imageSrc: "/placeholder-project.jpg",
    link: "#",
  },
  {
    id: 2,
    title: "Nebula Analytics",
    description:
      "A dashboard for visualizing complex data sets with interactive charts and filters.",
    technologies: ["React", "D3.js", "Node.js", "MongoDB"],
    imageSrc: "/placeholder-project.jpg",
    link: "#",
  },
  {
    id: 3,
    title: "Stellar E-commerce",
    description:
      "A full-stack e-commerce platform with a focus on user experience and performance.",
    technologies: ["Vue.js", "Express", "PostgreSQL", "Stripe API"],
    imageSrc: "/placeholder-project.jpg",
    link: "#",
  },
];

const ProjectsSection = () => {
  const [activeProject, setActiveProject] = useState<number | null>(null);
  const sectionRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const observer = new IntersectionObserver(
      (entries) => {
        if (entries[0].isIntersecting && activeProject === null) {
          setActiveProject(1);
        }
      },
      { threshold: 0.3 }
    );

    if (sectionRef.current) {
      observer.observe(sectionRef.current);
    }

    return () => {
      if (sectionRef.current) {
        observer.unobserve(sectionRef.current);
      }
    };
  }, [activeProject]);

  return (
    <div ref={sectionRef} className="container mx-auto px-6 py-12">
      <h2 className="text-4xl font-bold mb-12 text-center">
        My Cosmic{" "}
        <span className="bg-gradient-to-r from-purple-400 to-blue-500 bg-clip-text text-transparent">
          Projects
        </span>
      </h2>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
        {projects.map((project) => (
          <div
            key={project.id}
            className={`bg-black/40 backdrop-blur-md rounded-xl overflow-hidden border border-white/10 transform transition-all duration-500 hover:scale-105 ${
              activeProject === project.id ? "scale-105 border-white/30" : ""
            }`}
            onMouseEnter={() => setActiveProject(project.id)}
          >
            <div className="relative h-48 w-full bg-gradient-to-br from-indigo-900 via-blue-800 to-purple-900">
              {/* Replace with actual project images when available */}
              <div className="absolute inset-0 flex items-center justify-center text-xl font-bold">
                Project Preview
              </div>
            </div>

            <div className="p-6">
              <h3 className="text-xl font-bold mb-2">{project.title}</h3>
              <p className="text-gray-300 mb-4">{project.description}</p>

              <div className="flex flex-wrap gap-2 mb-6">
                {project.technologies.map((tech, index) => (
                  <span
                    key={index}
                    className="px-3 py-1 text-xs rounded-full bg-white/10 text-white/80"
                  >
                    {tech}
                  </span>
                ))}
              </div>

              <a
                href={project.link}
                className="cosmic-button text-sm inline-block"
                target="_blank"
                rel="noopener noreferrer"
              >
                Explore Project
              </a>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

export default ProjectsSection;
