import assert from "node:assert/strict";
import { readFileSync } from "node:fs";
import { createRequire } from "node:module";
import ts from "typescript";

// Source-only hook harness: no browser, UI automation, audio output or file writes.
const nativeRequire = createRequire(import.meta.url);
const source = readFileSync("src/context/SfxContext.tsx", "utf8");
const { outputText } = ts.transpileModule(source, {
  compilerOptions: { target: ts.ScriptTarget.ES2022, module: ts.ModuleKind.CommonJS, jsx: ts.JsxEmit.ReactJSX },
  fileName: "SfxContext.tsx",
});
const preferenceKey = "portfolio:sfx-enabled";

function deferred() {
  let resolve;
  let reject;
  const promise = new Promise((yes, no) => { resolve = yes; reject = no; });
  return { promise, resolve, reject };
}

function audioMock({ state = "running", resumeDeferred, constructorFails = false, resumeFails = false, synthesisFails = false } = {}) {
  const starts = [];
  const contexts = [];
  const parameter = () => ({ setValueAtTime() {}, exponentialRampToValueAtTime() {} });
  class AudioContextMock {
    constructor() {
      if (constructorFails) throw new Error("Audio unavailable");
      this.state = state;
      this.currentTime = 0;
      this.destination = {};
      contexts.push(this);
    }
    createOscillator() {
      if (synthesisFails) throw new Error("Device unavailable");
      let from;
      const frequency = parameter();
      frequency.setValueAtTime = (value) => { from = value; };
      return { frequency, connect() {}, start() { starts.push(from); }, stop() {} };
    }
    createGain() { return { gain: parameter(), connect() {} }; }
    resume() {
      if (resumeFails) throw new Error("Resume unavailable");
      if (resumeDeferred) return resumeDeferred.promise.then(() => { this.state = "running"; });
      this.state = "running";
      return Promise.resolve();
    }
  }
  return { AudioContextMock, starts, contexts };
}

function providerHarness({ audio, storage } = {}) {
  const values = new Map();
  const effects = [];
  const states = [];
  const react = {
    createContext: () => ({ Provider: "provider" }),
    useCallback: (callback) => callback,
    useContext: () => null,
    useEffect: (effect) => effects.push(effect),
    useMemo: (factory) => factory(),
    useRef: (current) => ({ current }),
    useState: (initial) => {
      const state = { current: initial };
      states.push(state);
      return [initial, (next) => { state.current = typeof next === "function" ? next(state.current) : next; }];
    },
  };
  globalThis.window = {
    AudioContext: audio?.AudioContextMock,
    localStorage: storage ?? {
      getItem: (key) => values.get(key) ?? null,
      setItem: (key, value) => values.set(key, value),
    },
  };
  const loaded = { exports: {} };
  new Function("require", "module", "exports", outputText)(
    (name) => name === "react" ? react : nativeRequire(name), loaded, loaded.exports,
  );
  const provider = loaded.exports.SfxProvider({ children: null });
  // Mount only the preference effect; document event routing needs real browser QA.
  const mountPreference = () => effects[0]();
  return { control: provider.props.value, mountPreference, enabled: () => states[0].current, values };
}

const flushPromises = () => new Promise((resolve) => setImmediate(resolve));
let cases = 0;

{
  const harness = providerHarness({ storage: {
    getItem() { throw new Error("Storage denied"); },
    setItem() { throw new Error("Storage denied"); },
  } });
  assert.doesNotThrow(harness.mountPreference);
  assert.doesNotThrow(harness.control.toggle);
  assert.equal(harness.enabled(), false);
  assert.doesNotThrow(harness.control.toggle);
  assert.equal(harness.enabled(), true);
  cases++;
}

{
  const harness = providerHarness();
  Object.defineProperty(window, "localStorage", { get() { throw new Error("Storage accessor denied"); } });
  assert.doesNotThrow(harness.mountPreference);
  assert.doesNotThrow(harness.control.toggle);
  assert.equal(harness.enabled(), false);
  cases++;
}

{
  const audio = audioMock({ constructorFails: true });
  const harness = providerHarness({ audio });
  assert.doesNotThrow(() => harness.control.play("press"));
  assert.doesNotThrow(harness.control.toggle);
  assert.equal(harness.enabled(), false);
  assert.doesNotThrow(harness.control.toggle);
  assert.equal(harness.enabled(), true);
  cases++;
}

{
  const harness = providerHarness({ storage: { getItem: () => "false", setItem() {} } });
  harness.mountPreference();
  assert.equal(harness.enabled(), false);
  assert.doesNotThrow(() => harness.control.play("press"));
  assert.doesNotThrow(harness.control.toggle);
  assert.equal(harness.enabled(), true);
  cases++;
}

for (const mode of ["synchronous", "rejected"]) {
  const pending = deferred();
  const audio = audioMock({ state: "suspended", resumeFails: mode === "synchronous", resumeDeferred: pending });
  const harness = providerHarness({ audio });
  assert.doesNotThrow(() => harness.control.play("press"));
  harness.control.toggle();
  assert.doesNotThrow(harness.control.toggle);
  if (mode === "rejected") pending.reject(new Error("Audio policy denied resume"));
  await flushPromises();
  assert.equal(audio.starts.length, 0);
  cases++;
}

{
  const pending = deferred();
  const audio = audioMock({ state: "suspended", resumeDeferred: pending });
  const harness = providerHarness({ audio });
  harness.control.play("press");
  harness.control.toggle();
  pending.resolve();
  await flushPromises();
  assert.equal(harness.enabled(), false);
  assert.equal(audio.starts.length, 0, "A pending cue must not play after OFF");
  cases++;
}

{
  const pending = deferred();
  const audio = audioMock({ state: "suspended", resumeDeferred: pending });
  const harness = providerHarness({ audio });
  harness.control.toggle();
  harness.control.toggle();
  harness.control.toggle();
  pending.resolve();
  await flushPromises();
  assert.equal(audio.starts.length, 0, "An ON announcement must not play after OFF");
  cases++;
}

{
  const pending = deferred();
  const audio = audioMock({ state: "suspended", resumeDeferred: pending });
  const harness = providerHarness({ audio });
  harness.control.play("press");
  harness.control.toggle();
  harness.control.toggle();
  pending.resolve();
  await flushPromises();
  assert.deepEqual(audio.starts, [220, 440], "Only the latest ON announcement may survive OFF → ON");
  cases++;
}

{
  const audio = audioMock({ synthesisFails: true });
  const harness = providerHarness({ audio });
  assert.doesNotThrow(() => harness.control.play("press"));
  assert.doesNotThrow(harness.control.toggle);
  assert.equal(harness.enabled(), false);
  assert.doesNotThrow(harness.control.toggle);
  assert.equal(harness.enabled(), true);
  cases++;
}

{
  const audio = audioMock();
  const harness = providerHarness({ audio });
  const pitches = [];
  for (const intensity of [0, .2, .4, .6, .8, 1]) {
    harness.control.play("propagate", intensity);
    pitches.push(audio.starts.at(-2));
  }
  assert.ok(pitches.every((pitch, index) => index === 0 || pitch > pitches[index - 1]));
  harness.control.toggle();
  assert.equal(harness.values.get(preferenceKey), "false");
  const mutedCount = audio.starts.length;
  harness.control.play("propagate", 1);
  assert.equal(audio.starts.length, mutedCount);
  cases++;
}

console.log(`PASS: ${cases} SFX cases, unavailable APIs, denied storage, pending mute safety and ascending pitch.`);
