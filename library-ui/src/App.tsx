import { useState, useEffect } from 'react';
import { LandingPageComponent } from './components/landing/LandingPageComponent';
import { LoginComponent } from './components/auth/LoginComponent';
import { SignUpComponent } from './components/auth/SignUpComponent';
import { ResetPasswordComponent } from './components/auth/ResetPasswordComponent';
import { ChangePasswordComponent } from './components/auth/ChangePasswordComponent';
import { EmailVerificationComponent } from './components/auth/EmailVerificationComponent';
import { BooksComponent } from './components/books/BooksComponent';
import { CreateBookComponent } from './components/books/CreateBookComponent';
import { EditBookComponent } from './components/books/EditBookComponent';

function App() {
  // Simple routing system
  const [currentRoute, setCurrentRoute] = useState('/');
  
  // Handle route changes
  useEffect(() => {
    const handleRouteChange = () => {
      setCurrentRoute(window.location.pathname);
    };
    
    // Listen for popstate event
    window.addEventListener('popstate', handleRouteChange);
    
    // Initial route setup
    handleRouteChange();
    
    return () => {
      window.removeEventListener('popstate', handleRouteChange);
    };
  }, []);

  // Custom link component to handle SPA navigation
  const Link = ({ to, children, className = '' }: { to: string, children: React.ReactNode, className?: string }) => {
    const handleClick = (e: React.MouseEvent) => {
      e.preventDefault();
      window.history.pushState({}, '', to);
      setCurrentRoute(to);
    };
    
    return (
      <a href={to} onClick={handleClick} className={className}>
        {children}
      </a>
    );
  };

  // Add Link to window for global access in components
  // In a real app, you would use a proper router like react-router-dom
  (window as any).Link = Link;

  // Render component based on current route
  const renderRoute = () => {
    switch (currentRoute) {
      case '/':
        return <LandingPageComponent />;
      case '/login':
        return <LoginComponent />;
      case '/signup':
        return <SignUpComponent />;
      case '/reset-password':
        return <ResetPasswordComponent />;
      case '/change-password':
        return <ChangePasswordComponent />;
      case '/verify-email':
        return <EmailVerificationComponent />;
      case '/books':
        return <BooksComponent />;
      case '/books/create':
        return <CreateBookComponent />;
      case '/books/edit':
        return <EditBookComponent />;
      default:
        return <div className="p-8 text-center">
          <h1 className="text-2xl font-bold mb-4">Page Not Found</h1>
          <p className="mb-4">Sorry, the page you are looking for doesn't exist.</p>
          <button 
            onClick={() => setCurrentRoute('/')}
            className="px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700"
          >
            Return to Home
          </button>
        </div>;
    }
  };

  return (
    <div className="min-h-screen bg-slate-50">
      {renderRoute()}
    </div>
  );
}

export default App
