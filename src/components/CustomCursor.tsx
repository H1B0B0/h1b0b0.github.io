"use client";
import { useEffect, useState } from "react";
import { motion, useSpring, useMotionValue } from "framer-motion";

const CustomCursor = () => {
  const cursorX = useMotionValue(-100);
  const cursorY = useMotionValue(-100);
  const [isHovering, setIsHovering] = useState(false);
  const [cursorLabel, setCursorLabel] = useState("");

  const springConfig = { damping: 25, stiffness: 400 };
  const cursorXSpring = useSpring(cursorX, springConfig);
  const cursorYSpring = useSpring(cursorY, springConfig);

  useEffect(() => {
    const moveCursor = (e: MouseEvent) => {
      cursorX.set(e.clientX - 16);
      cursorY.set(e.clientY - 16);
    };

    const handleMouseOver = (e: MouseEvent) => {
      const target = e.target as HTMLElement;
      const interactive = target.closest<HTMLElement>("button, a, [data-cursor]");
      if (
        target.tagName === "BUTTON" ||
        target.tagName === "A" ||
        target.closest("button") ||
        target.closest("a") ||
        target.closest(".indicator-wrapper")
      ) {
        setIsHovering(true);
        setCursorLabel(interactive?.dataset.cursor ?? "");
      } else {
        setIsHovering(false);
        setCursorLabel("");
      }
    };

    window.addEventListener("mousemove", moveCursor);
    window.addEventListener("mouseover", handleMouseOver);

    return () => {
      window.removeEventListener("mousemove", moveCursor);
      window.removeEventListener("mouseover", handleMouseOver);
    };
  }, [cursorX, cursorY]);

  return (
    <motion.div
      className="custom-cursor hidden items-center justify-center md:flex"
      style={{
        translateX: cursorXSpring,
        translateY: cursorYSpring,
      }}
      animate={{
        scale: isHovering ? 2.5 : 1,
        backgroundColor: isHovering ? "rgba(249, 115, 22, 0.18)" : "rgba(255, 255, 255, 0.1)",
        borderColor: isHovering ? "rgba(251, 146, 60, 0.55)" : "rgba(255, 255, 255, 0.5)",
      }}
    >
      <span className="cinematic-mono text-[3px] uppercase tracking-[0.12em] text-white">
        {cursorLabel}
      </span>
    </motion.div>
  );
};

export default CustomCursor;
