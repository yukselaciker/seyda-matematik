import React from 'react';

interface LogoProps {
  className?: string;
  showText?: boolean;
}

const Logo: React.FC<LogoProps> = ({ className, showText = true }) => {
  return (
    <svg
      viewBox="0 0 400 100"
      xmlns="http://www.w3.org/2000/svg"
      className={className}
      aria-label="Şeyda Açıker Logo"
    >
      {/* 
        Design Concept: "Elegant Wordmark"
        - No icon, no monogram.
        - Focus on "Şeyda Açıker" in luxury serif typography.
        - Deep Navy primary color, Gold accent for subtitle.
      */}

      {/* Primary Wordmark */}
      <text
        x="50%"
        y="60"
        fontFamily="'Playfair Display', serif"
        fontSize="52"
        fontWeight="600"
        fill="#1C2A5E"
        textAnchor="middle"
        letterSpacing="-0.02em"
      >
        Şeyda Açıker
      </text>

      {/* Optional Subtitle */}
      {showText && (
        <text
          x="50%"
          y="85"
          fontFamily="'Inter', sans-serif"
          fontSize="10"
          fontWeight="500"
          fill="#D4AF37"
          textAnchor="middle"
          letterSpacing="0.35em"
          className="uppercase"
        >
          Özel Matematik Öğretmeni
        </text>
      )}
    </svg>
  );
};

export default Logo;