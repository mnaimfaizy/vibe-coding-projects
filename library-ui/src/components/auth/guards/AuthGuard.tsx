import React, { ReactNode, useEffect } from "react";
import { useAppSelector } from "@/store/hooks";

interface AuthGuardProps {
  children: ReactNode;
  fallback?: ReactNode;
}

/**
 * A component that guards routes requiring authentication
 * If user is not authenticated, it will redirect to login page
 */
export function AuthGuard({ children, fallback }: AuthGuardProps) {
  const { isAuthenticated } = useAppSelector((state) => state.auth);

  useEffect(() => {
    if (!isAuthenticated) {
      // Redirect to login
      window.location.href = "/login";
    }
  }, [isAuthenticated]);

  // Show fallback or nothing while checking authentication
  if (!isAuthenticated) {
    return fallback ? <>{fallback}</> : null;
  }

  return <>{children}</>;
}
