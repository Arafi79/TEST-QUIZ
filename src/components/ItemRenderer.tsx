import React from 'react';
import { HandVisual } from './HandVisual';

interface ItemRendererProps {
  item: string;
  size: number;
}

// Catalog of animals and plants/fruits to scale down slightly for space optimization
const ANIMALS_AND_PLANTS = new Set([
  // Animals
  '🐱', '🐶', '🐰', '🐻', '🐟', '🦋', '🐝', '🦆', '🐢', '🦁', '🐘', '🐸', '🐧', '🐬', '🐥',
  // Plants, fruits & nature
  '🍎', '🍌', '🍇', '🍊', '🍓', '🍉', '🍒', '🍍', '🥕', '🌽', '🌸', '🌼', '🍀', '🍄', '🍁', '🌻', '🍂',
  '🌹', '🌷', '🌴', '🌳', '🌲', '🌱', '🌿', '🌾'
]);

export const ItemRenderer: React.FC<ItemRendererProps> = ({ item, size }) => {
  // Check if item is a hand representation
  if (item.startsWith('hand:')) {
    const count = parseInt(item.replace('hand:', ''), 10) || 1;
    return <HandVisual count={count} size={size} />;
  }

  // Check if item is a number tile
  if (/^\d+$/.test(item) || item.startsWith('num:')) {
    const val = item.replace('num:', '');
    return (
      <span
        style={{
          fontSize: `${Math.max(13, Math.round(size * 0.55))}px`,
          minWidth: `${Math.max(26, Math.round(size * 0.9))}px`,
          height: `${Math.max(26, Math.round(size * 0.9))}px`
        }}
        className="inline-flex items-center justify-center font-bold px-1.5 rounded-lg border-2 border-amber-300 bg-amber-50 text-amber-900 shadow-xs tabular-nums select-none"
      >
        {val}
      </span>
    );
  }

  // Animals and plants: slightly scaled down (0.8x) to save card space
  const isAnimalOrPlant = ANIMALS_AND_PLANTS.has(item);
  const effectiveSize = isAnimalOrPlant ? Math.max(14, Math.round(size * 0.8)) : size;

  // Shapes or other emojis
  return (
    <span
      style={{ fontSize: `${effectiveSize}px`, lineHeight: 1 }}
      className="inline-flex items-center justify-center select-none transform hover:scale-110 transition-transform"
      title={isAnimalOrPlant ? 'رمز مصغر لتوفير المساحة' : undefined}
    >
      {item}
    </span>
  );
};
