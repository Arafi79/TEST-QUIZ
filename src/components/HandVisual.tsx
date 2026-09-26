import React from 'react';

interface HandVisualProps {
  count: number; // 1 to 10
  size?: number; // pixel height/width
  className?: string;
}

// Single hand SVG showing 1 to 5 fingers
function SingleHand({ fingers, size = 36 }: { fingers: number; size: number }) {
  const f = Math.max(1, Math.min(5, fingers));
  
  return (
    <svg
      width={size}
      height={size}
      viewBox="0 0 100 100"
      className="inline-block drop-shadow-sm select-none"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
    >
      {/* Palm background */}
      <path
        d="M25 50 C25 38, 75 38, 75 50 L75 80 C75 90, 25 90, 25 80 Z"
        fill="#FDE68A"
        stroke="#D97706"
        strokeWidth="3.5"
        strokeLinejoin="round"
      />

      {/* Thumb */}
      {f >= 5 ? (
        // Extended thumb
        <path
          d="M25 60 C15 55, 10 45, 12 36 C13 30, 21 30, 23 37 C26 46, 28 52, 28 58"
          fill="#FDE68A"
          stroke="#D97706"
          strokeWidth="3.5"
          strokeLinecap="round"
        />
      ) : (
        // Folded thumb
        <path
          d="M25 68 C22 62, 28 58, 38 60 C44 61, 44 68, 36 70"
          fill="#FDE68A"
          stroke="#D97706"
          strokeWidth="3"
        />
      )}

      {/* Index Finger (Extended in 1, 2, 3, 4, 5) */}
      {f >= 1 ? (
        <path
          d="M30 50 L30 18 C30 11, 40 11, 40 18 L40 50"
          fill="#FEF3C7"
          stroke="#D97706"
          strokeWidth="3.5"
          strokeLinecap="round"
        />
      ) : (
        <path d="M30 50 C30 42, 40 42, 40 50" fill="#FDE68A" stroke="#D97706" strokeWidth="3" />
      )}

      {/* Middle Finger (Extended in 2, 3, 4, 5) */}
      {f >= 2 ? (
        <path
          d="M42 50 L42 12 C42 6, 52 6, 52 12 L52 50"
          fill="#FEF3C7"
          stroke="#D97706"
          strokeWidth="3.5"
          strokeLinecap="round"
        />
      ) : (
        <path d="M42 50 C42 43, 52 43, 52 50" fill="#FCD34D" stroke="#D97706" strokeWidth="3" />
      )}

      {/* Ring Finger (Extended in 3, 4, 5) */}
      {f >= 3 ? (
        <path
          d="M54 50 L54 16 C54 10, 64 10, 64 16 L64 50"
          fill="#FEF3C7"
          stroke="#D97706"
          strokeWidth="3.5"
          strokeLinecap="round"
        />
      ) : (
        <path d="M54 50 C54 44, 64 44, 64 50" fill="#FCD34D" stroke="#D97706" strokeWidth="3" />
      )}

      {/* Little Finger / Pinky (Extended in 4, 5) */}
      {f >= 4 ? (
        <path
          d="M66 52 L66 26 C66 20, 75 20, 75 26 L75 52"
          fill="#FEF3C7"
          stroke="#D97706"
          strokeWidth="3.5"
          strokeLinecap="round"
        />
      ) : (
        <path d="M66 52 C66 46, 75 46, 75 52" fill="#FCD34D" stroke="#D97706" strokeWidth="3" />
      )}

      {/* Wrist crease details */}
      <path d="M35 84 C45 86, 55 86, 65 84" stroke="#D97706" strokeWidth="2.5" strokeLinecap="round" />
    </svg>
  );
}

export const HandVisual: React.FC<HandVisualProps> = ({ count, size = 36, className = '' }) => {
  const n = Math.max(1, Math.min(10, count));

  if (n <= 5) {
    return (
      <div
        className={`inline-flex items-center justify-center p-0.5 rounded-lg bg-amber-50/80 border border-amber-200/70 hover:border-amber-400 transition-colors ${className}`}
        title={`${n} أصابع`}
      >
        <SingleHand fingers={n} size={size} />
      </div>
    );
  }

  // From 6 to 10: two hands side by side (first has 5, second has n - 5)
  const secondHandFingers = n - 5;
  const singleSize = Math.max(18, Math.round(size * 0.85));

  return (
    <div
      className={`inline-flex items-center justify-center gap-1 px-1.5 py-0.5 rounded-lg bg-amber-50/80 border border-amber-200/70 hover:border-amber-400 transition-colors ${className}`}
      title={`${n} أصابع (5 + ${secondHandFingers})`}
    >
      <SingleHand fingers={5} size={singleSize} />
      <span className="text-amber-500 font-bold text-xs select-none">+</span>
      <SingleHand fingers={secondHandFingers} size={singleSize} />
    </div>
  );
};
