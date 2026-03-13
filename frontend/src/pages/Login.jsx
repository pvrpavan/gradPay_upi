import { useState, useRef, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { ArrowLeft, Phone, ShieldCheck, Loader2, Globe, Lock, Sparkles, Users, Zap, CreditCard, Award } from 'lucide-react';
import { useAuth } from '../context/AuthContext';
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
      setMessage({ text: `Please enter a valid ${selectedCountry.maxLen}-digit phone number.`, color: 'text-red-500' });
      return;
    }
    setLoading(true);
    try {
      const data = await api.sendOtp(phoneNumber);
      if (data.otp) {
        setOtpSent(true);
        setMessage({ text: `OTP sent to ${selectedCountry.code} ${phoneNumber}`, color: 'text-blue-500' });
        setCountdown(30);
        // Store OTP from backend but don't auto-fill immediately
        setBackendOtp(data.otp.toString());
        // Show auto-fill prompt after a 2.5 second delay to simulate real OTP delivery
        setTimeout(() => {
          setShowAutoFillPrompt(true);
        }, 2500);
      } else {
        setMessage({ text: data.error || 'Failed to send OTP.', color: 'text-red-500' });
      }
    } catch {
      setMessage({ text: 'Error sending OTP. Check if backend is running.', color: 'text-red-500' });
    }
    setLoading(false);
  };

  const handleAutoFillOtp = () => {
    if (backendOtp) {
      const otpDigits = backendOtp.split('');
      setOtp(otpDigits);
      setShowAutoFillPrompt(false);
      setMessage({ text: 'OTP auto-filled from server', color: 'text-green-500' });
    }
  };

  const handleDeclineAutoFill = () => {
    setShowAutoFillPrompt(false);
    setMessage({ text: 'Enter OTP manually', color: 'text-gray-500' });
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
      setMessage({ text: 'Please enter the full 6-digit OTP.', color: 'text-red-500' });
      return;
    }
    setLoading(true);
    try {
      const data = await api.verifyOtp(phoneNumber, enteredOtp, selectedCountry.code);
      if (data.status === 200 || data.status === 201) {
        setMessage({ text: 'OTP Verified Successfully!', color: 'text-green-500' });
        const token = data.token || 'demo-token';
        login(data.phone || phoneNumber, token, data.user);

        if (data.isNewUser) {
          navigate(`/create-account?phone=${data.phone || phoneNumber}`);
        } else {
          navigate('/dashboard', { replace: true });
        }
      } else {
        setMessage({ text: data.message || 'Incorrect OTP. Try again.', color: 'text-red-500' });
      }
    } catch {
      setMessage({ text: 'Error verifying OTP. Please try again.', color: 'text-red-500' });
    }
    setLoading(false);
  };

  const isOtpComplete = otp.every((d) => d !== '');

  return (
    <div className="min-h-screen gradient-warm flex flex-col items-center px-6 py-6 animate-fadeIn overflow-y-auto">
      {/* Animated background circles */}
      <div className="fixed top-0 left-0 w-full h-full pointer-events-none overflow-hidden -z-10">
        <div className="absolute -top-20 -right-20 w-64 h-64 rounded-full bg-[#f65e1d]/5 animate-float" />
        <div className="absolute top-1/3 -left-16 w-48 h-48 rounded-full bg-[#ff9800]/5 animate-float-delayed" />
        <div className="absolute bottom-20 right-10 w-32 h-32 rounded-full bg-[#f65e1d]/5 animate-float" />
      </div>

      {/* Logo */}
      <div className="flex items-center gap-2 mb-2 animate-flip-in">
        <div className="w-14 h-14 rounded-2xl bg-gradient-to-br from-[#f65e1d] to-[#ff9800] flex items-center justify-center shadow-lg animate-3d-float animate-glow-pulse">
          <span className="text-white text-2xl font-bold">G</span>
        </div>
        <div>
          <h1 className="text-2xl font-bold text-gray-800">
            <span className="text-[#f65e1d]">Gradious </span>Pay
          </h1>
          <p className="text-[10px] text-gray-400 -mt-0.5">Your Smart Payment Partner</p>
        </div>
      </div>

      {/* Tagline */}
      <p className="text-xs text-gray-400 mb-3 flex items-center gap-1 animate-wave">
        <Lock size={12} /> Secure & Fast UPI Payments
      </p>

      {/* Trust Badges */}
      <div className="flex items-center gap-3 mb-4">
        <div className="flex items-center gap-1 px-3 py-1.5 bg-white/60 rounded-full shadow-sm">
          <Users size={12} className="text-[#f65e1d]" />
          <span className="text-[10px] text-gray-600 font-medium">10M+ Users</span>
        </div>
        <div className="flex items-center gap-1 px-3 py-1.5 bg-white/60 rounded-full shadow-sm">
          <Zap size={12} className="text-green-500" />
          <span className="text-[10px] text-gray-600 font-medium">Instant Transfer</span>
        </div>
        <div className="flex items-center gap-1 px-3 py-1.5 bg-white/60 rounded-full shadow-sm">
          <Award size={12} className="text-yellow-500" />
          <span className="text-[10px] text-gray-600 font-medium">Earn Rewards</span>
        </div>
      </div>

      {/* Card */}
      <div className="w-full max-w-sm bg-white/80 backdrop-blur-sm rounded-3xl shadow-xl p-6 animate-slideUp animate-tilt-3d" style={{ animationIterationCount: 1, animationDuration: '0.6s' }}>
        <button
          onClick={() => navigate('/')}
          className="flex items-center gap-1 text-gray-600 hover:text-[#f65e1d] mb-3 bg-transparent border-none cursor-pointer text-sm"
        >
          <ArrowLeft size={18} /> Back
        </button>

        <h2 className="text-xl font-bold text-gray-700 mb-1">Welcome Back!</h2>
        <p className="text-sm text-gray-400 mb-1">Register or Login to your account</p>
        <p className="text-xs text-gray-300 mb-5">Join millions of users making instant, secure payments across the globe</p>

        {/* Country Selector */}
        <div className="mb-3">
          <label className="text-xs font-medium text-gray-500 mb-1 block">Select Country</label>
          <button
            onClick={() => setShowCountryPicker(!showCountryPicker)}
            className="w-full flex items-center justify-between bg-gray-50 rounded-xl px-4 py-3 border-2 border-gray-100 hover:border-[#f65e1d]/40 transition-colors cursor-pointer"
          >
            <div className="flex items-center gap-2">
              <Globe size={16} className="text-[#f65e1d]" />
              <span className="text-lg">{selectedCountry.flag}</span>
              <span className="text-sm font-medium text-gray-700">{selectedCountry.name}</span>
              <span className="text-sm text-gray-400">({selectedCountry.code})</span>
            </div>
            <span className="text-gray-400 text-xs">{showCountryPicker ? '\u25B2' : '\u25BC'}</span>
          </button>

          {showCountryPicker && (
            <div className="mt-1 bg-white rounded-xl shadow-lg border border-gray-100 z-10 relative">
              <div className="p-2 border-b border-gray-100">
                <input
                  type="text"
                  placeholder="Search country..."
                  value={countrySearch}
                  onChange={(e) => setCountrySearch(e.target.value)}
                  className="w-full px-3 py-2 text-sm border border-gray-200 rounded-lg outline-none focus:border-[#f65e1d] bg-gray-50"
                />
              </div>
              <div className="max-h-48 overflow-y-auto">
                {filteredCountries.map((country) => (
                  <button
                    key={country.code}
                    onClick={() => { setSelectedCountry(country); setShowCountryPicker(false); setPhoneNumber(''); setCountrySearch(''); }}
                    className={`w-full flex items-center gap-2 px-4 py-2.5 hover:bg-orange-50 transition-colors cursor-pointer border-none text-left ${
                      selectedCountry.code === country.code ? 'bg-orange-50' : 'bg-transparent'
                    }`}
                  >
                    <span className="text-lg">{country.flag}</span>
                    <span className="text-sm text-gray-700">{country.name}</span>
                    <span className="text-xs text-gray-400 ml-auto">{country.code}</span>
                  </button>
                ))}
                {filteredCountries.length === 0 && (
                  <p className="text-xs text-gray-400 text-center py-3">No countries found</p>
                )}
              </div>
            </div>
          )}
        </div>

        {/* Phone Input */}
        <div className="flex items-center gap-3 bg-gray-50 rounded-xl px-4 py-3 mb-4 border-2 border-gray-100 focus-within:border-[#f65e1d] transition-colors">
          <Phone size={18} className="text-[#f65e1d]" />
          <span className="text-gray-500 font-medium text-sm">{selectedCountry.code}</span>
          <input
            type="tel"
            maxLength={selectedCountry.maxLen}
            placeholder={`${selectedCountry.maxLen}-digit phone number`}
            value={phoneNumber}
            onChange={(e) => setPhoneNumber(e.target.value.replace(/\D/g, ''))}
            className="flex-1 bg-transparent border-none outline-none text-base text-gray-800 placeholder-gray-400"
          />
        </div>

        {/* Send OTP Button */}
        {!otpSent ? (
          <button
            onClick={handleSendOtp}
            disabled={loading || phoneNumber.length < selectedCountry.maxLen - 2}
            className="w-full py-3.5 bg-gradient-to-r from-[#f65e1d] to-[#ff9800] hover:from-[#e5531a] hover:to-[#f08800] disabled:from-gray-300 disabled:to-gray-300 text-white font-semibold rounded-xl shadow-lg hover:shadow-xl transition-all duration-300 flex items-center justify-center gap-2 cursor-pointer disabled:cursor-not-allowed border-none text-base transform hover:scale-[1.02] active:scale-[0.98]"
          >
            {loading ? <Loader2 size={18} className="animate-spin" /> : <ShieldCheck size={18} />}
            Send OTP
          </button>
        ) : (
          <>
            {/* Auto-fill prompt */}
            {showAutoFillPrompt && (
              <div className="bg-gradient-to-r from-blue-50 to-indigo-50 border border-blue-200 rounded-xl p-4 mb-4 animate-slideUp shadow-sm">
                <p className="text-sm text-blue-700 font-medium mb-2 flex items-center gap-1">
                  <Sparkles size={14} className="text-blue-500" /> OTP received from server
                </p>
                <p className="text-xs text-blue-500 mb-3">We received an OTP from the backend. Would you like to auto-enter it?</p>
                <div className="flex gap-2">
                  <button
                    onClick={handleAutoFillOtp}
                    className="flex-1 py-2.5 bg-gradient-to-r from-[#f65e1d] to-[#ff9800] text-white text-sm font-semibold rounded-lg border-none cursor-pointer hover:shadow-md transition-all"
                  >
                    Yes, Auto-enter
                  </button>
                  <button
                    onClick={handleDeclineAutoFill}
                    className="flex-1 py-2.5 bg-white text-gray-600 text-sm font-semibold rounded-lg border border-gray-200 cursor-pointer hover:bg-gray-50 transition-colors"
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
                  className="w-11 h-13 text-center text-xl font-bold border-2 border-gray-200 rounded-xl bg-white focus:border-[#f65e1d] focus:ring-2 focus:ring-[#f65e1d]/20 outline-none transition-all shadow-sm"
                  style={digit ? { borderColor: '#f65e1d', background: 'linear-gradient(135deg, #fff5ec, #ffffff)' } : {}}
                />
              ))}
            </div>

            {/* Verify Button */}
            <button
              onClick={handleVerifyOtp}
              disabled={loading || !isOtpComplete}
              className="w-full py-3.5 bg-gradient-to-r from-[#f65e1d] to-[#ff9800] hover:from-[#e5531a] hover:to-[#f08800] disabled:from-gray-300 disabled:to-gray-300 text-white font-semibold rounded-xl shadow-lg transition-all duration-300 flex items-center justify-center gap-2 cursor-pointer disabled:cursor-not-allowed border-none text-base transform hover:scale-[1.02] active:scale-[0.98]"
            >
              {loading ? <Loader2 size={18} className="animate-spin" /> : 'Verify OTP'}
            </button>

            {/* Resend */}
            <div className="text-center mt-3">
              {countdown > 0 ? (
                <span className="text-sm text-gray-400">Resend OTP in <span className="text-[#f65e1d] font-semibold">{countdown}s</span></span>
              ) : (
                <button
                  onClick={handleSendOtp}
                  className="text-sm text-[#f65e1d] font-semibold underline bg-transparent border-none cursor-pointer"
                >
                  Resend OTP
                </button>
              )}
            </div>
          </>
        )}

        {/* Message */}
        {message.text && (
          <p className={`text-center text-sm mt-4 font-medium ${message.color}`}>{message.text}</p>
        )}
      </div>

      {/* Features Section */}
      <div className="w-full max-w-sm mt-6 grid grid-cols-2 gap-3">
        <div className="bg-white/60 backdrop-blur-sm rounded-2xl p-4 shadow-sm card-3d animate-stagger-1">
          <CreditCard size={20} className="text-[#f65e1d] mb-2 animate-wave" />
          <p className="text-xs font-semibold text-gray-700">Multiple Payment Modes</p>
          <p className="text-[10px] text-gray-400 mt-1">Bank, UPI, Cards & Wallet</p>
        </div>
        <div className="bg-white/60 backdrop-blur-sm rounded-2xl p-4 shadow-sm card-3d animate-stagger-2">
          <Zap size={20} className="text-green-500 mb-2 animate-wave" />
          <p className="text-xs font-semibold text-gray-700">Instant Transfers</p>
          <p className="text-[10px] text-gray-400 mt-1">Send money in seconds</p>
        </div>
        <div className="bg-white/60 backdrop-blur-sm rounded-2xl p-4 shadow-sm card-3d animate-stagger-3">
          <ShieldCheck size={20} className="text-blue-500 mb-2 animate-wave" />
          <p className="text-xs font-semibold text-gray-700">Bank Grade Security</p>
          <p className="text-[10px] text-gray-400 mt-1">256-bit encryption always</p>
        </div>
        <div className="bg-white/60 backdrop-blur-sm rounded-2xl p-4 shadow-sm card-3d animate-stagger-4">
          <Award size={20} className="text-yellow-500 mb-2 animate-wave" />
          <p className="text-xs font-semibold text-gray-700">Earn Rewards</p>
          <p className="text-[10px] text-gray-400 mt-1">Get points on every transaction</p>
        </div>
      </div>

      {/* Testimonials */}
      <div className="w-full max-w-sm mt-5 animate-stagger-5">
        <div className="bg-gradient-to-r from-[#f65e1d]/10 to-[#ff9800]/10 rounded-2xl p-4 shadow-sm">
          <div className="flex items-center gap-2 mb-2">
            <div className="flex -space-x-2">
              {['bg-blue-400', 'bg-green-400', 'bg-purple-400'].map((bg, i) => (
                <div key={i} className={`w-6 h-6 rounded-full ${bg} border-2 border-white flex items-center justify-center`}>
                  <Users size={10} className="text-white" />
                </div>
              ))}
            </div>
            <span className="text-[10px] text-gray-500 font-medium">Trusted by 10M+ users</span>
          </div>
          <p className="text-xs text-gray-600 italic">"GradPay made my daily payments so easy. The instant transfers and rewards are amazing!"</p>
          <p className="text-[10px] text-gray-400 mt-1">- Rahul S., Verified User</p>
        </div>
      </div>

      {/* Bottom Info */}
      <div className="mt-6 text-center pb-6">
        <p className="text-xs text-gray-400">By continuing, you agree to our</p>
        <p className="text-xs text-[#f65e1d] font-medium">Terms of Service & Privacy Policy</p>
        <div className="flex items-center justify-center gap-4 mt-4">
          <div className="flex items-center gap-1 text-xs text-gray-400">
            <Lock size={10} /> 256-bit Encryption
          </div>
          <div className="flex items-center gap-1 text-xs text-gray-400">
            <ShieldCheck size={10} /> RBI Compliant
          </div>
        </div>
        <p className="text-[10px] text-gray-300 mt-3">Available in 20+ countries worldwide</p>
      </div>
    </div>
  );
}
