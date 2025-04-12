import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";
import { LandingPageComponent } from "./components/landing/LandingPageComponent";
import { LoginComponent } from "./components/auth/LoginComponent";
import { SignUpComponent } from "./components/auth/SignUpComponent";
import { ResetPasswordComponent } from "./components/auth/ResetPasswordComponent";
import { ChangePasswordComponent } from "./components/auth/ChangePasswordComponent";
import { EmailVerificationComponent } from "./components/auth/EmailVerificationComponent";
import { SetNewPasswordComponent } from "./components/auth/SetNewPasswordComponent";
import { BooksComponent } from "./components/books/BooksComponent";
import { CreateBookComponent } from "./components/books/CreateBookComponent";
import { EditBookComponent } from "./components/books/EditBookComponent";
import { ProfileComponent } from "./components/profile/ProfileComponent";
import { MainLayout } from "./components/shared/MainLayout";
import { AuthGuard } from "./components/auth/guards/AuthGuard";

function App() {
  return (
    <BrowserRouter>
      <MainLayout>
        <Routes>
          {/* Public routes */}
          <Route path="/" element={<LandingPageComponent />} />
          <Route path="/login" element={<LoginComponent />} />
          <Route path="/signup" element={<SignUpComponent />} />
          <Route path="/reset-password" element={<ResetPasswordComponent />} />
          <Route
            path="/set-new-password"
            element={<SetNewPasswordComponent />}
          />
          <Route
            path="/verify-email"
            element={<EmailVerificationComponent />}
          />

          {/* Protected routes */}
          <Route
            path="/change-password"
            element={
              <AuthGuard>
                <ChangePasswordComponent />
              </AuthGuard>
            }
          />
          <Route
            path="/books"
            element={
              <AuthGuard>
                <BooksComponent />
              </AuthGuard>
            }
          />
          <Route
            path="/books/create"
            element={
              <AuthGuard>
                <CreateBookComponent />
              </AuthGuard>
            }
          />
          <Route
            path="/books/edit"
            element={
              <AuthGuard>
                <EditBookComponent />
              </AuthGuard>
            }
          />
          <Route
            path="/profile"
            element={
              <AuthGuard>
                <ProfileComponent />
              </AuthGuard>
            }
          />

          {/* Fallback for unmatched routes */}
          <Route
            path="*"
            element={
              <div className="p-8 text-center">
                <h1 className="text-2xl font-bold mb-4">Page Not Found</h1>
                <p className="mb-4">
                  Sorry, the page you are looking for doesn't exist.
                </p>
                <a
                  href="/"
                  className="px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700 inline-block"
                >
                  Return to Home
                </a>
              </div>
            }
          />
        </Routes>
      </MainLayout>
    </BrowserRouter>
  );
}

export default App;
