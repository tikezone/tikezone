import React from 'react';
import { FavoritesProvider } from '../context/FavoritesContext';
import { AuthProvider } from '../context/AuthContext';
import './globals.css';

export const metadata = {
  title: "TIKEZONE",
  description: "Plateforme de ticketing moderne",
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="fr-FR" suppressHydrationWarning>
      <body className="font-sans bg-slate-50 text-slate-900 antialiased min-h-screen">

        {/* Providers DOIVENT être dans le <body> */}
        <AuthProvider>
          <FavoritesProvider>
            {children}
          </FavoritesProvider>
        </AuthProvider>

      </body>
    </html>
  );
}


