import { useState } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
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
      <div className="min-h-screen gradient-warm flex flex-col items-center justify-center animate-fadeIn">
        <div className="bg-white rounded-3xl shadow-xl p-8 text-center animate-bounce-in">
          <CheckCircle2 size={64} className="text-green-500 mx-auto mb-4" />
          <h2 className="text-xl font-bold text-gray-800 mb-2">Payment Successful!</h2>
          <p className="text-gray-500">{'\u20B9'}{parseFloat(amount).toLocaleString('en-IN')} paid for {selectedUtility?.label}</p>
          {billNumber && <p className="text-xs text-gray-400 mt-1">Bill: {billNumber}</p>}
          <p className="text-sm text-gray-400 mt-2">Redirecting to dashboard...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen gradient-warm">
      <TopBar title="Utility Payments" />
      {showProcessing && <LoadingOverlay message="Processing Payment..." />}
      {showUpiPin && (
        <UpiPinModal phone={phone} onSuccess={handlePay} onClose={() => setShowUpiPin(false)} />
      )}

      <main className="px-4 pt-5 pb-8 animate-fadeIn">
        {/* Utility Type Selection */}
        {!selectedType ? (
          <>
            <div className="flex items-center gap-2 mb-4">
              <Receipt size={20} className="text-[#f65e1d]" />
              <h3 className="text-base font-semibold text-gray-700">Select Utility</h3>
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
            {/* Selected Utility Header */}
            <div className="flex items-center gap-3 mb-5">
              <button
                onClick={() => { setSelectedType(''); setAmount(''); setBillNumber(''); setError(''); }}
                className="text-xs text-[#f65e1d] bg-orange-50 px-3 py-1.5 rounded-lg border-none cursor-pointer font-medium"
              >
                Change
              </button>
              <div className={`flex items-center gap-2 px-4 py-2 rounded-xl ${selectedUtility?.bgColor}`}>
                {selectedUtility && <selectedUtility.icon size={18} />}
                <span className="text-sm font-semibold">{selectedUtility?.label}</span>
              </div>
            </div>

            {/* Bill Details */}
            <div className="bg-white rounded-2xl p-5 shadow-sm mb-4 space-y-4">
              <div>
                <label className="text-xs font-medium text-gray-500 mb-1 block">Bill Number / Account ID (optional)</label>
                <input
                  type="text"
                  placeholder="Enter bill number"
                  value={billNumber}
                  onChange={(e) => setBillNumber(e.target.value)}
                  className="w-full px-4 py-3 text-sm border-2 border-gray-100 rounded-xl outline-none focus:border-[#f65e1d] bg-gray-50"
                />
              </div>

              <div>
                <label className="text-xs font-medium text-gray-500 mb-2 block">Amount ({'\u20B9'})</label>
                <div className="flex items-center gap-2 mb-3">
                  <span className="text-3xl font-bold text-gray-300">{'\u20B9'}</span>
                  <input
                    type="number"
                    placeholder="0.00"
                    value={amount}
                    onChange={(e) => setAmount(e.target.value)}
                    className="w-full text-3xl font-bold text-gray-800 border-none outline-none bg-transparent placeholder-gray-300"
                  />
                </div>

                <div className="flex gap-2">
                  {[100, 200, 500, 1000, 2000].map((val) => (
                    <button
                      key={val}
                      onClick={() => setAmount(String(val))}
                      className={`flex-1 py-2 text-xs font-semibold rounded-lg border cursor-pointer transition-colors ${
                        amount === String(val)
                          ? 'bg-[#f65e1d] text-white border-[#f65e1d]'
                          : 'bg-orange-50 text-[#f65e1d] border-[#f65e1d]/20 hover:bg-orange-100'
                      }`}
                    >
                      {'\u20B9'}{val}
                    </button>
                  ))}
                </div>
              </div>
            </div>

            {error && <p className="text-red-500 text-sm text-center mb-3">{error}</p>}

            <button
              onClick={handleInitiatePay}
              disabled={!amount || parseFloat(amount) <= 0}
              className="w-full py-3.5 bg-gradient-to-r from-[#f65e1d] to-[#ff9800] hover:from-[#e5531a] hover:to-[#f08800] text-white font-semibold rounded-xl shadow-lg transition-all cursor-pointer border-none text-base disabled:opacity-60 flex items-center justify-center gap-2 transform hover:scale-[1.02] active:scale-[0.98]"
            >
              Pay {'\u20B9'}{amount || '0'} for {selectedUtility?.label}
            </button>
          </div>
        )}
      </main>
    </div>
  );
}
