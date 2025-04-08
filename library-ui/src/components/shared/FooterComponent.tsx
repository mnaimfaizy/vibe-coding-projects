import { BookOpen, Facebook, Github, Instagram, Twitter } from "lucide-react";

export function FooterComponent() {
  const currentYear = new Date().getFullYear();
  
  return (
    <footer className="bg-slate-900 text-slate-200">
      <div className="container mx-auto px-4 py-8">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
          {/* Logo and About */}
          <div className="md:col-span-1">
            <div className="flex items-center space-x-2 mb-4">
              <BookOpen className="h-6 w-6" />
              <span className="text-lg font-bold">Library Management</span>
            </div>
            <p className="text-sm text-slate-400">
              Your one-stop solution for managing library resources, books, and member activities.
            </p>
          </div>

          {/* Quick Links */}
          <div>
            <h3 className="text-lg font-semibold mb-4">Quick Links</h3>
            <ul className="space-y-2">
              <li><a href="/" className="text-slate-400 hover:text-white transition-colors">Home</a></li>
              <li><a href="/books" className="text-slate-400 hover:text-white transition-colors">Books</a></li>
              <li><a href="/about" className="text-slate-400 hover:text-white transition-colors">About Us</a></li>
              <li><a href="/contact" className="text-slate-400 hover:text-white transition-colors">Contact</a></li>
            </ul>
          </div>

          {/* Help & Support */}
          <div>
            <h3 className="text-lg font-semibold mb-4">Help & Support</h3>
            <ul className="space-y-2">
              <li><a href="/faq" className="text-slate-400 hover:text-white transition-colors">FAQ</a></li>
              <li><a href="/terms" className="text-slate-400 hover:text-white transition-colors">Terms of Service</a></li>
              <li><a href="/privacy" className="text-slate-400 hover:text-white transition-colors">Privacy Policy</a></li>
              <li><a href="/support" className="text-slate-400 hover:text-white transition-colors">Support Center</a></li>
            </ul>
          </div>

          {/* Connect */}
          <div>
            <h3 className="text-lg font-semibold mb-4">Connect With Us</h3>
            <div className="flex space-x-4">
              <a href="#" className="text-slate-400 hover:text-white transition-colors">
                <Facebook className="h-5 w-5" />
              </a>
              <a href="#" className="text-slate-400 hover:text-white transition-colors">
                <Twitter className="h-5 w-5" />
              </a>
              <a href="#" className="text-slate-400 hover:text-white transition-colors">
                <Instagram className="h-5 w-5" />
              </a>
              <a href="#" className="text-slate-400 hover:text-white transition-colors">
                <Github className="h-5 w-5" />
              </a>
            </div>
            <div className="mt-4">
              <p className="text-sm text-slate-400">Subscribe to our newsletter</p>
              <div className="mt-2 flex">
                <input 
                  type="email" 
                  placeholder="Your email" 
                  className="px-3 py-2 bg-slate-800 text-white rounded-l-md focus:outline-none focus:ring-1 focus:ring-blue-500 text-sm"
                />
                <button className="bg-blue-600 hover:bg-blue-700 px-3 py-2 rounded-r-md text-white text-sm transition-colors">
                  Subscribe
                </button>
              </div>
            </div>
          </div>
        </div>
        
        {/* Bottom Bar */}
        <div className="border-t border-slate-800 mt-8 pt-4 text-center text-sm text-slate-400">
          <p>© {currentYear} Library Management System. All rights reserved.</p>
        </div>
      </div>
    </footer>
  );
}