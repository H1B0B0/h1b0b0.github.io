"use client";
import { useEffect, useRef } from "react";

const AboutSection = () => {
  const containerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) {
            entry.target.classList.add("opacity-100", "translate-y-0");
            entry.target.classList.remove("opacity-0", "translate-y-10");
          }
        });
      },
      { threshold: 0.1 }
    );

    if (containerRef.current) {
      const elements = containerRef.current.querySelectorAll(".fade-in");
      elements.forEach((el) => observer.observe(el));
    }

    return () => {
      if (containerRef.current) {
        const elements = containerRef.current.querySelectorAll(".fade-in");
        elements.forEach((el) => observer.unobserve(el));
      }
    };
  }, []);

  return (
    <div ref={containerRef} className="container mx-auto px-6">
      <div className="grid grid-cols-1 md:grid-cols-2 gap-12 items-center">
        <div className="order-2 md:order-1">
          <h2 className="text-4xl font-bold mb-6 opacity-0 translate-y-10 transition-all duration-1000 delay-300 fade-in">
            About Me
          </h2>

          <p className="text-lg mb-4 text-gray-300 opacity-0 translate-y-10 transition-all duration-1000 delay-500 fade-in">
            I'm a passionate web developer with a love for creating immersive
            and interactive digital experiences. My journey through the cosmos
            of web development has equipped me with a diverse set of skills and
            tools.
          </p>

          <p className="text-lg mb-6 text-gray-300 opacity-0 translate-y-10 transition-all duration-1000 delay-700 fade-in">
            From front-end technologies like React and Three.js to back-end
            solutions, I enjoy building complete experiences that engage and
            inspire users.
          </p>

          <div className="opacity-0 translate-y-10 transition-all duration-1000 delay-900 fade-in">
            <a href="#contact" className="cosmic-button">
              Let's Connect
            </a>
          </div>
        </div>

        <div className="order-1 md:order-2 flex justify-center">
          <div className="relative w-64 h-64 md:w-80 md:h-80 opacity-0 translate-y-10 transition-all duration-1000 delay-300 fade-in">
            <div className="absolute inset-0 rounded-full bg-gradient-to-br from-purple-600 via-blue-500 to-indigo-600 opacity-70 blur-xl animate-pulse"></div>
            <div className="relative w-full h-full rounded-full overflow-hidden border-2 border-white/30">
              {/* Replace with your image */}
              <div className="w-full h-full bg-gradient-to-br from-indigo-900 via-blue-800 to-purple-900 flex items-center justify-center text-5xl">
                EM
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default AboutSection;
