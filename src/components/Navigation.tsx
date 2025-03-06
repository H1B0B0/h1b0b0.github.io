"use client";
import { useState, useEffect } from "react";

interface NavigationProps {
  currentSection?: string;
  onSectionClick?: (sectionId: string) => void;
}

const Navigation = ({
  currentSection = "home",
  onSectionClick,
}: NavigationProps) => {
  const [activeSection, setActiveSection] = useState(currentSection);
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [isScrolled, setIsScrolled] = useState(false);

  const sections = [
    { id: "home", label: "Home" },
    { id: "about", label: "About" },
    { id: "projects", label: "Projects" },
    { id: "skills", label: "Skills" },
    { id: "contact", label: "Contact" },
  ];

  useEffect(() => {
    setActiveSection(currentSection);
  }, [currentSection]);

  useEffect(() => {
    const handleScroll = () => {
      setIsScrolled(window.scrollY > 50);
    };

    window.addEventListener("scroll", handleScroll);
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  const handleNavClick = (
    e: React.MouseEvent<HTMLAnchorElement>,
    id: string
  ) => {
    e.preventDefault();

    if (onSectionClick) {
      onSectionClick(id);
    } else {
      const section = document.getElementById(id);
      if (section) {
        section.scrollIntoView({ behavior: "smooth" });
      }
    }

    if (isMenuOpen) {
      setIsMenuOpen(false);
    }
  };

  return (
    <nav
      className={`fixed top-0 w-full z-50 px-6 py-4 transition-all duration-300 ${
        isScrolled ? "bg-gradient-to-b from-black/80 to-transparent" : ""
      } backdrop-blur-sm`}
    >
      <div className="container mx-auto flex justify-between items-center">
        <a
          href="#home"
          className="text-2xl font-bold text-glow"
          onClick={(e) => handleNavClick(e, "home")}
        >
          E.Mentrel
        </a>

        {/* Desktop Navigation */}
        <div className="hidden md:flex space-x-8">
          {sections.map(({ id, label }) => (
            <a
              key={id}
              href={`#${id}`}
              onClick={(e) => handleNavClick(e, id)}
              className={`transition-all duration-300 ${
                activeSection === id
                  ? "text-white text-glow"
                  : "text-gray-400 hover:text-white"
              }`}
            >
              {label}
            </a>
          ))}
        </div>

        {/* Mobile Navigation Button */}
        <button
          className="md:hidden text-white focus:outline-none"
          onClick={() => setIsMenuOpen(!isMenuOpen)}
          aria-label={isMenuOpen ? "Close menu" : "Open menu"}
          aria-expanded={isMenuOpen}
        >
          {isMenuOpen ? (
            <svg
              className="w-6 h-6"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
              xmlns="http://www.w3.org/2000/svg"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M6 18L18 6M6 6l12 12"
              />
            </svg>
          ) : (
            <svg
              className="w-6 h-6"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
              xmlns="http://www.w3.org/2000/svg"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M4 6h16M4 12h16M4 18h16"
              />
            </svg>
          )}
        </button>
      </div>

      {/* Mobile Menu */}
      {isMenuOpen && (
        <div className="md:hidden absolute top-full left-0 w-full bg-black/95 backdrop-blur-md py-4">
          <div className="container mx-auto flex flex-col space-y-4 px-6">
            {sections.map(({ id, label }) => (
              <a
                key={id}
                href={`#${id}`}
                onClick={(e) => handleNavClick(e, id)}
                className={`transition-all duration-300 ${
                  activeSection === id
                    ? "text-white text-glow"
                    : "text-gray-400 hover:text-white"
                }`}
              >
                {label}
              </a>
            ))}
          </div>
        </div>
      )}
    </nav>
  );
};

export default Navigation;
