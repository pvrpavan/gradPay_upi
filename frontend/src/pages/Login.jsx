import { useState, useRef, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { ArrowLeft, Phone, ShieldCheck, Loader2, Globe, Lock, Sparkles } from 'lucide-react';
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
  const [smsSent, setSmsSent] = useState(false);
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
        setSmsSent(data.smsSent || false);
        setMessage({
          text: data.smsSent
            ? `OTP sent via SMS to ${selectedCountry.code} ${phoneNumber}`
            : `OTP generated for ${selectedCountry.code} ${phoneNumber}`,
          color: theme.brand,
        });
        setCountdown(30);
        setBackendOtp(data.otp.toString());
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
      setMessage({ text: 'OTP auto-filled', color: theme.success });
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

  const handleGoBack = () => {
    if (otpSent) {
      setOtpSent(false);
      setOtp(['', '', '', '', '', '']);
      setShowAutoFillPrompt(false);
      setMessage({ text: '', color: '' });
    } else {
      navigate('/');
    }
  };

  const isOtpComplete = otp.every((d) => d !== '');

  return (
    <div className="min-h-screen flex flex-col items-center justify-between px-5 py-8 animate-fadeIn" style={{ background: `linear-gradient(160deg, ${theme.gradientFrom}, ${theme.gradientTo})` }}>
      {/* Background decorations */}
      <div className="fixed top-0 left-0 w-full h-full pointer-events-none overflow-hidden -z-10">
        <div className="absolute -top-24 -right-24 w-72 h-72 rounded-full opacity-30 animate-float" style={{ background: `radial-gradient(circle, ${theme.brand}20, transparent)` }} />
        <div className="absolute bottom-1/4 -left-20 w-56 h-56 rounded-full opacity-20 animate-float-delayed" style={{ background: `radial-gradient(circle, ${theme.brandLight}20, transparent)` }} />
      </div>

      {/* Top section */}
      <div className="w-full max-w-sm flex flex-col items-center">
        {/* Logo & Brand */}
        <div className="flex items-center gap-3 mb-8 animate-flip-in">
          <div className="w-12 h-12 rounded-2xl flex items-center justify-center shadow-lg" style={{ background: `linear-gradient(135deg, ${theme.brand}, ${theme.brandLight})` }}>
            <span className="text-white text-xl font-bold">G</span>
          </div>
          <div>
            <h1 className="text-xl font-bold leading-tight" style={{ color: theme.text }}>
              <span style={{ color: theme.brand }}>Gradious</span> Pay
            </h1>
            <p className="text-[10px]" style={{ color: theme.textMuted }}>Secure & Fast UPI Payments</p>
          </div>
        </div>

        {/* Main Card */}
        <div className="w-full backdrop-blur-sm rounded-3xl shadow-xl p-6 animate-slideUp" style={{ backgroundColor: isDark ? theme.bgCard : 'rgba(255,255,255,0.9)' }}>
          {/* Back button & Title */}
          <div className="flex items-center gap-3 mb-5">
            <button
              onClick={handleGoBack}
              className="w-9 h-9 rounded-xl flex items-center justify-center border-none cursor-pointer transition-colors"
              style={{ backgroundColor: theme.inputBg, color: theme.textSecondary }}
            >
              <ArrowLeft size={16} />
            </button>
            <div>
              <h2 className="text-lg font-bold" style={{ color: theme.text }}>
                {otpSent ? 'Verify OTP' : 'Welcome!'}
              </h2>
              <p className="text-xs" style={{ color: theme.textMuted }}>
                {otpSent
                  ? `Code sent to ${selectedCountry.code} ${phoneNumber}`
                  : 'Sign in or create an account'}
              </p>
            </div>
          </div>

          {!otpSent ? (
            <>
              {/* Country Selector */}
              <div className="mb-3">
                <label className="text-xs font-medium mb-1.5 block" style={{ color: theme.textSecondary }}>Country</label>
                <button
                  onClick={() => setShowCountryPicker(!showCountryPicker)}
                  className="w-full flex items-center justify-between rounded-xl px-4 py-3 border transition-colors cursor-pointer"
                  style={{ backgroundColor: theme.inputBg, borderColor: theme.borderLight }}
                >
                  <div className="flex items-center gap-2">
                    <span className="text-lg">{selectedCountry.flag}</span>
                    <span className="text-sm font-medium" style={{ color: theme.text }}>{selectedCountry.name}</span>
                    <span className="text-xs" style={{ color: theme.textMuted }}>({selectedCountry.code})</span>
                  </div>
                  <Globe size={14} style={{ color: theme.textMuted }} />
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
                    <div className="max-h-40 overflow-y-auto">
                      {filteredCountries.map((country) => (
                        <button
                          key={country.code}
                          onClick={() => { setSelectedCountry(country); setShowCountryPicker(false); setPhoneNumber(''); setCountrySearch(''); }}
                          className="w-full flex items-center gap-2 px-4 py-2 transition-colors cursor-pointer border-none text-left"
                          style={{ backgroundColor: selectedCountry.code === country.code ? (isDark ? theme.bgSecondary : theme.brandBg) : 'transparent' }}
                        >
                          <span className="text-base">{country.flag}</span>
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
              <div className="mb-5">
                <label className="text-xs font-medium mb-1.5 block" style={{ color: theme.textSecondary }}>Phone Number</label>
                <div className="flex items-center gap-2 rounded-xl px-4 py-3 border transition-colors" style={{ backgroundColor: theme.inputBg, borderColor: theme.borderLight }}>
                  <Phone size={16} style={{ color: theme.brand }} />
                  <span className="font-medium text-sm" style={{ color: theme.textSecondary }}>{selectedCountry.code}</span>
                  <div className="w-px h-5" style={{ backgroundColor: theme.border }} />
                  <input
                    type="tel"
                    maxLength={selectedCountry.maxLen}
                    placeholder={`Enter ${selectedCountry.maxLen}-digit number`}
                    value={phoneNumber}
                    onChange={(e) => setPhoneNumber(e.target.value.replace(/\D/g, ''))}
                    className="flex-1 bg-transparent border-none outline-none text-base"
                    style={{ color: theme.text }}
                  />
                </div>
              </div>

              {/* Send OTP Button */}
              <button
                onClick={handleSendOtp}
                disabled={loading || phoneNumber.length < selectedCountry.maxLen - 2}
                className="w-full py-3.5 text-white font-semibold rounded-xl shadow-lg transition-all duration-200 flex items-center justify-center gap-2 cursor-pointer disabled:cursor-not-allowed border-none text-base hover:shadow-xl active:scale-[0.98] disabled:opacity-50"
                style={{ background: `linear-gradient(135deg, ${theme.brand}, ${theme.brandLight})` }}
              >
                {loading ? <Loader2 size={18} className="animate-spin" /> : <ShieldCheck size={18} />}
                Send OTP
              </button>
            </>
          ) : (
            <>
              {/* SMS Status Badge */}
              {smsSent && (
                <div className="flex items-center gap-2 px-3 py-2 rounded-lg mb-3" style={{ backgroundColor: isDark ? '#0d2818' : '#ecfdf5', border: `1px solid ${isDark ? '#166534' : '#bbf7d0'}` }}>
                  <ShieldCheck size={14} style={{ color: theme.success }} />
                  <span className="text-xs font-medium" style={{ color: theme.success }}>OTP sent via SMS to your phone</span>
                </div>
              )}

              {/* Auto-fill prompt */}
              {showAutoFillPrompt && (
                <div className="border rounded-xl p-4 mb-4 animate-slideUp" style={{ backgroundColor: isDark ? theme.bgSecondary : '#f0f4ff', borderColor: isDark ? theme.border : '#c7d2fe' }}>
                  <p className="text-sm font-medium mb-2 flex items-center gap-1.5" style={{ color: isDark ? theme.text : '#4338ca' }}>
                    <Sparkles size={14} style={{ color: isDark ? theme.brand : '#6366f1' }} /> OTP received
                  </p>
                  <p className="text-xs mb-3" style={{ color: isDark ? theme.textSecondary : '#6366f1' }}>Auto-fill OTP from the server?</p>
                  <div className="flex gap-2">
                    <button
                      onClick={handleAutoFillOtp}
                      className="flex-1 py-2 text-white text-sm font-semibold rounded-lg border-none cursor-pointer transition-all"
                      style={{ background: `linear-gradient(135deg, ${theme.brand}, ${theme.brandLight})` }}
                    >
                      Auto-fill
                    </button>
                    <button
                      onClick={handleDeclineAutoFill}
                      className="flex-1 py-2 text-sm font-semibold rounded-lg border cursor-pointer transition-colors"
                      style={{ backgroundColor: theme.bgCard, color: theme.textSecondary, borderColor: theme.border }}
                    >
                      Enter manually
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
                    className="w-11 h-12 text-center text-lg font-bold border-2 rounded-xl outline-none transition-all"
                    style={digit ? { borderColor: theme.brand, backgroundColor: isDark ? theme.bgSecondary : theme.brandBg, color: theme.text } : { borderColor: theme.border, backgroundColor: theme.inputBg, color: theme.text }}
                  />
                ))}
              </div>

              {/* Verify Button */}
              <button
                onClick={handleVerifyOtp}
                disabled={loading || !isOtpComplete}
                className="w-full py-3.5 text-white font-semibold rounded-xl shadow-lg transition-all duration-200 flex items-center justify-center gap-2 cursor-pointer disabled:cursor-not-allowed border-none text-base hover:shadow-xl active:scale-[0.98] disabled:opacity-50"
                style={{ background: `linear-gradient(135deg, ${theme.brand}, ${theme.brandLight})` }}
              >
                {loading ? <Loader2 size={18} className="animate-spin" /> : 'Verify OTP'}
              </button>

              {/* Resend */}
              <div className="text-center mt-3">
                {countdown > 0 ? (
                  <span className="text-xs" style={{ color: theme.textMuted }}>Resend in <span className="font-semibold" style={{ color: theme.brand }}>{countdown}s</span></span>
                ) : (
                  <button
                    onClick={handleSendOtp}
                    className="text-xs font-semibold bg-transparent border-none cursor-pointer"
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
            <p className="text-center text-xs mt-3 font-medium" style={{ color: message.color }}>{message.text}</p>
          )}
        </div>
      </div>

      {/* Bottom section */}
      <div className="w-full max-w-sm mt-6 space-y-3">
        <div className="flex items-center justify-center gap-5">
          {[
            { icon: Lock, label: 'Encrypted' },
            { icon: ShieldCheck, label: 'RBI Compliant' },
          ].map(({ icon: Icon, label }) => (
            <div key={label} className="flex items-center gap-1.5">
              <Icon size={12} style={{ color: theme.textMuted }} />
              <span className="text-[10px]" style={{ color: theme.textMuted }}>{label}</span>
            </div>
          ))}
        </div>
        <div className="text-center pb-2">
          <p className="text-[10px]" style={{ color: theme.textMuted }}>
            By continuing, you agree to our <span className="font-medium" style={{ color: theme.brand }}>Terms & Privacy Policy</span>
          </p>
        </div>
      </div>
    </div>
  );
}
