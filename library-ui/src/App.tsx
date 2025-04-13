import {
  BrowserRouter,
  Routes,
  Route,
  useNavigate,
  Link,
} from "react-router-dom";
import { useEffect } from "react";
import { LandingPageComponent } from "./components/landing/LandingPageComponent";
import { LoginComponent } from "./components/auth/LoginComponent";
import { SignUpComponent } from "./components/auth/SignUpComponent";
import { ResetPasswordComponent } from "./components/auth/ResetPasswordComponent";
import { ChangePasswordComponent } from "./components/auth/ChangePasswordComponent";
import { EmailVerificationComponent } from "./components/auth/EmailVerificationComponent";
import { SetNewPasswordComponent } from "./components/auth/SetNewPasswordComponent";
import { PublicBooksComponent } from "./components/books/PublicBooksComponent";
import { BooksComponent } from "./components/books/BooksComponent";
import { CreateBookComponent } from "./components/books/CreateBookComponent";
import { EditBookComponent } from "./components/books/EditBookComponent";
import { BookDetailsComponent } from "./components/books/BookDetailsComponent";
import { AuthorsComponent } from "./components/books/AuthorsComponent";
import { AuthorsListComponent } from "./components/books/AuthorsListComponent";
import { BookSearchComponent } from "./components/books/search/BookSearchComponent";
import { ProfileComponent } from "./components/profile/ProfileComponent";
import { MainLayout } from "./components/shared/MainLayout";
import { AuthGuard } from "./components/auth/guards/AuthGuard";
import { registerNavigate } from "./lib/navigation";
import { Toaster } from "./components/ui/sonner";

// Wrapper component to register the navigation function
function NavigationRegistrar() {
  const navigate = useNavigate();

  useEffect(() => {
    registerNavigate(navigate);
  }, [navigate]);

  return null;
}

function App() {
  return (
    <BrowserRouter>
      <NavigationRegistrar />
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
          {/* Public books route */}
          <Route path="/books" element={<PublicBooksComponent />} />
          {/* Public route for book details */}
          <Route path="/books/:bookId" element={<BookDetailsComponent />} />

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
            path="/my-books"
            element={
              <AuthGuard>
                <BooksComponent />
              </AuthGuard>
            }
          />
          <Route
            path="/my-books/search"
            element={
              <AuthGuard>
                <BookSearchComponent />
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
            path="/books/edit/:bookId"
            element={
              <AuthGuard>
                <EditBookComponent />
              </AuthGuard>
            }
          />
          {/* Authors routes */}
          <Route
            path="/authors"
            element={
              <AuthGuard>
                <AuthorsListComponent />
              </AuthGuard>
            }
          />
          <Route
            path="/authors/:authorName"
            element={
              <AuthGuard>
                <AuthorsComponent />
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
                <Link
                  to="/"
                  className="px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700 inline-block"
                >
                  Return to Home
                </Link>
              </div>
            }
          />
        </Routes>
        <Toaster />
      </MainLayout>
    </BrowserRouter>
  );
}

export default App;
