import { useState } from 'react';
import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { BookOpen, Menu, User, X } from "lucide-react";

export function HeaderComponent() {
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [isLoggedIn, setIsLoggedIn] = useState(false); // In real app, this would come from auth state

  // Toggle login status for demo purposes
  const toggleLogin = () => setIsLoggedIn(!isLoggedIn);

  return (
    <header className="bg-slate-900 text-white">
      <div className="container mx-auto px-4 py-3">
        <div className="flex items-center justify-between">
          {/* Logo & Title */}
          <div className="flex items-center space-x-2">
            <BookOpen className="h-6 w-6" />
            <span className="text-lg font-bold">Library Management</span>
          </div>

          {/* Desktop Navigation */}
          <nav className="hidden md:flex items-center space-x-6">
            <a href="/" className="hover:text-blue-400 transition-colors">Home</a>
            <a href="/books" className="hover:text-blue-400 transition-colors">Books</a>
            <a href="/about" className="hover:text-blue-400 transition-colors">About</a>
            <a href="/contact" className="hover:text-blue-400 transition-colors">Contact</a>
          </nav>

          {/* User Menu (Desktop) */}
          <div className="hidden md:block">
            {isLoggedIn ? (
              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <Button variant="ghost" className="relative h-8 w-8 rounded-full">
                    <User className="h-5 w-5" />
                  </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent align="end" className="w-56">
                  <DropdownMenuLabel>My Account</DropdownMenuLabel>
                  <DropdownMenuSeparator />
                  <DropdownMenuItem>
                    <a href="/profile" className="flex w-full">Profile</a>
                  </DropdownMenuItem>
                  <DropdownMenuItem>
                    <a href="/bookmarks" className="flex w-full">Bookmarks</a>
                  </DropdownMenuItem>
                  <DropdownMenuItem>
                    <a href="/settings" className="flex w-full">Settings</a>
                  </DropdownMenuItem>
                  <DropdownMenuSeparator />
                  <DropdownMenuItem onClick={toggleLogin}>
                    Logout
                  </DropdownMenuItem>
                </DropdownMenuContent>
              </DropdownMenu>
            ) : (
              <div className="space-x-2">
                <Button variant="ghost" asChild>
                  <a href="/login">Login</a>
                </Button>
                <Button variant="default" asChild>
                  <a href="/signup">Sign Up</a>
                </Button>
              </div>
            )}
          </div>

          {/* Mobile Menu Button */}
          <Button
            variant="ghost"
            size="icon"
            className="md:hidden"
            onClick={() => setIsMenuOpen(!isMenuOpen)}
          >
            {isMenuOpen ? <X className="h-6 w-6" /> : <Menu className="h-6 w-6" />}
          </Button>
        </div>

        {/* Mobile Menu */}
        {isMenuOpen && (
          <div className="md:hidden py-4 space-y-4">
            <nav className="flex flex-col space-y-4">
              <a href="/" className="hover:text-blue-400 transition-colors">Home</a>
              <a href="/books" className="hover:text-blue-400 transition-colors">Books</a>
              <a href="/about" className="hover:text-blue-400 transition-colors">About</a>
              <a href="/contact" className="hover:text-blue-400 transition-colors">Contact</a>
            </nav>
            <div className="pt-4 border-t border-slate-700">
              {isLoggedIn ? (
                <>
                  <a href="/profile" className="block py-2 hover:text-blue-400 transition-colors">Profile</a>
                  <a href="/bookmarks" className="block py-2 hover:text-blue-400 transition-colors">Bookmarks</a>
                  <a href="/settings" className="block py-2 hover:text-blue-400 transition-colors">Settings</a>
                  <button 
                    onClick={toggleLogin}
                    className="block py-2 hover:text-blue-400 transition-colors"
                  >
                    Logout
                  </button>
                </>
              ) : (
                <div className="space-y-2">
                  <Button className="w-full" variant="outline" asChild>
                    <a href="/login">Login</a>
                  </Button>
                  <Button className="w-full" asChild>
                    <a href="/signup">Sign Up</a>
                  </Button>
                </div>
              )}
            </div>
          </div>
        )}
      </div>
    </header>
  );
}