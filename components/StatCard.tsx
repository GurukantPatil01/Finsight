import React from 'react';

interface StatCardProps {
  title: string;
  value: string;
  trend?: string;
  icon: React.ReactNode;
  trendUp?: boolean; // true = good (green), false = bad (red)
  delay?: number;
}

const StatCard: React.FC<StatCardProps> = ({ title, value, trend, icon, trendUp, delay = 0 }) => {
  return (
    <div 
      className="bg-white dark:bg-dark-card p-6 rounded-2xl shadow-sm border border-slate-100 dark:border-slate-800 flex items-start justify-between transition-all duration-300 hover:shadow-lg hover:-translate-y-1 group animate-fadeIn"
      style={{ animationDelay: `${delay}ms` }}
    >
      <div className="space-y-4">
        <div className="flex items-center gap-2">
          <div className="p-2 rounded-lg bg-slate-50 dark:bg-slate-800 text-slate-500 dark:text-slate-400 group-hover:bg-primary-50 dark:group-hover:bg-primary-900/20 group-hover:text-primary-600 dark:group-hover:text-primary-400 transition-colors">
            {icon}
          </div>
          <h3 className="text-sm font-medium text-slate-500 dark:text-slate-400">{title}</h3>
        </div>
        <div>
          <p className="text-2xl sm:text-3xl font-bold text-slate-900 dark:text-white tracking-tight">{value}</p>
          {trend && (
            <p className={`text-xs font-medium mt-1 flex items-center gap-1 ${trendUp ? 'text-emerald-500' : 'text-rose-500'}`}>
              {trend}
            </p>
          )}
        </div>
      </div>
    </div>
  );
};

export default StatCard;