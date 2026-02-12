import React from 'react';

interface CardProps {
  children: React.ReactNode;
  className?: string;
  title?: string;
  subtitle?: string;
  action?: React.ReactNode;
}

export const Card: React.FC<CardProps> = ({ children, className = '', title, subtitle, action }) => {
  return (
    <div className={`bg-white dark:bg-[#1e293b] rounded-lg border border-slate-200 dark:border-slate-700/50 shadow-sm ${className}`}>
      {(title || subtitle || action) && (
        <div className="p-6 border-b border-slate-100 dark:border-slate-700/50 flex justify-between items-start">
          <div>
            {title && <h3 className="text-lg font-heading font-semibold text-slate-900 dark:text-slate-100">{title}</h3>}
            {subtitle && <p className="text-sm text-slate-500 dark:text-slate-400 mt-1">{subtitle}</p>}
          </div>
          {action && <div>{action}</div>}
        </div>
      )}
      <div className="p-6">
        {children}
      </div>
    </div>
  );
};