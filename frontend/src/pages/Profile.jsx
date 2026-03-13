import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { api } from '../utils/api';
import { ArrowLeft, Star, Gift, Settings, Info, LogOut, QrCode, Copy, Check, Camera, Edit3, User, Mail, MapPin, Briefcase, Calendar, ChevronRight, Loader2 } from 'lucide-react';

function QrModal({ upiId, onClose }) {
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
      <div className="bg-white rounded-2xl p-6 text-center w-full max-w-xs animate-bounce-in" onClick={(e) => e.stopPropagation()}>
        <h3 className="text-lg font-bold text-gray-800 mb-3">Your QR Code</h3>
        {loading ? (
          <div className="w-48 h-48 mx-auto flex items-center justify-center">
            <Loader2 size={32} className="text-[#f65e1d] animate-spin" />
          </div>
        ) : qrData?.qrCode ? (
          <img src={qrData.qrCode} alt="QR Code" className="w-48 h-48 mx-auto rounded-xl" />
        ) : (
          <div className="w-48 h-48 mx-auto bg-gray-100 rounded-xl flex flex-col items-center justify-center gap-2">
            <QrCode size={48} className="text-gray-300" />
            <p className="text-xs text-gray-400">QR not available</p>
          </div>
        )}
        <p className="text-xs text-gray-400 mt-3">Scan to pay {upiId}</p>
        <button onClick={onClose} className="mt-4 px-6 py-2 bg-[#f65e1d] text-white rounded-xl border-none cursor-pointer text-sm font-medium">Close</button>
      </div>
    </div>
  );
}

export default function Profile() {
  const navigate = useNavigate();
  const { phone, logout, user, setUser } = useAuth();
  const [profile, setProfile] = useState(null);
  const [referralCode, setReferralCode] = useState('');
  const [copied, setCopied] = useState(false);
  const [referralMsg, setReferralMsg] = useState('');
  const [showQr, setShowQr] = useState(false);
  const [showEditProfile, setShowEditProfile] = useState(false);
  const [editForm, setEditForm] = useState({ displayName: '', email: '', dob: '', gender: '', address: '', occupation: '' });
  const [editLoading, setEditLoading] = useState(false);
  const [profilePhotos] = useState([
    '/photos/avatar1.png', '/photos/avatar2.png', '/photos/avatar3.png',
    '/photos/avatar4.png', '/photos/avatar5.png', '/photos/avatar6.png',
  ]);
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
      <div className="min-h-screen gradient-warm flex items-center justify-center">
        <div className="animate-spin w-8 h-8 border-3 border-[#f65e1d] border-t-transparent rounded-full" />
      </div>
    );
  }

  const displayName = profile.name || profile.displayName || 'User';
  const upiIds = Array.isArray(profile.upi_id) ? profile.upi_id : [profile.upi_id].filter(Boolean);
  const profilePhotoSrc = profile.profile_photo_url || '/photos/my-profile.png';

  return (
    <div className="min-h-screen gradient-warm px-4 py-4 animate-fadeIn pb-8">
      {/* Header */}
      <div className="flex items-center justify-between p-4 bg-gradient-to-r from-orange-50 to-orange-100 rounded-2xl shadow-md mb-4">
        <div className="flex items-center gap-3">
          <button onClick={() => navigate('/dashboard')} className="bg-transparent border-none cursor-pointer text-[#f65e1d]">
            <ArrowLeft size={22} />
          </button>
          <div className="relative">
            <img src={profilePhotoSrc} alt="Profile" className="w-12 h-12 rounded-full border-2 border-[#f65e1d] shadow-md object-cover" />
            <button
              onClick={() => setShowPhotoPicker(true)}
              className="absolute -bottom-1 -right-1 w-6 h-6 bg-[#f65e1d] rounded-full flex items-center justify-center border-2 border-white cursor-pointer"
            >
              <Camera size={10} className="text-white" />
            </button>
          </div>
          <div>
            <p className="text-xs text-gray-400">Welcome back,</p>
            <h3 className="text-lg font-bold text-[#f65e1d]">{displayName}</h3>
            <span className="inline-flex items-center gap-1 px-2 py-0.5 text-[10px] bg-gradient-to-r from-orange-400 to-orange-500 text-white rounded-full mt-1">
              <Star size={10} /> {profile.profileCompleted ? 'Verified User' : 'Complete Profile'}
            </span>
          </div>
        </div>
        <button
          onClick={() => setShowQr(true)}
          className="w-10 h-10 border-2 border-[#f65e1d] rounded-full flex items-center justify-center bg-white cursor-pointer"
        >
          <QrCode size={18} className="text-[#f65e1d]" />
        </button>
      </div>

      {/* Photo Picker Modal */}
      {showPhotoPicker && (
        <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center px-4" onClick={() => setShowPhotoPicker(false)}>
          <div className="bg-white rounded-2xl p-5 w-full max-w-sm animate-slideUp" onClick={(e) => e.stopPropagation()}>
            <h3 className="text-lg font-bold text-gray-800 mb-4">Choose Profile Photo</h3>
            <div className="grid grid-cols-3 gap-3">
              {profilePhotos.map((photo, i) => (
                <button
                  key={i}
                  onClick={() => handleChangePhoto(photo)}
                  className="w-full aspect-square rounded-xl border-2 border-gray-200 hover:border-[#f65e1d] transition-colors cursor-pointer overflow-hidden bg-orange-50 flex items-center justify-center"
                >
                  <User size={32} className="text-[#f65e1d]" />
                </button>
              ))}
              <button
                onClick={() => handleChangePhoto('')}
                className="w-full aspect-square rounded-xl border-2 border-dashed border-gray-300 hover:border-[#f65e1d] transition-colors cursor-pointer flex items-center justify-center bg-gray-50"
              >
                <span className="text-xs text-gray-400">Default</span>
              </button>
            </div>
            <button onClick={() => setShowPhotoPicker(false)} className="w-full mt-4 py-2 bg-gray-100 text-gray-600 rounded-xl border-none cursor-pointer text-sm font-medium">Cancel</button>
          </div>
        </div>
      )}

      {/* QR Code Modal */}
      {showQr && (
        <QrModal upiId={upiIds[0]} onClose={() => setShowQr(false)} />
      )}

      {/* Edit Profile Modal */}
      {showEditProfile && (
        <div className="fixed inset-0 bg-black/50 z-50 flex items-end justify-center" onClick={() => setShowEditProfile(false)}>
          <div className="bg-white rounded-t-3xl p-5 w-full max-w-[430px] animate-slideUp max-h-[80vh] overflow-y-auto" onClick={(e) => e.stopPropagation()}>
            <h3 className="text-lg font-bold text-gray-800 mb-4">Edit Profile</h3>
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
                  <label className="text-xs font-medium text-gray-500 mb-1 flex items-center gap-1"><Icon size={12} /> {label}</label>
                  {type === 'select' ? (
                    <select
                      value={editForm[key]}
                      onChange={(e) => setEditForm({ ...editForm, [key]: e.target.value })}
                      className="w-full px-3 py-2.5 text-sm border border-gray-200 rounded-xl bg-gray-50 outline-none focus:border-[#f65e1d]"
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
                      className="w-full px-3 py-2.5 text-sm border border-gray-200 rounded-xl bg-gray-50 outline-none focus:border-[#f65e1d]"
                    />
                  )}
                </div>
              ))}
            </div>
            <div className="flex gap-2 mt-4">
              <button onClick={() => setShowEditProfile(false)} className="flex-1 py-2.5 bg-gray-100 text-gray-600 rounded-xl border-none cursor-pointer text-sm font-medium">Cancel</button>
              <button onClick={handleSaveProfile} disabled={editLoading} className="flex-1 py-2.5 bg-[#f65e1d] text-white rounded-xl border-none cursor-pointer text-sm font-medium disabled:opacity-60">
                {editLoading ? 'Saving...' : 'Save Changes'}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Reward Points */}
      <div className="bg-gradient-to-r from-[#f65e1d] to-[#ff9800] rounded-2xl p-4 mb-4 text-white shadow-lg">
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
            <h4 className="text-sm font-semibold text-gray-500">Personal Details</h4>
            <button onClick={() => setShowEditProfile(true)} className="text-xs text-[#f65e1d] flex items-center gap-1 bg-transparent border-none cursor-pointer">
              <Edit3 size={12} /> Edit
            </button>
          </div>
          <div className="bg-white rounded-xl p-4 shadow-sm space-y-2">
            <p className="text-sm"><strong>Name:</strong> {displayName}</p>
            <p className="text-sm"><strong>Phone:</strong> {profile.countryCode || '+91'}-{profile.phone}</p>
            {profile.email && <p className="text-sm"><strong>Email:</strong> {profile.email}</p>}
            {profile.dob && <p className="text-sm"><strong>DOB:</strong> {profile.dob}</p>}
            {profile.gender && <p className="text-sm"><strong>Gender:</strong> {profile.gender}</p>}
            {profile.address && <p className="text-sm"><strong>Address:</strong> {profile.address}</p>}
            {profile.occupation && <p className="text-sm"><strong>Occupation:</strong> {profile.occupation}</p>}
            {!profile.profileCompleted && (
              <button onClick={() => setShowEditProfile(true)} className="text-xs text-[#f65e1d] font-medium underline bg-transparent border-none cursor-pointer mt-1">
                Complete your profile for rewards!
              </button>
            )}
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
      <div className="bg-gradient-to-r from-orange-50 to-orange-100 rounded-2xl p-4 mb-4 shadow-sm">
        <div className="flex items-center justify-between gap-3 mb-2">
          <div>
            <p className="text-sm font-semibold text-[#f65e1d]">Your Referral Code</p>
            <p className="text-lg font-bold text-gray-800">{profile.referralCode || 'N/A'}</p>
          </div>
          <button
            onClick={() => { navigator.clipboard.writeText(profile.referralCode || ''); setCopied(true); setTimeout(() => setCopied(false), 2000); }}
            className="px-3 py-1.5 bg-[#f65e1d] text-white text-sm rounded-lg border-none cursor-pointer"
          >
            {copied ? 'Copied!' : 'Copy'}
          </button>
        </div>
        {!profile.referredBy && (
          <div className="flex items-center gap-2 mt-2 pt-2 border-t border-orange-200">
            <input
              type="text"
              value={referralCode}
              onChange={(e) => setReferralCode(e.target.value)}
              placeholder="Enter friend's code"
              className="flex-1 px-3 py-2 text-sm border border-[#f65e1d]/30 rounded-lg outline-none focus:border-[#f65e1d] bg-white"
            />
            <button onClick={handleApplyReferral} className="px-4 py-2 bg-[#f65e1d] text-white text-sm rounded-lg border-none cursor-pointer hover:bg-[#e3571a] transition-colors font-medium">
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
          { icon: Gift, label: 'Referral Program', color: '#f65e1d', onClick: () => navigate('/referral') },
          { icon: Settings, label: 'Settings', color: '#f65e1d', onClick: () => navigate('/settings') },
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
            <ChevronRight size={18} className="text-gray-400" />
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
          <ChevronRight size={18} className="text-red-400" />
        </button>
      </div>
    </div>
  );
}
