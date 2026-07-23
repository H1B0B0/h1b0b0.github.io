"use client";

import { useMemo, useRef } from "react";
import { useFrame } from "@react-three/fiber";
import * as THREE from "three";

import { useScrollProgress } from "@/context/ScrollProgressContext";

/**
 * ActIIISignal — Monolith / Contact.
 *
 * SCROLL RANGE: 0.66 → 1.00
 *
 * A dimensional near-black metallic monolith (1.4 × 4.2 × 0.18) revealed by
 * a cold cyan key light and a restrained ion-violet rim. A narrow ice-blue
 * emissive seam pulses down the front face; a narrow edge-free signal beam
 * plus a bright axial core rise from the slab top, and ~72 procedural
 * particles drift upward through the transmission and recycle continuously.
 */

export interface ActIIISignalProps {
  readonly scrollProgress?: number;
}

const SLAB_COLOR = "#02040a";
const SIGNAL_COLOR = "#9fd4ff";
const CYAN_KEY = "#06b6d4";
const VIOLET_RIM = "#8b5cf6";
const PARTICLE_COUNT = 72;
const BEAM_FLOOR = 0.5;
const BEAM_CEIL = 8.5;

/* ---------- GLSL: signal particles (soft round additive points) ---------- */
const PARTICLE_VERT = /* glsl */ `
  attribute float aSize;
  attribute float aSeed;
  uniform float uTime;
  uniform float uPixelRatio;
  uniform float uIntensity;
  varying float vAlpha;
  void main() {
    vec3 p = position;
    p.x += sin(uTime * 1.1 + aSeed * 2.0) * 0.025;
    vec4 mv = modelViewMatrix * vec4(p, 1.0);
    gl_Position = projectionMatrix * mv;
    gl_PointSize = aSize * uPixelRatio * (150.0 / max(1.0, -mv.z));
    float h = clamp((p.y - 0.5) / 8.0, 0.0, 1.0);
    vAlpha = uIntensity * smoothstep(0.0, 0.12, h) * (1.0 - smoothstep(0.7, 1.0, h));
  }
`;

const PARTICLE_FRAG = /* glsl */ `
  precision mediump float;
  uniform vec3 uColor;
  varying float vAlpha;
  void main() {
    vec2 c = gl_PointCoord - 0.5;
    float d = length(c);
    if (d > 0.5) discard;
    float a = pow(smoothstep(0.5, 0.0, d), 1.6);
    gl_FragColor = vec4(uColor, a * vAlpha);
  }
`;

const BEAM_VERT = /* glsl */ `
  varying vec2 vUv;
  void main() {
    vUv = uv;
    gl_Position = projectionMatrix * modelViewMatrix * vec4(position, 1.0);
  }
`;

const BEAM_FRAG = /* glsl */ `
  precision mediump float;
  uniform float uTime;
  uniform float uIntensity;
  uniform vec3 uColor;
  varying vec2 vUv;
  void main() {
    float horizontal = abs(vUv.x - 0.5) * 2.0;
    float radial = exp(-horizontal * horizontal * 8.0);
    float lowerFade = smoothstep(0.0, 0.08, vUv.y);
    float upperFade = 1.0 - smoothstep(0.72, 1.0, vUv.y);
    float shimmer = 0.96 + sin(uTime * 1.1 + vUv.y * 13.0) * 0.04;
    float center = pow(radial, 3.0);
    vec3 color = mix(uColor, vec3(1.0), center * 0.65);
    gl_FragColor = vec4(color, radial * lowerFade * upperFade * shimmer * uIntensity * 0.58);
  }
`;

/* Build particle buffers once; mutated in place each frame. */
function buildSignalParticles(count: number): {
  positions: Float32Array;
  velocities: Float32Array;
  sizes: Float32Array;
  seeds: Float32Array;
} {
  const positions = new Float32Array(count * 3);
  const velocities = new Float32Array(count);
  const sizes = new Float32Array(count);
  const seeds = new Float32Array(count);
  for (let i = 0; i < count; i++) {
    positions[i * 3] = (Math.random() - 0.5) * 0.12;
    positions[i * 3 + 1] = BEAM_FLOOR + Math.random() * (BEAM_CEIL - BEAM_FLOOR);
    positions[i * 3 + 2] = 0.12 + Math.random() * 0.32;
    velocities[i] = 0.45 + Math.random() * 0.95;
    sizes[i] = 0.7 + Math.random() * 1.2;
    seeds[i] = Math.random() * Math.PI * 2;
  }
  return { positions, velocities, sizes, seeds };
}

export default function ActIIISignal({ scrollProgress }: ActIIISignalProps) {
  void scrollProgress;
  const { progressRef } = useScrollProgress();

  const slabMatRef = useRef<THREE.MeshStandardMaterial>(null);
  const seamMatRef = useRef<THREE.MeshStandardMaterial>(null);
  const coreMatRef = useRef<THREE.MeshBasicMaterial>(null);
  const cyanRef = useRef<THREE.PointLight>(null);
  const violetRef = useRef<THREE.PointLight>(null);

  const particleData = useMemo(() => buildSignalParticles(PARTICLE_COUNT), []);
  const posAttr = useMemo(
    () => new THREE.BufferAttribute(particleData.positions, 3),
    [particleData],
  );
  const particleGeo = useMemo(() => {
    const g = new THREE.BufferGeometry();
    g.setAttribute("position", posAttr);
    g.setAttribute("aSize", new THREE.BufferAttribute(particleData.sizes, 1));
    g.setAttribute("aSeed", new THREE.BufferAttribute(particleData.seeds, 1));
    return g;
  }, [posAttr, particleData]);

  const particleMat = useMemo(
    () =>
      new THREE.ShaderMaterial({
        uniforms: {
          uTime: { value: 0 },
          uPixelRatio: {
            value: Math.min(
              typeof window !== "undefined" ? window.devicePixelRatio : 1,
              2,
            ),
          },
          uIntensity: { value: 0 },
          uColor: { value: new THREE.Color(SIGNAL_COLOR) },
        },
        vertexShader: PARTICLE_VERT,
        fragmentShader: PARTICLE_FRAG,
        transparent: true,
        depthWrite: false,
        blending: THREE.AdditiveBlending,
      }),
    [],
  );
  const beamMat = useMemo(
    () =>
      new THREE.ShaderMaterial({
        uniforms: {
          uTime: { value: 0 },
          uIntensity: { value: 0 },
          uColor: { value: new THREE.Color(SIGNAL_COLOR) },
        },
        vertexShader: BEAM_VERT,
        fragmentShader: BEAM_FRAG,
        transparent: true,
        depthWrite: false,
        side: THREE.DoubleSide,
        blending: THREE.AdditiveBlending,
        toneMapped: false,
      }),
    [],
  );

  useFrame((state, delta) => {
    const t = state.clock.getElapsedTime();
    const dt = Math.min(delta, 0.05);
    const env = actEnvelope(progressRef.current, 0.66, 1.05, 0.05, 0.05);

    particleMat.uniforms.uTime.value = t;
    particleMat.uniforms.uIntensity.value = env * 0.45;
    beamMat.uniforms.uTime.value = t;
    beamMat.uniforms.uIntensity.value = env;

    // Slow transmission pulse, always gated by the act envelope.
    const pulse = 0.7 + Math.sin(t * 1.3) * 0.3;

    if (slabMatRef.current) slabMatRef.current.opacity = env;
    if (seamMatRef.current) {
      seamMatRef.current.opacity = 0.95 * env;
      seamMatRef.current.emissiveIntensity = (1.4 + pulse * 0.9) * env;
    }
    if (coreMatRef.current) {
      coreMatRef.current.opacity = (0.45 + pulse * 0.2) * env;
    }
    if (cyanRef.current) cyanRef.current.intensity = 18 * env;
    if (violetRef.current) violetRef.current.intensity = 6 * env;

    // Skip particle integration once the act is fully out of view.
    if (env <= 0) return;

    const pos = particleData.positions;
    const vel = particleData.velocities;
    for (let i = 0; i < PARTICLE_COUNT; i++) {
      const next = pos[i * 3 + 1] + vel[i] * dt;
      if (next > BEAM_CEIL) {
        pos[i * 3] = (Math.random() - 0.5) * 0.12;
        pos[i * 3 + 1] = BEAM_FLOOR;
        pos[i * 3 + 2] = 0.12 + Math.random() * 0.32;
      } else {
        pos[i * 3 + 1] = next;
      }
    }
    posAttr.needsUpdate = true;
  });

  return (
    <group position={[0, -2, -32]}>
      {/* Cold cyan key light — left, forward. */}
      <pointLight
        ref={cyanRef}
        position={[-3.6, 1.4, 4]}
        color={CYAN_KEY}
        intensity={0}
        distance={20}
        decay={2}
      />
      {/* Restrained ion-violet rim — right, behind. */}
      <pointLight
        ref={violetRef}
        position={[3.4, 0.6, -3]}
        color={VIOLET_RIM}
        intensity={0}
        distance={18}
        decay={2}
      />

      {/* Monolith slab — dimensional near-black metal. */}
      <mesh>
        <boxGeometry args={[1.4, 4.2, 0.18]} />
        <meshStandardMaterial
          ref={slabMatRef}
          color={SLAB_COLOR}
          metalness={0.95}
          roughness={0.15}
          transparent
          opacity={0}
        />
      </mesh>

      {/* Pulsing ice-blue emissive seam down the front face. */}
      <mesh position={[0, 0, 0.092]}>
        <planeGeometry args={[0.045, 3.9]} />
        <meshStandardMaterial
          ref={seamMatRef}
          color={SIGNAL_COLOR}
          emissive={SIGNAL_COLOR}
          emissiveIntensity={0}
          toneMapped={false}
          transparent
          opacity={0}
          depthWrite={false}
          blending={THREE.AdditiveBlending}
        />
      </mesh>

      <group position={[0, 5.2, 0.092]}>
        {[0, Math.PI / 3, -Math.PI / 3].map((rotationY) => (
          <mesh key={rotationY} material={beamMat} rotation={[0, rotationY, 0]}>
            <planeGeometry args={[0.9, 6.2]} />
          </mesh>
        ))}
      </group>

      {/* Bright axial core through the transmission. */}
      <mesh position={[0, 5.2, 0.092]}>
        <cylinderGeometry args={[0.018, 0.018, 6.2, 8, 1, true]} />
        <meshBasicMaterial
          ref={coreMatRef}
          color={SIGNAL_COLOR}
          transparent
          opacity={0}
          side={THREE.DoubleSide}
          depthWrite={false}
          blending={THREE.AdditiveBlending}
          toneMapped={false}
        />
      </mesh>

      {/* Upward-drifting signal particles. */}
      <points geometry={particleGeo} material={particleMat} />
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
