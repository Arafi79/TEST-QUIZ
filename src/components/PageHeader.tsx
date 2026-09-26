import React, { useState } from 'react';
import { PageHeaderData } from '../types';
import { Edit3, Check, Eye, EyeOff, School, Calendar, UserCheck } from 'lucide-react';

interface PageHeaderProps {
  data: PageHeaderData;
  onChange: (updated: PageHeaderData) => void;
}

export const PageHeader: React.FC<PageHeaderProps> = ({ data, onChange }) => {
  const [isEditing, setIsEditing] = useState(false);
  const [tempData, setTempData] = useState<PageHeaderData>(data);

  if (!data.enabled) {
    return (
      <div className="no-print mb-3 py-1.5 px-3 bg-stone-100 rounded-lg text-xs text-stone-500 flex items-center justify-between border border-dashed border-stone-300">
        <span>الترويسة المدرسية مخفية حالياً</span>
        <button
          onClick={() => onChange({ ...data, enabled: true })}
          className="font-bold text-emerald-700 hover:underline flex items-center gap-1"
        >
          <Eye className="w-3.5 h-3.5" />
          إظهار الترويسة
        </button>
      </div>
    );
  }

  const handleSave = () => {
    onChange(tempData);
    setIsEditing(false);
  };

  return (
    <header className="relative mb-3 print:mb-2 pb-2 print:pb-1.5 border-b-2 border-stone-800 text-stone-900 group">
      {/* Quick edit & toggle bar (hidden in print) */}
      <div className="no-print absolute -top-3 left-0 flex items-center gap-1.5 opacity-0 group-hover:opacity-100 transition-opacity bg-white/95 px-2 py-1 rounded-md shadow-xs border border-stone-200 text-xs">
        <button
          onClick={() => {
            setTempData(data);
            setIsEditing(!isEditing);
          }}
          className="text-stone-600 hover:text-emerald-700 flex items-center gap-1 font-bold"
        >
          <Edit3 className="w-3 h-3" />
          {isEditing ? 'إلغاء التعديل' : 'تعديل الترويسة'}
        </button>
        <span className="text-stone-300">|</span>
        <button
          onClick={() => onChange({ ...data, enabled: false })}
          className="text-stone-500 hover:text-rose-600 flex items-center gap-1"
          title="إخفاء الترويسة من الورقة"
        >
          <EyeOff className="w-3 h-3" />
          إخفاء
        </button>
      </div>

      {isEditing ? (
        <div className="no-print p-3 bg-amber-50/70 border border-amber-200 rounded-xl space-y-2.5 text-xs">
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-2">
            <div>
              <label className="font-bold text-stone-700 block mb-1">المؤسسة / المدرسة:</label>
              <input
                type="text"
                value={tempData.schoolName}
                onChange={(e) => setTempData({ ...tempData, schoolName: e.target.value })}
                className="w-full px-2 py-1 bg-white border border-stone-300 rounded font-semibold"
              />
            </div>
            <div>
              <label className="font-bold text-stone-700 block mb-1">المادة / القسم:</label>
              <input
                type="text"
                value={tempData.grade}
                onChange={(e) => setTempData({ ...tempData, grade: e.target.value })}
                className="w-full px-2 py-1 bg-white border border-stone-300 rounded font-semibold"
              />
            </div>
            <div>
              <label className="font-bold text-stone-700 block mb-1">التاريخ:</label>
              <input
                type="text"
                value={tempData.date}
                onChange={(e) => setTempData({ ...tempData, date: e.target.value })}
                className="w-full px-2 py-1 bg-white border border-stone-300 rounded font-semibold"
              />
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
            <div>
              <label className="font-bold text-stone-700 block mb-1">عنوان ورقة العمل:</label>
              <input
                type="text"
                value={tempData.title}
                onChange={(e) => setTempData({ ...tempData, title: e.target.value })}
                className="w-full px-2 py-1 bg-white border border-stone-300 rounded font-semibold"
              />
            </div>
            <div>
              <label className="font-bold text-stone-700 block mb-1">اسم التلميذ(ة) (اتركه فارغاً لسطر النقاط):</label>
              <input
                type="text"
                placeholder="اسم التلميذ(ة)"
                value={tempData.studentName}
                onChange={(e) => setTempData({ ...tempData, studentName: e.target.value })}
                className="w-full px-2 py-1 bg-white border border-stone-300 rounded"
              />
            </div>
          </div>

          <div>
            <label className="font-bold text-stone-700 block mb-1">وصف أو توجيه إضافي:</label>
            <input
              type="text"
              value={tempData.subtitle}
              onChange={(e) => setTempData({ ...tempData, subtitle: e.target.value })}
              className="w-full px-2 py-1 bg-white border border-stone-300 rounded"
            />
          </div>

          <div className="flex justify-end gap-2 pt-1">
            <button
              onClick={() => setIsEditing(false)}
              className="px-3 py-1 bg-white border border-stone-300 rounded font-bold hover:bg-stone-100"
            >
              إلغاء
            </button>
            <button
              onClick={handleSave}
              className="px-3 py-1 bg-emerald-600 text-white rounded font-bold hover:bg-emerald-700 flex items-center gap-1"
            >
              <Check className="w-3.5 h-3.5" />
              حفظ
            </button>
          </div>
        </div>
      ) : (
        /* Printable & Display view of Header with flexible auto-height */
        <div className="space-y-2">
          {/* Top row: School & Class vs Title vs Student & Date */}
          <div className="flex items-start justify-between gap-3 text-xs sm:text-sm font-semibold text-stone-800">
            {/* Right column: School & Level */}
            <div className="space-y-0.5 shrink-0 min-w-[160px]">
              <div className="flex items-center gap-1.5 font-bold text-stone-900">
                <School className="w-4 h-4 text-emerald-700 shrink-0 print:hidden" />
                <span>{data.schoolName || 'المدرسة الابتدائية النموذجية'}</span>
              </div>
              <div className="text-stone-600 text-xs">
                <span>{data.grade || 'المستوى: السنة الأولى / الثانية ابتدائي'}</span>
              </div>
            </div>

            {/* Center column: Worksheet Title */}
            <div className="flex-1 text-center px-2 min-w-0">
              <h1 className="text-base sm:text-lg font-black text-stone-900 leading-snug">
                {data.title || 'ورقة نشاط: مهارات العد وتمثيل الأعداد'}
              </h1>
              {data.subtitle && (
                <p className="text-xs text-stone-500 font-medium mt-0.5">{data.subtitle}</p>
              )}
            </div>

            {/* Left column: Student Name & Date (Never wraps or drops dots) */}
            <div className="space-y-1 text-left text-xs shrink-0 whitespace-nowrap min-w-[200px]">
              <div className="font-bold text-stone-800 whitespace-nowrap flex items-center justify-end gap-1.5">
                <span className="shrink-0">اسم التلميذ(ة):</span>
                <span className="inline-block border-b-2 border-dotted border-stone-500 min-w-[125px] max-w-[155px] text-center font-normal px-1 truncate">
                  {data.studentName || ''}
                </span>
              </div>
              <div className="text-stone-600 font-semibold whitespace-nowrap flex items-center justify-end gap-1.5">
                <span className="shrink-0">التاريخ:</span>
                <span className="inline-block border-b-2 border-dotted border-stone-400 min-w-[95px] max-w-[125px] text-center font-normal px-1">
                  {data.date || '.... / .... / 2026'}
                </span>
              </div>
            </div>
          </div>

          {/* Evaluation row */}
          {data.evaluation && (
            <div className="flex items-center justify-between text-[11px] text-stone-600 border-t border-dashed border-stone-200 pt-1">
              <span>{data.evaluation}</span>
              <span className="font-mono text-[10px] text-stone-400">A4 Printable Format</span>
            </div>
          )}
        </div>
      )}
    </header>
  );
};
