export type SkillItem = {
  name: string;
  case: string;
  demoUrl?: string;
  codeUrl?: string;
};

export type SkillCategory = {
  category: string;
  skills: SkillItem[];
};

export const skillData: SkillCategory[] = [
  {
    category: "Frontend",
    skills: [
      { name: "React / Next.js", case: "Built high-performance, accessible SSR dashboards and marketing sites with App Router.", demoUrl: "#", codeUrl: "#" },
      { name: "Three.js / R3F", case: "Created immersive 3D WebGL experiences and interactive data visualizations.", demoUrl: "#", codeUrl: "#" },
      { name: "Tailwind CSS", case: "Developed comprehensive and responsive design systems and UI libraries.", demoUrl: "#", codeUrl: "#" }
    ]
  },
  {
    category: "Backend",
    skills: [
      { name: "Node.js / Express", case: "Architected RESTful and GraphQL APIs serving highly scalable platforms.", demoUrl: "#", codeUrl: "#" },
      { name: "Python / Django", case: "Implemented robust backend systems and data pipelines.", demoUrl: "#", codeUrl: "#" }
    ]
  },
  {
    category: "DevOps & Cloud",
    skills: [
      { name: "AWS / Docker", case: "Automated containerized deployments and optimized infrastructure for high availability.", demoUrl: "#", codeUrl: "#" },
      { name: "CI / CD", case: "Integrated seamless testing and delivery pipelines with GitHub Actions.", demoUrl: "#", codeUrl: "#" }
    ]
  }
];
