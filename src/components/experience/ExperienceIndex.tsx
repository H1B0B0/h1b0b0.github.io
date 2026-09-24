"use client";

import { useCallback, useEffect, useRef, useState } from "react";

import type { CreativeDestination } from "./CreativeMatter";
import styles from "./ExperienceIndex.module.css";

export type IndexDestination = {
  id: Exclude<CreativeDestination, "index">;
  label: string;
  description?: string;
  meta?: string;
};

export interface ExperienceIndexProps {
  name?: string;
  role: string;
  eyebrow?: string;
  title: string;
  titleAccent?: string;
  description?: string;
  destinations: readonly IndexDestination[];
  visited?: readonly CreativeDestination[];
  activeDestination?: CreativeDestination;
  instruction?: string;
  edition?: string;
  visitedLabel?: string;
  matterLabel?: string;
  tracesLabel?: string;
  channels?: Partial<Record<"form" | "motion" | "system", number>>;
  channelLabels?: Partial<Record<"form" | "motion" | "system", string>>;
  onNavigate: (destination: IndexDestination["id"]) => void;
  onPreviewDestination?: (destination: IndexDestination["id"] | null) => void;
  onPointerEnergyChange?: (energy: number) => void;
  className?: string;
}

function clamp01(value: number) {
  return Math.max(0, Math.min(1, value));
}

export default function ExperienceIndex({
  name = "Etienne Mentrel",
  role,
  eyebrow = "Creative developer · Systems & experiences",
  title,
  titleAccent,
  description,
  destinations,
  visited = [],
  activeDestination = "index",
  instruction = "Move to tune the matter · Choose a destination",
  edition = "Portfolio · 2026",
  visitedLabel = "Visited",
  matterLabel = "Living matter",
  tracesLabel = "traces",
  channels = {},
  channelLabels = {},
  onNavigate,
  onPreviewDestination,
  onPointerEnergyChange,
  className = "",
}: ExperienceIndexProps) {
  const rootRef = useRef<HTMLElement>(null);
  const lastPointRef = useRef({ x: 0, y: 0, time: 0 });
  const callbackFrameRef = useRef(0);
  const pendingEnergyRef = useRef(0);
  const [previewedDestination, setPreviewedDestination] = useState<IndexDestination | null>(null);
  const visitedSet = new Set(visited);

  const emitEnergy = useCallback(
    (energy: number) => {
      const next = clamp01(energy);
      pendingEnergyRef.current = next;
      rootRef.current?.style.setProperty("--index-energy", String(next));
      if (!onPointerEnergyChange || callbackFrameRef.current) return;
      callbackFrameRef.current = window.requestAnimationFrame(() => {
        callbackFrameRef.current = 0;
        onPointerEnergyChange(pendingEnergyRef.current);
      });
    },
    [onPointerEnergyChange],
  );

  useEffect(() => {
    return () => {
      if (callbackFrameRef.current) window.cancelAnimationFrame(callbackFrameRef.current);
    };
  }, []);

  const handlePointerMove = (event: React.PointerEvent<HTMLElement>) => {
    const bounds = event.currentTarget.getBoundingClientRect();
    const x = clamp01((event.clientX - bounds.left) / Math.max(1, bounds.width));
    const y = clamp01((event.clientY - bounds.top) / Math.max(1, bounds.height));
    event.currentTarget.style.setProperty("--index-x", String(x));
    event.currentTarget.style.setProperty("--index-y", String(y));

    const now = performance.now();
    const previous = lastPointRef.current;
    const elapsed = Math.max(16, now - previous.time);
    const distance = Math.hypot(x - previous.x, y - previous.y);
    const velocity = previous.time === 0 ? 0.18 : (distance / elapsed) * 1000;
    lastPointRef.current = { x, y, time: now };
    emitEnergy(Math.max(0.12, Math.min(1, velocity * 0.72)));
  };

  const handlePointerLeave = () => {
    lastPointRef.current.time = 0;
    emitEnergy(0.08);
    setPreviewedDestination(null);
    onPreviewDestination?.(null);
  };

  const channelItems = [
    { key: "form" as const, label: channelLabels.form ?? "Form", level: clamp01(channels.form ?? 0.7) },
    { key: "motion" as const, label: channelLabels.motion ?? "Motion", level: clamp01(channels.motion ?? 0.62) },
    { key: "system" as const, label: channelLabels.system ?? "System", level: clamp01(channels.system ?? 0.76) },
  ];

  return (
    <section
      ref={rootRef}
      className={`${styles.index} ${className}`}
      data-experience-index
      data-preview={previewedDestination?.id}
      aria-labelledby="experience-index-title"
      onPointerMove={handlePointerMove}
      onPointerDown={() => emitEnergy(1)}
      onPointerLeave={handlePointerLeave}
    >
      <header className={styles.identity}>
        <span className={styles.identityName}>{name}</span>
        <span className={styles.role}>{role}</span>
      </header>

      <div className={styles.hero}>
        <div className={styles.statement}>
          <p className={styles.eyebrow}>{eyebrow}</p>
          <h1 className={styles.title} id="experience-index-title">
            {title}
            {titleAccent && <span className={styles.titleAccent}>{titleAccent}</span>}
          </h1>
          {description && <p className={styles.description}>{description}</p>}
        </div>

        <div className={styles.instrument} aria-hidden="true">
          <div className={styles.instrumentMeta}>
            <span>
              {previewedDestination
                ? `${String(destinations.indexOf(previewedDestination) + 1).padStart(2, "0")} / ${previewedDestination.label}`
                : matterLabel}
            </span>
            <span>{String(visitedSet.size).padStart(2, "0")} {tracesLabel}</span>
          </div>
          <span className={styles.instrumentWord}>
            {previewedDestination?.label ?? "Trace"}
          </span>
          <div className={styles.channels}>
            {channelItems.map((channel) => (
              <span
                className={styles.channel}
                key={channel.key}
                style={{ "--channel-level": channel.level } as React.CSSProperties}
              >
                <i />
                <span>{channel.label}</span>
              </span>
            ))}
          </div>
        </div>
      </div>

      <nav className={styles.destinations} aria-label={instruction}>
        {destinations.map((destination, index) => {
          const wasVisited = visitedSet.has(destination.id);
          const isActive = activeDestination === destination.id;
          return (
            <button
              className={styles.destination}
              type="button"
              key={destination.id}
              aria-current={isActive ? "page" : undefined}
              aria-label={`${destination.label}${wasVisited ? ` · ${visitedLabel}` : ""}`}
              onPointerEnter={() => {
                emitEnergy(0.48);
                setPreviewedDestination(destination);
                onPreviewDestination?.(destination.id);
              }}
              onPointerLeave={() => {
                setPreviewedDestination(null);
                onPreviewDestination?.(null);
              }}
              onFocus={() => {
                emitEnergy(0.48);
                setPreviewedDestination(destination);
                onPreviewDestination?.(destination.id);
              }}
              onBlur={() => {
                emitEnergy(0.08);
                setPreviewedDestination(null);
                onPreviewDestination?.(null);
              }}
              onClick={() => {
                emitEnergy(1);
                onNavigate(destination.id);
              }}
            >
              <span className={styles.destinationIndex}>{String(index + 1).padStart(2, "0")}</span>
              <span className={styles.destinationText}>
                <span className={styles.destinationLabel}>{destination.label}</span>
                {destination.description && (
                  <span className={styles.destinationDescription}>{destination.description}</span>
                )}
              </span>
              {wasVisited ? (
                <span className={styles.visited}>{visitedLabel}</span>
              ) : destination.meta ? (
                <span className={styles.destinationMeta}>{destination.meta}</span>
              ) : null}
            </button>
          );
        })}
      </nav>

      <footer className={styles.footer}>
        <span className={styles.hint}>{instruction}</span>
        <span>{edition}</span>
      </footer>
    </section>
  );
}
