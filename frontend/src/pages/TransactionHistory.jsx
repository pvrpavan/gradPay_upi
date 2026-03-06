import { useEffect, useState } from 'react';
import { useAuth } from '../context/AuthContext';
import { api } from '../utils/api';
import TopBar from '../components/TopBar';
import BottomNav from '../components/BottomNav';
import { ArrowUpRight, ArrowDownLeft, Filter, X, Wallet, Clock, FileText, ChevronRight } from 'lucide-react';

export default function TransactionHistory() {
  const { phone } = useAuth();
  const [transactions, setTransactions] = useState([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState('all');
  const [profile, setProfile] = useState(null);
  const [selectedTx, setSelectedTx] = useState(null);
  const [txDetail, setTxDetail] = useState(null);
  const [detailLoading, setDetailLoading] = useState(false);

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

  const getUpi = () => {
    if (!profile) return '';
    return Array.isArray(profile.upi_id) ? profile.upi_id[0] : profile.upi_id;
  };

  const filtered = filter === 'all'
    ? transactions
    : filter === 'sent'
      ? transactions.filter((t) => t.sender_upi === getUpi() && t.type !== 'deposit')
      : filter === 'received'
        ? transactions.filter((t) => t.receiver_upi === getUpi() && t.sender_upi !== 'BANK_DEPOSIT')
        : transactions.filter((t) => t.type === 'deposit');

  const handleViewDetail = async (tx) => {
    setSelectedTx(tx);
    if (tx._id) {
      setDetailLoading(true);
      try {
        const data = await api.getTransactionById(tx._id);
        setTxDetail(data);
      } catch {
        setTxDetail(null);
      }
      setDetailLoading(false);
    }
  };

  return (
    <div className="min-h-screen gradient-warm pb-20">
      <TopBar title="Transaction History" showBack={false} />

      <main className="px-4 pt-4 animate-fadeIn">
        {/* Filter */}
        <div className="flex items-center gap-2 mb-4 overflow-x-auto">
          <Filter size={16} className="text-gray-400 flex-shrink-0" />
          {['all', 'sent', 'received', 'deposit'].map((f) => (
            <button
              key={f}
              onClick={() => setFilter(f)}
              className={`px-3 py-1.5 rounded-full text-xs font-semibold border-none cursor-pointer transition-all whitespace-nowrap ${
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
          <div className="space-y-2">
            {filtered.map((tx, i) => {
              const myUpi = getUpi();
              const isSent = tx.sender_upi === myUpi && tx.type !== 'deposit';
              const isDeposit = tx.type === 'deposit';
              return (
                <button
                  key={tx._id || i}
                  onClick={() => handleViewDetail(tx)}
                  className="w-full flex items-center justify-between bg-white rounded-xl p-4 shadow-sm hover:shadow-md transition-shadow cursor-pointer border-none text-left"
                >
                  <div className="flex items-center gap-3">
                    <div className={`w-10 h-10 rounded-full flex items-center justify-center ${
                      isDeposit ? 'bg-blue-50' : isSent ? 'bg-red-50' : 'bg-green-50'
                    }`}>
                      {isDeposit ? (
                        <Wallet size={18} className="text-blue-500" />
                      ) : isSent ? (
                        <ArrowUpRight size={18} className="text-red-500" />
                      ) : (
                        <ArrowDownLeft size={18} className="text-green-500" />
                      )}
                    </div>
                    <div>
                      <p className="text-sm font-semibold text-gray-800">
                        {isDeposit ? 'Wallet Deposit' : isSent ? `To: ${tx.receiver_upi}` : `From: ${tx.sender_upi}`}
                      </p>
                      <p className="text-xs text-gray-400">{tx.note || 'Transaction'}</p>
                      <p className="text-[10px] text-gray-300">{new Date(tx.timestamp).toLocaleString()}</p>
                    </div>
                  </div>
                  <div className="flex items-center gap-1">
                    <span className={`text-sm font-bold ${
                      isDeposit ? 'text-blue-500' : isSent ? 'text-red-500' : 'text-green-500'
                    }`}>
                      {isSent ? '-' : '+'}{'\u20B9'}{tx.amount?.toLocaleString('en-IN')}
                    </span>
                    <ChevronRight size={14} className="text-gray-300" />
                  </div>
                </button>
              );
            })}
          </div>
        )}
      </main>

      {/* Transaction Detail Modal */}
      {selectedTx && (
        <div className="fixed inset-0 bg-black/50 z-50 flex items-end justify-center" onClick={() => { setSelectedTx(null); setTxDetail(null); }}>
          <div className="bg-white rounded-t-3xl p-6 w-full max-w-[430px] animate-slideUp" onClick={(e) => e.stopPropagation()}>
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-lg font-bold text-gray-800">Transaction Details</h3>
              <button onClick={() => { setSelectedTx(null); setTxDetail(null); }} className="bg-transparent border-none cursor-pointer text-gray-400">
                <X size={20} />
              </button>
            </div>

            {detailLoading ? (
              <div className="flex justify-center py-8">
                <div className="animate-spin w-6 h-6 border-2 border-[#f65e1d] border-t-transparent rounded-full" />
              </div>
            ) : (
              <div className="space-y-4">
                {/* Amount */}
                <div className="text-center py-4 bg-gray-50 rounded-2xl">
                  <p className="text-3xl font-bold text-gray-800">{'\u20B9'}{selectedTx.amount?.toLocaleString('en-IN')}</p>
                  <p className={`text-sm font-medium mt-1 ${
                    selectedTx.type === 'deposit' ? 'text-blue-500' :
                    selectedTx.sender_upi === getUpi() ? 'text-red-500' : 'text-green-500'
                  }`}>
                    {selectedTx.type === 'deposit' ? 'Wallet Deposit' :
                     selectedTx.sender_upi === getUpi() ? 'Money Sent' : 'Money Received'}
                  </p>
                </div>

                {/* Details */}
                <div className="space-y-3">
                  {[
                    { icon: ArrowUpRight, label: 'From', value: txDetail?.senderName || selectedTx.sender_upi },
                    { icon: ArrowDownLeft, label: 'To', value: txDetail?.receiverName || selectedTx.receiver_upi },
                    { icon: FileText, label: 'Note', value: selectedTx.note || 'No note' },
                    { icon: Clock, label: 'Date & Time', value: new Date(selectedTx.timestamp).toLocaleString() },
                    { icon: FileText, label: 'Transaction ID', value: selectedTx._id?.slice(-8)?.toUpperCase() || 'N/A' },
                    { icon: Wallet, label: 'Type', value: selectedTx.type?.charAt(0).toUpperCase() + selectedTx.type?.slice(1) },
                  ].map(({ icon: Icon, label, value }) => (
                    <div key={label} className="flex items-start gap-3">
                      <Icon size={16} className="text-[#f65e1d] mt-0.5 flex-shrink-0" />
                      <div>
                        <p className="text-xs text-gray-400">{label}</p>
                        <p className="text-sm font-medium text-gray-700">{value}</p>
                      </div>
                    </div>
                  ))}
                </div>

                <div className="bg-green-50 rounded-xl p-3 text-center">
                  <p className="text-xs text-green-600 font-medium">Transaction Completed Successfully</p>
                </div>
              </div>
            )}
          </div>
        </div>
      )}

      <BottomNav />
    </div>
  );
}
