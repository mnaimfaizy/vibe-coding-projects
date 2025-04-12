import React, { ReactNode, useEffect } from "react";
import { useAppSelector } from "@/store/hooks";

interface GuestGuardProps {
  children: ReactNode;
}

/**
 * A component that prevents authenticated users from accessing guest pages like login/signup
 * If user is authenticated, it will redirect to the books page
 */
export function GuestGuard({ children }: GuestGuardProps) {
  const { isAuthenticated } = useAppSelector((state) => state.auth);

  useEffect(() => {
    if (isAuthenticated) {
      // Redirect authenticated users to books page
      window.location.href = "/books";
    }
  }, [isAuthenticated]);

  return <>{children}</>;
}
