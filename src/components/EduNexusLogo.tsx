import React from "react";

const EduNexusLogo: React.FC<{ className?: string }> = ({ className = "w-5 h-5" }) => (
  <svg viewBox="0 0 32 32" fill="none" xmlns="http://www.w3.org/2000/svg" className={className}>
    {/* Hexagon background shape */}
    <path
      d="M16 2L28 9V23L16 30L4 23V9L16 2Z"
      fill="currentColor"
      fillOpacity="0.15"
      stroke="currentColor"
      strokeWidth="1.5"
    />
    {/* E letter left vertical */}
    <rect x="8" y="9" width="2" height="14" rx="1" fill="currentColor" />
    {/* E top bar */}
    <rect x="8" y="9" width="7" height="2" rx="1" fill="currentColor" />
    {/* E middle bar */}
    <rect x="8" y="15" width="5.5" height="2" rx="1" fill="currentColor" />
    {/* E bottom bar */}
    <rect x="8" y="21" width="7" height="2" rx="1" fill="currentColor" />
    {/* N letter left vertical */}
    <rect x="17" y="9" width="2" height="14" rx="1" fill="currentColor" />
    {/* N diagonal */}
    <path d="M19 9L23 20V9" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
    {/* N right vertical */}
    <rect x="22" y="9" width="2" height="14" rx="1" fill="currentColor" />
    {/* Node dots */}
    <circle cx="16" cy="2.5" r="1.2" fill="currentColor" />
    <circle cx="16" cy="29.5" r="1.2" fill="currentColor" />
  </svg>
);

export default EduNexusLogo;
