import { describe, expect, test } from "bun:test";
import * as THREE from "three";

import { sampleCameraPath } from "./ScrollDrivenScene.tsx";

describe("sampleCameraPath", () => {
  test("Given Signal progress, when sampling the camera, then it stays on the Signal framing", () => {
    const position = new THREE.Vector3();
    const color = new THREE.Color();

    sampleCameraPath(0.85, position, color);

    expect(position.toArray()).toEqual([0, 0, 8]);
  });

  test("Given the Act II/III boundary, when crossing it, then the camera path remains continuous", () => {
    const before = new THREE.Vector3();
    const after = new THREE.Vector3();
    const color = new THREE.Color();

    sampleCameraPath(0.659, before, color);
    sampleCameraPath(0.661, after, color);

    expect(before.distanceTo(after)).toBeLessThan(0.2);
  });
});
