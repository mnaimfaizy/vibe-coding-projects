import { useState, useEffect } from "react";
import {
  Info,
  Library,
  Mail,
  Search,
  Settings,
  UserPlus,
  Users,
  BookOpen,
} from "lucide-react";

interface NavigationItem {
  name: string;
  href: string;
  icon: JSX.Element;
  current: boolean;
}

export function NavigationComponent() {
  const [navigation, setNavigation] = useState<NavigationItem[]>([
    {
      name: "Browse Books",
      href: "/books",
      icon: <BookOpen className="h-5 w-5" />,
      current: false,
    },
    {
      name: "Search",
      href: "/books/search",
      icon: <Search className="h-5 w-5" />,
      current: false,
    },
    {
      name: "Categories",
      href: "/categories",
      icon: <Library className="h-5 w-5" />,
      current: false,
    },
    {
      name: "Authors",
      href: "/authors",
      icon: <Users className="h-5 w-5" />,
      current: false,
    },
    {
      name: "New Releases",
      href: "/new-releases",
      icon: <UserPlus className="h-5 w-5" />,
      current: false,
    },
    {
      name: "About",
      href: "/about",
      icon: <Info className="h-5 w-5" />,
      current: false,
    },
    {
      name: "Contact",
      href: "/contact",
      icon: <Mail className="h-5 w-5" />,
      current: false,
    },
    {
      name: "Settings",
      href: "/settings",
      icon: <Settings className="h-5 w-5" />,
      current: false,
    },
  ]);

  // Set current navigation item based on the current path
  useEffect(() => {
    const currentPath = window.location.pathname;
    setNavigation(
      navigation.map((item) => ({
        ...item,
        current: item.href === currentPath,
      }))
    );
  }, []);

  const handleNavItemClick = (clickedItem: NavigationItem) => {
    setNavigation(
      navigation.map((item) => ({
        ...item,
        current: item.name === clickedItem.name,
      }))
    );
  };

  return (
    <nav className="bg-white shadow dark:bg-gray-800">
      <div className="container px-6 py-2 mx-auto">
        {/* Desktop Navigation - No logo, just the navigation items */}
        <div className="flex items-center justify-center">
          <div className="overflow-x-auto pb-1 hide-scrollbar">
            <div className="flex flex-row items-center space-x-1">
              {navigation.map((item) => (
                <a
                  key={item.name}
                  href={item.href}
                  onClick={() => handleNavItemClick(item)}
                  className={`
                    px-3 py-2 text-sm font-medium transition-colors duration-200 rounded-md flex items-center space-x-1 whitespace-nowrap
                    ${
                      item.current
                        ? "text-white bg-blue-600"
                        : "text-gray-700 dark:text-gray-200 hover:bg-gray-100 dark:hover:bg-gray-700"
                    }
                  `}
                >
                  {item.icon}
                  <span className="ml-1">{item.name}</span>
                </a>
              ))}
            </div>
          </div>
        </div>
      </div>
    </nav>
  );
}
