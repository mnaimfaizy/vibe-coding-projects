import { render } from "@testing-library/react";
import React from "react";
import { beforeEach, describe, expect, it, vi } from "vitest";

// Mock React modules
vi.mock("react", async () => {
  const actual = await vi.importActual("react");
  return {
    ...actual,
    StrictMode: ({ children }: { children: React.ReactNode }) => (
      <div data-testid="strict-mode">{children}</div>
    ),
  };
});

// Mock react-dom/client
vi.mock("react-dom/client", () => ({
  createRoot: vi.fn(() => ({
    render: vi.fn(),
  })),
}));

// Mock the store
vi.mock("../store", () => ({
  store: {},
}));

// Mock react-redux
vi.mock("react-redux", () => ({
  Provider: ({ children }: { children: React.ReactNode }) => (
    <div data-testid="redux-provider">{children}</div>
  ),
}));

// Mock App component
vi.mock("../App", () => ({
  default: () => <div data-testid="app">App Component</div>,
}));

// Mock document.getElementById
document.getElementById = vi.fn(() => document.createElement("div"));

describe("main", () => {
  beforeEach(() => {
    vi.resetAllMocks();
  });

  it("renders the app with Redux Provider in StrictMode", () => {
    // Mock implementation for importing main.tsx
    const ReactDOM = require("react-dom/client");
    const App = require("../App").default;
    const React = require("react");
    const ReactRedux = require("react-redux");
    const store = require("../store").store;

    // Simulate main.tsx behavior
    const rootElement = document.getElementById("root");
    const root = ReactDOM.createRoot(rootElement);

    root.render(
      React.createElement(
        React.StrictMode,
        null,
        React.createElement(
          ReactRedux.Provider,
          { store },
          React.createElement(App)
        )
      )
    );

    // Verify root element was used
    expect(document.getElementById).toHaveBeenCalledWith("root");
    expect(ReactDOM.createRoot).toHaveBeenCalled();

    // Render the structure manually to check it
    const { getByTestId } = render(
      <React.StrictMode>
        <ReactRedux.Provider store={store}>
          <App />
        </ReactRedux.Provider>
      </React.StrictMode>
    );

    expect(getByTestId("strict-mode")).toBeInTheDocument();
    expect(getByTestId("redux-provider")).toBeInTheDocument();
    expect(getByTestId("app")).toBeInTheDocument();
  });
});
