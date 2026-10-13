import type { FoldComposition } from "@/context/ExperienceContext";

const cleanName = (name: string) => Array.from(name.replace(/[\u0000-\u001f\u007f]/g, "").trim())
  .filter((character) => character.length !== 1 || !/[\ud800-\udfff]/.test(character)).slice(0, 24).join("");

/** A small, self-contained link: no upload, account or stored visitor data. */
export function buildCompositionHash(composition: FoldComposition): string {
  const parameters = new URLSearchParams({ piece: "1", form: String(composition.form), tension: String(composition.tension), phase: String(composition.phase) });
  const name = cleanName(composition.name);
  if (name) parameters.set("name", name);
  return `#lab?${parameters}`;
}

export function parseCompositionHash(hash: string): FoldComposition | null {
  const [route, query] = hash.replace(/^#/, "").split("?");
  if (route.toLowerCase() !== "lab" || !query) return null;
  const parameters = new URLSearchParams(query);
  if (parameters.get("piece") !== "1") return null;
  const values = ["form", "tension", "phase"].map((key) => {
    const value = parameters.get(key);
    return parameters.getAll(key).length === 1 && value && /^\d{1,3}$/.test(value) ? Number(value) : NaN;
  });
  const [form, tension, phase] = values;
  if (!values.every(Number.isFinite) || form > 100 || tension > 100 || phase > 5) return null;
  return { form, tension, phase, name: cleanName(parameters.get("name") ?? ""), authored: true };
}

export function buildCompositionMailto(email: string, composition: FoldComposition, pageUrl: string, language: "fr" | "en"): string {
  if (!composition.authored) return `mailto:${email}`;
  const base = new URL(pageUrl);
  base.search = "";
  base.hash = buildCompositionHash(composition);
  const name = cleanName(composition.name);
  const subject = language === "fr" ? "Une idée, accompagnée de mon pli" : "An idea, with my fold";
  const body = language === "fr"
    ? `Bonjour Etienne,\r\n\r\nJ’ai parcouru votre portfolio et voici le pli que j’y ai composé${name ? ` : ${name}` : ""}.\r\n\r\nVoir ma composition :\r\n${base.href}\r\n\r\nMon idée / mon projet :\r\n\r\n`
    : `Hello Etienne,\r\n\r\nI explored your portfolio and made this fold${name ? `: ${name}` : ""}.\r\n\r\nView my composition:\r\n${base.href}\r\n\r\nMy idea / project:\r\n\r\n`;
  return `mailto:${email}?subject=${encodeURIComponent(subject)}&body=${encodeURIComponent(body)}`;
}
