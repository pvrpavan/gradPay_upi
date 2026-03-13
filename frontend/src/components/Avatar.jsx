import { useTheme } from '../context/ThemeContext';

const AVATAR_COLORS = [
  ['#6C63FF', '#5B54E6'],
  ['#3b82f6', '#2563eb'],
  ['#22c55e', '#16a34a'],
  ['#a855f7', '#9333ea'],
  ['#ec4899', '#db2777'],
  ['#14b8a6', '#0d9488'],
  ['#f59e0b', '#d97706'],
  ['#6366f1', '#4f46e5'],
];

function getColorPair(name) {
  let hash = 0;
  const str = name || 'U';
  for (let i = 0; i < str.length; i++) {
    hash = str.charCodeAt(i) + ((hash << 5) - hash);
  }
  return AVATAR_COLORS[Math.abs(hash) % AVATAR_COLORS.length];
}

function getInitials(name) {
  if (!name || name === 'User' || name === 'New User') return 'U';
  const parts = name.trim().split(/\s+/);
  if (parts.length >= 2) {
    return (parts[0][0] + parts[parts.length - 1][0]).toUpperCase();
  }
  return parts[0][0].toUpperCase();
}

export default function Avatar({ name, photoUrl, size = 40, className = '', onClick }) {
  const { theme } = useTheme();

  const sizeClass = {
    28: 'w-7 h-7 text-[10px]',
    32: 'w-8 h-8 text-xs',
    36: 'w-9 h-9 text-xs',
    40: 'w-10 h-10 text-sm',
    48: 'w-12 h-12 text-base',
    56: 'w-14 h-14 text-lg',
    64: 'w-16 h-16 text-xl',
    80: 'w-20 h-20 text-2xl',
  }[size] || `text-sm`;

  const sizeStyle = ![28, 32, 36, 40, 48, 56, 64, 80].includes(size)
    ? { width: `${size}px`, height: `${size}px` }
    : {};

  // If there's a valid photo URL that isn't a default placeholder
  if (photoUrl && photoUrl !== '' && !photoUrl.includes('my-profile') && !photoUrl.includes('user-profile')) {
    return (
      <img
        src={photoUrl}
        alt={name || 'Profile'}
        className={`${sizeClass} rounded-full object-cover shadow-md ${className}`}
        style={{ ...sizeStyle, border: `2px solid ${theme.brand}30` }}
        onClick={onClick}
        onError={(e) => {
          e.target.style.display = 'none';
          e.target.nextSibling.style.display = 'flex';
        }}
      />
    );
  }

  const [colorFrom, colorTo] = getColorPair(name);
  const initials = getInitials(name);

  return (
    <div
      className={`${sizeClass} rounded-full flex items-center justify-center font-bold text-white shadow-md select-none flex-shrink-0 ${className}`}
      style={{
        ...sizeStyle,
        background: `linear-gradient(135deg, ${colorFrom}, ${colorTo})`,
        border: `2px solid ${colorFrom}40`,
      }}
      onClick={onClick}
    >
      {initials}
    </div>
  );
}
