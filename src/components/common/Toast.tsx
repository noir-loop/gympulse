import React from 'react';
import { useGym } from '../../context/GymContext';
import { CheckCircle, AlertCircle, Info, X } from 'lucide-react';

export const Toast: React.FC = () => {
  const { toast, clearToast } = useGym();

  if (!toast) return null;

  const icons = {
    success: <CheckCircle className="w-5 h-5 text-emerald-400 shrink-0" />,
    error: <AlertCircle className="w-5 h-5 text-red-400 shrink-0" />,
    info: <Info className="w-5 h-5 text-sky-400 shrink-0" />,
  };

  const bgColors = {
    success: 'bg-slate-900 border-emerald-500/40 text-slate-100',
    error: 'bg-slate-900 border-red-500/40 text-slate-100',
    info: 'bg-slate-900 border-sky-500/40 text-slate-100',
  };

  return (
    <div className="fixed bottom-20 md:bottom-6 right-6 z-50 max-w-md w-full px-4 animate-slide-up">
      <div className={`flex items-center gap-3 p-4 rounded-xl border shadow-2xl backdrop-blur-md ${bgColors[toast.type]}`}>
        {icons[toast.type]}
        <div className="flex-1 text-sm font-medium">{toast.message}</div>
        <button
          onClick={clearToast}
          className="text-slate-400 hover:text-white p-1 transition-colors"
          aria-label="Close notification"
        >
          <X className="w-4 h-4" />
        </button>
      </div>
    </div>
  );
};
