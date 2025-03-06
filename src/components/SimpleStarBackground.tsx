"use client";
import { useEffect, useState, useRef } from "react";
import styles from "./SimpleStarBackground.module.css";

interface SimpleStarBackgroundProps {
  scrollY: number;
  isScrolling: boolean;
}

// Génération des étoiles une seule fois en dehors du composant
const totalStars = 300;
const stars = Array.from({ length: totalStars }, () => ({
  top: Math.random() * 100, // position verticale en %
  left: Math.random() * 100, // position horizontale en %
  size: Math.random() * 3 + 1, // taille entre 1 et 4px
  opacity: Math.random() * 0.7 + 0.3, // opacité entre 0.3 et 1
  delay: Math.random() * 5, // délai pour les animations
  speed: Math.random() * 5 + 3, // vitesse d'animation entre 3 et 8s
  isGlowing: Math.random() > 0.8, // 20% des étoiles sont plus brillantes
}));

const SimpleStarBackground: React.FC<SimpleStarBackgroundProps> = ({
  scrollY,
  isScrolling,
}) => {
  // Références pour stocker les étoiles qui s'animent
  const activeStarsRef = useRef<Set<number>>(new Set());
  const starElementsRef = useRef<(HTMLDivElement | null)[]>([]);
  const lastScrollY = useRef(0);
  const scrollDirection = useRef(0);
  const scrollSpeed = useRef(0);
  const [key, setKey] = useState(0); // Pour forcer la réinitialisation si nécessaire

  // Effet pour l'initialisation
  useEffect(() => {
    console.log("Star background initialized");
    starElementsRef.current = new Array(totalStars).fill(null);

    // Force une réinitialisation après 1s pour résoudre les problèmes potentiels
    const timer = setTimeout(() => {
      setKey((prev) => prev + 1);
    }, 1000);

    return () => clearTimeout(timer);
  }, []);

  // Effet pour réagir au défilement
  useEffect(() => {
    // Déterminer la direction du défilement
    const delta = scrollY - lastScrollY.current;
    if (Math.abs(delta) > 0.5) {
      scrollDirection.current = Math.sign(delta);
    }
    lastScrollY.current = scrollY;

    // Déterminer la vitesse de défilement
    if (isScrolling) {
      scrollSpeed.current = Math.min(1.0, scrollSpeed.current + 0.1);
    } else {
      scrollSpeed.current = Math.max(0, scrollSpeed.current * 0.95);
    }

    // Animation lors du défilement
    if (isScrolling && starElementsRef.current) {
      // Nombre d'étoiles à animer (proportionnel à la vitesse)
      const starsToAnimate = Math.min(
        60, // Augmenté pour plus d'étoiles animées
        Math.floor(10 + scrollSpeed.current * 50)
      );

      // Animer aléatoirement des étoiles
      for (let i = 0; i < starsToAnimate; i++) {
        // Choisir aléatoirement une étoile qui n'est pas déjà animée
        let randomIndex;
        let attempts = 0;
        do {
          randomIndex = Math.floor(Math.random() * totalStars);
          attempts++;
        } while (activeStarsRef.current.has(randomIndex) && attempts < 30);

        if (attempts < 30) {
          const starElement = starElementsRef.current[randomIndex];
          if (starElement) {
            // Ajouter à la liste des étoiles actives
            activeStarsRef.current.add(randomIndex);

            // Réinitialiser les transitions pour éviter les conflits
            starElement.style.transition = "none";

            // Facteur d'étirement beaucoup plus important et hauteur plus fine
            const stretchFactor = 12 + scrollSpeed.current * 15; // Augmenté significativement (était 8 + 12)
            const moveDistance = 60 + Math.random() * 80; // Distance plus grande (était 50 + 50)

            // Largeur réduite pour un trait plus fin
            const starWidth = Math.max(0.6, stars[randomIndex].size * 0.4); // Plus fin (réduction de 60%)

            // Couleur et styles selon la direction
            if (scrollDirection.current > 0) {
              // Défilement vers le bas: traînée violette vers le haut
              starElement.className = `${styles.star} ${styles.stretchUp}`;
              starElement.style.setProperty("--size", `${starWidth}px`); // Largeur réduite
              starElement.style.setProperty("--stretch", `${stretchFactor}`);
              starElement.style.setProperty("--distance", `${moveDistance}px`);
              starElement.style.backgroundColor = "rgba(200, 140, 255, 0.95)";
              starElement.style.boxShadow =
                "0 -20px 30px 2px rgba(180, 120, 255, 0.6)"; // Ombre plus longue
            } else {
              // Défilement vers le haut: traînée bleue vers le bas
              starElement.className = `${styles.star} ${styles.stretchDown}`;
              starElement.style.setProperty("--size", `${starWidth}px`); // Largeur réduite
              starElement.style.setProperty("--stretch", `${stretchFactor}`);
              starElement.style.setProperty("--distance", `${moveDistance}px`);
              starElement.style.backgroundColor = "rgba(120, 210, 255, 0.95)";
              starElement.style.boxShadow =
                "0 20px 30px 2px rgba(100, 200, 255, 0.6)"; // Ombre plus longue
            }

            // Forcer un reflow pour que les animations démarrent immédiatement
            void starElement.offsetWidth;

            // Réinitialiser l'état après l'animation - temps allongé pour laisser l'animation se terminer
            setTimeout(() => {
              if (starElement) {
                // Transition douce avec curve d'easing pour une décélération naturelle
                starElement.className = styles.star;
                starElement.style.transition =
                  "all 1.5s cubic-bezier(0.1, 0.7, 0.1, 1)"; // Courbe modifiée pour plus de naturel
                starElement.style.backgroundColor = stars[randomIndex].isGlowing
                  ? "rgba(255, 255, 255, 0.9)"
                  : "rgba(255, 255, 255, 0.7)";
                starElement.style.boxShadow = stars[randomIndex].isGlowing
                  ? "0 0 8px 2px rgba(255, 255, 255, 0.5)"
                  : "none";
                starElement.style.width = `${stars[randomIndex].size}px`;
                starElement.style.height = `${stars[randomIndex].size}px`;
                starElement.style.borderRadius = "50%";

                // Retirer de la liste active après complétion
                setTimeout(() => {
                  activeStarsRef.current.delete(randomIndex);
                }, 1500); // Augmenté pour correspondre à la transition plus longue
              }
            }, 700); // Augmenté pour laisser plus de temps à l'animation d'étirement
          }
        }
      }
    }
  }, [scrollY, isScrolling]);

  return (
    <div className={styles.starBackground} key={key}>
      {stars.map((star, index) => (
        <div
          key={index}
          ref={(el) => (starElementsRef.current[index] = el)}
          className={styles.star}
          style={{
            top: `${star.top}%`,
            left: `${star.left}%`,
            width: `${star.size}px`,
            height: `${star.size}px`,
            opacity: star.opacity,
            backgroundColor: star.isGlowing
              ? "rgba(255, 255, 255, 0.9)"
              : "rgba(255, 255, 255, 0.7)",
            boxShadow: star.isGlowing
              ? "0 0 8px 2px rgba(255, 255, 255, 0.5)"
              : "none",
            animation: star.isGlowing
              ? `${styles.pulse} ${star.speed}s infinite ease-in-out ${star.delay}s`
              : "none",
            // Suppression de la transition initiale pour éviter les conflits
          }}
        />
      ))}
    </div>
  );
};

export default SimpleStarBackground;
