import React from 'react';

interface MarigoldIconProps {
  className?: string;
  size?: number;
}

export function MarigoldIcon({ className = "w-6 h-6", size }: MarigoldIconProps) {
  return (
    <svg 
      viewBox="0 0 100 100" 
      fill="none" 
      xmlns="http://www.w3.org/2000/svg"
      className={className}
      style={size ? { width: size, height: size } : undefined}
    >
      <defs>
        <radialGradient id="marigold-center" cx="50%" cy="50%" r="50%">
          <stop offset="0%" stopColor="#FEF08A" />
          <stop offset="60%" stopColor="#FBBF24" />
          <stop offset="100%" stopColor="#D97706" />
        </radialGradient>
        <linearGradient id="petal-outer" x1="0%" y1="0%" x2="100%" y2="100%">
          <stop offset="0%" stopColor="#F59E0B" />
          <stop offset="50%" stopColor="#D97706" />
          <stop offset="100%" stopColor="#9A3412" />
        </linearGradient>
        <linearGradient id="petal-inner" x1="0%" y1="100%" x2="100%" y2="0%">
          <stop offset="0%" stopColor="#FDE047" />
          <stop offset="70%" stopColor="#F59E0B" />
          <stop offset="100%" stopColor="#B45309" />
        </linearGradient>
      </defs>

      {/* Outer Layer: Fluffy Heirloom Scalloped Petals (12 petals rotated) */}
      <g stroke="#9A3412" strokeWidth="0.5" strokeOpacity="0.4">
        {[0, 30, 60, 90, 120, 150, 180, 210, 240, 270, 300, 330].map((angle, i) => (
          <path
            key={`outer-${i}`}
            d="M50 50 C40 25, 35 10, 43 5 C47 2, 53 2, 57 5 C65 10, 60 25, 50 50 Z"
            fill="url(#petal-outer)"
            transform={`rotate(${angle} 50 50)`}
          />
        ))}
      </g>

      {/* Middle Layer: Staggered Ruffled Petals (12 petals offset by 15 deg) */}
      <g stroke="#B45309" strokeWidth="0.5" strokeOpacity="0.3">
        {[15, 45, 75, 105, 135, 165, 195, 225, 255, 285, 315, 345].map((angle, i) => (
          <path
            key={`mid-${i}`}
            d="M50 50 C42 30, 38 16, 44 12 C47 10, 53 10, 56 12 C62 16, 58 30, 50 50 Z"
            fill="url(#petal-inner)"
            transform={`rotate(${angle} 50 50)`}
          />
        ))}
      </g>

      {/* Inner Layer: Dense Fluffy Petals (8 petals) */}
      <g>
        {[0, 45, 90, 135, 180, 225, 270, 315].map((angle, i) => (
          <path
            key={`inner-${i}`}
            d="M50 50 C45 35, 42 24, 46 20 C48 18, 52 18, 54 20 C58 24, 55 35, 50 50 Z"
            fill="#FBBF24"
            stroke="#D97706"
            strokeWidth="0.5"
            transform={`rotate(${angle} 50 50)`}
          />
        ))}
      </g>

      {/* Textured Heirloom Crown Center */}
      <circle cx="50" cy="50" r="14" fill="url(#marigold-center)" stroke="#B45309" strokeWidth="1" />
      <circle cx="50" cy="50" r="10" fill="#FDE047" opacity="0.6" />
      
      {/* Micro-texture stamen dots */}
      <circle cx="47" cy="46" r="1.5" fill="#9A3412" opacity="0.7" />
      <circle cx="53" cy="47" r="1.5" fill="#9A3412" opacity="0.7" />
      <circle cx="50" cy="53" r="1.5" fill="#9A3412" opacity="0.7" />
      <circle cx="45" cy="51" r="1.2" fill="#B45309" opacity="0.8" />
      <circle cx="54" cy="52" r="1.2" fill="#B45309" opacity="0.8" />
      <circle cx="50" cy="48" r="2" fill="#D97706" opacity="0.9" />
    </svg>
  );
}
