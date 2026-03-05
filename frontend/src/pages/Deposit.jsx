import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import TopBar from '../components/TopBar';
import { Wallet, CheckCircle2 } from 'lucide-react';

export default function Deposit() {
  const navigate = useNavigate();
  const [amount, setAmount] = useState('');
  const [success, setSuccess] = useState(false);

  const handleDeposit = () => {
    if (!amount || parseFloat(amount) <= 0) return;
    // Simulated deposit
    setSuccess(true);
    setTimeout(() => navigate('/dashboard'), 2500);
  };

  if (success) {
    return (
      <div className="min-h-screen gradient-warm flex flex-col items-center justify-center animate-fadeIn">
        <div className="bg-white rounded-3xl shadow-xl p-8 text-center">
          <CheckCircle2 size={64} className="text-green-500 mx-auto mb-4" />
          <h2 className="text-xl font-bold text-gray-800 mb-2">Deposit Successful!</h2>
          <p className="text-gray-500">₹{parseFloat(amount).toLocaleString('en-IN')} added to your wallet</p>
          <p className="text-sm text-gray-400 mt-2">Redirecting to dashboard...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen gradient-warm">
      <TopBar title="Deposit" />
      <main className="px-5 pt-8 animate-fadeIn">
        <div className="flex flex-col items-center mb-8">
          <div className="w-16 h-16 rounded-full bg-gradient-to-br from-green-400 to-green-500 flex items-center justify-center shadow-lg mb-4">
            <Wallet size={28} className="text-white" />
          </div>
          <h3 className="text-gray-500 text-sm">Add money to your wallet</h3>
        </div>

        <div className="bg-white rounded-2xl p-5 shadow-sm">
          <label className="text-xs font-medium text-gray-500 mb-2 block">Enter Amount</label>
          <input
            type="number"
            placeholder="₹0.00"
            value={amount}
            onChange={(e) => setAmount(e.target.value)}
            className="w-full text-3xl font-bold text-gray-800 border-none outline-none bg-transparent placeholder-gray-300 mb-4"
          />

          <div className="flex gap-2 mb-6">
            {[100, 500, 1000, 2000].map((val) => (
              <button
                key={val}
                onClick={() => setAmount(String(val))}
                className="flex-1 py-2 bg-orange-50 text-[#f65e1d] text-sm font-semibold rounded-lg border border-[#f65e1d]/20 cursor-pointer hover:bg-orange-100 transition-colors"
              >
                ₹{val}
              </button>
            ))}
          </div>

          <button
            onClick={handleDeposit}
            disabled={!amount || parseFloat(amount) <= 0}
            className="w-full py-3.5 bg-[#f65e1d] hover:bg-[#e5531a] text-white font-semibold rounded-xl shadow-md transition-all cursor-pointer border-none text-base disabled:opacity-60"
          >
            Deposit ₹{amount || '0'}
          </button>
        </div>
      </main>
    </div>
  );
}
