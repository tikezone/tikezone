
'use client';

import React from 'react';
import { AlertCircle } from 'lucide-react';

interface InputProps extends React.InputHTMLAttributes<HTMLInputElement> {
  label?: string;
  icon?: React.ReactNode;
  rightElement?: React.ReactNode;
  error?: string;
  containerClassName?: string;
}

const Input: React.FC<InputProps> = ({
  label,
  icon,
  rightElement,
  error,
  className = '',
  containerClassName = '',
  required,
  value,
  ...props
}) => {
  const hasValueProp = value !== undefined && value !== null;
  const safeValue = hasValueProp ? value : '';
  const inputProps: React.InputHTMLAttributes<HTMLInputElement> = { ...props };
  if (hasValueProp) {
    if (props.onChange) {
      inputProps.value = safeValue;
    } else {
      inputProps.defaultValue = safeValue as string | number | readonly string[];
    }
  }
  return (
    <div className={`space-y-1.5 ${containerClassName}`}>
      {label && (
        <label className={`text-xs font-black uppercase ml-1 block ${error ? 'text-red-500' : 'text-slate-900'}`}>
          {label} {required && <span className="text-red-500">*</span>}
        </label>
      )}
      <div className="relative group">
        {icon && (
          <div className={`absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none transition-colors ${error ? 'text-red-400' : 'text-slate-400 group-focus-within:text-black'}`}>
            {icon}
          </div>
        )}
        <input
          className={`
            block w-full py-3 border-2 rounded-xl text-slate-900 placeholder-slate-400 
            focus:outline-none transition-all font-bold
            ${icon ? 'pl-10' : 'pl-4'}
            ${rightElement ? 'pr-10' : 'pr-4'}
            ${error 
                ? 'border-red-500 bg-red-50 focus:shadow-[4px_4px_0px_0px_#ef4444] placeholder-red-300' 
                : 'border-black focus:shadow-pop-sm focus:bg-yellow-50'
            }
            ${className}
          `}
          required={required}
          {...inputProps}
        />
        {rightElement && (
          <div className="absolute inset-y-0 right-0 pr-3 flex items-center">
            {rightElement}
          </div>
        )}
        {error && !rightElement && (
            <div className="absolute inset-y-0 right-0 pr-3 flex items-center pointer-events-none">
                <AlertCircle className="text-red-500 h-5 w-5" />
            </div>
        )}
      </div>
      {error && (
        <div className="flex items-center ml-1 animate-in slide-in-from-top-1 duration-200">
            <span className="text-[10px] font-black text-red-500 bg-red-100 px-2 py-0.5 rounded border border-red-200 uppercase tracking-wide">
                {error}
            </span>
        </div>
      )}
    </div>
  );
};

export default Input;
