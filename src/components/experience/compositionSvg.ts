import { buildFoldSvg } from "./FoldSignature";

type CompositionSvgOptions = { form: number; tension: number; phase: number; title: string };

/** The exported piece shares its actual geometry with the on-screen sculpture. */
export function buildCompositionSvg({ form, tension, phase, title }: CompositionSvgOptions): string {
  const sculpture = buildFoldSvg({ form, tension, phase, tone: "ink" }).replace(/<svg\b[^>]*>/, "").replace(/<\/svg>\s*$/, "");
  const escapedTitle = title.replace(/[&<>"']/g, (character) => ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&apos;" }[character] ?? character));
  const fontSize = Math.min(108, 620 / Math.max(8, title.length));
  const scale = .9 + tension / 1000;
  const slant = (tension - 50) * -.08;
  return `<svg xmlns="http://www.w3.org/2000/svg" width="720" height="800" viewBox="0 0 720 800"><rect width="720" height="800" fill="#ede9e0"/><path d="M360 24V724" stroke="#282a23" stroke-opacity=".06"/><g transform="translate(40 18)">${sculpture}</g><g transform="translate(360 654) scale(${scale} 1) skewX(${slant})"><text x="0" y="32" text-anchor="middle" font-family="Arial,sans-serif" font-size="${fontSize}" font-weight="${400 + tension * 3.5}" fill="#282a23">${escapedTitle}</text></g><path d="M40 744H680" stroke="#282a23" stroke-opacity=".2"/><text x="40" y="774" font-family="monospace" font-size="12" fill="#686a60">ETIENNE MENTREL / ATELIER</text><text x="680" y="774" text-anchor="end" font-family="monospace" font-size="12" fill="#ab452a">${form} · ${tension} · ${phase + 1}/6</text></svg>`;
}
