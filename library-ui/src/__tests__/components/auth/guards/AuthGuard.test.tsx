import { render, screen } from "@testing-library/react";
import { beforeEach, describe, expect, it, vi } from "vitest";

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
import { AuthGuard } from "../../../../components/auth/guards/AuthGuard";

// Import the mocks to use in tests
import { useNavigate } from "react-router-dom";
import { useAppSelector } from "../../../../store/hooks";

describe("AuthGuard Component", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it("renders children when user is authenticated", () => {
    // Mock authenticated state
    vi.mocked(useAppSelector).mockImplementation((selector) =>
      selector({ auth: { isAuthenticated: true } })
    );

    render(
      <AuthGuard>
        <div data-testid="protected-content">Protected Content</div>
      </AuthGuard>
    );

    expect(screen.getByTestId("protected-content")).toBeInTheDocument();
    expect(vi.mocked(useNavigate)()).not.toHaveBeenCalled();
  });

  it("redirects to login when user is not authenticated", () => {
    // Mock unauthenticated state
    vi.mocked(useAppSelector).mockImplementation((selector) =>
      selector({ auth: { isAuthenticated: false } })
    );

    render(
      <AuthGuard>
        <div data-testid="protected-content">Protected Content</div>
      </AuthGuard>
    );

    expect(screen.queryByTestId("protected-content")).not.toBeInTheDocument();
    expect(vi.mocked(useNavigate)()).toHaveBeenCalledWith("/login");
  });

  it("renders fallback when provided and user is not authenticated", () => {
    // Mock unauthenticated state
    vi.mocked(useAppSelector).mockImplementation((selector) =>
      selector({ auth: { isAuthenticated: false } })
    );

    render(
      <AuthGuard fallback={<div data-testid="fallback">Loading...</div>}>
        <div data-testid="protected-content">Protected Content</div>
      </AuthGuard>
    );

    expect(screen.queryByTestId("protected-content")).not.toBeInTheDocument();
    expect(screen.getByTestId("fallback")).toBeInTheDocument();
    expect(vi.mocked(useNavigate)()).toHaveBeenCalledWith("/login");
  });
});
