"use client";
import { useEffect, useState, useRef } from "react";
import styles from "./SimpleStarBackground.module.css";

interface SimpleStarBackgroundProps {
  scrollY: number;
  isScrolling: boolean;
  isSpaceTransition?: boolean;
  transitionDirection?: number;
  transitionProgress?: number;
}

// Pre-generate stars outside component for better performance
const totalStars = 150; // Reduced for better performance
const stars = Array.from({ length: totalStars }, () => {
  const isFrontStar = Math.random() > 0.5;
  const size = isFrontStar ? Math.random() * 3 + 2 : Math.random() * 2 + 0.5;
  return {
    top: Math.random() * 100,
    left: Math.random() * 100,
    size,
    opacity: Math.random() * 0.7 + 0.3,
    isFrontStar,
  };
});

const SimpleStarBackground: React.FC<SimpleStarBackgroundProps> = ({
  scrollY,
  isScrolling,
  isSpaceTransition = false,
  transitionDirection = 0,
  transitionProgress = 0,
}) => {
  // Refs for optimization
  const starElementsRef = useRef<(HTMLDivElement | null)[]>([]);
  const activeStarsRef = useRef<Set<number>>(new Set());

  // Apply transition effects when active
  useEffect(() => {
    if (!isSpaceTransition) {
      // Reset all stars when transition ends
      activeStarsRef.current.forEach((index) => {
        const star = starElementsRef.current[index];
        if (star) {
          // Reset to normal state
          star.style.transform = "none";
          star.style.transition = "transform 0.3s ease-out";
          star.style.width = `${stars[index].size}px`;
          star.style.height = `${stars[index].size}px`;
          star.style.opacity = stars[index].opacity.toString();
          star.style.borderRadius = "50%";
          star.style.boxShadow = "none";
        }
      });
      activeStarsRef.current.clear();
      return;
    }

    // Apply effects to some stars when transitioning
    if (starElementsRef.current && isSpaceTransition) {
      // Limit the number of animated stars for performance
      const maxStarsToAnimate = 8;
      let animatedStars = 0;

      // Try to animate stars until we reach the maximum
      for (
        let attempts = 0;
        attempts < 30 && animatedStars < maxStarsToAnimate;
        attempts++
      ) {
        const starIndex = Math.floor(Math.random() * totalStars);

        // Don't re-animate stars that are already active
        if (activeStarsRef.current.has(starIndex)) continue;

        const starElement = starElementsRef.current[starIndex];
        if (starElement && stars[starIndex].isFrontStar) {
          // Add to active stars set
          activeStarsRef.current.add(starIndex);
          animatedStars++;

          // Calculate animation parameters
          const speed = 5 + Math.random() * 15;
          const length = 10 + Math.random() * 50;
          const width = stars[starIndex].size * 0.3;
          const brightness = 0.7 + Math.random() * 0.3;

          // Apply transition effect
          starElement.style.transition = "none";

          if (transitionDirection > 0) {
            // Moving down effect
            starElement.style.width = `${width}px`;
            starElement.style.height = `${length}px`;
            starElement.style.transform = `translateY(${
              speed * transitionProgress
            }vh)`;
            starElement.style.backgroundColor = `rgba(220, 220, 255, ${brightness})`;
          } else {
            // Moving up effect
            starElement.style.width = `${width}px`;
            starElement.style.height = `${length}px`;
            starElement.style.transform = `translateY(${
              -speed * transitionProgress
            }vh)`;
            starElement.style.backgroundColor = `rgba(255, 240, 220, ${brightness})`;
          }
        }
      }
    }
  }, [isSpaceTransition, transitionProgress, transitionDirection]);

  return (
    <div className={styles.starBackground}>
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
            backgroundColor: star.isFrontStar
              ? "rgba(255, 255, 255, 0.9)"
              : "rgba(255, 255, 255, 0.7)",
          }}
        />
      ))}
    </div>
  );
};

export default SimpleStarBackground;
