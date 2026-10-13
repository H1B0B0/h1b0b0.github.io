import assert from "node:assert/strict";
import { readFileSync } from "node:fs";
import { createRequire } from "node:module";
import { dirname, resolve } from "node:path";
import ts from "typescript";

// Source-only checks: no browser, UI automation, network, or generated files.
const nativeRequire = createRequire(import.meta.url);
const cache = new Map();
function sourceModule(path) {
  const filename = resolve(path);
  if (cache.has(filename)) return cache.get(filename).exports;
  const loaded = { exports: {} };
  cache.set(filename, loaded);
  const source = readFileSync(filename, "utf8");
  const { outputText } = ts.transpileModule(source, {
    compilerOptions: { target: ts.ScriptTarget.ES2022, module: ts.ModuleKind.CommonJS, jsx: ts.JsxEmit.ReactJSX, esModuleInterop: true },
    fileName: filename,
  });
  const requireSource = (id) => {
    if (id.endsWith(".module.css")) return {};
    if (id.startsWith(".")) {
      const relative = resolve(dirname(filename), id);
      return sourceModule(relative + (id === "./FoldSignature" ? ".tsx" : ".ts"));
    }
    return nativeRequire(id);
  };
  new Function("require", "module", "exports", outputText)(requireSource, loaded, loaded.exports);
  return loaded.exports;
}

const { buildFoldSvg, buildFoldGrid } = sourceModule("src/components/experience/FoldSignature.tsx");
const { buildCompositionSvg } = sourceModule("src/components/experience/compositionSvg.ts");
let count = 0;
for (const form of [0, 10, 20, 30, 40, 50, 60, 70, 80, 90, 100]) {
  for (const tension of [0, 10, 20, 30, 40, 50, 60, 70, 80, 90, 100]) {
    for (let phase = 0; phase < 6; phase++) {
      const svg = buildFoldSvg({ form, tension, phase });
      const grid = buildFoldGrid({ form, tension, phase });
      assert.equal(grid.length, 145);
      assert.equal(grid[0].length, 13);
      for (let edge = 0; edge < 13; edge++) for (let axis = 0; axis < 3; axis++) {
        assert.ok(Math.abs(grid[0][edge][axis] - grid[144][12 - edge][axis]) < 1e-6, "The studio and vector export must share one closed Möbius surface");
      }
      const polygons = [...svg.matchAll(/points="([^"]+)"/g)];
      assert.equal(polygons.length, 1728);
      for (const [, points] of polygons) {
        for (const coordinate of points.split(" ")) {
          const [x, y] = coordinate.split(",").map(Number);
          assert.ok(Number.isFinite(x) && Number.isFinite(y));
          assert.ok(x >= 0 && x <= 640 && y >= 0 && y <= 560, `Clipped fold: ${form}/${tension}/${phase} at ${coordinate}`);
        }
      }
      count++;
    }
  }
}
const title = `A < B & C "D" 'E'`;
const poster = buildCompositionSvg({ form: 100, tension: 100, phase: 5, title });
assert.ok(poster.includes('xmlns="http://www.w3.org/2000/svg"'));
assert.ok(poster.includes("A &lt; B &amp; C &quot;D&quot; &apos;E&apos;"));
assert.ok(poster.includes("100 · 100 · 6/6"));
assert.equal((poster.match(/<polygon /g) ?? []).length, 1728);
assert.equal((poster.match(/<svg /g) ?? []).length, 1);
assert.equal((poster.match(/<\/svg>/g) ?? []).length, 1);
assert.ok(!poster.includes("<script"));
assert.ok(poster.includes('scale(1 1) skewX(-4)'));
assert.ok(poster.includes('fill="#ede9e0"'));
const inkPolygons = buildFoldSvg({ form: 100, tension: 100, phase: 5, tone: "ink" }).match(/<polygon[^>]+>/g);
assert.deepEqual(poster.match(/<polygon[^>]+>/g), inkPolygons);
assert.ok(buildCompositionSvg({ form: 42, tension: 0, phase: 0, title: "CALME" }).includes('scale(0.9 1) skewX(4)'));
const longName = buildCompositionSvg({ form: 0, tension: 0, phase: 0, title: "W".repeat(24) });
const fontSize = Number(longName.match(/font-size="([\d.]+)" font-weight=/)?.[1]);
assert.ok(fontSize * 24 <= 640);
assert.notEqual(buildFoldSvg({ form: 0 }), buildFoldSvg({ form: 100 }));
const { buildCompositionHash, parseCompositionHash, buildCompositionMailto } = sourceModule("src/components/experience/compositionShare.ts");
const shared = { form: 83, tension: 100, phase: 5, name: "Un Pli & <ÉTÉ>", authored: true };
const hash = buildCompositionHash(shared);
assert.deepEqual(parseCompositionHash(hash), shared);
assert.equal(parseCompositionHash("#lab"), null);
for (const query of ["form=101&tension=50&phase=0", "form=-1&tension=50&phase=0", "form=1&form=2&tension=50&phase=0", "form=1&tension=NaN&phase=0", "form=1&tension=50&phase=6", "form=1.5&tension=50&phase=0"]) {
  assert.equal(parseCompositionHash(`#lab?piece=1&${query}`), null);
}
assert.equal(parseCompositionHash(hash.replace("#lab", "#work")), null);
const mail = buildCompositionMailto("etienne.mentrel@gmail.com", shared, "https://example.org/folio/?tracking=secret#contact", "fr");
const mailParams = new URLSearchParams(mail.split("?")[1]);
const body = mailParams.get("body");
assert.ok(body.includes("Un Pli & <ÉTÉ>"));
assert.ok(body.includes(`https://example.org/folio/${hash}`));
assert.ok(!body.includes("tracking"));
assert.ok(mailParams.get("subject").includes("mon pli"));
assert.equal(buildCompositionMailto("etienne.mentrel@gmail.com", { ...shared, authored: false }, "https://example.org", "fr"), "mailto:etienne.mentrel@gmail.com");
assert.ok(buildCompositionMailto("etienne.mentrel@gmail.com", { ...shared, name: "x\ud800y\r\nSubject: surprise" }, "https://example.org", "en").startsWith("mailto:"));
const { buildEmailSignatureSvg, buildSignedEmail } = sourceModule("src/components/experience/compositionEmail.ts");
const signatureSvg = buildEmailSignatureSvg(shared, "fr");
assert.equal((signatureSvg.match(/<polygon /g) ?? []).length, 1728);
assert.ok(signatureSvg.includes("Un Pli &amp; &lt;ÉTÉ&gt;"));
const png = new Uint8Array([137, 80, 78, 71, 13, 10, 26, 10]);
const eml = buildSignedEmail({ composition: shared, png, pieceUrl: `https://example.org/${hash}`, language: "fr" });
assert.ok(eml.startsWith("X-Unsent: 1\r\nTo: Etienne Mentrel <etienne.mentrel@gmail.com>\r\n"));
assert.ok(eml.includes("Content-ID: <fold-signature@portfolio.local>"));
assert.ok(eml.includes('Content-Disposition: inline; filename="signature-pli.png"'));
const htmlPart = eml.split("Content-Type: text/html; charset=UTF-8\r\nContent-Transfer-Encoding: base64\r\n\r\n")[1].split("\r\n--__fold_alternative__--")[0];
assert.ok(Buffer.from(htmlPart.replace(/\r\n/g, ""), "base64").toString("utf8").includes('src="cid:fold-signature@portfolio.local"'));
const pngPart = eml.split('Content-Disposition: inline; filename="signature-pli.png"\r\n\r\n')[1].split("\r\n--__fold_related__--")[0];
assert.deepEqual(new Uint8Array(Buffer.from(pngPart.replace(/\r\n/g, ""), "base64")), png);
console.log(`PASS: ${count} geometries, export structure, escaped title and long-name bounds.`);
console.log("PASS: shared piece round-trip, invalid links rejected, encoded email and plain-email fallback.");
console.log("PASS: signed MIME draft, inline PNG round-trip and visual signature geometry.");
