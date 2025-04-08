import { useState } from "react";
import { BookOpen, Home, Info, Library, Mail, Search, Settings, UserPlus, Users } from "lucide-react";

interface NavigationItem {
  name: string;
  href: string;
  icon: JSX.Element;
  current: boolean;
}

export function NavigationComponent() {
  const [navigation, setNavigation] = useState<NavigationItem[]>([
    { name: 'Home', href: '/', icon: <Home className="h-5 w-5" />, current: true },
    { name: 'Browse Books', href: '/books', icon: <BookOpen className="h-5 w-5" />, current: false },
    { name: 'Search', href: '/search', icon: <Search className="h-5 w-5" />, current: false },
    { name: 'Categories', href: '/categories', icon: <Library className="h-5 w-5" />, current: false },
    { name: 'Authors', href: '/authors', icon: <Users className="h-5 w-5" />, current: false },
    { name: 'New Releases', href: '/new-releases', icon: <UserPlus className="h-5 w-5" />, current: false },
    { name: 'About', href: '/about', icon: <Info className="h-5 w-5" />, current: false },
    { name: 'Contact', href: '/contact', icon: <Mail className="h-5 w-5" />, current: false },
    { name: 'Settings', href: '/settings', icon: <Settings className="h-5 w-5" />, current: false },
  ]);

  const handleNavItemClick = (clickedItem: NavigationItem) => {
    setNavigation(navigation.map(item => ({
      ...item,
      current: item.name === clickedItem.name
    })));
  };

  return (
    <nav className="bg-white shadow dark:bg-gray-800">
      <div className="container px-6 py-4 mx-auto">
        <div className="md:flex md:items-center md:justify-between">
          <div className="flex items-center justify-between">
            <div className="text-xl font-semibold text-gray-700">
              <div className="flex items-center justify-center text-gray-800 dark:text-white">
                <BookOpen className="h-6 w-6 mr-2" />
                <span>Library Nav</span>
              </div>
            </div>
          </div>

          {/* Desktop Navigation */}
          <div className="flex-1 md:flex md:items-center md:justify-between">
            <div className="flex flex-col -mx-4 md:flex-row md:items-center md:mx-8 overflow-x-auto pb-1 scrollbar-hide">
              {navigation.map((item) => (
                <a
                  key={item.name}
                  href={item.href}
                  onClick={() => handleNavItemClick(item)}
                  className={`
                    px-2 py-1 mx-2 mt-2 text-sm font-medium transition-colors duration-300 transform rounded-md md:mt-0 flex items-center space-x-2 whitespace-nowrap
                    ${item.current
                      ? 'text-white bg-blue-600'
                      : 'text-gray-700 dark:text-gray-200 hover:bg-gray-100 dark:hover:bg-gray-700'
                    }
                  `}
                >
                  {item.icon}
                  <span>{item.name}</span>
                </a>
              ))}
            </div>
          </div>
        </div>
      </div>
    </nav>
  );
}