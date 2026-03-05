import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { api } from '../utils/api';
import { ArrowLeft, Star, Gift, Settings, Info, LogOut, QrCode, Copy, Check } from 'lucide-react';

export default function Profile() {
  const navigate = useNavigate();
  const { phone, logout, user, setUser } = useAuth();
  const [profile, setProfile] = useState(null);
  const [referralCode, setReferralCode] = useState('');
  const [copied, setCopied] = useState(false);

  useEffect(() => {
    if (!phone) {
      navigate('/login');
      return;
    }
    api.getProfile(phone).then((data) => {
      setProfile(data);
      if (data && !user) {
        setUser(data);
      }
    }).catch(() => navigate('/login'));
  }, [phone, navigate, user, setUser]);

  const handleLogout = () => {
    logout();
    navigate('/');
  };

  const handleCopyUpi = (upiId) => {
    navigator.clipboard.writeText(upiId);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  if (!profile) {
    return (
      <div className="min-h-screen gradient-warm flex items-center justify-center">
        <div className="animate-spin w-8 h-8 border-3 border-[#f65e1d] border-t-transparent rounded-full" />
      </div>
    );
  }

  const displayName = profile.name || profile.displayName || 'User';
  const upiIds = Array.isArray(profile.upi_id) ? profile.upi_id : [profile.upi_id].filter(Boolean);

  return (
    <div className="min-h-screen gradient-warm px-4 py-4 animate-fadeIn">
      {/* Header */}
      <div className="flex items-center justify-between p-4 bg-gradient-to-r from-orange-50 to-orange-100 rounded-2xl shadow-md mb-6">
        <div className="flex items-center gap-3">
          <button onClick={() => navigate('/dashboard')} className="bg-transparent border-none cursor-pointer text-[#f65e1d]">
            <ArrowLeft size={22} />
          </button>
          <img src="/photos/my-profile.png" alt="Profile" className="w-11 h-11 rounded-full border-2 border-[#f65e1d] shadow-md" />
          <div>
            <p className="text-xs text-gray-400">Welcome back,</p>
            <h3 className="text-lg font-bold text-[#f65e1d]">{displayName}</h3>
            <span className="inline-flex items-center gap-1 px-2 py-0.5 text-[10px] bg-gradient-to-r from-orange-400 to-orange-500 text-white rounded-full mt-1">
              <Star size={10} /> Verified User
            </span>
          </div>
        </div>
        <button
          onClick={() => navigate('/qr')}
          className="w-10 h-10 border-2 border-[#f65e1d] rounded-full flex items-center justify-center bg-white cursor-pointer"
        >
          <QrCode size={18} className="text-[#f65e1d]" />
        </button>
      </div>

      {/* Details & UPI */}
      <div className="flex gap-3 mb-4 flex-wrap">
        <div className="flex-1 min-w-[180px]">
          <h4 className="text-sm font-semibold text-gray-500 mb-2">Personal Details</h4>
          <div className="bg-white rounded-xl p-4 shadow-sm space-y-2">
            <p className="text-sm"><strong>Name:</strong> {displayName}</p>
            <p className="text-sm"><strong>Phone:</strong> +91-{profile.phone}</p>
            {profile.email && <p className="text-sm"><strong>Email:</strong> {profile.email}</p>}
          </div>
        </div>

        <div className="flex-1 min-w-[120px]">
          <h4 className="text-sm font-semibold text-gray-500 mb-2">UPI IDs</h4>
          <div className="bg-orange-50 border-2 border-dashed border-[#f65e1d] rounded-xl p-4 text-center shadow-sm">
            {upiIds.map((upi, i) => (
              <div key={i} className="flex items-center justify-between gap-1 mb-1">
                <span className="text-sm text-orange-700 font-medium truncate">{upi}</span>
                <button onClick={() => handleCopyUpi(upi)} className="bg-transparent border-none cursor-pointer text-[#f65e1d]">
                  {copied ? <Check size={14} /> : <Copy size={14} />}
                </button>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Referral Strip */}
      <div className="bg-gradient-to-r from-orange-50 to-orange-100 rounded-2xl p-4 flex items-center justify-between gap-3 mb-5 shadow-sm">
        <div>
          <p className="text-sm font-semibold text-[#f65e1d]">Referred by a friend?</p>
          <span className="text-xs text-gray-500">Enter their referral code below</span>
        </div>
        <div className="flex items-center gap-2">
          <input
            type="text"
            value={referralCode}
            onChange={(e) => setReferralCode(e.target.value)}
            placeholder="Code"
            className="w-20 px-2 py-1.5 text-sm border border-[#f65e1d]/30 rounded-lg outline-none focus:border-[#f65e1d] bg-white"
          />
          <button className="px-3 py-1.5 bg-[#f65e1d] text-white text-sm rounded-lg border-none cursor-pointer hover:bg-[#e3571a] transition-colors">
            Apply
          </button>
        </div>
      </div>

      {/* Settings */}
      <div className="flex flex-col gap-3">
        {[
          { icon: Gift, label: 'Referral', color: '#f65e1d' },
          { icon: Settings, label: 'Settings', color: '#f65e1d' },
          { icon: Info, label: 'About GradPay', color: '#f65e1d', onClick: () => navigate('/faqs') },
        ].map(({ icon: Icon, label, color, onClick }) => (
          <button
            key={label}
            onClick={onClick}
            className="flex items-center justify-between px-5 py-4 bg-white/60 border border-[#f65e1d]/20 rounded-2xl shadow-sm hover:bg-orange-50 hover:-translate-y-0.5 transition-all cursor-pointer backdrop-blur-sm"
          >
            <div className="flex items-center gap-3">
              <Icon size={20} style={{ color }} />
              <span className="text-base font-medium text-gray-700">{label}</span>
            </div>
            <span className="text-xl text-gray-400 font-bold">&rsaquo;</span>
          </button>
        ))}

        {/* Logout */}
        <button
          onClick={handleLogout}
          className="flex items-center justify-between px-5 py-4 bg-white/60 border border-red-200 rounded-2xl shadow-sm hover:bg-red-50 transition-all cursor-pointer"
        >
          <div className="flex items-center gap-3">
            <LogOut size={20} className="text-red-500" />
            <span className="text-base font-bold text-red-500">Log Out</span>
          </div>
          <span className="text-xl text-red-400 font-bold">&rsaquo;</span>
        </button>
      </div>
    </div>
  );
}
