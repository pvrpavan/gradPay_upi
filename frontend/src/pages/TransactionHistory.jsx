import { useEffect, useState } from 'react';
import { useAuth } from '../context/AuthContext';
import { api } from '../utils/api';
import TopBar from '../components/TopBar';
import BottomNav from '../components/BottomNav';
import { ArrowUpRight, ArrowDownLeft, Filter } from 'lucide-react';

export default function TransactionHistory() {
  const { phone } = useAuth();
  const [transactions, setTransactions] = useState([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState('all');
  const [profile, setProfile] = useState(null);

  useEffect(() => {
    if (phone) {
      api.getProfile(phone).then((data) => {
        setProfile(data);
        const upiId = Array.isArray(data.upi_id) ? data.upi_id[0] : data.upi_id;
        if (upiId) {
          api.getTransactionHistory(upiId, { limit: 50 }).then((res) => {
            setTransactions(res.transactions || []);
            setLoading(false);
          }).catch(() => setLoading(false));
        } else {
          setLoading(false);
        }
      }).catch(() => setLoading(false));
    }
  }, [phone]);

  const filtered = filter === 'all'
    ? transactions
    : transactions.filter((t) => t.type === filter);

  const getUpi = () => {
    if (!profile) return '';
    return Array.isArray(profile.upi_id) ? profile.upi_id[0] : profile.upi_id;
  };

  return (
    <div className="min-h-screen gradient-warm pb-20">
      <TopBar title="Transaction History" showBack={false} />

      <main className="px-4 pt-4 animate-fadeIn">
        {/* Filter */}
        <div className="flex items-center gap-2 mb-4">
          <Filter size={16} className="text-gray-400" />
          {['all', 'debit', 'credit'].map((f) => (
            <button
              key={f}
              onClick={() => setFilter(f)}
              className={`px-3 py-1.5 rounded-full text-xs font-semibold border-none cursor-pointer transition-all ${
                filter === f
                  ? 'bg-[#f65e1d] text-white shadow-md'
                  : 'bg-white text-gray-500 hover:bg-orange-50'
              }`}
            >
              {f.charAt(0).toUpperCase() + f.slice(1)}
            </button>
          ))}
        </div>

        {loading ? (
          <div className="flex justify-center py-12">
            <div className="animate-spin w-8 h-8 border-3 border-[#f65e1d] border-t-transparent rounded-full" />
          </div>
        ) : filtered.length === 0 ? (
          <div className="text-center py-12">
            <p className="text-gray-400 text-sm">No transactions yet.</p>
            <p className="text-gray-300 text-xs mt-1">Start sending money to see your history</p>
          </div>
        ) : (
          <div className="space-y-3">
            {filtered.map((tx, i) => {
              const myUpi = getUpi();
              const isSent = tx.sender_upi === myUpi && tx.type === 'debit';
              return (
                <div key={i} className="flex items-center justify-between bg-white rounded-xl p-4 shadow-sm hover:shadow-md transition-shadow">
                  <div className="flex items-center gap-3">
                    <div className={`w-10 h-10 rounded-full flex items-center justify-center ${isSent ? 'bg-red-50' : 'bg-green-50'}`}>
                      {isSent ? (
                        <ArrowUpRight size={18} className="text-red-500" />
                      ) : (
                        <ArrowDownLeft size={18} className="text-green-500" />
                      )}
                    </div>
                    <div>
                      <p className="text-sm font-semibold text-gray-800">
                        {isSent ? `To: ${tx.receiver_upi}` : `From: ${tx.sender_upi}`}
                      </p>
                      <p className="text-xs text-gray-400">{tx.note || 'Transaction'}</p>
                      <p className="text-[10px] text-gray-300">{new Date(tx.timestamp).toLocaleString()}</p>
                    </div>
                  </div>
                  <span className={`text-sm font-bold ${isSent ? 'text-red-500' : 'text-green-500'}`}>
                    {isSent ? '-' : '+'}₹{tx.amount?.toLocaleString('en-IN')}
                  </span>
                </div>
              );
            })}
          </div>
        )}
      </main>

      <BottomNav />
    </div>
  );
}
