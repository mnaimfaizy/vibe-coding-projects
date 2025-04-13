import React from "react";
import { HeaderComponent } from "./HeaderComponent";
import { NavigationComponent } from "./NavigationComponent";
import { FooterComponent } from "./FooterComponent";
import { useAppSelector } from "@/store/hooks";

interface MainLayoutProps {
  children: React.ReactNode;
}

export function MainLayout({ children }: MainLayoutProps) {
  const { isAuthenticated } = useAppSelector((state) => state.auth);

  return (
    <div className="flex flex-col min-h-screen">
      {/* Header always visible */}
      <HeaderComponent />

      {/* Secondary navigation only for authenticated users */}
      {isAuthenticated && <NavigationComponent />}

      <main className="flex-grow bg-slate-50">{children}</main>
      <FooterComponent />
    </div>
  );
}
