import type { FoldComposition } from "@/context/ExperienceContext";
import { buildFoldSvg } from "./FoldSignature";

const xml = (value: string) => value.replace(/[&<>"']/g, (character) => ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&apos;" }[character] ?? character));
const base64 = (bytes: Uint8Array) => {
  let binary = "";
  for (const byte of bytes) binary += String.fromCharCode(byte);
  return btoa(binary);
};
const text64 = (value: string) => base64(new TextEncoder().encode(value));
const wrap = (value: string) => value.match(/.{1,72}/g)?.join("\r\n") ?? "";

export function buildEmailSignatureSvg(composition: FoldComposition, language: "fr" | "en"): string {
  const fold = buildFoldSvg({ ...composition, tone: "ink" }).replace(/<svg\b[^>]*>/, "").replace(/<\/svg>\s*$/, "");
  const title = composition.name || (language === "fr" ? "Mon pli" : "My fold");
  const size = Math.min(36, 280 / Math.max(8, title.length));
  return `<svg xmlns="http://www.w3.org/2000/svg" width="600" height="260" viewBox="0 0 600 260"><rect width="600" height="260" rx="4" fill="#ede9e0"/><g transform="translate(0 12) scale(.42)">${fold}</g><text x="286" y="116" font-family="Arial,sans-serif" font-size="${size}" fill="#282a23">${xml(title)}</text><path d="M286 138H562" stroke="#ab452a" stroke-width="1"/><text x="286" y="164" font-family="Arial,sans-serif" font-size="11" fill="#686a60">${language === "fr" ? "Un pli créé sur le portfolio d’Etienne Mentrel" : "A fold made on Etienne Mentrel’s portfolio"}</text></svg>`;
}

/** One local rasterisation, only for exporting an email-compatible signature. */
export async function createEmailSignaturePng(composition: FoldComposition, language: "fr" | "en"): Promise<Blob> {
  const url = URL.createObjectURL(new Blob([buildEmailSignatureSvg(composition, language)], { type: "image/svg+xml" }));
  try {
    const image = new Image();
    const loaded = new Promise<void>((resolve, reject) => {
      image.onload = () => resolve();
      image.onerror = () => reject(new Error("Signature image unavailable"));
    });
    image.src = url;
    await loaded;
    const canvas = document.createElement("canvas");
    canvas.width = 1200;
    canvas.height = 520;
    const context = canvas.getContext("2d");
    if (!context) throw new Error("Signature export unavailable");
    context.drawImage(image, 0, 0, canvas.width, canvas.height);
    return await new Promise<Blob>((resolve, reject) => canvas.toBlob((blob) => blob ? resolve(blob) : reject(new Error("PNG export unavailable")), "image/png"));
  } finally { URL.revokeObjectURL(url); }
}

/** A real MIME email, with the signature PNG embedded by Content-ID. */
export function buildSignedEmail({ composition, png, pieceUrl, language }: { composition: FoldComposition; png: Uint8Array; pieceUrl: string; language: "fr" | "en" }): string {
  const subject = language === "fr" ? "Une idée, accompagnée de mon pli" : "An idea, with my fold";
  const greeting = language === "fr" ? "Bonjour Etienne," : "Hello Etienne,";
  const project = language === "fr" ? "Mon idée / mon projet :" : "My idea / project:";
  const signature = composition.name || (language === "fr" ? "Mon pli" : "My fold");
  const plain = `${greeting}\r\n\r\n${project}\r\n\r\n\r\n${signature}\r\n${pieceUrl}`;
  const html = `<!doctype html><html><body style="font-family:Arial,sans-serif;color:#282a23"><p>${greeting}</p><p>${project}</p><p><br></p><div style="margin-top:32px"><img src="cid:fold-signature@portfolio.local" width="420" height="182" alt="${xml(signature)}" style="display:block;width:420px;max-width:100%;height:auto;border:0"><p style="font-size:12px"><a href="${xml(pieceUrl)}">${language === "fr" ? "Voir le pli" : "View the fold"}</a></p></div></body></html>`;
  return [
    "X-Unsent: 1", "To: Etienne Mentrel <etienne.mentrel@gmail.com>", `Subject: =?UTF-8?B?${text64(subject)}?=`, "MIME-Version: 1.0",
    'Content-Type: multipart/related; boundary="__fold_related__"', "", "--__fold_related__",
    'Content-Type: multipart/alternative; boundary="__fold_alternative__"', "", "--__fold_alternative__",
    "Content-Type: text/plain; charset=UTF-8", "Content-Transfer-Encoding: base64", "", wrap(text64(plain)), "--__fold_alternative__",
    "Content-Type: text/html; charset=UTF-8", "Content-Transfer-Encoding: base64", "", wrap(text64(html)), "--__fold_alternative__--",
    "--__fold_related__", 'Content-Type: image/png; name="signature-pli.png"', "Content-Transfer-Encoding: base64",
    "Content-ID: <fold-signature@portfolio.local>", 'Content-Disposition: inline; filename="signature-pli.png"', "", wrap(base64(png)), "--__fold_related__--", "",
  ].join("\r\n");
}
