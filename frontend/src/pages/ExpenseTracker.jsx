import { useEffect, useState } from 'react';
import { useAuth } from '../context/AuthContext';
import { api } from '../utils/api';
import TopBar from '../components/TopBar';
import BottomNav from '../components/BottomNav';
import { PieChart, Pie, Cell, ResponsiveContainer, Legend, Tooltip } from 'recharts';
import { Plus, Loader2, Trash2 } from 'lucide-react';

const COLORS = ['#f65e1d', '#36A2EB', '#FFCE56', '#B180D7', '#5AD3D1', '#FF6384', '#4BC0C0'];
const CATEGORIES = ['Food', 'Transport', 'Shopping', 'Entertainment', 'Bills', 'Education', 'Other'];

export default function ExpenseTracker() {
  const { phone } = useAuth();
  const [expenses, setExpenses] = useState([]);
  const [stats, setStats] = useState([]);
  const [desc, setDesc] = useState('');
  const [amount, setAmount] = useState('');
  const [category, setCategory] = useState('Food');
  const [loading, setLoading] = useState(false);
  const [profile, setProfile] = useState(null);

  useEffect(() => {
    if (phone) {
      api.getProfile(phone).then((data) => {
        setProfile(data);
        const upiId = Array.isArray(data.upi_id) ? data.upi_id[0] : data.upi_id;
        if (upiId) {
          loadExpenses(upiId);
        }
      }).catch(() => {});
    }
  }, [phone]);

  const loadExpenses = async (upiId) => {
    try {
      const [expData, statData] = await Promise.all([
        api.getExpenses(upiId),
        api.getExpenseStats(upiId),
      ]);
      setExpenses(Array.isArray(expData) ? expData : []);
      setStats(Array.isArray(statData) ? statData : []);
    } catch {
      // silent
    }
  };

  const handleAddExpense = async () => {
    if (!desc.trim() || !amount || parseFloat(amount) <= 0) return;
    const upiId = Array.isArray(profile?.upi_id) ? profile.upi_id[0] : profile?.upi_id;
    if (!upiId) return;

    setLoading(true);
    try {
      await api.addExpense({ upi_id: upiId, category: category || desc, amount: parseFloat(amount) });
      setDesc('');
      setAmount('');
      loadExpenses(upiId);
    } catch {
      // silent
    }
    setLoading(false);
  };

  const chartData = stats.map((s) => ({
    name: s.category,
    value: s.totalAmount,
  }));

  return (
    <div className="min-h-screen gradient-warm pb-20">
      <TopBar title="Expense Tracker" showBack={false} />

      <main className="px-4 pt-4 animate-fadeIn">
        {/* Add Expense */}
        <div className="bg-white rounded-2xl p-4 shadow-sm mb-5">
          <h4 className="text-sm font-semibold text-gray-500 mb-3">Add New Expense</h4>
          <div className="space-y-3">
            <input
              type="text"
              placeholder="Description"
              value={desc}
              onChange={(e) => setDesc(e.target.value)}
              className="w-full px-4 py-2.5 text-sm border border-gray-200 rounded-xl outline-none focus:border-[#f65e1d] bg-gray-50"
            />
            <div className="flex gap-2">
              <input
                type="number"
                placeholder="Amount ₹"
                value={amount}
                onChange={(e) => setAmount(e.target.value)}
                className="flex-1 px-4 py-2.5 text-sm border border-gray-200 rounded-xl outline-none focus:border-[#f65e1d] bg-gray-50"
              />
              <select
                value={category}
                onChange={(e) => setCategory(e.target.value)}
                className="px-3 py-2.5 text-sm border border-gray-200 rounded-xl outline-none focus:border-[#f65e1d] bg-gray-50 cursor-pointer"
              >
                {CATEGORIES.map((c) => (
                  <option key={c} value={c}>{c}</option>
                ))}
              </select>
            </div>
            <button
              onClick={handleAddExpense}
              disabled={loading || !desc.trim() || !amount}
              className="w-full py-2.5 bg-[#f65e1d] hover:bg-[#e5531a] text-white font-semibold rounded-xl shadow-md transition-all flex items-center justify-center gap-2 cursor-pointer border-none text-sm disabled:opacity-60"
            >
              {loading ? <Loader2 size={16} className="animate-spin" /> : <Plus size={16} />}
              Add Expense
            </button>
          </div>
        </div>

        {/* Chart */}
        {chartData.length > 0 && (
          <div className="bg-white rounded-2xl p-4 shadow-sm mb-5">
            <h4 className="text-sm font-semibold text-gray-500 mb-3">Expense Breakdown</h4>
            <ResponsiveContainer width="100%" height={220}>
              <PieChart>
                <Pie
                  data={chartData}
                  cx="50%"
                  cy="50%"
                  innerRadius={50}
                  outerRadius={80}
                  paddingAngle={3}
                  dataKey="value"
                >
                  {chartData.map((_, i) => (
                    <Cell key={i} fill={COLORS[i % COLORS.length]} />
                  ))}
                </Pie>
                <Legend iconSize={10} wrapperStyle={{ fontSize: '12px' }} />
                <Tooltip formatter={(value) => `₹${value}`} />
              </PieChart>
            </ResponsiveContainer>
          </div>
        )}

        {/* Expense List */}
        <div className="mb-4">
          <h4 className="text-sm font-semibold text-gray-500 mb-3">Past Expenses</h4>
          {expenses.length === 0 ? (
            <p className="text-sm text-gray-400 text-center py-6">No expenses recorded yet</p>
          ) : (
            <div className="space-y-2">
              {expenses.map((exp, i) => (
                <div key={i} className="flex items-center justify-between bg-white rounded-xl p-3 shadow-sm">
                  <div className="flex items-center gap-3">
                    <div className="w-8 h-8 rounded-full bg-orange-50 flex items-center justify-center">
                      <Trash2 size={14} className="text-orange-400" />
                    </div>
                    <div>
                      <p className="text-sm font-medium text-gray-800">{exp.category}</p>
                      <p className="text-[10px] text-gray-400">{new Date(exp.date).toLocaleDateString()}</p>
                    </div>
                  </div>
                  <span className="text-sm font-bold text-red-500">-₹{exp.amount}</span>
                </div>
              ))}
            </div>
          )}
        </div>
      </main>

      <BottomNav />
    </div>
  );
}
