import { render, screen } from "@testing-library/react";
import { beforeEach, describe, expect, it, vi } from "vitest";
import App from "../App";
import * as navigationModule from "../lib/navigation";

// Mock react-router-dom completely instead of using MemoryRouter
// This prevents the "You cannot render a <Router> inside another <Router>" error
vi.mock("react-router-dom", () => ({
  BrowserRouter: ({ children }: { children: React.ReactNode }) => (
    <div data-testid="browser-router">{children}</div>
  ),
  Routes: ({ children }: { children: React.ReactNode }) => (
    <div data-testid="routes">{children}</div>
  ),
  Route: ({ path, element }: { path: string; element: React.ReactNode }) => (
    <div data-testid={`route-${path.replace(/\//g, "-").replace(/:/g, "")}`}>
      {element}
    </div>
  ),
  Link: ({ children, to }: { children: React.ReactNode; to: string }) => (
    <a href={to} data-testid={`link-${to}`}>
      {children}
    </a>
  ),
  useNavigate: () => vi.fn(),
}));

// Mock all the components used in routes
vi.mock("../components/landing/LandingPageComponent", () => ({
  LandingPageComponent: () => (
    <div data-testid="landing-page">Landing Page</div>
  ),
}));

vi.mock("../components/auth/LoginComponent", () => ({
  LoginComponent: () => <div data-testid="login-page">Login Page</div>,
}));

vi.mock("../components/auth/SignUpComponent", () => ({
  SignUpComponent: () => <div data-testid="signup-page">Signup Page</div>,
}));

vi.mock("../components/auth/ResetPasswordComponent", () => ({
  ResetPasswordComponent: () => (
    <div data-testid="reset-password-page">Reset Password Page</div>
  ),
}));

vi.mock("../components/auth/ChangePasswordComponent", () => ({
  ChangePasswordComponent: () => (
    <div data-testid="change-password-page">Change Password Page</div>
  ),
}));

vi.mock("../components/auth/EmailVerificationComponent", () => ({
  EmailVerificationComponent: () => (
    <div data-testid="email-verification-page">Email Verification Page</div>
  ),
}));

vi.mock("../components/auth/SetNewPasswordComponent", () => ({
  SetNewPasswordComponent: () => (
    <div data-testid="set-new-password-page">Set New Password Page</div>
  ),
}));

vi.mock("../components/about/AboutPage", () => ({
  AboutPage: () => <div data-testid="about-page">About Page</div>,
}));

vi.mock("../components/contact/ContactPage", () => ({
  ContactPage: () => <div data-testid="contact-page">Contact Page</div>,
}));

vi.mock("../components/books/PublicBooksComponent", () => ({
  PublicBooksComponent: () => (
    <div data-testid="public-books-page">Public Books Page</div>
  ),
}));

vi.mock("../components/auth/guards/AuthGuard", () => ({
  AuthGuard: ({ children }: { children: React.ReactNode }) => (
    <div data-testid="auth-guard">{children}</div>
  ),
}));

vi.mock("../components/auth/guards/AdminGuard", () => ({
  AdminGuard: ({ children }: { children: React.ReactNode }) => (
    <div data-testid="admin-guard">{children}</div>
  ),
}));

vi.mock("../components/shared/MainLayout", () => ({
  MainLayout: ({ children }: { children: React.ReactNode }) => (
    <div data-testid="main-layout">{children}</div>
  ),
}));

vi.mock("../components/ui/sonner", () => ({
  Toaster: () => <div data-testid="toaster">Toaster</div>,
}));

// Mock Redux Provider
vi.mock("react-redux", () => ({
  Provider: ({ children }: { children: React.ReactNode }) => (
    <div data-testid="redux-provider">{children}</div>
  ),
}));

describe("App Component", () => {
  beforeEach(() => {
    // Mock registerNavigate function
    vi.spyOn(navigationModule, "registerNavigate").mockImplementation(vi.fn());
  });

  it("renders main layout and router structure", () => {
    render(<App />);

    // Check main structural components are rendered
    expect(screen.getByTestId("browser-router")).toBeInTheDocument();
    expect(screen.getByTestId("main-layout")).toBeInTheDocument();
    expect(screen.getByTestId("routes")).toBeInTheDocument();

    // Verify route components are rendered
    expect(screen.getByTestId("route--")).toBeInTheDocument(); // Home route
    expect(screen.getByTestId("route--login")).toBeInTheDocument();
    expect(screen.getByTestId("route--signup")).toBeInTheDocument();
    expect(screen.getByTestId("toaster")).toBeInTheDocument();
  });

  it("renders public routes", () => {
    render(<App />);

    // Verify public route paths exist
    expect(screen.getByTestId("route--")).toBeInTheDocument();
    expect(screen.getByTestId("route--login")).toBeInTheDocument();
    expect(screen.getByTestId("route--signup")).toBeInTheDocument();
    expect(screen.getByTestId("route--reset-password")).toBeInTheDocument();
    expect(screen.getByTestId("route--set-new-password")).toBeInTheDocument();
    expect(screen.getByTestId("route--verify-email")).toBeInTheDocument();
    expect(screen.getByTestId("route--about")).toBeInTheDocument();
    expect(screen.getByTestId("route--contact")).toBeInTheDocument();
    expect(screen.getByTestId("route--books")).toBeInTheDocument();
  });

  it("renders protected routes with AuthGuard", () => {
    render(<App />);

    // Find all protected routes (those wrapped with AuthGuard)
    const changePasswordRoute = screen.getByTestId("route--change-password");
    expect(changePasswordRoute).toBeInTheDocument();

    // Verify the route contains auth guard
    const authGuardInChangePassword = changePasswordRoute.querySelector(
      '[data-testid="auth-guard"]'
    );
    expect(authGuardInChangePassword).toBeInTheDocument();

    // Verify that auth guard contains the protected component
    expect(
      authGuardInChangePassword?.querySelector(
        '[data-testid="change-password-page"]'
      )
    ).toBeInTheDocument();
  });

  it("renders admin routes with AdminGuard", () => {
    render(<App />);

    // Find admin routes
    const adminRoute = screen.getByTestId("route--admin");
    expect(adminRoute).toBeInTheDocument();

    // Verify the route contains admin guard
    const adminGuard = adminRoute.querySelector('[data-testid="admin-guard"]');
    expect(adminGuard).toBeInTheDocument();
  });

  it("renders 404 fallback route", () => {
    render(<App />);

    // Find the fallback route (marked with path "*")
    const fallbackRoute = screen.getByTestId("route--*");
    expect(fallbackRoute).toBeInTheDocument();
    expect(fallbackRoute.textContent).toContain("Page Not Found");
    expect(fallbackRoute.textContent).toContain("Return to Home");
  });

  it("registers navigation function on mount", () => {
    render(<App />);
    expect(navigationModule.registerNavigate).toHaveBeenCalled();
  });
});
