import { createContext, useContext, useState, useEffect } from 'react';

const AuthContext = createContext(null);

export function AuthProvider({ children }) {
  const [user, setUser] = useState(null);
  const [phone, setPhone] = useState(() => localStorage.getItem('phone') || '');
  const [token, setToken] = useState(() => localStorage.getItem('token') || '');
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (phone) {
      localStorage.setItem('phone', phone);
    } else {
      localStorage.removeItem('phone');
    }
  }, [phone]);

  useEffect(() => {
    if (token) {
      localStorage.setItem('token', token);
    } else {
      localStorage.removeItem('token');
    }
  }, [token]);

  useEffect(() => {
    if (phone && token) {
      fetch(`/api/auth/profile?phone=${phone}`, {
        headers: { Authorization: `Bearer ${token}` },
      })
        .then((r) => {
          if (!r.ok) throw new Error('Not authenticated');
          return r.json();
        })
        .then((data) => {
          setUser(data);
          setLoading(false);
        })
        .catch(() => {
          setUser(null);
          setLoading(false);
        });
    } else {
      setLoading(false);
    }
  }, [phone, token]);

  const login = (phoneNum, tokenStr, userData) => {
    setPhone(phoneNum);
    setToken(tokenStr);
    setUser(userData);
  };

  const logout = () => {
    setPhone('');
    setToken('');
    setUser(null);
    localStorage.removeItem('phone');
    localStorage.removeItem('token');
    localStorage.clear();
    // Replace entire history so back button cannot go to protected pages
    window.location.replace('/login');
  };

  return (
    <AuthContext.Provider value={{ user, setUser, phone, token, loading, login, logout }}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error('useAuth must be used within AuthProvider');
  return ctx;
}
