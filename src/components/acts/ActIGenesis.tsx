"use client";

import { useMemo, useRef } from "react";
import { useFrame } from "@react-three/fiber";
import * as THREE from "three";

import { useScrollProgress } from "@/context/ScrollProgressContext";

/**
 * ActIGenesis — Primordial nebula.
 *
 * SCROLL RANGE: 0.00 → 0.33
 *
 * A volumetric particle cloud (~14k points) shaped like an oblate stellar
 * nursery, with a hot protostar at the center surrounded by a Fresnel corona
 * and a thin glowing accretion disk.
 *
 * Palette: deep red ember → magenta → white-hot core.
 */

export interface ActIGenesisProps {
  scrollProgress?: number;
}

/* ---------- GLSL: nebula points ---------- */
const NEBULA_VERT = /* glsl */ `
  attribute float aSize;
  attribute float aPhase;
  attribute vec3 aColor;

  uniform float uTime;
  uniform float uPixelRatio;
  uniform float uIntensity;

  varying vec3 vColor;
  varying float vAlpha;

  void main() {
    vColor = aColor;
    vec3 p = position;

    // Slow swirl around Y.
    float a = uTime * 0.04 + aPhase * 0.5;
    float s = sin(a), c = cos(a);
    p.xz = mat2(c, -s, s, c) * p.xz;

    // Radial breathing drift.
    float r = length(p) + 1e-4;
    vec3 dir = p / r;
    p += dir * sin(uTime * 0.3 + aPhase * 3.0) * 0.15;

    vec4 mv = modelViewMatrix * vec4(p, 1.0);
    gl_Position = projectionMatrix * mv;
    gl_PointSize = aSize * uPixelRatio * (220.0 / max(1.0, -mv.z));

    vAlpha = clamp(1.4 - r / 9.0, 0.0, 1.0) * uIntensity;
  }
`;

const NEBULA_FRAG = /* glsl */ `
  precision mediump float;
  varying vec3 vColor;
  varying float vAlpha;

  void main() {
    vec2 c = gl_PointCoord - 0.5;
    float d = length(c);
    if (d > 0.5) discard;
    float a = smoothstep(0.5, 0.0, d);
    a = pow(a, 1.8);
    gl_FragColor = vec4(vColor, a * vAlpha);
  }
`;

/* ---------- GLSL: protostar surface (plasma + Fresnel) ---------- */
const STAR_VERT = /* glsl */ `
  varying vec3 vNormal;
  varying vec3 vViewDir;
  varying float vDisplace;

  uniform float uTime;

  float n(vec3 p) {
    return sin(p.x * 2.3 + uTime * 0.6) * sin(p.y * 1.7 - uTime * 0.4) * sin(p.z * 2.1 + uTime * 0.5);
  }

  void main() {
    vNormal = normalize(normalMatrix * normal);
    float d = n(position * 1.2) * 0.05;
    vDisplace = d;
    vec3 p = position + normal * d;
    vec4 mv = modelViewMatrix * vec4(p, 1.0);
    vViewDir = normalize(-mv.xyz);
    gl_Position = projectionMatrix * mv;
  }
`;

const STAR_FRAG = /* glsl */ `
  precision highp float;
  varying vec3 vNormal;
  varying vec3 vViewDir;
  varying float vDisplace;

  uniform float uTime;
  uniform float uIntensity;
  uniform vec3 uCore;
  uniform vec3 uMid;
  uniform vec3 uRim;

  void main() {
    float fres = pow(1.0 - max(dot(vNormal, vViewDir), 0.0), 2.5);
    vec3 col = mix(uMid, uCore, 1.0 - fres);
    col = mix(col, uRim, fres * 0.6);
    col += vDisplace * 6.0 * uCore;
    float pulse = 0.85 + sin(uTime * 0.7) * 0.15;
    col *= pulse * uIntensity;
    gl_FragColor = vec4(col, 1.0);
  }
`;

/* ---------- GLSL: corona halo (back-side additive) ---------- */
const CORONA_FRAG = /* glsl */ `
  precision mediump float;
  varying vec3 vNormal;
  varying vec3 vViewDir;
  uniform float uIntensity;
  uniform vec3 uColor;

  void main() {
    float fres = pow(1.0 - max(dot(vNormal, vViewDir), 0.0), 1.5);
    float a = fres * uIntensity * 0.55;
    gl_FragColor = vec4(uColor, a);
  }
`;

/* ---------- Geometry builder ---------- */
function buildNebula(count: number) {
  const positions = new Float32Array(count * 3);
  const colors = new Float32Array(count * 3);
  const sizes = new Float32Array(count);
  const phases = new Float32Array(count);

  const cCore = new THREE.Color("#fff4e8");
  const cMid = new THREE.Color("#ff5a7a");
  const cEdge = new THREE.Color("#5a0a28");
  const cDust = new THREE.Color("#1a3a8a");

  for (let i = 0; i < count; i++) {
    const u = Math.random() * 2 - 1;
    const phi = Math.random() * Math.PI * 2;
    const r = Math.sqrt(1 - u * u);
    let x = r * Math.cos(phi);
    let y = r * Math.sin(phi);
    let z = u;
    y *= 0.42; // oblate flatten

    const filament = Math.sin(x * 3.1) * Math.cos(z * 2.7 + y) + Math.cos(y * 5.3);
    const radius = 1.6 + Math.pow(Math.random(), 0.6) * 7.0 + filament * 0.6;

    x *= radius;
    y *= radius;
    z *= radius;

    positions[i * 3] = x;
    positions[i * 3 + 1] = y;
    positions[i * 3 + 2] = z;

    const t = Math.min(1, radius / 8.5);
    const col = new THREE.Color();
    if (t < 0.25) col.lerpColors(cCore, cMid, t / 0.25);
    else if (t < 0.7) col.lerpColors(cMid, cEdge, (t - 0.25) / 0.45);
    else col.lerpColors(cEdge, cDust, (t - 0.7) / 0.3);

    const v = 0.85 + Math.random() * 0.3;
    colors[i * 3] = col.r * v;
    colors[i * 3 + 1] = col.g * v;
    colors[i * 3 + 2] = col.b * v;

    sizes[i] = (1.5 + Math.random() * 4.0) * (1.0 - t * 0.5);
    phases[i] = Math.random() * Math.PI * 2;
  }

  const geo = new THREE.BufferGeometry();
  geo.setAttribute("position", new THREE.BufferAttribute(positions, 3));
  geo.setAttribute("aColor", new THREE.BufferAttribute(colors, 3));
  geo.setAttribute("aSize", new THREE.BufferAttribute(sizes, 1));
  geo.setAttribute("aPhase", new THREE.BufferAttribute(phases, 1));
  return geo;
}

export default function ActIGenesis({ scrollProgress }: ActIGenesisProps) {
  void scrollProgress;

  const { progressRef } = useScrollProgress();
  const groupRef = useRef<THREE.Group>(null);
  const diskRef = useRef<THREE.Mesh>(null);
  const diskMatRef = useRef<THREE.MeshBasicMaterial>(null);
  const diskEdgeMatRef = useRef<THREE.MeshBasicMaterial>(null);

  const nebulaMat = useMemo(
    () =>
      new THREE.ShaderMaterial({
        uniforms: {
          uTime: { value: 0 },
          uPixelRatio: {
            value: Math.min(typeof window !== "undefined" ? window.devicePixelRatio : 1, 2),
          },
          uIntensity: { value: 1 },
        },
        vertexShader: NEBULA_VERT,
        fragmentShader: NEBULA_FRAG,
        transparent: true,
        depthWrite: false,
        blending: THREE.AdditiveBlending,
      }),
    [],
  );

  const nebulaGeo = useMemo(() => buildNebula(14000), []);

  const starMat = useMemo(
    () =>
      new THREE.ShaderMaterial({
        uniforms: {
          uTime: { value: 0 },
          uIntensity: { value: 1 },
          uCore: { value: new THREE.Color("#fff1d6") },
          uMid: { value: new THREE.Color("#ff3a5e") },
          uRim: { value: new THREE.Color("#ff8a4a") },
        },
        vertexShader: STAR_VERT,
        fragmentShader: STAR_FRAG,
        transparent: false,
      }),
    [],
  );

  const coronaMat = useMemo(
    () =>
      new THREE.ShaderMaterial({
        uniforms: {
          uIntensity: { value: 1 },
          uColor: { value: new THREE.Color("#ff4d6d") },
        },
        vertexShader: STAR_VERT,
        fragmentShader: CORONA_FRAG,
        transparent: true,
        depthWrite: false,
        blending: THREE.AdditiveBlending,
        side: THREE.BackSide,
      }),
    [],
  );

  useFrame((state) => {
    const t = state.clock.getElapsedTime();
    const env = actEnvelope(progressRef.current, -0.05, 0.33, 0.05, 0.05);

    nebulaMat.uniforms.uTime.value = t;
    nebulaMat.uniforms.uIntensity.value = 0.95 * env;

    starMat.uniforms.uTime.value = t;
    starMat.uniforms.uIntensity.value = env;

    coronaMat.uniforms.uIntensity.value = (0.7 + Math.sin(t * 0.6) * 0.15) * env;
    coronaMat.uniforms.uColor.value.setHSL(0.96, 0.8, 0.55 + 0.05 * Math.sin(t * 0.3));

    if (diskMatRef.current) diskMatRef.current.opacity = 0.18 * env;
    if (diskEdgeMatRef.current) diskEdgeMatRef.current.opacity = 0.4 * env;

    if (groupRef.current) {
      groupRef.current.visible = env > 0;
      groupRef.current.rotation.y = t * 0.02;
      groupRef.current.rotation.z = Math.sin(t * 0.08) * 0.02;
    }
    if (diskRef.current) {
      diskRef.current.rotation.z = t * 0.12;
    }
  });

  return (
    <group ref={groupRef} position={[0, -1, 0]}>
      {/* Nebula particle cloud */}
      <points geometry={nebulaGeo} material={nebulaMat} />

      {/* Protostar core */}
      <mesh material={starMat}>
        <icosahedronGeometry args={[1.5, 12]} />
      </mesh>

      {/* Corona halo */}
      <mesh material={coronaMat} scale={1.7}>
        <icosahedronGeometry args={[1.5, 8]} />
      </mesh>

      {/* Accretion disk */}
      <mesh ref={diskRef} rotation={[Math.PI / 2.05, 0, 0]}>
        <ringGeometry args={[2.2, 3.8, 256, 1]} />
        <meshBasicMaterial
          ref={diskMatRef}
          color={"#ff6a85"}
          transparent
          opacity={0.18}
          side={THREE.DoubleSide}
          blending={THREE.AdditiveBlending}
          depthWrite={false}
        />
      </mesh>

      {/* Faint outer disk edge */}
      <mesh rotation={[Math.PI / 2.05, 0, 0]}>
        <ringGeometry args={[3.78, 3.82, 256, 1]} />
        <meshBasicMaterial
          ref={diskEdgeMatRef}
          color={"#ffd9c2"}
          transparent
          opacity={0.4}
          side={THREE.DoubleSide}
          blending={THREE.AdditiveBlending}
          depthWrite={false}
        />
      </mesh>
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
