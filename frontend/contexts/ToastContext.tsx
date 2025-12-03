import React, { createContext, useContext, useState, useCallback, ReactNode } from 'react';
import { CheckCircle, AlertCircle, Info, X, Sparkles } from 'lucide-react';

// --- TYPES ---
type ToastType = 'success' | 'error' | 'info' | 'xp';

interface Toast {
  id: string;
  message: string;
  type: ToastType;
  duration?: number;
}

interface ToastContextType {
  showToast: (message: string, type?: ToastType, duration?: number) => void;
}

// --- CONTEXT ---
const ToastContext = createContext<ToastContextType | undefined>(undefined);

// --- HOOK ---
export const useToast = (): ToastContextType => {
  const context = useContext(ToastContext);
  if (!context) {
    throw new Error('useToast must be used within a ToastProvider');
  }
  return context;
};

// --- PROVIDER ---
interface ToastProviderProps {
  children: ReactNode;
}

export const ToastProvider: React.FC<ToastProviderProps> = ({ children }) => {
  const [toasts, setToasts] = useState<Toast[]>([]);

  const showToast = useCallback((message: string, type: ToastType = 'success', duration: number = 4000) => {
    const id = Math.random().toString(36).substr(2, 9);
    const newToast: Toast = { id, message, type, duration };

    setToasts((prev) => [...prev, newToast]);

    // Auto remove after duration
    setTimeout(() => {
      setToasts((prev) => prev.filter((t) => t.id !== id));
    }, duration);
  }, []);

  const removeToast = useCallback((id: string) => {
    setToasts((prev) => prev.filter((t) => t.id !== id));
  }, []);

  const getIcon = (type: ToastType) => {
    switch (type) {
      case 'success':
        return <CheckCircle className="h-5 w-5 text-green-500" />;
      case 'error':
        return <AlertCircle className="h-5 w-5 text-red-500" />;
      case 'info':
        return <Info className="h-5 w-5 text-blue-500" />;
      case 'xp':
        return <Sparkles className="h-5 w-5 text-yellow-500" />;
      default:
        return <CheckCircle className="h-5 w-5 text-green-500" />;
    }
  };

  const getStyles = (type: ToastType) => {
    switch (type) {
      case 'success':
        return 'bg-white dark:bg-slate-800 border-l-4 border-green-500';
      case 'error':
        return 'bg-white dark:bg-slate-800 border-l-4 border-red-500';
      case 'info':
        return 'bg-white dark:bg-slate-800 border-l-4 border-blue-500';
      case 'xp':
        return 'bg-gradient-to-r from-yellow-50 to-amber-50 dark:from-yellow-900/30 dark:to-amber-900/30 border-l-4 border-yellow-500';
      default:
        return 'bg-white dark:bg-slate-800 border-l-4 border-green-500';
    }
  };

  return (
    <ToastContext.Provider value={{ showToast }}>
      {children}

      {/* Toast Container - Fixed top right */}
      <div className="fixed top-4 right-4 z-[200] flex flex-col gap-3 pointer-events-none">
        {toasts.map((toast, index) => (
          <div
            key={toast.id}
            className={`
              pointer-events-auto
              ${getStyles(toast.type)}
              px-4 py-3 rounded-xl shadow-lg
              flex items-center gap-3
              min-w-[280px] max-w-[400px]
              animate-slideIn
              transform transition-all duration-300
            `}
            style={{
              animationDelay: `${index * 50}ms`,
            }}
          >
            {getIcon(toast.type)}
            <p className="flex-1 text-sm font-medium text-slate-700 dark:text-slate-200">
              {toast.message}
            </p>
            <button
              onClick={() => removeToast(toast.id)}
              className="p-1 text-slate-400 hover:text-slate-600 dark:hover:text-slate-300 transition-colors rounded-full hover:bg-slate-100 dark:hover:bg-slate-700"
            >
              <X className="h-4 w-4" />
            </button>
          </div>
        ))}
      </div>

      {/* Animation Styles */}
      <style>{`
        @keyframes slideIn {
          from {
            opacity: 0;
            transform: translateX(100%);
          }
          to {
            opacity: 1;
            transform: translateX(0);
          }
        }
        .animate-slideIn {
          animation: slideIn 0.3s ease-out forwards;
        }
      `}</style>
    </ToastContext.Provider>
  );
};

export default ToastContext;




