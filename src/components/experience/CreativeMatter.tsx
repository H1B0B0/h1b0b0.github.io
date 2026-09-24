"use client";

import { Canvas, useFrame, useThree } from "@react-three/fiber";
import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import * as THREE from "three";

import styles from "./CreativeMatter.module.css";

export type CreativeDestination =
  | "index"
  | "work"
  | "lab"
  | "profile"
  | "contact"
  | (string & {});

export type CreativeChannels = {
  form: number;
  motion: number;
  system: number;
};

export interface CreativeMatterProps {
  destination?: CreativeDestination;
  visited?: readonly CreativeDestination[];
  pointerEnergy?: number;
  channels?: Partial<CreativeChannels>;
  sessionSeed?: number;
  quality?: "auto" | "low" | "high";
  className?: string;
  fallbackLabel?: string;
}

type Palette = readonly [string, string, string];

const PALETTES: Record<string, Palette> = {
  index: ["#725cff", "#1bd6bd", "#ff8057"],
  work: ["#315ce8", "#6c48d7", "#ff8b55"],
  lab: ["#15bfa5", "#a5e461", "#9d5cff"],
  profile: ["#8d56d8", "#ef6c82", "#42b7cf"],
  contact: ["#ef8358", "#f4c67a", "#4d6fd7"],
};

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
  uniform float uAspect;
  uniform float uEnergy;
  uniform float uSeed;
  uniform float uVisitedCount;
  uniform float uOctaves;
  uniform vec2 uPointer;
  uniform vec3 uChannels;
  uniform vec3 uColorA;
  uniform vec3 uColorB;
  uniform vec3 uColorC;
  uniform vec4 uVisited;

  float hash(vec2 p) {
    p = fract(p * vec2(123.34, 456.21));
    p += dot(p, p + 34.345);
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
    float amplitude = 0.52;
    mat2 turn = mat2(0.80, -0.60, 0.60, 0.80);
    for (int i = 0; i < 5; i++) {
      if (float(i) >= uOctaves) break;
      value += amplitude * noise(p);
      p = turn * p * 2.01 + vec2(8.7, -5.3);
      amplitude *= 0.5;
    }
    return value;
  }

  float segment(vec2 p, vec2 a, vec2 b) {
    vec2 pa = p - a;
    vec2 ba = b - a;
    float h = clamp(dot(pa, ba) / dot(ba, ba), 0.0, 1.0);
    return length(pa - ba * h);
  }

  void main() {
    vec2 centered = vUv - 0.5;
    centered.x *= uAspect;

    float time = uTime * mix(0.018, 0.075, uChannels.y);
    vec2 seedOffset = vec2(uSeed * 0.013, uSeed * -0.009);
    float base = fbm(centered * mix(1.2, 1.85, uChannels.x) + seedOffset + vec2(time, -time));
    vec2 bend = vec2(
      fbm(centered * 1.55 + vec2(base * 1.8, time * 0.7)),
      fbm(centered * 1.45 + vec2(-time * 0.45, base * 1.5))
    ) - 0.5;

    vec2 pointer = vec2(uPointer.x * 0.5 * uAspect, uPointer.y * 0.5);
    float pointerFalloff = exp(-dot(centered - pointer, centered - pointer) * 5.5);
    vec2 material = centered + bend * (0.18 + uChannels.x * 0.24);
    material -= normalize(centered - pointer + vec2(0.0001)) * pointerFalloff * uEnergy * 0.075;

    float field = fbm(material * (1.9 + uChannels.z * 0.8) - vec2(time * 0.55, time * 0.18));
    float membrane = smoothstep(0.76, 0.28, abs(field - 0.52 + base * 0.15));
    float strandA = exp(-abs(material.y + sin(material.x * 2.2 + base * 4.0) * 0.12) * 8.0);
    float strandB = exp(-abs(material.x * 0.42 - material.y - cos(material.y * 2.7 - field * 3.5) * 0.1) * 10.0);
    float gesture = pointerFalloff * (0.12 + uEnergy * 0.88);

    float traceA = exp(-segment(material, vec2(-0.62, -0.28), vec2(0.52, 0.34)) * 22.0) * uVisited.x;
    float traceB = exp(-segment(material, vec2(-0.42, 0.44), vec2(0.64, -0.18)) * 24.0) * uVisited.y;
    float traceC = exp(-segment(material, vec2(-0.72, 0.08), vec2(0.36, -0.46)) * 23.0) * uVisited.z;
    float traceD = exp(-segment(material, vec2(-0.18, -0.52), vec2(0.72, 0.12)) * 25.0) * uVisited.w;
    float traces = clamp(traceA + traceB + traceC + traceD, 0.0, 1.0);

    vec3 color = vec3(0.010, 0.012, 0.019);
    color += mix(uColorA, uColorB, field) * membrane * (0.18 + base * 0.2);
    color += uColorB * strandA * (0.055 + uChannels.y * 0.065);
    color += uColorC * strandB * (0.035 + uChannels.z * 0.05);
    color += mix(uColorA, uColorC, base) * gesture * (0.1 + uEnergy * 0.13);
    color += mix(uColorC, vec3(0.92), 0.3) * traces * (0.035 + uVisitedCount * 0.02);

    float edge = smoothstep(1.05, 0.22, length(centered * vec2(0.72, 1.0)));
    color *= edge;
    color += (hash(gl_FragCoord.xy + uSeed) - 0.5) * 0.006;

    gl_FragColor = vec4(max(color, vec3(0.0)), 1.0);
  }
`;

function clamp01(value: number) {
  return Math.max(0, Math.min(1, value));
}

function paletteFor(destination: CreativeDestination): Palette {
  return PALETTES[destination] ?? PALETTES.index;
}

function canUseWebGL() {
  try {
    const canvas = document.createElement("canvas");
    return Boolean(
      window.WebGLRenderingContext &&
        (canvas.getContext("webgl2") || canvas.getContext("webgl")),
    );
  } catch {
    return false;
  }
}

function prefersConservativeQuality() {
  const device = navigator as Navigator & { deviceMemory?: number };
  return (device.hardwareConcurrency ?? 4) <= 4 || (device.deviceMemory ?? 4) <= 4;
}

function ContextGuard({
  onLost,
  onRestored,
}: {
  onLost: () => void;
  onRestored: () => void;
}) {
  const { gl } = useThree();

  useEffect(() => {
    const canvas = gl.domElement;
    const handleLost = (event: Event) => {
      event.preventDefault();
      onLost();
    };
    canvas.addEventListener("webglcontextlost", handleLost);
    canvas.addEventListener("webglcontextrestored", onRestored);
    return () => {
      canvas.removeEventListener("webglcontextlost", handleLost);
      canvas.removeEventListener("webglcontextrestored", onRestored);
    };
  }, [gl, onLost, onRestored]);

  return null;
}

function MatterField({
  destination,
  visited,
  pointerEnergy,
  channels,
  sessionSeed,
  pointerRef,
  reducedMotion,
  initialOctaves,
}: Required<
  Pick<CreativeMatterProps, "destination" | "visited" | "pointerEnergy" | "sessionSeed">
> & {
  channels: CreativeChannels;
  pointerRef: React.MutableRefObject<THREE.Vector2>;
  reducedMotion: boolean;
  initialOctaves: number;
}) {
  const materialRef = useRef<THREE.ShaderMaterial>(null);
  const smoothPointer = useRef(new THREE.Vector2());
  const frames = useRef({ count: 0, elapsed: 0, octaves: initialOctaves });
  const { size, invalidate } = useThree();

  const targetColors = useMemo(() => {
    const palette = paletteFor(destination);
    return palette.map((color) => new THREE.Color(color)) as [
      THREE.Color,
      THREE.Color,
      THREE.Color,
    ];
  }, [destination]);
  const targetChannels = useMemo(
    () => new THREE.Vector3(channels.form, channels.motion, channels.system),
    [channels.form, channels.motion, channels.system],
  );

  const visitedFlags = useMemo(() => {
    const set = new Set(visited);
    return new THREE.Vector4(
      set.has("work") ? 1 : 0,
      set.has("lab") ? 1 : 0,
      set.has("profile") ? 1 : 0,
      set.has("contact") ? 1 : 0,
    );
  }, [visited]);

  const uniforms = useMemo(() => {
    const palette = paletteFor(destination);
    return {
      uTime: { value: sessionSeed * 0.01 },
      uAspect: { value: size.width / Math.max(1, size.height) },
      uEnergy: { value: pointerEnergy },
      uSeed: { value: sessionSeed },
      uVisitedCount: { value: visited.length },
      uOctaves: { value: initialOctaves },
      uPointer: { value: new THREE.Vector2() },
      uChannels: {
        value: new THREE.Vector3(channels.form, channels.motion, channels.system),
      },
      uColorA: { value: new THREE.Color(palette[0]) },
      uColorB: { value: new THREE.Color(palette[1]) },
      uColorC: { value: new THREE.Color(palette[2]) },
      uVisited: { value: visitedFlags.clone() },
    };
    // Uniform objects deliberately stay stable for the material lifetime.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  useEffect(() => {
    if (reducedMotion) invalidate();
  }, [destination, invalidate, pointerEnergy, reducedMotion, visitedFlags]);

  useFrame((_, delta) => {
    const material = materialRef.current;
    if (!material) return;

    const safeDelta = Math.min(delta, 0.05);
    if (!reducedMotion) material.uniforms.uTime.value += safeDelta;
    material.uniforms.uAspect.value = size.width / Math.max(1, size.height);

    if (reducedMotion) {
      material.uniforms.uEnergy.value = clamp01(pointerEnergy);
      material.uniforms.uPointer.value.copy(pointerRef.current);
      material.uniforms.uChannels.value.copy(targetChannels);
      material.uniforms.uVisited.value.copy(visitedFlags);
      material.uniforms.uVisitedCount.value = visited.length;
      material.uniforms.uColorA.value.copy(targetColors[0]);
      material.uniforms.uColorB.value.copy(targetColors[1]);
      material.uniforms.uColorC.value.copy(targetColors[2]);
      return;
    }

    material.uniforms.uEnergy.value = THREE.MathUtils.lerp(
      material.uniforms.uEnergy.value,
      clamp01(pointerEnergy),
      1 - Math.pow(0.003, safeDelta),
    );
    smoothPointer.current.lerp(pointerRef.current, 1 - Math.pow(0.002, safeDelta));
    material.uniforms.uPointer.value.copy(smoothPointer.current);
    material.uniforms.uChannels.value.lerp(
      targetChannels,
      1 - Math.pow(0.02, safeDelta),
    );
    material.uniforms.uVisited.value.lerp(visitedFlags, 1 - Math.pow(0.02, safeDelta));
    material.uniforms.uVisitedCount.value = THREE.MathUtils.lerp(
      material.uniforms.uVisitedCount.value,
      visited.length,
      1 - Math.pow(0.02, safeDelta),
    );

    const colorEase = 1 - Math.pow(0.035, safeDelta);
    material.uniforms.uColorA.value.lerp(targetColors[0], colorEase);
    material.uniforms.uColorB.value.lerp(targetColors[1], colorEase);
    material.uniforms.uColorC.value.lerp(targetColors[2], colorEase);

    if (frames.current.octaves > 2) {
      frames.current.count += 1;
      frames.current.elapsed += safeDelta;
      if (frames.current.elapsed >= 2.2) {
        const fps = frames.current.count / frames.current.elapsed;
        if (fps < 42) frames.current.octaves -= 1;
        material.uniforms.uOctaves.value = frames.current.octaves;
        frames.current.count = 0;
        frames.current.elapsed = 0;
      }
    }
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

function StaticMatter({
  destination,
  visitedCount,
  pointerEnergy,
  className = "",
  label,
  overlay = false,
}: {
  destination: CreativeDestination;
  visitedCount: number;
  pointerEnergy: number;
  className?: string;
  label?: string;
  overlay?: boolean;
}) {
  const palette = paletteFor(destination);
  const style = {
    "--matter-a": palette[0],
    "--matter-b": palette[1],
    "--matter-c": palette[2],
    "--matter-energy": String(clamp01(pointerEnergy)),
    "--matter-visited": String(Math.min(4, visitedCount)),
  } as React.CSSProperties;

  return (
    <div
      className={`${styles.fallback} ${overlay ? styles.fallbackOverlay : styles.fallbackVisible} ${className}`}
      style={style}
      role={label ? "img" : undefined}
      aria-label={label}
      aria-hidden={label ? undefined : true}
    >
      <span className={styles.trace} aria-hidden="true" />
    </div>
  );
}

export default function CreativeMatter({
  destination = "index",
  visited = [],
  pointerEnergy = 0,
  channels = {},
  sessionSeed = 1,
  quality = "auto",
  className = "",
  fallbackLabel,
}: CreativeMatterProps) {
  const [webGLState, setWebGLState] = useState<"checking" | "supported" | "unsupported">(
    "checking",
  );
  const [contextLost, setContextLost] = useState(false);
  const [reducedMotion, setReducedMotion] = useState(false);
  const [visible, setVisible] = useState(true);
  const [conservativeDevice, setConservativeDevice] = useState(false);
  const pointerRef = useRef(new THREE.Vector2());

  useEffect(() => {
    setWebGLState(canUseWebGL() ? "supported" : "unsupported");
    setConservativeDevice(prefersConservativeQuality());

    const motionQuery = window.matchMedia("(prefers-reduced-motion: reduce)");
    const syncMotion = () => setReducedMotion(motionQuery.matches);
    const syncVisibility = () => setVisible(document.visibilityState === "visible");
    const syncPointer = (event: PointerEvent) => {
      pointerRef.current.set(
        (event.clientX / Math.max(1, window.innerWidth)) * 2 - 1,
        -((event.clientY / Math.max(1, window.innerHeight)) * 2 - 1),
      );
    };

    syncMotion();
    syncVisibility();
    motionQuery.addEventListener("change", syncMotion);
    document.addEventListener("visibilitychange", syncVisibility);
    window.addEventListener("pointermove", syncPointer, { passive: true });
    window.addEventListener("pointerdown", syncPointer, { passive: true });
    return () => {
      motionQuery.removeEventListener("change", syncMotion);
      document.removeEventListener("visibilitychange", syncVisibility);
      window.removeEventListener("pointermove", syncPointer);
      window.removeEventListener("pointerdown", syncPointer);
    };
  }, []);

  useEffect(() => {
    if (webGLState !== "unsupported") return;
    document.documentElement.dataset.sceneReady = "true";
    window.dispatchEvent(new Event("portfolio:scene-ready"));
  }, [webGLState]);

  const resolvedChannels: CreativeChannels = {
    form: clamp01(channels.form ?? 0.62),
    motion: clamp01(channels.motion ?? 0.58),
    system: clamp01(channels.system ?? 0.54),
  };
  const lowQuality = quality === "low" || (quality === "auto" && conservativeDevice);
  const initialOctaves = quality === "high" ? 5 : lowQuality ? 3 : 4;
  const dpr: [number, number] = lowQuality ? [1, 1] : [1, 1.25];
  const onContextLost = useCallback(() => setContextLost(true), []);
  const onContextRestored = useCallback(() => setContextLost(false), []);

  return (
    <div className={`${styles.root} ${className}`} aria-hidden={fallbackLabel ? undefined : true}>
      {webGLState !== "supported" ? (
        <StaticMatter
          destination={destination}
          visitedCount={visited.length}
          pointerEnergy={pointerEnergy}
          label={fallbackLabel}
        />
      ) : (
        <>
          <Canvas
            className={styles.canvas}
            camera={{ position: [0, 0, 1] }}
            dpr={dpr}
            frameloop={!visible ? "never" : reducedMotion ? "demand" : "always"}
            gl={{ antialias: false, alpha: false, powerPreference: "high-performance" }}
            onCreated={() => {
              document.documentElement.dataset.sceneReady = "true";
              window.dispatchEvent(new Event("portfolio:scene-ready"));
            }}
          >
            <ContextGuard onLost={onContextLost} onRestored={onContextRestored} />
            <MatterField
              destination={destination}
              visited={visited}
              pointerEnergy={pointerEnergy}
              channels={resolvedChannels}
              sessionSeed={sessionSeed}
              pointerRef={pointerRef}
              reducedMotion={reducedMotion}
              initialOctaves={initialOctaves}
            />
          </Canvas>
          {contextLost && (
            <StaticMatter
              destination={destination}
              visitedCount={visited.length}
              pointerEnergy={pointerEnergy}
              label={fallbackLabel}
              overlay
            />
          )}
        </>
      )}
    </div>
  );
}
