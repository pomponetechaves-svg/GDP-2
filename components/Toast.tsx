import React, { useEffect } from 'react';
import { CheckCircle, AlertCircle, X } from 'lucide-react';

export interface ToastMessage {
  id: string;
  type: 'success' | 'error';
  message: string;
}

interface ToastProps {
  toasts: ToastMessage[];
  onDismiss: (id: string) => void;
}

export const ToastContainer: React.FC<ToastProps> = ({ toasts, onDismiss }) => {
  return (
    <div className="fixed bottom-4 right-4 z-50 flex flex-col gap-2">
      {toasts.map((toast) => (
        <ToastItem key={toast.id} toast={toast} onDismiss={onDismiss} />
      ))}
    </div>
  );
};

const ToastItem: React.FC<{ toast: ToastMessage; onDismiss: (id: string) => void }> = ({ toast, onDismiss }) => {
  useEffect(() => {
    const timer = setTimeout(() => {
      onDismiss(toast.id);
    }, 4000); // Auto dismiss after 4s
    return () => clearTimeout(timer);
  }, [toast.id, onDismiss]);

  const isSuccess = toast.type === 'success';

  return (
    <div 
      className={`
        flex items-center gap-3 px-4 py-3 rounded-lg shadow-lg border animate-in slide-in-from-right-full duration-300
        ${isSuccess 
          ? 'bg-slate-900 border-[#bb9829]/50 text-slate-100 shadow-[#bb9829]/10' 
          : 'bg-slate-900 border-red-500/50 text-slate-100 shadow-red-500/10'}
      `}
    >
      {isSuccess ? (
        <CheckCircle size={20} className="text-[#bb9829]" />
      ) : (
        <AlertCircle size={20} className="text-red-500" />
      )}
      
      <p className="text-sm font-medium pr-2">{toast.message}</p>
      
      <button 
        onClick={() => onDismiss(toast.id)} 
        className="text-slate-500 hover:text-slate-300 transition-colors ml-2 border-l border-slate-700 pl-2"
      >
        <X size={16} />
      </button>
    </div>
  );
};