import { useState } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { useTheme } from '../context/ThemeContext';
import { api } from '../utils/api';
import TopBar from '../components/TopBar';
import UpiPinModal from '../components/UpiPinModal';
import LoadingOverlay from '../components/LoadingOverlay';
import { Zap, Plane, Smartphone, Droplets, CheckCircle2, Wifi, Tv, Fuel, GraduationCap, Receipt } from 'lucide-react';

const UTILITY_TYPES = [
  { id: 'electricity', label: 'Electricity', icon: Zap, color: 'from-yellow-400 to-yellow-500', bgColor: 'bg-yellow-50 text-yellow-600' },
  { id: 'water', label: 'Water', icon: Droplets, color: 'from-cyan-400 to-cyan-500', bgColor: 'bg-cyan-50 text-cyan-600' },
  { id: 'recharge', label: 'Recharge', icon: Smartphone, color: 'from-green-400 to-green-500', bgColor: 'bg-green-50 text-green-600' },
  { id: 'internet', label: 'Internet', icon: Wifi, color: 'from-blue-400 to-blue-500', bgColor: 'bg-blue-50 text-blue-600' },
  { id: 'dth', label: 'DTH / TV', icon: Tv, color: 'from-purple-400 to-purple-500', bgColor: 'bg-purple-50 text-purple-600' },
  { id: 'gas', label: 'Gas', icon: Fuel, color: 'from-orange-400 to-orange-500', bgColor: 'bg-orange-50 text-orange-600' },
  { id: 'education', label: 'Education', icon: GraduationCap, color: 'from-indigo-400 to-indigo-500', bgColor: 'bg-indigo-50 text-indigo-600' },
  { id: 'travel', label: 'Travel', icon: Plane, color: 'from-pink-400 to-pink-500', bgColor: 'bg-pink-50 text-pink-600' },
];

export default function UtilityPayment() {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const { phone } = useAuth();
  const { theme, isDark } = useTheme();
  const initialType = searchParams.get('type') || '';
  const [selectedType, setSelectedType] = useState(initialType);
  const [billNumber, setBillNumber] = useState('');
  const [amount, setAmount] = useState('');
  const [error, setError] = useState('');
  const [success, setSuccess] = useState(false);
  const [showUpiPin, setShowUpiPin] = useState(false);
  const [showProcessing, setShowProcessing] = useState(false);

  const selectedUtility = UTILITY_TYPES.find((u) => u.id === selectedType);

  const handleInitiatePay = () => {
    if (!selectedType) { setError('Please select a utility type'); return; }
    if (!amount || parseFloat(amount) <= 0) { setError('Please enter a valid amount'); return; }
    setError('');
    setShowUpiPin(true);
  };

  const handlePay = async () => {
    setShowUpiPin(false);
    setShowProcessing(true);

    await new Promise((r) => setTimeout(r, 1500));

    try {
      const data = await api.payUtilityBill({
        phone,
        utilityType: selectedType,
        amount: parseFloat(amount),
        billNumber: billNumber || undefined,
      });

      setShowProcessing(false);

      if (data.message) {
        setSuccess(true);
        setTimeout(() => navigate('/dashboard'), 2500);
      } else {
        setError(data.message || 'Payment failed. Please try again.');
      }
    } catch {
      setShowProcessing(false);
      setError('Error processing payment.');
    }
  };

  if (success) {
    return (
      <div className="min-h-screen flex flex-col items-center justify-center animate-fadeIn" style={{ background: `linear-gradient(135deg, ${theme.gradientFrom}, ${theme.gradientTo})` }}>
        <div className="rounded-3xl shadow-xl p-8 text-center animate-bounce-in" style={{ backgroundColor: theme.bgCard }}>
          <CheckCircle2 size={64} className="mx-auto mb-4" style={{ color: theme.success }} />
          <h2 className="text-xl font-bold mb-2" style={{ color: theme.text }}>Payment Successful!</h2>
          <p style={{ color: theme.textSecondary }}>{'\u20B9'}{parseFloat(amount).toLocaleString('en-IN')} paid for {selectedUtility?.label}</p>
          {billNumber && <p className="text-xs mt-1" style={{ color: theme.textMuted }}>Bill: {billNumber}</p>}
          <p className="text-sm mt-2" style={{ color: theme.textMuted }}>Redirecting to dashboard...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen" style={{ background: `linear-gradient(135deg, ${theme.gradientFrom}, ${theme.gradientTo})` }}>
      <TopBar title="Utility Payments" />
      {showProcessing && <LoadingOverlay message="Processing Payment..." />}
      {showUpiPin && (
        <UpiPinModal phone={phone} onSuccess={handlePay} onClose={() => setShowUpiPin(false)} />
      )}

      <main className="px-4 pt-5 pb-8 animate-fadeIn">
        {!selectedType ? (
          <>
            <div className="flex items-center gap-2 mb-4">
              <Receipt size={20} style={{ color: theme.brand }} />
              <h3 className="text-base font-semibold" style={{ color: theme.textSecondary }}>Select Utility</h3>
            </div>
            <div className="grid grid-cols-2 gap-3">
              {UTILITY_TYPES.map(({ id, label, icon: Icon, bgColor }) => (
                <button
                  key={id}
                  onClick={() => setSelectedType(id)}
                  className={`flex items-center gap-3 p-4 rounded-2xl ${bgColor} shadow-sm hover:shadow-md transition-all cursor-pointer border-none text-left hover:-translate-y-0.5`}
                >
                  <Icon size={22} />
                  <span className="text-sm font-semibold">{label}</span>
                </button>
              ))}
            </div>
          </>
        ) : (
          <div className="animate-slideUp">
            <div className="flex items-center gap-3 mb-5">
              <button
                onClick={() => { setSelectedType(''); setAmount(''); setBillNumber(''); setError(''); }}
                className="text-xs px-3 py-1.5 rounded-lg border-none cursor-pointer font-medium"
                style={{ color: theme.brand, backgroundColor: isDark ? theme.bgSecondary : theme.brandBg }}
              >
                Change
              </button>
              <div className={`flex items-center gap-2 px-4 py-2 rounded-xl ${selectedUtility?.bgColor}`}>
                {selectedUtility && <selectedUtility.icon size={18} />}
                <span className="text-sm font-semibold">{selectedUtility?.label}</span>
              </div>
            </div>

            <div className="rounded-2xl p-5 shadow-sm mb-4 space-y-4" style={{ backgroundColor: theme.bgCard }}>
              <div>
                <label className="text-xs font-medium mb-1 block" style={{ color: theme.textSecondary }}>Bill Number / Account ID (optional)</label>
                <input
                  type="text"
                  placeholder="Enter bill number"
                  value={billNumber}
                  onChange={(e) => setBillNumber(e.target.value)}
                  className="w-full px-4 py-3 text-sm border-2 rounded-xl outline-none"
                  style={{ backgroundColor: theme.inputBg, color: theme.text, borderColor: theme.borderLight }}
                />
              </div>

              <div>
                <label className="text-xs font-medium mb-2 block" style={{ color: theme.textSecondary }}>Amount ({'\u20B9'})</label>
                <div className="flex items-center gap-2 mb-3">
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

                <div className="flex gap-2">
                  {[100, 200, 500, 1000, 2000].map((val) => (
                    <button
                      key={val}
                      onClick={() => setAmount(String(val))}
                      className="flex-1 py-2 text-xs font-semibold rounded-lg border cursor-pointer transition-colors"
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
            </div>

            {error && <p className="text-sm text-center mb-3" style={{ color: theme.danger }}>{error}</p>}

            <button
              onClick={handleInitiatePay}
              disabled={!amount || parseFloat(amount) <= 0}
              className="w-full py-3.5 text-white font-semibold rounded-xl shadow-lg transition-all cursor-pointer border-none text-base disabled:opacity-60 flex items-center justify-center gap-2 transform hover:scale-[1.02] active:scale-[0.98]"
              style={{ background: `linear-gradient(135deg, ${theme.brand}, ${theme.brandLight})` }}
            >
              Pay {'\u20B9'}{amount || '0'} for {selectedUtility?.label}
            </button>
          </div>
        )}
      </main>
    </div>
  );
}
