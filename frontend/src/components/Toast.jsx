import { useToast } from '../context/ToastContext';
import { useTheme } from '../context/ThemeContext';
import { CheckCircle2, XCircle, Info, AlertTriangle, X } from 'lucide-react';

const ICONS = {
  success: CheckCircle2,
  error: XCircle,
  info: Info,
  warning: AlertTriangle,
};

export default function Toast() {
  const { toasts } = useToast();
  const { theme } = useTheme();

  if (toasts.length === 0) return null;

  const getColors = (type) => {
    switch (type) {
      case 'success': return { bg: theme.success, text: '#ffffff' };
      case 'error': return { bg: theme.danger, text: '#ffffff' };
      case 'warning': return { bg: theme.warning, text: '#ffffff' };
      default: return { bg: theme.brand, text: '#ffffff' };
    }
  };

  return (
    <div className="fixed top-4 left-1/2 -translate-x-1/2 z-[9999] flex flex-col gap-2 w-[90%] max-w-sm pointer-events-none">
      {toasts.map((toast) => {
        const Icon = ICONS[toast.type] || Info;
        const colors = getColors(toast.type);
        return (
          <div
            key={toast.id}
            className="flex items-center gap-3 px-4 py-3 rounded-xl shadow-lg animate-slideDown pointer-events-auto"
            style={{ backgroundColor: colors.bg, color: colors.text }}
          >
            <Icon size={18} />
            <p className="text-sm font-medium flex-1">{toast.message}</p>
          </div>
        );
      })}
    </div>
  );
}
