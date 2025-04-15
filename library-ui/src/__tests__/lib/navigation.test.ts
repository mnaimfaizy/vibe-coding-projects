import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import { appNavigate, registerNavigate } from "../../lib/navigation";

describe("Navigation Utility", () => {
  let originalConsoleWarn: typeof console.warn;
  let originalWindowLocation: Location;

  beforeEach(() => {
    // Save original console.warn
    originalConsoleWarn = console.warn;
    console.warn = vi.fn();

    // Reset mocks
    vi.resetAllMocks();

    // Mock window.location
    originalWindowLocation = window.location;
    Object.defineProperty(window, "location", {
      configurable: true,
      value: { href: "" },
      writable: true,
    });
  });

  afterEach(() => {
    // Restore original implementations
    console.warn = originalConsoleWarn;
    Object.defineProperty(window, "location", {
      configurable: true,
      value: originalWindowLocation,
      writable: true,
    });
  });

  it("uses registered navigate function when available", () => {
    // Create a mock navigate function
    const mockNavigate = vi.fn();

    // Register the mock navigate function
    registerNavigate(mockNavigate);

    // Call appNavigate with a path
    appNavigate("/test-path");

    // Verify that the mock navigate function was called with the path
    expect(mockNavigate).toHaveBeenCalledWith("/test-path");
    expect(console.warn).not.toHaveBeenCalled();
  });

  it("falls back to window.location.href when navigate function is not registered", () => {
    // Ensure navigate function is not registered
    registerNavigate(undefined as any);

    // Call appNavigate with a path
    appNavigate("/fallback-path");

    // Verify that a warning was logged
    expect(console.warn).toHaveBeenCalledWith(
      "Navigation function not registered. Using window.location as fallback."
    );

    // Verify that window.location.href was set
    expect(window.location.href).toBe("/fallback-path");
  });
});
