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

const { buildFoldSvg } = sourceModule("src/components/experience/FoldSignature.tsx");
const { buildCompositionSvg } = sourceModule("src/components/experience/compositionSvg.ts");
let count = 0;
for (const form of [0, 10, 20, 30, 40, 50, 60, 70, 80, 90, 100]) {
  for (const tension of [0, 10, 20, 30, 40, 50, 60, 70, 80, 90, 100]) {
    for (let phase = 0; phase < 6; phase++) {
      const svg = buildFoldSvg({ form, tension, phase });
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
console.log(`PASS: ${count} geometries, export structure, escaped title and long-name bounds.`);
