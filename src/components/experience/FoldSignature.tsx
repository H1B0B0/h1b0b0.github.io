"use client";

import { useMemo, useRef, type CSSProperties } from "react";
import styles from "./FoldSignature.module.css";

export interface FoldSignatureProps {
  form?: number;
  tension?: number;
  phase?: number;
  className?: string;
  interactive?: boolean;
  onFormChange?: (form: number) => void;
  tone?: "paper" | "ink";
  label?: string;
  as?: "div" | "span";
}

type Point = [number, number, number];
type Facet = { points: string; fill: string; depth: number };

const clamp = (value: number, min = 0, max = 100) => Math.min(max, Math.max(min, value));
const length = (point: Point) => Math.hypot(...point) || 1;
const normalize = (point: Point): Point => {
  const magnitude = length(point);
  return point.map((value) => value / magnitude) as Point;
};
const subtract = (a: Point, b: Point): Point => [a[0] - b[0], a[1] - b[1], a[2] - b[2]];
const add = (a: Point, b: Point): Point => [a[0] + b[0], a[1] + b[1], a[2] + b[2]];
const cross = (a: Point, b: Point): Point => [a[1] * b[2] - a[2] * b[1], a[2] * b[0] - a[0] * b[2], a[0] * b[1] - a[1] * b[0]];

/** A single strip, folded in space. Shared by the opening and the visitor's composition. */
function foldFacets({ form = 52, tension = 50, phase = 0, tone = "paper" }: FoldSignatureProps): Facet[] {
  const fullness = clamp(form) / 100;
  const tautness = clamp(tension) / 100;
  const state = clamp(phase, 0, 5);
  const rotation = state * Math.PI / 6;
  const width = 28 + fullness * 54;
  const xAngle = -.62 + tautness * .5;
  const yAngle = .42 + state * .06;
  const zAngle = -.3 + state * .09;

  function rotate([x, y, z]: Point): Point {
    const ry = y * Math.cos(xAngle) - z * Math.sin(xAngle);
    const rz = y * Math.sin(xAngle) + z * Math.cos(xAngle);
    const rx = x * Math.cos(yAngle) + rz * Math.sin(yAngle);
    const rzz = -x * Math.sin(yAngle) + rz * Math.cos(yAngle);
    return [rx * Math.cos(zAngle) - ry * Math.sin(zAngle), rx * Math.sin(zAngle) + ry * Math.cos(zAngle), rzz];
  }

  function surface(t: number, edge: number): Point {
    const pulse = Math.sin(3 * t + rotation);
    const center: Point = [
      Math.cos(t) * (166 + pulse * (18 + fullness * 28)) * (1.28 - fullness * .63),
      Math.sin(t) * (166 + Math.cos(2 * t + rotation) * 22) * (.78 + fullness * .32),
      Math.sin(2 * t + rotation) * (18 + fullness * 48 + tautness * 28) + Math.sin(3 * t - rotation) * (fullness - .5) * 40,
    ];
    const twist = 1.5 * t + .28 + tautness * .9 + rotation;
    const radial = normalize([center[0], center[1], 0]);
    return rotate([
      center[0] + edge * width * Math.cos(twist) * radial[0],
      center[1] + edge * width * Math.cos(twist) * radial[1],
      center[2] + edge * width * Math.sin(twist),
    ]);
  }

  const project = ([x, y, z]: Point) => {
    const perspective = 820 / (820 - z);
    return `${(320 + x * perspective * .9).toFixed(2)},${(280 + y * perspective * .9).toFixed(2)}`;
  };
  const light = normalize([-.35, -.7, 1]);
  const fillLight = normalize([.75, .15, 1]);
  const halfway = normalize(add(light, [0, 0, 1]));
  const facets: Facet[] = [];
  const segments = 144;
  const strips = 12;
  const border = .965;
  const edgeAt = (index: number) => index === 0 ? -1 : index === strips ? 1 : -border + (index - 1) / (strips - 2) * border * 2;
  const grid = Array.from({ length: segments + 1 }, (_, segment) => Array.from({ length: strips + 1 }, (_, strip) => surface(segment / segments * Math.PI * 2, edgeAt(strip))));
  const projections = grid.map((row) => row.map(project));
  for (let segment = 0; segment < segments; segment++) {
    for (let strip = 0; strip < strips; strip++) {
      const points: Point[] = [grid[segment][strip], grid[segment + 1][strip], grid[segment + 1][strip + 1], grid[segment][strip + 1]];
      // Centred derivatives and a two-sided finish avoid a hard light seam on a Möbius strip.
      const tangent = subtract(add(points[1], points[2]), add(points[0], points[3]));
      const breadth = subtract(add(points[2], points[3]), add(points[0], points[1]));
      const normal = normalize(cross(tangent, breadth));
      const facing = normal[2] < 0 ? normal.map((value) => -value) as Point : normal;
      const dot = (a: Point, b: Point) => a.reduce((sum, value, index) => sum + value * b[index], 0);
      const key = Math.max(0, dot(facing, light));
      const bounce = Math.max(0, dot(facing, fillLight));
      const sheen = Math.pow(Math.max(0, dot(facing, halfway)), 18);
      const grazing = Math.pow(1 - Math.abs(facing[2]), 3);
      const illumination = Math.min(1, key * .74 + bounce * .2 + sheen * .12 + grazing * .07);
      const value = tone === "ink" ? Math.round(19 + illumination * 71) : Math.round(62 + illumination * 182);
      // A Möbius strip has one continuous boundary: both ends of the cross-section share it.
      const edge = strip === 0 || strip === strips - 1;
      const edgeLight = .56 + illumination * .44;
      const fill = edge ? `rgb(${Math.round(255 * edgeLight)},${Math.round(139 * edgeLight)},${Math.round(98 * edgeLight)})` : `rgb(${value},${Math.round(value * .974)},${Math.round(value * .916)})`;
      facets.push({ points: [projections[segment][strip], projections[segment + 1][strip], projections[segment + 1][strip + 1], projections[segment][strip + 1]].join(" "), fill, depth: points.reduce((sum, point) => sum + point[2], 0) / points.length });
    }
  }
  return facets.sort((a, b) => a.depth - b.depth);
}

export function buildFoldSvg(props: Pick<FoldSignatureProps, "form" | "tension" | "phase" | "tone"> = {}): string {
  const polygons = foldFacets(props).map(({ points, fill }) => `<polygon points="${points}" fill="${fill}" stroke="${fill}" stroke-width="0.45" stroke-linejoin="round"/>`).join("");
  return `<svg xmlns="http://www.w3.org/2000/svg" width="640" height="560" viewBox="0 0 640 560"><g>${polygons}</g></svg>`;
}

export default function FoldSignature({
  form = 52,
  tension = 50,
  phase = 0,
  className = "",
  interactive = false,
  onFormChange,
  tone = "paper",
  label = "A ribbon folded in space",
  as: Element = "div",
}: FoldSignatureProps) {
  const facets = useMemo(() => foldFacets({ form, tension, phase, tone }), [form, tension, phase, tone]);
  const polygons = useMemo(() => facets.map(({ points, fill }, index) => <polygon key={index} points={points} fill={fill} stroke={fill} strokeWidth=".45" strokeLinejoin="round" />), [facets]);
  const gesture = useRef<{ id: number; x: number; y: number; form: number; active: boolean } | null>(null);
  const finishGesture = () => { gesture.current = null; };
  return (
    <Element
      className={`${styles.signature} ${className}`}
      data-fold-signature
      data-interactive={interactive || undefined}
      data-sculptable={Boolean(onFormChange) || undefined}
      style={{ "--fold-x": 0, "--fold-y": 0 } as CSSProperties}
      onPointerDown={onFormChange ? (event) => {
        if (!event.isPrimary || event.button !== 0) return;
        gesture.current = { id: event.pointerId, x: event.clientX, y: event.clientY, form, active: false };
        event.currentTarget.setPointerCapture(event.pointerId);
      } : undefined}
      onPointerMove={interactive ? (event) => {
        const current = gesture.current;
        if (current && current.id === event.pointerId && onFormChange) {
          const dx = event.clientX - current.x;
          const dy = event.clientY - current.y;
          // Native vertical panning wins. Only an intentional horizontal gesture sculpts.
          if (!current.active && Math.abs(dy) > Math.max(8, Math.abs(dx))) { finishGesture(); return; }
          if (!current.active && Math.abs(dx) > 8 && Math.abs(dx) > Math.abs(dy)) current.active = true;
          if (current.active) {
            const width = event.currentTarget.getBoundingClientRect().width;
            const next = Math.round(clamp(current.form + dx / Math.max(1, width) * 160));
            if (next !== form) onFormChange(next);
            return;
          }
        }
        if (event.pointerType !== "mouse") return;
        const bounds = event.currentTarget.getBoundingClientRect();
        event.currentTarget.style.setProperty("--fold-x", String((event.clientX - bounds.left) / bounds.width - .5));
        event.currentTarget.style.setProperty("--fold-y", String((event.clientY - bounds.top) / bounds.height - .5));
      } : undefined}
      onPointerUp={finishGesture}
      onPointerCancel={finishGesture}
      onLostPointerCapture={finishGesture}
      onPointerLeave={interactive ? (event) => {
        event.currentTarget.style.setProperty("--fold-x", "0");
        event.currentTarget.style.setProperty("--fold-y", "0");
      } : undefined}
    >
      <svg className={styles.object} viewBox="0 0 640 560" role="img" aria-label={label}>
        <g>
          {polygons}
        </g>
      </svg>
    </Element>
  );
}
