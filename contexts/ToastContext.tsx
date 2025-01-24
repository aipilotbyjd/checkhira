import { createContext, useContext, useState } from 'react';
import { Toast } from '../components/Toast';

type ToastType = 'success' | 'error' | 'info';

interface ToastContextType {
  showToast: (message: string, type?: ToastType) => void;
}

const ToastContext = createContext<ToastContextType>({} as ToastContextType);

export function ToastProvider({ children }: { children: React.ReactNode }) {
  const [toast, setToast] = useState<{
    message: string;
    type: ToastType;
    visible: boolean;
  } | null>(null);

  const showToast = (message: string, type: ToastType = 'success') => {
    setToast({ message, type, visible: true });
  };

  return (
    <ToastContext.Provider value={{ showToast }}>
      {children}
      {toast?.visible && (
        <Toast message={toast.message} type={toast.type} onHide={() => setToast(null)} />
      )}
    </ToastContext.Provider>
  );
}

export const useToast = () => useContext(ToastContext);
