// Global test setup for Vitest
import "@testing-library/jest-dom";
import { vi } from "vitest";

// Set up common mocks that multiple tests might need
vi.mock("@/lib/navigation", () => ({
  default: vi.fn(),
  appNavigate: vi.fn(),
  registerNavigate: vi.fn(),
}));

// Mock for ResizeObserver which is not available in test environment
class MockResizeObserver {
  observe() {}
  unobserve() {}
  disconnect() {}
}

// Add to global
global.ResizeObserver = MockResizeObserver;

// Mock for matchMedia
Object.defineProperty(window, "matchMedia", {
  writable: true,
  value: vi.fn().mockImplementation((query) => ({
    matches: false,
    media: query,
    onchange: null,
    addListener: vi.fn(),
    removeListener: vi.fn(),
    addEventListener: vi.fn(),
    removeEventListener: vi.fn(),
    dispatchEvent: vi.fn(),
  })),
});
