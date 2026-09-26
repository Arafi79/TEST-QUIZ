import React, { useState } from 'react';
import { ExerciseType, DEFAULT_INSTRUCTIONS, StripTheme } from '../types';
import {
  X,
  PlusCircle,
  Calculator,
  PencilRuler,
  GitCompare,
  Sparkles,
  Layers,
  TrendingUp,
  Sliders
} from 'lucide-react';

interface InsertExerciseModalProps {
  onInsert: (exerciseConfig: {
    type: ExerciseType;
    instruction: string;
    cardCount: number;
    theme: 'mixed' | 'fruits' | 'shapes' | 'hands';
    stripConfig?: {
      startNum: number;
      endNum: number;
      emptyCount: number;
      theme: StripTheme;
    };
  }) => void;
  onClose: () => void;
}

export const InsertExerciseModal: React.FC<InsertExerciseModalProps> = ({
  onInsert,
  onClose
}) => {
  const [selectedType, setSelectedType] = useState<ExerciseType>('count');
  const [instruction, setInstruction] = useState<string>(DEFAULT_INSTRUCTIONS.count);
  const [cardCount, setCardCount] = useState<number>(3);
  const [theme, setTheme] = useState<'mixed' | 'fruits' | 'shapes' | 'hands'>('mixed');

  // Strip-specific configuration
  const [startNum, setStartNum] = useState<number>(1);
  const [endNum, setEndNum] = useState<number>(10);
  const [emptyCount, setEmptyCount] = useState<number>(3);
  const [stripTheme, setStripTheme] = useState<StripTheme>('train');

  const handleTypeChange = (type: ExerciseType) => {
    setSelectedType(type);
    setInstruction(DEFAULT_INSTRUCTIONS[type]);
    if (type === 'match') {
      setCardCount(3);
      if (theme === 'hands') {
        setTheme('fruits');
      }
    }
  };

  const handleConfirm = () => {
    onInsert({
      type: selectedType,
      instruction: instruction.trim() || DEFAULT_INSTRUCTIONS[selectedType],
      cardCount,
      theme,
      stripConfig:
        selectedType === 'strip'
          ? {
              startNum,
              endNum,
              emptyCount,
              theme: stripTheme
            }
          : undefined
    });
    onClose();
  };

  const EXERCISE_OPTIONS: {
    type: ExerciseType;
    title: string;
    description: string;
    badgeColor: string;
    icon: React.ReactNode;
  }[] = [
    {
      type: 'count',
      title: '١ · عدّ المجموعات واكتب العدد',
      description: 'بطاقات تحتوي على رموز أو أصابع أو أشكال، وتحتها خانة لكتابة العدد المناسب.',
      badgeColor: 'border-emerald-300 bg-emerald-50/60 text-emerald-900',
      icon: <Calculator className="w-6 h-6 text-emerald-600" />
    },
    {
      type: 'draw',
      title: '٢ · ارسم الأشكال حسب العدد',
      description: 'خانة رسم فارغة مع شكل مستهدف وبطاقة عددية ملونة توضح المطلوب رسمه.',
      badgeColor: 'border-blue-300 bg-blue-50/60 text-blue-900',
      icon: <PencilRuler className="w-6 h-6 text-blue-600" />
    },
    {
      type: 'match',
      title: '٣ · طابق كل مجموعة بالعدد المناسب',
      description: 'مجموعات من العناصر في صف، وبطاقات أعداد للمطابقة والربط والتوصيل.',
      badgeColor: 'border-amber-300 bg-amber-50/60 text-amber-900',
      icon: <GitCompare className="w-6 h-6 text-amber-600" />
    },
    {
      type: 'strip',
      title: '٤ · الشريط العددي (إكمال الخانات الناقصة)',
      description: 'شريط عددي مرتب تصاعدياً من اليسار لليمين، مع خانات فارغة عشوائية وتنسيقات جذابة.',
      badgeColor: 'border-purple-300 bg-purple-50/60 text-purple-900',
      icon: <TrendingUp className="w-6 h-6 text-purple-600" />
    }
  ];

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 bg-stone-900/60 backdrop-blur-xs animate-in fade-in">
      <div
        className="w-full max-w-xl flex flex-col bg-white rounded-2xl shadow-2xl border border-stone-200 overflow-hidden text-stone-800"
        dir="rtl"
      >
        {/* Header */}
        <div className="flex items-center justify-between px-5 py-3.5 border-b border-stone-200 bg-stone-50/80">
          <div className="flex items-center gap-2">
            <span className="p-1.5 rounded-lg bg-emerald-100 text-emerald-800">
              <PlusCircle className="w-5 h-5" />
            </span>
            <div>
              <h3 className="font-bold text-lg text-stone-900 leading-tight">
                إدراج تمرين جديد في صفحة العمل
              </h3>
              <p className="text-xs text-stone-500">
                اختر نوع التمرين المراد إضافته مع تحديد التعليمة وعدد البطاقات
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 rounded-lg text-stone-400 hover:text-stone-700 hover:bg-stone-200/60 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Content */}
        <div className="p-5 space-y-4 max-h-[80vh] overflow-y-auto">
          {/* Exercise Types List */}
          <div className="space-y-2.5">
            <label className="block text-xs font-bold text-stone-600">
              اختر نوع التمرين:
            </label>
            <div className="space-y-2">
              {EXERCISE_OPTIONS.map((opt) => (
                <div
                  key={opt.type}
                  onClick={() => handleTypeChange(opt.type)}
                  className={`p-3.5 rounded-xl border-2 cursor-pointer transition-all flex items-start gap-3 ${
                    selectedType === opt.type
                      ? 'border-emerald-500 bg-emerald-50/50 shadow-xs ring-1 ring-emerald-400'
                      : 'border-stone-200 bg-white hover:border-stone-300 hover:bg-stone-50/80'
                  }`}
                >
                  <div className="p-2 rounded-xl bg-white shadow-xs border border-stone-200">
                    {opt.icon}
                  </div>
                  <div className="flex-1">
                    <div className="flex items-center justify-between">
                      <h4 className="font-bold text-sm text-stone-900">{opt.title}</h4>
                      {selectedType === opt.type && (
                        <span className="text-[11px] font-bold text-emerald-700 bg-emerald-100 px-2 py-0.5 rounded-full">
                          تم الاختيار
                        </span>
                      )}
                    </div>
                    <p className="text-xs text-stone-600 mt-1 leading-relaxed">
                      {opt.description}
                    </p>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Exercise Instruction Line */}
          <div className="space-y-1.5 pt-2 border-t border-stone-200">
            <div className="flex items-center justify-between">
              <label className="text-xs font-bold text-stone-700">
                سطر التعليمة الموجهة للتلميذ:
              </label>
              <button
                type="button"
                onClick={() => setInstruction(DEFAULT_INSTRUCTIONS[selectedType])}
                className="text-[11px] text-emerald-700 hover:underline font-bold"
              >
                استعادة الافتراضية
              </button>
            </div>
            <input
              type="text"
              value={instruction}
              onChange={(e) => setInstruction(e.target.value)}
              className="w-full px-3 py-2 text-sm font-semibold rounded-xl border border-stone-300 focus:outline-hidden focus:border-emerald-500 bg-stone-50/50"
              placeholder="اكتب التعليمة الخاصة بالتمرين..."
            />
          </div>

          {/* Number of Initial Cards or Strip Options */}
          {selectedType === 'strip' ? (
            <div className="p-3 bg-purple-50/60 border border-purple-200 rounded-xl space-y-3 pt-2">
              <div className="flex items-center justify-between text-xs font-bold text-purple-950">
                <span>إعدادات الشريط العددي:</span>
                <span className="text-[11px] text-purple-700">شريط مرتب من اليسار لليمين</span>
              </div>

              <div className="grid grid-cols-2 sm:grid-cols-3 gap-2.5">
                <div>
                  <label className="block text-xs font-bold text-stone-700 mb-1">بداية المجال (من):</label>
                  <input
                    type="number"
                    min="0"
                    max="99"
                    value={startNum}
                    onChange={(e) => setStartNum(Math.max(0, parseInt(e.target.value, 10) || 0))}
                    className="w-full px-2.5 py-1.5 bg-white border border-stone-300 rounded-lg text-xs font-bold text-center"
                  />
                </div>
                <div>
                  <label className="block text-xs font-bold text-stone-700 mb-1">نهاية المجال (إلى):</label>
                  <input
                    type="number"
                    min={startNum + 1}
                    max="100"
                    value={endNum}
                    onChange={(e) => setEndNum(Math.max(startNum + 1, parseInt(e.target.value, 10) || startNum + 1))}
                    className="w-full px-2.5 py-1.5 bg-white border border-stone-300 rounded-lg text-xs font-bold text-center"
                  />
                </div>
                <div className="col-span-2 sm:col-span-1">
                  <label className="block text-xs font-bold text-stone-700 mb-1">الخانات الفارغة:</label>
                  <input
                    type="number"
                    min="1"
                    max={Math.max(1, endNum - startNum)}
                    value={emptyCount}
                    onChange={(e) => setEmptyCount(Math.min(Math.max(1, parseInt(e.target.value, 10) || 1), Math.max(1, endNum - startNum)))}
                    className="w-full px-2.5 py-1.5 bg-white border border-stone-300 rounded-lg text-xs font-bold text-center"
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-bold text-stone-700 mb-1">تنسيق وتصميم الشريط:</label>
                <select
                  value={stripTheme}
                  onChange={(e) => setStripTheme(e.target.value as StripTheme)}
                  className="w-full px-3 py-1.5 text-xs font-bold rounded-lg border border-purple-300 bg-white"
                >
                  <option value="train">قطار الأعداد 🚂 (قاطرة وعربات مع عجلات)</option>
                  <option value="caterpillar">دودة الأعداد 🐛 (رأس دودة مبتسم وحلقات)</option>
                  <option value="blocks">مربعات كلاسيكية 🔲 (مربعات واضحة للكتابة)</option>
                  <option value="bubbles">فقاعات ملونة 🫧 (دوائر باستيل جذابة)</option>
                  <option value="cards">بطاقات الحبل 🏷️ (معلقة بملاقط)</option>
                  <option value="flags">أعلام الزينة 🚩 (متتالية احتفالية)</option>
                </select>
              </div>
            </div>
          ) : (
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 pt-2">
              <div className="space-y-1.5">
                <label className="text-xs font-bold text-stone-700">
                  عدد البطاقات الأولية:
                </label>
                <div className="flex items-center gap-1.5">
                  {[2, 3, 4, 6].map((num) => (
                    <button
                      key={num}
                      type="button"
                      onClick={() => setCardCount(num)}
                      className={`flex-1 py-1.5 font-bold rounded-lg text-xs transition-colors ${
                        cardCount === num
                          ? 'bg-emerald-600 text-white shadow-xs'
                          : 'bg-white border border-stone-300 text-stone-700 hover:bg-stone-100'
                      }`}
                    >
                      {num} بطاقات
                    </button>
                  ))}
                </div>
              </div>

              {/* Starting Theme */}
              <div className="space-y-1.5">
                <label className="text-xs font-bold text-stone-700">
                  نمط العناصر المقترح:
                </label>
                <select
                  value={theme}
                  onChange={(e) => setTheme(e.target.value as any)}
                  className="w-full px-3 py-1.5 text-xs font-semibold rounded-lg border border-stone-300 bg-white focus:outline-hidden focus:border-emerald-500"
                >
                  <option value="mixed">منوّع (فواكه وأشكال)</option>
                  <option value="fruits">فواكه وأطعمة ممتعة 🍎</option>
                  <option value="shapes">أشكال هندسية واضحة ◯ △ □</option>
                  {selectedType !== 'match' && (
                    <option value="hands">أصابع اليدين (1 إلى 10) 🖐️</option>
                  )}
                </select>
              </div>
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="flex items-center justify-end gap-2.5 px-5 py-3 border-t border-stone-200 bg-stone-50">
          <button
            type="button"
            onClick={onClose}
            className="px-4 py-2 text-xs font-bold text-stone-600 bg-white border border-stone-300 rounded-xl hover:bg-stone-100 transition-colors"
          >
            إلغاء
          </button>
          <button
            type="button"
            onClick={handleConfirm}
            className="px-5 py-2 text-xs font-bold text-white bg-emerald-600 rounded-xl hover:bg-emerald-700 transition-colors flex items-center gap-1.5 shadow-sm"
          >
            <Layers className="w-4 h-4" />
            إدراج التمرين في الصفحة
          </button>
        </div>
      </div>
    </div>
  );
};
