"use client";
import { useState, useEffect, useRef } from "react";

interface FPSCounterProps {
  visible: boolean;
}

const FPSCounter: React.FC<FPSCounterProps> = ({ visible }) => {
  const [fps, setFps] = useState<number>(0);
  const [minFps, setMinFps] = useState<number>(Infinity);
  const [maxFps, setMaxFps] = useState<number>(0);
  const [avgFps, setAvgFps] = useState<number>(0);

  const fpsValues = useRef<number[]>([]);
  const frameCount = useRef(0);
  const lastUpdateTime = useRef(performance.now());
  const frameTimes = useRef<number[]>([]);
  const animationFrameId = useRef<number>(0);

  useEffect(() => {
    if (!visible) return;

    // Réinitialiser les valeurs
    frameCount.current = 0;
    lastUpdateTime.current = performance.now();
    frameTimes.current = [];
    fpsValues.current = [];

    const updateFPS = () => {
      const now = performance.now();
      frameCount.current++;

      // Calculer le temps entre chaque frame
      const frameTime = now - lastUpdateTime.current;
      frameTimes.current.push(frameTime);

      // Limiter le tableau à 100 valeurs pour éviter trop de données
      if (frameTimes.current.length > 100) {
        frameTimes.current.shift();
      }

      // Mettre à jour FPS toutes les 500ms
      if (now - lastUpdateTime.current >= 500) {
        const elapsedSecs = (now - lastUpdateTime.current) / 1000;
        const currentFps = Math.round(frameCount.current / elapsedSecs);

        // Mettre à jour FPS actuel
        setFps(currentFps);

        // Ajouter à l'historique pour la moyenne
        fpsValues.current.push(currentFps);
        if (fpsValues.current.length > 20) {
          fpsValues.current.shift();
        }

        // Calculer min, max, et moyenne
        const newMinFps = Math.min(
          minFps === Infinity ? currentFps : minFps,
          currentFps
        );
        const newMaxFps = Math.max(maxFps, currentFps);

        const sum = fpsValues.current.reduce((a, b) => a + b, 0);
        const newAvgFps = Math.round(sum / fpsValues.current.length);

        setMinFps(newMinFps);
        setMaxFps(newMaxFps);
        setAvgFps(newAvgFps);

        // Réinitialiser pour la prochaine période
        frameCount.current = 0;
        lastUpdateTime.current = now;
      }

      // Continuer la boucle
      animationFrameId.current = requestAnimationFrame(updateFPS);
    };

    animationFrameId.current = requestAnimationFrame(updateFPS);

    return () => {
      cancelAnimationFrame(animationFrameId.current);
    };
  }, [visible, minFps, maxFps]);

  if (!visible) return null;

  // Déterminer la couleur en fonction du FPS
  const getFpsColor = () => {
    if (fps >= 50) return "text-green-400";
    if (fps >= 30) return "text-yellow-400";
    return "text-red-400";
  };

  return (
    <div className="fixed top-0 left-0 bg-black/80 p-3 m-3 rounded-md z-[1000] font-mono text-xs backdrop-blur-sm">
      <div className="mb-1">
        <span>FPS: </span>
        <span className={getFpsColor()}>{fps}</span>
      </div>
      <div className="grid grid-cols-3 gap-2">
        <div>
          <span className="text-gray-400">Min: </span>
          <span>{minFps === Infinity ? 0 : minFps}</span>
        </div>
        <div>
          <span className="text-gray-400">Avg: </span>
          <span>{avgFps}</span>
        </div>
        <div>
          <span className="text-gray-400">Max: </span>
          <span>{maxFps}</span>
        </div>
      </div>
      <div className="mt-1 text-gray-400 text-[10px]">Press Ctrl+F to hide</div>
    </div>
  );
};

export default FPSCounter;
