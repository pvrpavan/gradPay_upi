import { useLocation, useNavigate } from 'react-router-dom';
import { Home, QrCode, TrendingUp, Receipt } from 'lucide-react';
import { useTheme } from '../context/ThemeContext';

const navItems = [
  { path: '/dashboard', icon: Home, label: 'Home' },
  { path: '/scanner', icon: QrCode, label: 'Scanner' },
  { path: '/tracker', icon: TrendingUp, label: 'Tracker' },
  { path: '/history', icon: Receipt, label: 'History' },
];

export default function BottomNav() {
  const location = useLocation();
  const navigate = useNavigate();
  const { theme } = useTheme();

  return (
    <nav
      className="fixed bottom-0 left-1/2 -translate-x-1/2 w-full max-w-[430px] sm:max-w-[480px] md:max-w-[520px] flex justify-around py-2 z-50"
      style={{
        backgroundColor: theme.navBg,
        borderTop: `1px solid ${theme.border}`,
        boxShadow: `0 -2px 10px ${theme.shadow}`,
      }}
    >
      {navItems.map(({ path, icon: Icon, label }) => {
        const isActive = location.pathname === path;
        return (
          <button
            key={path}
            onClick={() => navigate(path)}
            className="flex flex-col items-center gap-0.5 flex-1 py-1 bg-transparent border-none cursor-pointer transition-colors"
            style={{ color: isActive ? theme.brand : theme.textMuted }}
          >
            <Icon size={22} strokeWidth={isActive ? 2.5 : 2} />
            <span className="text-[11px] font-medium">{label}</span>
          </button>
        );
      })}
    </nav>
  );
}
