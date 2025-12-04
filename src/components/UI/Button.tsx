
import React from 'react';
import { Loader2 } from 'lucide-react';

interface ButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: 'primary' | 'secondary' | 'outline' | 'danger' | 'ghost' | 'white';
  isLoading?: boolean;
  icon?: React.ReactNode;
  fullWidth?: boolean;
}

const Button: React.FC<ButtonProps> = ({ 
  children, 
  variant = 'primary', 
  isLoading = false, 
  icon, 
  fullWidth = false, 
  className = '', 
  disabled,
  ...props 
}) => {
  
  const baseStyles = "relative inline-flex items-center justify-center font-black rounded-xl border-2 border-black transition-all active:translate-y-[2px] active:translate-x-[2px] active:shadow-none uppercase tracking-wide text-sm py-3 px-6";
  
  const variants = {
    primary: "bg-slate-900 text-white shadow-pop hover:bg-brand-600 hover:shadow-none",
    secondary: "bg-brand-500 text-white shadow-pop hover:bg-brand-600 hover:shadow-none",
    white: "bg-white text-slate-900 shadow-pop hover:bg-slate-50 hover:shadow-none",
    outline: "bg-transparent text-slate-900 border-2 border-black hover:bg-slate-100",
    danger: "bg-red-500 text-white shadow-pop hover:bg-red-600 hover:shadow-none",
    ghost: "bg-transparent border-transparent shadow-none hover:bg-slate-100 text-slate-700 hover:text-black",
  };

  return (
    <button
      disabled={isLoading || disabled}
      className={`
        ${baseStyles}
        ${variants[variant]}
        ${fullWidth ? 'w-full' : ''}
        ${isLoading || disabled ? 'opacity-70 cursor-not-allowed shadow-none translate-y-[2px] translate-x-[2px]' : ''}
        ${className}
      `}
      {...props}
    >
      {isLoading ? (
        <>
          <Loader2 className="animate-spin mr-2" size={18} strokeWidth={3} />
          <span>Chargement...</span>
        </>
      ) : (
        <>
          {icon && <span className="mr-2">{icon}</span>}
          {children}
        </>
      )}
    </button>
  );
};

export default Button;
