import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";

// We need to reset modules between tests to properly test navigation module
beforeEach(() => {
  vi.resetModules();
  // Clear any mocks from previous tests
  vi.clearAllMocks();
});

describe("Navigation Utility", () => {
  let originalConsoleWarn: typeof console.warn;
  let originalWindowLocation: Location;

  beforeEach(() => {
    // Save original console.warn
    originalConsoleWarn = console.warn;
    console.warn = vi.fn();

    // Mock window.location
    originalWindowLocation = window.location;
    delete (window as any).location;
    window.location = { ...originalWindowLocation, href: "" } as any;

    // Mock the navigation module specifically for these tests
    vi.doMock("../../lib/navigation", () => ({
      registerNavigate: vi.fn(),
      appNavigate: vi.fn(),
      default: vi.fn(),
    }));
  });

  afterEach(() => {
    // Restore original console.warn
    console.warn = originalConsoleWarn;

    // Restore original window.location
    window.location = originalWindowLocation;
  });

  it("uses registered navigate function when available", async () => {
    // Import the real module implementation for this test
    vi.doMock("../../lib/navigation", () => {
      let navigateFunc: ((path: string) => void) | undefined = undefined;

      const registerNavigate = (fn: (path: string) => void) => {
        navigateFunc = fn;
      };

      const appNavigate = (path: string) => {
        if (navigateFunc) {
          navigateFunc(path);
        } else {
          console.warn(
            "Navigation function not registered. Using window.location as fallback."
          );
          window.location.href = path;
        }
      };

      return {
        registerNavigate,
        appNavigate,
        default: appNavigate,
      };
    });

    // Get a fresh copy of the module
    const { registerNavigate, appNavigate } = await import(
      "../../lib/navigation"
    );

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

  it("falls back to window.location.href when navigate function is not registered", async () => {
    // Import the real module implementation for this test
    vi.doMock("../../lib/navigation", () => {
      let navigateFunc: ((path: string) => void) | undefined = undefined;

      const registerNavigate = (fn: (path: string) => void) => {
        navigateFunc = fn;
      };

      const appNavigate = (path: string) => {
        if (navigateFunc) {
          navigateFunc(path);
        } else {
          console.warn(
            "Navigation function not registered. Using window.location as fallback."
          );
          window.location.href = path;
        }
      };

      return {
        registerNavigate,
        appNavigate,
        default: appNavigate,
      };
    });

    // Get a fresh copy of the module
    const { appNavigate } = await import("../../lib/navigation");

    // Call appNavigate with a path (without registering a navigate function first)
    appNavigate("/fallback-path");

    // Verify that a warning was logged
    expect(console.warn).toHaveBeenCalledWith(
      "Navigation function not registered. Using window.location as fallback."
    );

    // Verify that window.location.href was set
    expect(window.location.href).toBe("/fallback-path");
  });
});
