import { useState } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { UserPlus, Loader2, Eye, EyeOff } from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import { api } from '../utils/api';

export default function CreateAccount() {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const phone = searchParams.get('phone');
  const { login } = useAuth();

  const [form, setForm] = useState({ displayName: '', email: '', password: '', confirmPassword: '' });
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  if (!phone) {
    return (
      <div className="min-h-screen flex items-center justify-center gradient-warm px-6">
        <div className="bg-white rounded-2xl p-8 shadow-xl text-center">
          <p className="text-gray-600 mb-4">Phone number missing. Please login again.</p>
          <button onClick={() => navigate('/login')} className="text-[#f65e1d] font-semibold underline bg-transparent border-none cursor-pointer">
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
    <div className="min-h-screen bg-gradient-to-br from-[#ff6f00] to-[#cb8034] flex flex-col items-center justify-center px-6 py-10 animate-fadeIn">
      <h1 className="text-white text-2xl font-bold text-center mb-8 leading-tight">
        Seems like you&apos;re new<br />to us!!
      </h1>

      <div className="w-full max-w-sm bg-white rounded-3xl shadow-2xl p-7 animate-slideUp">
        <h2 className="text-center text-[#ff9800] text-xl font-bold mb-6">
          Create your GradPay Account
        </h2>

        <form onSubmit={handleSubmit} className="flex flex-col gap-4">
          <input
            type="text"
            placeholder="Display Name *"
            value={form.displayName}
            onChange={(e) => setForm({ ...form, displayName: e.target.value })}
            required
            className="w-full px-4 py-3 text-sm border-2 border-gray-100 rounded-xl bg-gray-50 focus:border-[#ff9800] focus:shadow-[0_0_5px_rgba(255,152,0,0.4)] outline-none transition-all"
          />

          <input
            type="email"
            placeholder="Email (Optional)"
            value={form.email}
            onChange={(e) => setForm({ ...form, email: e.target.value })}
            className="w-full px-4 py-3 text-sm border-2 border-gray-100 rounded-xl bg-gray-50 focus:border-[#ff9800] focus:shadow-[0_0_5px_rgba(255,152,0,0.4)] outline-none transition-all"
          />

          <div className="relative">
            <input
              type={showPassword ? 'text' : 'password'}
              placeholder="Password *"
              value={form.password}
              onChange={(e) => setForm({ ...form, password: e.target.value })}
              required
              className="w-full px-4 py-3 pr-10 text-sm border-2 border-gray-100 rounded-xl bg-gray-50 focus:border-[#ff9800] focus:shadow-[0_0_5px_rgba(255,152,0,0.4)] outline-none transition-all"
            />
            <button
              type="button"
              onClick={() => setShowPassword(!showPassword)}
              className="absolute right-3 top-1/2 -translate-y-1/2 bg-transparent border-none cursor-pointer text-gray-400"
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
            className="w-full px-4 py-3 text-sm border-2 border-gray-100 rounded-xl bg-gray-50 focus:border-[#ff9800] focus:shadow-[0_0_5px_rgba(255,152,0,0.4)] outline-none transition-all"
          />

          {error && <p className="text-red-500 text-sm text-center">{error}</p>}

          <button
            type="submit"
            disabled={loading}
            className="w-full py-3 bg-[#ff9800] hover:bg-[#e68900] text-white font-semibold rounded-xl shadow-md transition-all flex items-center justify-center gap-2 cursor-pointer border-none text-base disabled:opacity-60"
          >
            {loading ? <Loader2 size={18} className="animate-spin" /> : <UserPlus size={18} />}
            Register
          </button>
        </form>
      </div>
    </div>
  );
}
