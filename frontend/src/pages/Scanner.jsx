import { useState } from 'react';
import TopBar from '../components/TopBar';
import BottomNav from '../components/BottomNav';
import { Camera, QrCode, Copy, Check } from 'lucide-react';

export default function Scanner() {
  const [scanResult, setScanResult] = useState('');
  const [copied, setCopied] = useState(false);
  const [scanning, setScanning] = useState(false);

  const handleStartScan = () => {
    setScanning(true);
    setScanResult('');
    // Simulated scan - in production, this would use the camera
    setTimeout(() => {
      setScanResult('upi://pay?pa=demo@gradpay&pn=Demo User&am=100');
      setScanning(false);
    }, 2000);
  };

  const handleCopy = () => {
    navigator.clipboard.writeText(scanResult);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <div className="min-h-screen gradient-warm pb-20">
      <TopBar title="QR Scanner" showBack={false} />

      <main className="px-4 pt-6 animate-fadeIn">
        {/* Scanner Area */}
        <div className="flex flex-col items-center">
          <div className="w-64 h-64 rounded-3xl border-4 border-dashed border-[#f65e1d]/40 flex items-center justify-center bg-white/50 shadow-inner mb-6 relative overflow-hidden">
            {scanning ? (
              <div className="flex flex-col items-center gap-3">
                <div className="w-48 h-1 bg-[#f65e1d] rounded animate-bounce" />
                <Camera size={40} className="text-[#f65e1d] animate-pulse" />
                <p className="text-xs text-gray-500">Scanning...</p>
              </div>
            ) : (
              <div className="flex flex-col items-center gap-3">
                <QrCode size={48} className="text-[#f65e1d]/40" />
                <p className="text-xs text-gray-400 text-center px-4">
                  Tap the button below to scan a QR code
                </p>
              </div>
            )}
          </div>

          <button
            onClick={handleStartScan}
            disabled={scanning}
            className="px-8 py-3 bg-[#f65e1d] hover:bg-[#e5531a] text-white font-semibold rounded-full shadow-lg transition-all flex items-center gap-2 cursor-pointer border-none text-sm disabled:opacity-60"
          >
            <Camera size={18} />
            {scanning ? 'Scanning...' : 'Start Scanning'}
          </button>
        </div>

        {/* Scan Result */}
        {scanResult && (
          <div className="mt-6 bg-white rounded-2xl p-4 shadow-sm animate-slideUp">
            <h4 className="text-sm font-semibold text-gray-500 mb-2">Scan Result</h4>
            <div className="flex items-center justify-between bg-gray-50 rounded-xl p-3">
              <p className="text-sm text-gray-700 truncate flex-1">{scanResult}</p>
              <button
                onClick={handleCopy}
                className="ml-2 bg-transparent border-none cursor-pointer text-[#f65e1d]"
              >
                {copied ? <Check size={16} /> : <Copy size={16} />}
              </button>
            </div>
          </div>
        )}

        {/* My QR Code Section */}
        <div className="mt-8 bg-white rounded-2xl p-5 shadow-sm text-center">
          <h4 className="text-sm font-semibold text-gray-500 mb-3">Your QR Code</h4>
          <div className="inline-block p-4 bg-orange-50 rounded-2xl border-2 border-dashed border-[#f65e1d]/30">
            <img
              src="/photos/qr-image.png"
              alt="Your QR Code"
              className="w-32 h-32 object-contain"
            />
          </div>
          <p className="text-xs text-gray-400 mt-3">Share this QR code to receive payments</p>
        </div>
      </main>

      <BottomNav />
    </div>
  );
}
