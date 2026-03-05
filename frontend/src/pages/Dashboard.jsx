import { useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { Send, ArrowDownCircle, Wallet, Zap, Plane, Smartphone, Droplets, HelpCircle, MessageCircle } from 'lucide-react';
import BottomNav from '../components/BottomNav';

const quickActions = [
  { icon: Send, label: 'Send Money', path: '/send-money', color: 'from-orange-400 to-orange-500' },
  { icon: ArrowDownCircle, label: 'Deposit', path: '/deposit', color: 'from-green-400 to-green-500' },
  { icon: Wallet, label: 'Balance', path: '/balance', color: 'from-blue-400 to-blue-500' },
];

const utilities = [
  { icon: Zap, label: 'Electricity', color: 'bg-yellow-50 text-yellow-600' },
  { icon: Plane, label: 'Travel', color: 'bg-blue-50 text-blue-600' },
  { icon: Smartphone, label: 'Recharge', color: 'bg-green-50 text-green-600' },
  { icon: Droplets, label: 'Water', color: 'bg-cyan-50 text-cyan-600' },
];

export default function Dashboard() {
  const navigate = useNavigate();
  const { user } = useAuth();

  const displayName = user?.name || user?.displayName || 'User';

  return (
    <div className="min-h-screen gradient-warm pb-20">
      {/* Top Bar */}
      <header className="flex items-center justify-between px-4 py-3 bg-[#f65e1d] rounded-t-lg shadow-md">
        <div className="flex items-center gap-3 cursor-pointer" onClick={() => navigate('/profile')}>
          <img src="/photos/user-profile-photo.png" alt="Profile" className="w-9 h-9 rounded-full border-2 border-white/50" />
          <span className="text-white text-sm font-medium">Hi, {displayName}</span>
        </div>
        <div className="flex items-center gap-3">
          <button onClick={() => navigate('/chat')} className="bg-transparent border-none cursor-pointer text-white">
            <MessageCircle size={22} />
          </button>
          <button onClick={() => navigate('/faqs')} className="bg-transparent border-none cursor-pointer text-white">
            <HelpCircle size={24} />
          </button>
        </div>
      </header>

      <main className="px-4 pt-4">
        {/* Banner */}
        <div className="w-full mb-5 rounded-2xl overflow-hidden shadow-md">
          <img src="/photos/index_photo_no_bg.png" alt="GradPay" className="w-full h-auto object-contain rounded-2xl" />
        </div>

        {/* Quick Actions */}
        <section className="mb-6">
          <h3 className="text-sm font-semibold text-gray-500 mb-3 uppercase tracking-wide">Quick Actions</h3>
          <div className="grid grid-cols-3 gap-3">
            {quickActions.map(({ icon: Icon, label, path, color }) => (
              <button
                key={label}
                onClick={() => navigate(path)}
                className={`flex flex-col items-center gap-2 py-4 px-2 rounded-2xl bg-gradient-to-br ${color} text-white shadow-md hover:shadow-lg hover:-translate-y-0.5 transition-all cursor-pointer border-none`}
              >
                <Icon size={24} />
                <span className="text-xs font-semibold">{label}</span>
              </button>
            ))}
          </div>
        </section>

        {/* Utilities */}
        <section className="mb-6">
          <h3 className="text-sm font-semibold text-gray-500 mb-3 uppercase tracking-wide">Utilities</h3>
          <div className="grid grid-cols-2 gap-3">
            {utilities.map(({ icon: Icon, label, color }) => (
              <div
                key={label}
                className={`flex items-center gap-3 p-4 rounded-2xl ${color} shadow-sm hover:shadow-md transition-all cursor-pointer`}
              >
                <Icon size={20} />
                <span className="text-sm font-semibold">{label}</span>
              </div>
            ))}
          </div>
        </section>

        {/* Rewards Card */}
        <section className="mb-6">
          <div className="gradient-orange rounded-2xl p-5 text-white shadow-lg">
            <h4 className="font-bold text-sm mb-1">Reward Points</h4>
            <p className="text-3xl font-bold">250 pts</p>
            <p className="text-xs text-white/70 mt-1">Earn more by making transactions!</p>
          </div>
        </section>
      </main>

      <BottomNav />
    </div>
  );
}
