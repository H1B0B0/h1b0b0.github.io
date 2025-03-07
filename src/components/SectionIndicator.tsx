interface SectionIndicatorProps {
  sections: string[];
  currentSectionIndex: number;
  onIndicatorClick: (index: number) => void;
}

const SectionIndicator: React.FC<SectionIndicatorProps> = ({
  sections,
  currentSectionIndex,
  onIndicatorClick,
}) => {
  return (
    <div className="section-indicator hidden md:block">
      {sections.map((section, index) => (
        <button
          key={section}
          className={`section-indicator-dot ${
            currentSectionIndex === index ? "active" : ""
          }`}
          onClick={() => onIndicatorClick(index)}
          title={section.charAt(0).toUpperCase() + section.slice(1)}
          aria-label={`Navigate to ${section} section`}
          aria-current={currentSectionIndex === index ? "true" : "false"}
        />
      ))}
    </div>
  );
};

export default SectionIndicator;
