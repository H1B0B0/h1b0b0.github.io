"use client";
import { useEffect, useState } from "react";

const IntroSection = () => {
  const [isMounted, setIsMounted] = useState(false);

  useEffect(() => {
    setIsMounted(true);
  }, []);

  return (
    <div className="container mx-auto px-6 flex flex-col items-center justify-center text-center h-full">
      <div
        className={`transition-opacity duration-1000 ${
          isMounted ? "opacity-100" : "opacity-0"
        }`}
      >
        <h1 className="text-5xl md:text-7xl font-bold mb-6">
          Hello, I'm{" "}
          <span className="bg-gradient-to-r from-purple-400 to-blue-500 bg-clip-text text-transparent">
            Etienne Mentrel
          </span>
        </h1>

        <p className="text-xl md:text-2xl text-gray-300 max-w-3xl mx-auto mb-12">
          Web Developer & Digital Creator crafting immersive web experiences
        </p>

        <div className="flex flex-wrap justify-center gap-4">
          <a href="#projects" className="cosmic-button">
            View My Work
          </a>
          <a href="#contact" className="cosmic-button">
            Get In Touch
          </a>
        </div>
      </div>
    </div>
  );
};

export default IntroSection;
