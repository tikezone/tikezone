
import React from 'react';
import Header from './Header';
import Footer from './Footer';
import AnnouncementBar from '../UI/AnnouncementBar';

interface MainLayoutProps {
  children: React.ReactNode;
  showAnnouncement?: boolean;
  className?: string;
}

const MainLayout: React.FC<MainLayoutProps> = ({ 
  children, 
  showAnnouncement = true,
  className = "bg-slate-50"
}) => {
  return (
    <div className={`min-h-screen flex flex-col font-sans ${className}`}>
      {showAnnouncement && <AnnouncementBar />}
      <Header />
      <main className="flex-grow">
        {children}
      </main>
      <Footer />
    </div>
  );
};

export default MainLayout;
