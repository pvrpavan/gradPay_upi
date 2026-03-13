import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { useTheme } from '../context/ThemeContext';
import { api } from '../utils/api';
import { Send, ArrowDownCircle, Wallet, Zap, Plane, Smartphone, Droplets, HelpCircle, MessageCircle, Wifi, Tv, Star, ChevronRight, Bell } from 'lucide-react';
import BottomNav from '../components/BottomNav';
import Avatar from '../components/Avatar';

const quickActions = [
  { icon: Send, label: 'Send Money', path: '/send-money', color: 'from-indigo-400 to-indigo-500' },
  { icon: ArrowDownCircle, label: 'Deposit', path: '/deposit', color: 'from-green-400 to-green-500' },
  { icon: Wallet, label: 'Balance', path: '/balance', color: 'from-blue-400 to-blue-500' },
];

export default function Dashboard() {
  const navigate = useNavigate();
  const { user, phone } = useAuth();
  const { theme, isDark } = useTheme();
  const [profile, setProfile] = useState(null);

  const displayName = user?.name || user?.displayName || profile?.name || 'User';
  const profilePhoto = user?.profile_photo_url || profile?.profile_photo_url || '';
  const rewardPoints = user?.rewardPoints || profile?.rewardPoints || 0;

  const utilities = [
    { icon: Zap, label: 'Electricity', type: 'electricity', iconColor: '#eab308', bg: isDark ? `${theme.bgCard}` : '#fefce8' },
    { icon: Plane, label: 'Travel', type: 'travel', iconColor: '#3b82f6', bg: isDark ? `${theme.bgCard}` : '#eff6ff' },
    { icon: Smartphone, label: 'Recharge', type: 'recharge', iconColor: '#22c55e', bg: isDark ? `${theme.bgCard}` : '#f0fdf4' },
    { icon: Droplets, label: 'Water', type: 'water', iconColor: '#06b6d4', bg: isDark ? `${theme.bgCard}` : '#ecfeff' },
    { icon: Wifi, label: 'Internet', type: 'internet', iconColor: '#6366f1', bg: isDark ? `${theme.bgCard}` : '#eef2ff' },
    { icon: Tv, label: 'DTH / TV', type: 'dth', iconColor: '#a855f7', bg: isDark ? `${theme.bgCard}` : '#faf5ff' },
  ];

  useEffect(() => {
    if (phone) {
      api.getProfile(phone).then((data) => setProfile(data)).catch(() => {});
    }
  }, [phone]);

  return (
    <div className="min-h-screen pb-20" style={{ background: `linear-gradient(135deg, ${theme.gradientFrom}, ${theme.gradientTo})` }}>
      {/* Top Bar */}
      <header
        className="flex items-center justify-between px-4 py-3 rounded-b-2xl shadow-lg"
        style={{ background: `linear-gradient(135deg, ${theme.brand}, ${theme.brandLight})` }}
      >
        <div className="flex items-center gap-3 cursor-pointer" onClick={() => navigate('/profile')}>
          <Avatar name={displayName} photoUrl={profilePhoto} size={40} />
          <div>
            <span className="text-white text-sm font-medium block">Hi, {displayName}</span>
            <span className="text-white/60 text-[10px]">Welcome back</span>
          </div>
        </div>
        <div className="flex items-center gap-3">
          <button onClick={() => navigate('/notifications')} className="bg-white/20 rounded-full p-2 border-none cursor-pointer text-white backdrop-blur-sm">
            <Bell size={18} />
          </button>
          <button onClick={() => navigate('/chat')} className="bg-white/20 rounded-full p-2 border-none cursor-pointer text-white backdrop-blur-sm">
            <MessageCircle size={18} />
          </button>
          <button onClick={() => navigate('/faqs')} className="bg-white/20 rounded-full p-2 border-none cursor-pointer text-white backdrop-blur-sm">
            <HelpCircle size={18} />
          </button>
        </div>
      </header>

      <main className="px-4 pt-4">
        {/* Banner */}
        <div
          className="w-full mb-5 rounded-2xl overflow-hidden shadow-md animate-fadeIn animate-tilt-3d"
          style={{ animationIterationCount: 1, animationDuration: '0.8s' }}
        >
          <img src="/photos/index_photo_no_bg.png" alt="GradPay" className="w-full h-auto object-contain rounded-2xl" />
        </div>

        {/* Quick Actions */}
        <section className="mb-6 animate-slideUp">
          <h3 className="text-sm font-semibold mb-3 uppercase tracking-wide" style={{ color: theme.textSecondary }}>Quick Actions</h3>
          <div className="grid grid-cols-3 gap-3">
            {quickActions.map(({ icon: Icon, label, path, color }) => (
              <button
                key={label}
                onClick={() => navigate(path)}
                className={`flex flex-col items-center gap-2 py-4 px-2 rounded-2xl bg-gradient-to-br ${color} text-white shadow-md hover:shadow-lg hover:-translate-y-1 transition-all cursor-pointer border-none transform active:scale-95`}
              >
                <div className="animate-wave">
                  <Icon size={24} />
                </div>
                <span className="text-xs font-semibold">{label}</span>
              </button>
            ))}
          </div>
        </section>

        {/* Utilities */}
        <section className="mb-6">
          <div className="flex items-center justify-between mb-3">
            <h3 className="text-sm font-semibold uppercase tracking-wide" style={{ color: theme.textSecondary }}>Utilities</h3>
            <button
              onClick={() => navigate('/utility')}
              className="text-xs font-medium flex items-center gap-0.5 bg-transparent border-none cursor-pointer"
              style={{ color: theme.brand }}
            >
              View All <ChevronRight size={14} />
            </button>
          </div>
          <div className="grid grid-cols-3 gap-3">
            {utilities.map(({ icon: Icon, label, type, iconColor, bg }, i) => (
              <button
                key={label}
                onClick={() => navigate(`/utility?type=${type}`)}
                className={`flex flex-col items-center gap-2 p-3 rounded-2xl shadow-sm hover:shadow-md hover:-translate-y-0.5 transition-all cursor-pointer border-none card-3d animate-stagger-${i + 1}`}
                style={{ backgroundColor: bg, border: isDark ? `1px solid ${theme.border}` : 'none' }}
              >
                <Icon size={20} style={{ color: iconColor }} />
                <span className="text-[11px] font-semibold" style={{ color: theme.text }}>{label}</span>
              </button>
            ))}
          </div>
        </section>

        {/* Rewards Card */}
        <section className="mb-6">
          <div
            className="rounded-2xl p-5 text-white shadow-lg relative overflow-hidden animate-gradient-shift animate-glow-pulse"
            style={{ background: `linear-gradient(135deg, ${theme.brand}, ${theme.brandLight})` }}
          >
            <div className="absolute -top-6 -right-6 w-24 h-24 bg-white/10 rounded-full" />
            <div className="absolute -bottom-4 -left-4 w-16 h-16 bg-white/10 rounded-full" />
            <div className="relative z-10 flex items-center justify-between">
              <div>
                <h4 className="font-bold text-sm mb-1 flex items-center gap-1"><Star size={14} /> Reward Points</h4>
                <p className="text-3xl font-bold">{rewardPoints} pts</p>
                <p className="text-xs text-white/70 mt-1">Earn more by making transactions!</p>
              </div>
              <Star size={40} className="text-white/20" />
            </div>
          </div>
        </section>
      </main>

      <BottomNav />
    </div>
  );
}
