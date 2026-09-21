export interface Translation {
  experience: {
    edition: string;
    orientation: string;
    instruction: string;
    wheelHint: string;
    openSignal: string;
    backToMap: string;
    projectAngles: string;
    nodes: {
      bluevidia: { label: string; meta: string; description: string };
      profile: { label: string; meta: string; description: string };
      contact: { label: string; meta: string; description: string };
    };
  };
  intro: {
    eyebrow: string;
    title: string;
    emphasis: string;
    description: string;
    primaryCta: string;
    secondaryCta: string;
    availability: string;
  };
  featured: {
    eyebrow: string;
    status: string;
    title: string;
    subtitle: string;
    description: string;
    role: string;
    roleValue: string;
    stack: string;
    stackValue: string;
    year: string;
    challenge: string;
    challengeText: string;
    approach: string;
    approachText: string;
    outcome: string;
    outcomeText: string;
    visit: string;
    live: string;
  };
  profile: {
    eyebrow: string;
    title: string;
    description: string;
    proofTitle: string;
    proofItems: string[];
    capabilitiesTitle: string;
    capabilities: string[];
    contactTitle: string;
    contactDescription: string;
    email: string;
    resume: string;
    github: string;
  };
  common: {
    loading: string;
  };
  cinematic: {
    acts: {
      genesis: string;
      constellations: string;
      signal: string;
    };
    scrollHint: string;
    actCounter: string;
  };
}

export const translations: Record<string, Translation> = {
  en: {
    experience: {
      edition: "Spatial portfolio · 2026",
      orientation: "Choose a signal",
      instruction: "Move the lens. Bring a world into focus.",
      wheelHint: "Wheel · arrows · tap",
      openSignal: "Enter this space",
      backToMap: "Back to the map",
      projectAngles: "Change the angle",
      nodes: {
        bluevidia: {
          label: "BlueVidia",
          meta: "Featured work · Live",
          description: "An audiovisual identity turned into a living web experience.",
        },
        profile: {
          label: "Profile",
          meta: "Approach · Capabilities",
          description: "The person, the systems and the way I build.",
        },
        contact: {
          label: "Contact",
          meta: "New work · Conversation",
          description: "Start with the feeling. Then choose the technology.",
        },
      },
    },
    intro: {
      eyebrow: "Creative developer · DevOps engineer",
      title: "I build digital experiences",
      emphasis: "worth remembering.",
      description:
        "From the first idea to production, I combine creative development, motion and reliable engineering to give ambitious brands a distinctive online presence.",
      primaryCta: "Discover BlueVidia",
      secondaryCta: "About me",
      availability: "Available for selected projects",
    },
    featured: {
      eyebrow: "Featured project · 01",
      status: "Live experience",
      title: "BlueVidia",
      subtitle: "An audiovisual studio deserved a website that moves like an image.",
      description:
        "I designed and developed an immersive showcase for BlueVidia: a cinematic, sound-aware experience that turns the studio's craft into a digital journey.",
      role: "Role",
      roleValue: "Design & development",
      stack: "Core",
      stackValue: "Next.js · Three.js · GLSL",
      year: "2026",
      challenge: "01 · Challenge",
      challengeText: "Translate a premium audiovisual identity without building another static agency site.",
      approach: "02 · Approach",
      approachText: "Use rhythm, sound and real-time visual matter as part of the narrative — never as decoration.",
      outcome: "03 · Result",
      outcomeText: "A responsive, live experience built around the studio's films, photography and point of view.",
      visit: "Visit the live website",
      live: "Live now",
    },
    profile: {
      eyebrow: "Profile · Selected craft",
      title: "One strong proof beats six forgettable thumbnails.",
      description:
        "I am Etienne Mentrel, a developer trained across software, infrastructure and interactive web. I like projects where the technical system and the visual idea have to work as one.",
      proofTitle: "What BlueVidia demonstrates",
      proofItems: [
        "A clear creative direction carried through to production",
        "Real-time WebGL built for desktop and mobile",
        "Performance, accessibility and deployment treated as design constraints",
      ],
      capabilitiesTitle: "Capabilities",
      capabilities: [
        "Creative development",
        "Next.js & React",
        "Three.js & GLSL",
        "Motion systems",
        "Cloud & DevOps",
        "Production delivery",
      ],
      contactTitle: "Have a project that deserves more than a template?",
      contactDescription: "Tell me what you want people to feel. We can work out the technology from there.",
      email: "Start a conversation",
      resume: "View resume",
      github: "GitHub profile",
    },
    common: {
      loading: "Preparing the experience",
    },
    cinematic: {
      acts: {
        genesis: "Profile",
        constellations: "BlueVidia",
        signal: "Contact",
      },
      scrollHint: "Scroll to explore",
      actCounter: "{current} / {total}",
    },
  },
  fr: {
    experience: {
      edition: "Portfolio spatial · 2026",
      orientation: "Choisissez un signal",
      instruction: "Déplacez la lentille. Mettez un univers au point.",
      wheelHint: "Molette · flèches · toucher",
      openSignal: "Explorer",
      backToMap: "Retour à la carte",
      projectAngles: "Changer d'angle",
      nodes: {
        bluevidia: {
          label: "BlueVidia",
          meta: "Projet phare · En ligne",
          description: "Une identité audiovisuelle transformée en expérience web vivante.",
        },
        profile: {
          label: "Profil",
          meta: "Approche · Savoir-faire",
          description: "La personne, les systèmes et ma manière de construire.",
        },
        contact: {
          label: "Contact",
          meta: "Nouveau projet · Échange",
          description: "Commencer par l'émotion, puis choisir la technologie.",
        },
      },
    },
    intro: {
      eyebrow: "Développeur créatif · Ingénieur DevOps",
      title: "Je crée des expériences digitales",
      emphasis: "qui restent en tête.",
      description:
        "De la première idée à la mise en production, je réunis développement créatif, mouvement et ingénierie fiable pour donner aux projets ambitieux une vraie présence en ligne.",
      primaryCta: "Découvrir BlueVidia",
      secondaryCta: "Mon profil",
      availability: "Disponible pour des projets sélectionnés",
    },
    featured: {
      eyebrow: "Projet phare · 01",
      status: "Expérience en ligne",
      title: "BlueVidia",
      subtitle: "Un studio audiovisuel méritait un site qui bouge comme une image.",
      description:
        "J'ai conçu et développé pour BlueVidia une vitrine immersive : une expérience cinématographique et sonore qui transforme le savoir-faire du studio en parcours digital.",
      role: "Rôle",
      roleValue: "Design & développement",
      stack: "Socle",
      stackValue: "Next.js · Three.js · GLSL",
      year: "2026",
      challenge: "01 · Enjeu",
      challengeText: "Traduire une identité audiovisuelle premium sans produire un énième site d'agence statique.",
      approach: "02 · Réponse",
      approachText: "Faire du rythme, du son et de la matière visuelle en temps réel une partie du récit — jamais un décor gratuit.",
      outcome: "03 · Résultat",
      outcomeText: "Une expérience responsive en ligne, construite autour des films, des photographies et du regard du studio.",
      visit: "Visiter le site en ligne",
      live: "En ligne",
    },
    profile: {
      eyebrow: "Profil · Savoir-faire sélectionné",
      title: "Une preuve forte vaut mieux que six vignettes oubliables.",
      description:
        "Je suis Etienne Mentrel, développeur formé au logiciel, à l'infrastructure et au web interactif. J'aime les projets où le système technique et l'idée visuelle doivent fonctionner comme un tout.",
      proofTitle: "Ce que BlueVidia démontre",
      proofItems: [
        "Une direction créative cohérente, de l'idée à la production",
        "Du WebGL temps réel pensé pour ordinateur et mobile",
        "Performance, accessibilité et déploiement traités comme des contraintes de design",
      ],
      capabilitiesTitle: "Savoir-faire",
      capabilities: [
        "Développement créatif",
        "Next.js & React",
        "Three.js & GLSL",
        "Systèmes de mouvement",
        "Cloud & DevOps",
        "Mise en production",
      ],
      contactTitle: "Un projet qui mérite mieux qu'un template ?",
      contactDescription: "Dis-moi ce que tu veux faire ressentir. On trouvera ensuite la bonne technologie.",
      email: "Démarrer une conversation",
      resume: "Voir mon CV",
      github: "Profil GitHub",
    },
    common: {
      loading: "Préparation de l'expérience",
    },
    cinematic: {
      acts: {
        genesis: "Profil",
        constellations: "BlueVidia",
        signal: "Contact",
      },
      scrollHint: "Défilez pour explorer",
      actCounter: "{current} / {total}",
    },
  },
};
