// FX controller: centralized parameters for hero/ambient effects
const FX = {
  monolith: {
    glowIntensity: 0.9,
    breatheSpeed: 0.12, // cycles per second
    breatheAmplitude: 0.06,
  },
  aurora: {
    opacity: 0.28,
    driftDuration: 22,
  },
  performance: {
    desktopFpsTarget: 60,
    mobileFpsTarget: 30,
  }
} as const;

export default FX;
