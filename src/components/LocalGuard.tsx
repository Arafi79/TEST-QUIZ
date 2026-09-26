import React, { useState, useEffect } from 'react';
import { AlertTriangle, RefreshCw, ShieldAlert, Globe } from 'lucide-react';

interface LocalGuardProps {
  children: React.ReactNode;
}

export const LocalGuard: React.FC<LocalGuardProps> = ({ children }) => {
  const [isVerified, setIsVerified] = useState<boolean | null>(null);
  const [errorMessage, setErrorMessage] = useState<string>('');

  useEffect(() => {
    // Verification function running at initial launch
    const verifyEnvironment = () => {
      try {
        const protocol = window.location.protocol;
        const isFileProtocol = protocol === 'file:';

        // Check if the page is saved as a static file locally without web execution
        if (isFileProtocol) {
          setIsVerified(false);
          setErrorMessage(
            'عذراً، المحتوى غير متوفر في هذه النسخة المحفوظة محلياً. يرجى فتح التطبيق عبر رابط خادم الويب أو رفعه على صفحات GitHub Pages أو إعادة التحميل.'
          );
          return;
        }

        // Integrity reload session check:
        // Requires an active session flag, or sets it on validated live connection
        const sessionActive = sessionStorage.getItem('__math_studio_active__');
        if (!sessionActive) {
          sessionStorage.setItem('__math_studio_active__', Date.now().toString());
        }

        setIsVerified(true);
      } catch (err) {
        setIsVerified(false);
        setErrorMessage('عذراً، تعذر التحقق من بيئة التشغيل. يرجى إعادة تحميل الصفحة.');
      }
    };

    verifyEnvironment();
  }, []);

  const handleForceReload = () => {
    try {
      sessionStorage.setItem('__math_studio_active__', Date.now().toString());
      window.location.reload();
    } catch {
      window.location.reload();
    }
  };

  if (isVerified === null) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-stone-100 text-stone-600 font-bold" dir="rtl">
        <div className="flex items-center gap-2">
          <RefreshCw className="w-5 h-5 animate-spin text-emerald-600" />
          <span>جارٍ التحقق من جاهزية التطبيق...</span>
        </div>
      </div>
    );
  }

  if (!isVerified) {
    return (
      <div className="min-h-screen flex items-center justify-center p-4 bg-stone-100 text-stone-800" dir="rtl">
        <div className="max-w-md w-full p-6 bg-white rounded-2xl shadow-xl border border-stone-200 text-center space-y-4">
          <div className="w-14 h-14 mx-auto rounded-full bg-rose-100 text-rose-600 flex items-center justify-center">
            <ShieldAlert className="w-8 h-8" />
          </div>

          <h2 className="text-xl font-bold text-stone-900">
            تنبيه: المحتوى غير متوفر
          </h2>

          <p className="text-sm text-stone-600 leading-relaxed">
            {errorMessage}
          </p>

          <div className="pt-2 flex flex-col gap-2">
            <button
              onClick={handleForceReload}
              className="w-full py-2.5 px-4 bg-emerald-600 hover:bg-emerald-700 text-white font-bold rounded-xl flex items-center justify-center gap-2 shadow-xs transition-colors"
            >
              <RefreshCw className="w-4 h-4" />
              إعادة تحميل الصفحة الآن
            </button>

            <button
              onClick={() => setIsVerified(true)}
              className="w-full py-2 px-4 text-xs font-semibold text-stone-500 hover:text-stone-800 transition-colors"
            >
              متابعة في وضع المعاينة المباشرة (تخطي التحقق)
            </button>
          </div>
        </div>
      </div>
    );
  }

  return <>{children}</>;
};
