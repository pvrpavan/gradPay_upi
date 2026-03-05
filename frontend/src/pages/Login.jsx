import { useState, useRef, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { ArrowLeft, Phone, ShieldCheck, Loader2 } from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import { api } from '../utils/api';

export default function Login() {
  const navigate = useNavigate();
  const { login } = useAuth();
  const [phoneNumber, setPhoneNumber] = useState('');
  const [otpSent, setOtpSent] = useState(false);
  const [otp, setOtp] = useState(['', '', '', '', '', '']);
  const [message, setMessage] = useState({ text: '', color: '' });
  const [loading, setLoading] = useState(false);
  const [countdown, setCountdown] = useState(0);
  const otpRefs = useRef([]);

  useEffect(() => {
    if (countdown > 0) {
      const timer = setTimeout(() => setCountdown(countdown - 1), 1000);
      return () => clearTimeout(timer);
    }
  }, [countdown]);

  const handleSendOtp = async () => {
    if (!phoneNumber || phoneNumber.length < 10) {
      setMessage({ text: 'Please enter a valid 10-digit phone number.', color: 'text-red-500' });
      return;
    }
    setLoading(true);
    try {
      const data = await api.sendOtp(phoneNumber);
      if (data.otp) {
        setOtpSent(true);
        setMessage({ text: `OTP sent to ${phoneNumber}`, color: 'text-blue-500' });
        setCountdown(30);
        // In dev mode, auto-fill OTP for testing
        if (data.otp) {
          const otpDigits = data.otp.toString().split('');
          setOtp(otpDigits);
        }
      } else {
        setMessage({ text: data.error || 'Failed to send OTP.', color: 'text-red-500' });
      }
    } catch {
      setMessage({ text: 'Error sending OTP. Check if backend is running.', color: 'text-red-500' });
    }
    setLoading(false);
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
      const data = await api.verifyOtp(phoneNumber, enteredOtp);
      if (data.status === 200 || data.status === 201) {
        setMessage({ text: 'OTP Verified Successfully!', color: 'text-green-500' });
        const token = data.token || 'demo-token';
        login(data.phone || phoneNumber, token, data.user);

        if (data.isNewUser) {
          navigate(`/create-account?phone=${data.phone || phoneNumber}`);
        } else {
          navigate('/dashboard');
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
    <div className="min-h-screen gradient-warm flex flex-col items-center px-6 py-8 animate-fadeIn">
      {/* Logo */}
      <div className="flex items-center gap-2 mb-4">
        <img src="/photos/gradious-pay-logo-final.png" alt="Logo" className="w-10 h-10" />
        <h1 className="text-xl font-bold text-gray-800">
          <span className="text-[#f65e1d]">Gradious </span>Pay
        </h1>
      </div>

      {/* Card */}
      <div className="w-full max-w-sm bg-white/80 backdrop-blur-sm rounded-3xl shadow-xl p-6 mt-4 animate-slideUp">
        <button
          onClick={() => navigate('/')}
          className="flex items-center gap-1 text-gray-600 hover:text-[#f65e1d] mb-4 bg-transparent border-none cursor-pointer text-sm"
        >
          <ArrowLeft size={18} /> Back
        </button>

        <h2 className="text-xl font-bold text-gray-700 mb-1">Register / Login</h2>
        <p className="text-sm text-gray-400 mb-6">Enter your phone number to get started</p>

        {/* Phone Input */}
        <div className="flex items-center gap-3 bg-gray-50 rounded-xl px-4 py-3 mb-4 border-2 border-gray-100 focus-within:border-[#f65e1d] transition-colors">
          <Phone size={18} className="text-[#f65e1d]" />
          <span className="text-gray-500 font-medium text-sm">+91</span>
          <input
            type="tel"
            maxLength={10}
            placeholder="Phone number"
            value={phoneNumber}
            onChange={(e) => setPhoneNumber(e.target.value.replace(/\D/g, ''))}
            className="flex-1 bg-transparent border-none outline-none text-base text-gray-800 placeholder-gray-400"
          />
        </div>

        {/* Send OTP Button */}
        {!otpSent ? (
          <button
            onClick={handleSendOtp}
            disabled={loading || phoneNumber.length < 10}
            className="w-full py-3 bg-[#f65e1d] hover:bg-[#e5531a] disabled:bg-gray-300 text-white font-semibold rounded-xl shadow-md transition-all duration-300 flex items-center justify-center gap-2 cursor-pointer disabled:cursor-not-allowed border-none text-base"
          >
            {loading ? <Loader2 size={18} className="animate-spin" /> : <ShieldCheck size={18} />}
            Send OTP
          </button>
        ) : (
          <>
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
    </div>
  );
}
