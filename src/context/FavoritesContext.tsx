'use client';

import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';

interface FavoritesContextType {
  favorites: string[];
  toggleFavorite: (eventId: string) => void;
  isFavorite: (eventId: string) => boolean;
}

const FavoritesContext = createContext<FavoritesContextType | undefined>(undefined);

export const FavoritesProvider = ({ children }: { children: ReactNode }) => {
  const [favorites, setFavorites] = useState<string[]>([]);
  const [isLoaded, setIsLoaded] = useState(false);

  // Load from LocalStorage on mount
  useEffect(() => {
    try {
      const stored = localStorage.getItem('tikezone_favorites');
      if (stored) {
        setFavorites(JSON.parse(stored));
      }
    } catch (e) {
      console.warn("Failed to load favorites (localStorage might be disabled)", e);
    } finally {
      setIsLoaded(true);
    }
  }, []);

  // Save to LocalStorage on change
  useEffect(() => {
    if (isLoaded) {
      try {
        localStorage.setItem('tikezone_favorites', JSON.stringify(favorites));
      } catch (e) {
        console.warn("Failed to save favorites", e);
      }
    }
  }, [favorites, isLoaded]);

  const toggleFavorite = (eventId: string) => {
    setFavorites((prev) => {
      if (prev.includes(eventId)) {
        return prev.filter((id) => id !== eventId);
      } else {
        return [...prev, eventId];
      }
    });
  };

  const isFavorite = (eventId: string) => {
    return favorites.includes(eventId);
  };

  return (
    <FavoritesContext.Provider value={{ favorites, toggleFavorite, isFavorite }}>
      {children}
    </FavoritesContext.Provider>
  );
};

export const useFavorites = () => {
  const context = useContext(FavoritesContext);
  if (context === undefined) {
    throw new Error('useFavorites must be used within a FavoritesProvider');
  }
  return context;
};