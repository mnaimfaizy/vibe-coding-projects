import { act, renderHook } from "@testing-library/react";
import { beforeEach, describe, expect, it, vi } from "vitest";
import AuthService from "./authService";
import { useAuth } from "./useAuth";

// Mock the default export of authService
vi.mock("./authService", () => ({
  default: {
    isAuthenticated: vi.fn(),
    getCurrentUser: vi.fn(),
    login: vi.fn(),
    logout: vi.fn(),
    signup: vi.fn(),
  },
}));

describe("useAuth hook", () => {
  beforeEach(() => {
    vi.clearAllMocks();
    localStorage.clear();
  });

  it("returns initial auth state from AuthService", () => {
    // Setup mocks for this test
    AuthService.isAuthenticated.mockReturnValue(true);
    AuthService.getCurrentUser.mockReturnValue({ id: 1, name: "A" });

    const { result } = renderHook(() => useAuth());
    expect(result.current.isAuthenticated).toBe(true);
    expect(result.current.user).toEqual({ id: 1, name: "A" });
  });

  it("updates state on storage event", () => {
    // Setup sequence of mock returns
    AuthService.isAuthenticated
      .mockReturnValueOnce(false)
      .mockReturnValueOnce(true);
    AuthService.getCurrentUser
      .mockReturnValueOnce(null)
      .mockReturnValueOnce({ id: 2, name: "B" });

    const { result } = renderHook(() => useAuth());
    act(() => {
      window.dispatchEvent(new StorageEvent("storage"));
    });

    expect(result.current.isAuthenticated).toBe(true);
    expect(result.current.user).toEqual({ id: 2, name: "B" });
  });

  it("exposes login, logout, signup from AuthService", () => {
    const { result } = renderHook(() => useAuth());

    // Check that the methods are from AuthService (not checking exact reference equality)
    expect(typeof result.current.login).toBe("function");
    expect(typeof result.current.logout).toBe("function");
    expect(typeof result.current.signup).toBe("function");

    // Call the methods and verify original services were called
    result.current.login("user", "pass");
    expect(AuthService.login).toHaveBeenCalledWith("user", "pass");

    result.current.logout();
    expect(AuthService.logout).toHaveBeenCalled();

    result.current.signup({ name: "Test User" });
    expect(AuthService.signup).toHaveBeenCalledWith({ name: "Test User" });
  });
});
