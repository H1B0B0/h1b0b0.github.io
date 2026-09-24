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

type ExperienceContextValue = {
  destination: ExperienceDestination;
  previewDestination: ExperienceDestination | null;
  visited: ExperienceDestination[];
  trace: CreativeTrace;
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

  const value = useMemo<ExperienceContextValue>(
    () => ({
      destination,
      previewDestination,
      visited,
      trace,
      pulse,
      sessionSeed,
      pointerEnergy,
      pointerEnergyRef,
      travelTo,
      setPreviewDestination,
      addTrace,
      setPointerEnergy,
    }),
    [addTrace, destination, pointerEnergy, previewDestination, pulse, sessionSeed, setPointerEnergy, trace, travelTo, visited],
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
