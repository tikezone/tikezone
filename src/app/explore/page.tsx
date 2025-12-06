
'use client';

import React, { useState, useEffect, Suspense } from 'react';
import { useSearchParams, useRouter } from '../../lib/safe-navigation';
import Header from '../../components/Layout/Header';
import Footer from '../../components/Layout/Footer';
import EventsGrid from '../../components/Events/EventsGrid';
import CategoriesBar from '../../components/UI/CategoriesBar';
import SearchBar from '../../components/UI/SearchBar';
import EventDetail from '../../components/Events/EventDetail';
import { CategoryId, Event } from '../../types';

// Wrapper to handle search params in a client component
function ExplorePageContent() {
  const searchParams = useSearchParams();
  const router = useRouter();
  const initialCategory = (searchParams.get('category') as CategoryId) || 'all';
  
  const [activeCategory, setActiveCategory] = useState<CategoryId>(initialCategory);
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedEvent, setSelectedEvent] = useState<Event | null>(null);

  // Sync state with URL params on first load/change
  useEffect(() => {
    const cat = searchParams.get('category') as CategoryId;
    if (cat) {
      setActiveCategory(cat);
    } else {
      setActiveCategory('all');
    }
  }, [searchParams]);

  const handleCategorySelect = (id: CategoryId) => {
    // Navigate to update URL, which will trigger the useEffect above
    router.push(id === 'all' ? '/explore' : `/explore?category=${id}`);
  };

  const handleEventSelect = (event: Event) => {
    setSelectedEvent(event);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const handleBack = () => {
    setSelectedEvent(null);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  if (selectedEvent) {
    return (
      <div className="min-h-screen bg-slate-50 flex flex-col font-sans">
        <Header />
        <EventDetail event={selectedEvent} onBack={handleBack} />
        <Footer />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-slate-50 flex flex-col font-sans">
      <Header />
      
      {/* Mini Hero for Explore */}
      <div className="bg-brand-600 border-b-2 border-black py-12 px-4">
        <div className="max-w-4xl mx-auto text-center">
          <h1 className="text-4xl md:text-5xl font-black text-white font-display mb-6 drop-shadow-[4px_4px_0_rgba(0,0,0,1)]">
            Explorez les événements
          </h1>
          <SearchBar onSearch={setSearchQuery} />
        </div>
      </div>

      <CategoriesBar 
        activeCategory={activeCategory} 
        onSelectCategory={handleCategorySelect} 
      />

      <main className="flex-grow">
        <EventsGrid 
          selectedCategory={activeCategory} 
          searchQuery={searchQuery}
          onEventSelect={handleEventSelect}
        />
      </main>

      <Footer />
    </div>
  );
}

export default function ExplorePage() {
  return (
    <Suspense fallback={<div className="min-h-screen flex items-center justify-center">Chargement...</div>}>
      <ExplorePageContent />
    </Suspense>
  );
}
