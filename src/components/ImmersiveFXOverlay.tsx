"use client";

import { useEffect, useRef } from "react";

/**
 * ImmersiveFXOverlay
 *
 * Lightweight visual FX layer:
 * - cursor-follow glow orb (smoothed with RAF)
 * - subtle ambient gradient mesh
 * - vignette for stronger cinematic framing
 */
export default function ImmersiveFXOverlay() {
  const orbRef = useRef<HTMLDivElement>(null);
  const targetRef = useRef({ x: 0, y: 0 });
  const currentRef = useRef({ x: 0, y: 0 });

  useEffect(() => {
    const onPointerMove = (event: PointerEvent) => {
      targetRef.current.x = event.clientX;
      targetRef.current.y = event.clientY;
    };

    window.addEventListener("pointermove", onPointerMove, { passive: true });

    let frameId = 0;
    const tick = () => {
      currentRef.current.x += (targetRef.current.x - currentRef.current.x) * 0.12;
      currentRef.current.y += (targetRef.current.y - currentRef.current.y) * 0.12;

      if (orbRef.current) {
        orbRef.current.style.transform = `translate3d(${currentRef.current.x}px, ${currentRef.current.y}px, 0) translate(-50%, -50%)`;
      }
      frameId = requestAnimationFrame(tick);
    };
    frameId = requestAnimationFrame(tick);

    return () => {
      window.removeEventListener("pointermove", onPointerMove);
      cancelAnimationFrame(frameId);
    };
  }, []);

  return (
    <div className="pointer-events-none fixed inset-0 z-[2] overflow-hidden">
      <div className="immersive-aurora-mesh" />
      <div ref={orbRef} className="immersive-cursor-orb" />
      <div className="immersive-vignette" />
    </div>
  );
}
