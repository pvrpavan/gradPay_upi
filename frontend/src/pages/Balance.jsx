import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { api } from '../utils/api';
import TopBar from '../components/TopBar';
import { Wallet, TrendingUp, TrendingDown, Plus, Send, ArrowUpRight, ArrowDownLeft, Eye, EyeOff } from 'lucide-react';

export default function Balance() {
  const navigate = useNavigate();
  const { phone } = useAuth();
  const [balance, setBalance] = useState(null);
  const [loading, setLoading] = useState(true);
  const [showBalance, setShowBalance] = useState(true);
  const [transactions, setTransactions] = useState([]);
  const [totalIn, setTotalIn] = useState(0);
  const [totalOut, setTotalOut] = useState(0);

  useEffect(() => {
    if (phone) {
      api.getProfile(phone).then((data) => {
        setBalance(data.balance ?? 0);
        setLoading(false);
        const upiId = Array.isArray(data.upi_id) ? data.upi_id[0] : data.upi_id;
        if (upiId) {
          api.getTransactionHistory(upiId, { limit: 20 }).then((res) => {
            const txs = res.transactions || [];
            setTransactions(txs.slice(0, 5));
            let inAmt = 0, outAmt = 0;
            txs.forEach((t) => {
              if (t.type === 'deposit' || t.receiver_upi === upiId) inAmt += t.amount || 0;
              if (t.sender_upi === upiId && t.type !== 'deposit') outAmt += t.amount || 0;
            });
            setTotalIn(inAmt);
            setTotalOut(outAmt);
          }).catch(() => {});
        }
      }).catch(() => setLoading(false));
    }
  }, [phone]);

  return (
    <div className="min-h-screen gradient-warm">
      <TopBar title="My Wallet" />
      <main className="px-5 pt-6 pb-8 animate-fadeIn">
        {/* Balance Card */}
        <div className="bg-gradient-to-br from-[#f65e1d] to-[#ff9800] rounded-3xl p-6 text-white shadow-xl mb-6 relative overflow-hidden">
          <div className="absolute -top-8 -right-8 w-32 h-32 bg-white/10 rounded-full" />
          <div className="absolute -bottom-6 -left-6 w-24 h-24 bg-white/10 rounded-full" />
          <div className="relative z-10">
            <div className="flex items-center justify-between mb-4">
              <div className="flex items-center gap-2">
                <Wallet size={20} />
                <span className="text-sm font-medium opacity-90">GradPay Wallet</span>
              </div>
              <button onClick={() => setShowBalance(!showBalance)} className="bg-white/20 rounded-full p-1.5 border-none cursor-pointer">
                {showBalance ? <Eye size={14} className="text-white" /> : <EyeOff size={14} className="text-white" />}
              </button>
            </div>

            {loading ? (
              <div className="animate-spin w-8 h-8 border-3 border-white border-t-transparent rounded-full mx-auto my-4" />
            ) : (
              <>
                <p className="text-3xl font-bold mb-1">
                  {showBalance ? `\u20B9${balance?.toLocaleString('en-IN') || '0'}` : '\u20B9 ****'}
                </p>
                <p className="text-xs opacity-70">Available Balance</p>
              </>
            )}

            <div className="flex gap-3 mt-5">
              <button
                onClick={() => navigate('/deposit')}
                className="flex-1 py-2.5 bg-white text-[#f65e1d] rounded-xl font-semibold text-sm border-none cursor-pointer flex items-center justify-center gap-1.5"
              >
                <Plus size={16} /> Add Money
              </button>
              <button
                onClick={() => navigate('/send-money')}
                className="flex-1 py-2.5 bg-white/20 text-white rounded-xl font-semibold text-sm border-none cursor-pointer flex items-center justify-center gap-1.5 backdrop-blur-sm"
              >
                <Send size={16} /> Send
              </button>
            </div>
          </div>
        </div>

        {/* Stats Cards */}
        <div className="grid grid-cols-2 gap-4 mb-6">
          <div className="bg-white rounded-2xl p-4 shadow-sm">
            <div className="flex items-center gap-2 mb-2">
              <div className="w-8 h-8 rounded-full bg-green-100 flex items-center justify-center">
                <TrendingUp size={16} className="text-green-600" />
              </div>
              <span className="text-xs text-gray-400">Money In</span>
            </div>
            <p className="text-lg font-bold text-green-600">{'\u20B9'}{totalIn.toLocaleString('en-IN')}</p>
          </div>
          <div className="bg-white rounded-2xl p-4 shadow-sm">
            <div className="flex items-center gap-2 mb-2">
              <div className="w-8 h-8 rounded-full bg-red-100 flex items-center justify-center">
                <TrendingDown size={16} className="text-red-500" />
              </div>
              <span className="text-xs text-gray-400">Money Out</span>
            </div>
            <p className="text-lg font-bold text-red-500">{'\u20B9'}{totalOut.toLocaleString('en-IN')}</p>
          </div>
        </div>

        {/* Recent Transactions */}
        <div className="bg-white rounded-2xl p-4 shadow-sm">
          <div className="flex items-center justify-between mb-3">
            <h4 className="text-sm font-semibold text-gray-700">Recent Activity</h4>
            <button onClick={() => navigate('/history')} className="text-xs text-[#f65e1d] font-medium bg-transparent border-none cursor-pointer">
              View All
            </button>
          </div>
          {transactions.length === 0 ? (
            <p className="text-xs text-gray-400 text-center py-4">No recent transactions</p>
          ) : (
            <div className="space-y-3">
              {transactions.map((tx, i) => {
                const isDeposit = tx.type === 'deposit';
                const isSent = !isDeposit && tx.sender_upi !== 'BANK_DEPOSIT';
                return (
                  <div key={tx._id || i} className="flex items-center justify-between">
                    <div className="flex items-center gap-3">
                      <div className={`w-8 h-8 rounded-full flex items-center justify-center ${
                        isDeposit ? 'bg-blue-50' : isSent ? 'bg-red-50' : 'bg-green-50'
                      }`}>
                        {isDeposit ? <Wallet size={14} className="text-blue-500" /> :
                         isSent ? <ArrowUpRight size={14} className="text-red-500" /> :
                         <ArrowDownLeft size={14} className="text-green-500" />}
                      </div>
                      <div>
                        <p className="text-xs font-semibold text-gray-700">{tx.note || (isDeposit ? 'Deposit' : 'Transfer')}</p>
                        <p className="text-[10px] text-gray-400">{new Date(tx.timestamp).toLocaleDateString()}</p>
                      </div>
                    </div>
                    <span className={`text-xs font-bold ${
                      isDeposit ? 'text-blue-500' : isSent ? 'text-red-500' : 'text-green-500'
                    }`}>
                      {isSent ? '-' : '+'}{'\u20B9'}{tx.amount?.toLocaleString('en-IN')}
                    </span>
                  </div>
                );
              })}
            </div>
          )}
        </div>
      </main>
    </div>
  );
}
