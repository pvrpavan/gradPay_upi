import { createContext, useContext, useState, useCallback, useRef } from 'react';

const ToastContext = createContext(null);

export function ToastProvider({ children }) {
  const [toasts, setToasts] = useState([]);
  const toastId = useRef(0);

  const addToast = useCallback((message, type = 'info', duration = 3000) => {
    const minDuration = Math.max(duration, 1000);
    const id = ++toastId.current;
    setToasts((prev) => [...prev, { id, message, type }]);
    setTimeout(() => {
      setToasts((prev) => prev.filter((t) => t.id !== id));
    }, minDuration);
  }, []);

  const showSuccess = useCallback((message, duration) => addToast(message, 'success', duration), [addToast]);
  const showError = useCallback((message, duration) => addToast(message, 'error', duration), [addToast]);
  const showInfo = useCallback((message, duration) => addToast(message, 'info', duration), [addToast]);
  const showWarning = useCallback((message, duration) => addToast(message, 'warning', duration), [addToast]);

  return (
    <ToastContext.Provider value={{ toasts, addToast, showSuccess, showError, showInfo, showWarning }}>
      {children}
    </ToastContext.Provider>
  );
}

export function useToast() {
  const ctx = useContext(ToastContext);
  if (!ctx) throw new Error('useToast must be used within ToastProvider');
  return ctx;
}
