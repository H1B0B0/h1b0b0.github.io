"use client";

import { useEffect, useRef, useState } from "react";
import FoldSignature, { buildFoldGrid, type FoldSignatureProps } from "./FoldSignature";
import styles from "./FoldStudio.module.css";

/** The same exportable surface, lit in real space. SVG stays usable while loading or without WebGL. */
export default function FoldStudio(props: FoldSignatureProps) {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const [ready, setReady] = useState(false);
  const [enabled, setEnabled] = useState(false);
  const { form, tension, phase, tone = "paper" } = props;
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
      let frame = 0, frames = 0, active = true;
      renderer.debug.onShaderError = () => { active = false; setReady(false); };
      const draw = () => {
        frame = 0;
        if (!active || cancelled) return;
        try {
          renderer.render(world, camera);
          if (active) { canvas.dataset.renderFrames = String(++frames); setReady(true); }
        }
        catch { active = false; setReady(false); }
      };
      const invalidate = () => { if (!frame && active && !cancelled) frame = requestAnimationFrame(draw); };
      const update = () => {
        paper.color.set(latest.current.tone === "ink" ? "#292b26" : "#e8e1d2");
        paper.roughness = latest.current.tone === "ink" ? .32 : .5;
        paper.metalness = latest.current.tone === "ink" ? .35 : .08;
        const grid = buildFoldGrid(latest.current);
        const columns = grid[0].length;
        const positions = new Float32Array(grid.flatMap((row) => row.flatMap(([x, y, z]) => [x, -y, z])));
        const indices: number[] = [], bodyIndices: number[] = [], edgeIndices: number[] = [];
        for (let row = 0; row < grid.length - 1; row++) for (let col = 0; col < columns - 1; col++) {
          const a = row * columns + col, b = a + columns;
          const face = [a, b, b + 1, a, b + 1, a + 1];
          indices.push(...face);
          (col === 0 || col === columns - 2 ? edgeIndices : bodyIndices).push(...face);
        }
        const base = new THREE.BufferGeometry();
        base.setAttribute("position", new THREE.Float32BufferAttribute(positions, 3));
        base.setIndex(indices); base.computeVertexNormals();
        const body = base.clone(); body.setIndex(bodyIndices);
        const border = base.clone(); border.setIndex(edgeIndices);
        surface.geometry.dispose(); boundary.geometry.dispose(); base.dispose();
        surface.geometry = body; boundary.geometry = border;
        invalidate();
      };
      const resize = () => {
        const { width, height } = canvas.getBoundingClientRect();
        if (!width || !height) return;
        camera.aspect = width / height;
        camera.fov = THREE.MathUtils.radToDeg(2 * Math.atan(280 / 738 * Math.max(1, (640 / 560) / camera.aspect)));
        camera.updateProjectionMatrix(); renderer.setSize(width, height, false); invalidate();
      };
      const lost = (event: Event) => { event.preventDefault(); active = false; setReady(false); };
      canvas.addEventListener("webglcontextlost", lost);
      const observer = new ResizeObserver(resize); observer.observe(canvas);
      scene.current = { update, tilt: (x, y) => { group.rotation.set(y * .18, x * .26, 0); invalidate(); } };
      update(); resize();
      dispose = () => {
        active = false; cancelAnimationFrame(frame); observer.disconnect(); canvas.removeEventListener("webglcontextlost", lost);
        scene.current = null; surface.geometry.dispose(); boundary.geometry.dispose(); groundGeometry.dispose();
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
