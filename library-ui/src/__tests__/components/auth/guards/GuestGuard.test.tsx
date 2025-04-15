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
import { GuestGuard } from "../../../../components/auth/guards/GuestGuard";

// Import the mocks to use in tests
import { useNavigate } from "react-router-dom";
import { useAppSelector } from "../../../../store/hooks";

describe("GuestGuard Component", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it("renders children when user is not authenticated", () => {
    // Mock unauthenticated state
    vi.mocked(useAppSelector).mockImplementation((selector) =>
      selector({ auth: { isAuthenticated: false } })
    );

    render(
      <GuestGuard>
        <div data-testid="guest-content">Guest Content</div>
      </GuestGuard>
    );

    expect(screen.getByTestId("guest-content")).toBeInTheDocument();
    expect(vi.mocked(useNavigate)()).not.toHaveBeenCalled();
  });

  it("redirects to books page when user is authenticated", () => {
    // Mock authenticated state
    vi.mocked(useAppSelector).mockImplementation((selector) =>
      selector({ auth: { isAuthenticated: true } })
    );

    render(
      <GuestGuard>
        <div data-testid="guest-content">Guest Content</div>
      </GuestGuard>
    );

    // Children are still rendered in this case, but user is redirected
    expect(screen.getByTestId("guest-content")).toBeInTheDocument();
    expect(vi.mocked(useNavigate)()).toHaveBeenCalledWith("/books");
  });
});
