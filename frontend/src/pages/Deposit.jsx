import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { api } from '../utils/api';
import TopBar from '../components/TopBar';
import LoadingOverlay from '../components/LoadingOverlay';
import { Wallet, CheckCircle2, Plus, Shield, CreditCard, Banknote } from 'lucide-react';

export default function Deposit() {
  const navigate = useNavigate();
  const { phone } = useAuth();
  const [amount, setAmount] = useState('');
  const [success, setSuccess] = useState(false);
  const [error, setError] = useState('');
  const [processing, setProcessing] = useState(false);
  const [method, setMethod] = useState('bank');

  const handleDeposit = async () => {
    if (!amount || parseFloat(amount) <= 0) return;
    setProcessing(true);
    setError('');

    // Simulate processing delay for UX
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
        setTimeout(() => navigate('/dashboard'), 2500);
      } else {
        setError('Deposit failed. Please try again.');
      }
    } catch {
      setProcessing(false);
      setError('Error processing deposit.');
    }
  };

  if (success) {
    return (
      <div className="min-h-screen gradient-warm flex flex-col items-center justify-center animate-fadeIn">
        <div className="bg-white rounded-3xl shadow-xl p-8 text-center">
          <CheckCircle2 size={64} className="text-green-500 mx-auto mb-4" />
          <h2 className="text-xl font-bold text-gray-800 mb-2">Deposit Successful!</h2>
          <p className="text-gray-500">{'\u20B9'}{parseFloat(amount).toLocaleString('en-IN')} added to your wallet</p>
          <p className="text-sm text-gray-400 mt-2">Redirecting to dashboard...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen gradient-warm">
      <TopBar title="Add Money" />
      {processing && <LoadingOverlay message="Processing Deposit..." />}

      <main className="px-5 pt-6 pb-8 animate-fadeIn">
        {/* Header */}
        <div className="flex flex-col items-center mb-6">
          <div className="w-16 h-16 rounded-full bg-gradient-to-br from-[#f65e1d] to-[#ff9800] flex items-center justify-center shadow-lg mb-3">
            <Plus size={28} className="text-white" />
          </div>
          <h3 className="text-gray-700 text-base font-semibold">Add Money to Wallet</h3>
          <p className="text-gray-400 text-xs mt-1">Instant deposit to your GradPay wallet</p>
        </div>

        {/* Amount Input */}
        <div className="bg-white rounded-2xl p-5 shadow-sm mb-4">
          <label className="text-xs font-medium text-gray-500 mb-2 block">Enter Amount</label>
          <div className="flex items-center gap-2 mb-4">
            <span className="text-3xl font-bold text-gray-300">{'\u20B9'}</span>
            <input
              type="number"
              placeholder="0.00"
              value={amount}
              onChange={(e) => setAmount(e.target.value)}
              className="w-full text-3xl font-bold text-gray-800 border-none outline-none bg-transparent placeholder-gray-300"
            />
          </div>

          <div className="flex gap-2 mb-2">
            {[100, 500, 1000, 2000, 5000].map((val) => (
              <button
                key={val}
                onClick={() => setAmount(String(val))}
                className={`flex-1 py-2 text-sm font-semibold rounded-lg border cursor-pointer transition-colors ${
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

        {/* Payment Method */}
        <div className="bg-white rounded-2xl p-5 shadow-sm mb-4">
          <label className="text-xs font-medium text-gray-500 mb-3 block">Payment Method</label>
          <div className="space-y-2">
            {[
              { id: 'bank', label: 'Bank Transfer', desc: 'Direct bank deposit', icon: Banknote },
              { id: 'card', label: 'Debit / Credit Card', desc: 'Visa, Mastercard', icon: CreditCard },
            ].map(({ id, label, desc, icon: Icon }) => (
              <button
                key={id}
                onClick={() => setMethod(id)}
                className={`w-full flex items-center gap-3 p-3 rounded-xl border-2 transition-colors cursor-pointer text-left ${
                  method === id ? 'border-[#f65e1d] bg-orange-50' : 'border-gray-100 bg-white hover:bg-gray-50'
                }`}
              >
                <div className={`w-10 h-10 rounded-full flex items-center justify-center ${
                  method === id ? 'bg-[#f65e1d]' : 'bg-gray-100'
                }`}>
                  <Icon size={18} className={method === id ? 'text-white' : 'text-gray-400'} />
                </div>
                <div>
                  <p className="text-sm font-semibold text-gray-800">{label}</p>
                  <p className="text-xs text-gray-400">{desc}</p>
                </div>
              </button>
            ))}
          </div>
        </div>

        {error && <p className="text-red-500 text-sm text-center mb-3">{error}</p>}

        <button
          onClick={handleDeposit}
          disabled={!amount || parseFloat(amount) <= 0}
          className="w-full py-3.5 bg-[#f65e1d] hover:bg-[#e5531a] text-white font-semibold rounded-xl shadow-md transition-all cursor-pointer border-none text-base disabled:opacity-60 flex items-center justify-center gap-2"
        >
          <Wallet size={18} />
          Deposit {'\u20B9'}{amount || '0'}
        </button>

        {/* Security Note */}
        <div className="flex items-center justify-center gap-2 mt-4">
          <Shield size={12} className="text-green-500" />
          <p className="text-xs text-gray-400">Secured by RBI guidelines</p>
        </div>
      </main>
    </div>
  );
}
