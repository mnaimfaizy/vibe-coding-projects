import { ReactNode } from "react";
import { useAppSelector } from "@/store/hooks";
import { HeaderComponent } from "./HeaderComponent";
import { FooterComponent } from "./FooterComponent";
import { NavigationComponent } from "./NavigationComponent";
import { AdminNavigationComponent } from "../admin/AdminNavigationComponent";
import { UserRole } from "@/services/authService";
import { useLocation } from "react-router-dom";

interface MainLayoutProps {
  children: ReactNode;
}

export function MainLayout({ children }: MainLayoutProps) {
  const { isAuthenticated, user } = useAppSelector((state) => state.auth);
  const location = useLocation();
  const isAdmin = user?.role === UserRole.ADMIN;
  const isAdminPage = location.pathname.startsWith("/admin");

  return (
    <div className="flex flex-col min-h-screen">
      <HeaderComponent />

      {/* Show admin navigation on admin pages */}
      {isAdminPage && <AdminNavigationComponent />}

      {/* Show regular navigation on non-admin pages */}
      {!isAdminPage && isAuthenticated && <NavigationComponent />}

      <main className="flex-1 bg-gray-50 dark:bg-gray-900">
        <div className="container mx-auto px-4 py-6 max-w-screen-xl">
          {children}
        </div>
      </main>
      <FooterComponent />
    </div>
  );
}
