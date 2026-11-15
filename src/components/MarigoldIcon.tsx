import React from 'react';

interface MarigoldIconProps {
  className?: string;
  size?: number;
  style?: React.CSSProperties;
}

/**
 * Marigold Brand Mark: Typographic Eight Petalled Outlined Black Florette (❁, U+2741).
 * Aligns Marigold with the tactile typographic brand identity (||| for Pipes, ! for Bang, ❁ for Marigold).
 */
export function MarigoldIcon({ className = "w-6 h-6", size, style }: MarigoldIconProps) {
  return (
    <span
      role="img"
      aria-label="Marigold"
      className={`inline-flex items-center justify-center leading-none select-none font-serif text-[1.15em] ${className}`}
      style={{
        ...(size ? { width: size, height: size, fontSize: size } : {}),
        ...style,
      }}
    >
      ❁
    </span>
  );
}
