import { useState, useRef, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { ArrowLeft, Phone, ShieldCheck, Loader2, Globe, Lock, Sparkles, Users, Zap, CreditCard, Award } from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import { useTheme } from '../context/ThemeContext';
import { api } from '../utils/api';

const COUNTRIES = [
  { code: '+91', name: 'India', flag: '\u{1F1EE}\u{1F1F3}', maxLen: 10 },
  { code: '+1', name: 'USA', flag: '\u{1F1FA}\u{1F1F8}', maxLen: 10 },
  { code: '+44', name: 'UK', flag: '\u{1F1EC}\u{1F1E7}', maxLen: 11 },
  { code: '+61', name: 'Australia', flag: '\u{1F1E6}\u{1F1FA}', maxLen: 9 },
  { code: '+81', name: 'Japan', flag: '\u{1F1EF}\u{1F1F5}', maxLen: 11 },
  { code: '+49', name: 'Germany', flag: '\u{1F1E9}\u{1F1EA}', maxLen: 12 },
  { code: '+33', name: 'France', flag: '\u{1F1EB}\u{1F1F7}', maxLen: 10 },
  { code: '+971', name: 'UAE', flag: '\u{1F1E6}\u{1F1EA}', maxLen: 9 },
  { code: '+65', name: 'Singapore', flag: '\u{1F1F8}\u{1F1EC}', maxLen: 8 },
  { code: '+86', name: 'China', flag: '\u{1F1E8}\u{1F1F3}', maxLen: 11 },
  { code: '+82', name: 'South Korea', flag: '\u{1F1F0}\u{1F1F7}', maxLen: 11 },
  { code: '+55', name: 'Brazil', flag: '\u{1F1E7}\u{1F1F7}', maxLen: 11 },
  { code: '+7', name: 'Russia', flag: '\u{1F1F7}\u{1F1FA}', maxLen: 10 },
  { code: '+27', name: 'South Africa', flag: '\u{1F1FF}\u{1F1E6}', maxLen: 9 },
  { code: '+234', name: 'Nigeria', flag: '\u{1F1F3}\u{1F1EC}', maxLen: 10 },
  { code: '+62', name: 'Indonesia', flag: '\u{1F1EE}\u{1F1E9}', maxLen: 12 },
  { code: '+60', name: 'Malaysia', flag: '\u{1F1F2}\u{1F1FE}', maxLen: 10 },
  { code: '+66', name: 'Thailand', flag: '\u{1F1F9}\u{1F1ED}', maxLen: 9 },
  { code: '+39', name: 'Italy', flag: '\u{1F1EE}\u{1F1F9}', maxLen: 10 },
  { code: '+34', name: 'Spain', flag: '\u{1F1EA}\u{1F1F8}', maxLen: 9 },
];

export default function Login() {
  const navigate = useNavigate();
  const { login } = useAuth();
  const { theme, isDark } = useTheme();
  const [phoneNumber, setPhoneNumber] = useState('');
  const [selectedCountry, setSelectedCountry] = useState(COUNTRIES[0]);
  const [showCountryPicker, setShowCountryPicker] = useState(false);
  const [countrySearch, setCountrySearch] = useState('');
  const [otpSent, setOtpSent] = useState(false);
  const [otp, setOtp] = useState(['', '', '', '', '', '']);
  const [message, setMessage] = useState({ text: '', color: '' });
  const [loading, setLoading] = useState(false);
  const [countdown, setCountdown] = useState(0);
  const [backendOtp, setBackendOtp] = useState('');
  const [showAutoFillPrompt, setShowAutoFillPrompt] = useState(false);
  const otpRefs = useRef([]);

  const filteredCountries = countrySearch
    ? COUNTRIES.filter((c) => c.name.toLowerCase().includes(countrySearch.toLowerCase()) || c.code.includes(countrySearch))
    : COUNTRIES;

  useEffect(() => {
    if (countdown > 0) {
      const timer = setTimeout(() => setCountdown(countdown - 1), 1000);
      return () => clearTimeout(timer);
    }
  }, [countdown]);

  const handleSendOtp = async () => {
    if (!phoneNumber || phoneNumber.length < selectedCountry.maxLen - 2) {
      setMessage({ text: `Please enter a valid ${selectedCountry.maxLen}-digit phone number.`, color: theme.danger });
      return;
    }
    setLoading(true);
    try {
      const data = await api.sendOtp(phoneNumber);
      if (data.otp) {
        setOtpSent(true);
        setMessage({ text: `OTP sent to ${selectedCountry.code} ${phoneNumber}`, color: theme.brand });
        setCountdown(30);
        // Store OTP from backend but don't auto-fill immediately
        setBackendOtp(data.otp.toString());
        // Show auto-fill prompt after a 2.5 second delay to simulate real OTP delivery
        setTimeout(() => {
          setShowAutoFillPrompt(true);
        }, 2500);
      } else {
        setMessage({ text: data.error || 'Failed to send OTP.', color: theme.danger });
      }
    } catch {
      setMessage({ text: 'Error sending OTP. Check if backend is running.', color: theme.danger });
    }
    setLoading(false);
  };

  const handleAutoFillOtp = () => {
    if (backendOtp) {
      const otpDigits = backendOtp.split('');
      setOtp(otpDigits);
      setShowAutoFillPrompt(false);
      setMessage({ text: 'OTP auto-filled from server', color: theme.success });
    }
  };

  const handleDeclineAutoFill = () => {
    setShowAutoFillPrompt(false);
    setMessage({ text: 'Enter OTP manually', color: theme.textMuted });
    otpRefs.current[0]?.focus();
  };

  const handleOtpChange = (index, value) => {
    if (value.length > 1) return;
    const newOtp = [...otp];
    newOtp[index] = value;
    setOtp(newOtp);

    if (value && index < 5) {
      otpRefs.current[index + 1]?.focus();
    }
  };

  const handleOtpKeyDown = (index, e) => {
    if (e.key === 'Backspace' && !otp[index] && index > 0) {
      otpRefs.current[index - 1]?.focus();
    }
  };

  const handleVerifyOtp = async () => {
    const enteredOtp = otp.join('');
    if (enteredOtp.length < 6) {
      setMessage({ text: 'Please enter the full 6-digit OTP.', color: theme.danger });
      return;
    }
    setLoading(true);
    try {
      const data = await api.verifyOtp(phoneNumber, enteredOtp, selectedCountry.code);
      if (data.status === 200 || data.status === 201) {
        setMessage({ text: 'OTP Verified Successfully!', color: theme.success });
        const token = data.token || 'demo-token';
        login(data.phone || phoneNumber, token, data.user);

        if (data.isNewUser) {
          navigate(`/create-account?phone=${data.phone || phoneNumber}`);
        } else {
          navigate('/dashboard', { replace: true });
        }
      } else {
        setMessage({ text: data.message || 'Incorrect OTP. Try again.', color: theme.danger });
      }
    } catch {
      setMessage({ text: 'Error verifying OTP. Please try again.', color: theme.danger });
    }
    setLoading(false);
  };

  const isOtpComplete = otp.every((d) => d !== '');

  return (
    <div className="min-h-screen flex flex-col items-center px-6 py-6 animate-fadeIn overflow-y-auto" style={{ background: `linear-gradient(135deg, ${theme.gradientFrom}, ${theme.gradientTo})` }}>
      {/* Animated background circles */}
      <div className="fixed top-0 left-0 w-full h-full pointer-events-none overflow-hidden -z-10">
        <div className="absolute -top-20 -right-20 w-64 h-64 rounded-full animate-float" style={{ backgroundColor: `${theme.brand}0D` }} />
        <div className="absolute top-1/3 -left-16 w-48 h-48 rounded-full animate-float-delayed" style={{ backgroundColor: `${theme.brandLight}0D` }} />
        <div className="absolute bottom-20 right-10 w-32 h-32 rounded-full animate-float" style={{ backgroundColor: `${theme.brand}0D` }} />
      </div>

      {/* Logo */}
      <div className="flex items-center gap-2 mb-2 animate-flip-in">
        <div className="w-14 h-14 rounded-2xl flex items-center justify-center shadow-lg animate-3d-float animate-glow-pulse" style={{ background: `linear-gradient(135deg, ${theme.brand}, ${theme.brandLight})` }}>
          <span className="text-white text-2xl font-bold">G</span>
        </div>
        <div>
          <h1 className="text-2xl font-bold" style={{ color: theme.text }}>
            <span style={{ color: theme.brand }}>Gradious </span>Pay
          </h1>
          <p className="text-[10px] -mt-0.5" style={{ color: theme.textMuted }}>Your Smart Payment Partner</p>
        </div>
      </div>

      {/* Tagline */}
      <p className="text-xs mb-3 flex items-center gap-1 animate-wave" style={{ color: theme.textMuted }}>
        <Lock size={12} /> Secure & Fast UPI Payments
      </p>

      {/* Trust Badges */}
      <div className="flex items-center gap-3 mb-4">
        <div className="flex items-center gap-1 px-3 py-1.5 rounded-full shadow-sm" style={{ backgroundColor: theme.bgGlass }}>
          <Users size={12} style={{ color: theme.brand }} />
          <span className="text-[10px] font-medium" style={{ color: theme.textSecondary }}>10M+ Users</span>
        </div>
        <div className="flex items-center gap-1 px-3 py-1.5 rounded-full shadow-sm" style={{ backgroundColor: theme.bgGlass }}>
          <Zap size={12} style={{ color: theme.success }} />
          <span className="text-[10px] font-medium" style={{ color: theme.textSecondary }}>Instant Transfer</span>
        </div>
        <div className="flex items-center gap-1 px-3 py-1.5 rounded-full shadow-sm" style={{ backgroundColor: theme.bgGlass }}>
          <Award size={12} style={{ color: theme.warning }} />
          <span className="text-[10px] font-medium" style={{ color: theme.textSecondary }}>Earn Rewards</span>
        </div>
      </div>

      {/* Card */}
      <div className="w-full max-w-sm backdrop-blur-sm rounded-3xl shadow-xl p-6 animate-slideUp animate-tilt-3d" style={{ backgroundColor: isDark ? theme.bgCard : 'rgba(255,255,255,0.8)', animationIterationCount: 1, animationDuration: '0.6s' }}>
        <button
          onClick={() => navigate('/')}
          className="flex items-center gap-1 mb-3 bg-transparent border-none cursor-pointer text-sm"
          style={{ color: theme.textSecondary }}
        >
          <ArrowLeft size={18} /> Back
        </button>

        <h2 className="text-xl font-bold mb-1" style={{ color: theme.text }}>Welcome Back!</h2>
        <p className="text-sm mb-1" style={{ color: theme.textMuted }}>Register or Login to your account</p>
        <p className="text-xs mb-5" style={{ color: theme.textMuted }}>Join millions of users making instant, secure payments across the globe</p>

        {/* Country Selector */}
        <div className="mb-3">
          <label className="text-xs font-medium mb-1 block" style={{ color: theme.textSecondary }}>Select Country</label>
          <button
            onClick={() => setShowCountryPicker(!showCountryPicker)}
            className="w-full flex items-center justify-between rounded-xl px-4 py-3 border-2 transition-colors cursor-pointer"
            style={{ backgroundColor: theme.inputBg, borderColor: theme.borderLight }}
          >
            <div className="flex items-center gap-2">
              <Globe size={16} style={{ color: theme.brand }} />
              <span className="text-lg">{selectedCountry.flag}</span>
              <span className="text-sm font-medium" style={{ color: theme.text }}>{selectedCountry.name}</span>
              <span className="text-sm" style={{ color: theme.textMuted }}>({selectedCountry.code})</span>
            </div>
            <span className="text-xs" style={{ color: theme.textMuted }}>{showCountryPicker ? '\u25B2' : '\u25BC'}</span>
          </button>

          {showCountryPicker && (
            <div className="mt-1 rounded-xl shadow-lg border z-10 relative" style={{ backgroundColor: theme.bgCard, borderColor: theme.borderLight }}>
              <div className="p-2" style={{ borderBottom: `1px solid ${theme.borderLight}` }}>
                <input
                  type="text"
                  placeholder="Search country..."
                  value={countrySearch}
                  onChange={(e) => setCountrySearch(e.target.value)}
                  className="w-full px-3 py-2 text-sm border rounded-lg outline-none"
                  style={{ backgroundColor: theme.inputBg, color: theme.text, borderColor: theme.border }}
                />
              </div>
              <div className="max-h-48 overflow-y-auto">
                {filteredCountries.map((country) => (
                  <button
                    key={country.code}
                    onClick={() => { setSelectedCountry(country); setShowCountryPicker(false); setPhoneNumber(''); setCountrySearch(''); }}
                    className="w-full flex items-center gap-2 px-4 py-2.5 transition-colors cursor-pointer border-none text-left"
                    style={{ backgroundColor: selectedCountry.code === country.code ? (isDark ? theme.bgSecondary : theme.brandBg) : 'transparent' }}
                  >
                    <span className="text-lg">{country.flag}</span>
                    <span className="text-sm" style={{ color: theme.text }}>{country.name}</span>
                    <span className="text-xs ml-auto" style={{ color: theme.textMuted }}>{country.code}</span>
                  </button>
                ))}
                {filteredCountries.length === 0 && (
                  <p className="text-xs text-center py-3" style={{ color: theme.textMuted }}>No countries found</p>
                )}
              </div>
            </div>
          )}
        </div>

        {/* Phone Input */}
        <div className="flex items-center gap-3 rounded-xl px-4 py-3 mb-4 border-2 transition-colors" style={{ backgroundColor: theme.inputBg, borderColor: theme.borderLight }}>
          <Phone size={18} style={{ color: theme.brand }} />
          <span className="font-medium text-sm" style={{ color: theme.textSecondary }}>{selectedCountry.code}</span>
          <input
            type="tel"
            maxLength={selectedCountry.maxLen}
            placeholder={`${selectedCountry.maxLen}-digit phone number`}
            value={phoneNumber}
            onChange={(e) => setPhoneNumber(e.target.value.replace(/\D/g, ''))}
            className="flex-1 bg-transparent border-none outline-none text-base"
            style={{ color: theme.text }}
          />
        </div>

        {/* Send OTP Button */}
        {!otpSent ? (
          <button
            onClick={handleSendOtp}
            disabled={loading || phoneNumber.length < selectedCountry.maxLen - 2}
            className="w-full py-3.5 text-white font-semibold rounded-xl shadow-lg transition-all duration-300 flex items-center justify-center gap-2 cursor-pointer disabled:cursor-not-allowed border-none text-base transform hover:scale-[1.02] active:scale-[0.98] disabled:opacity-60"
            style={{ background: `linear-gradient(135deg, ${theme.brand}, ${theme.brandLight})` }}
          >
            {loading ? <Loader2 size={18} className="animate-spin" /> : <ShieldCheck size={18} />}
            Send OTP
          </button>
        ) : (
          <>
            {/* Auto-fill prompt */}
            {showAutoFillPrompt && (
              <div className="border rounded-xl p-4 mb-4 animate-slideUp shadow-sm" style={{ backgroundColor: isDark ? theme.bgSecondary : '#eef2ff', borderColor: isDark ? theme.border : '#c7d2fe' }}>
                <p className="text-sm font-medium mb-2 flex items-center gap-1" style={{ color: isDark ? theme.text : '#4338ca' }}>
                  <Sparkles size={14} style={{ color: isDark ? theme.brand : '#6366f1' }} /> OTP received from server
                </p>
                <p className="text-xs mb-3" style={{ color: isDark ? theme.textSecondary : '#6366f1' }}>We received an OTP from the backend. Would you like to auto-enter it?</p>
                <div className="flex gap-2">
                  <button
                    onClick={handleAutoFillOtp}
                    className="flex-1 py-2.5 text-white text-sm font-semibold rounded-lg border-none cursor-pointer hover:shadow-md transition-all"
                    style={{ background: `linear-gradient(135deg, ${theme.brand}, ${theme.brandLight})` }}
                  >
                    Yes, Auto-enter
                  </button>
                  <button
                    onClick={handleDeclineAutoFill}
                    className="flex-1 py-2.5 text-sm font-semibold rounded-lg border cursor-pointer transition-colors"
                    style={{ backgroundColor: theme.bgCard, color: theme.textSecondary, borderColor: theme.border }}
                  >
                    No, I will enter
                  </button>
                </div>
              </div>
            )}

            {/* OTP Inputs */}
            <div className="flex justify-center gap-2.5 my-4">
              {otp.map((digit, i) => (
                <input
                  key={i}
                  ref={(el) => (otpRefs.current[i] = el)}
                  type="text"
                  maxLength={1}
                  value={digit}
                  onChange={(e) => handleOtpChange(i, e.target.value)}
                  onKeyDown={(e) => handleOtpKeyDown(i, e)}
                  className="w-11 h-13 text-center text-xl font-bold border-2 rounded-xl outline-none transition-all shadow-sm"
                  style={digit ? { borderColor: theme.brand, backgroundColor: isDark ? theme.bgSecondary : theme.brandBg, color: theme.text } : { borderColor: theme.border, backgroundColor: theme.bgCard, color: theme.text }}
                />
              ))}
            </div>

            {/* Verify Button */}
            <button
              onClick={handleVerifyOtp}
              disabled={loading || !isOtpComplete}
              className="w-full py-3.5 text-white font-semibold rounded-xl shadow-lg transition-all duration-300 flex items-center justify-center gap-2 cursor-pointer disabled:cursor-not-allowed border-none text-base transform hover:scale-[1.02] active:scale-[0.98] disabled:opacity-60"
              style={{ background: `linear-gradient(135deg, ${theme.brand}, ${theme.brandLight})` }}
            >
              {loading ? <Loader2 size={18} className="animate-spin" /> : 'Verify OTP'}
            </button>

            {/* Resend */}
            <div className="text-center mt-3">
              {countdown > 0 ? (
                <span className="text-sm" style={{ color: theme.textMuted }}>Resend OTP in <span className="font-semibold" style={{ color: theme.brand }}>{countdown}s</span></span>
              ) : (
                <button
                  onClick={handleSendOtp}
                  className="text-sm font-semibold underline bg-transparent border-none cursor-pointer"
                  style={{ color: theme.brand }}
                >
                  Resend OTP
                </button>
              )}
            </div>
          </>
        )}

        {/* Message */}
        {message.text && (
          <p className="text-center text-sm mt-4 font-medium" style={{ color: message.color }}>{message.text}</p>
        )}
      </div>

      {/* Features Section */}
      <div className="w-full max-w-sm mt-6 grid grid-cols-2 gap-3">
        <div className="backdrop-blur-sm rounded-2xl p-4 shadow-sm card-3d animate-stagger-1" style={{ backgroundColor: theme.bgGlass }}>
          <CreditCard size={20} className="mb-2 animate-wave" style={{ color: theme.brand }} />
          <p className="text-xs font-semibold" style={{ color: theme.text }}>Multiple Payment Modes</p>
          <p className="text-[10px] mt-1" style={{ color: theme.textMuted }}>Bank, UPI, Cards & Wallet</p>
        </div>
        <div className="backdrop-blur-sm rounded-2xl p-4 shadow-sm card-3d animate-stagger-2" style={{ backgroundColor: theme.bgGlass }}>
          <Zap size={20} className="mb-2 animate-wave" style={{ color: theme.success }} />
          <p className="text-xs font-semibold" style={{ color: theme.text }}>Instant Transfers</p>
          <p className="text-[10px] mt-1" style={{ color: theme.textMuted }}>Send money in seconds</p>
        </div>
        <div className="backdrop-blur-sm rounded-2xl p-4 shadow-sm card-3d animate-stagger-3" style={{ backgroundColor: theme.bgGlass }}>
          <ShieldCheck size={20} className="mb-2 animate-wave" style={{ color: isDark ? theme.brand : '#3b82f6' }} />
          <p className="text-xs font-semibold" style={{ color: theme.text }}>Bank Grade Security</p>
          <p className="text-[10px] mt-1" style={{ color: theme.textMuted }}>256-bit encryption always</p>
        </div>
        <div className="backdrop-blur-sm rounded-2xl p-4 shadow-sm card-3d animate-stagger-4" style={{ backgroundColor: theme.bgGlass }}>
          <Award size={20} className="mb-2 animate-wave" style={{ color: theme.warning }} />
          <p className="text-xs font-semibold" style={{ color: theme.text }}>Earn Rewards</p>
          <p className="text-[10px] mt-1" style={{ color: theme.textMuted }}>Get points on every transaction</p>
        </div>
      </div>

      {/* Testimonials */}
      <div className="w-full max-w-sm mt-5 animate-stagger-5">
        <div className="rounded-2xl p-4 shadow-sm" style={{ background: `linear-gradient(135deg, ${theme.brand}1A, ${theme.brandLight}1A)` }}>
          <div className="flex items-center gap-2 mb-2">
            <div className="flex -space-x-2">
              {['bg-blue-400', 'bg-green-400', 'bg-purple-400'].map((bg, i) => (
                <div key={i} className={`w-6 h-6 rounded-full ${bg} border-2 border-white flex items-center justify-center`}>
                  <Users size={10} className="text-white" />
                </div>
              ))}
            </div>
            <span className="text-[10px] font-medium" style={{ color: theme.textSecondary }}>Trusted by 10M+ users</span>
          </div>
          <p className="text-xs italic" style={{ color: theme.textSecondary }}>"GradPay made my daily payments so easy. The instant transfers and rewards are amazing!"</p>
          <p className="text-[10px] mt-1" style={{ color: theme.textMuted }}>- Rahul S., Verified User</p>
        </div>
      </div>

      {/* Bottom Info */}
      <div className="mt-6 text-center pb-6">
        <p className="text-xs" style={{ color: theme.textMuted }}>By continuing, you agree to our</p>
        <p className="text-xs font-medium" style={{ color: theme.brand }}>Terms of Service & Privacy Policy</p>
        <div className="flex items-center justify-center gap-4 mt-4">
          <div className="flex items-center gap-1 text-xs" style={{ color: theme.textMuted }}>
            <Lock size={10} /> 256-bit Encryption
          </div>
          <div className="flex items-center gap-1 text-xs" style={{ color: theme.textMuted }}>
            <ShieldCheck size={10} /> RBI Compliant
          </div>
        </div>
        <p className="text-[10px] mt-3" style={{ color: theme.textMuted }}>Available in 20+ countries worldwide</p>
      </div>
    </div>
  );
}
