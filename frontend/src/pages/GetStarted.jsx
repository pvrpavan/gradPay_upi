import { useNavigate } from 'react-router-dom';
import { ArrowRight, Shield, Zap, PiggyBank } from 'lucide-react';

export default function GetStarted() {
  const navigate = useNavigate();

  return (
    <div className="min-h-screen gradient-warm flex flex-col items-center justify-center px-6 py-10 animate-fadeIn">
      {/* Logo */}
      <div className="flex items-center gap-2 mb-2">
        <img src="/photos/gradious-pay-logo-final.png" alt="GradPay Logo" className="w-12 h-12" />
        <h1 className="text-2xl font-bold text-gray-800">
          <span className="text-[#f65e1d]">Grad</span>Pay
        </h1>
      </div>

      {/* Welcome Text */}
      <h2 className="text-2xl font-bold text-center text-gray-800 mt-6 leading-tight">
        Welcome to<br />Gradious Pay
      </h2>

      <p className="text-gray-500 text-center mt-3 text-sm leading-relaxed max-w-xs">
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
        <div className="flex flex-col items-center gap-1 px-4 py-3 bg-white/70 rounded-2xl shadow-sm">
          <Shield size={20} className="text-[#f65e1d]" />
          <span className="text-[10px] font-medium text-gray-600">Secure</span>
        </div>
        <div className="flex flex-col items-center gap-1 px-4 py-3 bg-white/70 rounded-2xl shadow-sm">
          <Zap size={20} className="text-[#f65e1d]" />
          <span className="text-[10px] font-medium text-gray-600">Fast</span>
        </div>
        <div className="flex flex-col items-center gap-1 px-4 py-3 bg-white/70 rounded-2xl shadow-sm">
          <PiggyBank size={20} className="text-[#f65e1d]" />
          <span className="text-[10px] font-medium text-gray-600">Save</span>
        </div>
      </div>

      {/* Get Started Button */}
      <button
        onClick={() => navigate('/login')}
        className="w-64 h-14 bg-[#f65e1d] hover:bg-[#e5531a] text-white text-lg font-semibold rounded-full shadow-lg hover:shadow-xl transition-all duration-300 flex items-center justify-center gap-2 cursor-pointer animate-pulse-glow"
      >
        Get Started <ArrowRight size={20} />
      </button>
    </div>
  );
}
