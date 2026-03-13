import { useState, useEffect, useRef, useCallback } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { useTheme } from '../context/ThemeContext';
import { useToast } from '../context/ToastContext';
import { api } from '../utils/api';
import { ArrowLeft, Send, User, Search, Circle, MessageSquare, IndianRupee, Banknote, X, CheckCircle2, Loader2 } from 'lucide-react';
import { io } from 'socket.io-client';
import Avatar from '../components/Avatar';
import UpiPinModal from '../components/UpiPinModal';
import LoadingOverlay from '../components/LoadingOverlay';

export default function Chat() {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const chatWith = searchParams.get('with');
  const payMode = searchParams.get('pay') === 'true';
  const { phone } = useAuth();
  const { theme, isDark } = useTheme();
  const { showSuccess, showError } = useToast();
  const [profile, setProfile] = useState(null);
  const [contacts, setContacts] = useState([]);
  const [selectedContact, setSelectedContact] = useState(null);
  const [messages, setMessages] = useState([]);
  const [newMessage, setNewMessage] = useState('');
  const [searchQuery, setSearchQuery] = useState('');
  const [onlineUsers, setOnlineUsers] = useState([]);
  const [isTyping, setIsTyping] = useState(false);
  const [allUsers, setAllUsers] = useState([]);
  const chatEndRef = useRef(null);
  const socketRef = useRef(null);
  const typingTimeoutRef = useRef(null);

  // Payment states
  const [showPayPanel, setShowPayPanel] = useState(false);
  const [payAmount, setPayAmount] = useState('');
  const [payNote, setPayNote] = useState('');
  const [showUpiPin, setShowUpiPin] = useState(false);
  const [showProcessing, setShowProcessing] = useState(false);
  const [paySuccess, setPaySuccess] = useState(false);

  // Detect if input is numbers only
  const inputText = newMessage.trim();
  const isNumbersOnly = inputText.length > 0 && /^\d+(\.\d*)?$/.test(inputText);

  // Initialize Socket.IO connection
  useEffect(() => {
    if (phone) {
      const socket = io(window.location.origin.replace(':5173', ':5000').replace(':5174', ':5000'), {
        transports: ['websocket', 'polling'],
      });
      socketRef.current = socket;

      socket.on('connect', () => {
        socket.emit('join', phone);
      });

      socket.on('online_users', (users) => {
        setOnlineUsers(users);
      });

      socket.on('receive_message', (chat) => {
        setMessages((prev) => [...prev, chat]);
        setTimeout(() => chatEndRef.current?.scrollIntoView({ behavior: 'smooth' }), 100);
      });

      socket.on('message_sent', () => {
        // Message confirmation from server
      });

      socket.on('user_typing', () => {
        setIsTyping(true);
      });

      socket.on('user_stop_typing', () => {
        setIsTyping(false);
      });

      return () => {
        socket.disconnect();
      };
    }
  }, [phone]);

  useEffect(() => {
    if (phone) {
      api.getProfile(phone).then((data) => {
        setProfile(data);
      }).catch(() => {});
      // Load all users for contact list
      api.getAllUsers(phone).then((data) => {
        if (Array.isArray(data)) setAllUsers(data.filter((u) => u.phone !== phone));
      }).catch(() => {});
    }
  }, [phone]);

  const loadMessages = async (user1, user2) => {
    try {
      const data = await api.getChats(user1, user2);
      setMessages(Array.isArray(data) ? data : []);
    } catch {
      setMessages([]);
    }
  };

  useEffect(() => {
    if (chatWith && profile) {
      const found = allUsers.find((u) => u.phone === chatWith);
      setSelectedContact(found || { phone: chatWith });
      loadMessages(phone, chatWith);
      // If pay mode is activated from scanner, open pay panel
      if (payMode) {
        setShowPayPanel(true);
      }
    }
  }, [chatWith, profile, phone, allUsers, payMode]);

  const handleSearchContacts = async () => {
    if (!searchQuery.trim()) return;
    try {
      const data = await api.searchUsers(searchQuery);
      if (Array.isArray(data)) {
        setContacts(data.filter((u) => u.phone !== phone));
      }
    } catch {
      setContacts([]);
    }
  };

  const handleSelectContact = (contact) => {
    setSelectedContact(contact);
    loadMessages(phone, contact.phone);
  };

  const handleTyping = useCallback(() => {
    if (socketRef.current && selectedContact) {
      socketRef.current.emit('typing', { from: phone, to: selectedContact.phone });
      if (typingTimeoutRef.current) clearTimeout(typingTimeoutRef.current);
      typingTimeoutRef.current = setTimeout(() => {
        socketRef.current?.emit('stop_typing', { from: phone, to: selectedContact.phone });
      }, 2000);
    }
  }, [phone, selectedContact]);

  const handleSendMessage = async (overrideText) => {
    const msgText = overrideText || newMessage.trim();
    if (!msgText || !selectedContact) return;
    setNewMessage('');

    // Emit via Socket.IO for real-time delivery
    if (socketRef.current) {
      socketRef.current.emit('send_message', {
        from: phone,
        to: selectedContact.phone,
        message: msgText,
      });
      socketRef.current.emit('stop_typing', { from: phone, to: selectedContact.phone });
    }

    // Optimistically add to local messages
    setMessages((prev) => [
      ...prev,
      { from: phone, to: selectedContact.phone, message: msgText, timestamp: new Date() },
    ]);
    setTimeout(() => chatEndRef.current?.scrollIntoView({ behavior: 'smooth' }), 100);

    // Also persist via HTTP API as fallback
    try {
      await api.sendChat({ from: phone, to: selectedContact.phone, message: msgText });
    } catch {
      // Socket.IO already handled delivery
    }
  };

  // Payment functions
  const handleOpenPay = () => {
    setPayAmount(isNumbersOnly ? inputText : '');
    setNewMessage('');
    setShowPayPanel(true);
  };

  const handleInitiatePay = () => {
    if (!payAmount || parseFloat(payAmount) <= 0) return;
    setShowUpiPin(true);
  };

  const handlePayConfirm = async () => {
    setShowUpiPin(false);
    setShowProcessing(true);

    const senderUpi = Array.isArray(profile?.upi_id) ? profile.upi_id[0] : profile?.upi_id;
    const receiverUpi = Array.isArray(selectedContact.upi_id) ? selectedContact.upi_id[0] : selectedContact.upi_id;

    if (!senderUpi || !receiverUpi) {
      showError('UPI ID not found. Please complete your profile.');
      setShowProcessing(false);
      return;
    }

    await new Promise((r) => setTimeout(r, 1500));

    try {
      const data = await api.transferMoney({
        sender_upi: senderUpi,
        receiver_upi: receiverUpi,
        amount: parseFloat(payAmount),
        note: payNote || 'Money sent',
      });

      setShowProcessing(false);

      if (data.message === 'Transaction successful') {
        setPaySuccess(true);
        showSuccess('Payment successful!');
        // Add payment message to chat
        const payMsg = `Paid \u20B9${parseFloat(payAmount).toLocaleString('en-IN')}${payNote ? ' - ' + payNote : ''}`;
        handleSendMessage(payMsg);
        setTimeout(() => {
          setPaySuccess(false);
          setShowPayPanel(false);
          setPayAmount('');
          setPayNote('');
        }, 2000);
      } else {
        showError(data.message || 'Transaction failed.');
      }
    } catch {
      setShowProcessing(false);
      showError('Error processing transaction.');
    }
  };

  // Check if a message is a payment message
  const isPaymentMessage = (msg) => {
    return msg.message && msg.message.startsWith('Paid \u20B9');
  };

  // Chat view
  if (selectedContact) {
    return (
      <div className="h-screen flex flex-col" style={{ background: isDark ? `linear-gradient(135deg, ${theme.bg}, ${theme.bgSecondary})` : `linear-gradient(160deg, ${theme.gradientFrom}, ${theme.gradientTo})` }}>
        {showProcessing && <LoadingOverlay message="Processing Payment..." />}
        {showUpiPin && (
          <UpiPinModal
            phone={phone}
            onSuccess={handlePayConfirm}
            onClose={() => setShowUpiPin(false)}
          />
        )}

        {/* Chat Header */}
        <div
          className="flex items-center gap-3 px-4 py-3 shadow-lg animate-fadeIn"
          style={{
            background: `linear-gradient(135deg, ${theme.brand}, ${theme.brandLight})`,
          }}
        >
          <button
            onClick={() => { setSelectedContact(null); setShowPayPanel(false); navigate('/chat'); }}
            className="bg-white/20 backdrop-blur-sm rounded-full w-9 h-9 flex items-center justify-center border-none cursor-pointer text-white transition-all hover:bg-white/30 active:scale-95"
          >
            <ArrowLeft size={18} />
          </button>
          <Avatar name={selectedContact.displayName || selectedContact.phone} size={38} />
          <div className="flex-1">
            <span className="font-semibold text-sm block text-white">
              {selectedContact.displayName || selectedContact.phone}
            </span>
            {onlineUsers.includes(selectedContact.phone) && (
              <span className="text-[10px] text-green-200 flex items-center gap-1">
                <Circle size={5} fill="currentColor" /> Online
              </span>
            )}
          </div>
          <button
            onClick={() => setShowPayPanel(!showPayPanel)}
            className="bg-white/20 backdrop-blur-sm rounded-full px-3 py-1.5 border-none cursor-pointer text-white text-xs font-semibold flex items-center gap-1.5 transition-all hover:bg-white/30 active:scale-95"
          >
            <IndianRupee size={14} /> Pay
          </button>
        </div>

        {/* Messages */}
        <div className="flex-1 overflow-y-auto px-4 py-3 space-y-2.5">
          {messages.length === 0 && (
            <div className="text-center py-16 animate-fadeIn">
              <div className="w-16 h-16 rounded-full mx-auto mb-4 flex items-center justify-center" style={{ backgroundColor: `${theme.brand}15` }}>
                <MessageSquare size={28} style={{ color: theme.brand }} />
              </div>
              <p className="text-sm font-medium mb-1" style={{ color: theme.text }}>No messages yet</p>
              <p className="text-xs" style={{ color: theme.textMuted }}>Say hi or send a payment!</p>
            </div>
          )}
          {messages.map((msg, i) => {
            const isMe = msg.from === phone;
            const isPay = isPaymentMessage(msg);
            return (
              <div key={i} className={`flex ${isMe ? 'justify-end' : 'justify-start'} animate-fadeIn`} style={{ animationDelay: `${Math.min(i * 0.03, 0.3)}s` }}>
                <div
                  className={`max-w-[78%] px-4 py-2.5 rounded-2xl text-sm shadow-sm transition-all ${isMe ? 'rounded-br-md' : 'rounded-bl-md'}`}
                  style={{
                    backgroundColor: isPay
                      ? (isMe ? `${theme.success}18` : `${theme.success}10`)
                      : isMe
                        ? (isDark ? `${theme.brand}25` : `${theme.brand}12`)
                        : (isDark ? theme.bgCard : '#ffffff'),
                    color: isDark ? theme.text : '#1f2937',
                    border: isPay ? `1px solid ${theme.success}30` : 'none',
                  }}
                >
                  {isPay && (
                    <div className="flex items-center gap-1.5 mb-1">
                      <Banknote size={14} style={{ color: theme.success }} />
                      <span className="text-[10px] font-semibold uppercase tracking-wide" style={{ color: theme.success }}>Payment</span>
                    </div>
                  )}
                  <p className={isPay ? 'font-semibold' : ''}>{msg.message}</p>
                  <p className="text-[9px] mt-1 text-right" style={{ color: theme.textMuted }}>
                    {new Date(msg.timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                  </p>
                </div>
              </div>
            );
          })}
          {isTyping && (
            <div className="flex justify-start animate-fadeIn">
              <div className="px-4 py-2.5 rounded-2xl rounded-bl-md text-xs flex items-center gap-2" style={{ backgroundColor: isDark ? theme.bgCard : '#ffffff', color: theme.textMuted }}>
                <span className="flex gap-0.5">
                  {[0, 1, 2].map((i) => (
                    <span key={i} className="w-1.5 h-1.5 rounded-full" style={{ backgroundColor: theme.brand, animation: `bounce 1.4s ease-in-out ${i * 0.2}s infinite both` }} />
                  ))}
                </span>
                typing...
              </div>
            </div>
          )}
          <div ref={chatEndRef} />
        </div>

        {/* Payment Panel (slides up inside chat) */}
        {showPayPanel && (
          <div
            className="px-4 py-4 border-t animate-slideUp"
            style={{
              backgroundColor: isDark ? theme.bgCard : '#ffffff',
              borderColor: theme.border,
            }}
          >
            {paySuccess ? (
              <div className="text-center py-3 animate-scale-in">
                <CheckCircle2 size={40} className="mx-auto mb-2" style={{ color: theme.success }} />
                <p className="font-bold text-sm" style={{ color: theme.text }}>Payment Sent!</p>
                <p className="text-xs" style={{ color: theme.textMuted }}>{'\u20B9'}{parseFloat(payAmount).toLocaleString('en-IN')} to {selectedContact.displayName || selectedContact.phone}</p>
              </div>
            ) : (
              <>
                <div className="flex items-center justify-between mb-3">
                  <div className="flex items-center gap-2">
                    <div className="w-8 h-8 rounded-full flex items-center justify-center" style={{ backgroundColor: `${theme.brand}15` }}>
                      <IndianRupee size={16} style={{ color: theme.brand }} />
                    </div>
                    <span className="text-sm font-semibold" style={{ color: theme.text }}>
                      Pay {selectedContact.displayName || selectedContact.phone}
                    </span>
                  </div>
                  <button onClick={() => { setShowPayPanel(false); setPayAmount(''); setPayNote(''); }} className="bg-transparent border-none cursor-pointer p-1" style={{ color: theme.textMuted }}>
                    <X size={18} />
                  </button>
                </div>
                <div className="flex items-center gap-2 mb-3">
                  <span className="text-2xl font-bold" style={{ color: theme.textMuted }}>{'\u20B9'}</span>
                  <input
                    type="number"
                    placeholder="0"
                    value={payAmount}
                    onChange={(e) => setPayAmount(e.target.value)}
                    className="flex-1 text-3xl font-bold border-none outline-none bg-transparent"
                    style={{ color: theme.text }}
                    autoFocus
                  />
                </div>
                <input
                  type="text"
                  placeholder="Add a note (optional)"
                  value={payNote}
                  onChange={(e) => setPayNote(e.target.value)}
                  className="w-full text-sm border rounded-xl px-4 py-2.5 outline-none mb-3"
                  style={{ backgroundColor: theme.inputBg, color: theme.text, borderColor: theme.border }}
                />
                <button
                  onClick={handleInitiatePay}
                  disabled={!payAmount || parseFloat(payAmount) <= 0}
                  className="w-full py-3 text-white font-semibold rounded-xl shadow-md transition-all flex items-center justify-center gap-2 cursor-pointer border-none text-sm disabled:opacity-40 disabled:cursor-not-allowed active:scale-[0.98]"
                  style={{ background: `linear-gradient(135deg, ${theme.brand}, ${theme.brandLight})` }}
                >
                  <Send size={16} /> Pay {'\u20B9'}{payAmount || '0'}
                </button>
              </>
            )}
          </div>
        )}

        {/* Input Area */}
        {!showPayPanel && (
          <div className="px-3 py-3" style={{ backgroundColor: isDark ? `${theme.bgCard}CC` : 'rgba(255,255,255,0.95)', backdropFilter: 'blur(10px)' }}>
            <div className="flex items-center gap-2">
              <input
                type="text"
                placeholder="Type a message or amount..."
                value={newMessage}
                onChange={(e) => { setNewMessage(e.target.value); handleTyping(); }}
                onKeyDown={(e) => e.key === 'Enter' && handleSendMessage()}
                className="flex-1 px-4 py-3 rounded-2xl border outline-none text-sm transition-all"
                style={{
                  backgroundColor: isDark ? theme.bgSecondary : theme.inputBg,
                  color: theme.text,
                  borderColor: isNumbersOnly ? `${theme.brand}60` : theme.border,
                  boxShadow: isNumbersOnly ? `0 0 0 2px ${theme.brand}15` : 'none',
                }}
              />
              {isNumbersOnly ? (
                <div className="flex gap-1.5">
                  <button
                    onClick={() => handleSendMessage()}
                    className="w-10 h-10 rounded-xl text-white border-none cursor-pointer flex items-center justify-center shadow-md transition-all active:scale-95"
                    style={{ backgroundColor: theme.brand }}
                    title="Send as message"
                  >
                    <Send size={16} />
                  </button>
                  <button
                    onClick={handleOpenPay}
                    className="h-10 px-3 rounded-xl text-white border-none cursor-pointer flex items-center justify-center gap-1.5 shadow-md transition-all active:scale-95 text-xs font-semibold"
                    style={{ background: `linear-gradient(135deg, ${theme.success}, #16a34a)` }}
                    title="Pay this amount"
                  >
                    <IndianRupee size={14} /> Pay
                  </button>
                </div>
              ) : (
                <button
                  onClick={() => handleSendMessage()}
                  disabled={!inputText}
                  className="w-10 h-10 rounded-xl text-white border-none cursor-pointer flex items-center justify-center shadow-md transition-all active:scale-95 disabled:opacity-40 disabled:cursor-not-allowed"
                  style={{ background: `linear-gradient(135deg, ${theme.brand}, ${theme.brandLight})` }}
                >
                  <Send size={16} />
                </button>
              )}
            </div>
            {isNumbersOnly && (
              <p className="text-[10px] mt-1.5 ml-1 animate-fadeIn" style={{ color: theme.brand }}>
                Number detected - send as message or pay {'\u20B9'}{inputText}
              </p>
            )}
          </div>
        )}
      </div>
    );
  }

  // Contact list view
  return (
    <div className="min-h-screen" style={{ background: `linear-gradient(135deg, ${theme.gradientFrom}, ${theme.gradientTo})` }}>
      <header
        className="flex items-center gap-3 px-4 py-3.5 text-white shadow-lg"
        style={{ background: `linear-gradient(135deg, ${theme.brand}, ${theme.brandLight})` }}
      >
        <button onClick={() => navigate('/dashboard')} className="bg-white/20 backdrop-blur-sm rounded-full w-9 h-9 flex items-center justify-center border-none cursor-pointer text-white transition-all hover:bg-white/30">
          <ArrowLeft size={18} />
        </button>
        <h2 className="text-lg font-semibold">Messages</h2>
      </header>

      <main className="px-4 pt-4 pb-6 animate-fadeIn">
        {/* Search */}
        <div className="flex items-center gap-2 rounded-2xl px-4 py-3 mb-5 shadow-sm border transition-all" style={{ backgroundColor: theme.bgCard, borderColor: theme.border }}>
          <Search size={18} style={{ color: theme.brand }} />
          <input
            type="text"
            placeholder="Search users by phone..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            onKeyDown={(e) => e.key === 'Enter' && handleSearchContacts()}
            className="flex-1 bg-transparent border-none outline-none text-sm"
            style={{ color: theme.text }}
          />
          <button
            onClick={handleSearchContacts}
            className="px-3.5 py-1.5 text-white text-xs rounded-xl border-none cursor-pointer font-medium transition-all active:scale-95"
            style={{ background: `linear-gradient(135deg, ${theme.brand}, ${theme.brandLight})` }}
          >
            Search
          </button>
        </div>

        {/* Search Results */}
        {contacts.length > 0 && (
          <div className="space-y-2 mb-5">
            <h4 className="text-xs font-semibold uppercase tracking-wider ml-1" style={{ color: theme.textMuted }}>Search Results</h4>
            {contacts.map((contact, i) => (
              <button
                key={i}
                onClick={() => handleSelectContact(contact)}
                className="w-full flex items-center gap-3 rounded-2xl p-3.5 shadow-sm transition-all cursor-pointer border-none text-left hover:shadow-md active:scale-[0.98]"
                style={{ backgroundColor: theme.bgCard, animationDelay: `${i * 0.05}s` }}
              >
                <div className="relative">
                  <Avatar name={contact.displayName} size={44} />
                  {onlineUsers.includes(contact.phone) && (
                    <div className="absolute -bottom-0.5 -right-0.5 w-3.5 h-3.5 bg-green-500 rounded-full border-2" style={{ borderColor: theme.bgCard }} />
                  )}
                </div>
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-semibold truncate" style={{ color: theme.text }}>{contact.displayName}</p>
                  <p className="text-xs" style={{ color: theme.textMuted }}>{contact.phone}</p>
                </div>
                <MessageSquare size={16} style={{ color: theme.brand }} />
              </button>
            ))}
          </div>
        )}

        {/* All Users / Contact List */}
        {allUsers.length > 0 && contacts.length === 0 && (
          <div className="space-y-2">
            <h4 className="text-xs font-semibold uppercase tracking-wider ml-1" style={{ color: theme.textMuted }}>All Users</h4>
            {allUsers.map((contact, i) => (
              <button
                key={i}
                onClick={() => handleSelectContact(contact)}
                className="w-full flex items-center gap-3 rounded-2xl p-3.5 shadow-sm transition-all cursor-pointer border-none text-left hover:shadow-md active:scale-[0.98] animate-fadeIn"
                style={{ backgroundColor: theme.bgCard, animationDelay: `${i * 0.05}s` }}
              >
                <div className="relative">
                  <Avatar name={contact.displayName} size={44} />
                  {onlineUsers.includes(contact.phone) && (
                    <div className="absolute -bottom-0.5 -right-0.5 w-3.5 h-3.5 bg-green-500 rounded-full border-2" style={{ borderColor: theme.bgCard }} />
                  )}
                </div>
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-semibold truncate" style={{ color: theme.text }}>{contact.displayName}</p>
                  <p className="text-xs" style={{ color: theme.textMuted }}>{contact.phone}</p>
                </div>
                <div className="flex items-center gap-1.5 text-xs font-medium" style={{ color: theme.brand }}>
                  <MessageSquare size={14} />
                </div>
              </button>
            ))}
          </div>
        )}

        {allUsers.length === 0 && contacts.length === 0 && (
          <div className="text-center py-16 animate-fadeIn">
            <div className="w-16 h-16 rounded-full mx-auto mb-4 flex items-center justify-center" style={{ backgroundColor: `${theme.brand}15` }}>
              <User size={28} style={{ color: theme.brand }} />
            </div>
            <p className="text-sm font-medium mb-1" style={{ color: theme.text }}>No contacts yet</p>
            <p className="text-xs" style={{ color: theme.textMuted }}>Search for users to start chatting</p>
          </div>
        )}
      </main>
    </div>
  );
}
