"use client";
import { PointMaterial, Points } from "@react-three/drei";
import { Canvas, useFrame } from "@react-three/fiber";
import React, { Suspense, useRef, useState } from "react";
import * as THREE from "three";

interface StarBackgroundProps {
  numStars?: number;
  speed?: number;
}

const StarField: React.FC<{
  numStars: number;
  speed: number;
  color: string;
  size: number;
}> = ({ numStars, speed, color, size }) => {
  const ref = useRef<THREE.Points>(null);

  // Create stars in a deeper box-like volume
  const [positions] = useState(() => {
    const pos = new Float32Array(numStars * 3);
    for (let i = 0; i < numStars; i++) {
      pos[i * 3] = (Math.random() - 0.5) * 6; // Wider X
      pos[i * 3 + 1] = (Math.random() - 0.5) * 6; // Wider Y
      pos[i * 3 + 2] = Math.random() * -15; // Deeper Z initial
    }
    return pos;
  });

  useFrame((_state, delta) => {
    if (ref.current) {
      const pos = ref.current.geometry.attributes.position
        .array as Float32Array;
      for (let i = 0; i < numStars; i++) {
        // Move towards camera (positive Z) - perfectly constant
        pos[i * 3 + 2] += delta * speed;

        // If star goes past camera, reset it to far back
        if (pos[i * 3 + 2] > 3) {
          pos[i * 3 + 2] = -15; // Reset to far back
          // Maintain X and Y for a more "consistent trajectory" feel
        }
      }
      ref.current.geometry.attributes.position.needsUpdate = true;
    }
  });

  return (
    <Points ref={ref} positions={positions} stride={3} frustumCulled={false}>
      <PointMaterial
        transparent
        color={color}
        size={size}
        sizeAttenuation={true}
        depthWrite={false}
        opacity={0.8}
        blending={THREE.AdditiveBlending}
      />
    </Points>
  );
};

const StarBackground: React.FC<StarBackgroundProps> = ({
  numStars = 5000,
  speed = 0.2,
}) => {
  return (
    <group>
      <StarField
        numStars={numStars}
        speed={speed}
        color="#ffffff"
        size={0.005}
      />

      <StarField
        numStars={Math.floor(numStars / 6)}
        speed={speed * 2.0}
        color="#22d3ee"
        size={0.008}
      />

      <StarField
        numStars={Math.floor(numStars / 6)}
        speed={speed * 1.5}
        color="#a78bfa"
        size={0.006}
      />

      <StarField
        numStars={numStars}
        speed={speed * 0.5}
        color="#ffffff"
        size={0.002}
      />
    </group>
  );
};

const StarsCanvas: React.FC<StarBackgroundProps> = (props) => (
  <div className="w-full h-auto fixed inset-0 z-0 pointer-events-none bg-[#030712]">
    <Canvas camera={{ position: [0, 0, 1], fov: 75 }}>
      <Suspense fallback={null}>
        <StarBackground {...props} />
      </Suspense>
    </Canvas>
  </div>
);

export default StarsCanvas;
