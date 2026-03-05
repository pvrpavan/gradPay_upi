const API_BASE = '/api';

export const api = {
  // Auth
  sendOtp: (phone) =>
    fetch(`${API_BASE}/auth/send-otp`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ phone }),
    }).then((r) => r.json()),

  verifyOtp: (phone, otp) =>
    fetch(`${API_BASE}/auth/verify-otp`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ phone, otp }),
    }).then(async (r) => {
      const data = await r.json();
      return { ...data, status: r.status };
    }),

  createAccount: (payload) =>
    fetch(`${API_BASE}/auth/create-account`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(payload),
    }).then(async (r) => {
      const data = await r.json();
      return { ...data, status: r.status };
    }),

  getProfile: (phone) =>
    fetch(`${API_BASE}/auth/profile?phone=${phone}`).then((r) => r.json()),

  // Transactions
  transferMoney: (payload) =>
    fetch(`${API_BASE}/transactions/transfer`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(payload),
    }).then((r) => r.json()),

  getTransactionHistory: (upiId, params = {}) => {
    const query = new URLSearchParams(params).toString();
    return fetch(`${API_BASE}/transactions/upi/${encodeURIComponent(upiId)}?${query}`).then((r) =>
      r.json()
    );
  },

  // Expenses
  addExpense: (payload) =>
    fetch(`${API_BASE}/tracker`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(payload),
    }).then((r) => r.json()),

  getExpenses: (upiId) =>
    fetch(`${API_BASE}/tracker/${encodeURIComponent(upiId)}`).then((r) => r.json()),

  getExpenseStats: (upiId) =>
    fetch(`${API_BASE}/tracker/stats/${encodeURIComponent(upiId)}`).then((r) => r.json()),

  // Chats
  sendChat: (payload) =>
    fetch(`${API_BASE}/chats/send`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(payload),
    }).then((r) => r.json()),

  getChats: (user1, user2) =>
    fetch(`${API_BASE}/chats/conversation/${encodeURIComponent(user1)}/${encodeURIComponent(user2)}`).then((r) =>
      r.json()
    ),

  // Profile by UPI
  getProfileByUpi: (upiId) =>
    fetch(`${API_BASE}/profile/${encodeURIComponent(upiId)}`).then((r) => r.json()),

  getQRCode: (upiId) =>
    fetch(`${API_BASE}/profile/${encodeURIComponent(upiId)}/qrcode`).then((r) => r.json()),

  // Search users
  searchUsers: (query) =>
    fetch(`${API_BASE}/auth/search?query=${encodeURIComponent(query)}`).then((r) => r.json()),
};
