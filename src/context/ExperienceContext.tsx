"use client";

import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useRef,
  useState,
  type ReactNode,
} from "react";

export const EXPERIENCE_DESTINATIONS = [
  "index",
  "work",
  "lab",
  "profile",
  "contact",
] as const;

export type ExperienceDestination = (typeof EXPERIENCE_DESTINATIONS)[number];
export type CreativeChannel = "form" | "motion" | "system";

export type CreativeTrace = Record<CreativeChannel, number>;

export type FoldComposition = {
  form: number;
  tension: number;
  phase: number;
  name: string;
  authored: boolean;
};

export const INITIAL_COMPOSITION: FoldComposition = {
  form: 42, tension: 36, phase: 0, name: "", authored: false,
};

type ExperienceContextValue = {
  destination: ExperienceDestination;
  previewDestination: ExperienceDestination | null;
  visited: ExperienceDestination[];
  trace: CreativeTrace;
  composition: FoldComposition;
  updateComposition: (next: Partial<FoldComposition>) => void;
  pulse: number;
  sessionSeed: number;
  pointerEnergy: number;
  pointerEnergyRef: React.MutableRefObject<number>;
  travelTo: (destination: ExperienceDestination) => void;
  setPreviewDestination: (destination: ExperienceDestination | null) => void;
  addTrace: (channel: CreativeChannel, amount?: number) => void;
  setPointerEnergy: (energy: number) => void;
};

const ExperienceContext = createContext<ExperienceContextValue | null>(null);

const INITIAL_TRACE: CreativeTrace = {
  form: 0.14,
  motion: 0.12,
  system: 0.1,
};

function clamp01(value: number) {
  return Math.max(0, Math.min(1, value));
}

export function ExperienceProvider({ children }: { children: ReactNode }) {
  const [destination, setDestination] = useState<ExperienceDestination>("index");
  const [previewDestination, setPreviewDestination] = useState<ExperienceDestination | null>(null);
  const [visited, setVisited] = useState<ExperienceDestination[]>(["index"]);
  const [trace, setTrace] = useState<CreativeTrace>(INITIAL_TRACE);
  const [composition, setComposition] = useState<FoldComposition>(INITIAL_COMPOSITION);
  const [pulse, setPulse] = useState(0);
  const [sessionSeed, setSessionSeed] = useState(0.42);
  const [pointerEnergy, setPointerEnergyState] = useState(0.08);
  const pointerEnergyRef = useRef(0);

  useEffect(() => {
    setSessionSeed(Math.random());
  }, []);

  const travelTo = useCallback((nextDestination: ExperienceDestination) => {
    setDestination(nextDestination);
    setPreviewDestination(null);
    setVisited((current) =>
      current.includes(nextDestination) ? current : [...current, nextDestination],
    );
    setPulse((current) => current + 1);
  }, []);

  const addTrace = useCallback((channel: CreativeChannel, amount = 0.08) => {
    setTrace((current) => ({
      ...current,
      [channel]: clamp01(current[channel] + amount),
    }));
    setPulse((current) => current + 1);
  }, []);

  const setPointerEnergy = useCallback((energy: number) => {
    const next = clamp01(energy);
    pointerEnergyRef.current = next;
    setPointerEnergyState((current) => Math.abs(current - next) >= 0.035 ? next : current);
  }, []);

  // Session-only: navigating never discards the visitor's piece; nothing is uploaded or stored.
  const updateComposition = useCallback((next: Partial<FoldComposition>) => {
    setComposition((current) => ({ ...current, ...next }));
  }, []);

  const value = useMemo<ExperienceContextValue>(
    () => ({
      destination,
      previewDestination,
      visited,
      trace,
      composition,
      updateComposition,
      pulse,
      sessionSeed,
      pointerEnergy,
      pointerEnergyRef,
      travelTo,
      setPreviewDestination,
      addTrace,
      setPointerEnergy,
    }),
    [addTrace, composition, destination, pointerEnergy, previewDestination, pulse, sessionSeed, setPointerEnergy, trace, travelTo, updateComposition, visited],
  );

  return <ExperienceContext.Provider value={value}>{children}</ExperienceContext.Provider>;
}

export function useExperience() {
  const value = useContext(ExperienceContext);
  if (!value) {
    throw new Error("useExperience must be used within an ExperienceProvider");
  }
  return value;
}
