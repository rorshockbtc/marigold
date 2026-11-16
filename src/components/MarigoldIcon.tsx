import React from 'react';

interface MarigoldIconProps {
  className?: string;
  size?: number;
  style?: React.CSSProperties;
}

/**
 * Marigold Brand Mark: Typographic Eight Petalled Outlined Black Florette (❁, U+2741).
 * Rendered inside a scalable 100x100 SVG viewBox so utility sizing (e.g. w-9 h-9, w-4 h-4)
 * scales the typographic glyph proportionally across all headers, navbars, and badges.
 */
export function MarigoldIcon({ className = "w-6 h-6", size, style }: MarigoldIconProps) {
  return (
    <svg
      viewBox="0 0 100 100"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      role="img"
      aria-label="Marigold"
      className={`select-none ${className}`}
      style={{
        ...(size ? { width: size, height: size } : {}),
        ...style,
      }}
    >
      <text
        x="50"
        y="53"
        dominantBaseline="central"
        textAnchor="middle"
        fill="currentColor"
        fontFamily="Georgia, Cambria, 'Times New Roman', serif"
        fontSize="94"
      >
        ❁
      </text>
    </svg>
  );
}
