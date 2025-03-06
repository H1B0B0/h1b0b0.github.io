"use client";
import { useEffect, useRef } from "react";
import * as THREE from "three";

interface CosmicBackgroundProps {
  scrollY: number;
  isScrolling: boolean;
}

const CosmicBackground: React.FC<CosmicBackgroundProps> = ({
  scrollY,
  isScrolling,
}) => {
  // Refs de base
  const canvasRef = useRef<HTMLDivElement>(null);
  const rendererRef = useRef<THREE.WebGLRenderer | null>(null);
  const sceneRef = useRef<THREE.Scene | null>(null);
  const cameraRef = useRef<THREE.PerspectiveCamera | null>(null);
  const starsRef = useRef<THREE.Points | null>(null);
  const nebulaRef = useRef<THREE.Mesh | null>(null);
  const frameIdRef = useRef<number>(0);
  const lastScrollYRef = useRef<number>(0);
  const scrollDirectionRef = useRef<number>(0);
  const scrollSpeedRef = useRef<number>(0);
  const lastTimestampRef = useRef<number>(0);
  const initialStarPositionsRef = useRef<Float32Array | null>(null);

  // Nouveau: refs simplifiés pour l'animation
  const scrollVelocityRef = useRef<number>(0);
  const activeShotsRef = useRef<
    Array<{ index: number; timer: number; direction: number }>
  >([]);

  // Constantes
  const starCount = 7000;
  const starSize = 2.5; // Augmentation de la taille de base des étoiles
  const trailStrength = 25.0; // Augmentation de la longueur des traînées (était 15.0)
  const maxTrails = 50; // Plus d'étoiles filantes simultanées (était 30)
  const trailProbability = 0.5; // Plus de chances de créer des traînées (était 0.7)

  useEffect(() => {
    if (!canvasRef.current) return;

    // Configuration de la scène THREE.js
    const scene = new THREE.Scene();
    sceneRef.current = scene;

    const camera = new THREE.PerspectiveCamera(
      75,
      window.innerWidth / window.innerHeight,
      0.1,
      1000
    );
    camera.position.z = 5;
    cameraRef.current = camera;

    const renderer = new THREE.WebGLRenderer({
      antialias: true,
      alpha: true,
      powerPreference: "high-performance",
    });
    renderer.setSize(window.innerWidth, window.innerHeight);
    renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
    canvasRef.current.appendChild(renderer.domElement);
    rendererRef.current = renderer;

    // Configuration simple des étoiles
    const starGeometry = new THREE.BufferGeometry();
    const positions = new Float32Array(starCount * 3);
    const sizes = new Float32Array(starCount);
    const colors = new Float32Array(starCount * 3);
    const velocities = new Float32Array(starCount * 3); // Pour l'animation de défilement

    // Générer des positions d'étoiles aléatoires dans un champ sphérique
    for (let i = 0; i < starCount; i++) {
      const i3 = i * 3;

      // Position aléatoire dans une sphère étendue
      const radius = 50 + Math.random() * 50;
      const theta = Math.random() * Math.PI * 2;
      const phi = Math.acos(2 * Math.random() - 1);

      positions[i3] = radius * Math.sin(phi) * Math.cos(theta);
      positions[i3 + 1] = radius * Math.sin(phi) * Math.sin(theta);
      positions[i3 + 2] = radius * Math.cos(phi);

      // Taille variable des étoiles
      sizes[i] = starSize * (0.5 + Math.random() * 1.0);

      // Couleur des étoiles (blanc/bleu pâle)
      const r = 0.8 + Math.random() * 0.2;
      const g = 0.8 + Math.random() * 0.2;
      const b = 0.9 + Math.random() * 0.1;
      colors[i3] = r;
      colors[i3 + 1] = g;
      colors[i3 + 2] = b;

      // Vitesses aléatoires pour l'animation
      velocities[i3] = (Math.random() - 0.5) * 0.02;
      velocities[i3 + 1] = (Math.random() - 0.5) * 0.02;
      velocities[i3 + 2] = (Math.random() - 0.5) * 0.02;
    }

    // Sauvegarder les positions initiales
    initialStarPositionsRef.current = new Float32Array(positions);

    starGeometry.setAttribute(
      "position",
      new THREE.BufferAttribute(positions, 3)
    );
    starGeometry.setAttribute("size", new THREE.BufferAttribute(sizes, 1));
    starGeometry.setAttribute("color", new THREE.BufferAttribute(colors, 3));

    // Shader simple pour les étoiles avec effet de brillance
    const starShader = {
      vertexShader: `
        attribute float size;
        attribute vec3 color;
        varying vec3 vColor;
        uniform float time;
        void main() {
          vColor = color;
          vec4 mvPosition = modelViewMatrix * vec4(position, 1.0);
          gl_PointSize = size * (200.0 / -mvPosition.z) * (1.0 + 0.2 * sin(time + position.x * 5.0));
          gl_Position = projectionMatrix * mvPosition;
        }
      `,
      fragmentShader: `
        varying vec3 vColor;
        void main() {
          float distToCenter = length(gl_PointCoord - vec2(0.5));
          if(distToCenter > 0.5) discard;
          float alpha = smoothstep(0.5, 0.1, distToCenter);
          gl_FragColor = vec4(vColor, alpha);
        }
      `,
    };

    const starMaterial = new THREE.ShaderMaterial({
      uniforms: {
        time: { value: 0.0 },
      },
      vertexShader: starShader.vertexShader,
      fragmentShader: starShader.fragmentShader,
      transparent: true,
      blending: THREE.AdditiveBlending,
      depthTest: false,
    });

    const stars = new THREE.Points(starGeometry, starMaterial);
    scene.add(stars);
    starsRef.current = stars;

    // Animation loop
    let time = 0;
    const clock = new THREE.Clock();

    const animate = () => {
      frameIdRef.current = requestAnimationFrame(animate);

      const delta = Math.min(clock.getDelta(), 0.1);
      time += delta;

      if (starMaterial.uniforms) {
        starMaterial.uniforms.time.value = time;
      }

      if (starsRef.current) {
        // Rotation de base
        starsRef.current.rotation.y += delta * 0.05;

        // Animation réactive lors du défilement
        if (isScrolling) {
          // Inclinaison plus prononcée selon la direction
          const targetTilt =
            scrollDirectionRef.current * 0.2 * scrollSpeedRef.current;
          starsRef.current.rotation.x +=
            (targetTilt - starsRef.current.rotation.x) * 0.15;

          // Rotation accélérée pendant le défilement
          starsRef.current.rotation.y += delta * scrollSpeedRef.current * 0.4;

          // Créer PLUSIEURS étoiles filantes à chaque frame pendant le défilement
          const trailCount = Math.floor(1 + scrollSpeedRef.current * 3); // Plus de traînées à vitesse élevée
          for (let i = 0; i < trailCount; i++) {
            if (Math.random() > trailProbability) {
              createShootingStar(scrollDirectionRef.current);
            }
          }
        } else {
          // Retour progressif à l'inclinaison neutre
          starsRef.current.rotation.x *= 0.92; // Plus rapide
        }

        // Mise à jour des étoiles filantes
        updateShootingStars(delta);
      }

      // Rendu de la scène
      if (rendererRef.current && sceneRef.current && cameraRef.current) {
        rendererRef.current.render(sceneRef.current, cameraRef.current);
      }
    };

    animate();

    // Nettoyage
    return () => {
      cancelAnimationFrame(frameIdRef.current);
      if (rendererRef.current && canvasRef.current) {
        canvasRef.current.removeChild(renderer.domElement);
      }
    };
  }, [starSize, trailStrength]);

  // Fonction pour créer une nouvelle étoile filante - version améliorée
  const createShootingStar = (direction: number) => {
    if (!starsRef.current || activeShotsRef.current.length > maxTrails) return;

    const geometry = starsRef.current.geometry;
    const positions = geometry.attributes.position.array as Float32Array;
    const colors = geometry.attributes.color.array as Float32Array;
    const sizes = geometry.attributes.size.array as Float32Array; // Ajout pour modifier la taille dès le début

    // Sélectionner une étoile aléatoire
    const index = Math.floor(Math.random() * starCount);
    const i3 = index * 3;

    // Marquer cette étoile pour l'animation
    activeShotsRef.current.push({
      index: index,
      timer: 0,
      direction: direction,
    });

    // Augmenter immédiatement la taille pour un effet plus visible
    sizes[index] = starSize * (2.0 + Math.random() * 2.0);

    // Couleurs plus vives selon la direction
    if (direction > 0) {
      // Défilement vers le bas: teinte violet/rose plus intense
      colors[i3] = 1.0;
      colors[i3 + 1] = 0.2 + Math.random() * 0.3;
      colors[i3 + 2] = 0.7 + Math.random() * 0.3;
    } else {
      // Défilement vers le haut: teinte cyan/bleu plus intense
      colors[i3] = 0.2 + Math.random() * 0.2;
      colors[i3 + 1] = 0.6 + Math.random() * 0.4;
      colors[i3 + 2] = 1.0;
    }

    // Mettre à jour les attributs de la géométrie
    geometry.attributes.color.needsUpdate = true;
    geometry.attributes.size.needsUpdate = true;
  };

  // Fonction pour mettre à jour les étoiles filantes - version améliorée
  const updateShootingStars = (delta: number) => {
    if (!starsRef.current || activeShotsRef.current.length === 0) return;

    const geometry = starsRef.current.geometry;
    const positions = geometry.attributes.position.array as Float32Array;
    const colors = geometry.attributes.color.array as Float32Array;
    const sizes = geometry.attributes.size.array as Float32Array;

    const finishedShots: number[] = [];

    // Mettre à jour chaque étoile filante
    activeShotsRef.current.forEach((shot, shotIndex) => {
      const i3 = shot.index * 3;

      // Augmenter le timer
      shot.timer += delta * 1.5; // Animation un peu plus lente pour des traînées plus longues

      if (shot.timer <= 1.0) {
        // Phase d'animation - Traînée plus prononcée

        // Déplacement plus important dans la direction du défilement
        positions[i3 + 1] -=
          shot.direction * delta * trailStrength * (1 + scrollSpeedRef.current);

        // Effet de traînée plus long avec l'évolution du timer
        const stretch = Math.min(5.0, 2.0 + shot.timer * 4.0);
        sizes[shot.index] = starSize * stretch;

        // Effet de "vague" latérale pour plus de dynamisme
        positions[i3] += Math.sin(shot.timer * 10) * 0.2 * delta;
        positions[i3 + 2] += Math.cos(shot.timer * 8) * 0.2 * delta;

        // Intensifier progressivement la couleur
        if (shot.direction > 0) {
          // Vers le bas: plus rouge/violet avec le temps
          colors[i3] = Math.min(1.0, colors[i3] + 0.01);
          colors[i3 + 2] = Math.min(1.0, colors[i3 + 2] + 0.005);
        } else {
          // Vers le haut: plus bleu/cyan avec le temps
          colors[i3 + 1] = Math.min(1.0, colors[i3 + 1] + 0.01);
          colors[i3 + 2] = Math.min(1.0, colors[i3 + 2] + 0.005);
        }
      } else {
        // Animation terminée, réinitialiser l'étoile avec transition douce
        if (initialStarPositionsRef.current) {
          // Restaurer progressivement position
          positions[i3] +=
            (initialStarPositionsRef.current[i3] - positions[i3]) * 0.2;
          positions[i3 + 1] +=
            (initialStarPositionsRef.current[i3 + 1] - positions[i3 + 1]) * 0.2;
          positions[i3 + 2] +=
            (initialStarPositionsRef.current[i3 + 2] - positions[i3 + 2]) * 0.2;

          // Réduire progressivement la taille
          sizes[shot.index] *= 0.9;

          // Si presque revenue à sa position d'origine, on finalise
          if (shot.timer > 1.5) {
            positions[i3] = initialStarPositionsRef.current[i3];
            positions[i3 + 1] = initialStarPositionsRef.current[i3 + 1];
            positions[i3 + 2] = initialStarPositionsRef.current[i3 + 2];
            sizes[shot.index] = starSize * (0.5 + Math.random() * 1.0);

            // Restaurer couleur
            colors[i3] = 0.8 + Math.random() * 0.2;
            colors[i3 + 1] = 0.8 + Math.random() * 0.2;
            colors[i3 + 2] = 0.9 + Math.random() * 0.1;

            finishedShots.push(shotIndex);
          }
        } else {
          finishedShots.push(shotIndex);
        }
      }
    });

    // Supprimer les étoiles filantes terminées
    finishedShots.reverse().forEach((index) => {
      activeShotsRef.current.splice(index, 1);
    });

    // Mettre à jour la géométrie
    if (finishedShots.length > 0 || activeShotsRef.current.length > 0) {
      geometry.attributes.position.needsUpdate = true;
      geometry.attributes.color.needsUpdate = true;
      geometry.attributes.size.needsUpdate = true;
    }
  };

  // Mettre à jour l'état lors du défilement
  useEffect(() => {
    // Calculer la direction et la vitesse de défilement
    const currentTime = performance.now();
    const elapsed = currentTime - lastTimestampRef.current;
    lastTimestampRef.current = currentTime;

    if (elapsed > 0) {
      // Calculer le delta de défilement
      const scrollDelta = scrollY - lastScrollYRef.current;

      // Mettre à jour la vitesse (valeur absolue) - Plus sensible
      const newSpeed = Math.min(1.0, Math.abs(scrollDelta) / 20); // Plus réactif (était 30)
      scrollSpeedRef.current = Math.max(scrollSpeedRef.current, newSpeed);

      // Mettre à jour la direction (1 = vers le bas, -1 = vers le haut)
      if (Math.abs(scrollDelta) > 0.5) {
        // Plus sensible (était 1)
        scrollDirectionRef.current = Math.sign(scrollDelta);

        // IMPORTANT: Créer immédiatement quelques étoiles filantes dès le début du défilement
        if (isScrolling && starsRef.current) {
          for (let i = 0; i < 5; i++) {
            createShootingStar(scrollDirectionRef.current);
          }
        }
      }
    }

    // Déclin plus lent de la vitesse pour des effets qui persistent
    if (!isScrolling && scrollSpeedRef.current > 0) {
      scrollSpeedRef.current *= 0.95; // Ralentissement plus progressif (était 0.9)
      if (scrollSpeedRef.current < 0.01) scrollSpeedRef.current = 0;
    }

    lastScrollYRef.current = scrollY;

    // Effet de caméra
    if (cameraRef.current) {
      // Mouvement de base
      cameraRef.current.position.y = -scrollY * 0.001;

      // Effet de zoom lors du défilement
      if (isScrolling) {
        cameraRef.current.position.z = 5 - scrollSpeedRef.current * 0.5;
      } else {
        cameraRef.current.position.z +=
          (5 - cameraRef.current.position.z) * 0.05;
      }
    }
  }, [scrollY, isScrolling]);

  return (
    <div ref={canvasRef} className="fixed top-0 left-0 w-full h-full z-0" />
  );
};

export default CosmicBackground;
