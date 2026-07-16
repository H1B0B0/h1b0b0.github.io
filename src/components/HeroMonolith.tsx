"use client";

import React, { useRef, useEffect } from "react";
import { Canvas } from "@react-three/fiber";
import * as THREE from "three";
import FX from "@/constants/fx";

/**
 * HeroMonolith
 *
 * Lightweight R3F placeholder for the monolith. Uses a simple shader-like
 * material via MeshStandardMaterial with emissive map to simulate glow. This is
 * intentionally minimal for first iteration; shader can be swapped later.
 */
export default function HeroMonolith() {
  const containerRef = useRef<HTMLDivElement | null>(null);

  useEffect(() => {
    // No client-side heavy initialisation here — Canvas handles it.
  }, []);

  return (
    <div ref={containerRef} className="pointer-events-none absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 w-[70vw] max-w-3xl h-[28vh] md:h-[42vh] z-10">
      <Canvas
        gl={{ antialias: true, alpha: true, powerPreference: "high-performance" }}
        camera={{ position: [0, 0, 18], fov: 45 }}
        className="!pointer-events-none"
      >
        <ambientLight intensity={0.2} />
        <pointLight position={[0, 0, 6]} intensity={1.8} color={"#ff88aa"} />
        <mesh position={[0, -1, 0]}>
          <sphereGeometry args={[4.2, 64, 64]} />
          <meshStandardMaterial emissive={new THREE.Color(0xff66aa)} emissiveIntensity={FX.monolith.glowIntensity} metalness={0.1} roughness={0.45} />
        </mesh>
      </Canvas>
    </div>
  );
}
