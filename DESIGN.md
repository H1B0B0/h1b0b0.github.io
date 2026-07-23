# DESIGN — Interstellar / 2001 Cinematic System

> A seven-section design contract codifying the existing visual language.
> All tokens are extracted from `globals.css`, `ScrollDrivenScene.tsx`, and the three act components.
> Every value below is grounded in current code — nothing is invented or aspirational.

---

## 1. Atmosphere

The portfolio is a **cinematic space voyage in three acts**, drawing visual tone from *Interstellar* (cosmic scale, lens flare, deep blacks) and *2001: A Space Odyssey* (monolithic minimalism, slow reveals, signal-as-artifact).

| Quality | Implementation |
|---|---|
| Tone | Dark, void-dominant, warmly lit by sparse emissive sources |
| Genre | Cosmic horror-adjacent → awe → contact |
| Audio | None (visual-only experience) |
| References | *Interstellar* (nebula, wormhole), *2001* (monolith, stargate) |

The three acts form a narrative arc, each with its own spatial location and palette
(see Sections 2 and 5).

---

## 2. Palette

### 2.1 Surfaces & text

| Token | Value | Usage |
|---|---|---|
| `--background` | `#04030a` | Page / scene default |
| `--background-elev` | `#0a0918` | Elevated surfaces, panels |
| `--foreground` | `#f4f4f6` | Body text, primary UI |

### 2.2 Brand accents (sparing)

| Token | Value | Role |
|---|---|---|
| `--accent-primary` | `#8b5cf6` | Ion violet — selection, links |
| `--accent-secondary` | `#06b6d4` | Cold cyan — focus rings |
| `--accent-tertiary` | `#f43f5e` | Mars red — tertiary emphasis |

### 2.3 Act palette

| Token | Value | Act | Role |
|---|---|---|---|
| `--act-i` | `#ff2a55` | I — Genesis | Genesis ember |
| `--act-ii` | `#4488ff` | II — Constellations | Constellation blue |
| `--act-iii` | `#9fd4ff` | III — Signal | Signal ice |

### 2.4 Scene background shift (3D canvas)

| Act | Background | Description |
|---|---|---|
| I | `#02010a` | Near-black with faint warmth |
| II | `#050a1a` | Cold blue night |
| III | `#000000` | Pure deep void |

### 2.5 Act I internal palette (nebula)

- `#fff4e8` — protostar core
- `#ff5a7a` — mid nebula
- `#5a0a28` — outer edge
- `#1a3a8a` — dust
- `#fff1d6` / `#ff3a5e` / `#ff8a4a` — star shader (core/mid/rim)
- `#ff4d6d` — corona halo
- `#ff6a85` — accretion disk
- `#ffd9c2` — disk edge

### 2.6 Act II & III palettes

**Act II** — `#1a2a55` (sun), `#7aa2ff` (orbit rings)
**Act III** — `#02040a` (monolith body), `#9fd4ff` (signal seam and beam)

---

## 3. Typography

| Face | Variable | Weight | Style | Usage |
|---|---|---|---|---|
| Instrument Serif | `--font-instrument-serif` | 400 | italic (`.font-display`) | Display / headings |
| Geist Sans | `--font-geist-sans` | variable (body) | normal | Body text |
| Geist Mono | `--font-geist-mono` | variable | normal | Code / cinematic-mono |

```css
--font-display: "Instrument Serif", ui-serif, Georgia, serif;
```

- `.font-display` applies `letter-spacing: -0.02em` for that cosmic / title-card feel.
- Body font-feature-settings: `"ss01", "cv11"`.
- Text rendering: `antialiased`, `optimizeLegibility`.

---

## 4. Layout

### 4.1 Canvas

- Full-screen fixed viewport (`!fixed inset-0`, `pointer-events: none`).
- PerspectiveCamera: `fov: 55`, `near: 0.1`, `far: 200`.
- DPR: `[1, 1.5]` — capped at 1.5× for performance.
- No alpha channel (`alpha: false`).
- Fog: `#02010a`, near `25`, far `80`.
- Scrollbar hidden (`scrollbar-width: none`).

### 4.2 UI overlay layer

- Custom cursor at `z-index: 9999` — `mix-blend-mode: difference`, white border.
- Film-grain SVG overlay at `z-index: 9998` — `opacity: 0.05`, `mix-blend-mode: overlay`, 8s stepped animation.
- Horizontal overflow uses `clip`, preserving nested sticky positioning.

### 4.3 Static export

The site compiles to a fully static Next.js build — no SSR API routes, no external
asset host. All 3D content is procedural or in-repo.

---

## 5. Scene Primitives

Three named acts. Each consumes `scrollProgress` via `useScrollProgress()` and
renders inside `<ScrollDrivenScene />`.

### ActIGenesis — "Primordial Nebula" (0.00 → 0.33)

```
Camera: (0, 0, 30)  →  lookAt (0, 0, 0)
```

- **Volumetric particle cloud**: ~14 000 points in an oblate spheroid, colored
  from white-hot centre → red mid → blue dust edge. Slow Y-swirl + radial
  breathing drift in GLSL.
- **Protostar**: `icosahedronGeometry(1.5, 12)` with a plasma vertex-displacement
  shader, Fresnel rim, and pulsing emissive intensity.
- **Corona halo**: Same star geometry, `BackSide` + `AdditiveBlending`,
  Fresnel-based transparency.
- **Accretion disk**: Thin `ringGeometry(2.2, 3.8, 256, 1)`, `AdditiveBlending`,
  faint outer edge ring. Rotates independently.
- **Hero presentation**: The fixed scene is the sole visual focal layer. The
  name and introduction sit above it without a second Canvas or foreground
  sphere. Display text must reserve space for italic overhangs and may never be
  clipped by its reveal wrapper.

### ActIIConstellations — "Solar System" (0.33 → 0.66)

```
Camera: (0, 5, 15)  →  lookAt (0, 0, 0)
```

- **Sun**: A faceted emissive core with a larger additive halo. Its white-hot
  centre grades through constellation blue and drives restrained bloom.
- **Five orbital systems**: Thin blue paths occupy independently tilted
  planes. Planets vary in scale, mineral colour, phase, and orbital velocity;
  one carries a translucent Saturn-like ring.
- **Deep starfield**: A single memoized point cloud surrounds the system and
  fades with the act envelope so it never competes with adjacent chapters.
- **Skills matrix**: Every skill name is visible at rest, grouped by category in
  stable rows. Skills never orbit, drift, or move in response to pointer input;
  motion is limited to the section's entrance reveal.

### ActIIISignal — "Monolith / Contact" (0.66 → 1.00)

```
Camera: (0, 0, 8)  →  lookAt (0, 0, 0)
```

- **Monolith**: `boxGeometry(1.4, 4.2, 0.18)` with a near-black, highly
  metallic surface. Cold cyan and ion-violet lights reveal the silhouette
  while preserving the slab's black-body presence.
- **Signal seam**: A narrow ice-blue emissive incision runs down the front
  face and pulses slowly enough to read as transmission, not decoration.
- **Volumetric signal**: A narrow, edge-free additive beam and bright axial core
  rise from the slab. Its opacity falls off smoothly in both axes so no cone,
  rectangle, or primitive silhouette is visible. A restrained point field
  drifts upward and recycles continuously.

---

## 6. Motion

### 6.1 Easings

| Token | Value | Use case |
|---|---|---|
| `--ease-cinema` | `cubic-bezier(0.16, 1, 0.3, 1)` | Camera lerp, fades |
| `--ease-emphasis` | `cubic-bezier(0.83, 0, 0.17, 1)` | Emphasis reveals |

### 6.2 Camera travel

Three waypoints lerped via smoothstep `t²(3−2t)`:

| Act | Position | Range |
|---|---|---|
| I | `(0, 0, 30)` | `0.00 → 0.33` |
| II | `(0, 5, 15)` | `0.33 → 0.66` |
| III | `(0, 0, 8)` | `0.66 → 1.00` |

- Framerate-independent lerp: `1 − pow(0.001, delta)`.
- Mouse parallax: `x += pointer.x × 0.5`, `y += pointer.y × 0.3`.
- Scene background colour lerps simultaneously.

### 6.3 Scroll envelopes

Every act uses the `actEnvelope(progress, start, end, fadeIn, fadeOut)` function
to compute a `[0, 1]` visibility/intensity factor:

```ts
actEnvelope(progress, 0.00, 0.33, 0.05, 0.05)   // Act I
actEnvelope(progress, 0.33, 0.66, 0.05, 0.05)   // Act II
actEnvelope(progress, 0.66, 1.05, 0.05, 0.05)   // Act III
```

Fades in/out over 5 % of scroll range on each boundary.

### 6.4 Perpetual micro-motion

- Nebula: slow Y-rotation (`0.02 rad/s`), Z-tilt (`sin(t × 0.08) × 0.02`).
- Aurora mesh: `translate3d` drift over 22 s, infinite alternate.
- Film grain: `translate` steps every 8 s.
- Blink caret: `1 s` stepped opacity for the loading-screen typewriter.

### 6.5 Interaction restraint

- Informational skill labels remain stationary on hover and focus.
- Pointer motion is reserved for controls whose displacement communicates an
  action; decorative objects never chase the cursor.

---

## 7. Depth & Performance

### 7.1 Rendering strategy

| Technique | Where |
|---|---|
| AdditiveBlending | Nebula points, corona halo, accretion disk, all luminous layers |
| `depthWrite: false` | All transparent / additive geometry |
| BackSide rendering | Corona halo (double-sided Fresnel glow) |
| Emissive + bloom-ready | Protostar, Act II sun, Act III monolith |
| `powerPreference: "high-performance"` | R3F Canvas GL config |
| DPR cap `[1, 1.5]` | Prevents excessive render cost on high-DPI displays |
| `alpha: false` | No compositor alpha overhead |

### 7.2 Additive luminous layers (canon)

All glow-y, halo, or emissive-surrogate geometry MUST use:
- `THREE.AdditiveBlending`
- `depthWrite: false`
- Transparency enabled

This produces the signature overexposed / lens-flare look and supplies bright
sources for the restrained global bloom pass.

### 7.3 Reduced motion

A `@media (prefers-reduced-motion: reduce)` block kills all:

- CSS animations & transitions (`0.001 ms` duration hack)
- Film-grain animation
- Aurora drift
- Custom cursor orb display

### 7.4 Asset discipline

- **Zero external textures or models.** All geometry is procedural
  (BufferGeometry, shader-generated, or primitive).
- **Zero external image dependencies.** Film grain is an inline SVG data URI.
- Fonts are self-hosted via Next.js `next/font`.

### 7.5 GPU / memory

- Shader uniforms are allocated once with `useMemo` — never recreated per frame.
- `useRef` temporaries avoid `new THREE.Vector3()` per frame in the hot loop.
- `useFrame` reads a shared `progressRef` — no re-renders on scroll.
- Corona uses a lower-tessellation mesh (`segments: 8`) than the star core (`12`).
