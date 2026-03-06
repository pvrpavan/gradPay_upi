import { useState, useEffect } from 'react';
import { useAuth } from '../context/AuthContext';
import { api } from '../utils/api';
import TopBar from '../components/TopBar';
import { Moon, Sun, Bell, BellOff, Fingerprint, Globe, Lock, Shield, ChevronRight } from 'lucide-react';

export default function Settings() {
  const { phone } = useAuth();
  const [settings, setSettings] = useState({
    theme: 'light',
    notifications: true,
    biometric: false,
    language: 'en',
  });
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [showUpiPin, setShowUpiPin] = useState(false);
  const [upiPin, setUpiPin] = useState('');
  const [pinMsg, setPinMsg] = useState('');

  useEffect(() => {
    if (phone) {
      api.getProfile(phone).then((data) => {
        setSettings({
          theme: data.theme || 'light',
          notifications: data.notifications !== false,
          biometric: data.biometric || false,
          language: data.language || 'en',
        });
        setLoading(false);
      }).catch(() => setLoading(false));
    }
  }, [phone]);

  const handleToggle = async (key) => {
    const newVal = !settings[key];
    const newSettings = { ...settings, [key]: newVal };
    setSettings(newSettings);
    setSaving(true);
    try {
      await api.updateSettings({ phone, [key]: newVal });
    } catch { /* ignore */ }
    setSaving(false);
  };

  const handleThemeToggle = async () => {
    const newTheme = settings.theme === 'light' ? 'dark' : 'light';
    setSettings({ ...settings, theme: newTheme });
    setSaving(true);
    try {
      await api.updateSettings({ phone, theme: newTheme });
    } catch { /* ignore */ }
    setSaving(false);
  };

  const handleSetUpiPin = async () => {
    if (!upiPin || upiPin.length < 4) {
      setPinMsg('PIN must be at least 4 digits');
      return;
    }
    try {
      const data = await api.setUpiPin(phone, upiPin);
      if (data.error) setPinMsg(data.error);
      else { setPinMsg('UPI PIN set successfully!'); setShowUpiPin(false); setUpiPin(''); }
    } catch { setPinMsg('Failed to set PIN'); }
  };

  const handleLanguageChange = async (lang) => {
    setSettings({ ...settings, language: lang });
    try {
      await api.updateSettings({ phone, language: lang });
    } catch { /* ignore */ }
  };

  if (loading) {
    return (
      <div className="min-h-screen gradient-warm flex items-center justify-center">
        <div className="animate-spin w-8 h-8 border-3 border-[#f65e1d] border-t-transparent rounded-full" />
      </div>
    );
  }

  return (
    <div className="min-h-screen gradient-warm">
      <TopBar title="Settings" />
      <main className="px-4 pt-5 pb-8 animate-fadeIn">
        {saving && <p className="text-xs text-center text-[#f65e1d] mb-2">Saving...</p>}

        {/* Theme */}
        <section className="mb-5">
          <h4 className="text-xs font-semibold text-gray-400 uppercase tracking-wide mb-2">Appearance</h4>
          <button
            onClick={handleThemeToggle}
            className="w-full flex items-center justify-between bg-white rounded-2xl p-4 shadow-sm cursor-pointer border-none"
          >
            <div className="flex items-center gap-3">
              {settings.theme === 'light' ? <Sun size={20} className="text-yellow-500" /> : <Moon size={20} className="text-indigo-500" />}
              <div className="text-left">
                <p className="text-sm font-medium text-gray-800">Theme</p>
                <p className="text-xs text-gray-400">{settings.theme === 'light' ? 'Light Mode' : 'Dark Mode'}</p>
              </div>
            </div>
            <div className={`w-12 h-6 rounded-full transition-colors ${settings.theme === 'dark' ? 'bg-[#f65e1d]' : 'bg-gray-300'} relative`}>
              <div className={`w-5 h-5 bg-white rounded-full absolute top-0.5 transition-all ${settings.theme === 'dark' ? 'left-6' : 'left-0.5'}`} />
            </div>
          </button>
        </section>

        {/* Notifications */}
        <section className="mb-5">
          <h4 className="text-xs font-semibold text-gray-400 uppercase tracking-wide mb-2">Notifications</h4>
          <button
            onClick={() => handleToggle('notifications')}
            className="w-full flex items-center justify-between bg-white rounded-2xl p-4 shadow-sm cursor-pointer border-none"
          >
            <div className="flex items-center gap-3">
              {settings.notifications ? <Bell size={20} className="text-green-500" /> : <BellOff size={20} className="text-gray-400" />}
              <div className="text-left">
                <p className="text-sm font-medium text-gray-800">Push Notifications</p>
                <p className="text-xs text-gray-400">{settings.notifications ? 'Enabled' : 'Disabled'}</p>
              </div>
            </div>
            <div className={`w-12 h-6 rounded-full transition-colors ${settings.notifications ? 'bg-green-500' : 'bg-gray-300'} relative`}>
              <div className={`w-5 h-5 bg-white rounded-full absolute top-0.5 transition-all ${settings.notifications ? 'left-6' : 'left-0.5'}`} />
            </div>
          </button>
        </section>

        {/* Security */}
        <section className="mb-5">
          <h4 className="text-xs font-semibold text-gray-400 uppercase tracking-wide mb-2">Security</h4>
          <div className="space-y-2">
            <button
              onClick={() => handleToggle('biometric')}
              className="w-full flex items-center justify-between bg-white rounded-2xl p-4 shadow-sm cursor-pointer border-none"
            >
              <div className="flex items-center gap-3">
                <Fingerprint size={20} className={settings.biometric ? 'text-[#f65e1d]' : 'text-gray-400'} />
                <div className="text-left">
                  <p className="text-sm font-medium text-gray-800">Biometric Login</p>
                  <p className="text-xs text-gray-400">{settings.biometric ? 'Enabled' : 'Disabled'}</p>
                </div>
              </div>
              <div className={`w-12 h-6 rounded-full transition-colors ${settings.biometric ? 'bg-[#f65e1d]' : 'bg-gray-300'} relative`}>
                <div className={`w-5 h-5 bg-white rounded-full absolute top-0.5 transition-all ${settings.biometric ? 'left-6' : 'left-0.5'}`} />
              </div>
            </button>

            <button
              onClick={() => setShowUpiPin(true)}
              className="w-full flex items-center justify-between bg-white rounded-2xl p-4 shadow-sm cursor-pointer border-none"
            >
              <div className="flex items-center gap-3">
                <Lock size={20} className="text-[#f65e1d]" />
                <div className="text-left">
                  <p className="text-sm font-medium text-gray-800">Set UPI PIN</p>
                  <p className="text-xs text-gray-400">Required for transactions</p>
                </div>
              </div>
              <ChevronRight size={18} className="text-gray-400" />
            </button>
          </div>
        </section>

        {/* Language */}
        <section className="mb-5">
          <h4 className="text-xs font-semibold text-gray-400 uppercase tracking-wide mb-2">Language</h4>
          <div className="bg-white rounded-2xl p-4 shadow-sm">
            <div className="flex items-center gap-3 mb-3">
              <Globe size={20} className="text-[#f65e1d]" />
              <p className="text-sm font-medium text-gray-800">App Language</p>
            </div>
            <div className="grid grid-cols-3 gap-2">
              {[
                { code: 'en', label: 'English' },
                { code: 'hi', label: 'Hindi' },
                { code: 'te', label: 'Telugu' },
              ].map(({ code, label }) => (
                <button
                  key={code}
                  onClick={() => handleLanguageChange(code)}
                  className={`py-2 rounded-xl text-sm font-medium border-none cursor-pointer transition-all ${
                    settings.language === code
                      ? 'bg-[#f65e1d] text-white shadow-md'
                      : 'bg-gray-50 text-gray-600 hover:bg-orange-50'
                  }`}
                >
                  {label}
                </button>
              ))}
            </div>
          </div>
        </section>

        {/* About */}
        <section className="mb-5">
          <h4 className="text-xs font-semibold text-gray-400 uppercase tracking-wide mb-2">About</h4>
          <div className="bg-white rounded-2xl p-4 shadow-sm space-y-2">
            <div className="flex items-center gap-3">
              <Shield size={20} className="text-[#f65e1d]" />
              <div>
                <p className="text-sm font-medium text-gray-800">GradPay UPI v1.0</p>
                <p className="text-xs text-gray-400">Made with love by Gradious Team</p>
              </div>
            </div>
          </div>
        </section>
      </main>

      {/* UPI PIN Modal */}
      {showUpiPin && (
        <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center px-4" onClick={() => setShowUpiPin(false)}>
          <div className="bg-white rounded-2xl p-6 w-full max-w-sm animate-slideUp" onClick={(e) => e.stopPropagation()}>
            <h3 className="text-lg font-bold text-gray-800 mb-3 flex items-center gap-2"><Lock size={20} className="text-[#f65e1d]" /> Set UPI PIN</h3>
            <p className="text-xs text-gray-400 mb-4">Enter a 4-6 digit PIN for secure transactions</p>
            <input
              type="password"
              maxLength={6}
              value={upiPin}
              onChange={(e) => setUpiPin(e.target.value.replace(/\D/g, ''))}
              placeholder="Enter UPI PIN"
              className="w-full px-4 py-3 text-center text-2xl tracking-widest border-2 border-gray-200 rounded-xl outline-none focus:border-[#f65e1d] mb-3"
            />
            {pinMsg && <p className="text-xs text-center text-blue-600 mb-2">{pinMsg}</p>}
            <div className="flex gap-2">
              <button onClick={() => { setShowUpiPin(false); setUpiPin(''); setPinMsg(''); }} className="flex-1 py-2.5 bg-gray-100 text-gray-600 rounded-xl border-none cursor-pointer text-sm font-medium">Cancel</button>
              <button onClick={handleSetUpiPin} className="flex-1 py-2.5 bg-[#f65e1d] text-white rounded-xl border-none cursor-pointer text-sm font-medium">Set PIN</button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
