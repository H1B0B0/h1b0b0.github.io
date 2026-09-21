"use client";

import { useEffect, useMemo, useRef, useState } from "react";
import { Canvas, useFrame, useThree } from "@react-three/fiber";
import * as THREE from "three";

import { useScrollProgress } from "@/context/ScrollProgressContext";

const vertexShader = /* glsl */ `
  varying vec2 vUv;

  void main() {
    vUv = uv;
    gl_Position = vec4(position.xy, 0.0, 1.0);
  }
`;

const fragmentShader = /* glsl */ `
  precision highp float;

  varying vec2 vUv;
  uniform float uTime;
  uniform float uProgress;
  uniform float uAspect;
  uniform vec2 uPointer;

  float hash(vec2 p) {
    p = fract(p * vec2(123.34, 456.21));
    p += dot(p, p + 45.32);
    return fract(p.x * p.y);
  }

  float noise(vec2 p) {
    vec2 i = floor(p);
    vec2 f = fract(p);
    f = f * f * (3.0 - 2.0 * f);

    return mix(
      mix(hash(i), hash(i + vec2(1.0, 0.0)), f.x),
      mix(hash(i + vec2(0.0, 1.0)), hash(i + vec2(1.0, 1.0)), f.x),
      f.y
    );
  }

  float fbm(vec2 p) {
    float value = 0.0;
    float amplitude = 0.5;
    mat2 rotation = mat2(0.82, -0.57, 0.57, 0.82);

    for (int i = 0; i < 5; i++) {
      value += amplitude * noise(p);
      p = rotation * p * 2.03 + 13.7;
      amplitude *= 0.5;
    }

    return value;
  }

  void main() {
    vec2 p = vUv - 0.5;
    p.x *= uAspect;
    p -= uPointer * vec2(0.035, 0.025);

    float time = uTime * 0.055;
    float coarse = fbm(p * 1.25 + vec2(time, -time * 0.62));
    vec2 warped = p + vec2(
      fbm(p * 1.7 + coarse + vec2(2.3, time * 0.7)),
      fbm(p * 1.45 - coarse + vec2(-3.7, -time * 0.45))
    ) * 0.34;

    float detail = fbm(warped * 2.15 + vec2(-time * 0.4, time * 0.25));
    float ribbonA = exp(-abs(warped.y + 0.14 * sin(warped.x * 2.1 + coarse * 3.4)) * 5.8);
    float ribbonB = exp(-abs(warped.y - 0.22 - 0.1 * sin(warped.x * 1.6 - detail * 3.0)) * 7.0);
    float veil = clamp(ribbonA * 0.72 + ribbonB * 0.34 + detail * 0.28, 0.0, 1.0);

    float profileWeight = 1.0 - smoothstep(0.24, 0.43, uProgress);
    float contactWeight = smoothstep(0.62, 0.84, uProgress);
    float blueWeight = 1.0 - max(profileWeight, contactWeight);

    vec3 profileColor = vec3(0.20, 0.035, 0.11);
    vec3 blueColor = vec3(0.025, 0.15, 0.42);
    vec3 contactColor = vec3(0.28, 0.055, 0.012);
    vec3 accent = profileColor * profileWeight + blueColor * blueWeight + contactColor * contactWeight;

    vec2 focus = mix(vec2(-0.28, 0.12), vec2(0.34, -0.08), smoothstep(0.25, 0.88, uProgress));
    float glow = exp(-dot(p - focus, p - focus) * 1.65);
    float secondaryGlow = exp(-dot(p + focus * 0.72, p + focus * 0.72) * 3.1);
    vec2 pointerPosition = vec2(uPointer.x * 0.5 * uAspect, uPointer.y * 0.5);
    float pointerStrength = smoothstep(0.02, 0.2, length(uPointer));
    float pointerLight = exp(-dot(p - pointerPosition, p - pointerPosition) * 9.0) * pointerStrength;

    vec3 color = vec3(0.0015, 0.0025, 0.0055);
    color += accent * veil * (0.42 + glow * 0.34);
    color += accent.bgr * secondaryGlow * detail * 0.08;
    color += mix(accent, vec3(0.32, 0.4, 0.52), 0.35) * pointerLight * (0.08 + detail * 0.12);

    float edge = smoothstep(0.94, 0.2, length((vUv - 0.5) * vec2(0.9, 1.08)));
    color *= edge;

    float grain = hash(gl_FragCoord.xy + uTime * 13.0) - 0.5;
    color += grain * 0.012;

    gl_FragColor = vec4(max(color, vec3(0.0)), 1.0);
  }
`;

function OrganicField() {
  const materialRef = useRef<THREE.ShaderMaterial>(null);
  const smoothedPointer = useRef(new THREE.Vector2());
  const { size } = useThree();
  const { progressRef } = useScrollProgress();
  const [reducedMotion, setReducedMotion] = useState(false);

  const uniforms = useMemo(
    () => ({
      uTime: { value: 0 },
      uProgress: { value: progressRef.current },
      uAspect: { value: size.width / Math.max(1, size.height) },
      uPointer: { value: new THREE.Vector2() },
    }),
    [progressRef, size.height, size.width],
  );

  useEffect(() => {
    const query = window.matchMedia("(prefers-reduced-motion: reduce)");
    const sync = () => setReducedMotion(query.matches);
    sync();
    query.addEventListener("change", sync);
    return () => query.removeEventListener("change", sync);
  }, []);

  useFrame((state, delta) => {
    const material = materialRef.current;
    if (!material) return;

    if (!reducedMotion) material.uniforms.uTime.value += Math.min(delta, 0.05);
    material.uniforms.uProgress.value = progressRef.current;
    material.uniforms.uAspect.value = size.width / Math.max(1, size.height);
    smoothedPointer.current.lerp(state.pointer, 1 - Math.pow(0.002, delta));
    material.uniforms.uPointer.value.copy(smoothedPointer.current);
  });

  return (
    <mesh frustumCulled={false}>
      <planeGeometry args={[2, 2]} />
      <shaderMaterial
        ref={materialRef}
        vertexShader={vertexShader}
        fragmentShader={fragmentShader}
        uniforms={uniforms}
        depthTest={false}
        depthWrite={false}
      />
    </mesh>
  );
}

export default function ScrollDrivenScene() {
  return (
    <Canvas
      className="!fixed inset-0"
      style={{ position: "fixed", inset: 0, pointerEvents: "none" }}
      camera={{ position: [0, 0, 1] }}
      gl={{ antialias: false, alpha: false, powerPreference: "high-performance" }}
      dpr={[1, 1.25]}
    >
      <OrganicField />
    </Canvas>
  );
}
