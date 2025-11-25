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
      className="bg-white dark:bg-dark-card p-8 rounded-sm border border-neutral-200 dark:border-neutral-800 flex items-start justify-between transition-colors duration-300 animate-fadeIn"
      style={{ animationDelay: `${delay}ms` }}
    >
      <div className="space-y-4">
        <div className="flex items-center gap-2">
          <div className="p-2.5 rounded-sm border border-neutral-300 dark:border-neutral-700 text-slate-500 dark:text-slate-400 transition-colors">
            {icon}
          </div>
          <h3 className="text-xs uppercase tracking-wider font-normal text-slate-500 dark:text-slate-400">{title}</h3>
        </div>
        <div>
          <p className="text-2xl sm:text-3xl font-medium text-slate-900 dark:text-white">{value}</p>
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