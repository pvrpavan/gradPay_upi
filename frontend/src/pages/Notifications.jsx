import { useState } from 'react';
import { useTheme } from '../context/ThemeContext';
import TopBar from '../components/TopBar';
import BottomNav from '../components/BottomNav';
import { Bell, ShieldCheck, Wallet, ArrowDownLeft, ArrowUpRight, Gift, CreditCard, Megaphone, Trash2, CheckCheck } from 'lucide-react';

const SAMPLE_NOTIFICATIONS = [
  {
    id: 1,
    type: 'transaction',
    icon: ArrowDownLeft,
    title: 'Money Received',
    message: 'You received \u20B9500 from Rahul Kumar',
    time: '2 min ago',
    read: false,
    color: 'success',
  },
  {
    id: 2,
    type: 'transaction',
    icon: ArrowUpRight,
    title: 'Money Sent',
    message: 'You sent \u20B9200 to Priya Sharma',
    time: '1 hour ago',
    read: false,
    color: 'brand',
  },
  {
    id: 3,
    type: 'promo',
    icon: Gift,
    title: 'Cashback Earned!',
    message: 'You earned \u20B925 cashback on your last transaction',
    time: '3 hours ago',
    read: false,
    color: 'warning',
  },
  {
    id: 4,
    type: 'security',
    icon: ShieldCheck,
    title: 'Login Alert',
    message: 'New login detected from Chrome on Windows',
    time: '5 hours ago',
    read: true,
    color: 'brand',
  },
  {
    id: 5,
    type: 'wallet',
    icon: Wallet,
    title: 'Wallet Topped Up',
    message: 'Your wallet has been credited with \u20B91,000',
    time: '1 day ago',
    read: true,
    color: 'success',
  },
  {
    id: 6,
    type: 'promo',
    icon: Megaphone,
    title: 'Special Offer',
    message: 'Get 10% cashback on utility payments this weekend!',
    time: '2 days ago',
    read: true,
    color: 'warning',
  },
  {
    id: 7,
    type: 'transaction',
    icon: CreditCard,
    title: 'Bill Payment Successful',
    message: 'Electricity bill of \u20B91,250 paid successfully',
    time: '3 days ago',
    read: true,
    color: 'success',
  },
];

export default function Notifications() {
  const { theme, isDark } = useTheme();
  const [notifications, setNotifications] = useState(SAMPLE_NOTIFICATIONS);
  const [filter, setFilter] = useState('all');

  const unreadCount = notifications.filter((n) => !n.read).length;

  const filteredNotifications = filter === 'all'
    ? notifications
    : filter === 'unread'
      ? notifications.filter((n) => !n.read)
      : notifications.filter((n) => n.type === filter);

  const markAllRead = () => {
    setNotifications((prev) => prev.map((n) => ({ ...n, read: true })));
  };

  const deleteNotification = (id) => {
    setNotifications((prev) => prev.filter((n) => n.id !== id));
  };

  const markAsRead = (id) => {
    setNotifications((prev) =>
      prev.map((n) => (n.id === id ? { ...n, read: true } : n))
    );
  };

  const getIconColor = (colorKey) => {
    switch (colorKey) {
      case 'success': return theme.success;
      case 'warning': return theme.warning;
      case 'danger': return theme.danger;
      default: return theme.brand;
    }
  };

  const filters = [
    { key: 'all', label: 'All' },
    { key: 'unread', label: 'Unread' },
    { key: 'transaction', label: 'Transactions' },
    { key: 'promo', label: 'Offers' },
    { key: 'security', label: 'Security' },
  ];

  return (
    <div className="min-h-screen pb-24" style={{ background: `linear-gradient(135deg, ${theme.gradientFrom}, ${theme.gradientTo})` }}>
      <TopBar
        title="Notifications"
        rightElement={
          unreadCount > 0 ? (
            <button
              onClick={markAllRead}
              className="flex items-center gap-1 px-3 py-1.5 rounded-lg text-xs font-medium border-none cursor-pointer transition-colors"
              style={{ backgroundColor: isDark ? theme.bgSecondary : theme.brandBg, color: theme.brand }}
            >
              <CheckCheck size={14} />
              Mark all read
            </button>
          ) : null
        }
      />

      <main className="px-5 pt-4 pb-8 animate-fadeIn">
        {/* Notification Summary */}
        <div className="flex items-center gap-3 mb-4">
          <div className="w-12 h-12 rounded-full flex items-center justify-center" style={{ background: `linear-gradient(135deg, ${theme.brand}, ${theme.brandLight})` }}>
            <Bell size={22} className="text-white" />
          </div>
          <div>
            <h3 className="text-base font-semibold" style={{ color: theme.text }}>
              {unreadCount > 0 ? `${unreadCount} new notification${unreadCount > 1 ? 's' : ''}` : 'All caught up!'}
            </h3>
            <p className="text-xs" style={{ color: theme.textMuted }}>
              {notifications.length} total notification{notifications.length !== 1 ? 's' : ''}
            </p>
          </div>
        </div>

        {/* Filter Tabs */}
        <div className="flex gap-2 mb-4 overflow-x-auto pb-1 scrollbar-hide">
          {filters.map((f) => (
            <button
              key={f.key}
              onClick={() => setFilter(f.key)}
              className="px-3 py-1.5 rounded-full text-xs font-medium whitespace-nowrap border-none cursor-pointer transition-colors"
              style={
                filter === f.key
                  ? { backgroundColor: theme.brand, color: '#ffffff' }
                  : { backgroundColor: isDark ? theme.bgSecondary : theme.bgCard, color: theme.textSecondary }
              }
            >
              {f.label}
              {f.key === 'unread' && unreadCount > 0 && (
                <span className="ml-1 px-1.5 py-0.5 rounded-full text-[10px] font-bold" style={{ backgroundColor: 'rgba(255,255,255,0.3)' }}>
                  {unreadCount}
                </span>
              )}
            </button>
          ))}
        </div>

        {/* Notification List */}
        <div className="space-y-2">
          {filteredNotifications.length === 0 ? (
            <div className="rounded-2xl p-8 text-center" style={{ backgroundColor: theme.bgCard }}>
              <Bell size={40} className="mx-auto mb-3" style={{ color: theme.textMuted }} />
              <p className="text-sm font-medium" style={{ color: theme.textSecondary }}>No notifications</p>
              <p className="text-xs mt-1" style={{ color: theme.textMuted }}>
                {filter === 'unread' ? 'All notifications have been read' : 'Nothing to show for this filter'}
              </p>
            </div>
          ) : (
            filteredNotifications.map((notification) => {
              const Icon = notification.icon;
              return (
                <div
                  key={notification.id}
                  onClick={() => markAsRead(notification.id)}
                  className="rounded-2xl p-4 flex items-start gap-3 cursor-pointer transition-all"
                  style={{
                    backgroundColor: notification.read ? theme.bgCard : (isDark ? theme.bgSecondary : theme.brandBg),
                    borderLeft: notification.read ? 'none' : `3px solid ${theme.brand}`,
                  }}
                >
                  <div
                    className="w-10 h-10 rounded-full flex items-center justify-center flex-shrink-0"
                    style={{ backgroundColor: `${getIconColor(notification.color)}15` }}
                  >
                    <Icon size={18} style={{ color: getIconColor(notification.color) }} />
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center justify-between gap-2">
                      <p className="text-sm font-semibold truncate" style={{ color: theme.text }}>
                        {notification.title}
                      </p>
                      <div className="flex items-center gap-1 flex-shrink-0">
                        {!notification.read && (
                          <div className="w-2 h-2 rounded-full" style={{ backgroundColor: theme.brand }} />
                        )}
                        <button
                          onClick={(e) => { e.stopPropagation(); deleteNotification(notification.id); }}
                          className="p-1 rounded-lg bg-transparent border-none cursor-pointer transition-colors"
                          style={{ color: theme.textMuted }}
                        >
                          <Trash2 size={14} />
                        </button>
                      </div>
                    </div>
                    <p className="text-xs mt-0.5" style={{ color: theme.textSecondary }}>
                      {notification.message}
                    </p>
                    <p className="text-[10px] mt-1" style={{ color: theme.textMuted }}>
                      {notification.time}
                    </p>
                  </div>
                </div>
              );
            })
          )}
        </div>

        {/* Clear All */}
        {notifications.length > 0 && (
          <button
            onClick={() => setNotifications([])}
            className="w-full mt-4 py-3 rounded-xl text-sm font-medium border cursor-pointer transition-colors"
            style={{ backgroundColor: 'transparent', color: theme.danger, borderColor: `${theme.danger}33` }}
          >
            Clear All Notifications
          </button>
        )}
      </main>

      <BottomNav />
    </div>
  );
}
