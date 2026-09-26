export type ExerciseType = 'count' | 'draw' | 'match' | 'strip';

export type StripTheme = 'train' | 'caterpillar' | 'blocks' | 'bubbles' | 'cards' | 'flags';

export interface StripConfig {
  startNum: number;
  endNum: number;
  emptyCount: number;
  hiddenIndices: number[]; // indices (0-based) of empty boxes where children write
  theme: StripTheme;
  boxSize: number; // cell size in px (e.g. 48)
  direction: 'ltr' | 'rtl';
}

export type ItemType = 'emoji' | 'shape' | 'number' | 'hand';

export interface CardData {
  id: number;
  items: string[];
  size: number;
  // Specific to 'draw' exercise:
  targetEmoji?: string;
  targetCount?: number;
}

export interface ExerciseData {
  id: number;
  type: ExerciseType;
  title: string;
  instruction: string;
  instructionSize?: number;
  instructionAlign?: 'right' | 'center';
  cards: CardData[];
  colWidth: number;
  itemSize: number;
  // For match exercise
  numOrder?: number[];
  flagIds?: number[];
  compactAnswer?: boolean;
  // For strip exercise
  stripConfig?: StripConfig;
}

export interface PageHeaderData {
  enabled: boolean;
  schoolName: string;
  grade: string;
  title: string;
  subtitle: string;
  studentName: string;
  date: string;
  evaluation: string;
}

export const DEFAULT_INSTRUCTIONS: Record<ExerciseType, string> = {
  count: 'اكتب العدد المناسب لكل مجموعة داخل الإطار المخصص:',
  draw: 'ارسم الأشكال في المجموعة حسب العدد المكتوب في البطاقة:',
  match: 'اربط كل مجموعة من العناصر بالعدد المناسب لها:',
  strip: 'اكتب الأعداد الناقصة في الخانات الفارغة للشريط العددي:'
};

/**
 * Calculates the true numerical value represented by a card or an array of items.
 * Handles hands ('hand:5' = 5), numbers, and countable collections.
 */
export function getCardValue(cardOrItems: CardData | string[] | undefined): number {
  if (!cardOrItems) return 0;
  const items = Array.isArray(cardOrItems) ? cardOrItems : cardOrItems.items;
  if (!items || items.length === 0) return 0;

  let total = 0;
  let hasSpecial = false;

  for (const item of items) {
    if (typeof item !== 'string') continue;
    if (item.startsWith('hand:')) {
      hasSpecial = true;
      const count = parseInt(item.replace('hand:', ''), 10);
      total += isNaN(count) ? 1 : count;
    } else if (item.startsWith('num:')) {
      hasSpecial = true;
      const count = parseInt(item.replace('num:', ''), 10);
      total += isNaN(count) ? 1 : count;
    } else if (/^\d+$/.test(item)) {
      hasSpecial = true;
      const count = parseInt(item, 10);
      total += isNaN(count) ? 1 : count;
    }
  }

  if (hasSpecial) {
    for (const item of items) {
      if (!item.startsWith('hand:') && !item.startsWith('num:') && !/^\d+$/.test(item)) {
        total += 1;
      }
    }
    return total;
  }

  return items.length;
}
