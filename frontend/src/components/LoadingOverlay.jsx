import { Loader2 } from 'lucide-react';

export default function LoadingOverlay({ message = 'Processing...' }) {
  return (
    <div className="fixed inset-0 bg-black/50 z-[100] flex items-center justify-center">
      <div className="bg-white rounded-3xl p-8 flex flex-col items-center gap-4 shadow-2xl animate-slideUp max-w-xs w-full mx-4">
        {/* 3D-style animated loader */}
        <div className="relative w-20 h-20">
          <div className="absolute inset-0 rounded-full border-4 border-[#f65e1d]/20" />
          <div className="absolute inset-0 rounded-full border-4 border-transparent border-t-[#f65e1d] animate-spin" />
          <div className="absolute inset-2 rounded-full border-4 border-transparent border-b-[#ff9800] animate-spin" style={{ animationDirection: 'reverse', animationDuration: '0.8s' }} />
          <div className="absolute inset-4 rounded-full bg-gradient-to-br from-[#f65e1d] to-[#ff9800] flex items-center justify-center shadow-lg">
            <span className="text-white text-lg font-bold">G</span>
          </div>
        </div>
        <div className="text-center">
          <p className="text-base font-semibold text-gray-800">{message}</p>
          <p className="text-xs text-gray-400 mt-1">Please wait a moment...</p>
        </div>
        <div className="flex gap-1">
          {[0, 1, 2].map((i) => (
            <div
              key={i}
              className="w-2 h-2 rounded-full bg-[#f65e1d]"
              style={{ animation: `bounce 1.4s ease-in-out ${i * 0.16}s infinite both` }}
            />
          ))}
        </div>
        <style>{`
          @keyframes bounce {
            0%, 80%, 100% { transform: scale(0.6); opacity: 0.4; }
            40% { transform: scale(1); opacity: 1; }
          }
        `}</style>
      </div>
    </div>
  );
}
