import React, { useState } from 'react';
import { CardData, ExerciseType, getCardValue } from '../types';
import { ItemRenderer } from './ItemRenderer';
import { HandVisual } from './HandVisual';
import {
  X,
  Plus,
  RotateCcw,
  Trash2,
  ZoomIn,
  ZoomOut,
  Maximize2,
  Minimize2,
  Check,
  Sparkles,
  Shapes,
  Hash,
  Hand
} from 'lucide-react';

interface CardSettingsModalProps {
  card: CardData;
  exerciseType: ExerciseType;
  exerciseColWidth: number;
  onUpdateCard: (updatedCard: CardData) => void;
  onUpdateColWidth?: (newWidth: number) => void;
  onDeleteCard: (cardId: number) => void;
  onClose: () => void;
}

const EMOJI_GROUPS = [
  {
    name: 'فواكه وطعام (مصغرة لتوفير المساحة)',
    items: ['🍎', '🍌', '🍇', '🍊', '🍓', '🍉', '🍒', '🍍', '🥕', '🌽', '🍦', '🍭', '🍩', '🍪']
  },
  {
    name: 'حيوانات (مصغرة لتوفير المساحة)',
    items: ['🐱', '🐶', '🐰', '🐻', '🐟', '🦋', '🐝', '🦆', '🐢', '🦁', '🐘', '🐸', '🐧', '🐬', '🐥']
  },
  {
    name: 'ألعاب ومركبات (حجم قياسي)',
    items: ['🚗', '✈️', '🚀', '🚂', '🎈', '🧸', '⚽', '🏀', '🎁', '🚲', '⛵', '🚁', '🧩', '🥁', '🎨']
  },
  {
    name: 'طبيعة ورموز',
    items: ['⭐', '🌸', '🌼', '🌙', '☀️', '🌈', '🍀', '🍄', '🍁', '🌻', '⛅', '⚡', '🍂', '✨']
  }
];

const SHAPES_LIST = [
  '□', '○', '△', '☾', '⭐', '◊', '⬡', '🤍', '✚', '⌂', '⬢', '▭', '⬤', '▲', '◼', '◆', '✦', '✪', '▰', '▱'
];

const NUMBERS_LIST = [
  '1', '2', '3', '4', '5', '6', '7', '8', '9', '10',
  '11', '12', '15', '20', '30', '50', '100'
];

const HANDS_LIST = [1, 2, 3, 4, 5, 6, 7, 8, 9, 10];

export const CardSettingsModal: React.FC<CardSettingsModalProps> = ({
  card,
  exerciseType,
  exerciseColWidth,
  onUpdateCard,
  onUpdateColWidth,
  onDeleteCard,
  onClose
}) => {
  // If match exercise: ONLY drawings and shapes are allowed (no hands, no numbers)
  const isMatchExercise = exerciseType === 'match';

  // Sanitize initial items for match exercise (strip hands and numbers)
  const initialItems = isMatchExercise
    ? card.items.filter((it) => !it.startsWith('hand:') && !it.startsWith('num:') && !/^\d+$/.test(it))
    : [...card.items];

  const initialTab = isMatchExercise
    ? 'drawings'
    : card.items.some((it) => it.startsWith('hand:'))
    ? 'hands'
    : 'drawings';

  const [activeTab, setActiveTab] = useState<'drawings' | 'shapes' | 'numbers' | 'hands'>(initialTab);
  const [items, setItems] = useState<string[]>(initialItems);
  const [size, setSize] = useState<number>(card.size || 34);
  const [qty, setQty] = useState<number>(1);
  const [colWidth, setColWidth] = useState<number>(exerciseColWidth || 150);

  // For 'draw' exercise
  const [targetEmoji, setTargetEmoji] = useState<string>(card.targetEmoji || '🍎');
  const [targetCount, setTargetCount] = useState<number>(card.targetCount || 5);

  const addItem = (token: string, count = qty) => {
    // In match exercise, strictly block any hand or number tokens
    if (isMatchExercise && (token.startsWith('hand:') || token.startsWith('num:') || /^\d+$/.test(token))) {
      return;
    }

    const toAdd = Array(count).fill(token);
    setItems((prev) => {
      const next = [...prev, ...toAdd];
      return next.slice(0, 40); // Maximum 40 items per card
    });
  };

  // Dedicated hand setter for count exercise
  const setHandCount = (count: number) => {
    if (isMatchExercise) return;
    setItems([`hand:${count}`]);
  };

  // Duplicate last item
  const handleDuplicateLast = () => {
    if (items.length === 0) return;
    const lastItem = items[items.length - 1];
    if (lastItem.startsWith('hand:')) {
      return;
    }
    if (isMatchExercise && (lastItem.startsWith('hand:') || lastItem.startsWith('num:') || /^\d+$/.test(lastItem))) {
      return;
    }
    addItem(lastItem, 1);
  };

  const undoLast = () => {
    setItems((prev) => prev.slice(0, -1));
  };

  const clearAll = () => {
    setItems([]);
  };

  const handleSave = () => {
    if (exerciseType === 'draw') {
      onUpdateCard({
        ...card,
        targetEmoji,
        targetCount: Math.max(1, Math.min(30, targetCount))
      });
    } else {
      onUpdateCard({
        ...card,
        items,
        size
      });
    }

    if (onUpdateColWidth && colWidth !== exerciseColWidth) {
      onUpdateColWidth(colWidth);
    }

    onClose();
  };

  const lastItemName = items.length > 0 ? items[items.length - 1] : null;
  const cardValue = isMatchExercise ? items.length : getCardValue(items);
  const hasHands = !isMatchExercise && items.some((it) => it.startsWith('hand:'));

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 bg-stone-900/60 backdrop-blur-xs animate-in fade-in">
      <div
        className="w-full max-w-3xl max-h-[94vh] flex flex-col bg-white rounded-2xl shadow-2xl border border-stone-200 overflow-hidden text-stone-800"
        dir="rtl"
      >
        {/* Header */}
        <div className="flex items-center justify-between px-5 py-2.5 border-b border-stone-200 bg-stone-50/90 shrink-0">
          <div className="flex items-center gap-2">
            <span className="p-1.5 rounded-lg bg-emerald-100 text-emerald-800">
              <Sparkles className="w-4 h-4" />
            </span>
            <div>
              <h3 className="font-extrabold text-base text-stone-900 leading-tight">
                {exerciseType === 'draw'
                  ? 'إعدادات بطاقة الرسم والمقدار'
                  : isMatchExercise
                  ? 'إعدادات بطاقة مجموعة الربط (رموز وأشكال فقط)'
                  : 'إعدادات عناصر ومحتوى البطاقة'}
              </h3>
              <p className="text-[11px] text-stone-500">
                {isMatchExercise
                  ? 'في تمرين الربط ندرج الرموز والأشكال فقط لتمثيل العدد، دون أرقام أو أصابع'
                  : exerciseType === 'draw'
                  ? 'اختر الرمز المطلوب والعدد المطلوب من التلميذ رسمه'
                  : 'معاينة مباشرة للبطاقة في الأعلى مع التحكم في الإعدادات وإدراج العناصر'}
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 rounded-lg text-stone-400 hover:text-stone-700 hover:bg-stone-200/60 transition-colors"
            title="إغلاق"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* TOP SECTION: Real Card Preview on the right/start + Settings and buttons beside it */}
        <div className="shrink-0 p-3.5 sm:p-4 border-b-2 border-stone-200 bg-amber-50/30">
          <div className="flex flex-col sm:flex-row items-stretch sm:items-start gap-4">
            {/* Real Card Preview (as it appears on the sheet) */}
            <div className="flex flex-col items-center shrink-0">
              <div className="flex items-center justify-between w-full mb-1 px-0.5 text-xs">
                <span className="font-black text-stone-800 flex items-center gap-1">
                  <span>معاينة البطاقة:</span>
                </span>
                {exerciseType !== 'draw' && (
                  <span className="px-2 py-0.5 rounded-full bg-emerald-100 text-emerald-800 text-[11px] font-black">
                    {isMatchExercise
                      ? `${items.length} عنصر`
                      : hasHands
                      ? `${cardValue} أصابع`
                      : `${items.length} عنصر`}
                  </span>
                )}
              </div>

              {/* Card visual wrapper adhering to exact colWidth */}
              <div
                style={{ width: `${Math.min(220, Math.max(140, colWidth))}px` }}
                className="transition-all"
              >
                {/* 1. Count Exercise Preview */}
                {exerciseType === 'count' && (
                  <div className="flex flex-col gap-1.5">
                    <div className="relative min-h-[110px] p-2 rounded-xl border-2 border-stone-300 bg-white shadow-xs flex flex-col justify-between">
                      <div className="flex-1 flex flex-wrap items-center justify-center content-center gap-1.5 p-1 select-none min-h-[70px]">
                        {items.length === 0 ? (
                          <span className="text-xs text-stone-400 font-medium text-center leading-snug">
                            البطاقة فارغة
                            <br />
                            (اختر من التبويبات بالأسفل)
                          </span>
                        ) : (
                          items.map((item, idx) => (
                            <div
                              key={idx}
                              className="inline-flex items-center group relative cursor-pointer"
                              onClick={() => setItems((prev) => prev.filter((_, i) => i !== idx))}
                              title="انقر للحذف"
                            >
                              <ItemRenderer item={item} size={size} />
                              <span className="absolute -top-1 -right-1 hidden group-hover:flex w-3.5 h-3.5 bg-rose-600 text-white rounded-full items-center justify-center text-[9px] font-bold">
                                ×
                              </span>
                            </div>
                          ))
                        )}
                      </div>
                    </div>
                    {/* Blank Answer box beneath */}
                    <div className="h-8 rounded-xl border-2 border-stone-300 bg-stone-50/70 flex items-center justify-center">
                      <span className="w-2/3 border-b-2 border-dotted border-stone-400 h-0.5" />
                    </div>
                  </div>
                )}

                {/* 2. Draw Exercise Preview */}
                {exerciseType === 'draw' && (
                  <div className="flex flex-col gap-1.5">
                    <div className="flex items-center justify-center py-1">
                      <span className="text-3xl leading-none">{targetEmoji}</span>
                    </div>
                    <div className="h-20 rounded-xl border-2 border-dashed border-stone-300 bg-white flex items-center justify-center">
                      <span className="text-xs text-stone-400 font-medium">ارسم هنا</span>
                    </div>
                    <div className="py-1 px-3 rounded-xl border-2 border-blue-200 bg-blue-50 text-blue-900 font-black text-center text-lg">
                      {targetCount}
                    </div>
                  </div>
                )}

                {/* 3. Match Exercise Preview */}
                {exerciseType === 'match' && (
                  <div className="space-y-1">
                    <div className="relative p-2 rounded-xl border-2 border-stone-300 bg-white shadow-xs min-h-[90px] flex flex-col justify-between">
                      <div className="flex-1 flex flex-wrap items-center justify-center content-center gap-1.5 p-1 select-none">
                        {items.length === 0 ? (
                          <span className="text-xs text-stone-400 font-medium text-center">
                            فارغة
                          </span>
                        ) : (
                          items.map((item, idx) => (
                            <div
                              key={idx}
                              className="inline-flex items-center group relative cursor-pointer"
                              onClick={() => setItems((prev) => prev.filter((_, i) => i !== idx))}
                              title="انقر للحذف"
                            >
                              <ItemRenderer item={item} size={size} />
                              <span className="absolute -top-1 -right-1 hidden group-hover:flex w-3.5 h-3.5 bg-rose-600 text-white rounded-full items-center justify-center text-[9px] font-bold">
                                ×
                              </span>
                            </div>
                          ))
                        )}
                      </div>
                      <div className="flex justify-center mt-1">
                        <div className="w-2.5 h-2.5 rounded-full bg-black" />
                      </div>
                    </div>
                    <div className="flex flex-col items-center">
                      <div className="w-2.5 h-2.5 rounded-full bg-black mb-0.5" />
                      {/* In match, value is simply the count of items in the group */}
                      <div className="w-full h-8 rounded-xl border-2 border-dashed border-stone-300 bg-white flex items-center justify-center text-base font-black text-amber-900">
                        {items.length}
                      </div>
                    </div>
                  </div>
                )}
              </div>
            </div>

            {/* Settings & Action Controls BESIDE the Preview */}
            <div className="flex-1 flex flex-col justify-between gap-2.5">
              {/* Row 1: Actions bar (+ duplicate last, undo, clear) */}
              {exerciseType !== 'draw' ? (
                <div className="flex flex-wrap items-center justify-between gap-1.5 p-2 bg-white rounded-xl border border-stone-200">
                  <div className="flex items-center gap-1.5">
                    {/* The prominent (+) duplicate last item button */}
                    <button
                      type="button"
                      onClick={handleDuplicateLast}
                      disabled={items.length === 0 || hasHands || items.length >= 40}
                      className="px-3 py-1.5 rounded-lg bg-emerald-600 hover:bg-emerald-700 text-white font-black text-xs disabled:opacity-40 flex items-center gap-1.5 shadow-xs transition-colors"
                      title="إدراج عنصر جديد في البطاقة من نفس نوع آخر عنصر (+1)"
                    >
                      <Plus className="w-4 h-4 stroke-[3]" />
                      <span>+ إضافة نفس الأخير</span>
                    </button>

                    {lastItemName && (
                      <span className="text-[11px] text-stone-600 font-bold hidden md:inline">
                        (العنصر: {lastItemName.startsWith('hand:') ? `${lastItemName.replace('hand:', '')} أصابع` : lastItemName})
                      </span>
                    )}
                  </div>

                  <div className="flex items-center gap-1">
                    <button
                      type="button"
                      onClick={undoLast}
                      disabled={items.length === 0}
                      className="px-2.5 py-1.5 rounded-lg bg-stone-100 hover:bg-stone-200 text-stone-700 font-bold text-xs disabled:opacity-40 flex items-center gap-1 transition-colors"
                      title="تراجع عن آخر عنصر"
                    >
                      <RotateCcw className="w-3.5 h-3.5" />
                      <span>تراجع</span>
                    </button>

                    <button
                      type="button"
                      onClick={clearAll}
                      disabled={items.length === 0}
                      className="px-2.5 py-1.5 rounded-lg bg-rose-50 border border-rose-200 hover:bg-rose-100 text-rose-700 font-bold text-xs disabled:opacity-40 flex items-center gap-1 transition-colors"
                      title="حذف جميع العناصر"
                    >
                      <Trash2 className="w-3.5 h-3.5" />
                      <span>تفريغ</span>
                    </button>
                  </div>
                </div>
              ) : (
                /* For Draw Exercise: Number and Target adjustment */
                <div className="p-2.5 bg-white rounded-xl border border-stone-200 flex items-center justify-between gap-3">
                  <div className="flex items-center gap-2">
                    <label className="text-xs font-bold text-stone-700">
                      العدد المطلوب رسمه في البطاقة:
                    </label>
                    <input
                      type="number"
                      min={1}
                      max={30}
                      value={targetCount}
                      onChange={(e) => setTargetCount(Math.max(1, parseInt(e.target.value) || 1))}
                      className="w-16 px-2 py-1 text-base font-bold text-center rounded-lg border-2 border-amber-300 bg-white"
                    />
                  </div>
                  <span className="text-xs text-stone-500 font-semibold">
                    اختر الرمز المطلوب من القائمة بالأسفل
                  </span>
                </div>
              )}

              {/* Row 2: Grid of sizing controls: Size, Width, Quantity */}
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-2 text-xs">
                {/* 1. Item Size */}
                <div className="p-2 bg-white rounded-xl border border-stone-200 flex flex-col justify-between gap-1">
                  <div className="flex justify-between items-center text-stone-600 font-bold text-[11px]">
                    <span>حجم الرموز:</span>
                    <span className="text-emerald-700 font-mono font-black">{size}px</span>
                  </div>
                  <div className="flex items-center gap-1">
                    <button
                      type="button"
                      onClick={() => setSize((s) => Math.max(16, s - 3))}
                      className="flex-1 py-1 px-1 bg-stone-50 hover:bg-stone-100 border border-stone-300 rounded font-bold flex items-center justify-center gap-0.5 text-stone-700"
                      title="تصغير العناصر (-3px)"
                    >
                      <ZoomOut className="w-3 h-3 text-stone-500" />
                      تصغير
                    </button>
                    <button
                      type="button"
                      onClick={() => setSize((s) => Math.min(60, s + 3))}
                      className="flex-1 py-1 px-1 bg-stone-50 hover:bg-stone-100 border border-stone-300 rounded font-bold flex items-center justify-center gap-0.5 text-stone-700"
                      title="تكبير العناصر (+3px)"
                    >
                      <ZoomIn className="w-3 h-3 text-emerald-600" />
                      تكبير
                    </button>
                  </div>
                </div>

                {/* 2. Card Width */}
                <div className="p-2 bg-white rounded-xl border border-stone-200 flex flex-col justify-between gap-1">
                  <div className="flex justify-between items-center text-stone-600 font-bold text-[11px]">
                    <span>عرض البطاقة:</span>
                    <span className="text-blue-700 font-mono font-black">{colWidth}px</span>
                  </div>
                  <div className="flex items-center gap-1">
                    <button
                      type="button"
                      onClick={() => setColWidth((w) => Math.max(110, w - 15))}
                      className="flex-1 py-1 px-1 bg-stone-50 hover:bg-stone-100 border border-stone-300 rounded font-bold flex items-center justify-center gap-0.5 text-stone-700"
                      title="تضييق عرض البطاقة (-15px)"
                    >
                      <Minimize2 className="w-3 h-3 text-stone-500" />
                      تضييق
                    </button>
                    <button
                      type="button"
                      onClick={() => setColWidth((w) => Math.min(300, w + 15))}
                      className="flex-1 py-1 px-1 bg-stone-50 hover:bg-stone-100 border border-stone-300 rounded font-bold flex items-center justify-center gap-0.5 text-stone-700"
                      title="توسيع عرض البطاقة (+15px)"
                    >
                      <Maximize2 className="w-3 h-3 text-blue-600" />
                      توسيع
                    </button>
                  </div>
                </div>

                {/* 3. Quantity per Click */}
                {exerciseType !== 'draw' ? (
                  <div className="p-2 bg-white rounded-xl border border-stone-200 flex flex-col justify-between gap-1">
                    <div className="flex justify-between items-center text-stone-600 font-bold text-[11px]">
                      <span>النسخ عند النقر:</span>
                      <span className="text-amber-700 font-mono font-black">{qty}×</span>
                    </div>
                    <div className="flex items-center gap-1">
                      {[1, 2, 3, 5].map((q) => (
                        <button
                          key={q}
                          type="button"
                          onClick={() => setQty(q)}
                          className={`flex-1 py-1 rounded font-bold text-center text-xs transition-colors ${
                            qty === q
                              ? 'bg-emerald-600 text-white shadow-2xs'
                              : 'bg-stone-50 border border-stone-300 text-stone-700 hover:bg-stone-100'
                          }`}
                        >
                          {q}
                        </button>
                      ))}
                    </div>
                  </div>
                ) : (
                  <div className="p-2 bg-white rounded-xl border border-stone-200 flex items-center justify-center text-center text-stone-500 text-[11px] font-semibold">
                    بطاقة تمرين رسم الهدف
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>

        {/* BOTTOM SECTION: Categories Tabs and Selection Grid (Scrollable) */}
        <div className="flex-1 overflow-y-auto p-4 sm:p-5 space-y-3">
          {exerciseType === 'draw' ? (
            /* Symbols for Draw */
            <div className="space-y-2">
              <label className="block text-xs font-bold text-stone-700">
                اختر الشكل أو الرمز المراد تكليفه للتلميذ برسمه:
              </label>
              <div className="grid grid-cols-6 sm:grid-cols-8 gap-2 p-2 bg-stone-50 rounded-xl border border-stone-200 max-h-60 overflow-y-auto">
                {[...SHAPES_LIST, '🍎', '⭐', '🎈', '🌸', '🚗', '🐱', '🐟', '⚽', '🍦', '🌙'].map((sym, idx) => (
                  <button
                    key={idx}
                    type="button"
                    onClick={() => setTargetEmoji(sym)}
                    className={`h-11 flex items-center justify-center text-2xl rounded-xl transition-all ${
                      targetEmoji === sym
                        ? 'bg-emerald-500 text-white shadow-md scale-105 font-bold ring-2 ring-emerald-300'
                        : 'bg-white border border-stone-200 hover:bg-stone-100'
                    }`}
                  >
                    {sym}
                  </button>
                ))}
              </div>
            </div>
          ) : (
            /* Tabs for Count or Match */
            <div className="space-y-3">
              {/* Category Switcher Tabs */}
              <div className="flex border-b border-stone-200 gap-1 bg-stone-100/70 p-1 rounded-xl">
                {/* 1. Drawings Tab (always available) */}
                <button
                  type="button"
                  onClick={() => setActiveTab('drawings')}
                  className={`flex-1 py-1.5 px-3 rounded-lg text-xs sm:text-sm font-bold flex items-center justify-center gap-1.5 transition-all ${
                    activeTab === 'drawings'
                      ? 'bg-white text-emerald-800 shadow-xs'
                      : 'text-stone-600 hover:text-stone-900'
                  }`}
                >
                  <Sparkles className="w-4 h-4 text-emerald-600" />
                  <span>رسوم</span>
                </button>

                {/* 2. Shapes Tab (always available) */}
                <button
                  type="button"
                  onClick={() => setActiveTab('shapes')}
                  className={`flex-1 py-1.5 px-3 rounded-lg text-xs sm:text-sm font-bold flex items-center justify-center gap-1.5 transition-all ${
                    activeTab === 'shapes'
                      ? 'bg-white text-emerald-800 shadow-xs'
                      : 'text-stone-600 hover:text-stone-900'
                  }`}
                >
                  <Shapes className="w-4 h-4 text-blue-600" />
                  <span>أشكال</span>
                </button>

                {/* 3. Numbers Tab (DISABLED/HIDDEN in Match exercise) */}
                {!isMatchExercise && (
                  <button
                    type="button"
                    onClick={() => setActiveTab('numbers')}
                    className={`flex-1 py-1.5 px-3 rounded-lg text-xs sm:text-sm font-bold flex items-center justify-center gap-1.5 transition-all ${
                      activeTab === 'numbers'
                        ? 'bg-white text-emerald-800 shadow-xs'
                        : 'text-stone-600 hover:text-stone-900'
                    }`}
                  >
                    <Hash className="w-4 h-4 text-amber-600" />
                    <span>أعداد</span>
                  </button>
                )}

                {/* 4. Hands Tab (DISABLED/HIDDEN in Match exercise) */}
                {!isMatchExercise && (
                  <button
                    type="button"
                    onClick={() => setActiveTab('hands')}
                    className={`flex-1 py-1.5 px-3 rounded-lg text-xs sm:text-sm font-bold flex items-center justify-center gap-1.5 transition-all ${
                      activeTab === 'hands'
                        ? 'bg-purple-600 text-white shadow-xs'
                        : 'text-stone-600 hover:text-stone-900'
                    }`}
                  >
                    <Hand className="w-4 h-4" />
                    <span>أصابع (1-10)</span>
                  </button>
                )}
              </div>

              {/* Informational note for Match exercise */}
              {isMatchExercise && (
                <div className="text-[11px] text-amber-800 bg-amber-50 border border-amber-200/80 px-2.5 py-1 rounded-lg">
                  💡 <strong>ملاحظة لتمرين الربط:</strong> يُسمح بإدراج الرسوم والأشكال فقط لتكوين مجموعات قابلة للعدّ، وتُمنع الأصابع والبطاقات الرقمية.
                </div>
              )}

              {/* Tab 1: Drawings */}
              {activeTab === 'drawings' && (
                <div className="space-y-2.5 max-h-60 overflow-y-auto pr-1">
                  {EMOJI_GROUPS.map((grp, gIdx) => (
                    <div key={gIdx} className="space-y-1">
                      <span className="text-[11px] font-bold text-stone-500 px-1">{grp.name}:</span>
                      <div className="grid grid-cols-8 sm:grid-cols-10 gap-1.5">
                        {grp.items.map((emoji, eIdx) => (
                          <button
                            key={eIdx}
                            type="button"
                            onClick={() => addItem(emoji)}
                            className="h-10 text-xl flex items-center justify-center rounded-lg border border-stone-200 bg-white hover:bg-emerald-50 hover:border-emerald-300 hover:scale-110 active:scale-95 transition-all"
                            title={`إدراج ${emoji} (x${qty})`}
                          >
                            {emoji}
                          </button>
                        ))}
                      </div>
                    </div>
                  ))}
                </div>
              )}

              {/* Tab 2: Shapes */}
              {activeTab === 'shapes' && (
                <div className="space-y-1.5">
                  <span className="text-xs font-bold text-stone-500 px-1">
                    أشكال هندسية واضحة للعدّ والتلوين:
                  </span>
                  <div className="grid grid-cols-6 sm:grid-cols-8 gap-1.5 max-h-60 overflow-y-auto p-1">
                    {SHAPES_LIST.map((shape, sIdx) => (
                      <button
                        key={sIdx}
                        type="button"
                        onClick={() => addItem(shape)}
                        className="h-10 text-2xl flex items-center justify-center rounded-xl border border-stone-200 bg-white hover:bg-blue-50 hover:border-blue-400 hover:scale-105 active:scale-95 transition-all font-mono"
                        title={`إدراج الشكل ${shape} (x${qty})`}
                      >
                        {shape}
                      </button>
                    ))}
                  </div>
                </div>
              )}

              {/* Tab 3: Numbers (Only for count) */}
              {!isMatchExercise && activeTab === 'numbers' && (
                <div className="space-y-1.5">
                  <span className="text-xs font-bold text-stone-500 px-1">
                    بطاقات أرقام وأعداد جاهزة:
                  </span>
                  <div className="grid grid-cols-4 sm:grid-cols-6 gap-2 max-h-60 overflow-y-auto p-1">
                    {NUMBERS_LIST.map((num, nIdx) => (
                      <button
                        key={nIdx}
                        type="button"
                        onClick={() => addItem(num)}
                        className="h-10 font-bold text-lg flex items-center justify-center rounded-xl border-2 border-amber-300 bg-amber-50 text-amber-900 hover:bg-amber-100 hover:border-amber-400 hover:scale-105 active:scale-95 transition-all"
                        title={`إدراج العدد ${num} (x${qty})`}
                      >
                        {num}
                      </button>
                    ))}
                  </div>
                </div>
              )}

              {/* Tab 4: Hands (1-10) (Only for count) */}
              {!isMatchExercise && activeTab === 'hands' && (
                <div className="space-y-2">
                  <div className="flex items-center justify-between px-1">
                    <span className="text-xs font-bold text-purple-950">
                      انقر على أي يد لتعيينها كرمز لتمثيل العدد في البطاقة:
                    </span>
                    <span className="text-[11px] text-purple-700 font-bold bg-purple-50 px-2 py-0.5 rounded-md border border-purple-200">
                      تمثيل بصري تفاعلي (1 إلى 10)
                    </span>
                  </div>
                  <div className="grid grid-cols-2 sm:grid-cols-5 gap-2 max-h-60 overflow-y-auto p-1">
                    {HANDS_LIST.map((count) => {
                      const isCurrentHand = items.length === 1 && items[0] === `hand:${count}`;
                      return (
                        <button
                          key={count}
                          type="button"
                          onClick={() => setHandCount(count)}
                          className={`p-2 flex flex-col items-center justify-center gap-1.5 rounded-xl border-2 transition-all cursor-pointer ${
                            isCurrentHand
                              ? 'border-purple-600 bg-purple-100 ring-2 ring-purple-300 shadow-xs scale-102 font-bold'
                              : 'border-purple-200 bg-purple-50/70 hover:bg-purple-100 hover:border-purple-400 hover:scale-105 active:scale-95'
                          }`}
                          title={`إدراج يد تمثل ${count} أصابع`}
                        >
                          <HandVisual count={count} size={30} />
                          <div className="flex items-center gap-1">
                            <span className="text-xs font-black text-purple-900 px-2 py-0.5 bg-white/90 rounded-md border border-purple-200">
                              {count} {count === 1 ? 'إصبع' : count === 2 ? 'إصبعان' : 'أصابع'}
                            </span>
                            {isCurrentHand && (
                              <span className="text-emerald-700 text-xs font-black">✓</span>
                            )}
                          </div>
                        </button>
                      );
                    })}
                  </div>
                </div>
              )}
            </div>
          )}
        </div>

        {/* Modal Footer actions */}
        <div className="flex items-center justify-between px-5 py-2.5 border-t border-stone-200 bg-stone-50 shrink-0">
          <button
            type="button"
            onClick={() => onDeleteCard(card.id)}
            className="px-3.5 py-1.5 text-xs font-bold text-rose-700 bg-rose-50 border border-rose-200 rounded-xl hover:bg-rose-100 transition-colors flex items-center gap-1.5"
          >
            <Trash2 className="w-4 h-4" />
            حذف البطاقة
          </button>

          <div className="flex items-center gap-2">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-1.5 text-xs font-bold text-stone-600 bg-white border border-stone-300 rounded-xl hover:bg-stone-100 transition-colors"
            >
              إلغاء
            </button>
            <button
              type="button"
              onClick={handleSave}
              className="px-5 py-1.5 text-xs font-bold text-white bg-emerald-600 rounded-xl hover:bg-emerald-700 transition-colors flex items-center gap-1.5 shadow-sm"
            >
              <Check className="w-4 h-4" />
              تطبيق التغييرات
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
