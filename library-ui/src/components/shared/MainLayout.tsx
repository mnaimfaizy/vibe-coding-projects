import React from 'react';
import { HeaderComponent } from './HeaderComponent';
import { NavigationComponent } from './NavigationComponent';
import { FooterComponent } from './FooterComponent';

interface MainLayoutProps {
  children: React.ReactNode;
}

export function MainLayout({ children }: MainLayoutProps) {
  return (
    <div className="flex flex-col min-h-screen">
      {/* Header with authentication */}
      <HeaderComponent />
      
      {/* Secondary navigation with detailed links */}
      <NavigationComponent />
      
      <main className="flex-grow bg-slate-50">
        {children}
      </main>
      <FooterComponent />
    </div>
  );
}