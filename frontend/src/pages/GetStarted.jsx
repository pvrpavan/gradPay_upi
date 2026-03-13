import { useNavigate } from 'react-router-dom';
import { ArrowRight, Shield, Zap, PiggyBank } from 'lucide-react';
import { useTheme } from '../context/ThemeContext';

export default function GetStarted() {
  const navigate = useNavigate();
  const { theme } = useTheme();

  return (
    <div className="min-h-screen flex flex-col items-center justify-center px-6 py-10 animate-fadeIn" style={{ background: `linear-gradient(135deg, ${theme.gradientFrom}, ${theme.gradientTo})` }}>
      {/* Logo */}
      <div className="flex items-center gap-2 mb-2">
        <img src="/photos/gradious-pay-logo-final.png" alt="GradPay Logo" className="w-12 h-12" />
        <h1 className="text-2xl font-bold" style={{ color: theme.text }}>
          <span style={{ color: theme.brand }}>Grad</span>Pay
        </h1>
      </div>

      {/* Welcome Text */}
      <h2 className="text-2xl font-bold text-center mt-6 leading-tight" style={{ color: theme.text }}>
        Welcome to<br />Gradious Pay
      </h2>

      <p className="text-center mt-3 text-sm leading-relaxed max-w-xs" style={{ color: theme.textSecondary }}>
        Simplify your Transactions, Track and save your expenses. Earn Rewards
      </p>

      {/* Hero Image */}
      <div className="mt-6 mb-6">
        <img
          src="/photos/get_started_image_1.png"
          alt="GradPay Welcome"
          className="w-64 h-auto drop-shadow-lg"
        />
      </div>

      {/* Feature Cards */}
      <div className="flex gap-4 mb-8">
        <div className="flex flex-col items-center gap-1 px-4 py-3 rounded-2xl shadow-sm" style={{ backgroundColor: `${theme.bgCard}B3` }}>
          <Shield size={20} style={{ color: theme.brand }} />
          <span className="text-[10px] font-medium" style={{ color: theme.textSecondary }}>Secure</span>
        </div>
        <div className="flex flex-col items-center gap-1 px-4 py-3 rounded-2xl shadow-sm" style={{ backgroundColor: `${theme.bgCard}B3` }}>
          <Zap size={20} style={{ color: theme.brand }} />
          <span className="text-[10px] font-medium" style={{ color: theme.textSecondary }}>Fast</span>
        </div>
        <div className="flex flex-col items-center gap-1 px-4 py-3 rounded-2xl shadow-sm" style={{ backgroundColor: `${theme.bgCard}B3` }}>
          <PiggyBank size={20} style={{ color: theme.brand }} />
          <span className="text-[10px] font-medium" style={{ color: theme.textSecondary }}>Save</span>
        </div>
      </div>

      {/* Get Started Button */}
      <button
        onClick={() => navigate('/login')}
        className="w-64 h-14 text-white text-lg font-semibold rounded-full shadow-lg hover:shadow-xl transition-all duration-300 flex items-center justify-center gap-2 cursor-pointer animate-pulse-glow border-none"
        style={{ backgroundColor: theme.brand }}
      >
        Get Started <ArrowRight size={20} />
      </button>
    </div>
  );
}
