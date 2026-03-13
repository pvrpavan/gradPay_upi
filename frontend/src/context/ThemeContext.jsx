import { createContext, useContext, useState, useEffect } from 'react';

const ThemeContext = createContext(null);

const THEMES = {
  light: {
    name: 'Light',
    key: 'light',
    bg: '#F8F7FF',
    bgSecondary: '#ffffff',
    bgCard: '#ffffff',
    bgGlass: 'rgba(255, 255, 255, 0.7)',
    text: '#1f2937',
    textSecondary: '#6b7280',
    textMuted: '#9ca3af',
    brand: '#6C63FF',
    brandLight: '#A78BFA',
    brandBg: '#F0EDFF',
    gradientFrom: '#F8F7FF',
    gradientTo: '#EDE9FE',
    border: '#e5e7eb',
    borderLight: '#f3f4f6',
    shadow: 'rgba(0, 0, 0, 0.05)',
    inputBg: '#f9fafb',
    navBg: '#ffffff',
    success: '#22c55e',
    danger: '#ef4444',
    warning: '#f59e0b',
  },
  dark: {
    name: 'Dark',
    key: 'dark',
    bg: '#0F0D1A',
    bgSecondary: '#1A1730',
    bgCard: '#1A1730',
    bgGlass: 'rgba(26, 23, 48, 0.8)',
    text: '#f1f5f9',
    textSecondary: '#94a3b8',
    textMuted: '#64748b',
    brand: '#8B7FFF',
    brandLight: '#A78BFA',
    brandBg: '#1A1240',
    gradientFrom: '#0F0D1A',
    gradientTo: '#1A1730',
    border: '#2D2A45',
    borderLight: '#1A1730',
    shadow: 'rgba(0, 0, 0, 0.3)',
    inputBg: '#1A1730',
    navBg: '#1A1730',
    success: '#22c55e',
    danger: '#ef4444',
    warning: '#f59e0b',
  },
  midnight: {
    name: 'Midnight Blue',
    key: 'midnight',
    bg: '#0c1222',
    bgSecondary: '#162032',
    bgCard: '#162032',
    bgGlass: 'rgba(22, 32, 50, 0.8)',
    text: '#e2e8f0',
    textSecondary: '#8b9dc3',
    textMuted: '#5a7099',
    brand: '#7C6FFF',
    brandLight: '#9B8FFF',
    brandBg: '#0c1a33',
    gradientFrom: '#0c1222',
    gradientTo: '#162032',
    border: '#1e3a5f',
    borderLight: '#162032',
    shadow: 'rgba(0, 0, 0, 0.4)',
    inputBg: '#162032',
    navBg: '#162032',
    success: '#22c55e',
    danger: '#ef4444',
    warning: '#f59e0b',
  },
  emerald: {
    name: 'Emerald',
    key: 'emerald',
    bg: '#ecfdf5',
    bgSecondary: '#ffffff',
    bgCard: '#ffffff',
    bgGlass: 'rgba(255, 255, 255, 0.7)',
    text: '#1f2937',
    textSecondary: '#6b7280',
    textMuted: '#9ca3af',
    brand: '#059669',
    brandLight: '#34d399',
    brandBg: '#ecfdf5',
    gradientFrom: '#ecfdf5',
    gradientTo: '#d1fae5',
    border: '#d1fae5',
    borderLight: '#ecfdf5',
    shadow: 'rgba(0, 0, 0, 0.05)',
    inputBg: '#f0fdf4',
    navBg: '#ffffff',
    success: '#22c55e',
    danger: '#ef4444',
    warning: '#f59e0b',
  },
};

export function ThemeProvider({ children }) {
  const [themeKey, setThemeKey] = useState(() => {
    return localStorage.getItem('gradpay-theme') || 'light';
  });

  const theme = THEMES[themeKey] || THEMES.light;

  useEffect(() => {
    localStorage.setItem('gradpay-theme', themeKey);
    const root = document.documentElement;

    // Apply CSS custom properties
    Object.entries(theme).forEach(([key, value]) => {
      if (key === 'name' || key === 'key') return;
      root.style.setProperty(`--theme-${key}`, value);
    });

    // Set body class for dark mode detection
    document.body.classList.remove('theme-light', 'theme-dark', 'theme-midnight', 'theme-emerald');
    document.body.classList.add(`theme-${themeKey}`);

    // Update body background
    document.body.style.background = theme.bg;
  }, [themeKey, theme]);

  const setTheme = (key) => {
    if (THEMES[key]) {
      setThemeKey(key);
    }
  };

  const isDark = themeKey === 'dark' || themeKey === 'midnight';

  return (
    <ThemeContext.Provider value={{ theme, themeKey, setTheme, isDark, themes: THEMES }}>
      {children}
    </ThemeContext.Provider>
  );
}

export function useTheme() {
  const ctx = useContext(ThemeContext);
  if (!ctx) throw new Error('useTheme must be used within ThemeProvider');
  return ctx;
}
