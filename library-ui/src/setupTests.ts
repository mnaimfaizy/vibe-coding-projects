// Global test setup for Vitest
import "@testing-library/jest-dom";

// Set up common mocks that multiple tests might need
vi.mock("@/lib/navigation", () => ({
  default: vi.fn(),
  appNavigate: vi.fn(),
  registerNavigate: vi.fn(),
}));
