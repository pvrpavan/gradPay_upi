import { useState } from 'react';
import { Lock, X, Loader2 } from 'lucide-react';
import { api } from '../utils/api';

export default function UpiPinModal({ phone, onSuccess, onClose }) {
  const [pin, setPin] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const handleVerify = async () => {
    if (!pin || pin.length < 4) {
      setError('Enter a valid 4-6 digit UPI PIN');
      return;
    }
    setLoading(true);
    setError('');
    try {
      const data = await api.verifyUpiPin(phone, pin);
      if (data.error) {
        if (data.notSet) {
          setError('UPI PIN not set. Go to Settings to set one.');
        } else {
          setError(data.error);
        }
      } else {
        onSuccess();
      }
    } catch {
      setError('Verification failed');
    }
    setLoading(false);
  };

  return (
    <div className="fixed inset-0 bg-black/60 z-50 flex items-center justify-center px-4" onClick={onClose}>
      <div className="bg-white rounded-3xl p-6 w-full max-w-sm animate-slideUp shadow-2xl" onClick={(e) => e.stopPropagation()}>
        <div className="flex items-center justify-between mb-4">
          <h3 className="text-lg font-bold text-gray-800 flex items-center gap-2">
            <Lock size={20} className="text-[#6C63FF]" /> Enter UPI PIN
          </h3>
          <button onClick={onClose} className="bg-transparent border-none cursor-pointer text-gray-400 hover:text-gray-600">
            <X size={20} />
          </button>
        </div>

        <p className="text-xs text-gray-400 mb-5">Enter your UPI PIN to authorize this transaction</p>

        <div className="flex justify-center gap-3 mb-5">
          {[0, 1, 2, 3].map((i) => (
            <div
              key={i}
              className={`w-12 h-12 rounded-xl border-2 flex items-center justify-center text-xl font-bold transition-all ${
                pin.length > i ? 'border-[#6C63FF] bg-indigo-50 text-[#6C63FF]' : 'border-gray-200 bg-gray-50'
              }`}
            >
              {pin.length > i ? '\u2022' : ''}
            </div>
          ))}
        </div>

        <input
          type="tel"
          maxLength={6}
          value={pin}
          onChange={(e) => setPin(e.target.value.replace(/\D/g, ''))}
          className="opacity-0 absolute"
          autoFocus
        />

        {/* Numeric Keypad */}
        <div className="grid grid-cols-3 gap-2 mb-4">
          {[1, 2, 3, 4, 5, 6, 7, 8, 9, '', 0, 'del'].map((key, i) => (
            <button
              key={i}
              onClick={() => {
                if (key === 'del') setPin((p) => p.slice(0, -1));
                else if (key !== '' && pin.length < 6) setPin((p) => p + key);
              }}
              disabled={key === ''}
              className={`py-3 rounded-xl text-lg font-bold border-none cursor-pointer transition-all ${
                key === '' ? 'bg-transparent' :
                key === 'del' ? 'bg-red-50 text-red-500 hover:bg-red-100' :
                'bg-gray-50 text-gray-800 hover:bg-indigo-50 hover:text-[#6C63FF] active:scale-95'
              }`}
            >
              {key === 'del' ? '\u232B' : key}
            </button>
          ))}
        </div>

        {error && <p className="text-xs text-center text-red-500 mb-3">{error}</p>}

        <button
          onClick={handleVerify}
          disabled={loading || pin.length < 4}
          className="w-full py-3.5 bg-[#6C63FF] hover:bg-[#5B54E6] disabled:bg-gray-300 text-white font-bold rounded-xl border-none cursor-pointer disabled:cursor-not-allowed transition-all flex items-center justify-center gap-2 text-base shadow-lg"
        >
          {loading ? <Loader2 size={18} className="animate-spin" /> : 'Confirm Payment'}
        </button>
      </div>
    </div>
  );
}
