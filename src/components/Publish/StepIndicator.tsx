import React from 'react';
import { CheckCircle } from 'lucide-react';

const StepIndicator = ({ currentStep }: { currentStep: number }) => {
  const steps = [
    { num: 1, label: "L'Idée" },
    { num: 2, label: "Infos" },
    { num: 3, label: "Billets" },
    { num: 4, label: "Publier" },
  ];

  return (
    <div className="flex justify-between items-center mb-8 px-2">
      {steps.map((s, idx) => (
        <div key={s.num} className="flex flex-col items-center relative z-10">
          <div 
            className={`
              w-10 h-10 rounded-full border border-white/20 flex items-center justify-center font-black text-sm transition-all duration-500
              ${currentStep >= s.num ? 'bg-gradient-to-r from-orange-500 to-orange-600 text-white shadow-lg shadow-orange-500/30 scale-110' : 'bg-white/10 backdrop-blur-xl text-gray-500'}
            `}
          >
            {currentStep > s.num ? <CheckCircle size={20} /> : s.num}
          </div>
          <span className={`text-[10px] font-bold mt-2 uppercase tracking-wide ${currentStep >= s.num ? 'text-white' : 'text-gray-500'}`}>
            {s.label}
          </span>
          {idx < steps.length - 1 && (
            <div className={`absolute top-5 left-10 w-[calc(100%+2rem)] h-1 border-t-2 border-dashed ${currentStep > s.num ? 'border-orange-500' : 'border-white/20'} -z-10`} />
          )}
        </div>
      ))}
    </div>
  );
};

export default StepIndicator;
