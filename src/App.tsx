/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, useRef } from 'react';
import {
  ExerciseData,
  CardData,
  PageHeaderData,
  ExerciseType,
  DEFAULT_INSTRUCTIONS
} from './types';
import { PageHeader } from './components/PageHeader';
import { ExerciseBlock } from './components/ExerciseBlock';
import { CardSettingsModal } from './components/CardSettingsModal';
import { InsertExerciseModal } from './components/InsertExerciseModal';
import { StripSettingsModal } from './components/StripSettingsModal';
import { LocalGuard } from './components/LocalGuard';
import { exportElementAsImage } from './utils/exportImage';
import {
  Plus,
  Printer,
  Download,
  RotateCcw,
  Sparkles,
  Info,
  CheckCircle2,
  AlertCircle,
  FileText
} from 'lucide-react';

const INITIAL_HEADER: PageHeaderData = {
  enabled: true,
  schoolName: 'المدرسة الابتدائية النموذجية',
  grade: 'المستوى: السنة الأولى / الثانية ابتدائي',
  title: 'ورقة عمل: مهارات العد والأعداد والحساب',
  subtitle: 'أنشطة تدريبية وتطبيقية لترسيخ مفهوم العدد والمقادير',
  studentName: 'اسم التلميذ(ة): ............................................',
  date: 'التاريخ: ...... / ...... / 2026',
  evaluation: 'الملاحظة والتقييم: ............................................'
};

const INITIAL_EXERCISES: ExerciseData[] = [
  {
    id: 101,
    type: 'count',
    title: 'تمرين العد وكتابة العدد',
    instruction: DEFAULT_INSTRUCTIONS.count,
    colWidth: 150,
    itemSize: 34,
    cards: [
      { id: 1, items: ['🍎', '🍎', '🍎', '🍎'], size: 34 },
      { id: 2, items: ['hand:3'], size: 38 },
      { id: 3, items: ['⭐', '⭐', '⭐', '⭐', '⭐', '⭐'], size: 32 },
      { id: 4, items: ['🚗', '🚗'], size: 34 }
    ]
  },
  {
    id: 102,
    type: 'draw',
    title: 'تمرين رسم الأشكال حسب العدد',
    instruction: DEFAULT_INSTRUCTIONS.draw,
    colWidth: 150,
    itemSize: 34,
    cards: [
      { id: 5, items: [], size: 34, targetEmoji: '○', targetCount: 5 },
      { id: 6, items: [], size: 34, targetEmoji: '△', targetCount: 3 },
      { id: 7, items: [], size: 34, targetEmoji: '□', targetCount: 7 },
      { id: 8, items: [], size: 34, targetEmoji: '🍎', targetCount: 4 }
    ]
  },
  {
    id: 103,
    type: 'match',
    title: 'تمرين مطابقة المجموعات بالأعداد',
    instruction: DEFAULT_INSTRUCTIONS.match,
    colWidth: 150,
    itemSize: 34,
    numOrder: [11, 9, 12, 10],
    cards: [
      { id: 9, items: ['🐱', '🐱'], size: 34 },
      { id: 10, items: ['🌸', '🌸', '🌸', '🌸'], size: 32 },
      { id: 11, items: ['🎈', '🎈', '🎈'], size: 34 },
      { id: 12, items: ['⭐', '⭐', '⭐', '⭐', '⭐'], size: 32 }
    ]
  },
  {
    id: 104,
    type: 'strip',
    title: 'تمرين الشريط العددي',
    instruction: DEFAULT_INSTRUCTIONS.strip,
    colWidth: 150,
    itemSize: 34,
    cards: [],
    stripConfig: {
      startNum: 1,
      endNum: 10,
      emptyCount: 3,
      hiddenIndices: [2, 5, 8],
      theme: 'train',
      boxSize: 48,
      direction: 'ltr'
    }
  }
];

export default function App() {
  const [headerData, setHeaderData] = useState<PageHeaderData>(INITIAL_HEADER);
  const [exercises, setExercises] = useState<ExerciseData[]>(INITIAL_EXERCISES);

  // Modals state
  const [showInsertModal, setShowInsertModal] = useState<boolean>(false);
  const [activeCardSetting, setActiveCardSetting] = useState<{
    card: CardData;
    exerciseId: number;
  } | null>(null);
  const [activeStripSetting, setActiveStripSetting] = useState<ExerciseData | null>(null);

  // Status / Toast
  const [toast, setToast] = useState<{ text: string; type: 'info' | 'success' | 'warn' } | null>(
    null
  );
  const [isExporting, setIsExporting] = useState<boolean>(false);

  const a4PageRef = useRef<HTMLDivElement>(null);

  const showToast = (text: string, type: 'info' | 'success' | 'warn' = 'info') => {
    setToast({ text, type });
    setTimeout(() => {
      setToast(null);
    }, 2800);
  };

  // Update a specific exercise
  const handleUpdateExercise = (updated: ExerciseData) => {
    setExercises((prev) => prev.map((ex) => (ex.id === updated.id ? updated : ex)));
  };

  // Open settings for a specific card
  const handleOpenCardSettings = (card: CardData, exerciseId: number) => {
    setActiveCardSetting({ card, exerciseId });
  };

  // Update card from settings modal
  const handleUpdateCard = (updatedCard: CardData) => {
    if (!activeCardSetting) return;
    const { exerciseId } = activeCardSetting;

    setExercises((prev) =>
      prev.map((ex) => {
        if (ex.id !== exerciseId) return ex;
        return {
          ...ex,
          cards: ex.cards.map((c) => (c.id === updatedCard.id ? updatedCard : c))
        };
      })
    );
  };

  // Delete a card
  const handleDeleteCard = (cardId: number) => {
    if (!activeCardSetting) return;
    const { exerciseId } = activeCardSetting;

    setExercises((prev) =>
      prev.map((ex) => {
        if (ex.id !== exerciseId) return ex;
        return {
          ...ex,
          cards: ex.cards.filter((c) => c.id !== cardId)
        };
      })
    );
    setActiveCardSetting(null);
    showToast('تم حذف البطاقة بنجاح', 'info');
  };

  // Update column width from modal
  const handleUpdateColWidth = (newWidth: number) => {
    if (!activeCardSetting) return;
    const { exerciseId } = activeCardSetting;
    setExercises((prev) =>
      prev.map((ex) => (ex.id === exerciseId ? { ...ex, colWidth: newWidth } : ex))
    );
  };

  // Insert a new exercise
  const handleInsertExercise = (config: {
    type: ExerciseType;
    instruction: string;
    cardCount: number;
    theme: 'mixed' | 'fruits' | 'shapes' | 'hands';
    stripConfig?: {
      startNum: number;
      endNum: number;
      emptyCount: number;
      theme: any;
    };
  }) => {
    const newExId = Date.now();

    if (config.type === 'strip') {
      const startNum = config.stripConfig?.startNum ?? 1;
      const endNum = config.stripConfig?.endNum ?? 10;
      const emptyCount = config.stripConfig?.emptyCount ?? 3;
      const theme = config.stripConfig?.theme ?? 'train';
      const totalCount = Math.max(1, endNum - startNum + 1);
      const safeEmpty = Math.min(Math.max(1, emptyCount), Math.max(1, totalCount - 1));
      const indices = Array.from({ length: totalCount }, (_, i) => i);
      const shuffled = [...indices].sort(() => Math.random() - 0.5);
      const hiddenIndices = shuffled.slice(0, safeEmpty).sort((a, b) => a - b);

      const newExercise: ExerciseData = {
        id: newExId,
        type: 'strip',
        title: 'تمرين الشريط العددي',
        instruction: config.instruction || DEFAULT_INSTRUCTIONS.strip,
        colWidth: 150,
        itemSize: 34,
        cards: [],
        stripConfig: {
          startNum,
          endNum,
          emptyCount: safeEmpty,
          hiddenIndices,
          theme,
          boxSize: 48,
          direction: 'ltr'
        }
      };

      setExercises((prev) => [...prev, newExercise]);
      showToast('تم إدراج تمرين الشريط العددي بنجاح', 'success');
      return;
    }

    const generatedCards: CardData[] = [];

    const themesCatalog = {
      fruits: ['🍎', '🍌', '🍇', '🍊', '🍓', '🍒'],
      shapes: ['○', '△', '□', '⭐', '◊', '⬡'],
      hands: ['hand:1', 'hand:2', 'hand:3', 'hand:4', 'hand:5', 'hand:6', 'hand:7', 'hand:8', 'hand:9', 'hand:10'],
      mixed: ['🍎', '○', 'hand:3', '⭐', '🚗', '△']
    };

    const chosenTheme = themesCatalog[config.theme] || themesCatalog.mixed;

    for (let i = 0; i < config.cardCount; i++) {
      const cardId = newExId + i + 1;
      const count = (i % 6) + 1;
      const sym = chosenTheme[i % chosenTheme.length];

      if (config.type === 'draw') {
        generatedCards.push({
          id: cardId,
          items: [],
          size: 34,
          targetEmoji: sym.startsWith('hand:') ? '○' : sym,
          targetCount: count + 1
        });
      } else if (config.type === 'match') {
        // Match exercises only use countable items (symbols and shapes), never hands or numbers
        const matchSymbols = config.theme === 'shapes'
          ? ['○', '△', '□', '⭐', '◊', '⬡']
          : ['🍎', '🍌', '🍇', '⭐', '🐱', '🌸', '🎈', '🚗', '🍉'];
        const sym = matchSymbols[i % matchSymbols.length];
        const itemArray = Array(count).fill(sym);

        generatedCards.push({
          id: cardId,
          items: itemArray,
          size: 34
        });
      } else {
        // Count exercise
        const itemArray = config.theme === 'hands'
          ? [`hand:${(i % 10) + 1}`]
          : sym.startsWith('hand:')
          ? [sym]
          : Array(count).fill(sym);

        generatedCards.push({
          id: cardId,
          items: itemArray,
          size: sym.startsWith('hand:') || config.theme === 'hands' ? 38 : 34
        });
      }
    }

    const newExercise: ExerciseData = {
      id: newExId,
      type: config.type,
      title:
        config.type === 'count'
          ? 'تمرين العد وكتابة العدد'
          : config.type === 'draw'
          ? 'تمرين الرسم حسب العدد'
          : 'تمرين مطابقة المجموعات بالأعداد',
      instruction: config.instruction,
      colWidth: 150,
      itemSize: 34,
      cards: generatedCards,
      numOrder: config.type === 'match' ? [...generatedCards.map((c) => c.id)].sort(() => Math.random() - 0.5) : undefined
    };

    setExercises((prev) => [...prev, newExercise]);
    showToast('تم إدراج التمرين الجديد بنجاح في الصفحة', 'success');
  };

  // Delete exercise
  const handleDeleteExercise = (exerciseId: number) => {
    if (exercises.length <= 1) {
      showToast('يجب أن تحتوي الصفحة على تمرين واحد على الأقل', 'warn');
      return;
    }
    setExercises((prev) => prev.filter((ex) => ex.id !== exerciseId));
    showToast('تم حذف التمرين من الصفحة', 'info');
  };

  // Move exercise up or down
  const handleMoveExercise = (index: number, direction: 'up' | 'down') => {
    if (direction === 'up' && index === 0) return;
    if (direction === 'down' && index === exercises.length - 1) return;

    const targetIndex = direction === 'up' ? index - 1 : index + 1;
    const newExs = [...exercises];
    const temp = newExs[index];
    newExs[index] = newExs[targetIndex];
    newExs[targetIndex] = temp;
    setExercises(newExs);
  };

  // Export full page
  const handleExportFullPage = () => {
    if (!a4PageRef.current) return;
    setIsExporting(true);
    showToast('جارٍ معالجة وتصدير صفحة A4 كصورة عالية الدقة...', 'info');

    exportElementAsImage(
      a4PageRef.current,
      `ورقة-تمارين-العد-A4-${new Date().toISOString().slice(0, 10)}`,
      () => setIsExporting(true),
      () => {
        setIsExporting(false);
        showToast('✅ تم تنزيل صورة الصفحة كاملة بجودة طباعة فائقة', 'success');
      },
      () => {
        setIsExporting(false);
        showToast('تعذر تصدير الصورة، يرجى المحاولة ثانية', 'warn');
      }
    );
  };

  // Export specific exercise
  const handleExportSingleExercise = (element: HTMLElement, title: string) => {
    setIsExporting(true);
    showToast(`جارٍ تصدير ${title} كصورة عالية الدقة...`, 'info');

    exportElementAsImage(
      element,
      `${title}-${new Date().toISOString().slice(0, 10)}`,
      () => setIsExporting(true),
      () => {
        setIsExporting(false);
        showToast(`✅ تم تصدير ${title} كصورة مستقلة بنجاح`, 'success');
      },
      () => {
        setIsExporting(false);
        showToast('تعذر تصدير التمرين', 'warn');
      }
    );
  };

  // Print worksheet
  const handlePrint = () => {
    window.print();
  };

  // Reset to default
  const handleReset = () => {
    if (window.confirm('هل تريد استعادة التمارين والترويسة الافتراضية؟')) {
      setExercises(INITIAL_EXERCISES);
      setHeaderData(INITIAL_HEADER);
      showToast('تم استعادة الإعدادات الأولية', 'info');
    }
  };

  const activeExerciseForModal = activeCardSetting
    ? exercises.find((ex) => ex.id === activeCardSetting.exerciseId)
    : null;

  return (
    <LocalGuard>
      <div className="min-h-screen bg-stone-100/70 text-stone-800 pb-16 selection:bg-emerald-200" dir="rtl">
        {/* Top Control Bar (Zone 1: Title, Zone 2: Sheet stats, Zone 3: Main Actions) */}
        <div className="no-print sticky top-0 z-40 bg-white/95 backdrop-blur-md border-b border-stone-200 shadow-xs px-4 py-2.5">
          <div className="max-w-5xl mx-auto flex flex-wrap items-center justify-between gap-3">
            {/* Zone 1: Wordmark */}
            <div className="flex items-center gap-2">
              <span className="p-1.5 rounded-lg bg-emerald-600 text-white font-bold text-sm">
                🧮
              </span>
              <div>
                <h1 className="font-extrabold text-base text-stone-900 tracking-tight leading-none">
                  مصمم تمارين وبطاقات العد للأطفال
                </h1>
                <p className="text-[11px] text-stone-500 font-medium">
                  قياس A4 بهوامش 1 سم · تصدير صور فائقة الدقة · خيارات أصابع ورسوم
                </p>
              </div>
            </div>

            {/* Zone 2: Sheet Stats */}
            <div className="hidden md:flex items-center gap-2 text-xs text-stone-500 font-semibold bg-stone-100/80 px-3 py-1 rounded-lg border border-stone-200">
              <FileText className="w-3.5 h-3.5 text-stone-400" />
              <span>عدد التمارين بالصفحة: {exercises.length}</span>
              <span className="text-stone-300">·</span>
              <span>هوامش دقيقة: 10 مم</span>
            </div>

            {/* Zone 3: Primary Actions */}
            <div className="flex items-center gap-2">
              {/* Insert Exercise Button */}
              <button
                type="button"
                onClick={() => setShowInsertModal(true)}
                className="px-3.5 py-1.5 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-bold flex items-center gap-1.5 shadow-xs transition-colors"
                title="إضافة تمرين جديد للصفحة"
              >
                <Plus className="w-4 h-4" />
                <span>إدراج تمرين</span>
              </button>

              {/* Export Full Page Button */}
              <button
                type="button"
                onClick={handleExportFullPage}
                disabled={isExporting}
                className="px-3 py-1.5 rounded-xl bg-blue-600 hover:bg-blue-700 text-white text-xs font-bold flex items-center gap-1.5 shadow-xs transition-colors disabled:opacity-60"
                title="تصدير الصفحة A4 بالكامل كصورة PNG عالية الدقة"
              >
                <Download className="w-4 h-4" />
                <span>تصدير الصفحة كصورة</span>
              </button>

              {/* Print Button */}
              <button
                type="button"
                onClick={handlePrint}
                className="px-3 py-1.5 rounded-xl bg-white border border-stone-300 hover:bg-stone-50 text-stone-700 text-xs font-bold flex items-center gap-1.5 transition-colors"
                title="معاينة وطباعة ورقة العمل"
              >
                <Printer className="w-4 h-4 text-stone-600" />
                <span>طباعة</span>
              </button>

              {/* Reset */}
              <button
                type="button"
                onClick={handleReset}
                className="p-1.5 rounded-xl text-stone-400 hover:text-stone-700 hover:bg-stone-100 transition-colors"
                title="استعادة الإعدادات الافتراضية"
              >
                <RotateCcw className="w-4 h-4" />
              </button>
            </div>
          </div>
        </div>

        {/* Quick Helper Banner */}
        <div className="no-print max-w-4xl mx-auto px-4 pt-3 pb-1">
          <div className="flex items-center justify-between text-xs text-stone-600 bg-amber-50/70 border border-amber-200/80 px-3.5 py-2 rounded-xl">
            <div className="flex items-center gap-2">
              <Sparkles className="w-4 h-4 text-amber-600 shrink-0" />
              <span>
                <strong>تلميح للأستاذ(ة):</strong> اضغط على «إدراج تمرين» لإضافة تمارين متنوعة (عدّ، رسم، مطابقة)، واستخدم أزرار التوسيع والتكبير في كل تمرين للضبط الدقيق.
              </span>
            </div>
          </div>
        </div>

        {/* The Printable A4 Workspace (210mm x 297mm with 1cm margins) */}
        <main className="max-w-4xl mx-auto p-3 sm:p-6">
          <div
            ref={a4PageRef}
            className="a4-sheet shadow-lg rounded-sm border border-stone-300 transition-shadow print:shadow-none print:border-none"
          >
            {/* Dynamic auto-height editable header */}
            <PageHeader data={headerData} onChange={setHeaderData} />

            {/* List of exercises inside the A4 sheet */}
            <div className="space-y-3 print:space-y-1.5">
              {exercises.map((exercise, index) => (
                <ExerciseBlock
                  key={exercise.id}
                  exercise={exercise}
                  exerciseIndex={index}
                  totalExercises={exercises.length}
                  onUpdateExercise={handleUpdateExercise}
                  onOpenCardSettings={handleOpenCardSettings}
                  onOpenStripSettings={(ex) => setActiveStripSetting(ex)}
                  onDeleteExercise={handleDeleteExercise}
                  onMoveExercise={handleMoveExercise}
                  onExportExercise={handleExportSingleExercise}
                />
              ))}
            </div>

            {/* Page Footer Note in Print */}
            <div className="mt-2.5 print:mt-1 pt-1.5 print:pt-0.5 border-t border-dotted border-stone-300 text-center text-[10px] text-stone-400">
              ورقة عمل تربوية مصممة ومجهزة للطباعة بقياس A4 (هوامش 10 مم)
            </div>
          </div>
        </main>

        {/* Card Settings Modal */}
        {activeCardSetting && activeExerciseForModal && (
          <CardSettingsModal
            card={activeCardSetting.card}
            exerciseType={activeExerciseForModal.type}
            exerciseColWidth={activeExerciseForModal.colWidth}
            onUpdateCard={handleUpdateCard}
            onUpdateColWidth={handleUpdateColWidth}
            onDeleteCard={handleDeleteCard}
            onClose={() => setActiveCardSetting(null)}
          />
        )}

        {/* Strip Settings Modal */}
        {activeStripSetting && activeStripSetting.stripConfig && (
          <StripSettingsModal
            config={activeStripSetting.stripConfig}
            exerciseTitle={activeStripSetting.title}
            onSave={(newConfig) => {
              handleUpdateExercise({
                ...activeStripSetting,
                stripConfig: newConfig
              });
              showToast('تم حفظ إعدادات الشريط العددي بنجاح', 'success');
            }}
            onClose={() => setActiveStripSetting(null)}
          />
        )}

        {/* Insert Exercise Modal */}
        {showInsertModal && (
          <InsertExerciseModal
            onInsert={handleInsertExercise}
            onClose={() => setShowInsertModal(false)}
          />
        )}

        {/* Toast Notification */}
        {toast && (
          <div
            className={`no-print fixed bottom-5 left-1/2 -translate-x-1/2 z-50 px-4 py-2.5 rounded-xl shadow-lg border text-xs sm:text-sm font-bold flex items-center gap-2 animate-in fade-in slide-in-from-bottom-2 ${
              toast.type === 'success'
                ? 'bg-emerald-800 text-white border-emerald-700'
                : toast.type === 'warn'
                ? 'bg-amber-800 text-white border-amber-700'
                : 'bg-stone-800 text-white border-stone-700'
            }`}
          >
            {toast.type === 'success' ? (
              <CheckCircle2 className="w-4 h-4 text-emerald-300 shrink-0" />
            ) : toast.type === 'warn' ? (
              <AlertCircle className="w-4 h-4 text-amber-300 shrink-0" />
            ) : (
              <Info className="w-4 h-4 text-blue-300 shrink-0" />
            )}
            <span>{toast.text}</span>
          </div>
        )}
      </div>
    </LocalGuard>
  );
}
