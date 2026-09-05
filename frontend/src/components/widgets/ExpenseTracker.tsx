import React, { useState } from 'react';
import { Plus, Trash2, Wallet, Banknote, Landmark, PieChart } from 'lucide-react';
import { useExpenseStore } from '../../store/useExpenseStore';

export const ExpenseTracker: React.FC = () => {
  const {
    expenses,
    addExpense,
    deleteExpense,
    getTotalExpenses,
    getExpensesByMethod,
  } = useExpenseStore();

  const [isAdding, setIsAdding] = useState(false);
  const [amount, setAmount] = useState('');
  const [description, setDescription] = useState('');
  const [category, setCategory] = useState('Food & Dining');
  const [method, setMethod] = useState<'Cash' | 'GPay'>('GPay');

  const handleAddExpense = (e: React.FormEvent) => {
    e.preventDefault();
    const numAmount = parseFloat(amount);
    if (!description.trim() || isNaN(numAmount) || numAmount <= 0) return;
    
    addExpense(numAmount, description, category, method);
    setAmount('');
    setDescription('');
    setIsAdding(false);
  };

  const total = getTotalExpenses();
  const cashTotal = getExpensesByMethod('Cash');
  const gpayTotal = getExpensesByMethod('GPay');

  const formatCurrency = (val: number) => {
    return new Intl.NumberFormat('en-IN', {
      style: 'currency',
      currency: 'INR',
      maximumFractionDigits: 0,
    }).format(val);
  };

  return (
    <div className="my-6 space-y-6 select-none animate-fade-in-up font-['Sora']">
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

      {/* Main Tracker Container */}
      <div className="rounded-2xl border border-[#f2e8da] bg-white shadow-xs overflow-hidden stark-hud-card">
        {/* Header Controls */}
        <div className="p-4 border-b border-[#f2e8da] flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3">
          <div className="flex items-center space-x-2">
            <PieChart className="w-4 h-4 text-[#ff7a00]" />
            <h3 className="text-sm font-black text-[#1c1917] tracking-wide">Expense Tracker</h3>
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
          {expenses.length === 0 ? (
            <div className="p-8 text-center text-sm text-[#a8a29e]">
              No expenses recorded yet.
            </div>
          ) : (
            expenses.map((expense) => (
              <div
                key={expense.id}
                className="flex items-center justify-between p-4 hover:bg-[#faf7f2] transition-colors group"
              >
                <div className="flex items-center space-x-4">
                  <div className={`p-2 rounded-xl border ${expense.paymentMethod === 'Cash' ? 'bg-emerald-50 border-emerald-100 text-emerald-600' : 'bg-blue-50 border-blue-100 text-blue-600'}`}>
                    {expense.paymentMethod === 'Cash' ? <Banknote className="w-4 h-4" /> : <Landmark className="w-4 h-4" />}
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
                    onClick={() => deleteExpense(expense.id)}
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
