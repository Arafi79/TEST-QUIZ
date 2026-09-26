import React, { useState, useRef } from 'react';
import { ExerciseData, CardData, getCardValue, StripTheme } from '../types';
import { ItemRenderer } from './ItemRenderer';
import { StripRenderer } from './StripRenderer';
import {
  Settings,
  Plus,
  Trash2,
  Maximize2,
  Minimize2,
  ZoomIn,
  ZoomOut,
  Shuffle,
  Camera,
  ChevronUp,
  ChevronDown,
  Edit2,
  Check,
  Palette,
  Sliders
} from 'lucide-react';

interface ExerciseBlockProps {
  exercise: ExerciseData;
  exerciseIndex: number;
  totalExercises: number;
  onUpdateExercise: (updated: ExerciseData) => void;
  onOpenCardSettings: (card: CardData, exerciseId: number) => void;
  onOpenStripSettings?: (exercise: ExerciseData) => void;
  onDeleteExercise: (exerciseId: number) => void;
  onMoveExercise: (index: number, direction: 'up' | 'down') => void;
  onExportExercise: (element: HTMLElement, title: string) => void;
}

export const ExerciseBlock: React.FC<ExerciseBlockProps> = ({
  exercise,
  exerciseIndex,
  totalExercises,
  onUpdateExercise,
  onOpenCardSettings,
  onOpenStripSettings,
  onDeleteExercise,
  onMoveExercise,
  onExportExercise
}) => {
  const containerRef = useRef<HTMLDivElement>(null);
  const [editingInstruction, setEditingInstruction] = useState(false);
  const [instructionText, setInstructionText] = useState(exercise.instruction);

  // Match exercise interactive states
  const [pickedTop, setPickedTop] = useState<number | null>(null);
  const [matchedPairs, setMatchedPairs] = useState<{ [cardId: number]: boolean }>({});
  const [matchSel, setMatchSel] = useState<{ id: number; result: 'ok' | 'bad' } | null>(null);

  // Strip exercise handlers
  const handleToggleStripCell = (index: number) => {
    if (!exercise.stripConfig) return;
    const currentHidden = exercise.stripConfig.hiddenIndices || [];
    const newHidden = currentHidden.includes(index)
      ? currentHidden.filter((i) => i !== index)
      : [...currentHidden, index].sort((a, b) => a - b);

    onUpdateExercise({
      ...exercise,
      stripConfig: {
        ...exercise.stripConfig,
        hiddenIndices: newHidden,
        emptyCount: newHidden.length
      }
    });
  };

  const shrinkStripBoxes = () => {
    if (!exercise.stripConfig) return;
    const newSize = Math.max(34, (exercise.stripConfig.boxSize || 48) - 4);
    onUpdateExercise({
      ...exercise,
      stripConfig: {
        ...exercise.stripConfig,
        boxSize: newSize
      }
    });
  };

  const expandStripBoxes = () => {
    if (!exercise.stripConfig) return;
    const newSize = Math.min(70, (exercise.stripConfig.boxSize || 48) + 4);
    onUpdateExercise({
      ...exercise,
      stripConfig: {
        ...exercise.stripConfig,
        boxSize: newSize
      }
    });
  };

  const shuffleStripEmpty = () => {
    if (!exercise.stripConfig) return;
    const { startNum, endNum, emptyCount } = exercise.stripConfig;
    const total = Math.max(1, endNum - startNum + 1);
    const validCount = Math.min(Math.max(1, emptyCount), Math.max(1, total - 1));
    const allIndices = Array.from({ length: total }, (_, i) => i);
    const shuffled = [...allIndices].sort(() => Math.random() - 0.5);
    const newHidden = shuffled.slice(0, validCount).sort((a, b) => a - b);
    onUpdateExercise({
      ...exercise,
      stripConfig: {
        ...exercise.stripConfig,
        hiddenIndices: newHidden
      }
    });
  };

  const cycleStripTheme = () => {
    if (!exercise.stripConfig) return;
    const themes: StripTheme[] = ['train', 'caterpillar', 'blocks', 'bubbles', 'cards', 'flags'];
    const currentIdx = themes.indexOf(exercise.stripConfig.theme || 'train');
    const nextTheme = themes[(currentIdx + 1) % themes.length];
    onUpdateExercise({
      ...exercise,
      stripConfig: {
        ...exercise.stripConfig,
        theme: nextTheme
      }
    });
  };

  // Card Width adjustment
  const shrinkCol = () => {
    onUpdateExercise({
      ...exercise,
      colWidth: Math.max(105, exercise.colWidth - 15)
    });
  };

  const expandCol = () => {
    onUpdateExercise({
      ...exercise,
      colWidth: Math.min(280, exercise.colWidth + 15)
    });
  };

  // Item Size adjustment
  const shrinkItems = () => {
    const newCards = exercise.cards.map((c) => ({
      ...c,
      size: Math.max(16, (c.size || exercise.itemSize) - 3)
    }));
    onUpdateExercise({
      ...exercise,
      cards: newCards,
      itemSize: Math.max(16, exercise.itemSize - 3)
    });
  };

  const enlargeItems = () => {
    const newCards = exercise.cards.map((c) => ({
      ...c,
      size: Math.min(56, (c.size || exercise.itemSize) + 3)
    }));
    onUpdateExercise({
      ...exercise,
      cards: newCards,
      itemSize: Math.min(56, exercise.itemSize + 3)
    });
  };

  // Add new card
  const handleAddCard = () => {
    const newId = Date.now() + Math.floor(Math.random() * 1000);
    let newCard: CardData;

    if (exercise.type === 'draw') {
      newCard = {
        id: newId,
        items: [],
        size: exercise.itemSize,
        targetEmoji: '🍎',
        targetCount: 4
      };
    } else if (exercise.type === 'match') {
      // Match exercises strictly use symbols and shapes, never hands or numbers
      const matchSymbolsPool = ['🍎', '⭐', '🎈', '🚗', '🐱', '🌸', '🍇', '○', '△', '□'];
      const usedCounts = exercise.cards.map((c) => c.items.length);
      let nextCount = 1;
      while (usedCounts.includes(nextCount) && nextCount < 12) {
        nextCount++;
      }
      const sym = matchSymbolsPool[exercise.cards.length % matchSymbolsPool.length];
      newCard = {
        id: newId,
        items: Array(nextCount).fill(sym),
        size: exercise.itemSize
      };
    } else {
      // Count exercise
      newCard = {
        id: newId,
        items: ['🍎', '🍎', '🍎'],
        size: exercise.itemSize
      };
    }

    onUpdateExercise({
      ...exercise,
      cards: [...exercise.cards, newCard],
      numOrder: undefined // reset shuffle
    });
  };

  // Shuffle for matching exercise
  const handleShuffle = () => {
    const empties = exercise.cards.filter((c) => getCardValue(c) <= 0).map((c) => c.id);
    if (empties.length) {
      onUpdateExercise({ ...exercise, flagIds: empties });
      return;
    }

    const counts: Record<number, number> = {};
    exercise.cards.forEach((c) => {
      const val = getCardValue(c);
      counts[val] = (counts[val] || 0) + 1;
    });
    const dupVals = Object.keys(counts).filter((k) => counts[Number(k)] > 1).map(Number);
    if (dupVals.length) {
      const flagged = exercise.cards.filter((c) => dupVals.includes(getCardValue(c))).map((c) => c.id);
      onUpdateExercise({ ...exercise, flagIds: flagged });
      return;
    }

    const shuffled = [...exercise.cards.map((c) => c.id)].sort(() => Math.random() - 0.5);
    onUpdateExercise({
      ...exercise,
      numOrder: shuffled,
      flagIds: []
    });
    setPickedTop(null);
    setMatchSel(null);
  };

  // Interactive matching clicks
  const handlePickTop = (cardId: number) => {
    setPickedTop(pickedTop === cardId ? null : cardId);
  };

  const handlePickNumber = (targetCardId: number) => {
    if (pickedTop === null) return;
    const topCard = exercise.cards.find((c) => c.id === pickedTop);
    const numCard = exercise.cards.find((c) => c.id === targetCardId);

    if (!topCard || !numCard) return;

    // Compare actual numeric value (fingers or items)
    const isCorrect = getCardValue(topCard) === getCardValue(numCard);
    setMatchSel({ id: targetCardId, result: isCorrect ? 'ok' : 'bad' });

    if (isCorrect) {
      setMatchedPairs((prev) => ({ ...prev, [pickedTop]: true }));
    }

    setTimeout(() => {
      setMatchSel(null);
      setPickedTop(null);
    }, 700);
  };

  const saveInstruction = () => {
    onUpdateExercise({
      ...exercise,
      instruction: instructionText.trim() || exercise.instruction
    });
    setEditingInstruction(false);
  };

  return (
    <section
      ref={containerRef}
      className="relative mb-3 print:mb-2 p-3 sm:p-3.5 print:p-2.5 print:py-2 bg-white rounded-xl border-2 border-stone-300 print:border-stone-400 shadow-2xs text-stone-900 transition-all hover:border-stone-400 group"
    >
      {/* Exercise Action Toolbar (hidden on print) */}
      <div className="no-print flex flex-wrap items-center justify-between gap-1.5 pb-2 mb-2 border-b border-stone-200 text-xs">
        {/* Left: exercise reorder & identify */}
        <div className="flex items-center gap-1.5">
          <span className="font-extrabold px-2 py-0.5 rounded-md bg-stone-100 text-stone-700">
            تمرين #{exerciseIndex + 1}
          </span>

          <div className="flex items-center border border-stone-200 rounded-lg overflow-hidden bg-white">
            <button
              onClick={() => onMoveExercise(exerciseIndex, 'up')}
              disabled={exerciseIndex === 0}
              className="p-1 text-stone-500 hover:text-stone-900 hover:bg-stone-100 disabled:opacity-30"
              title="تحريك لأعلى"
            >
              <ChevronUp className="w-3.5 h-3.5" />
            </button>
            <button
              onClick={() => onMoveExercise(exerciseIndex, 'down')}
              disabled={exerciseIndex === totalExercises - 1}
              className="p-1 text-stone-500 hover:text-stone-900 hover:bg-stone-100 disabled:opacity-30"
              title="تحريك لأسفل"
            >
              <ChevronDown className="w-3.5 h-3.5" />
            </button>
          </div>
        </div>

        {/* Center & Right: Card sizing, item sizing, add card, export */}
        <div className="flex flex-wrap items-center gap-1 sm:gap-1.5">
          {exercise.type === 'strip' ? (
            <>
              {/* Strip box sizing (جماعياً) */}
              <div className="flex items-center border border-stone-200 rounded-lg bg-white overflow-hidden" title="التحكم في حجم خانات الشريط (جماعياً)">
                <button
                  onClick={shrinkStripBoxes}
                  className="px-2 py-1 text-stone-600 hover:bg-stone-100 flex items-center gap-0.5 font-bold"
                  title="تصغير خانات الشريط (-4px)"
                >
                  <ZoomOut className="w-3 h-3 text-stone-500" />
                  تصغير
                </button>
                <span className="w-px h-3 bg-stone-200" />
                <button
                  onClick={expandStripBoxes}
                  className="px-2 py-1 text-stone-600 hover:bg-stone-100 flex items-center gap-0.5 font-bold"
                  title="تكبير خانات الشريط (+4px)"
                >
                  <ZoomIn className="w-3 h-3 text-purple-600" />
                  تكبير
                </button>
              </div>

              {/* Shuffle empty boxes in strip */}
              <button
                onClick={shuffleStripEmpty}
                className="px-2 py-1 rounded-lg bg-amber-50 border border-amber-300 text-amber-900 font-bold hover:bg-amber-100 flex items-center gap-1"
                title="إعادة توزيع الخانات الفارغة في مواضع عشوائية جديدة"
              >
                <Shuffle className="w-3 h-3" />
                خلط الفارغة
              </button>

              {/* Cycle theme */}
              <button
                onClick={cycleStripTheme}
                className="px-2 py-1 rounded-lg bg-purple-50 border border-purple-300 text-purple-900 font-bold hover:bg-purple-100 flex items-center gap-1"
                title="تبديل تنسيق وتصميم الشريط (قطار، دودة، مربعات، فقاعات...)"
              >
                <Palette className="w-3 h-3" />
                تغيير التنسيق
              </button>

              {/* Strip Settings (مجال، عدد الفارغة، الخ) */}
              {onOpenStripSettings && (
                <button
                  onClick={() => onOpenStripSettings(exercise)}
                  className="px-2 py-1 rounded-lg bg-stone-100 hover:bg-stone-200 text-stone-800 font-bold flex items-center gap-1"
                  title="تعديل مجال الأعداد والخانات الفارغة"
                >
                  <Sliders className="w-3 h-3 text-stone-600" />
                  إعدادات الشريط
                </button>
              )}
            </>
          ) : (
            <>
              {/* Card sizing */}
              <div className="flex items-center border border-stone-200 rounded-lg bg-white overflow-hidden" title="التحكم في عرض البطاقات">
                <button
                  onClick={shrinkCol}
                  className="px-2 py-1 text-stone-600 hover:bg-stone-100 flex items-center gap-0.5 font-bold"
                  title="تضييق عرض البطاقات"
                >
                  <Minimize2 className="w-3 h-3 text-stone-500" />
                  تضييق
                </button>
                <span className="w-px h-3 bg-stone-200" />
                <button
                  onClick={expandCol}
                  className="px-2 py-1 text-stone-600 hover:bg-stone-100 flex items-center gap-0.5 font-bold"
                  title="توسيع عرض البطاقات"
                >
                  <Maximize2 className="w-3 h-3 text-emerald-600" />
                  توسيع
                </button>
              </div>

              {/* Item sizing */}
              <div className="flex items-center border border-stone-200 rounded-lg bg-white overflow-hidden" title="التحكم في حجم الرموز">
                <button
                  onClick={shrinkItems}
                  className="px-2 py-1 text-stone-600 hover:bg-stone-100 flex items-center gap-0.5 font-bold"
                  title="تصغير حجم العناصر (-3px)"
                >
                  <ZoomOut className="w-3 h-3 text-stone-500" />
                  تصغير
                </button>
                <span className="w-px h-3 bg-stone-200" />
                <button
                  onClick={enlargeItems}
                  className="px-2 py-1 text-stone-600 hover:bg-stone-100 flex items-center gap-0.5 font-bold"
                  title="تكبير حجم العناصر (+3px)"
                >
                  <ZoomIn className="w-3 h-3 text-emerald-600" />
                  تكبير
                </button>
              </div>

              {/* Shuffle button for Match */}
              {exercise.type === 'match' && (
                <button
                  onClick={handleShuffle}
                  className="px-2 py-1 rounded-lg bg-amber-50 border border-amber-300 text-amber-900 font-bold hover:bg-amber-100 flex items-center gap-1"
                  title="خلط ترتيب البطاقات الرقمية"
                >
                  <Shuffle className="w-3 h-3" />
                  خلط الأعداد
                </button>
              )}

              {/* Add card */}
              <button
                onClick={handleAddCard}
                className="px-2.5 py-1 rounded-lg bg-emerald-600 text-white font-bold hover:bg-emerald-700 flex items-center gap-1 shadow-2xs"
              >
                <Plus className="w-3 h-3" />
                + بطاقة
              </button>
            </>
          )}

          {/* Export this exercise */}
          <button
            onClick={() => containerRef.current && onExportExercise(containerRef.current, `تمرين-${exerciseIndex + 1}`)}
            className="px-2 py-1 rounded-lg bg-stone-100 hover:bg-stone-200 text-stone-700 font-bold flex items-center gap-1"
            title="تصدير هذا التمرين فقط كصورة PNG عالية الدقة"
          >
            <Camera className="w-3 h-3" />
            تصدير كصورة
          </button>

          {/* Delete exercise */}
          <button
            onClick={() => onDeleteExercise(exercise.id)}
            className="p-1 rounded-lg text-rose-500 hover:bg-rose-50 hover:text-rose-700"
            title="حذف هذا التمرين"
          >
            <Trash2 className="w-3.5 h-3.5" />
          </button>
        </div>
      </div>

      {/* Instruction Line (سطر التعليمة قبل البطاقات) */}
      <div className="mb-2.5 print:mb-2">
        {editingInstruction ? (
          <div className="flex items-center gap-1.5 no-print">
            <input
              type="text"
              value={instructionText}
              onChange={(e) => setInstructionText(e.target.value)}
              className="flex-1 px-3 py-1.5 text-base sm:text-lg font-bold border-2 border-emerald-400 rounded-lg bg-white"
              autoFocus
            />
            <button
              onClick={saveInstruction}
              className="px-3 py-1.5 bg-emerald-600 text-white rounded-lg text-xs font-bold flex items-center gap-1 shrink-0"
            >
              <Check className="w-3.5 h-3.5" />
              تم
            </button>
          </div>
        ) : (
          <div
            onClick={() => setEditingInstruction(true)}
            className="flex items-start gap-2.5 cursor-pointer group/inst py-1 px-1 rounded-lg hover:bg-stone-50 transition-colors"
            title="انقر لتعديل التعليمة"
          >
            <div className="w-3 h-3 rounded-full bg-emerald-600 shrink-0 mt-1" />
            <p className="flex-1 font-extrabold text-base sm:text-[17px] print:text-[15px] text-stone-900 leading-normal break-words overflow-visible">
              {exercise.instruction}
            </p>
            <Edit2 className="w-3.5 h-3.5 text-stone-400 opacity-0 group-hover/inst:opacity-100 transition-opacity no-print shrink-0 mt-1" />
          </div>
        )}
      </div>

      {/* Exercise Content according to type */}
      {exercise.type === 'count' && (
        /* TYPE 1: Count & write number */
        <div className="flex flex-wrap justify-center gap-2.5 sm:gap-3 print:gap-2">
          {exercise.cards.map((card) => (
            <div
              key={card.id}
              className="shrink-0 flex flex-col gap-1.5"
              style={{ width: `${exercise.colWidth}px`, maxWidth: '100%' }}
            >
              {/* Card Container */}
              <div className="relative min-h-[110px] print:min-h-[85px] p-2 print:p-1.5 rounded-xl border-2 border-stone-300 print:border-stone-400 bg-white shadow-2xs flex flex-col justify-between hover:border-stone-400 transition-colors">
                {/* Gear button (hidden on print) */}
                <div className="no-print flex justify-end">
                  <button
                    onClick={() => onOpenCardSettings(card, exercise.id)}
                    className="p-1 rounded-full text-stone-400 hover:text-stone-800 hover:bg-stone-100 transition-colors"
                    title="تعديل محتوى البطاقة"
                  >
                    <Settings className="w-3.5 h-3.5" />
                  </button>
                </div>

                {/* Items Box */}
                <div
                  onClick={() => onOpenCardSettings(card, exercise.id)}
                  className="flex-1 flex flex-wrap items-center justify-center content-center gap-1.5 p-1 cursor-pointer select-none min-h-[65px] print:min-h-[50px]"
                >
                  {card.items.length === 0 ? (
                    <span className="text-xs text-stone-400 font-medium no-print">
                      + انقر لإضافة عناصر
                    </span>
                  ) : (
                    card.items.map((item, idx) => (
                      <ItemRenderer
                        key={idx}
                        item={item}
                        size={card.size || exercise.itemSize}
                      />
                    ))
                  )}
                </div>
              </div>

              {/* Blank Answer card beneath */}
              <div className="h-9 print:h-7 rounded-xl border-2 border-stone-300 print:border-stone-400 bg-stone-50/50 flex items-center justify-center">
                <span className="w-2/3 border-b-2 border-dotted border-stone-400 h-0.5" />
              </div>
            </div>
          ))}
        </div>
      )}

      {exercise.type === 'draw' && (
        /* TYPE 2: Draw items according to number */
        <div className="flex flex-wrap justify-center gap-2.5 sm:gap-3 print:gap-2">
          {exercise.cards.map((card) => (
            <div
              key={card.id}
              className="shrink-0 flex flex-col gap-1.5"
              style={{ width: `${exercise.colWidth}px`, maxWidth: '100%' }}
            >
              {/* Target Symbol indicator header */}
              <div className="relative flex items-center justify-center py-1 min-h-[38px] print:min-h-[32px]">
                <button
                  onClick={() => onOpenCardSettings(card, exercise.id)}
                  className="no-print absolute left-0 top-1/2 -translate-y-1/2 p-1 rounded-full text-stone-400 hover:text-stone-800 hover:bg-stone-100"
                  title="تعديل الرمز والعدد"
                >
                  <Settings className="w-3.5 h-3.5" />
                </button>
                <span
                  onClick={() => onOpenCardSettings(card, exercise.id)}
                  className="text-2xl sm:text-3xl print:text-2xl cursor-pointer hover:scale-110 transition-transform leading-none select-none text-center"
                  title="انقر لتعديل البطاقة والرمز"
                >
                  {card.targetEmoji || '🍎'}
                </span>
              </div>

              {/* Blank Drawing Box */}
              <div
                onClick={() => onOpenCardSettings(card, exercise.id)}
                className="h-24 sm:h-28 print:h-20 rounded-xl border-2 border-dashed border-stone-300 print:border-stone-400 bg-stone-50/30 flex items-center justify-center cursor-pointer hover:border-stone-400 transition-colors"
              >
                <span className="text-[11px] text-stone-400 font-medium select-none no-print">
                  ارسم هنا
                </span>
              </div>

              {/* Target Number Badge */}
              <div
                onClick={() => onOpenCardSettings(card, exercise.id)}
                className="py-1 px-3 print:py-0.5 rounded-xl border-2 border-blue-200 bg-blue-50/80 text-blue-900 font-black text-center text-lg print:text-base cursor-pointer hover:bg-blue-100 transition-colors select-none"
              >
                {card.targetCount || 5}
              </div>
            </div>
          ))}
        </div>
      )}

      {exercise.type === 'match' && (
        /* TYPE 3: Match collection with number */
        <div className="space-y-3 print:space-y-1.5">
          {/* Top row: Collection cards */}
          <div>
            <div className="flex items-center justify-between text-xs sm:text-sm text-stone-600 mb-1 font-bold">
              <span>مجموعات الرموز والأشكال (صل كل مجموعة بالعدد المناسب لها):</span>
            </div>
            <div className="flex flex-wrap justify-center gap-2.5 sm:gap-3 print:gap-2">
              {exercise.cards.map((card) => {
                const isPicked = pickedTop === card.id;
                const isFlagged = exercise.flagIds?.includes(card.id);
                const isMatched = matchedPairs[card.id];

                return (
                  <div
                    key={card.id}
                    onClick={() => handlePickTop(card.id)}
                    style={{ width: `${exercise.colWidth}px`, maxWidth: '100%' }}
                    className={`shrink-0 relative p-2 print:p-1.5 rounded-xl border-2 transition-all cursor-pointer min-h-[95px] print:min-h-[75px] flex flex-col justify-between ${
                      isFlagged
                        ? 'border-rose-400 bg-rose-50/40 ring-2 ring-rose-200'
                        : isPicked
                        ? 'border-amber-500 bg-amber-50 shadow-md ring-2 ring-amber-300'
                        : isMatched
                        ? 'border-emerald-500 bg-emerald-50/40'
                        : 'border-stone-300 print:border-stone-400 bg-white hover:border-stone-400'
                    }`}
                  >
                    <div className="no-print flex justify-end">
                      <button
                        onClick={(e) => {
                          e.stopPropagation();
                          onOpenCardSettings(card, exercise.id);
                        }}
                        className="p-1 rounded-full text-stone-400 hover:text-stone-800 hover:bg-stone-100"
                        title="إعدادات البطاقة"
                      >
                        <Settings className="w-3.5 h-3.5" />
                      </button>
                    </div>

                    <div className="flex-1 flex flex-wrap items-center justify-center content-center gap-1.5 p-1 select-none">
                      {card.items.length === 0 ? (
                        <span className="text-xs text-stone-400 font-medium">فارغة</span>
                      ) : (
                        card.items.map((item, idx) => (
                          <ItemRenderer
                            key={idx}
                            item={item}
                            size={card.size || exercise.itemSize}
                          />
                        ))
                      )}
                    </div>

                    {/* Connecting point dot for print worksheets - solid black */}
                    <div className="flex justify-center mt-1">
                      <div className="w-3 h-3 rounded-full bg-black print:bg-black" />
                    </div>
                  </div>
                );
              })}
            </div>
          </div>

          {/* Bottom row: Number tiles for matching */}
          <div className="pt-1">
            <div className="flex flex-wrap justify-center gap-2.5 sm:gap-3 print:gap-2">
              {(exercise.numOrder || exercise.cards.map((c) => c.id)).map((targetCardId) => {
                const targetCard = exercise.cards.find((c) => c.id === targetCardId);
                // Correctly resolve the number of fingers or items
                const count = targetCard ? getCardValue(targetCard) : 0;
                const isSelected = matchSel && matchSel.id === targetCardId;
                const statusCls = isSelected
                  ? matchSel.result === 'ok'
                    ? 'border-emerald-500 bg-emerald-100 text-emerald-800 ring-2 ring-emerald-300'
                    : 'border-rose-500 bg-rose-100 text-rose-800 ring-2 ring-rose-300 animate-shake'
                  : 'border-stone-300 print:border-stone-400 bg-white hover:border-amber-400 hover:bg-amber-50/50';

                return (
                  <div
                    key={targetCardId}
                    className="shrink-0 flex flex-col items-center gap-1"
                    style={{ width: `${exercise.colWidth}px`, maxWidth: '100%' }}
                  >
                    {/* Connecting dot above - solid black */}
                    <div className="w-3 h-3 rounded-full bg-black print:bg-black" />

                    <div
                      onClick={() => handlePickNumber(targetCardId)}
                      className={`w-full h-10 print:h-8 rounded-xl border-2 border-dashed flex items-center justify-center text-lg print:text-sm font-black cursor-pointer transition-all select-none shadow-2xs ${statusCls}`}
                    >
                      {count}
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        </div>
      )}

      {/* TYPE 4: Number Strip */}
      {exercise.type === 'strip' && exercise.stripConfig && (
        <div className="w-full flex justify-center py-1">
          <StripRenderer
            stripConfig={exercise.stripConfig}
            onToggleCell={handleToggleStripCell}
            interactive={true}
          />
        </div>
      )}
    </section>
  );
};
