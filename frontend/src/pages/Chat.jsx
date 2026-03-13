import { useState, useEffect, useRef, useCallback } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { useTheme } from '../context/ThemeContext';
import { api } from '../utils/api';
import { ArrowLeft, Send, User, Search, Circle, MessageSquare } from 'lucide-react';
import { io } from 'socket.io-client';
import Avatar from '../components/Avatar';

export default function Chat() {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const chatWith = searchParams.get('with');
  const { phone } = useAuth();
  const { theme, isDark } = useTheme();
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
      // Find the contact from allUsers or create a placeholder
      const found = allUsers.find((u) => u.phone === chatWith);
      setSelectedContact(found || { phone: chatWith });
      loadMessages(phone, chatWith);
    }
  }, [chatWith, profile, phone, allUsers]);

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

  const handleSendMessage = async () => {
    if (!newMessage.trim() || !selectedContact) return;
    const msgText = newMessage;
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

  // Chat view
  if (selectedContact) {
    return (
      <div className="h-screen flex flex-col" style={{ background: isDark ? `linear-gradient(135deg, ${theme.bg}, ${theme.bgSecondary})` : `linear-gradient(135deg, ${theme.brand}, ${theme.brandLight})` }}>
        {/* Chat Header */}
        <div className="flex items-center gap-3 px-4 py-3 backdrop-blur-md text-white shadow-md" style={{ backgroundColor: isDark ? theme.bgCard : 'rgba(255,255,255,0.2)' }}>
          <button
            onClick={() => { setSelectedContact(null); navigate('/chat'); }}
            className="bg-transparent border-none cursor-pointer"
            style={{ color: isDark ? theme.text : '#fff' }}
          >
            <ArrowLeft size={22} />
          </button>
          <Avatar name={selectedContact.displayName || selectedContact.phone} size={36} />
          <div>
            <span className="font-semibold text-base block" style={{ color: isDark ? theme.text : '#fff' }}>
              {selectedContact.displayName || selectedContact.phone}
            </span>
            {onlineUsers.includes(selectedContact.phone) && (
              <span className="text-[10px] text-green-300 flex items-center gap-1">
                <Circle size={6} fill="currentColor" /> Online
              </span>
            )}
          </div>
        </div>

        {/* Messages */}
        <div className="flex-1 overflow-y-auto p-4 space-y-3">
          {messages.length === 0 && (
            <div className="text-center py-12">
              <MessageSquare size={40} className="mx-auto mb-3" style={{ color: isDark ? theme.textMuted : 'rgba(255,255,255,0.3)' }} />
              <p className="text-sm" style={{ color: isDark ? theme.textMuted : 'rgba(255,255,255,0.6)' }}>No messages yet. Say hi!</p>
            </div>
          )}
          {messages.map((msg, i) => {
            const isMe = msg.from === phone;
            return (
              <div key={i} className={`flex ${isMe ? 'justify-end' : 'justify-start'}`}>
                <div
                  className={`max-w-[75%] px-4 py-3 rounded-2xl text-sm shadow-md ${isMe ? 'rounded-tr-sm' : 'rounded-tl-sm'}`}
                  style={{
                    backgroundColor: isMe ? (isDark ? theme.brand + '30' : '#f8d97d') : (isDark ? theme.bgCard : 'rgba(255,255,255,0.8)'),
                    color: isDark ? theme.text : '#1f2937',
                  }}
                >
                  <p>{msg.message}</p>
                  <p className="text-[9px] mt-1 text-right" style={{ color: theme.textMuted }}>
                    {new Date(msg.timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                  </p>
                </div>
              </div>
            );
          })}
          {isTyping && (
            <div className="flex justify-start">
              <div className="bg-white/60 px-4 py-2 rounded-2xl rounded-tl-sm text-xs text-gray-500 flex items-center gap-1">
                <span className="flex gap-0.5">
                  {[0, 1, 2].map((i) => (
                    <span key={i} className="w-1.5 h-1.5 bg-gray-400 rounded-full" style={{ animation: `bounce 1.4s ease-in-out ${i * 0.2}s infinite both` }} />
                  ))}
                </span>
                typing...
              </div>
            </div>
          )}
          <div ref={chatEndRef} />
        </div>

        {/* Input */}
        <div className="flex items-center gap-2 px-4 py-3 bg-transparent">
          <input
            type="text"
            placeholder="Type a message..."
            value={newMessage}
            onChange={(e) => { setNewMessage(e.target.value); handleTyping(); }}
            onKeyDown={(e) => e.key === 'Enter' && handleSendMessage()}
            className="flex-1 px-5 py-3 rounded-full border-none outline-none text-sm shadow-md"
            style={{ backgroundColor: isDark ? theme.bgCard : 'rgba(255,255,255,0.9)', color: theme.text }}
          />
          <button
            onClick={handleSendMessage}
            className="w-11 h-11 rounded-full text-white border-none cursor-pointer flex items-center justify-center shadow-lg transition-colors"
            style={{ backgroundColor: theme.brand }}
          >
            <Send size={18} />
          </button>
        </div>
      </div>
    );
  }

  // Contact list view
  return (
    <div className="min-h-screen" style={{ background: `linear-gradient(135deg, ${theme.gradientFrom}, ${theme.gradientTo})` }}>
      <header className="flex items-center gap-3 px-4 py-3 text-white rounded-t-lg shadow-md" style={{ background: `linear-gradient(135deg, ${theme.brand}, ${theme.brandLight})` }}>
        <button onClick={() => navigate('/dashboard')} className="bg-transparent border-none cursor-pointer text-white">
          <ArrowLeft size={22} />
        </button>
        <h2 className="text-lg font-semibold">Chat</h2>
      </header>

      <main className="px-4 pt-4 animate-fadeIn">
        {/* Search */}
        <div className="flex items-center gap-2 rounded-xl px-4 py-3 mb-4 shadow-sm border-2 transition-colors" style={{ backgroundColor: theme.bgCard, borderColor: theme.border }}>
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
            className="px-3 py-1.5 text-white text-xs rounded-lg border-none cursor-pointer"
            style={{ backgroundColor: theme.brand }}
          >
            Search
          </button>
        </div>

        {/* Search Results */}
        {contacts.length > 0 && (
          <div className="space-y-2 mb-4">
            <h4 className="text-xs font-semibold uppercase" style={{ color: theme.textMuted }}>Search Results</h4>
            {contacts.map((contact, i) => (
              <button
                key={i}
                onClick={() => handleSelectContact(contact)}
                className="w-full flex items-center gap-3 rounded-xl p-4 shadow-sm transition-colors cursor-pointer border-none text-left"
                style={{ backgroundColor: theme.bgCard }}
              >
                <div className="relative">
                  <Avatar name={contact.displayName} size={40} />
                  {onlineUsers.includes(contact.phone) && (
                    <div className="absolute -bottom-0.5 -right-0.5 w-3 h-3 bg-green-500 rounded-full border-2 border-white" />
                  )}
                </div>
                <div className="flex-1">
                  <p className="text-sm font-semibold" style={{ color: theme.text }}>{contact.displayName}</p>
                  <p className="text-xs" style={{ color: theme.textMuted }}>{contact.phone}</p>
                </div>
              </button>
            ))}
          </div>
        )}

        {/* All Users / Contact List */}
        {allUsers.length > 0 && contacts.length === 0 && (
          <div className="space-y-2">
            <h4 className="text-xs font-semibold uppercase" style={{ color: theme.textMuted }}>All Users</h4>
            {allUsers.map((contact, i) => (
              <button
                key={i}
                onClick={() => handleSelectContact(contact)}
                className="w-full flex items-center gap-3 rounded-xl p-4 shadow-sm transition-colors cursor-pointer border-none text-left"
                style={{ backgroundColor: theme.bgCard }}
              >
                <div className="relative">
                  <Avatar name={contact.displayName} size={40} />
                  {onlineUsers.includes(contact.phone) && (
                    <div className="absolute -bottom-0.5 -right-0.5 w-3 h-3 bg-green-500 rounded-full border-2 border-white" />
                  )}
                </div>
                <div className="flex-1">
                  <p className="text-sm font-semibold" style={{ color: theme.text }}>{contact.displayName}</p>
                  <p className="text-xs" style={{ color: theme.textMuted }}>{contact.phone}</p>
                </div>
                <MessageSquare size={16} style={{ color: theme.brand }} />
              </button>
            ))}
          </div>
        )}

        {allUsers.length === 0 && contacts.length === 0 && (
          <div className="text-center py-12">
            <User size={40} className="mx-auto mb-3" style={{ color: theme.textMuted }} />
            <p className="text-sm" style={{ color: theme.textMuted }}>Search for users to start chatting</p>
          </div>
        )}
      </main>
    </div>
  );
}
