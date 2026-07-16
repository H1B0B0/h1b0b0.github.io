# Portfolio Design Spec — ETIENNE MENTREL

Date: 2026-07-17
Authors: Etienne Mentrel + Copilot (design facilitation)

---

## Overview
Goal: produce a top-tier, Awwwards-grade portfolio experience that balances "experimental" visual identity with production-level control and readability. Work starts with Act 1 (Hero — "Monolithe vivant") and Act 2 (About + Skills — "Visualisation planétaire") and provides explicit fallbacks and performance budgets.

Success criteria
- Immediate "wow" in <3s on desktop while preserving a readable, locked name safe-zone.
- 60 FPS target on modern desktops; graceful mobile fallback.
- Narrow visual language: cosmic minimal (black / violet / cyan) with 1 accent active at a time.

---

## Understanding Lock (summary)
- What: An immersive portfolio with a sculptural hero (Monolithe vivant) and an experimental but controlled Act 2 (planets/nodes for skills).
- Why: Win attention from juries/design directors while staying credible (CV-like) in content.
- Who: Primary audience: art directors, design juries; secondary: recruiters/clients.
- Key constraints: name must remain legible and never be occluded; 60 FPS budget; mobile gets a lighter experience; fallback 2D required.
- Non-goals: No dashboard-style HUD in hero; no CTA-aggressive primary experience; no unpredictable random effects.

---

## Assumptions
- Translations/data available in `src/i18n/translations.ts` can be extended with demo links and mini-cases.
- Target browsers: latest Chrome, Safari, Firefox; progressive enhancement for others.
- Hosting: static site on Vercel / Netlify — no server-side realtime required.
- Developer time: willingness to accept moderate complexity (shaders/three.js) for a unique result.

---

## Decision Log (running)
1. Chosen main creative concept: "Monolithe vivant" (single sculptural object).  
   Alternatives: Typographic-centric, portal cinematic.  
   Rationale: Clear focal object reduces visual noise and ships a signature.

2. Act 2 chosen approach: "Visualisation planétaire" (nodes representing skill categories).  
   Alternatives: Cards, Accordions.  
   Rationale: Experimental but can be made credible if interactions prioritize clarity.

3. Interaction model: Controlled cinétique (slow orbitals, click-first reveals).  
   Rationale: Avoids text-masking via hover, reduces accidental occlusion.

4. Perf & fallback: Desktop full glfx; mobile simplified; fallback 2D hero CSS if WebGL unavailable.

---

## Act 1 — Monolithe vivant (Spec)

Structure (3 locked layers)
- Core Visual Layer (z0): single central monolith (3D R3F) composed of a volumetric/heated-matter shader + soft emissive core. Minimal particles (low count, GPU instanced) only inside a masked volume.
- Ambient Layer (z1): aurora gradient, subtle vignette, film grain (CSS), all controlled by a central FX controller (intensity params).
- Identity Layer (z2): main name + subtitle + microcopy. Safe zone rules: typography anchored center, min contrast >= WCAG AA, no FX overlays allowed above this layer.

Entry timeline (0–3s)
- 0.0–0.8s: monolith fades in + internal glow ramp.
- 0.8–1.8s: name fades/reveals with a subtle scale/opacity easing; ensure legibility at all times.
- 1.8–3.0s: settle into slow breathing animation (amplitude low).

Interactions
- Pointer influence: tiny halo offset (max 2% shift), no direct parallax on the main typographic layer.
- Scroll: camera transitions to Act 2; monolith scales/zooms out smoothly.

Performance & implementation notes
- Use react-three-fiber + small custom shader; avoid expensive postprocessing (God-rays only as cheap composited sprite + additive blending).
- Instance particles with a single geometry and a GLSL point-sprite shader. Cap to <5k logical points with GPU thinning.
- Central FX parameters (global) live in `src/constants/fx.ts` so designers/devs can tune without code churn.

Accessibility & fallbacks
- Respect `prefers-reduced-motion`: animations reduced/stationary; show still monolith image if needed.
- Fallback non-WebGL: CSS gradient + blur + high-contrast typographic reveal. Identical timeline via CSS transitions.

Deliverables
- Spec doc (this file).
- Prototype branch `feat/hero-monolith` with: R3F monolith placeholder, safe-zone layout, CSS fallback, parameterized FX controller.

---

## Act 2 — Visualisation planétaire (Spec)

Purpose
- Communicate skills credibly: each node = category (Frontend, Backend, DevOps). Each node reveals a mini-case (1–2 sentences) + 2 CTAs (View Demo, View Code).

Layout
- Two-column base: left = About narrative; right = Skills visual plane + list quick links.
- Central visualization (z-mid): a 2D/3D node canvas that can be visually prominent but must not occlude the About text.

Interaction model
- Controlled kinetics: orbit speeds low; nodes slowly breathe. Click (or keyboard focus + Enter) on a node opens a side panel or modal with the mini-case and CTAs.
- Hover on desktop shows light preview tooltip (non-masking) — only preview, not the full case.
- Keyboard navigation: nodes focusable via tab order; ARIA labels for all interactive nodes.

Data model
- Extend current translations or create `src/data/skills.ts` with structure:
```
{ category: "Frontend", skills: [{ name: "React", case: "Built X using Y...", demoUrl: "...", codeUrl: "..." }...] }
```

Performance & fallback
- Canvas-based visual (R3F OR 2D Canvas) with LOD: desktop renders 3D nodes; mobile uses SVG or CSS nodes static.
- CTAs must be accessible in fallback (links visible in a stacked list under the visualization on small screens).

Deliverables
- Spec doc (this file).
- Data file with mini-cases.
- Prototype branch `feat/skills-orbit` or combined with hero branch for first iteration.

---

## Engineering Tasks (priority order)
1. Create SPEC and Decision Log (this file).  
2. Create branch `feat/hero-monolith` and implement: R3F monolith placeholder, safe-zone typographic layout, FX controller export.  
3. Add CSS fallback hero and `prefers-reduced-motion` rules.  
4. Implement Act 2 data model `src/data/skills.ts` and simple SVG orbital visualization (click-first reveals).  
5. Performance testing: measure render times; reduce postprocessing until 60 FPS target met.  
6. Accessibility pass: keyboard nav, ARIA labels, color contrast checks.  

---

## Acceptance Criteria (for each deliverable)
- Spec file exists and is approved.  
- Hero: main name readable at all times; initial wow <3s; 60FPS (desktop target, measured) or documented trade-offs.  
- Skills viz: each node must expose mini-case + 2 CTAs; mobile fallback exposes same content with equal prominence.  

---

## Next steps (immediate)
- Confirm spec saved in repository (this file).  
- I will create a feature branch and implement the hero prototype.  

If you want the file moved to a different path, say the path now; otherwise I’ll proceed with the branch `feat/hero-monolith` and push the initial prototype changes locally for your review.

---

*End of spec.*
