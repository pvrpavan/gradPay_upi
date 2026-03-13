import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { useTheme } from '../context/ThemeContext';
import { api } from '../utils/api';
import TopBar from '../components/TopBar';
import { Gift, Copy, Check, Users, Star, Share2 } from 'lucide-react';

export default function Referral() {
  const navigate = useNavigate();
  const { phone } = useAuth();
  const { theme, isDark } = useTheme();
  const [profile, setProfile] = useState(null);
  const [referralCode, setReferralCode] = useState('');
  const [msg, setMsg] = useState('');
  const [copied, setCopied] = useState(false);

  useEffect(() => {
    if (!phone) { navigate('/login'); return; }
    api.getProfile(phone).then(setProfile).catch(() => {});
  }, [phone, navigate]);

  const handleApply = async () => {
    if (!referralCode.trim()) { setMsg('Please enter a referral code'); return; }
    try {
      const data = await api.applyReferral(phone, referralCode.trim());
      if (data.error) setMsg(data.error);
      else { setMsg(data.message || 'Referral applied successfully!'); api.getProfile(phone).then(setProfile); }
    } catch { setMsg('Failed to apply referral'); }
  };

  const handleCopy = () => {
    if (profile?.referralCode) {
      navigator.clipboard.writeText(profile.referralCode);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    }
  };

  if (!profile) {
    return (
      <div className="min-h-screen flex items-center justify-center" style={{ background: `linear-gradient(135deg, ${theme.gradientFrom}, ${theme.gradientTo})` }}>
        <div className="animate-spin w-8 h-8 border-3 rounded-full" style={{ borderColor: theme.brand, borderTopColor: 'transparent' }} />
      </div>
    );
  }

  return (
    <div className="min-h-screen" style={{ background: `linear-gradient(135deg, ${theme.gradientFrom}, ${theme.gradientTo})` }}>
      <TopBar title="Referral Program" />
      <main className="px-4 pt-5 pb-8 animate-fadeIn">
        {/* Hero */}
        <div className="rounded-3xl p-6 text-white mb-6 shadow-xl relative overflow-hidden" style={{ background: `linear-gradient(135deg, ${theme.brand}, ${theme.brandLight})` }}>
          <div className="absolute top-0 right-0 w-32 h-32 bg-white/10 rounded-full -translate-y-1/2 translate-x-1/2" />
          <Gift size={40} className="mb-3 text-white/80" />
          <h2 className="text-xl font-bold mb-1">Invite Friends & Earn!</h2>
          <p className="text-sm text-white/80 mb-4">Get 150 points for each friend who joins. Your friend gets 100 points too!</p>
          
          <div className="bg-white/20 backdrop-blur-sm rounded-2xl p-4">
            <p className="text-xs text-white/70 mb-1">Your Referral Code</p>
            <div className="flex items-center justify-between">
              <p className="text-2xl font-bold tracking-wider">{profile.referralCode || 'N/A'}</p>
              <button onClick={handleCopy} className="bg-white/30 p-2 rounded-xl border-none cursor-pointer">
                {copied ? <Check size={18} className="text-white" /> : <Copy size={18} className="text-white" />}
              </button>
            </div>
          </div>
        </div>

        {/* Stats */}
        <div className="grid grid-cols-2 gap-3 mb-6">
          <div className="rounded-2xl p-4 shadow-sm text-center" style={{ backgroundColor: theme.bgCard }}>
            <Star size={24} className="mx-auto mb-2" style={{ color: theme.warning }} />
            <p className="text-2xl font-bold" style={{ color: theme.text }}>{profile.rewardPoints || 0}</p>
            <p className="text-xs" style={{ color: theme.textMuted }}>Total Points</p>
          </div>
          <div className="rounded-2xl p-4 shadow-sm text-center" style={{ backgroundColor: theme.bgCard }}>
            <Users size={24} className="mx-auto mb-2" style={{ color: theme.brand }} />
            <p className="text-2xl font-bold" style={{ color: theme.text }}>{profile.referredBy ? 1 : 0}</p>
            <p className="text-xs" style={{ color: theme.textMuted }}>Referrals Used</p>
          </div>
        </div>

        {/* Share */}
        <button
          onClick={handleCopy}
          className="w-full py-3.5 text-white rounded-2xl border-none cursor-pointer text-base font-semibold flex items-center justify-center gap-2 shadow-lg mb-6 transition-colors"
          style={{ backgroundColor: theme.brand }}
        >
          <Share2 size={18} /> Share Referral Code
        </button>

        {/* Apply Referral */}
        {!profile.referredBy && (
          <div className="rounded-2xl p-5 shadow-sm" style={{ backgroundColor: theme.bgCard }}>
            <h3 className="text-base font-semibold mb-1" style={{ color: theme.text }}>Have a referral code?</h3>
            <p className="text-xs mb-4" style={{ color: theme.textMuted }}>Enter your friend&#39;s code to earn bonus points</p>
            <div className="flex gap-2">
              <input
                type="text"
                value={referralCode}
                onChange={(e) => setReferralCode(e.target.value.toUpperCase())}
                placeholder="Enter code"
                className="flex-1 px-4 py-3 text-sm border-2 rounded-xl outline-none uppercase tracking-wider font-medium"
                style={{ backgroundColor: theme.inputBg, color: theme.text, borderColor: theme.border }}
              />
              <button onClick={handleApply} className="px-5 py-3 text-white rounded-xl border-none cursor-pointer text-sm font-semibold transition-colors" style={{ backgroundColor: theme.brand }}>
                Apply
              </button>
            </div>
            {msg && <p className="text-xs mt-2 text-center" style={{ color: theme.brand }}>{msg}</p>}
          </div>
        )}
        {profile.referredBy && (
          <div className="border rounded-2xl p-4 text-center" style={{ backgroundColor: isDark ? theme.bgCard : '#f0fdf4', borderColor: isDark ? theme.border : '#bbf7d0' }}>
            <Check size={24} className="mx-auto mb-2" style={{ color: theme.success }} />
            <p className="text-sm font-medium" style={{ color: isDark ? theme.success : '#15803d' }}>Referral code applied!</p>
            <p className="text-xs" style={{ color: isDark ? theme.textMuted : '#22c55e' }}>Code: {profile.referredBy}</p>
          </div>
        )}

        {/* How It Works */}
        <div className="mt-6">
          <h3 className="text-sm font-semibold mb-3" style={{ color: theme.textSecondary }}>How it works</h3>
          <div className="space-y-3">
            {[
              { step: '1', title: 'Share your code', desc: 'Send your referral code to friends' },
              { step: '2', title: 'Friend signs up', desc: 'They enter your code during registration' },
              { step: '3', title: 'Both earn rewards', desc: 'You get 150 pts, they get 100 pts!' },
            ].map(({ step, title, desc }) => (
              <div key={step} className="flex items-start gap-3 rounded-xl p-3 shadow-sm" style={{ backgroundColor: theme.bgCard }}>
                <div className="w-8 h-8 rounded-full text-white flex items-center justify-center text-sm font-bold flex-shrink-0" style={{ backgroundColor: theme.brand }}>{step}</div>
                <div>
                  <p className="text-sm font-medium" style={{ color: theme.text }}>{title}</p>
                  <p className="text-xs" style={{ color: theme.textMuted }}>{desc}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </main>
    </div>
  );
}
