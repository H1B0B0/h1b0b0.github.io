"use client";

import { useEffect, useRef, useState } from "react";
import FoldSignature, { buildFoldGrid, type FoldSignatureProps } from "./FoldSignature";
import styles from "./FoldStudio.module.css";

type FoldSpring = { value: number; velocity: number };

/** The exact critically damped solution stays stable when a gesture retargets mid-flight. */
function advanceFoldSpring(spring: FoldSpring, target: number, frequency: number, seconds: number): FoldSpring {
  const displacement = spring.value - target;
  const impulse = spring.velocity + frequency * displacement;
  const decay = Math.exp(-frequency * seconds);
  return {
    value: target + (displacement + impulse * seconds) * decay,
    velocity: (spring.velocity - frequency * impulse * seconds) * decay,
  };
}

/** The same exportable surface, lit in real space. SVG stays usable while loading or without WebGL. */
export default function FoldStudio(props: FoldSignatureProps) {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const [ready, setReady] = useState(false);
  const [enabled, setEnabled] = useState(false);
  const { form = 52, tension = 50, phase = 0, tone = "paper" } = props;
  const latest = useRef({ form, tension, phase, tone });
  const scene = useRef<{ update: () => void; tilt: (x: number, y: number) => void } | null>(null);

  useEffect(() => {
    const preference = window.matchMedia("(min-width: 701px) and (prefers-reduced-motion: no-preference)");
    const sync = () => setEnabled(preference.matches);
    sync(); preference.addEventListener("change", sync);
    return () => preference.removeEventListener("change", sync);
  }, []);

  useEffect(() => { latest.current = { form, tension, phase, tone }; scene.current?.update(); }, [form, tension, phase, tone]);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!enabled || !canvas) return;
    let cancelled = false;
    let dispose: (() => void) | undefined;
    void import("three").then((THREE) => {
      if (cancelled) return;
      let renderer: InstanceType<typeof THREE.WebGLRenderer>;
      try { renderer = new THREE.WebGLRenderer({ canvas, alpha: true, antialias: true, powerPreference: "low-power" }); }
      catch { return; }
      renderer.setPixelRatio(Math.min(window.devicePixelRatio, 1.5));
      renderer.shadowMap.enabled = true;
      renderer.shadowMap.type = THREE.PCFSoftShadowMap;
      renderer.shadowMap.autoUpdate = false;
      renderer.toneMapping = THREE.ACESFilmicToneMapping;
      renderer.toneMappingExposure = 1.1;
      const world = new THREE.Scene();
      const camera = new THREE.PerspectiveCamera(42, 1, 1, 1800);
      camera.position.z = 820;
      const group = new THREE.Group(); world.add(group);
      const paper = new THREE.MeshStandardMaterial({ color: "#292b26", roughness: .32, metalness: .35, side: THREE.DoubleSide });
      const edge = new THREE.MeshStandardMaterial({ color: "#d27e60", roughness: .5, metalness: .08, side: THREE.DoubleSide });
      const surface = new THREE.Mesh(new THREE.BufferGeometry(), paper);
      const boundary = new THREE.Mesh(new THREE.BufferGeometry(), edge);
      surface.castShadow = true; boundary.castShadow = true;
      // This one small surface changes shape. Its initial bounding sphere must not cull a later pose.
      surface.frustumCulled = false; boundary.frustumCulled = false;
      group.add(surface, boundary);
      const key = new THREE.DirectionalLight("#fff2df", 3.1);
      key.position.set(-300, 450, 700); key.castShadow = true;
      key.shadow.mapSize.set(1024, 1024);
      Object.assign(key.shadow.camera, { left: -350, right: 350, top: 350, bottom: -350, near: 1, far: 1600 });
      key.shadow.normalBias = 1.2; key.shadow.bias = -.0002; key.shadow.radius = 4;
      world.add(key, new THREE.AmbientLight("#fff7e7", .9));
      const fill = new THREE.DirectionalLight("#ede9e0", .6); fill.position.set(420, -160, 400); world.add(fill);
      const groundMaterial = new THREE.ShadowMaterial({ opacity: .09 });
      const groundGeometry = new THREE.PlaneGeometry(1400, 1200);
      const ground = new THREE.Mesh(groundGeometry, groundMaterial); ground.position.z = -185; ground.receiveShadow = true; world.add(ground);
      const initialGrid = buildFoldGrid(latest.current);
      const columns = initialGrid[0].length;
      const positions = new Float32Array(initialGrid.length * columns * 3);
      const positionAttribute = new THREE.BufferAttribute(positions, 3).setUsage(THREE.DynamicDrawUsage);
      const indices: number[] = [], bodyIndices: number[] = [], edgeIndices: number[] = [];
      for (let row = 0; row < initialGrid.length - 1; row++) for (let col = 0; col < columns - 1; col++) {
        const a = row * columns + col, b = a + columns;
        const face = [a, b, b + 1, a, b + 1, a + 1];
        indices.push(...face);
        (col === 0 || col === columns - 2 ? edgeIndices : bodyIndices).push(...face);
      }
      // Topology and GPU buffers are allocated once. Body and edge share the continuous surface normals.
      const base = new THREE.BufferGeometry();
      base.setAttribute("position", positionAttribute); base.setIndex(indices);
      const writeSurface = (pose: { form: number; tension: number; phase: number }) => {
        const grid = buildFoldGrid(pose);
        let cursor = 0;
        for (const row of grid) for (const [x, y, z] of row) {
          positions[cursor++] = x; positions[cursor++] = -y; positions[cursor++] = z;
        }
        positionAttribute.needsUpdate = true;
        base.computeVertexNormals();
        renderer.shadowMap.needsUpdate = true;
      };
      writeSurface(latest.current);
      surface.geometry.setAttribute("position", positionAttribute);
      surface.geometry.setAttribute("normal", base.getAttribute("normal")); surface.geometry.setIndex(bodyIndices);
      boundary.geometry.setAttribute("position", positionAttribute);
      boundary.geometry.setAttribute("normal", base.getAttribute("normal")); boundary.geometry.setIndex(edgeIndices);

      const springs = {
        form: { value: latest.current.form, velocity: 0 },
        tension: { value: latest.current.tension, velocity: 0 },
        phase: { value: latest.current.phase, velocity: 0 },
        x: { value: 0, velocity: 0 }, y: { value: 0, velocity: 0 },
      };
      const targets = { form: latest.current.form, tension: latest.current.tension, phase: latest.current.phase, x: 0, y: 0 };
      const motionKeys = ["form", "tension", "phase", "x", "y"] as const;
      let frame = 0, frames = 0, active = true, initialized = false, previousFrame = 0, motionStarted = 0;
      canvas.dataset.motionState = "rest";
      const fallback = () => { active = false; cancelAnimationFrame(frame); frame = 0; canvas.dataset.motionState = "rest"; setReady(false); };
      renderer.debug.onShaderError = fallback;
      const draw = (now: number) => {
        frame = 0;
        if (!active || cancelled || document.hidden) return;
        const seconds = previousFrame ? Math.min((now - previousFrame) / 1000, .064) : 1 / 60;
        previousFrame = now;
        let moving = false, geometryChanged = false, tiltChanged = false;
        for (const name of motionKeys) {
          const previous = springs[name];
          const frequency = name === "phase" ? 14 : name === "x" || name === "y" ? 20 : 28;
          const tolerance = name === "phase" ? .0008 : name === "x" || name === "y" ? .0001 : .015;
          const next = advanceFoldSpring(previous, targets[name], frequency, seconds);
          // Finite motion: land on the exact authored parameters, never run an asymptotic idle loop.
          if (now - motionStarted > 900 || (Math.abs(next.value - targets[name]) < tolerance && Math.abs(next.velocity) < tolerance * frequency)) {
            next.value = targets[name]; next.velocity = 0;
          } else moving = true;
          if (next.value !== previous.value) {
            if (name === "x" || name === "y") tiltChanged = true;
            else geometryChanged = true;
          }
          springs[name] = next;
        }
        if (geometryChanged) writeSurface({ form: springs.form.value, tension: springs.tension.value, phase: springs.phase.value });
        if (tiltChanged) { group.rotation.set(springs.y.value * .18, springs.x.value * .26, 0); renderer.shadowMap.needsUpdate = true; }
        try {
          renderer.render(world, camera);
          if (active) {
            canvas.dataset.renderFrames = String(++frames);
            if (!initialized) { initialized = true; setReady(true); }
            canvas.dataset.motionState = moving ? "settling" : "rest";
            if (moving) frame = requestAnimationFrame(draw);
            else { previousFrame = 0; canvas.dataset.motionDuration = String(motionStarted ? Math.round(now - motionStarted) : 0); }
          }
        }
        catch { fallback(); }
      };
      const invalidate = () => { if (!frame && active && !cancelled && !document.hidden) frame = requestAnimationFrame(draw); };
      const startMotion = () => {
        if (!active || cancelled) return;
        motionStarted = performance.now(); canvas.dataset.motionState = "settling"; invalidate();
      };
      const update = () => {
        paper.color.set(latest.current.tone === "ink" ? "#292b26" : "#e8e1d2");
        paper.roughness = latest.current.tone === "ink" ? .32 : .5;
        paper.metalness = latest.current.tone === "ink" ? .35 : .08;
        if (targets.form !== latest.current.form || targets.tension !== latest.current.tension || targets.phase !== latest.current.phase) {
          targets.form = latest.current.form; targets.tension = latest.current.tension; targets.phase = latest.current.phase;
          startMotion();
        } else invalidate();
      };
      const resize = () => {
        const { width, height } = canvas.getBoundingClientRect();
        if (!width || !height) return;
        camera.aspect = width / height;
        camera.fov = THREE.MathUtils.radToDeg(2 * Math.atan(280 / 738 * Math.max(1, (640 / 560) / camera.aspect)));
        camera.updateProjectionMatrix(); renderer.setSize(width, height, false); invalidate();
      };
      const lost = (event: Event) => { event.preventDefault(); fallback(); };
      const visibility = () => {
        if (document.hidden) { cancelAnimationFrame(frame); frame = 0; previousFrame = 0; }
        else invalidate();
      };
      canvas.addEventListener("webglcontextlost", lost);
      document.addEventListener("visibilitychange", visibility);
      const observer = new ResizeObserver(resize); observer.observe(canvas);
      scene.current = { update, tilt: (x, y) => {
        if (targets.x === x && targets.y === y) return;
        targets.x = x; targets.y = y; startMotion();
      } };
      update(); resize();
      dispose = () => {
        active = false; cancelAnimationFrame(frame); observer.disconnect(); canvas.removeEventListener("webglcontextlost", lost);
        document.removeEventListener("visibilitychange", visibility);
        scene.current = null; surface.geometry.dispose(); boundary.geometry.dispose(); base.dispose(); groundGeometry.dispose();
        paper.dispose(); edge.dispose(); groundMaterial.dispose(); renderer.dispose(); setReady(false);
      };
    }).catch(() => { if (!cancelled) setReady(false); });
    return () => { cancelled = true; dispose?.(); };
  }, [enabled]);

  return (
    <div className={`${styles.studio} ${props.className ?? ""}`} data-fold-renderer={enabled && ready ? "webgl" : "svg"}
      onPointerMove={(event) => {
        if (!props.interactive || event.pointerType !== "mouse") return;
        const bounds = event.currentTarget.getBoundingClientRect();
        scene.current?.tilt((event.clientX - bounds.left) / bounds.width - .5, (event.clientY - bounds.top) / bounds.height - .5);
      }} onPointerLeave={() => scene.current?.tilt(0, 0)}>
      <FoldSignature {...props} className={styles.vector} />
      <canvas ref={canvasRef} className={styles.canvas} aria-hidden="true" />
    </div>
  );
}
