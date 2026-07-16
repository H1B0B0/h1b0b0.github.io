"use client";

import { useRef } from "react";
import { useFrame } from "@react-three/fiber";
import * as THREE from "three";

import { useScrollProgress } from "@/context/ScrollProgressContext";

/**
 * ActIIISignal — placeholder stub.
 *
 * SCROLL RANGE: 0.66 → 1.00
 * Spatial location: deep space at z = -32 (the contact monolith + black-hole
 * exit). Foundation stub; future chunk will replace with the real scene.
 *
 * The stub renders a tall monolith slab + thin signal beam so we can validate
 * the Act III deep-space camera framing.
 */
export interface ActIIISignalProps {
  scrollProgress?: number;
}

export default function ActIIISignal({
  scrollProgress,
}: ActIIISignalProps) {
  const monolithRef = useRef<THREE.Mesh>(null);
  const matRef = useRef<THREE.MeshStandardMaterial>(null);
  const beamMatRef = useRef<THREE.MeshBasicMaterial>(null);
  const { progressRef } = useScrollProgress();

  void scrollProgress;

  useFrame((state) => {
    const t = state.clock.getElapsedTime();
    const envelope = actEnvelope(progressRef.current, 0.66, 1.05, 0.05, 0.05);
    if (monolithRef.current) {
      monolithRef.current.rotation.y = Math.sin(t * 0.1) * 0.05;
    }
    if (matRef.current) {
      matRef.current.emissiveIntensity = 0.35 * envelope + Math.sin(t * 0.5) * 0.05;
      matRef.current.opacity = envelope;
    }
    if (beamMatRef.current) {
      beamMatRef.current.opacity = 0.5 * envelope;
    }
  });

  return (
    <group position={[0, -2, -32]}>
      <mesh ref={monolithRef} position={[0, 0, 0]}>
        <boxGeometry args={[1.4, 4.2, 0.18]} />
        <meshStandardMaterial
          ref={matRef}
          color={"#02040a"}
          emissive={"#1e3a8a"}
          emissiveIntensity={0.35}
          metalness={0.6}
          roughness={0.3}
          transparent
          opacity={1}
        />
      </mesh>

      <mesh position={[0, 0, 0.6]}>
        <planeGeometry args={[0.04, 4.0]} />
        <meshBasicMaterial
          ref={beamMatRef}
          color={"#9fd4ff"}
          transparent
          opacity={0.5}
        />
      </mesh>
    </group>
  );
}

function actEnvelope(
  progress: number,
  start: number,
  end: number,
  fadeIn: number,
  fadeOut: number,
): number {
  if (progress < start || progress > end) return 0;
  const inT = Math.min(1, (progress - start) / Math.max(0.0001, fadeIn));
  const outT = Math.min(
    1,
    (end - progress) / Math.max(0.0001, fadeOut),
  );
  return Math.min(inT, outT);
}
