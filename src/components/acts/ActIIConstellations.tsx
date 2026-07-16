"use client";

import { useRef } from "react";
import { useFrame } from "@react-three/fiber";
import * as THREE from "three";

import { useScrollProgress } from "@/context/ScrollProgressContext";

/**
 * ActIIConstellations — placeholder stub.
 *
 * SCROLL RANGE: 0.33 → 0.66
 * Spatial location: solar system at z = -15. Each project = a planet.
 *
 * Foundation stub; the future chunk will replace the placeholder with the
 * real solar-system scene. The stub renders a small placeholder sun plus 3
 * wireframe orbit rings so we can validate the Act II camera framing.
 */
export interface ActIIConstellationsProps {
  scrollProgress?: number;
}

export default function ActIIConstellations({
  scrollProgress,
}: ActIIConstellationsProps) {
  const sunRef = useRef<THREE.Mesh>(null);
  const sunMatRef = useRef<THREE.MeshStandardMaterial>(null);
  const orbitRefs = useRef<(THREE.Mesh | null)[]>([]);
  const { progressRef } = useScrollProgress();

  void scrollProgress;

  const orbitRadii = [3.2, 4.6, 6.2];

  useFrame((state) => {
    const t = state.clock.getElapsedTime();
    const envelope = actEnvelope(progressRef.current, 0.33, 0.66, 0.05, 0.05);
    if (sunRef.current) {
      sunRef.current.rotation.y = t * 0.2;
    }
    if (sunMatRef.current) {
      sunMatRef.current.emissiveIntensity = 1.2 * envelope;
      sunMatRef.current.opacity = envelope;
    }
    orbitRefs.current.forEach((mesh, i) => {
      if (!mesh) return;
      mesh.rotation.z = t * (0.1 + i * 0.04);
      const mat = mesh.material as THREE.MeshBasicMaterial;
      mat.opacity = 0.35 * envelope;
    });
  });

  return (
    <group position={[0, 0, -15]}>
      <mesh ref={sunRef} position={[0, 0, 0]}>
        <sphereGeometry args={[1.1, 32, 32]} />
        <meshStandardMaterial
          ref={sunMatRef}
          color={"#1a2a55"}
          emissive={"#4488ff"}
          emissiveIntensity={1.2}
          transparent
          opacity={1}
        />
      </mesh>

      {orbitRadii.map((radius, i) => (
        <mesh
          key={radius}
          ref={(el) => {
            orbitRefs.current[i] = el;
          }}
          rotation={[Math.PI / 2, 0, 0]}
          position={[0, 0, 0]}
        >
          <torusGeometry args={[radius, 0.012, 8, 128]} />
          <meshBasicMaterial color={"#7aa2ff"} transparent opacity={0.35} />
        </mesh>
      ))}
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
