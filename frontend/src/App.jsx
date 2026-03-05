import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { AuthProvider, useAuth } from './context/AuthContext';
import GetStarted from './pages/GetStarted';
import Login from './pages/Login';
import CreateAccount from './pages/CreateAccount';
import Dashboard from './pages/Dashboard';
import Profile from './pages/Profile';
import Balance from './pages/Balance';
import SendMoney from './pages/SendMoney';
import TransactionHistory from './pages/TransactionHistory';
import ExpenseTracker from './pages/ExpenseTracker';
import Scanner from './pages/Scanner';
import Chat from './pages/Chat';
import FAQs from './pages/FAQs';
import Deposit from './pages/Deposit';

function ProtectedRoute({ children }) {
  const { phone, loading } = useAuth();
  if (loading) {
    return (
      <div className="min-h-screen gradient-warm flex items-center justify-center">
        <div className="animate-spin w-10 h-10 border-4 border-[#f65e1d] border-t-transparent rounded-full" />
      </div>
    );
  }
  if (!phone) return <Navigate to="/login" replace />;
  return children;
}

function AppRoutes() {
  return (
    <Routes>
      <Route path="/" element={<GetStarted />} />
      <Route path="/login" element={<Login />} />
      <Route path="/create-account" element={<CreateAccount />} />
      <Route path="/dashboard" element={<ProtectedRoute><Dashboard /></ProtectedRoute>} />
      <Route path="/profile" element={<ProtectedRoute><Profile /></ProtectedRoute>} />
      <Route path="/balance" element={<ProtectedRoute><Balance /></ProtectedRoute>} />
      <Route path="/send-money" element={<ProtectedRoute><SendMoney /></ProtectedRoute>} />
      <Route path="/history" element={<ProtectedRoute><TransactionHistory /></ProtectedRoute>} />
      <Route path="/tracker" element={<ProtectedRoute><ExpenseTracker /></ProtectedRoute>} />
      <Route path="/scanner" element={<ProtectedRoute><Scanner /></ProtectedRoute>} />
      <Route path="/chat" element={<ProtectedRoute><Chat /></ProtectedRoute>} />
      <Route path="/faqs" element={<FAQs />} />
      <Route path="/deposit" element={<ProtectedRoute><Deposit /></ProtectedRoute>} />
      <Route path="*" element={<Navigate to="/" replace />} />
    </Routes>
  );
}

export default function App() {
  return (
    <BrowserRouter>
      <AuthProvider>
        <AppRoutes />
      </AuthProvider>
    </BrowserRouter>
  );
}
