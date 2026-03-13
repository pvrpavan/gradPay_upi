import { useState, useEffect, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { useTheme } from '../context/ThemeContext';
import { api } from '../utils/api';
import TopBar from '../components/TopBar';
import BottomNav from '../components/BottomNav';
import { Camera, QrCode, Copy, Check, Send, AlertCircle } from 'lucide-react';

export default function Scanner() {
  const navigate = useNavigate();
  const { phone } = useAuth();
  const { theme, isDark } = useTheme();
  const [scanResult, setScanResult] = useState('');
  const [copied, setCopied] = useState(false);
  const [scanning, setScanning] = useState(false);
  const [profile, setProfile] = useState(null);
  const [cameraError, setCameraError] = useState('');
  const videoRef = useRef(null);
  const streamRef = useRef(null);

  useEffect(() => {
    if (phone) {
      api.getProfile(phone).then(setProfile).catch(() => {});
    }
    return () => {
      if (streamRef.current) {
        streamRef.current.getTracks().forEach((t) => t.stop());
      }
    };
  }, [phone]);

  const handleStartScan = async () => {
    setScanning(true);
    setScanResult('');
    setCameraError('');

    try {
      const stream = await navigator.mediaDevices.getUserMedia({
        video: { facingMode: 'environment' },
      });
      streamRef.current = stream;
      if (videoRef.current) {
        videoRef.current.srcObject = stream;
        videoRef.current.play();
      }
      setTimeout(() => {
        const sampleUpis = ['rahul.3210@gradpay', 'priya.3211@gradpay', 'amit.3212@gradpay'];
        const randomUpi = sampleUpis[Math.floor(Math.random() * sampleUpis.length)];
        setScanResult(`upi://pay?pa=${randomUpi}&pn=GradPay User`);
        handleStopScan();
      }, 3000);
    } catch {
      setCameraError('Camera access denied or not available. Using simulated scan.');
      setTimeout(() => {
        const sampleUpis = ['rahul.3210@gradpay', 'priya.3211@gradpay', 'amit.3212@gradpay'];
        const randomUpi = sampleUpis[Math.floor(Math.random() * sampleUpis.length)];
        setScanResult(`upi://pay?pa=${randomUpi}&pn=GradPay User`);
        setScanning(false);
      }, 2000);
    }
  };

  const handleStopScan = () => {
    setScanning(false);
    if (streamRef.current) {
      streamRef.current.getTracks().forEach((t) => t.stop());
      streamRef.current = null;
    }
  };

  const handleCopy = () => {
    navigator.clipboard.writeText(scanResult);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const handlePayFromScan = () => {
    const match = scanResult.match(/pa=([^&]+)/);
    if (match) {
      navigate(`/send-money?upi=${match[1]}`);
    } else {
      navigate('/send-money');
    }
  };

  return (
    <div className="min-h-screen pb-20" style={{ background: `linear-gradient(135deg, ${theme.gradientFrom}, ${theme.gradientTo})` }}>
      <TopBar title="QR Scanner" showBack={false} />

      <main className="px-4 pt-6 animate-fadeIn">
        {/* Scanner Area */}
        <div className="flex flex-col items-center">
          <div className="w-64 h-64 rounded-3xl border-4 border-dashed flex items-center justify-center bg-black/80 shadow-inner mb-6 relative overflow-hidden" style={{ borderColor: `${theme.brand}66` }}>
            {scanning ? (
              <>
                <video ref={videoRef} className="absolute inset-0 w-full h-full object-cover rounded-3xl" muted playsInline />
                <div className="absolute inset-0 flex flex-col items-center justify-center z-10">
                  <div className="w-48 h-0.5 rounded animate-bounce shadow-lg" style={{ backgroundColor: theme.brand, boxShadow: `0 0 10px ${theme.brand}` }} />
                  <p className="text-xs text-white mt-3 bg-black/50 px-3 py-1 rounded-full">Scanning...</p>
                </div>
                <div className="absolute top-3 left-3 w-8 h-8 border-t-3 border-l-3 rounded-tl-lg z-10" style={{ borderColor: theme.brand }} />
                <div className="absolute top-3 right-3 w-8 h-8 border-t-3 border-r-3 rounded-tr-lg z-10" style={{ borderColor: theme.brand }} />
                <div className="absolute bottom-3 left-3 w-8 h-8 border-b-3 border-l-3 rounded-bl-lg z-10" style={{ borderColor: theme.brand }} />
                <div className="absolute bottom-3 right-3 w-8 h-8 border-b-3 border-r-3 rounded-br-lg z-10" style={{ borderColor: theme.brand }} />
              </>
            ) : (
              <div className="flex flex-col items-center gap-3">
                <QrCode size={48} style={{ color: `${theme.brand}99` }} />
                <p className="text-xs text-center px-4" style={{ color: theme.textMuted }}>
                  Tap the button below to scan a QR code
                </p>
              </div>
            )}
          </div>

          {cameraError && (
            <div className="flex items-center gap-2 text-xs rounded-lg px-3 py-2 mb-3" style={{ color: theme.warning, backgroundColor: isDark ? theme.bgCard : '#fffbeb' }}>
              <AlertCircle size={14} /> {cameraError}
            </div>
          )}

          <button
            onClick={scanning ? handleStopScan : handleStartScan}
            className="px-8 py-3 text-white font-semibold rounded-full shadow-lg transition-all flex items-center gap-2 cursor-pointer border-none text-sm"
            style={{ backgroundColor: theme.brand }}
          >
            <Camera size={18} />
            {scanning ? 'Stop Scanning' : 'Start Scanning'}
          </button>
        </div>

        {/* Scan Result */}
        {scanResult && (
          <div className="mt-6 rounded-2xl p-4 shadow-sm animate-slideUp" style={{ backgroundColor: theme.bgCard }}>
            <h4 className="text-sm font-semibold mb-2" style={{ color: theme.textSecondary }}>Scan Result</h4>
            <div className="flex items-center justify-between rounded-xl p-3 mb-3" style={{ backgroundColor: theme.inputBg }}>
              <p className="text-sm truncate flex-1" style={{ color: theme.text }}>{scanResult}</p>
              <button
                onClick={handleCopy}
                className="ml-2 bg-transparent border-none cursor-pointer"
                style={{ color: theme.brand }}
              >
                {copied ? <Check size={16} /> : <Copy size={16} />}
              </button>
            </div>
            <button
              onClick={handlePayFromScan}
              className="w-full py-3 text-white rounded-xl border-none cursor-pointer font-semibold text-sm flex items-center justify-center gap-2 transition-colors"
              style={{ backgroundColor: theme.brand }}
            >
              <Send size={16} /> Pay Now
            </button>
          </div>
        )}

        {/* My QR Code Section */}
        <div className="mt-6 rounded-2xl p-5 shadow-sm text-center" style={{ backgroundColor: theme.bgCard }}>
          <h4 className="text-sm font-semibold mb-3" style={{ color: theme.textSecondary }}>Your QR Code</h4>
          <div className="inline-block p-4 rounded-2xl border-2 border-dashed" style={{ backgroundColor: isDark ? theme.bgSecondary : theme.brandBg, borderColor: `${theme.brand}4D` }}>
            {profile?.qr_code_url ? (
              <img src={profile.qr_code_url} alt="Your QR Code" className="w-40 h-40 object-contain" />
            ) : (
              <div className="w-32 h-32 flex items-center justify-center">
                <QrCode size={48} style={{ color: theme.textMuted }} />
              </div>
            )}
          </div>
          <p className="text-xs mt-3" style={{ color: theme.textMuted }}>Share this QR code to receive payments</p>
        </div>
      </main>

      <BottomNav />
    </div>
  );
}
