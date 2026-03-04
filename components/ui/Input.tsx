import React from 'react';

interface InputProps extends React.InputHTMLAttributes<HTMLInputElement> {
  label?: string;
  icon?: React.ReactNode;
  error?: string;
}

const Input: React.FC<InputProps> = ({ label, icon, error, className, ...props }) => {
  return (
    <div className="w-full space-y-1">
      {label && <label className="text-sm font-medium text-slate-300 ml-1">{label}</label>}
      <div className="relative group">
        {icon && (
          <div className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400 group-focus-within:text-primary-400 transition-colors">
            {icon}
          </div>
        )}
        <input
          className={`
            w-full bg-white/5 border border-white/10 rounded-xl px-4 py-3
            ${icon ? 'pl-10' : ''}
            text-white placeholder-slate-400
            focus:outline-none focus:ring-2 focus:ring-primary-500/50 focus:border-primary-500
            transition-all duration-200
            ${error ? 'border-red-500 focus:ring-red-500/50' : ''}
            ${className}
          `}
          {...props}
        />
      </div>
      {error && <p className="text-xs text-red-400 ml-1">{error}</p>}
    </div>
  );
};

export default Input;