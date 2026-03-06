import { useState, useRef, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { ArrowLeft, Phone, ShieldCheck, Loader2, Globe, Lock, Sparkles } from 'lucide-react';
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
];

export default function Login() {
  const navigate = useNavigate();
  const { login } = useAuth();
  const [phoneNumber, setPhoneNumber] = useState('');
  const [selectedCountry, setSelectedCountry] = useState(COUNTRIES[0]);
  const [showCountryPicker, setShowCountryPicker] = useState(false);
  const [otpSent, setOtpSent] = useState(false);
  const [otp, setOtp] = useState(['', '', '', '', '', '']);
  const [message, setMessage] = useState({ text: '', color: '' });
  const [loading, setLoading] = useState(false);
  const [countdown, setCountdown] = useState(0);
  const [backendOtp, setBackendOtp] = useState('');
  const [showAutoFillPrompt, setShowAutoFillPrompt] = useState(false);
  const otpRefs = useRef([]);

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
        // Show auto-fill prompt after a short delay
        setTimeout(() => {
          setShowAutoFillPrompt(true);
        }, 1500);
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
    <div className="min-h-screen gradient-warm flex flex-col items-center px-6 py-6 animate-fadeIn">
      {/* Logo */}
      <div className="flex items-center gap-2 mb-2">
        <img src="/photos/gradious-pay-logo-final.png" alt="Logo" className="w-10 h-10" />
        <h1 className="text-xl font-bold text-gray-800">
          <span className="text-[#f65e1d]">Gradious </span>Pay
        </h1>
      </div>

      {/* Tagline */}
      <p className="text-xs text-gray-400 mb-4 flex items-center gap-1">
        <Lock size={12} /> Secure & Fast UPI Payments
      </p>

      {/* Card */}
      <div className="w-full max-w-sm bg-white/80 backdrop-blur-sm rounded-3xl shadow-xl p-6 animate-slideUp">
        <button
          onClick={() => navigate('/')}
          className="flex items-center gap-1 text-gray-600 hover:text-[#f65e1d] mb-3 bg-transparent border-none cursor-pointer text-sm"
        >
          <ArrowLeft size={18} /> Back
        </button>

        <h2 className="text-xl font-bold text-gray-700 mb-1">Welcome Back!</h2>
        <p className="text-sm text-gray-400 mb-1">Register or Login to your account</p>
        <p className="text-xs text-gray-300 mb-5">Join millions of users making instant, secure payments</p>

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
            <div className="mt-1 bg-white rounded-xl shadow-lg border border-gray-100 max-h-48 overflow-y-auto z-10 relative">
              {COUNTRIES.map((country) => (
                <button
                  key={country.code}
                  onClick={() => { setSelectedCountry(country); setShowCountryPicker(false); setPhoneNumber(''); }}
                  className={`w-full flex items-center gap-2 px-4 py-2.5 hover:bg-orange-50 transition-colors cursor-pointer border-none text-left ${
                    selectedCountry.code === country.code ? 'bg-orange-50' : 'bg-transparent'
                  }`}
                >
                  <span className="text-lg">{country.flag}</span>
                  <span className="text-sm text-gray-700">{country.name}</span>
                  <span className="text-xs text-gray-400 ml-auto">{country.code}</span>
                </button>
              ))}
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
            className="w-full py-3 bg-[#f65e1d] hover:bg-[#e5531a] disabled:bg-gray-300 text-white font-semibold rounded-xl shadow-md transition-all duration-300 flex items-center justify-center gap-2 cursor-pointer disabled:cursor-not-allowed border-none text-base"
          >
            {loading ? <Loader2 size={18} className="animate-spin" /> : <ShieldCheck size={18} />}
            Send OTP
          </button>
        ) : (
          <>
            {/* Auto-fill prompt */}
            {showAutoFillPrompt && (
              <div className="bg-blue-50 border border-blue-200 rounded-xl p-3 mb-4 animate-slideUp">
                <p className="text-sm text-blue-700 font-medium mb-2 flex items-center gap-1">
                  <Sparkles size={14} /> OTP received from server
                </p>
                <p className="text-xs text-blue-500 mb-3">Would you like to auto-fill the OTP?</p>
                <div className="flex gap-2">
                  <button
                    onClick={handleAutoFillOtp}
                    className="flex-1 py-2 bg-[#f65e1d] text-white text-sm font-semibold rounded-lg border-none cursor-pointer hover:bg-[#e5531a] transition-colors"
                  >
                    Yes, Auto-fill
                  </button>
                  <button
                    onClick={handleDeclineAutoFill}
                    className="flex-1 py-2 bg-gray-200 text-gray-600 text-sm font-semibold rounded-lg border-none cursor-pointer hover:bg-gray-300 transition-colors"
                  >
                    No, Enter Manually
                  </button>
                </div>
              </div>
            )}

            {/* OTP Inputs */}
            <div className="flex justify-center gap-2 my-4">
              {otp.map((digit, i) => (
                <input
                  key={i}
                  ref={(el) => (otpRefs.current[i] = el)}
                  type="text"
                  maxLength={1}
                  value={digit}
                  onChange={(e) => handleOtpChange(i, e.target.value)}
                  onKeyDown={(e) => handleOtpKeyDown(i, e)}
                  className="w-11 h-13 text-center text-xl font-bold border-2 border-[#f65e1d] rounded-xl bg-white focus:ring-2 focus:ring-[#f65e1d]/30 outline-none transition-all"
                />
              ))}
            </div>

            {/* Verify Button */}
            <button
              onClick={handleVerifyOtp}
              disabled={loading || !isOtpComplete}
              className="w-full py-3 bg-[#f65e1d] hover:bg-[#e5531a] disabled:bg-gray-300 text-white font-semibold rounded-xl shadow-md transition-all duration-300 flex items-center justify-center gap-2 cursor-pointer disabled:cursor-not-allowed border-none text-base"
            >
              {loading ? <Loader2 size={18} className="animate-spin" /> : 'Verify OTP'}
            </button>

            {/* Resend */}
            <div className="text-center mt-3">
              {countdown > 0 ? (
                <span className="text-sm text-gray-400">Resend OTP in {countdown}s</span>
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

      {/* Bottom Info */}
      <div className="mt-6 text-center">
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
      </div>
    </div>
  );
}
