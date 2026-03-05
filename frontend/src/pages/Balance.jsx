import { useEffect, useState } from 'react';
import { useAuth } from '../context/AuthContext';
import { api } from '../utils/api';
import TopBar from '../components/TopBar';
import { Wallet, TrendingUp, TrendingDown } from 'lucide-react';

export default function Balance() {
  const { phone } = useAuth();
  const [balance, setBalance] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (phone) {
      api.getProfile(phone).then((data) => {
        setBalance(data.balance ?? 0);
        setLoading(false);
      }).catch(() => setLoading(false));
    }
  }, [phone]);

  return (
    <div className="min-h-screen gradient-warm">
      <TopBar title="Balance" />
      <main className="px-5 pt-8 animate-fadeIn">
        <div className="flex flex-col items-center">
          <div className="w-20 h-20 rounded-full bg-gradient-to-br from-orange-400 to-orange-500 flex items-center justify-center shadow-lg mb-4">
            <Wallet size={36} className="text-white" />
          </div>

          <h2 className="text-gray-500 text-sm font-medium mb-2">Your Current Balance</h2>

          {loading ? (
            <div className="animate-spin w-8 h-8 border-3 border-[#f65e1d] border-t-transparent rounded-full mt-4" />
          ) : (
            <div className="bg-gradient-to-r from-amber-100 to-orange-100 rounded-2xl px-10 py-6 text-center shadow-lg">
              <p className="text-4xl font-bold text-gray-800">
                ₹{balance?.toLocaleString('en-IN') || '0'}
              </p>
            </div>
          )}
        </div>

        {/* Stats Cards */}
        <div className="grid grid-cols-2 gap-4 mt-8">
          <div className="bg-green-50 rounded-2xl p-4 flex items-center gap-3">
            <div className="w-10 h-10 rounded-full bg-green-100 flex items-center justify-center">
              <TrendingUp size={20} className="text-green-600" />
            </div>
            <div>
              <p className="text-xs text-gray-400">Income</p>
              <p className="text-sm font-bold text-green-600">₹{balance?.toLocaleString('en-IN') || '0'}</p>
            </div>
          </div>
          <div className="bg-red-50 rounded-2xl p-4 flex items-center gap-3">
            <div className="w-10 h-10 rounded-full bg-red-100 flex items-center justify-center">
              <TrendingDown size={20} className="text-red-500" />
            </div>
            <div>
              <p className="text-xs text-gray-400">Spent</p>
              <p className="text-sm font-bold text-red-500">₹0</p>
            </div>
          </div>
        </div>
      </main>
    </div>
  );
}
