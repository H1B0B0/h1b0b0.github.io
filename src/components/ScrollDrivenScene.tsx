"use client";

import { useMemo, useRef } from "react";
import { Canvas, useFrame, useThree } from "@react-three/fiber";
import * as THREE from "three";

import { useScrollProgress } from "@/context/ScrollProgressContext";
import ActIGenesis from "@/components/acts/ActIGenesis";
import ActIIConstellations from "@/components/acts/ActIIConstellations";
import ActIIISignal from "@/components/acts/ActIIISignal";

/**
 * ScrollDrivenScene
 *
 * A full-screen fixed R3F Canvas hosting the cinematic 3-act journey.
 *
 * Camera travel (driven by scroll progress in [0, 1]):
 *   Act I  (0.00 → 0.33): position (0, 0, 30)   →  Genesis nebula
 *   Act II (0.33 → 0.66): position (0, 5, 15)   →  Solar system
 *   Act III(0.66 → 1.00): position (0, 0, 8)    →  Monolith in deep space
 *
 * The camera always looks toward the origin (0,0,0). A subtle mouse-parallax
 * offset is layered on top of the lerped base position.
 *
 * The scene background also shifts across the 3 acts: deep black (Genesis) →
 * cold blue night (Constellations) → pure black (Signal).
 */

const ACT_I_CAMERA = new THREE.Vector3(0, 0, 30);
const ACT_II_CAMERA = new THREE.Vector3(0, 5, 15);
const ACT_III_CAMERA = new THREE.Vector3(0, 0, 8);

const ACT_I_COLOR = new THREE.Color("#02010a"); // near-black, faint warmth
const ACT_II_COLOR = new THREE.Color("#050a1a"); // cold blue night
const ACT_III_COLOR = new THREE.Color("#000000"); // pure deep void

const ACT_BOUNDARIES = [
  { end: 0.33, pos: ACT_I_CAMERA, color: ACT_I_COLOR },
  { end: 0.66, pos: ACT_II_CAMERA, color: ACT_II_COLOR },
  { end: 1.01, pos: ACT_III_CAMERA, color: ACT_III_COLOR },
] as const;

/** Compute interpolated camera target + scene color from scroll progress. */
function sampleCameraPath(progress: number, outPos: THREE.Vector3, outColor: THREE.Color): void {
  const p = Math.max(0, Math.min(1, progress));

  // Find the act segment containing p.
  let from: (typeof ACT_BOUNDARIES)[number] = ACT_BOUNDARIES[0];
  let to: (typeof ACT_BOUNDARIES)[number] = ACT_BOUNDARIES[1];
  let segStart = 0;
  for (let i = 0; i < ACT_BOUNDARIES.length - 1; i++) {
    if (p <= ACT_BOUNDARIES[i].end) {
      from = ACT_BOUNDARIES[i];
      to = ACT_BOUNDARIES[i + 1];
      segStart = i === 0 ? 0 : ACT_BOUNDARIES[i - 1].end;
      break;
    }
  }

  const span = Math.max(0.0001, to.end - segStart);
  const localT = Math.max(0, Math.min(1, (p - segStart) / span));
  // Smoothstep easing for a more cinematic camera glide.
  const eased = localT * localT * (3 - 2 * localT);

  outPos.lerpVectors(from.pos, to.pos, eased);
  outColor.lerpColors(from.color, to.color, eased);
}

/**
 * CameraRig — internal component that runs inside the Canvas and lerps the
 * camera toward the scroll-driven target every frame.
 */
function CameraRig() {
  const { camera, scene } = useThree();
  const { progressRef } = useScrollProgress();

  // Reusable temporaries to avoid per-frame allocations.
  const targetPos = useRef(new THREE.Vector3().copy(ACT_I_CAMERA));
  const targetColor = useRef(new THREE.Color().copy(ACT_I_COLOR));
  const parallaxTarget = useRef(new THREE.Vector3());

  useFrame((state, delta) => {
    const progress = progressRef.current;
    sampleCameraPath(progress, targetPos.current, targetColor.current);

    // Layer mouse-parallax on a *copy* of the target so we don't mutate the
    // shared sampled position between frames.
    parallaxTarget.current.copy(targetPos.current);
    parallaxTarget.current.x += state.pointer.x * 0.5;
    parallaxTarget.current.y += state.pointer.y * 0.3;

    // Framerate-independent lerp toward the target.
    const lerpFactor = 1 - Math.pow(0.001, delta);
    camera.position.lerp(parallaxTarget.current, lerpFactor);
    camera.lookAt(0, 0, 0);

    // Smooth color transition for the scene background.
    if (scene.background instanceof THREE.Color) {
      scene.background.lerp(targetColor.current, lerpFactor);
    } else {
      scene.background = targetColor.current.clone();
    }
  });

  return null;
}

/** Scene contents — the 3 act stubs + minimal lighting. */
function SceneContents() {
  const lights = useMemo(
    () => (
      <>
        <ambientLight intensity={0.15} />
        <directionalLight position={[8, 10, 6]} intensity={0.6} color={"#9fd4ff"} />
        <pointLight position={[0, 0, 0]} intensity={6} distance={20} color={"#ff4477"} />
      </>
    ),
    [],
  );

  return (
    <>
      {lights}
      {/* Acts consume scroll progress from context internally */}
      <ActIGenesis />
      <ActIIConstellations />
      <ActIIISignal />
    </>
  );
}

export default function ScrollDrivenScene() {
  return (
    <Canvas
      className="!fixed inset-0"
      style={{ position: "fixed", inset: 0, pointerEvents: "none" }}
      camera={{ position: [0, 0, 30], fov: 55, near: 0.1, far: 200 }}
      gl={{
        antialias: true,
        alpha: false,
        powerPreference: "high-performance",
      }}
      dpr={[1, 2]}
    >
      {/* Initial background; CameraRig takes over from here. */}
      <color attach="background" args={["#02010a"]} />
      <fog attach="fog" args={["#02010a", 25, 80]} />
      <CameraRig />
      <SceneContents />
    </Canvas>
  );
}
