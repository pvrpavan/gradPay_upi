import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { useTheme } from '../context/ThemeContext';
import { api } from '../utils/api';
import { ArrowLeft, Star, Gift, Settings, Info, LogOut, QrCode, Copy, Check, Camera, Edit3, User, Mail, MapPin, Briefcase, Calendar, ChevronRight, Loader2 } from 'lucide-react';
import Avatar from '../components/Avatar';

function QrModal({ upiId, onClose, theme }) {
  const [qrData, setQrData] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (upiId) {
      api.getQRCode(upiId).then((data) => {
        setQrData(data);
        setLoading(false);
      }).catch(() => setLoading(false));
    }
  }, [upiId]);

  return (
    <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center px-4" onClick={onClose}>
      <div className="rounded-2xl p-6 text-center w-full max-w-xs animate-bounce-in" style={{ backgroundColor: theme.bgCard }} onClick={(e) => e.stopPropagation()}>
        <h3 className="text-lg font-bold mb-3" style={{ color: theme.text }}>Your QR Code</h3>
        {loading ? (
          <div className="w-48 h-48 mx-auto flex items-center justify-center">
            <Loader2 size={32} className="animate-spin" style={{ color: theme.brand }} />
          </div>
        ) : qrData?.qrCode ? (
          <img src={qrData.qrCode} alt="QR Code" className="w-48 h-48 mx-auto rounded-xl" />
        ) : (
          <div className="w-48 h-48 mx-auto rounded-xl flex flex-col items-center justify-center gap-2" style={{ backgroundColor: theme.inputBg }}>
            <QrCode size={48} style={{ color: theme.textMuted }} />
            <p className="text-xs" style={{ color: theme.textMuted }}>QR not available</p>
          </div>
        )}
        <p className="text-xs mt-3" style={{ color: theme.textMuted }}>Scan to pay {upiId}</p>
        <button onClick={onClose} className="mt-4 px-6 py-2 text-white rounded-xl border-none cursor-pointer text-sm font-medium" style={{ backgroundColor: theme.brand }}>Close</button>
      </div>
    </div>
  );
}

export default function Profile() {
  const navigate = useNavigate();
  const { phone, logout, user, setUser } = useAuth();
  const { theme } = useTheme();
  const [profile, setProfile] = useState(null);
  const [referralCode, setReferralCode] = useState('');
  const [copied, setCopied] = useState(false);
  const [referralMsg, setReferralMsg] = useState('');
  const [showQr, setShowQr] = useState(false);
  const [showEditProfile, setShowEditProfile] = useState(false);
  const [editForm, setEditForm] = useState({ displayName: '', email: '', dob: '', gender: '', address: '', occupation: '' });
  const [editLoading, setEditLoading] = useState(false);
  const [showPhotoPicker, setShowPhotoPicker] = useState(false);

  useEffect(() => {
    if (!phone) {
      navigate('/login');
      return;
    }
    api.getProfile(phone).then((data) => {
      setProfile(data);
      setEditForm({
        displayName: data.name || data.displayName || '',
        email: data.email || '',
        dob: data.dob || '',
        gender: data.gender || '',
        address: data.address || '',
        occupation: data.occupation || '',
      });
      if (data && !user) {
        setUser(data);
      }
    }).catch(() => navigate('/login'));
  }, [phone, navigate, user, setUser]);

  const handleLogout = () => {
    logout();
    localStorage.clear();
    navigate('/', { replace: true });
    // Prevent going back after logout
    window.history.pushState(null, '', '/');
    window.addEventListener('popstate', () => {
      window.location.replace('/login');
    });
  };

  const handleCopyUpi = (upiId) => {
    navigator.clipboard.writeText(upiId);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const handleApplyReferral = async () => {
    if (!referralCode.trim()) { setReferralMsg('Enter a referral code'); return; }
    try {
      const data = await api.applyReferral(phone, referralCode.trim());
      if (data.error) { setReferralMsg(data.error); }
      else { setReferralMsg(data.message || 'Referral applied!'); }
    } catch { setReferralMsg('Failed to apply referral'); }
  };

  const handleSaveProfile = async () => {
    setEditLoading(true);
    try {
      const data = await api.updateProfile({ phone, ...editForm });
      if (data.user) {
        setProfile((prev) => ({ ...prev, ...data.user, name: data.user.displayName }));
        setShowEditProfile(false);
      }
    } catch { /* ignore */ }
    setEditLoading(false);
  };

  const handleChangePhoto = async (photoUrl) => {
    try {
      const data = await api.updateProfile({ phone, profile_photo_url: photoUrl });
      if (data.user) {
        setProfile((prev) => ({ ...prev, profile_photo_url: photoUrl }));
      }
    } catch { /* ignore */ }
    setShowPhotoPicker(false);
  };

  if (!profile) {
    return (
      <div className="min-h-screen flex items-center justify-center" style={{ background: `linear-gradient(135deg, ${theme.gradientFrom}, ${theme.gradientTo})` }}>
        <div className="animate-spin w-8 h-8 border-3 rounded-full" style={{ borderColor: theme.brand, borderTopColor: 'transparent' }} />
      </div>
    );
  }

  const displayName = profile.name || profile.displayName || 'User';
  const upiIds = Array.isArray(profile.upi_id) ? profile.upi_id : [profile.upi_id].filter(Boolean);
  const profilePhotoSrc = profile.profile_photo_url || '';

  return (
    <div className="min-h-screen px-4 py-4 animate-fadeIn pb-8" style={{ background: `linear-gradient(135deg, ${theme.gradientFrom}, ${theme.gradientTo})` }}>
      {/* Header */}
      <div className="flex items-center justify-between p-4 rounded-2xl shadow-md mb-4" style={{ backgroundColor: theme.bgCard, border: `1px solid ${theme.border}` }}>
        <div className="flex items-center gap-3">
          <button onClick={() => navigate('/dashboard')} className="bg-transparent border-none cursor-pointer" style={{ color: theme.brand }}>
            <ArrowLeft size={22} />
          </button>
          <div className="relative">
            <Avatar name={displayName} photoUrl={profilePhotoSrc} size={48} />
            <button
              onClick={() => setShowPhotoPicker(true)}
              className="absolute -bottom-1 -right-1 w-6 h-6 rounded-full flex items-center justify-center border-2 border-white cursor-pointer"
              style={{ backgroundColor: theme.brand }}
            >
              <Camera size={10} className="text-white" />
            </button>
          </div>
          <div>
            <p className="text-xs" style={{ color: theme.textMuted }}>Welcome back,</p>
            <h3 className="text-lg font-bold" style={{ color: theme.brand }}>{displayName}</h3>
            <span
              className="inline-flex items-center gap-1 px-2 py-0.5 text-[10px] text-white rounded-full mt-1"
              style={{ background: `linear-gradient(135deg, ${theme.brand}, ${theme.brandLight})` }}
            >
              <Star size={10} /> {profile.profileCompleted ? 'Verified User' : 'Complete Profile'}
            </span>
          </div>
        </div>
        <button
          onClick={() => setShowQr(true)}
          className="w-10 h-10 border-2 rounded-full flex items-center justify-center cursor-pointer"
          style={{ borderColor: theme.brand, backgroundColor: theme.bgCard }}
        >
          <QrCode size={18} style={{ color: theme.brand }} />
        </button>
      </div>

      {/* Photo Picker Modal */}
      {showPhotoPicker && (
        <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center px-4" onClick={() => setShowPhotoPicker(false)}>
          <div className="rounded-2xl p-5 w-full max-w-sm animate-slideUp" style={{ backgroundColor: theme.bgCard }} onClick={(e) => e.stopPropagation()}>
            <h3 className="text-lg font-bold mb-4" style={{ color: theme.text }}>Choose Avatar Style</h3>
            <div className="grid grid-cols-3 gap-3">
              {['Alice Johnson', 'Bob Smith', 'Charlie Dev', 'Diana K', 'Eva M', 'Frank W'].map((name, i) => (
                <button
                  key={i}
                  onClick={() => handleChangePhoto(`avatar:${name}`)}
                  className="w-full aspect-square rounded-xl border-2 transition-colors cursor-pointer overflow-hidden flex items-center justify-center"
                  style={{ borderColor: theme.border, backgroundColor: theme.inputBg }}
                >
                  <Avatar name={name} size={48} />
                </button>
              ))}
              <button
                onClick={() => handleChangePhoto('')}
                className="w-full aspect-square rounded-xl border-2 border-dashed transition-colors cursor-pointer flex items-center justify-center"
                style={{ borderColor: theme.textMuted, backgroundColor: theme.inputBg }}
              >
                <span className="text-xs" style={{ color: theme.textMuted }}>Auto</span>
              </button>
            </div>
            <button onClick={() => setShowPhotoPicker(false)} className="w-full mt-4 py-2 rounded-xl border-none cursor-pointer text-sm font-medium" style={{ backgroundColor: theme.inputBg, color: theme.textSecondary }}>Cancel</button>
          </div>
        </div>
      )}

      {/* QR Code Modal */}
      {showQr && (
        <QrModal upiId={upiIds[0]} onClose={() => setShowQr(false)} theme={theme} />
      )}

      {/* Edit Profile Modal */}
      {showEditProfile && (
        <div className="fixed inset-0 bg-black/50 z-50 flex items-end justify-center" onClick={() => setShowEditProfile(false)}>
          <div className="rounded-t-3xl p-5 w-full max-w-[430px] animate-slideUp max-h-[80vh] overflow-y-auto" style={{ backgroundColor: theme.bgCard }} onClick={(e) => e.stopPropagation()}>
            <h3 className="text-lg font-bold mb-4" style={{ color: theme.text }}>Edit Profile</h3>
            <div className="space-y-3">
              {[
                { key: 'displayName', label: 'Display Name', icon: User, type: 'text' },
                { key: 'email', label: 'Email', icon: Mail, type: 'email' },
                { key: 'dob', label: 'Date of Birth', icon: Calendar, type: 'date' },
                { key: 'gender', label: 'Gender', icon: User, type: 'select', options: ['Male', 'Female', 'Other'] },
                { key: 'address', label: 'Address', icon: MapPin, type: 'text' },
                { key: 'occupation', label: 'Occupation', icon: Briefcase, type: 'text' },
              ].map(({ key, label, icon: Icon, type, options }) => (
                <div key={key}>
                  <label className="text-xs font-medium mb-1 flex items-center gap-1" style={{ color: theme.textSecondary }}><Icon size={12} /> {label}</label>
                  {type === 'select' ? (
                    <select
                      value={editForm[key]}
                      onChange={(e) => setEditForm({ ...editForm, [key]: e.target.value })}
                      className="w-full px-3 py-2.5 text-sm border rounded-xl outline-none"
                      style={{ backgroundColor: theme.inputBg, color: theme.text, borderColor: theme.border }}
                    >
                      <option value="">Select {label}</option>
                      {options.map((o) => <option key={o} value={o}>{o}</option>)}
                    </select>
                  ) : (
                    <input
                      type={type}
                      value={editForm[key]}
                      onChange={(e) => setEditForm({ ...editForm, [key]: e.target.value })}
                      placeholder={`Enter ${label.toLowerCase()}`}
                      className="w-full px-3 py-2.5 text-sm border rounded-xl outline-none"
                      style={{ backgroundColor: theme.inputBg, color: theme.text, borderColor: theme.border }}
                    />
                  )}
                </div>
              ))}
            </div>
            <div className="flex gap-2 mt-4">
              <button onClick={() => setShowEditProfile(false)} className="flex-1 py-2.5 rounded-xl border-none cursor-pointer text-sm font-medium" style={{ backgroundColor: theme.inputBg, color: theme.textSecondary }}>Cancel</button>
              <button onClick={handleSaveProfile} disabled={editLoading} className="flex-1 py-2.5 text-white rounded-xl border-none cursor-pointer text-sm font-medium disabled:opacity-60" style={{ backgroundColor: theme.brand }}>
                {editLoading ? 'Saving...' : 'Save Changes'}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Reward Points */}
      <div className="rounded-2xl p-4 mb-4 text-white shadow-lg" style={{ background: `linear-gradient(135deg, ${theme.brand}, ${theme.brandLight})` }}>
        <div className="flex items-center justify-between">
          <div>
            <p className="text-xs text-white/70">Reward Points</p>
            <p className="text-2xl font-bold">{profile.rewardPoints || 0} pts</p>
          </div>
          <Star size={32} className="text-white/30" />
        </div>
      </div>

      {/* Details & UPI */}
      <div className="flex gap-3 mb-4 flex-wrap">
        <div className="flex-1 min-w-[180px]">
          <div className="flex items-center justify-between mb-2">
            <h4 className="text-sm font-semibold" style={{ color: theme.textSecondary }}>Personal Details</h4>
            <button onClick={() => setShowEditProfile(true)} className="text-xs flex items-center gap-1 bg-transparent border-none cursor-pointer" style={{ color: theme.brand }}>
              <Edit3 size={12} /> Edit
            </button>
          </div>
          <div className="rounded-xl p-4 shadow-sm space-y-2" style={{ backgroundColor: theme.bgCard }}>
            <p className="text-sm" style={{ color: theme.text }}><strong>Name:</strong> {displayName}</p>
            <p className="text-sm" style={{ color: theme.text }}><strong>Phone:</strong> {profile.countryCode || '+91'}-{profile.phone}</p>
            {profile.email && <p className="text-sm" style={{ color: theme.text }}><strong>Email:</strong> {profile.email}</p>}
            {profile.dob && <p className="text-sm" style={{ color: theme.text }}><strong>DOB:</strong> {profile.dob}</p>}
            {profile.gender && <p className="text-sm" style={{ color: theme.text }}><strong>Gender:</strong> {profile.gender}</p>}
            {profile.address && <p className="text-sm" style={{ color: theme.text }}><strong>Address:</strong> {profile.address}</p>}
            {profile.occupation && <p className="text-sm" style={{ color: theme.text }}><strong>Occupation:</strong> {profile.occupation}</p>}
            {!profile.profileCompleted && (
              <button onClick={() => setShowEditProfile(true)} className="text-xs font-medium underline bg-transparent border-none cursor-pointer mt-1" style={{ color: theme.brand }}>
                Complete your profile for rewards!
              </button>
            )}
          </div>
        </div>

        <div className="flex-1 min-w-[120px]">
          <h4 className="text-sm font-semibold mb-2" style={{ color: theme.textSecondary }}>UPI IDs</h4>
          <div className="border-2 border-dashed rounded-xl p-4 text-center shadow-sm" style={{ backgroundColor: theme.brandBg, borderColor: theme.brand }}>
            {upiIds.map((upi, i) => (
              <div key={i} className="flex items-center justify-between gap-1 mb-1">
                <span className="text-sm font-medium truncate" style={{ color: theme.brand }}>{upi}</span>
                <button onClick={() => handleCopyUpi(upi)} className="bg-transparent border-none cursor-pointer" style={{ color: theme.brand }}>
                  {copied ? <Check size={14} /> : <Copy size={14} />}
                </button>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Referral Strip */}
      <div className="rounded-2xl p-4 mb-4 shadow-sm" style={{ backgroundColor: theme.bgCard, border: `1px solid ${theme.border}` }}>
        <div className="flex items-center justify-between gap-3 mb-2">
          <div>
            <p className="text-sm font-semibold" style={{ color: theme.brand }}>Your Referral Code</p>
            <p className="text-lg font-bold" style={{ color: theme.text }}>{profile.referralCode || 'N/A'}</p>
          </div>
          <button
            onClick={() => { navigator.clipboard.writeText(profile.referralCode || ''); setCopied(true); setTimeout(() => setCopied(false), 2000); }}
            className="px-3 py-1.5 text-white text-sm rounded-lg border-none cursor-pointer"
            style={{ backgroundColor: theme.brand }}
          >
            {copied ? 'Copied!' : 'Copy'}
          </button>
        </div>
        {!profile.referredBy && (
          <div className="flex items-center gap-2 mt-2 pt-2" style={{ borderTop: `1px solid ${theme.border}` }}>
            <input
              type="text"
              value={referralCode}
              onChange={(e) => setReferralCode(e.target.value)}
              placeholder="Enter friend's code"
              className="flex-1 px-3 py-2 text-sm border rounded-lg outline-none"
              style={{ backgroundColor: theme.inputBg, color: theme.text, borderColor: theme.border }}
            />
            <button onClick={handleApplyReferral} className="px-4 py-2 text-white text-sm rounded-lg border-none cursor-pointer font-medium" style={{ backgroundColor: theme.brand }}>
              Apply
            </button>
          </div>
        )}
        {profile.referredBy && <p className="text-xs text-green-600 mt-1">Referred by: {profile.referredBy}</p>}
        {referralMsg && <p className="text-xs text-blue-600 mt-1">{referralMsg}</p>}
      </div>

      {/* Menu Items */}
      <div className="flex flex-col gap-3">
        {[
          { icon: Gift, label: 'Referral Program', onClick: () => navigate('/referral') },
          { icon: Settings, label: 'Settings', onClick: () => navigate('/settings') },
          { icon: Info, label: 'About GradPay', onClick: () => navigate('/faqs') },
        ].map(({ icon: Icon, label, onClick }) => (
          <button
            key={label}
            onClick={onClick}
            className="flex items-center justify-between px-5 py-4 rounded-2xl shadow-sm hover:-translate-y-0.5 transition-all cursor-pointer"
            style={{ backgroundColor: theme.bgCard, border: `1px solid ${theme.border}` }}
          >
            <div className="flex items-center gap-3">
              <Icon size={20} style={{ color: theme.brand }} />
              <span className="text-base font-medium" style={{ color: theme.text }}>{label}</span>
            </div>
            <ChevronRight size={18} style={{ color: theme.textMuted }} />
          </button>
        ))}

        {/* Logout */}
        <button
          onClick={handleLogout}
          className="flex items-center justify-between px-5 py-4 rounded-2xl shadow-sm hover:bg-red-50 transition-all cursor-pointer"
          style={{ backgroundColor: theme.bgCard, border: '1px solid #fca5a5' }}
        >
          <div className="flex items-center gap-3">
            <LogOut size={20} className="text-red-500" />
            <span className="text-base font-bold text-red-500">Log Out</span>
          </div>
          <ChevronRight size={18} className="text-red-400" />
        </button>
      </div>
    </div>
  );
}
