import React from 'react';
import { Loader2 } from 'lucide-react';

interface ButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: 'primary' | 'secondary' | 'ghost' | 'danger';
  isLoading?: boolean;
}

const Button: React.FC<ButtonProps> = ({ 
  children, 
  variant = 'primary', 
  isLoading, 
  className, 
  disabled, 
  ...props 
}) => {
  const baseStyles = "relative inline-flex items-center justify-center px-5 py-2.5 text-sm font-semibold transition-all duration-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-offset-1 disabled:opacity-60 disabled:cursor-not-allowed";
  
  const variants = {
    primary: "bg-primary-600 hover:bg-primary-700 text-white shadow-md shadow-primary-500/20 focus:ring-primary-500 border border-transparent",
    // Changed secondary to be light/outlined for better visibility and contrast
    secondary: "bg-white hover:bg-slate-50 text-slate-700 border border-slate-300 shadow-sm focus:ring-slate-400",
    ghost: "bg-transparent hover:bg-slate-100 text-slate-600 hover:text-slate-900 focus:ring-slate-400",
    danger: "bg-red-600 hover:bg-red-700 text-white shadow-md shadow-red-500/20 focus:ring-red-500 border border-transparent"
  };

  return (
    <button
      className={`${baseStyles} ${variants[variant]} ${className}`}
      disabled={isLoading || disabled}
      {...props}
    >
      {isLoading ? (
        <>
          <Loader2 className="w-4 h-4 mr-2 animate-spin" />
          Processing...
        </>
      ) : (
        children
      )}
    </button>
  );
};

export default Button;