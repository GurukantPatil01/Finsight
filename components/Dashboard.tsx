import React, { useMemo } from 'react';
import { 
  PieChart, Pie, Cell, ResponsiveContainer, Tooltip, 
} from 'recharts';
import { Transaction, TransactionType, FinancialAdvice } from '../types';
import StatCard from './StatCard';
import { Icons } from './Icons';

interface DashboardProps {
  transactions: Transaction[];
  advice: FinancialAdvice | null;
}

const COLORS = ['#0ea5e9', '#6366f1', '#8b5cf6', '#ec4899', '#f43f5e', '#fb923c', '#eab308'];

const Dashboard: React.FC<DashboardProps> = ({ transactions, advice }) => {
  
  const stats = useMemo(() => {
    const income = transactions
      .filter(t => t.type === TransactionType.INCOME)
      .reduce((acc, curr) => acc + curr.amount, 0);
      
    const expense = transactions
      .filter(t => t.type === TransactionType.EXPENSE)
      .reduce((acc, curr) => acc + curr.amount, 0);
      
    return {
      income,
      expense,
      net: income - expense
    };
  }, [transactions]);

  const categoryData = useMemo(() => {
    const categories: Record<string, number> = {};
    transactions
      .filter(t => t.type === TransactionType.EXPENSE)
      .forEach(t => {
        categories[t.category] = (categories[t.category] || 0) + t.amount;
      });
    
    return Object.entries(categories)
      .map(([name, value]) => ({ name, value }))
      .sort((a, b) => b.value - a.value);
  }, [transactions]);

  if (transactions.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center py-20 text-center space-y-6 animate-fadeIn" style={{ animationDelay: '200ms' }}>
        <div className="p-6 bg-slate-100 dark:bg-slate-800 rounded-full shadow-inner">
          <Icons.PieChart className="w-16 h-16 text-slate-300 dark:text-slate-600" />
        </div>
        <div className="space-y-2">
          <h3 className="text-2xl font-semibold text-slate-800 dark:text-white">Dashboard Empty</h3>
          <p className="text-slate-500 dark:text-slate-400 max-w-sm mx-auto">
            Upload a receipt or bank statement above to see the magic happen.
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-8 animate-fadeIn" style={{ animationDelay: '200ms' }}>
      {/* Stats Grid */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <StatCard 
          title="Total Income" 
          value={`$${stats.income.toFixed(2)}`}
          icon={<Icons.TrendingUp className="w-5 h-5" />}
          trendUp={true}
          delay={0}
        />
        <StatCard 
          title="Total Expenses" 
          value={`$${stats.expense.toFixed(2)}`}
          icon={<Icons.TrendingDown className="w-5 h-5" />}
          trendUp={false}
          delay={100}
        />
        <StatCard 
          title="Net Balance" 
          value={`$${stats.net.toFixed(2)}`}
          icon={<Icons.Wallet className="w-5 h-5" />}
          trend={stats.net >= 0 ? "Positive Cashflow" : "Negative Cashflow"}
          trendUp={stats.net >= 0}
          delay={200}
        />
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        {/* Spending Breakdown */}
        <div className="bg-white dark:bg-dark-card p-6 rounded-2xl shadow-sm border border-slate-100 dark:border-slate-800 hover:shadow-md transition-shadow duration-300">
          <h3 className="text-lg font-semibold text-slate-800 dark:text-white mb-6 flex items-center gap-2">
            <Icons.PieChart className="w-5 h-5 text-primary-500" />
            Spending Analysis
          </h3>
          <div className="h-[300px] w-full">
            <ResponsiveContainer width="100%" height="100%">
              <PieChart>
                <Pie
                  data={categoryData}
                  cx="50%"
                  cy="50%"
                  innerRadius={65}
                  outerRadius={100}
                  paddingAngle={5}
                  dataKey="value"
                  stroke="none"
                >
                  {categoryData.map((entry, index) => (
                    <Cell 
                      key={`cell-${index}`} 
                      fill={COLORS[index % COLORS.length]} 
                      className="hover:opacity-80 transition-opacity duration-300 cursor-pointer"
                    />
                  ))}
                </Pie>
                <Tooltip 
                  contentStyle={{ 
                    backgroundColor: 'rgba(255, 255, 255, 0.95)', 
                    borderRadius: '12px',
                    border: 'none',
                    boxShadow: '0 10px 15px -3px rgb(0 0 0 / 0.1)',
                    padding: '12px'
                  }}
                  itemStyle={{ color: '#1e293b', fontWeight: 600 }}
                  formatter={(value: number) => [`$${value.toFixed(2)}`, 'Amount']}
                />
              </PieChart>
            </ResponsiveContainer>
          </div>
          <div className="flex flex-wrap gap-2 mt-4 justify-center">
            {categoryData.slice(0, 5).map((cat, idx) => (
              <div key={idx} className="flex items-center gap-1.5 text-xs font-medium text-slate-600 dark:text-slate-400 bg-slate-50 dark:bg-slate-800 px-3 py-1.5 rounded-full border border-slate-100 dark:border-slate-700">
                <div className="w-2 h-2 rounded-full" style={{ backgroundColor: COLORS[idx % COLORS.length] }}></div>
                {cat.name} <span className="text-slate-400 dark:text-slate-500">({Math.round((cat.value / stats.expense) * 100)}%)</span>
              </div>
            ))}
          </div>
        </div>

        {/* AI Insights & Recent Transactions Preview */}
        <div className="space-y-6">
          {advice && (
            <div className="bg-gradient-to-br from-indigo-50 to-purple-50 dark:from-indigo-900/20 dark:to-purple-900/20 p-6 rounded-2xl border border-indigo-100 dark:border-indigo-900/50 shadow-sm relative overflow-hidden group">
              <div className="absolute top-0 right-0 w-32 h-32 bg-indigo-500/10 rounded-full blur-2xl -mr-16 -mt-16 pointer-events-none"></div>
              
              <div className="flex items-center gap-2 mb-4 relative">
                <div className="p-2 bg-indigo-500 rounded-lg text-white shadow-lg shadow-indigo-500/30">
                   <Icons.FileText className="w-4 h-4" />
                </div>
                <h3 className="text-lg font-bold text-indigo-950 dark:text-indigo-100">AI Financial Insights</h3>
              </div>
              
              <p className="text-sm text-slate-700 dark:text-slate-300 mb-5 leading-relaxed font-medium">
                {advice.summary}
              </p>

              <div className="space-y-3 relative z-10">
                 {advice.actionableTips.map((tip, i) => (
                   <div key={i} className="flex gap-3 items-start p-3 bg-white/70 dark:bg-white/5 rounded-xl border border-indigo-100/50 dark:border-white/5 transition-transform hover:scale-[1.02]">
                      <Icons.Check className="w-5 h-5 text-emerald-500 shrink-0 mt-0.5" />
                      <p className="text-sm text-slate-700 dark:text-slate-300">{tip}</p>
                   </div>
                 ))}
              </div>

              {advice.savingsPotential > 0 && (
                <div className="mt-6 pt-4 border-t border-indigo-200 dark:border-indigo-800 flex justify-between items-center">
                  <span className="text-sm font-semibold text-indigo-900 dark:text-indigo-200 uppercase tracking-wider text-[10px]">Potential Monthly Savings</span>
                  <span className="text-xl font-bold text-emerald-600 dark:text-emerald-400 bg-emerald-100 dark:bg-emerald-900/30 px-3 py-1 rounded-lg">
                    +${advice.savingsPotential}
                  </span>
                </div>
              )}
            </div>
          )}

          {/* Transaction List (Compact) */}
          <div className="bg-white dark:bg-dark-card p-6 rounded-2xl shadow-sm border border-slate-100 dark:border-slate-800 flex flex-col h-[300px]">
             <h3 className="text-lg font-semibold text-slate-800 dark:text-white mb-4 flex items-center gap-2">
               <Icons.Dollar className="w-5 h-5 text-slate-400" />
               Recent Activity
             </h3>
             <div className="flex-1 overflow-y-auto pr-2 custom-scrollbar space-y-2">
                {transactions.map((t) => (
                  <div key={t.id} className="flex items-center justify-between p-3 hover:bg-slate-50 dark:hover:bg-slate-800/50 rounded-xl transition-all duration-200 group border border-transparent hover:border-slate-100 dark:hover:border-slate-700">
                    <div className="flex items-center gap-3">
                      <div className={`w-10 h-10 rounded-full flex items-center justify-center transition-transform group-hover:scale-110
                        ${t.type === TransactionType.INCOME 
                          ? 'bg-emerald-100 text-emerald-600 dark:bg-emerald-900/30 dark:text-emerald-400' 
                          : 'bg-rose-100 text-rose-600 dark:bg-rose-900/30 dark:text-rose-400'
                        }`}>
                        {t.type === TransactionType.INCOME ? <Icons.TrendingUp className="w-5 h-5" /> : <Icons.Dollar className="w-5 h-5" />}
                      </div>
                      <div>
                        <p className="font-semibold text-slate-900 dark:text-slate-100 text-sm">{t.merchant}</p>
                        <p className="text-[10px] uppercase tracking-wider font-semibold text-slate-400 dark:text-slate-500">{t.date} • {t.category}</p>
                      </div>
                    </div>
                    <span className={`font-bold text-sm ${t.type === TransactionType.INCOME ? 'text-emerald-600 dark:text-emerald-400' : 'text-slate-700 dark:text-slate-300'}`}>
                      {t.type === TransactionType.INCOME ? '+' : '-'}${t.amount.toFixed(2)}
                    </span>
                  </div>
                ))}
             </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Dashboard;