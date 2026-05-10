/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import { useState, useMemo, useEffect } from 'react';
import { 
  Wallet, 
  TrendingUp, 
  TrendingDown, 
  Plus, 
  Filter, 
  Download, 
  BarChart3, 
  PieChart as PieChartIcon, 
  List, 
  ChevronRight,
  Search,
  X,
  CreditCard,
  Banknote,
  Smartphone,
  CheckCircle2,
  AlertCircle
} from 'lucide-react';
import { 
  BarChart, 
  Bar, 
  XAxis, 
  YAxis, 
  CartesianGrid, 
  Tooltip, 
  ResponsiveContainer, 
  PieChart, 
  Pie, 
  Cell, 
  LineChart, 
  Line,
  Legend
} from 'recharts';
import { motion, AnimatePresence } from 'motion/react';
import { format, startOfMonth, endOfMonth, isWithinInterval, parseISO } from 'date-fns';
import { Transaction, Category, Budget } from './types';
import { generateSyntheticData } from './utils';

const COLORS = ['#6366f1', '#8b5cf6', '#ec4899', '#f43f5e', '#f59e0b', '#10b981', '#06b6d4', '#3b82f6'];

export default function App() {
  const [transactions, setTransactions] = useState<Transaction[]>([]);
  const [budgets, setBudgets] = useState<Budget[]>([
    { category: 'Food & Dining', limit: 5000 },
    { category: 'Transport', limit: 2000 },
    { category: 'Shopping', limit: 8000 },
    { category: 'Groceries', limit: 4000 }
  ]);
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCategory, setSelectedCategory] = useState<Category | 'All'>('All');
  const [isAddingExpense, setIsAddingExpense] = useState(false);

  // New Transaction State
  const [newTx, setNewTx] = useState({
    description: '',
    amount: '',
    category: 'Other' as Category,
    date: format(new Date(), 'yyyy-MM-dd'),
    paymentMethod: 'UPI'
  });

  useEffect(() => {
    const saved = localStorage.getItem('spendwise_transactions');
    if (saved) {
      setTransactions(JSON.parse(saved));
    } else {
      const initial = generateSyntheticData(40);
      setTransactions(initial);
      localStorage.setItem('spendwise_transactions', JSON.stringify(initial));
    }
  }, []);

  const saveTransactions = (data: Transaction[]) => {
    setTransactions(data);
    localStorage.setItem('spendwise_transactions', JSON.stringify(data));
  };

  const filteredTransactions = useMemo(() => {
    return transactions.filter(t => {
      const matchesSearch = t.description.toLowerCase().includes(searchQuery.toLowerCase());
      const matchesCategory = selectedCategory === 'All' || t.category === selectedCategory;
      return matchesSearch && matchesCategory;
    });
  }, [transactions, searchQuery, selectedCategory]);

  const kpis = useMemo(() => {
    const totalIncome = transactions.filter(t => t.amount > 0).reduce((acc, t) => acc + t.amount, 0);
    const totalExpense = Math.abs(transactions.filter(t => t.amount < 0).reduce((acc, t) => acc + t.amount, 0));
    const balance = totalIncome - totalExpense;
    return { totalIncome, totalExpense, balance };
  }, [transactions]);

  const categoryData = useMemo(() => {
    const data: Record<string, number> = {};
    transactions.filter(t => t.amount < 0).forEach(t => {
      data[t.category] = (data[t.category] || 0) + Math.abs(t.amount);
    });
    return Object.entries(data).map(([name, value]) => ({ name, value }));
  }, [transactions]);

  const monthlyTrend = useMemo(() => {
    const data: Record<string, { income: number; expense: number }> = {};
    transactions.forEach(t => {
      const month = format(parseISO(t.date), 'MMM yyyy');
      if (!data[month]) data[month] = { income: 0, expense: 0 };
      if (t.amount > 0) data[month].income += t.amount;
      else data[month].expense += Math.abs(t.amount);
    });
    return Object.entries(data).map(([name, { income, expense }]) => ({ name, income, expense })).reverse();
  }, [transactions]);

  const handleAddTransaction = (e: React.FormEvent) => {
    e.preventDefault();
    const amount = parseFloat(newTx.amount);
    const category = newTx.category;
    // Positive for income, negative for everything else except if specifically marked as income category
    const finalAmount = category === 'Income' ? Math.abs(amount) : -Math.abs(amount);

    const transaction: Transaction = {
      id: Math.random().toString(36).substr(2, 9),
      date: new Date(newTx.date).toISOString(),
      description: newTx.description,
      amount: finalAmount,
      category: category,
      paymentMethod: newTx.paymentMethod
    };

    saveTransactions([transaction, ...transactions]);
    setIsAddingExpense(false);
    setNewTx({
      description: '',
      amount: '',
      category: 'Other',
      date: format(new Date(), 'yyyy-MM-dd'),
      paymentMethod: 'UPI'
    });
  };

  const getPaymentIcon = (method: string) => {
    switch (method) {
      case 'UPI': return <Smartphone className="w-4 h-4 text-emerald-500" />;
      case 'Credit Card': return <CreditCard className="w-4 h-4 text-blue-500" />;
      case 'Cash': return <Banknote className="w-4 h-4 text-orange-500" />;
      default: return <Wallet className="w-4 h-4 text-purple-500" />;
    }
  };

  const getBudgetStatus = (category: Category) => {
    const budget = budgets.find(b => b.category === category);
    if (!budget) return null;
    
    // Spend in current month
    const currentMonth = startOfMonth(new Date());
    const spend = Math.abs(transactions
      .filter(t => t.category === category && t.amount < 0 && isWithinInterval(parseISO(t.date), { start: currentMonth, end: endOfMonth(new Date()) }))
      .reduce((acc, t) => acc + t.amount, 0));
    
    const percentage = (spend / budget.limit) * 100;
    return { spend, limit: budget.limit, percentage };
  };

  const exportData = () => {
    const csvContent = "data:text/csv;charset=utf-8," 
      + "Date,Description,Category,Amount,Payment Method\n"
      + transactions.map(t => `${format(parseISO(t.date), 'yyyy-MM-dd')},${t.description},${t.category},${t.amount},${t.paymentMethod}`).join("\n");
    
    const encodedUri = encodeURI(csvContent);
    const link = document.createElement("a");
    link.setAttribute("href", encodedUri);
    link.setAttribute("download", `expenses_report_${format(new Date(), 'yyyy-MM-dd')}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  return (
    <div className="min-h-screen bg-neutral-50 px-4 py-8 md:px-8">
      <div className="max-w-7xl mx-auto space-y-8">
        
        {/* Header */}
        <header className="flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div>
            <h1 className="text-3xl font-bold tracking-tight text-neutral-900">SpendWise</h1>
            <p className="text-neutral-500">Master your personal finances with smart insights.</p>
          </div>
          <div className="flex items-center gap-3">
            <button 
              onClick={exportData}
              className="px-4 py-2 flex items-center gap-2 bg-white border border-neutral-200 rounded-xl font-medium text-neutral-700 hover:bg-neutral-50 transition-colors shadow-sm"
            >
              <Download className="w-4 h-4" />
              <span>Export CSV</span>
            </button>
            <button 
              onClick={() => setIsAddingExpense(true)}
              className="px-4 py-2 flex items-center gap-2 bg-indigo-600 text-white rounded-xl font-medium hover:bg-indigo-700 transition-colors shadow-lg shadow-indigo-200"
            >
              <Plus className="w-4 h-4" />
              <span>Add Transaction</span>
            </button>
          </div>
        </header>

        {/* KPI Section */}
        <section className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <motion.div 
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            className="glass-panel p-6 card-hover"
          >
            <div className="flex items-center gap-4">
              <div className="p-3 bg-indigo-100 rounded-xl text-indigo-600">
                <Wallet className="w-6 h-6" />
              </div>
              <div>
                <p className="text-sm font-medium text-neutral-500">Current Balance</p>
                <h3 className="text-2xl font-bold text-neutral-900">₹{kpis.balance.toLocaleString()}</h3>
              </div>
            </div>
          </motion.div>

          <motion.div 
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.1 }}
            className="glass-panel p-6 card-hover"
          >
            <div className="flex items-center gap-4">
              <div className="p-3 bg-emerald-100 rounded-xl text-emerald-600">
                <TrendingUp className="w-6 h-6" />
              </div>
              <div>
                <p className="text-sm font-medium text-neutral-500">Total Income</p>
                <h3 className="text-2xl font-bold text-neutral-900">₹{kpis.totalIncome.toLocaleString()}</h3>
              </div>
            </div>
          </motion.div>

          <motion.div 
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.2 }}
            className="glass-panel p-6 card-hover"
          >
            <div className="flex items-center gap-4">
              <div className="p-3 bg-rose-100 rounded-xl text-rose-600">
                <TrendingDown className="w-6 h-6" />
              </div>
              <div>
                <p className="text-sm font-medium text-neutral-500">Total Expenses</p>
                <h3 className="text-2xl font-bold text-neutral-900">₹{kpis.totalExpense.toLocaleString()}</h3>
              </div>
            </div>
          </motion.div>
        </section>

        {/* Main Content Grid */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          
          {/* Left Column: Visualizations & Budgets */}
          <div className="lg:col-span-2 space-y-8">
            
            {/* Monthly Trend Chart */}
            <div className="glass-panel p-6">
              <div className="flex items-center justify-between mb-6">
                <h3 className="flex items-center gap-2 font-bold text-neutral-900">
                  <BarChart3 className="w-5 h-5 text-indigo-600" />
                  Monthly Spending Trends
                </h3>
              </div>
              <div className="h-64 w-full">
                <ResponsiveContainer width="100%" height="100%">
                  <LineChart data={monthlyTrend}>
                    <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f0f0f0" />
                    <XAxis dataKey="name" axisLine={false} tickLine={false} tick={{ fontSize: 12, fill: '#888' }} />
                    <YAxis axisLine={false} tickLine={false} tick={{ fontSize: 12, fill: '#888' }} />
                    <Tooltip 
                      contentStyle={{ backgroundColor: '#fff', borderRadius: '12px', border: 'none', boxShadow: '0 10px 15px -3px rgb(0 0 0 / 0.1)' }}
                      formatter={(value: any) => [`₹${value.toLocaleString()}`, '']}
                    />
                    <Legend iconType="circle" />
                    <Line type="monotone" dataKey="income" stroke="#10b981" strokeWidth={3} dot={{ r: 4, fill: '#10b981' }} />
                    <Line type="monotone" dataKey="expense" stroke="#6366f1" strokeWidth={3} dot={{ r: 4, fill: '#6366f1' }} />
                  </LineChart>
                </ResponsiveContainer>
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
              {/* Category Distribution */}
              <div className="glass-panel p-6">
                <div className="flex items-center justify-between mb-6">
                  <h3 className="flex items-center gap-2 font-bold text-neutral-900">
                    <PieChartIcon className="w-5 h-5 text-indigo-600" />
                    Expense by Category
                  </h3>
                </div>
                <div className="h-64">
                  <ResponsiveContainer width="100%" height="100%">
                    <PieChart>
                      <Pie
                        data={categoryData}
                        cx="50%"
                        cy="50%"
                        innerRadius={60}
                        outerRadius={80}
                        paddingAngle={5}
                        dataKey="value"
                      >
                        {categoryData.map((_entry, index) => (
                          <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                        ))}
                      </Pie>
                      <Tooltip formatter={(value: any) => `₹${value.toLocaleString()}`} />
                    </PieChart>
                  </ResponsiveContainer>
                </div>
                <div className="mt-4 flex flex-wrap gap-x-4 gap-y-2 justify-center">
                  {categoryData.map((entry, index) => (
                    <div key={entry.name} className="flex items-center gap-2">
                      <div className="w-3 h-3 rounded-full" style={{ backgroundColor: COLORS[index % COLORS.length] }}></div>
                      <span className="text-xs text-neutral-600 font-medium">{entry.name}</span>
                    </div>
                  ))}
                </div>
              </div>

              {/* Budget Controls */}
              <div className="glass-panel p-6">
                <h3 className="font-bold text-neutral-900 mb-6">Monthly Budgets</h3>
                <div className="space-y-6">
                  {budgets.map(budget => {
                    const status = getBudgetStatus(budget.category);
                    if (!status) return null;
                    const isOver = status.percentage >= 100;

                    return (
                      <div key={budget.category} className="space-y-2">
                        <div className="flex justify-between items-center text-sm">
                          <span className="font-medium text-neutral-700">{budget.category}</span>
                          <span className={`font-bold ${isOver ? 'text-rose-600' : 'text-neutral-900'}`}>
                            ₹{status.spend.toLocaleString()} / ₹{status.limit.toLocaleString()}
                          </span>
                        </div>
                        <div className="h-2 bg-neutral-100 rounded-full overflow-hidden">
                          <motion.div 
                            initial={{ width: 0 }}
                            animate={{ width: `${Math.min(status.percentage, 100)}%` }}
                            className={`h-full rounded-full ${isOver ? 'bg-rose-500' : 'bg-indigo-500'}`}
                          />
                        </div>
                        {isOver && (
                          <p className="text-[10px] text-rose-500 flex items-center gap-1 font-medium">
                            <AlertCircle className="w-3 h-3" /> Budget exceeded
                          </p>
                        )}
                      </div>
                    );
                  })}
                </div>
              </div>
            </div>
          </div>

          {/* Right Column: Transactions List */}
          <div className="lg:col-span-1 space-y-6">
            <div className="glass-panel p-6 flex flex-col h-[750px]">
              <div className="mb-6 space-y-4">
                <div className="flex items-center justify-between">
                  <h3 className="flex items-center gap-2 font-bold text-neutral-900">
                    <List className="w-5 h-5 text-indigo-600" />
                    History
                  </h3>
                  <span className="text-xs font-medium text-neutral-400">{filteredTransactions.length} items</span>
                </div>
                
                <div className="relative">
                  <Search className="absolute left-3 top-3 w-4 h-4 text-neutral-400" />
                  <input 
                    type="text" 
                    placeholder="Search descriptions..."
                    className="w-full pl-10 pr-4 py-2 border border-neutral-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 transition-all"
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                  />
                </div>

                <div className="flex gap-2 overflow-x-auto pb-2 scrollbar-hide">
                  {['All', ...new Set(transactions.map(t => t.category))].map(cat => (
                    <button
                      key={cat}
                      className={`px-3 py-1.5 rounded-lg text-xs font-medium whitespace-nowrap transition-colors ${
                        selectedCategory === cat 
                          ? 'bg-indigo-600 text-white' 
                          : 'bg-neutral-100 text-neutral-600 hover:bg-neutral-200'
                      }`}
                      onClick={() => setSelectedCategory(cat as Category | 'All')}
                    >
                      {cat}
                    </button>
                  ))}
                </div>
              </div>

              <div className="overflow-y-auto space-y-4 pr-1">
                <AnimatePresence>
                  {filteredTransactions.map(tx => (
                    <motion.div 
                      key={tx.id}
                      layout
                      initial={{ opacity: 0, x: 20 }}
                      animate={{ opacity: 1, x: 0 }}
                      exit={{ opacity: 0, x: -20 }}
                      className="p-3 border border-neutral-100 rounded-xl hover:bg-neutral-50 transition-colors flex items-center justify-between group"
                    >
                      <div className="flex items-center gap-3">
                        <div className={`p-2 rounded-lg ${tx.amount > 0 ? 'bg-emerald-50 text-emerald-600' : 'bg-neutral-100 text-neutral-500'}`}>
                          {getPaymentIcon(tx.paymentMethod)}
                        </div>
                        <div>
                          <p className="text-sm font-bold text-neutral-900 leading-tight">{tx.description}</p>
                          <div className="flex items-center gap-2 mt-1">
                            <span className="text-[10px] font-medium px-1.5 py-0.5 bg-neutral-100 text-neutral-500 rounded uppercase tracking-wider">{tx.category}</span>
                            <span className="text-[10px] text-neutral-400 font-medium">{format(parseISO(tx.date), 'dd MMM')}</span>
                          </div>
                        </div>
                      </div>
                      <div className="text-right">
                        <p className={`text-sm font-bold ${tx.amount > 0 ? 'text-emerald-600' : 'text-neutral-900'}`}>
                          {tx.amount > 0 ? '+' : ''}{tx.amount.toLocaleString()}
                        </p>
                        <button 
                          onClick={() => {
                            const next = transactions.filter(t => t.id !== tx.id);
                            saveTransactions(next);
                          }}
                          className="opacity-0 group-hover:opacity-100 text-[10px] text-rose-500 font-bold uppercase transition-opacity"
                        >
                          delete
                        </button>
                      </div>
                    </motion.div>
                  ))}
                </AnimatePresence>
                {filteredTransactions.length === 0 && (
                  <div className="text-center py-10 space-y-2">
                    <div className="w-12 h-12 bg-neutral-100 rounded-full flex items-center justify-center mx-auto text-neutral-400">
                      <Search className="w-6 h-6" />
                    </div>
                    <p className="text-sm text-neutral-400 font-medium">No transactions found</p>
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>

        {/* Add Modal */}
        <AnimatePresence>
          {isAddingExpense && (
            <div className="fixed inset-0 z-50 flex items-center justify-center px-4">
              <motion.div 
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                className="absolute inset-0 bg-neutral-900/40 backdrop-blur-sm"
                onClick={() => setIsAddingExpense(false)}
              />
              <motion.div 
                initial={{ opacity: 0, scale: 0.95 }}
                animate={{ opacity: 1, scale: 1 }}
                exit={{ opacity: 0, scale: 0.95 }}
                className="relative bg-white rounded-3xl shadow-2xl w-full max-w-md p-8"
              >
                <div className="flex justify-between items-center mb-6">
                  <h3 className="text-xl font-bold text-neutral-900">New Transaction</h3>
                  <button 
                    onClick={() => setIsAddingExpense(false)}
                    className="p-2 hover:bg-neutral-100 rounded-full transition-colors"
                  >
                    <X className="w-5 h-5 text-neutral-400" />
                  </button>
                </div>

                <form onSubmit={handleAddTransaction} className="space-y-4">
                  <div className="space-y-1">
                    <label className="text-xs font-bold text-neutral-500 uppercase tracking-wider ml-1">Description</label>
                    <input 
                      required
                      type="text" 
                      placeholder="e.g. Starbucks, Rent, Salary"
                      className="w-full px-4 py-3 border border-neutral-200 rounded-xl focus:ring-2 focus:ring-indigo-500/20 focus:outline-none focus:border-indigo-500 transition-all font-medium"
                      value={newTx.description}
                      onChange={e => setNewTx({...newTx, description: e.target.value})}
                    />
                  </div>
                  
                  <div className="grid grid-cols-2 gap-4">
                    <div className="space-y-1">
                      <label className="text-xs font-bold text-neutral-500 uppercase tracking-wider ml-1">Amount (₹)</label>
                      <input 
                        required
                        type="number" 
                        placeholder="0.00"
                        className="w-full px-4 py-3 border border-neutral-200 rounded-xl focus:ring-2 focus:ring-indigo-500/20 focus:outline-none focus:border-indigo-500 transition-all font-bold"
                        value={newTx.amount}
                        onChange={e => setNewTx({...newTx, amount: e.target.value})}
                      />
                    </div>
                    <div className="space-y-1">
                      <label className="text-xs font-bold text-neutral-500 uppercase tracking-wider ml-1">Category</label>
                      <select 
                        className="w-full px-4 py-3 border border-neutral-200 rounded-xl focus:ring-2 focus:ring-indigo-500/20 focus:outline-none focus:border-indigo-500 transition-all font-medium bg-white"
                        value={newTx.category}
                        onChange={e => setNewTx({...newTx, category: e.target.value as Category})}
                      >
                        {['Food & Dining', 'Transport', 'Shopping', 'Bills & Utilities', 'Entertainment', 'Groceries', 'Income', 'Other'].map(c => (
                          <option key={c} value={c}>{c}</option>
                        ))}
                      </select>
                    </div>
                  </div>

                  <div className="grid grid-cols-2 gap-4">
                    <div className="space-y-1">
                      <label className="text-xs font-bold text-neutral-500 uppercase tracking-wider ml-1">Date</label>
                      <input 
                        required
                        type="date" 
                        className="w-full px-4 py-3 border border-neutral-200 rounded-xl focus:ring-2 focus:ring-indigo-500/20 focus:outline-none focus:border-indigo-500 transition-all font-medium"
                        value={newTx.date}
                        onChange={e => setNewTx({...newTx, date: e.target.value})}
                      />
                    </div>
                    <div className="space-y-1">
                      <label className="text-xs font-bold text-neutral-500 uppercase tracking-wider ml-1">Method</label>
                      <select 
                        className="w-full px-4 py-3 border border-neutral-200 rounded-xl focus:ring-2 focus:ring-indigo-500/20 focus:outline-none focus:border-indigo-500 transition-all font-medium bg-white"
                        value={newTx.paymentMethod}
                        onChange={e => setNewTx({...newTx, paymentMethod: e.target.value})}
                      >
                        <option value="UPI">UPI</option>
                        <option value="Credit Card">Credit Card</option>
                        <option value="Cash">Cash</option>
                        <option value="Bank Transfer">Bank Transfer</option>
                      </select>
                    </div>
                  </div>

                  <button 
                    type="submit"
                    className="w-full py-4 mt-6 bg-indigo-600 text-white rounded-2xl font-bold hover:bg-indigo-700 transition-all shadow-xl shadow-indigo-100 flex items-center justify-center gap-2"
                  >
                    <CheckCircle2 className="w-5 h-5" />
                    Save Transaction
                  </button>
                </form>
              </motion.div>
            </div>
          )}
        </AnimatePresence>

      </div>
    </div>
  );
}
