import React, { useState } from 'react';
import { StripConfig, StripTheme } from '../types';
import { StripRenderer } from './StripRenderer';
import {
  X,
  Check,
  Shuffle,
  Sparkles,
  Maximize2,
  Sliders,
  ArrowRightLeft
} from 'lucide-react';

interface StripSettingsModalProps {
  config: StripConfig;
  exerciseTitle?: string;
  onSave: (newConfig: StripConfig) => void;
  onClose: () => void;
}

export const StripSettingsModal: React.FC<StripSettingsModalProps> = ({
  config,
  exerciseTitle,
  onSave,
  onClose
}) => {
  const [startNum, setStartNum] = useState<number>(config.startNum);
  const [endNum, setEndNum] = useState<number>(config.endNum);
  const [emptyCount, setEmptyCount] = useState<number>(config.emptyCount);
  const [hiddenIndices, setHiddenIndices] = useState<number[]>(config.hiddenIndices);
  const [theme, setTheme] = useState<StripTheme>(config.theme || 'train');
  const [boxSize, setBoxSize] = useState<number>(config.boxSize || 48);
  const [direction, setDirection] = useState<'ltr' | 'rtl'>(config.direction || 'ltr');

  // Compute total numbers count in range
  const totalCount = Math.max(1, endNum - startNum + 1);

  // Helper to re-generate random empty indices
  const handleRandomizeEmpty = (countToHide: number, total: number) => {
    const validCount = Math.min(Math.max(1, countToHide), Math.max(1, total - 1));
    const allIndices = Array.from({ length: total }, (_, i) => i);
    const shuffled = [...allIndices].sort(() => Math.random() - 0.5);
    const selected = shuffled.slice(0, validCount).sort((a, b) => a - b);
    setHiddenIndices(selected);
  };

  const handleStartChange = (val: number) => {
    const newStart = Math.max(0, val);
    const newEnd = Math.max(newStart + 1, endNum);
    setStartNum(newStart);
    setEndNum(newEnd);
    const newTotal = newEnd - newStart + 1;
    handleRandomizeEmpty(emptyCount, newTotal);
  };

  const handleEndChange = (val: number) => {
    const newEnd = Math.max(startNum + 1, val);
    setEndNum(newEnd);
    const newTotal = newEnd - startNum + 1;
    handleRandomizeEmpty(emptyCount, newTotal);
  };

  const handleEmptyCountChange = (val: number) => {
    const safeCount = Math.min(Math.max(1, val), Math.max(1, totalCount - 1));
    setEmptyCount(safeCount);
    handleRandomizeEmpty(safeCount, totalCount);
  };

  // Toggle cell on preview
  const handleToggleCell = (idx: number) => {
    if (hiddenIndices.includes(idx)) {
      setHiddenIndices(hiddenIndices.filter((i) => i !== idx));
    } else {
      setHiddenIndices([...hiddenIndices, idx].sort((a, b) => a - b));
    }
  };

  const handleConfirm = () => {
    onSave({
      startNum,
      endNum,
      emptyCount: hiddenIndices.length,
      hiddenIndices,
      theme,
      boxSize,
      direction
    });
    onClose();
  };

  const THEMES: { id: StripTheme; name: string; icon: string; desc: string }[] = [
    { id: 'train', name: 'قطار الأعداد', icon: '🚂', desc: 'قاطرة وعربات مع عجلات وروابط' },
    { id: 'caterpillar', name: 'دودة الأعداد', icon: '🐛', desc: 'رأس دودة مبتسمة مع حلقات ملونة' },
    { id: 'blocks', name: 'مربعات كلاسيكية', icon: '🔲', desc: 'مربعات رياضية أنيقة بهوامش واضحة' },
    { id: 'bubbles', name: 'فقاعات ملونة', icon: '🫧', desc: 'فقاعات دائرية جذابة' },
    { id: 'cards', name: 'بطاقات الحبل', icon: '🏷️', desc: 'بطاقات معلقة بملاقط على حبل' },
    { id: 'flags', name: 'أعلام الزينة', icon: '🚩', desc: 'أعلام متتالية احتفالية' }
  ];

  const currentPreviewConfig: StripConfig = {
    startNum,
    endNum,
    emptyCount: hiddenIndices.length,
    hiddenIndices,
    theme,
    boxSize,
    direction
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 bg-stone-900/60 backdrop-blur-xs animate-in fade-in">
      <div
        className="w-full max-w-2xl flex flex-col bg-white rounded-2xl shadow-2xl border border-stone-200 overflow-hidden text-stone-800"
        dir="rtl"
      >
        {/* Header */}
        <div className="flex items-center justify-between px-5 py-3.5 border-b border-stone-200 bg-stone-50/80">
          <div className="flex items-center gap-2">
            <span className="p-1.5 rounded-lg bg-purple-100 text-purple-800">
              <Sliders className="w-5 h-5" />
            </span>
            <div>
              <h3 className="font-bold text-lg text-stone-900 leading-tight">
                إعدادات وتنسيق الشريط العددي
              </h3>
              <p className="text-xs text-stone-500">
                {exerciseTitle || 'تعديل مجال الأعداد والخانات الفارغة وشكل الشريط وحجمه'}
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

        {/* Content body */}
        <div className="p-5 space-y-4 max-h-[82vh] overflow-y-auto">
          {/* Live Preview Area */}
          <div className="p-3.5 bg-stone-50 border-2 border-dashed border-stone-200 rounded-xl flex flex-col items-center justify-center">
            <div className="w-full flex items-center justify-between mb-1 text-xs font-bold text-stone-600">
              <span>معاينة حية للشريط العددي:</span>
              <span className="text-emerald-700 font-medium">
                (يمكنك النقر على أي خانة بالمعاينة لتفريغها أو ملئها)
              </span>
            </div>

            <div className="w-full overflow-x-auto py-2 flex justify-center">
              <StripRenderer
                stripConfig={currentPreviewConfig}
                interactive={true}
                onToggleCell={handleToggleCell}
              />
            </div>
          </div>

          {/* Section 1: Number Range (المجال) */}
          <div className="p-3.5 bg-purple-50/40 border border-purple-200 rounded-xl space-y-2.5">
            <h4 className="font-bold text-xs text-purple-950 flex items-center gap-1.5">
              <span>١ · تحديد مجال الأعداد (من البداية إلى النهاية):</span>
            </h4>

            <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
              <div>
                <label className="block text-xs font-bold text-stone-700 mb-1">
                  بداية الشريط (من):
                </label>
                <input
                  type="number"
                  min="0"
                  max="99"
                  value={startNum}
                  onChange={(e) => handleStartChange(parseInt(e.target.value, 10) || 0)}
                  className="w-full px-3 py-1.5 bg-white border border-stone-300 rounded-lg text-sm font-bold text-center"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-stone-700 mb-1">
                  نهاية الشريط (إلى):
                </label>
                <input
                  type="number"
                  min={startNum + 1}
                  max="100"
                  value={endNum}
                  onChange={(e) => handleEndChange(parseInt(e.target.value, 10) || startNum + 1)}
                  className="w-full px-3 py-1.5 bg-white border border-stone-300 rounded-lg text-sm font-bold text-center"
                />
              </div>

              <div className="col-span-2 sm:col-span-1">
                <label className="block text-xs font-bold text-stone-700 mb-1">
                  إجمالي الأعداد:
                </label>
                <div className="py-1.5 bg-white border border-stone-200 rounded-lg text-sm font-black text-center text-purple-900">
                  {totalCount} أعداد
                </div>
              </div>
            </div>

            {/* Quick Presets */}
            <div className="flex flex-wrap items-center gap-1.5 pt-1 text-xs">
              <span className="text-stone-500 font-bold">مجالات شائعة:</span>
              {[
                { s: 1, e: 10, label: '1 ← 10' },
                { s: 0, e: 10, label: '0 ← 10' },
                { s: 1, e: 15, label: '1 ← 15' },
                { s: 10, e: 20, label: '10 ← 20' }
              ].map((p, idx) => (
                <button
                  key={idx}
                  type="button"
                  onClick={() => {
                    setStartNum(p.s);
                    setEndNum(p.e);
                    handleRandomizeEmpty(emptyCount, p.e - p.s + 1);
                  }}
                  className="px-2 py-0.5 rounded-md bg-white border border-purple-200 hover:bg-purple-100 text-purple-900 font-bold"
                >
                  {p.label}
                </button>
              ))}
            </div>
          </div>

          {/* Section 2: Empty Cells Count & Shuffle */}
          <div className="p-3.5 bg-amber-50/50 border border-amber-200 rounded-xl space-y-2.5">
            <div className="flex items-center justify-between">
              <h4 className="font-bold text-xs text-amber-950 flex items-center gap-1.5">
                <span>٢ · عدد الخانات الفارغة المطلوب ملؤها:</span>
              </h4>
              <button
                type="button"
                onClick={() => handleRandomizeEmpty(emptyCount, totalCount)}
                className="px-2.5 py-1 bg-amber-600 text-white hover:bg-amber-700 rounded-lg text-xs font-bold flex items-center gap-1 shadow-2xs transition-colors"
                title="إعادة توزيع الخانات الفارغة في مواضع عشوائية"
              >
                <Shuffle className="w-3.5 h-3.5" />
                توزيع عشوائي جديد
              </button>
            </div>

            <div className="flex items-center gap-3">
              <input
                type="range"
                min="1"
                max={Math.max(1, totalCount - 1)}
                value={emptyCount}
                onChange={(e) => handleEmptyCountChange(parseInt(e.target.value, 10))}
                className="flex-1 accent-amber-600"
              />
              <span className="px-3 py-1 bg-white border border-amber-300 rounded-lg text-sm font-black text-amber-900 min-w-[70px] text-center">
                {hiddenIndices.length} فارغة
              </span>
            </div>

            <p className="text-[11px] text-stone-500">
              * يمكنك أيضاً في أي وقت النقر مباشرة على أي خانة في ورقة العمل لتفريغها أو إظهار عددها يدوياً.
            </p>
          </div>

          {/* Section 3: Themes (التنسيقات الجميلة) */}
          <div className="space-y-2">
            <label className="block text-xs font-bold text-stone-700">
              ٣ · اختر تصميم وتنسيق الشريط العددي:
            </label>
            <div className="grid grid-cols-2 sm:grid-cols-3 gap-2">
              {THEMES.map((th) => (
                <div
                  key={th.id}
                  onClick={() => setTheme(th.id)}
                  className={`p-2.5 rounded-xl border-2 cursor-pointer transition-all flex items-center gap-2.5 ${
                    theme === th.id
                      ? 'border-emerald-500 bg-emerald-50/70 shadow-xs ring-1 ring-emerald-400'
                      : 'border-stone-200 bg-white hover:border-stone-300 hover:bg-stone-50'
                  }`}
                >
                  <span className="text-2xl">{th.icon}</span>
                  <div className="min-w-0">
                    <h5 className="font-bold text-xs text-stone-900 truncate">{th.name}</h5>
                    <p className="text-[10px] text-stone-500 truncate">{th.desc}</p>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Section 4: Sizing & Direction */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 pt-1 border-t border-stone-200">
            {/* Box Size */}
            <div className="space-y-1.5">
              <div className="flex items-center justify-between text-xs font-bold text-stone-700">
                <span>حجم خانات الشريط:</span>
                <span className="text-emerald-700 font-black">{boxSize} بكسل</span>
              </div>
              <div className="flex items-center gap-2">
                <input
                  type="range"
                  min="36"
                  max="64"
                  step="2"
                  value={boxSize}
                  onChange={(e) => setBoxSize(parseInt(e.target.value, 10))}
                  className="flex-1 accent-emerald-600"
                />
              </div>
            </div>

            {/* Direction */}
            <div className="space-y-1.5">
              <label className="block text-xs font-bold text-stone-700">
                اتجاه الترتيب:
              </label>
              <div className="flex items-center gap-1.5">
                <button
                  type="button"
                  onClick={() => setDirection('ltr')}
                  className={`flex-1 py-1.5 rounded-lg text-xs font-bold flex items-center justify-center gap-1 transition-colors ${
                    direction === 'ltr'
                      ? 'bg-purple-600 text-white'
                      : 'bg-stone-100 text-stone-700 hover:bg-stone-200'
                  }`}
                >
                  <ArrowRightLeft className="w-3.5 h-3.5" />
                  من اليسار لليمين (افتراضي)
                </button>
                <button
                  type="button"
                  onClick={() => setDirection('rtl')}
                  className={`flex-1 py-1.5 rounded-lg text-xs font-bold flex items-center justify-center gap-1 transition-colors ${
                    direction === 'rtl'
                      ? 'bg-purple-600 text-white'
                      : 'bg-stone-100 text-stone-700 hover:bg-stone-200'
                  }`}
                >
                  <ArrowRightLeft className="w-3.5 h-3.5" />
                  من اليمين لليسار
                </button>
              </div>
            </div>
          </div>
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
            className="px-5 py-2 text-xs font-bold text-white bg-purple-600 rounded-xl hover:bg-purple-700 transition-colors flex items-center gap-1.5 shadow-sm"
          >
            <Check className="w-4 h-4" />
            حفظ التغييرات للشريط
          </button>
        </div>
      </div>
    </div>
  );
};
