import React, { useState } from 'react';
import { Plus, Trash2, Wallet, Banknote, Landmark, PieChart, Target, Edit2 } from 'lucide-react';
import { useExpenseStore } from '../../store/useExpenseStore';
import { useWorkspaceStore } from '../../store/useWorkspaceStore';
import { PieChart as RechartsPie, Pie, Cell, Tooltip, ResponsiveContainer } from 'recharts';
import { useEffect } from 'react';

const COLORS = ['#ff7a00', '#3b82f6', '#10b981', '#f59e0b', '#8b5cf6', '#ef4444'];

export const ExpenseTracker: React.FC = () => {
  const { activeWorkspace } = useWorkspaceStore();
  const {
    expenses,
    savingsGoal,
    fetchExpenses,
    addExpense,
    deleteExpense,
    setSavingsGoal
  } = useExpenseStore();

  const [isAdding, setIsAdding] = useState(false);
  const [amount, setAmount] = useState('');
  const [description, setDescription] = useState('');
  const [category, setCategory] = useState('Food & Dining');
  const [method, setMethod] = useState<'Cash' | 'GPay'>('GPay');

  useEffect(() => {
    if (activeWorkspace) {
      fetchExpenses(activeWorkspace.id);
    }
  }, [activeWorkspace, fetchExpenses]);

  const [isEditingGoal, setIsEditingGoal] = useState(false);
  const [newGoal, setNewGoal] = useState(savingsGoal.toString());
  const [timeFilter, setTimeFilter] = useState<'All' | 'Month' | 'Week' | 'Day'>('Month');

  const handleAddExpense = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!activeWorkspace) return;
    const numAmount = parseFloat(amount);
    if (!description.trim() || isNaN(numAmount) || numAmount <= 0) return;
    
    await addExpense(activeWorkspace.id, numAmount, description, category, method);
    setAmount('');
    setDescription('');
    setIsAdding(false);
  };

  const handleSaveGoal = (e: React.FormEvent) => {
    e.preventDefault();
    const parsed = parseFloat(newGoal);
    if (!isNaN(parsed) && parsed > 0) {
      setSavingsGoal(parsed);
    }
    setIsEditingGoal(false);
  };

  const filteredExpenses = expenses.filter((exp) => {
    if (timeFilter === 'All') return true;
    const expDate = new Date(exp.date);
    const now = new Date();
    
    if (timeFilter === 'Day') {
      return expDate.toDateString() === now.toDateString();
    }
    
    if (timeFilter === 'Week') {
      const weekAgo = new Date();
      weekAgo.setDate(now.getDate() - 7);
      return expDate >= weekAgo;
    }
    
    if (timeFilter === 'Month') {
      return expDate.getMonth() === now.getMonth() && expDate.getFullYear() === now.getFullYear();
    }
    
    return true;
  });

  const total = filteredExpenses.reduce((acc, exp) => acc + exp.amount, 0);
  const cashTotal = filteredExpenses.filter(e => e.payment_method === 'Cash').reduce((acc, exp) => acc + exp.amount, 0);
  const gpayTotal = filteredExpenses.filter(e => e.payment_method === 'GPay').reduce((acc, exp) => acc + exp.amount, 0);

  const categoryData = Object.entries(
    filteredExpenses.reduce((acc, exp) => {
      acc[exp.category] = (acc[exp.category] || 0) + exp.amount;
      return acc;
    }, {} as Record<string, number>)
  ).map(([name, value]) => ({ name, value })).sort((a, b) => b.value - a.value);

  const goalProgress = savingsGoal > 0 ? Math.min((total / savingsGoal) * 100, 100) : 0;

  const formatCurrency = (val: number) => {
    return new Intl.NumberFormat('en-IN', {
      style: 'currency',
      currency: 'INR',
      maximumFractionDigits: 0,
    }).format(val);
  };

  return (
    <div className="my-6 space-y-6 select-none animate-fade-in-up font-['Sora']">
      
      {/* Time Filter Tabs */}
      <div className="flex bg-[#f2e8da] p-1 rounded-xl w-fit font-bold text-xs mx-auto sm:mx-0">
        {['Day', 'Week', 'Month', 'All'].map((filter) => (
          <button
            key={filter}
            onClick={() => setTimeFilter(filter as any)}
            className={`px-4 py-1.5 rounded-lg transition-all ${timeFilter === filter ? 'bg-white shadow-sm text-[#1c1917]' : 'text-[#78716c] hover:text-[#1c1917]'}`}
          >
            {filter === 'All' ? 'All Time' : `This ${filter}`}
          </button>
        ))}
      </div>

      {/* Summary Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        {/* Total Expenses */}
        <div className="p-4 rounded-2xl bg-white border border-[#f2e8da] flex items-center space-x-4 shadow-xs hover:scale-[1.02] transition-all stark-hud-card">
          <div className="p-3 rounded-xl bg-[#fff3e5] text-[#ff7a00] shadow-xs">
            <Wallet className="w-5 h-5 text-[#ff7a00]" />
          </div>
          <div>
            <div className="text-2xl font-black text-[#ff7a00] shimmer-text-orange">
              {formatCurrency(total)}
            </div>
            <div className="text-xs font-bold text-[#78716c]">Total Expenses</div>
          </div>
        </div>

        {/* GPay Total */}
        <div className="p-4 rounded-2xl bg-white border border-[#f2e8da] flex items-center space-x-4 shadow-xs hover:scale-[1.02] transition-all stark-hud-card">
          <div className="p-3 rounded-xl bg-blue-50 text-blue-600 shadow-xs border border-blue-100">
            <Landmark className="w-5 h-5 text-blue-600" />
          </div>
          <div>
            <div className="text-2xl font-black text-blue-600">
              {formatCurrency(gpayTotal)}
            </div>
            <div className="text-xs font-bold text-[#78716c]">GPay Spent</div>
          </div>
        </div>

        {/* Cash Total */}
        <div className="p-4 rounded-2xl bg-white border border-[#f2e8da] flex items-center space-x-4 shadow-xs hover:scale-[1.02] transition-all stark-hud-card">
          <div className="p-3 rounded-xl bg-emerald-50 text-emerald-600 shadow-xs border border-emerald-100">
            <Banknote className="w-5 h-5 text-emerald-600" />
          </div>
          <div>
            <div className="text-2xl font-black text-emerald-600">
              {formatCurrency(cashTotal)}
            </div>
            <div className="text-xs font-bold text-[#78716c]">Cash Spent</div>
          </div>
        </div>
      </div>

      {/* Analysis & Savings Goal Section */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {/* Savings Goal Tracker */}
        <div className="p-4 rounded-2xl bg-white border border-[#f2e8da] shadow-xs stark-hud-card">
          <div className="flex items-center justify-between mb-4">
            <div className="flex items-center space-x-2">
              <Target className="w-4 h-4 text-[#ff7a00]" />
              <h3 className="text-sm font-black text-[#1c1917]">Savings Goal</h3>
            </div>
            {!isEditingGoal && (
              <button onClick={() => setIsEditingGoal(true)} className="p-1 text-[#a8a29e] hover:text-[#ff7a00] transition-colors">
                <Edit2 className="w-3.5 h-3.5" />
              </button>
            )}
          </div>

          {isEditingGoal ? (
            <form onSubmit={handleSaveGoal} className="flex items-center space-x-2 animate-fade-in-up">
              <input
                type="number"
                value={newGoal}
                onChange={(e) => setNewGoal(e.target.value)}
                className="w-full px-3 py-1.5 bg-[#faf7f2] border border-[#f0e8dc] rounded-xl text-sm font-bold outline-none focus:border-[#ff7a00]"
                autoFocus
              />
              <button type="submit" className="px-3 py-1.5 bg-[#ff7a00] text-white text-xs font-black rounded-xl">Save</button>
            </form>
          ) : (
            <div className="space-y-2">
              <div className="flex justify-between items-end">
                <div className="text-2xl font-black text-[#1c1917]">{formatCurrency(total)} <span className="text-sm text-[#a8a29e] font-semibold">/ {formatCurrency(savingsGoal)}</span></div>
                <div className="text-xs font-bold text-[#ff7a00]">{goalProgress.toFixed(1)}%</div>
              </div>
              <div className="w-full bg-[#f0e8dc] h-3 rounded-full overflow-hidden shadow-inner">
                <div
                  className={`h-full transition-all duration-1000 ${goalProgress > 100 ? 'bg-red-500' : 'bg-gradient-to-r from-[#ff7a00] to-[#ff9500]'}`}
                  style={{ width: `${Math.min(goalProgress, 100)}%` }}
                />
              </div>
              {goalProgress > 100 && (
                <p className="text-[10px] font-bold text-red-500 mt-1">Warning: You have exceeded your expense goal!</p>
              )}
            </div>
          )}
        </div>

        {/* Category Breakdown Chart */}
        <div className="p-4 rounded-2xl bg-white border border-[#f2e8da] shadow-xs stark-hud-card h-48 flex items-center">
          <div className="flex-1 h-full">
            {categoryData.length > 0 ? (
              <ResponsiveContainer width="100%" height="100%">
                <RechartsPie>
                  <Pie
                    data={categoryData}
                    cx="50%"
                    cy="50%"
                    innerRadius={40}
                    outerRadius={60}
                    paddingAngle={5}
                    dataKey="value"
                  >
                    {categoryData.map((_, index) => (
                      <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                    ))}
                  </Pie>
                  <Tooltip 
                    formatter={(value: any) => formatCurrency(value)}
                    contentStyle={{ borderRadius: '12px', border: '1px solid #f0e8dc', fontSize: '12px', fontWeight: 'bold' }}
                  />
                </RechartsPie>
              </ResponsiveContainer>
            ) : (
              <div className="w-full h-full flex items-center justify-center text-xs text-[#a8a29e] font-medium">
                No data to analyze
              </div>
            )}
          </div>
          <div className="w-1/2 max-h-full overflow-y-auto pl-4 space-y-2">
            <h3 className="text-[10px] uppercase font-black text-[#a8a29e] tracking-wider mb-2">Category Breakdown</h3>
            {categoryData.map((entry, index) => (
              <div key={entry.name} className="flex items-center justify-between text-xs">
                <div className="flex items-center space-x-1.5">
                  <span className="w-2 h-2 rounded-full" style={{ backgroundColor: COLORS[index % COLORS.length] }} />
                  <span className="font-semibold text-[#44403c] truncate max-w-[80px]">{entry.name}</span>
                </div>
                <span className="font-black text-[#1c1917]">{formatCurrency(entry.value)}</span>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Main Tracker Container */}
      <div className="rounded-2xl border border-[#f2e8da] bg-white shadow-xs overflow-hidden stark-hud-card">
        {/* Header Controls */}
        <div className="p-4 border-b border-[#f2e8da] flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3">
          <div className="flex items-center space-x-2">
            <PieChart className="w-4 h-4 text-[#ff7a00]" />
            <h3 className="text-sm font-black text-[#1c1917] tracking-wide">Expense History</h3>
          </div>

          <div className="flex items-center gap-2 flex-wrap">
            <button
              onClick={() => setIsAdding(!isAdding)}
              className="flex items-center space-x-1.5 px-3.5 py-1.5 rounded-xl bg-gradient-to-r from-[#ff7a00] to-[#ff9500] hover:from-[#e66e00] hover:to-[#e68600] text-white text-xs font-black shadow-xs transition-all hover:scale-105"
            >
              <Plus className="w-3.5 h-3.5" />
              <span>Add Expense</span>
            </button>
          </div>
        </div>

        {/* Add Expense Form */}
        {isAdding && (
          <form onSubmit={handleAddExpense} className="p-4 bg-[#faf7f2] border-b border-[#f0e8dc] flex flex-col sm:flex-row items-stretch sm:items-center gap-3 animate-fade-in-up">
            <input
              type="number"
              placeholder="Amount (₹)"
              value={amount}
              onChange={(e) => setAmount(e.target.value)}
              className="w-full sm:w-28 px-3 py-1.5 bg-white border border-[#f0e8dc] rounded-xl text-xs outline-none focus:border-[#ff7a00] text-[#1c1917] font-bold"
              autoFocus
            />
            <input
              type="text"
              placeholder="What was this for?"
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              className="flex-1 min-w-0 px-3 py-1.5 bg-white border border-[#f0e8dc] rounded-xl text-xs outline-none focus:border-[#ff7a00] text-[#1c1917] font-medium"
            />
            <select
              value={category}
              onChange={(e) => setCategory(e.target.value)}
              className="px-3 py-1.5 bg-white border border-[#f0e8dc] rounded-xl text-xs outline-none text-[#1c1917] font-medium"
            >
              <option value="Food & Dining">Food & Dining</option>
              <option value="Transportation">Transportation</option>
              <option value="Shopping">Shopping</option>
              <option value="Entertainment">Entertainment</option>
              <option value="Bills & Utilities">Bills & Utilities</option>
              <option value="Other">Other</option>
            </select>
            <select
              value={method}
              onChange={(e: any) => setMethod(e.target.value)}
              className="px-3 py-1.5 bg-white border border-[#f0e8dc] rounded-xl text-xs outline-none font-bold"
            >
              <option value="GPay">GPay</option>
              <option value="Cash">Cash</option>
            </select>
            <div className="flex items-center space-x-2">
              <button
                type="submit"
                className="px-3.5 py-1.5 bg-[#ff7a00] text-white text-xs font-black rounded-xl whitespace-nowrap hover:bg-[#e66e00] transition-colors"
              >
                Save
              </button>
              <button
                type="button"
                onClick={() => setIsAdding(false)}
                className="px-2.5 py-1.5 text-xs text-[#78716c] hover:text-[#1c1917] transition-colors"
              >
                Cancel
              </button>
            </div>
          </form>
        )}

        {/* Expense List */}
        <div className="divide-y divide-[#f2e8da]">
          {filteredExpenses.length === 0 ? (
            <div className="p-8 text-center text-sm text-[#a8a29e]">
              No expenses recorded yet.
            </div>
          ) : (
            filteredExpenses.map((expense) => (
              <div
                key={expense.id}
                className="flex items-center justify-between p-4 hover:bg-[#faf7f2] transition-colors group"
              >
                <div className="flex items-center space-x-4">
                  <div className={`p-2 rounded-xl border ${expense.payment_method === 'Cash' ? 'bg-emerald-50 border-emerald-100 text-emerald-600' : 'bg-blue-50 border-blue-100 text-blue-600'}`}>
                    {expense.payment_method === 'Cash' ? <Banknote className="w-4 h-4" /> : <Landmark className="w-4 h-4" />}
                  </div>
                  <div>
                    <div className="text-sm font-bold text-[#1c1917]">{expense.description}</div>
                    <div className="flex items-center space-x-2 text-[10px] font-semibold text-[#a8a29e] mt-0.5">
                      <span>{expense.category}</span>
                      <span>•</span>
                      <span>{new Date(expense.date).toLocaleDateString()}</span>
                    </div>
                  </div>
                </div>
                <div className="flex items-center space-x-4">
                  <div className="text-sm font-black text-[#1c1917]">
                    {formatCurrency(expense.amount)}
                  </div>
                  <button
                    onClick={() => activeWorkspace && deleteExpense(activeWorkspace.id, expense.id)}
                    className="p-1 opacity-0 group-hover:opacity-100 text-[#a8a29e] hover:text-red-500 transition-opacity"
                    title="Delete expense"
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>
                </div>
              </div>
            ))
          )}
        </div>
      </div>
    </div>
  );
};
