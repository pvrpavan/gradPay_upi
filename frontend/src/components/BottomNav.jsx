import { useLocation, useNavigate } from 'react-router-dom';
import { Home, QrCode, TrendingUp, Receipt } from 'lucide-react';

const navItems = [
  { path: '/dashboard', icon: Home, label: 'Home' },
  { path: '/scanner', icon: QrCode, label: 'Scanner' },
  { path: '/tracker', icon: TrendingUp, label: 'Tracker' },
  { path: '/history', icon: Receipt, label: 'History' },
];

export default function BottomNav() {
  const location = useLocation();
  const navigate = useNavigate();

  return (
    <nav className="fixed bottom-0 left-1/2 -translate-x-1/2 w-full max-w-[430px] bg-white border-t border-gray-200 flex justify-around py-2 z-50 shadow-[0_-2px_10px_rgba(0,0,0,0.05)]">
      {navItems.map(({ path, icon: Icon, label }) => {
        const isActive = location.pathname === path;
        return (
          <button
            key={path}
            onClick={() => navigate(path)}
            className={`flex flex-col items-center gap-0.5 flex-1 py-1 bg-transparent border-none cursor-pointer transition-colors ${
              isActive ? 'text-[#f65e1d]' : 'text-gray-400 hover:text-gray-600'
            }`}
          >
            <Icon size={22} strokeWidth={isActive ? 2.5 : 2} />
            <span className="text-[11px] font-medium">{label}</span>
          </button>
        );
      })}
    </nav>
  );
}
