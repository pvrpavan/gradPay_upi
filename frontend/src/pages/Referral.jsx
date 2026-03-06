import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { api } from '../utils/api';
import TopBar from '../components/TopBar';
import { Gift, Copy, Check, Users, Star, Share2 } from 'lucide-react';

export default function Referral() {
  const navigate = useNavigate();
  const { phone } = useAuth();
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
      <div className="min-h-screen gradient-warm flex items-center justify-center">
        <div className="animate-spin w-8 h-8 border-3 border-[#f65e1d] border-t-transparent rounded-full" />
      </div>
    );
  }

  return (
    <div className="min-h-screen gradient-warm">
      <TopBar title="Referral Program" />
      <main className="px-4 pt-5 pb-8 animate-fadeIn">
        {/* Hero */}
        <div className="bg-gradient-to-br from-[#f65e1d] to-[#ff9800] rounded-3xl p-6 text-white mb-6 shadow-xl relative overflow-hidden">
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
          <div className="bg-white rounded-2xl p-4 shadow-sm text-center">
            <Star size={24} className="text-yellow-500 mx-auto mb-2" />
            <p className="text-2xl font-bold text-gray-800">{profile.rewardPoints || 0}</p>
            <p className="text-xs text-gray-400">Total Points</p>
          </div>
          <div className="bg-white rounded-2xl p-4 shadow-sm text-center">
            <Users size={24} className="text-[#f65e1d] mx-auto mb-2" />
            <p className="text-2xl font-bold text-gray-800">{profile.referredBy ? 1 : 0}</p>
            <p className="text-xs text-gray-400">Referrals Used</p>
          </div>
        </div>

        {/* Share */}
        <button
          onClick={handleCopy}
          className="w-full py-3.5 bg-[#f65e1d] text-white rounded-2xl border-none cursor-pointer text-base font-semibold flex items-center justify-center gap-2 shadow-lg mb-6 hover:bg-[#e5531a] transition-colors"
        >
          <Share2 size={18} /> Share Referral Code
        </button>

        {/* Apply Referral */}
        {!profile.referredBy && (
          <div className="bg-white rounded-2xl p-5 shadow-sm">
            <h3 className="text-base font-semibold text-gray-800 mb-1">Have a referral code?</h3>
            <p className="text-xs text-gray-400 mb-4">Enter your friend's code to earn bonus points</p>
            <div className="flex gap-2">
              <input
                type="text"
                value={referralCode}
                onChange={(e) => setReferralCode(e.target.value.toUpperCase())}
                placeholder="Enter code"
                className="flex-1 px-4 py-3 text-sm border-2 border-gray-200 rounded-xl outline-none focus:border-[#f65e1d] uppercase tracking-wider font-medium"
              />
              <button onClick={handleApply} className="px-5 py-3 bg-[#f65e1d] text-white rounded-xl border-none cursor-pointer text-sm font-semibold hover:bg-[#e5531a] transition-colors">
                Apply
              </button>
            </div>
            {msg && <p className="text-xs mt-2 text-center text-blue-600">{msg}</p>}
          </div>
        )}
        {profile.referredBy && (
          <div className="bg-green-50 border border-green-200 rounded-2xl p-4 text-center">
            <Check size={24} className="text-green-500 mx-auto mb-2" />
            <p className="text-sm font-medium text-green-700">Referral code applied!</p>
            <p className="text-xs text-green-500">Code: {profile.referredBy}</p>
          </div>
        )}

        {/* How It Works */}
        <div className="mt-6">
          <h3 className="text-sm font-semibold text-gray-500 mb-3">How it works</h3>
          <div className="space-y-3">
            {[
              { step: '1', title: 'Share your code', desc: 'Send your referral code to friends' },
              { step: '2', title: 'Friend signs up', desc: 'They enter your code during registration' },
              { step: '3', title: 'Both earn rewards', desc: 'You get 150 pts, they get 100 pts!' },
            ].map(({ step, title, desc }) => (
              <div key={step} className="flex items-start gap-3 bg-white rounded-xl p-3 shadow-sm">
                <div className="w-8 h-8 rounded-full bg-[#f65e1d] text-white flex items-center justify-center text-sm font-bold flex-shrink-0">{step}</div>
                <div>
                  <p className="text-sm font-medium text-gray-800">{title}</p>
                  <p className="text-xs text-gray-400">{desc}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </main>
    </div>
  );
}
