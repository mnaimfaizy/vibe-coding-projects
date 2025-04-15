import { render, screen } from "@testing-library/react";
import { beforeEach, describe, expect, it, vi } from "vitest";
import { UserRole } from "../../../../services/authService";

// Mock dependencies with factory functions
vi.mock("react-router-dom", () => {
  const mockNavigate = vi.fn();
  return {
    useNavigate: () => mockNavigate,
    __esModule: true,
  };
});

vi.mock("../../../../store/hooks", () => {
  const useAppSelector = vi.fn();
  return {
    useAppSelector,
    __esModule: true,
  };
});

// Import the component after mocks are set up
import { AdminGuard } from "../../../../components/auth/guards/AdminGuard";

// Import the mocks to use in tests
import { useNavigate } from "react-router-dom";
import { useAppSelector } from "../../../../store/hooks";

describe("AdminGuard Component", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it("renders children when user is authenticated and has admin role", () => {
    // Mock authenticated admin state
    vi.mocked(useAppSelector).mockImplementation((selector) =>
      selector({
        auth: {
          isAuthenticated: true,
          user: { role: UserRole.ADMIN },
        },
      })
    );

    render(
      <AdminGuard>
        <div data-testid="admin-content">Admin Content</div>
      </AdminGuard>
    );

    expect(screen.getByTestId("admin-content")).toBeInTheDocument();
    expect(vi.mocked(useNavigate)()).not.toHaveBeenCalled();
  });

  it("redirects to login when user is not authenticated", () => {
    // Mock unauthenticated state
    vi.mocked(useAppSelector).mockImplementation((selector) =>
      selector({
        auth: {
          isAuthenticated: false,
          user: null,
        },
      })
    );

    render(
      <AdminGuard>
        <div data-testid="admin-content">Admin Content</div>
      </AdminGuard>
    );

    expect(screen.queryByTestId("admin-content")).not.toBeInTheDocument();
    expect(vi.mocked(useNavigate)()).toHaveBeenCalledWith("/login");
  });

  it("redirects to home when user is authenticated but not an admin", () => {
    // Mock authenticated non-admin state
    vi.mocked(useAppSelector).mockImplementation((selector) =>
      selector({
        auth: {
          isAuthenticated: true,
          user: { role: UserRole.USER },
        },
      })
    );

    render(
      <AdminGuard>
        <div data-testid="admin-content">Admin Content</div>
      </AdminGuard>
    );

    expect(screen.queryByTestId("admin-content")).not.toBeInTheDocument();
    expect(vi.mocked(useNavigate)()).toHaveBeenCalledWith("/");
  });

  it("renders fallback when user is not admin and fallback is provided", () => {
    // Mock authenticated non-admin state
    vi.mocked(useAppSelector).mockImplementation((selector) =>
      selector({
        auth: {
          isAuthenticated: true,
          user: { role: UserRole.USER },
        },
      })
    );

    render(
      <AdminGuard fallback={<div data-testid="fallback">Access Denied</div>}>
        <div data-testid="admin-content">Admin Content</div>
      </AdminGuard>
    );

    expect(screen.queryByTestId("admin-content")).not.toBeInTheDocument();
    expect(screen.getByTestId("fallback")).toBeInTheDocument();
    expect(vi.mocked(useNavigate)()).toHaveBeenCalledWith("/");
  });
});
