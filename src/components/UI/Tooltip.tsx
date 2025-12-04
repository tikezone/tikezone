import React from 'react';

interface TooltipProps {
  content: string;
  children: React.ReactNode;
  position?: 'top' | 'bottom';
  className?: string;
}

const Tooltip: React.FC<TooltipProps> = ({ content, children, position = 'top', className = '' }) => {
  return (
    <div className={`group relative flex items-center justify-center ${className}`}>
      {children}
      <div className={`
        absolute left-1/2 transform -translate-x-1/2 px-2.5 py-1.5 bg-slate-800 text-white text-xs font-medium rounded-lg opacity-0 group-hover:opacity-100 transition-opacity duration-200 pointer-events-none whitespace-nowrap z-50 shadow-xl
        ${position === 'top' ? 'bottom-full mb-2' : 'top-full mt-2'}
      `}>
        {content}
        {/* Triangle arrow */}
        <div className={`
          absolute left-1/2 transform -translate-x-1/2 border-4 border-transparent
          ${position === 'top' ? 'top-full border-t-slate-800' : 'bottom-full border-b-slate-800'}
        `}></div>
      </div>
    </div>
  );
};

export default Tooltip;