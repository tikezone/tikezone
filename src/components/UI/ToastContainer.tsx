'use client';

import React from 'react';
import GlassCard from './GlassCard';

interface Notification {
  id: string;
  type: 'success' | 'error' | 'info';
  message: string;
}

interface ToastContainerProps {
  notifications: Notification[];
}

const ToastContainer: React.FC<ToastContainerProps> = ({ notifications }) => {
  if (notifications.length === 0) return null;

  return (
    <div className="fixed top-6 inset-x-0 z-[100] flex flex-col items-center gap-3 pointer-events-none">
      {notifications.map((notification) => (
        <div key={notification.id} className="animate-slide-down pointer-events-auto">
          <GlassCard 
            intensity="high" 
            className={`
              flex items-center gap-3 px-6 py-3 rounded-full border shadow-2xl backdrop-blur-3xl
              ${notification.type === 'success' ? 'border-green-500/30' : ''}
              ${notification.type === 'error' ? 'border-red-500/30' : ''}
              ${notification.type === 'info' ? 'border-blue-500/30' : ''}
            `}
          >
            <div className={`
              w-6 h-6 rounded-full flex items-center justify-center
              ${notification.type === 'success' ? 'bg-green-500 text-black' : ''}
              ${notification.type === 'error' ? 'bg-red-500 text-white' : ''}
              ${notification.type === 'info' ? 'bg-blue-500 text-white' : ''}
            `}>
              {notification.type === 'success' && (
                <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor" className="w-4 h-4">
                  <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                </svg>
              )}
              {notification.type === 'error' && (
                <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor" className="w-4 h-4">
                  <path d="M6.28 5.22a.75.75 0 00-1.06 1.06L8.94 10l-3.72 3.72a.75.75 0 101.06 1.06L10 11.06l3.72 3.72a.75.75 0 101.06-1.06L11.06 10l3.72-3.72a.75.75 0 00-1.06-1.06L10 8.94 6.28 5.22z" />
                </svg>
              )}
              {notification.type === 'info' && (
                <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor" className="w-4 h-4">
                  <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7-4a1 1 0 11-2 0 1 1 0 012 0zM9 9a.75.75 0 000 1.5h.253a.25.25 0 01.244.304l-.459 2.066A1.75 1.75 0 0010.747 15H11a.75.75 0 000-1.5h-.253a.25.25 0 01-.244-.304l.459-2.066A1.75 1.75 0 009.253 9H9z" clipRule="evenodd" />
                </svg>
              )}
            </div>
            
            <span className="font-semibold text-sm text-white">{notification.message}</span>
          </GlassCard>
        </div>
      ))}
      <style>{`
        @keyframes slide-down {
          0% { transform: translateY(-50px) scale(0.9); opacity: 0; }
          100% { transform: translateY(0) scale(1); opacity: 1; }
        }
        .animate-slide-down {
          animation: slide-down 0.4s cubic-bezier(0.34, 1.56, 0.64, 1);
        }
      `}</style>
    </div>
  );
};

export default ToastContainer;
