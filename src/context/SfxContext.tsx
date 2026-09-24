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

export type SfxCue = "hover" | "press" | "navigate" | "propagate" | "slider";

type SfxContextValue = {
  enabled: boolean;
  play: (cue: SfxCue, intensity?: number) => void;
  toggle: () => void;
};

const SfxContext = createContext<SfxContextValue | null>(null);
const SFX_PREFERENCE_KEY = "portfolio:sfx-enabled";

type AudioWindow = Window & typeof globalThis & {
  webkitAudioContext?: typeof AudioContext;
};

type ToneOptions = {
  at?: number;
  duration: number;
  from: number;
  gain: number;
  to?: number;
  type?: OscillatorType;
};

function scheduleTone(context: AudioContext, options: ToneOptions) {
  const start = context.currentTime + (options.at ?? 0);
  const end = start + options.duration;
  const oscillator = context.createOscillator();
  const envelope = context.createGain();

  oscillator.type = options.type ?? "sine";
  oscillator.frequency.setValueAtTime(options.from, start);
  oscillator.frequency.exponentialRampToValueAtTime(Math.max(24, options.to ?? options.from), end);
  envelope.gain.setValueAtTime(0.0001, start);
  envelope.gain.exponentialRampToValueAtTime(options.gain, start + Math.min(0.012, options.duration * 0.25));
  envelope.gain.exponentialRampToValueAtTime(0.0001, end);
  oscillator.connect(envelope);
  envelope.connect(context.destination);
  oscillator.start(start);
  oscillator.stop(end + 0.015);
}

function synthesize(context: AudioContext, cue: SfxCue | "toggle-on" | "toggle-off", intensity = 0.5) {
  const amount = Math.max(0, Math.min(1, intensity));

  if (cue === "hover") {
    scheduleTone(context, { from: 540, to: 690, duration: 0.045, gain: 0.009 });
    return;
  }

  if (cue === "slider") {
    const frequency = 150 + amount * 560;
    scheduleTone(context, { from: frequency, to: frequency * 1.035, duration: 0.035, gain: 0.011, type: "sine" });
    return;
  }

  if (cue === "press") {
    scheduleTone(context, { from: 150, to: 118, duration: 0.075, gain: 0.018, type: "triangle" });
    scheduleTone(context, { at: 0.006, from: 520, to: 410, duration: 0.045, gain: 0.006 });
    return;
  }

  if (cue === "navigate") {
    scheduleTone(context, { from: 174, to: 196, duration: 0.12, gain: 0.014, type: "triangle" });
    scheduleTone(context, { at: 0.038, from: 261, to: 329, duration: 0.13, gain: 0.01 });
    return;
  }

  if (cue === "propagate") {
    const frequency = 126 * 2 ** (amount * 2.15);
    scheduleTone(context, {
      from: frequency * 0.86,
      to: frequency * 1.12,
      duration: 0.14,
      gain: 0.017,
      type: amount < 0.45 ? "triangle" : "sine",
    });
    scheduleTone(context, {
      at: 0.045,
      from: frequency * 1.5,
      to: frequency * 1.72,
      duration: 0.12,
      gain: 0.008,
    });
    return;
  }

  if (cue === "toggle-on") {
    scheduleTone(context, { from: 220, to: 330, duration: 0.11, gain: 0.014, type: "triangle" });
    scheduleTone(context, { at: 0.055, from: 440, to: 660, duration: 0.13, gain: 0.01 });
    return;
  }

  scheduleTone(context, { from: 330, to: 128, duration: 0.12, gain: 0.012, type: "triangle" });
}

function interactiveTarget(target: EventTarget | null) {
  return target instanceof Element
    ? target.closest<HTMLElement>("[data-sfx], button, a, input[type='range']")
    : null;
}

function cueForTarget(target: HTMLElement): SfxCue | null {
  if (target.hasAttribute("data-sfx-control") || target.dataset.sfx === "none") return null;
  if (target.dataset.sfx === "propagate") return "propagate";
  if (target.dataset.sfx === "navigate") return "navigate";
  if (target.matches("input[type='range']")) return "slider";
  if (target.matches("a") || target.closest("nav")) return "navigate";
  return "press";
}

function intensityForTarget(target: HTMLElement) {
  const explicit = Number(target.dataset.sfxIntensity);
  if (Number.isFinite(explicit)) return Math.max(0, Math.min(1, explicit));
  if (target instanceof HTMLInputElement) {
    return Number(target.value) / Math.max(1, Number(target.max));
  }
  return 0.5;
}

export function SfxProvider({ children }: { children: ReactNode }) {
  const [enabled, setEnabled] = useState(true);
  const enabledRef = useRef(true);
  const contextRef = useRef<AudioContext | null>(null);
  const unlockedRef = useRef(false);
  const lastSliderSoundRef = useRef(0);

  const ensureContext = useCallback(() => {
    if (contextRef.current) return contextRef.current;
    const AudioContextClass = window.AudioContext ?? (window as AudioWindow).webkitAudioContext;
    if (!AudioContextClass) return null;
    contextRef.current = new AudioContextClass({ latencyHint: "interactive" });
    return contextRef.current;
  }, []);

  const play = useCallback((cue: SfxCue, intensity = 0.5) => {
    if (!enabledRef.current) return;
    const context = ensureContext();
    if (!context) return;

    const run = () => {
      unlockedRef.current = true;
      synthesize(context, cue, intensity);
    };

    if (context.state === "suspended") {
      void context.resume().then(run).catch(() => undefined);
    } else if (context.state === "running") {
      run();
    }
  }, [ensureContext]);

  const toggle = useCallback(() => {
    const next = !enabledRef.current;
    const context = ensureContext();

    if (!next && context?.state === "running") synthesize(context, "toggle-off");
    enabledRef.current = next;
    setEnabled(next);
    window.localStorage.setItem(SFX_PREFERENCE_KEY, String(next));

    if (next && context) {
      const announce = () => {
        unlockedRef.current = true;
        synthesize(context, "toggle-on");
      };
      if (context.state === "suspended") void context.resume().then(announce).catch(() => undefined);
      else if (context.state === "running") announce();
    }
  }, [ensureContext]);

  useEffect(() => {
    const stored = window.localStorage.getItem(SFX_PREFERENCE_KEY);
    if (stored !== "false") return;
    enabledRef.current = false;
    setEnabled(false);
  }, []);

  useEffect(() => {
    const reducedMotion = window.matchMedia("(prefers-reduced-motion: reduce)");

    const onPointerDown = (event: PointerEvent) => {
      const target = interactiveTarget(event.target);
      if (!target) return;
      const cue = cueForTarget(target);
      if (!cue) return;
      play(cue, intensityForTarget(target));
    };

    const onPointerOver = (event: PointerEvent) => {
      if (!unlockedRef.current || reducedMotion.matches) return;
      const target = interactiveTarget(event.target);
      if (!target || target.hasAttribute("data-sfx-control")) return;
      if (event.relatedTarget instanceof Node && target.contains(event.relatedTarget)) return;
      play("hover", 0.35);
    };

    const onInput = (event: Event) => {
      const target = interactiveTarget(event.target);
      if (!(target instanceof HTMLInputElement) || target.type !== "range") return;
      const now = performance.now();
      if (now - lastSliderSoundRef.current < 42) return;
      lastSliderSoundRef.current = now;
      play("slider", Number(target.value) / Math.max(1, Number(target.max)));
    };

    const onKeyDown = (event: KeyboardEvent) => {
      if (event.key !== "Enter" && event.key !== " ") return;
      const target = interactiveTarget(event.target);
      if (!target) return;
      const cue = cueForTarget(target);
      if (cue) play(cue, intensityForTarget(target));
    };

    document.addEventListener("pointerdown", onPointerDown, { capture: true });
    document.addEventListener("pointerover", onPointerOver, { capture: true });
    document.addEventListener("input", onInput, { capture: true });
    document.addEventListener("keydown", onKeyDown, { capture: true });

    return () => {
      document.removeEventListener("pointerdown", onPointerDown, { capture: true });
      document.removeEventListener("pointerover", onPointerOver, { capture: true });
      document.removeEventListener("input", onInput, { capture: true });
      document.removeEventListener("keydown", onKeyDown, { capture: true });
    };
  }, [play]);

  const value = useMemo(() => ({ enabled, play, toggle }), [enabled, play, toggle]);
  return <SfxContext.Provider value={value}>{children}</SfxContext.Provider>;
}

export function useSfx() {
  const context = useContext(SfxContext);
  if (!context) throw new Error("useSfx must be used within SfxProvider");
  return context;
}
