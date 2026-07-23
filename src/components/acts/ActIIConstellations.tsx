"use client";

import { useMemo, useRef } from "react";
import { useFrame } from "@react-three/fiber";
import * as THREE from "three";

import { useScrollProgress } from "@/context/ScrollProgressContext";

/**
 * ActIIConstellations — Solar system.
 *
 * SCROLL RANGE: 0.33 → 0.66
 * Spatial location: z = -15. Calm orbital middle chapter supplying bright
 * emissive sources (sun + additive halo) for the restrained global bloom pass.
 *
 * Palette (DESIGN.md §2.3/§2.6): constellation blue (#4488ff) sun, mineral
 * planet tones, deep additive starfield (#7aa2ff).
 */

export interface ActIIConstellationsProps {
  readonly scrollProgress?: number;
}

/* ---------- Module-level orbit / planet definitions (readonly) ---------- */
const ORBITS = [
  { radius: 3.0, tiltX: 0.05, tiltZ: 0.02, speed: 0.55, phase: 0.0, size: 0.18, color: "#c8a98a", ring: false },
  { radius: 4.2, tiltX: -0.08, tiltZ: 0.06, speed: 0.38, phase: 1.2, size: 0.26, color: "#9fb6c9", ring: false },
  { radius: 5.5, tiltX: 0.12, tiltZ: -0.04, speed: 0.26, phase: 2.4, size: 0.14, color: "#d98c6a", ring: false },
  { radius: 7.0, tiltX: -0.04, tiltZ: 0.10, speed: 0.17, phase: 3.6, size: 0.34, color: "#e6c87a", ring: true },
  { radius: 8.6, tiltX: 0.09, tiltZ: -0.07, speed: 0.11, phase: 4.8, size: 0.22, color: "#8aa6c4", ring: false },
] as const;

const STAR_COUNT = 1800;

/* ---------- Stable module helper: procedural starfield (built once) ---------- */
function buildStarfield(count: number): THREE.BufferGeometry {
  const positions = new Float32Array(count * 3);
  const colors = new Float32Array(count * 3);
  const warm = new THREE.Color("#cfe0ff");
  const cool = new THREE.Color("#7aa2ff");
  for (let i = 0; i < count; i++) {
    const u = Math.random() * 2 - 1;
    const phi = Math.random() * Math.PI * 2;
    const r = Math.sqrt(1 - u * u);
    const radius = 18 + Math.random() * 24;
    positions[i * 3] = r * Math.cos(phi) * radius;
    positions[i * 3 + 1] = r * Math.sin(phi) * radius;
    positions[i * 3 + 2] = u * radius;
    const c = Math.random() < 0.5 ? warm : cool;
    const v = 0.6 + Math.random() * 0.4;
    colors[i * 3] = c.r * v;
    colors[i * 3 + 1] = c.g * v;
    colors[i * 3 + 2] = c.b * v;
  }
  const geo = new THREE.BufferGeometry();
  geo.setAttribute("position", new THREE.BufferAttribute(positions, 3));
  geo.setAttribute("color", new THREE.BufferAttribute(colors, 3));
  return geo;
}

export default function ActIIConstellations({
  scrollProgress,
}: ActIIConstellationsProps) {
  void scrollProgress;

  const { progressRef } = useScrollProgress();
  const planetRefs = useRef<(THREE.Mesh | null)[]>([]);

  /* ----- Geometry: built once via useMemo ----- */
  const starGeo = useMemo(() => buildStarfield(STAR_COUNT), []);
  const orbitGeos = useMemo(
    () => ORBITS.map((o) => new THREE.TorusGeometry(o.radius, 0.008, 6, 128)),
    [],
  );

  /* ----- Materials: built once, mutated in-place in useFrame (no realloc) ----- */
  const sunMat = useMemo(
    () =>
      new THREE.MeshStandardMaterial({
        color: "#1a2a55",
        emissive: "#4488ff",
        emissiveIntensity: 1.8,
        transparent: true,
        opacity: 1,
        toneMapped: false,
      }),
    [],
  );
  const haloMat = useMemo(
    () =>
      new THREE.MeshBasicMaterial({
        color: "#7aa2ff",
        transparent: true,
        opacity: 0.35,
        side: THREE.BackSide,
        blending: THREE.AdditiveBlending,
        depthWrite: false,
      }),
    [],
  );
  const orbitMat = useMemo(
    () =>
      new THREE.MeshBasicMaterial({
        color: "#7aa2ff",
        transparent: true,
        opacity: 0.35,
        depthWrite: false,
      }),
    [],
  );
  const planetMats = useMemo(
    () =>
      ORBITS.map(
        (o) =>
          new THREE.MeshStandardMaterial({
            color: o.color,
            emissive: o.color,
            emissiveIntensity: 0.25,
            roughness: 0.7,
            metalness: 0.1,
            transparent: true,
            opacity: 1,
          }),
      ),
    [],
  );
  const ringMat = useMemo(
    () =>
      new THREE.MeshBasicMaterial({
        color: "#d9c9a8",
        transparent: true,
        opacity: 0.45,
        side: THREE.DoubleSide,
        blending: THREE.AdditiveBlending,
        depthWrite: false,
      }),
    [],
  );
  const starMat = useMemo(
    () =>
      new THREE.PointsMaterial({
        size: 0.12,
        sizeAttenuation: true,
        transparent: true,
        opacity: 0.9,
        vertexColors: true,
        blending: THREE.AdditiveBlending,
        depthWrite: false,
      }),
    [],
  );

  useFrame((state) => {
    const t = state.clock.getElapsedTime();
    const env = actEnvelope(progressRef.current, 0.33, 0.66, 0.05, 0.05);

    // Every visible layer multiplies opacity / intensity by the act envelope.
    sunMat.emissiveIntensity = 1.8 * env;
    sunMat.opacity = env;
    haloMat.opacity = 0.35 * env;
    orbitMat.opacity = 0.35 * env;
    starMat.opacity = 0.9 * env;
    ringMat.opacity = 0.45 * env;

    // Drive planets along their orbital paths (local XZ plane; group applies tilt).
    for (let i = 0; i < ORBITS.length; i++) {
      const o = ORBITS[i];
      const mesh = planetRefs.current[i];
      if (!mesh) continue;
      const a = t * o.speed + o.phase;
      mesh.position.set(Math.cos(a) * o.radius, 0, Math.sin(a) * o.radius);
      mesh.rotation.y = t * 0.3 + i;
      planetMats[i].opacity = env;
      planetMats[i].emissiveIntensity = 0.25 * env;
    }
  });

  return (
    <group position={[0, 0, -15]}>
      {/* Sun: dimensional emissive blue-white core */}
      <mesh material={sunMat}>
        <sphereGeometry args={[1.0, 32, 32]} />
      </mesh>

      {/* Sun additive halo (BackSide + AdditiveBlending) */}
      <mesh material={haloMat} scale={1.9}>
        <sphereGeometry args={[1.0, 32, 32]} />
      </mesh>

      {/* Five tilted orbital systems — orbit path + planet share the tilt group */}
      {ORBITS.map((o, i) => (
        <group key={o.radius} rotation={[o.tiltX, 0, o.tiltZ]}>
          {/* Thin orbit path (torus lying flat in local XZ plane) */}
          <mesh material={orbitMat} rotation={[Math.PI / 2, 0, 0]}>
            <primitive object={orbitGeos[i]} attach="geometry" />
          </mesh>
          {/* Planet — positioned in local plane each frame by useFrame */}
          <mesh
            ref={(el) => {
              planetRefs.current[i] = el;
            }}
            material={planetMats[i]}
          >
            <sphereGeometry args={[o.size, 24, 24]} />
            {o.ring ? (
              <mesh material={ringMat} rotation={[Math.PI / 2.3, 0.1, 0]}>
                <ringGeometry args={[o.size * 1.5, o.size * 2.4, 64, 1]} />
              </mesh>
            ) : null}
          </mesh>
        </group>
      ))}

      {/* Deep memoized procedural starfield */}
      <points geometry={starGeo} material={starMat} />
    </group>
  );
}

/* Smooth visibility envelope shared across acts. */
function actEnvelope(
  progress: number,
  start: number,
  end: number,
  fadeIn: number,
  fadeOut: number,
): number {
  if (progress < start || progress > end) return 0;
  const inT = Math.min(1, (progress - start) / Math.max(0.0001, fadeIn));
  const outT = Math.min(1, (end - progress) / Math.max(0.0001, fadeOut));
  return Math.min(inT, outT);
}
