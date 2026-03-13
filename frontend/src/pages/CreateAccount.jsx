import { useState } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { UserPlus, Loader2, Eye, EyeOff } from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import { useTheme } from '../context/ThemeContext';
import { api } from '../utils/api';

export default function CreateAccount() {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const phone = searchParams.get('phone');
  const { login } = useAuth();
  const { theme } = useTheme();

  const [form, setForm] = useState({ displayName: '', email: '', password: '', confirmPassword: '' });
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  if (!phone) {
    return (
      <div className="min-h-screen flex items-center justify-center px-6" style={{ background: `linear-gradient(135deg, ${theme.gradientFrom}, ${theme.gradientTo})` }}>
        <div className="rounded-2xl p-8 shadow-xl text-center" style={{ backgroundColor: theme.bgCard }}>
          <p className="mb-4" style={{ color: theme.textSecondary }}>Phone number missing. Please login again.</p>
          <button onClick={() => navigate('/login')} className="font-semibold underline bg-transparent border-none cursor-pointer" style={{ color: theme.brand }}>
            Go to Login
          </button>
        </div>
      </div>
    );
  }

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');

    if (form.password !== form.confirmPassword) {
      setError('Passwords do not match.');
      return;
    }
    if (form.password.length < 4) {
      setError('Password must be at least 4 characters.');
      return;
    }
    if (!form.displayName.trim()) {
      setError('Display name is required.');
      return;
    }

    setLoading(true);
    try {
      const data = await api.createAccount({
        displayName: form.displayName,
        email: form.email,
        password: form.password,
        phone,
      });

      if (data.status === 400) {
        setError('User already exists. Try logging in.');
      } else if (data.status === 201 || data.user) {
        const token = data.token || 'demo-token';
        login(phone, token, data.user);
        navigate('/dashboard');
      } else {
        setError(data.error || 'Account creation failed.');
      }
    } catch {
      setError('Error creating account. Please try again.');
    }
    setLoading(false);
  };

  return (
    <div className="min-h-screen flex flex-col items-center justify-center px-6 py-10 animate-fadeIn" style={{ background: `linear-gradient(135deg, ${theme.brand}, ${theme.brandLight})` }}>
      <h1 className="text-white text-2xl font-bold text-center mb-8 leading-tight" style={{ color: '#ffffff' }}>
        Seems like you&apos;re new<br />to us!!
      </h1>

      <div className="w-full max-w-sm rounded-3xl shadow-2xl p-7 animate-slideUp" style={{ backgroundColor: theme.bgCard }}>
        <h2 className="text-center text-xl font-bold mb-6" style={{ color: theme.brand }}>
          Create your GradPay Account
        </h2>

        <form onSubmit={handleSubmit} className="flex flex-col gap-4">
          <input
            type="text"
            placeholder="Display Name *"
            value={form.displayName}
            onChange={(e) => setForm({ ...form, displayName: e.target.value })}
            required
            className="w-full px-4 py-3 text-sm border-2 rounded-xl outline-none transition-all"
            style={{ backgroundColor: theme.inputBg, borderColor: theme.borderLight, color: theme.text }}
          />

          <input
            type="email"
            placeholder="Email (Optional)"
            value={form.email}
            onChange={(e) => setForm({ ...form, email: e.target.value })}
            className="w-full px-4 py-3 text-sm border-2 rounded-xl outline-none transition-all"
            style={{ backgroundColor: theme.inputBg, borderColor: theme.borderLight, color: theme.text }}
          />

          <div className="relative">
            <input
              type={showPassword ? 'text' : 'password'}
              placeholder="Password *"
              value={form.password}
              onChange={(e) => setForm({ ...form, password: e.target.value })}
              required
              className="w-full px-4 py-3 pr-10 text-sm border-2 rounded-xl outline-none transition-all"
              style={{ backgroundColor: theme.inputBg, borderColor: theme.borderLight, color: theme.text }}
            />
            <button
              type="button"
              onClick={() => setShowPassword(!showPassword)}
              className="absolute right-3 top-1/2 -translate-y-1/2 bg-transparent border-none cursor-pointer"
              style={{ color: theme.textMuted }}
            >
              {showPassword ? <EyeOff size={18} /> : <Eye size={18} />}
            </button>
          </div>

          <input
            type="password"
            placeholder="Confirm Password *"
            value={form.confirmPassword}
            onChange={(e) => setForm({ ...form, confirmPassword: e.target.value })}
            required
            className="w-full px-4 py-3 text-sm border-2 rounded-xl outline-none transition-all"
            style={{ backgroundColor: theme.inputBg, borderColor: theme.borderLight, color: theme.text }}
          />

          {error && <p className="text-sm text-center" style={{ color: theme.danger }}>{error}</p>}

          <button
            type="submit"
            disabled={loading}
            className="w-full py-3 text-white font-semibold rounded-xl shadow-md transition-all flex items-center justify-center gap-2 cursor-pointer border-none text-base disabled:opacity-60"
            style={{ background: `linear-gradient(135deg, ${theme.brand}, ${theme.brandLight})` }}
          >
            {loading ? <Loader2 size={18} className="animate-spin" /> : <UserPlus size={18} />}
            Register
          </button>
        </form>
      </div>
    </div>
  );
}
