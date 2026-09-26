import React from 'react';
import { StripConfig } from '../types';
import { Pencil } from 'lucide-react';

interface StripRendererProps {
  stripConfig: StripConfig;
  onToggleCell?: (index: number) => void;
  interactive?: boolean;
}

export const StripRenderer: React.FC<StripRendererProps> = ({
  stripConfig,
  onToggleCell,
  interactive = true
}) => {
  const { startNum, endNum, hiddenIndices, theme = 'train', boxSize = 48, direction = 'ltr' } = stripConfig;

  // Build the ordered array of numbers from start to end
  const count = Math.max(1, endNum - startNum + 1);
  const numbers = Array.from({ length: count }, (_, i) => startNum + i);

  // Scaled font sizes based on boxSize
  const fontSize = Math.max(14, Math.round(boxSize * 0.44));
  const iconSize = Math.max(12, Math.round(boxSize * 0.3));

  return (
    <div
      className="w-full flex flex-col items-center justify-center my-1 select-none"
      dir={direction}
    >
      {/* Centered strip container */}
      <div className="flex flex-wrap items-center justify-center gap-1.5 sm:gap-2.5 py-2 px-1 max-w-full">
        {/* Train Locomotive Head (for train theme) */}
        {theme === 'train' && (
          <div
            style={{ width: `${Math.round(boxSize * 1.15)}px`, height: `${boxSize}px` }}
            className="shrink-0 relative flex flex-col items-center justify-end bg-rose-600 rounded-t-xl rounded-bl-sm rounded-br-lg shadow-2xs border-2 border-stone-800 text-white"
            title="قاطرة القطار"
          >
            {/* Chimney & Smoke */}
            <div className="absolute -top-3 left-3 w-3 h-3.5 bg-stone-800 rounded-t-xs flex items-center justify-center">
              <span className="absolute -top-2.5 -left-1 text-[10px] opacity-80">☁️</span>
            </div>
            {/* Cab window */}
            <div className="w-5 h-4 bg-sky-200 border border-stone-800 rounded-xs mb-1 flex items-center justify-center">
              <span className="text-[10px]">🚂</span>
            </div>
            {/* Wheels */}
            <div className="absolute -bottom-2 flex gap-2">
              <div className="w-3.5 h-3.5 rounded-full bg-stone-900 border border-stone-400" />
              <div className="w-3.5 h-3.5 rounded-full bg-stone-900 border border-stone-400" />
            </div>
          </div>
        )}

        {/* Caterpillar Head (for caterpillar theme) */}
        {theme === 'caterpillar' && (
          <div
            style={{ width: `${boxSize}px`, height: `${boxSize}px` }}
            className="shrink-0 relative flex flex-col items-center justify-center bg-emerald-500 rounded-full border-2 border-emerald-800 shadow-2xs text-white"
            title="رأس الدودة"
          >
            {/* Antennas */}
            <div className="absolute -top-2.5 flex justify-between w-6">
              <span className="text-[10px] transform -rotate-12">🔴</span>
              <span className="text-[10px] transform rotate-12">🔴</span>
            </div>
            {/* Smiling face */}
            <div className="text-center leading-none">
              <div className="text-[11px] font-bold">👀</div>
              <div className="text-[9px] mt-0.5">‿</div>
            </div>
            {/* Feet */}
            <div className="absolute -bottom-1.5 flex gap-2">
              <div className="w-2 h-2 rounded-full bg-emerald-700" />
              <div className="w-2 h-2 rounded-full bg-emerald-700" />
            </div>
          </div>
        )}

        {/* The Number Cells */}
        {numbers.map((num, index) => {
          const isEmpty = hiddenIndices.includes(index);

          // Connector between items
          const isNotLast = index < numbers.length - 1;

          return (
            <React.Fragment key={index}>
              <div
                onClick={() => interactive && onToggleCell && onToggleCell(index)}
                style={{
                  width: `${boxSize}px`,
                  height: `${boxSize}px`,
                  minWidth: `${boxSize}px`,
                  minHeight: `${boxSize}px`,
                  fontSize: `${fontSize}px`
                }}
                className={`relative shrink-0 flex flex-col items-center justify-center font-black transition-all ${
                  interactive ? 'cursor-pointer hover:scale-105 active:scale-95' : ''
                } ${
                  /* Theme specific shape & backgrounds */
                  theme === 'train'
                    ? isEmpty
                      ? 'rounded-lg border-2 border-dashed border-stone-400 bg-amber-50/50 print:bg-white print:border-stone-500'
                      : 'rounded-lg border-2 border-stone-800 bg-sky-100 print:bg-stone-50 text-stone-900 shadow-2xs'
                    : theme === 'caterpillar'
                    ? isEmpty
                      ? 'rounded-full border-2 border-dashed border-emerald-400 bg-emerald-50/40 print:bg-white print:border-stone-500'
                      : 'rounded-full border-2 border-emerald-700 bg-emerald-100 text-emerald-950 shadow-2xs'
                    : theme === 'bubbles'
                    ? isEmpty
                      ? 'rounded-full border-2 border-dashed border-indigo-400 bg-indigo-50/40 print:bg-white print:border-stone-500'
                      : 'rounded-full border-2 border-indigo-600 bg-indigo-100 text-indigo-950 shadow-2xs'
                    : theme === 'cards'
                    ? isEmpty
                      ? 'rounded-md border-2 border-dashed border-stone-400 bg-amber-50/40 print:bg-white print:border-stone-500'
                      : 'rounded-md border-2 border-amber-800 bg-amber-100/80 text-amber-950 shadow-2xs'
                    : theme === 'flags'
                    ? isEmpty
                      ? 'rounded-b-xl rounded-t-sm border-2 border-dashed border-purple-400 bg-purple-50/40 print:bg-white print:border-stone-500'
                      : 'rounded-b-xl rounded-t-sm border-2 border-purple-700 bg-purple-100 text-purple-950 shadow-2xs'
                    : /* Default 'blocks' */
                    isEmpty
                    ? 'rounded-xl border-2 border-dashed border-stone-400 bg-stone-50/60 print:bg-white print:border-stone-500'
                    : 'rounded-xl border-2 border-stone-800 bg-white text-stone-900 shadow-2xs'
                }`}
                title={
                  interactive
                    ? isEmpty
                      ? `خانة فارغة للعدد (${num}) · انقر لملئها`
                      : `العدد (${num}) · انقر لتفريغ الخانة`
                    : undefined
                }
              >
                {/* Clips/Pegs for 'cards' theme */}
                {theme === 'cards' && (
                  <div className="absolute -top-2 w-2 h-3 bg-amber-800 rounded-xs shadow-2xs z-10" />
                )}

                {/* Train wheels for 'train' theme */}
                {theme === 'train' && (
                  <div className="absolute -bottom-2 flex gap-3">
                    <div className="w-3 h-3 rounded-full bg-stone-800 border border-stone-300" />
                    <div className="w-3 h-3 rounded-full bg-stone-800 border border-stone-300" />
                  </div>
                )}

                {/* Caterpillar feet */}
                {theme === 'caterpillar' && (
                  <div className="absolute -bottom-1.5 flex gap-2">
                    <div className="w-2 h-2 rounded-full bg-emerald-700" />
                    <div className="w-2 h-2 rounded-full bg-emerald-700" />
                  </div>
                )}

                {isEmpty ? (
                  <>
                    {/* Ghost watermark shown ONLY on screen during editing */}
                    <div className="no-print flex flex-col items-center justify-center opacity-30 group-hover:opacity-60 transition-opacity">
                      <span className="font-extrabold text-stone-500 leading-none">{num}</span>
                      <Pencil style={{ width: `${iconSize}px`, height: `${iconSize}px` }} className="text-emerald-700 mt-0.5" />
                    </div>

                    {/* Dotted pencil write-line for students in PRINT & EXPORT */}
                    <div className="hidden print:block w-3/4 border-b-2 border-dotted border-stone-400 h-0.5 mt-auto mb-1.5" />
                  </>
                ) : (
                  /* Filled Number */
                  <span className="leading-none text-center select-none font-black">
                    {num}
                  </span>
                )}
              </div>

              {/* Connector between cells */}
              {isNotLast && (
                <div
                  className={`shrink-0 flex items-center justify-center ${
                    theme === 'train'
                      ? 'w-2 h-1 bg-stone-700 rounded-full'
                      : theme === 'caterpillar'
                      ? 'w-1 h-1 bg-emerald-600 rounded-full'
                      : theme === 'blocks'
                      ? 'text-stone-400 text-xs font-bold'
                      : 'w-1.5 h-0.5 bg-stone-300'
                  }`}
                >
                  {theme === 'blocks' && <span className="opacity-40">·</span>}
                </div>
              )}
            </React.Fragment>
          );
        })}
      </div>

      {/* Interactive Helper Hint (hidden in print) */}
      {interactive && (
        <div className="no-print mt-1 text-[11px] text-stone-500 font-medium flex items-center gap-1.5">
          <span className="inline-block w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
          <span>انقر على أي خانة للتبديل بين (فارغة ✏️ / مكتوبة 🔢)</span>
        </div>
      )}
    </div>
  );
};
