import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { api } from '../utils/api';
import TopBar from '../components/TopBar';
import UpiPinModal from '../components/UpiPinModal';
import LoadingOverlay from '../components/LoadingOverlay';
import { Search, User, Send, Loader2, CheckCircle2, Users } from 'lucide-react';

export default function SendMoney() {
  const navigate = useNavigate();
  const { phone } = useAuth();
  const [profile, setProfile] = useState(null);
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedUser, setSelectedUser] = useState(null);
  const [amount, setAmount] = useState('');
  const [note, setNote] = useState('');
  const [loading] = useState(false);
  const [success, setSuccess] = useState(false);
  const [error, setError] = useState('');
  const [searchResults, setSearchResults] = useState([]);
  const [allUsers, setAllUsers] = useState([]);
  const [showUpiPin, setShowUpiPin] = useState(false);
  const [showProcessing, setShowProcessing] = useState(false);

  useEffect(() => {
    if (phone) {
      api.getProfile(phone).then(setProfile).catch(() => {});
      api.getAllUsers(phone).then((data) => {
        if (Array.isArray(data)) setAllUsers(data);
      }).catch(() => {});
    }
  }, [phone]);

  const handleSearch = async () => {
    if (!searchQuery.trim()) return;
    try {
      const data = await api.searchUsers(searchQuery);
      if (Array.isArray(data)) {
        setSearchResults(data.filter((u) => u.phone !== phone));
      } else {
        setSearchResults([]);
      }
    } catch {
      setSearchResults([]);
    }
  };

  const handleInitiateSend = () => {
    if (!selectedUser || !amount || parseFloat(amount) <= 0) {
      setError('Please select a user and enter a valid amount.');
      return;
    }
    setError('');
    setShowUpiPin(true);
  };

  const handleSend = async () => {
    setShowUpiPin(false);
    setShowProcessing(true);

    const senderUpi = Array.isArray(profile?.upi_id) ? profile.upi_id[0] : profile?.upi_id;
    const receiverUpi = Array.isArray(selectedUser.upi_id) ? selectedUser.upi_id[0] : selectedUser.upi_id;

    if (!senderUpi || !receiverUpi) {
      setError('UPI ID not found. Please complete your profile.');
      setShowProcessing(false);
      return;
    }

    // Simulate processing delay for better UX
    await new Promise((r) => setTimeout(r, 1500));

    try {
      const data = await api.transferMoney({
        sender_upi: senderUpi,
        receiver_upi: receiverUpi,
        amount: parseFloat(amount),
        note: note || 'Money sent',
      });

      setShowProcessing(false);

      if (data.message === 'Transaction successful') {
        setSuccess(true);
        setTimeout(() => navigate('/dashboard'), 2500);
      } else {
        setError(data.message || 'Transaction failed.');
      }
    } catch {
      setShowProcessing(false);
      setError('Error processing transaction.');
    }
  };

  if (success) {
    return (
      <div className="min-h-screen gradient-warm flex flex-col items-center justify-center animate-fadeIn">
        <div className="bg-white rounded-3xl shadow-xl p-8 text-center">
          <CheckCircle2 size={64} className="text-green-500 mx-auto mb-4" />
          <h2 className="text-xl font-bold text-gray-800 mb-2">Payment Successful!</h2>
          <p className="text-gray-500">{'\u20B9'}{parseFloat(amount).toLocaleString('en-IN')} sent to {selectedUser?.displayName}</p>
          <p className="text-sm text-gray-400 mt-2">Redirecting to dashboard...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen gradient-warm">
      <TopBar title="Send Money" />

      {showProcessing && <LoadingOverlay message="Processing Payment..." />}
      {showUpiPin && (
        <UpiPinModal
          phone={phone}
          onSuccess={handleSend}
          onClose={() => setShowUpiPin(false)}
        />
      )}

      <main className="px-4 pt-5 pb-8 animate-fadeIn">
        {/* Search */}
        <div className="flex items-center gap-2 bg-white rounded-xl px-4 py-3 mb-4 shadow-sm border-2 border-gray-100 focus-within:border-[#f65e1d] transition-colors">
          <Search size={18} className="text-[#f65e1d]" />
          <input
            type="text"
            placeholder="Search phone number or UPI ID"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            onKeyDown={(e) => e.key === 'Enter' && handleSearch()}
            className="flex-1 bg-transparent border-none outline-none text-sm text-gray-800 placeholder-gray-400"
          />
          <button
            onClick={handleSearch}
            className="px-3 py-1.5 bg-[#f65e1d] text-white text-xs rounded-lg border-none cursor-pointer font-medium"
          >
            Search
          </button>
        </div>

        {/* Search Results */}
        {searchResults.length > 0 && !selectedUser && (
          <div className="mb-4 space-y-2">
            <h4 className="text-sm font-semibold text-gray-500">Search Results</h4>
            {searchResults.map((u, i) => (
              <button
                key={i}
                onClick={() => setSelectedUser(u)}
                className="w-full flex items-center gap-3 bg-white rounded-xl p-3 shadow-sm hover:bg-orange-50 transition-colors cursor-pointer border-none text-left"
              >
                <div className="w-10 h-10 rounded-full bg-orange-100 flex items-center justify-center">
                  <User size={18} className="text-[#f65e1d]" />
                </div>
                <div>
                  <p className="text-sm font-semibold text-gray-800">{u.displayName}</p>
                  <p className="text-xs text-gray-400">{u.phone}</p>
                </div>
              </button>
            ))}
          </div>
        )}

        {/* Selected User & Amount */}
        {selectedUser && (
          <div className="animate-slideUp">
            <div className="flex items-center gap-3 bg-orange-50 rounded-xl p-4 mb-4 border border-[#f65e1d]/20">
              <div className="w-12 h-12 rounded-full bg-orange-100 flex items-center justify-center">
                <User size={20} className="text-[#f65e1d]" />
              </div>
              <div className="flex-1">
                <p className="text-sm font-bold text-gray-800">{selectedUser.displayName}</p>
                <p className="text-xs text-gray-500">{Array.isArray(selectedUser.upi_id) ? selectedUser.upi_id[0] : selectedUser.upi_id}</p>
              </div>
              <button
                onClick={() => { setSelectedUser(null); setSearchResults([]); }}
                className="text-xs text-gray-400 bg-transparent border-none cursor-pointer"
              >
                Change
              </button>
            </div>

            <div className="bg-white rounded-xl p-4 shadow-sm space-y-4">
              <div>
                <label className="text-xs font-medium text-gray-500 mb-1 block">Amount ({'\u20B9'})</label>
                <input
                  type="number"
                  placeholder="0.00"
                  value={amount}
                  onChange={(e) => setAmount(e.target.value)}
                  className="w-full text-3xl font-bold text-gray-800 border-none outline-none bg-transparent placeholder-gray-300"
                />
              </div>

              <div>
                <label className="text-xs font-medium text-gray-500 mb-1 block">Note (optional)</label>
                <input
                  type="text"
                  placeholder="Add a note..."
                  value={note}
                  onChange={(e) => setNote(e.target.value)}
                  className="w-full text-sm text-gray-700 border border-gray-200 rounded-lg px-3 py-2 outline-none focus:border-[#f65e1d] bg-gray-50"
                />
              </div>

              {error && <p className="text-red-500 text-sm">{error}</p>}

              <button
                onClick={handleInitiateSend}
                disabled={loading}
                className="w-full py-3.5 bg-[#f65e1d] hover:bg-[#e5531a] text-white font-semibold rounded-xl shadow-md transition-all flex items-center justify-center gap-2 cursor-pointer border-none text-base disabled:opacity-60"
              >
                {loading ? <Loader2 size={18} className="animate-spin" /> : <Send size={18} />}
                Pay {'\u20B9'}{amount || '0'}
              </button>
            </div>
          </div>
        )}

        {/* All Users List */}
        {!selectedUser && searchResults.length === 0 && (
          <div>
            <h4 className="text-sm font-semibold text-gray-500 mb-3 flex items-center gap-2">
              <Users size={16} /> People on GradPay
            </h4>
            {allUsers.length === 0 ? (
              <p className="text-sm text-gray-400 text-center py-8">No other users found. Search to find someone.</p>
            ) : (
              <div className="space-y-2">
                {allUsers.map((u, i) => (
                  <button
                    key={i}
                    onClick={() => setSelectedUser(u)}
                    className="w-full flex items-center gap-3 bg-white rounded-xl p-3 shadow-sm hover:bg-orange-50 transition-colors cursor-pointer border-none text-left"
                  >
                    <div className="w-10 h-10 rounded-full bg-orange-100 flex items-center justify-center">
                      <User size={18} className="text-[#f65e1d]" />
                    </div>
                    <div className="flex-1">
                      <p className="text-sm font-semibold text-gray-800">{u.displayName}</p>
                      <p className="text-xs text-gray-400">{Array.isArray(u.upi_id) ? u.upi_id[0] : u.upi_id}</p>
                    </div>
                    <span className="text-xs text-[#f65e1d] font-medium">Pay</span>
                  </button>
                ))}
              </div>
            )}
          </div>
        )}
      </main>
    </div>
  );
}
