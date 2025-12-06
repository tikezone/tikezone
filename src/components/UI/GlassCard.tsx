import React from 'react';

interface GlassCardProps {
  children: React.ReactNode;
  className?: string;
  intensity?: 'low' | 'medium' | 'high';
  onClick?: () => void;
}

const GlassCard: React.FC<GlassCardProps> = ({ children, className = '', intensity = 'medium', onClick }) => {
  const baseStyles = "relative overflow-hidden border border-white/10 transition-all duration-300";
  
  const intensities = {
    low: "bg-white/5 backdrop-blur-md shadow-lg",
    medium: "bg-white/10 backdrop-blur-xl shadow-xl",
    high: "bg-white/15 backdrop-blur-2xl shadow-2xl"
  };

  return (
    <div 
      onClick={onClick}
      className={`${baseStyles} ${intensities[intensity]} ${className}`}
    >
      <div className="absolute inset-0 bg-gradient-to-br from-white/10 to-transparent pointer-events-none opacity-50"></div>
      {children}
    </div>
  );
};

export default GlassCard;
