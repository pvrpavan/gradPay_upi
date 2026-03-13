import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { useTheme } from '../context/ThemeContext';
import { useToast } from '../context/ToastContext';
import { api } from '../utils/api';
import TopBar from '../components/TopBar';
import LoadingOverlay from '../components/LoadingOverlay';
import { Wallet, CheckCircle2, Plus, Shield, CreditCard, Banknote } from 'lucide-react';

export default function Deposit() {
  const navigate = useNavigate();
  const { phone } = useAuth();
  const { theme, isDark } = useTheme();
  const { showSuccess, showError } = useToast();
  const [amount, setAmount] = useState('');
  const [success, setSuccess] = useState(false);
  const [error, setError] = useState('');
  const [processing, setProcessing] = useState(false);
  const [method, setMethod] = useState('bank');

  const handleDeposit = async () => {
    if (!amount || parseFloat(amount) <= 0) return;
    setProcessing(true);
    setError('');

    await new Promise((r) => setTimeout(r, 1500));

    try {
      const profile = await api.getProfile(phone);
      const upiId = Array.isArray(profile.upi_id) ? profile.upi_id[0] : profile.upi_id;
      if (!upiId) {
        setError('UPI ID not found. Please complete your profile.');
        setProcessing(false);
        return;
      }
      const data = await api.depositMoney({ upi_id: upiId, amount: parseFloat(amount) });
      setProcessing(false);
      if (data.message) {
        setSuccess(true);
        showSuccess('Deposit successful!');
        setTimeout(() => navigate('/dashboard'), 2500);
      } else {
        setError('Deposit failed. Please try again.');
        showError('Deposit failed. Please try again.');
      }
    } catch {
      setProcessing(false);
      setError('Error processing deposit.');
      showError('Error processing deposit.');
    }
  };

  if (success) {
    return (
      <div className="min-h-screen flex flex-col items-center justify-center animate-fadeIn" style={{ background: `linear-gradient(135deg, ${theme.gradientFrom}, ${theme.gradientTo})` }}>
        <div className="rounded-3xl shadow-xl p-8 text-center" style={{ backgroundColor: theme.bgCard }}>
          <CheckCircle2 size={64} className="mx-auto mb-4" style={{ color: theme.success }} />
          <h2 className="text-xl font-bold mb-2" style={{ color: theme.text }}>Deposit Successful!</h2>
          <p style={{ color: theme.textSecondary }}>{'\u20B9'}{parseFloat(amount).toLocaleString('en-IN')} added to your wallet</p>
          <p className="text-sm mt-2" style={{ color: theme.textMuted }}>Redirecting to dashboard...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen" style={{ background: `linear-gradient(135deg, ${theme.gradientFrom}, ${theme.gradientTo})` }}>
      <TopBar title="Add Money" />
      {processing && <LoadingOverlay message="Processing Deposit..." />}

      <main className="px-5 pt-6 pb-8 animate-fadeIn">
        <div className="flex flex-col items-center mb-6">
          <div className="w-16 h-16 rounded-full flex items-center justify-center shadow-lg mb-3" style={{ background: `linear-gradient(135deg, ${theme.brand}, ${theme.brandLight})` }}>
            <Plus size={28} className="text-white" />
          </div>
          <h3 className="text-base font-semibold" style={{ color: theme.textSecondary }}>Add Money to Wallet</h3>
          <p className="text-xs mt-1" style={{ color: theme.textMuted }}>Instant deposit to your GradPay wallet</p>
        </div>

        <div className="rounded-2xl p-5 shadow-sm mb-4" style={{ backgroundColor: theme.bgCard }}>
          <label className="text-xs font-medium mb-2 block" style={{ color: theme.textSecondary }}>Enter Amount</label>
          <div className="flex items-center gap-2 mb-4">
            <span className="text-3xl font-bold" style={{ color: theme.textMuted }}>{'\u20B9'}</span>
            <input
              type="number"
              placeholder="0.00"
              value={amount}
              onChange={(e) => setAmount(e.target.value)}
              className="w-full text-3xl font-bold border-none outline-none bg-transparent"
              style={{ color: theme.text }}
            />
          </div>
          <div className="flex gap-2 mb-2">
            {[100, 500, 1000, 2000, 5000].map((val) => (
              <button
                key={val}
                onClick={() => setAmount(String(val))}
                className="flex-1 py-2 text-sm font-semibold rounded-lg border cursor-pointer transition-colors"
                style={
                  amount === String(val)
                    ? { backgroundColor: theme.brand, color: '#ffffff', borderColor: theme.brand }
                    : { backgroundColor: isDark ? theme.bgSecondary : theme.brandBg, color: theme.brand, borderColor: `${theme.brand}33` }
                }
              >
                {'\u20B9'}{val}
              </button>
            ))}
          </div>
        </div>

        <div className="rounded-2xl p-5 shadow-sm mb-4" style={{ backgroundColor: theme.bgCard }}>
          <label className="text-xs font-medium mb-3 block" style={{ color: theme.textSecondary }}>Payment Method</label>
          <div className="space-y-2">
            {[
              { id: 'bank', label: 'Bank Transfer', desc: 'Direct bank deposit', icon: Banknote },
              { id: 'card', label: 'Debit / Credit Card', desc: 'Visa, Mastercard', icon: CreditCard },
            ].map(({ id, label, desc, icon: Icon }) => (
              <button
                key={id}
                onClick={() => setMethod(id)}
                className="w-full flex items-center gap-3 p-3 rounded-xl border-2 transition-colors cursor-pointer text-left"
                style={{
                  borderColor: method === id ? theme.brand : theme.borderLight,
                  backgroundColor: method === id ? (isDark ? theme.bgSecondary : theme.brandBg) : theme.bgCard,
                }}
              >
                <div className="w-10 h-10 rounded-full flex items-center justify-center" style={{ backgroundColor: method === id ? theme.brand : (isDark ? theme.bgSecondary : theme.borderLight) }}>
                  <Icon size={18} className={method === id ? 'text-white' : ''} style={method === id ? {} : { color: theme.textMuted }} />
                </div>
                <div>
                  <p className="text-sm font-semibold" style={{ color: theme.text }}>{label}</p>
                  <p className="text-xs" style={{ color: theme.textMuted }}>{desc}</p>
                </div>
              </button>
            ))}
          </div>
        </div>

        {error && <p className="text-sm text-center mb-3" style={{ color: theme.danger }}>{error}</p>}

        <button
          onClick={handleDeposit}
          disabled={!amount || parseFloat(amount) <= 0}
          className="w-full py-3.5 text-white font-semibold rounded-xl shadow-md transition-all cursor-pointer border-none text-base disabled:opacity-60 flex items-center justify-center gap-2"
          style={{ backgroundColor: theme.brand }}
        >
          <Wallet size={18} />
          Deposit {'\u20B9'}{amount || '0'}
        </button>

        <div className="flex items-center justify-center gap-2 mt-4">
          <Shield size={12} style={{ color: theme.success }} />
          <p className="text-xs" style={{ color: theme.textMuted }}>Secured by RBI guidelines</p>
        </div>
      </main>
    </div>
  );
}
