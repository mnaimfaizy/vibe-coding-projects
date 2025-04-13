import { useState, useEffect, JSX } from "react";
import {
  Library,
  Search,
  Settings,
  Users,
  BookOpen,
  Bookmark,
} from "lucide-react";
import { useAppSelector } from "@/store/hooks";
import { Link, useLocation } from "react-router-dom";

interface NavigationItem {
  name: string;
  href: string;
  icon: JSX.Element;
  current: boolean;
}

export function NavigationComponent() {
  const { isAuthenticated } = useAppSelector((state) => state.auth);
  const location = useLocation();

  const [navigation, setNavigation] = useState<NavigationItem[]>([
    {
      name: "My Books",
      href: "/my-books",
      icon: <BookOpen className="h-5 w-5" />,
      current: false,
    },
    {
      name: "Search Books",
      href: "/my-books/search",
      icon: <Search className="h-5 w-5" />,
      current: false,
    },
    {
      name: "My Collection",
      href: "/my-books?view=collection",
      icon: <Bookmark className="h-5 w-5" />,
      current: false,
    },
    {
      name: "Authors",
      href: "/authors",
      icon: <Users className="h-5 w-5" />,
      current: false,
    },
    {
      name: "Settings",
      href: "/profile",
      icon: <Settings className="h-5 w-5" />,
      current: false,
    },
  ]);

  // Set current navigation item based on the current path
  useEffect(() => {
    const currentPath = location.pathname;
    const searchParams = new URLSearchParams(location.search);

    setNavigation(
      navigation.map((item) => ({
        ...item,
        current:
          currentPath === item.href ||
          (currentPath.startsWith("/my-books") &&
            item.href === "/my-books" &&
            !item.href.includes("?view=") &&
            !searchParams.has("view")) ||
          (currentPath === "/my-books" &&
            item.href === "/my-books?view=collection" &&
            searchParams.get("view") === "collection") ||
          (item.href !== "/" && currentPath.startsWith(item.href)),
      }))
    );
  }, [location.pathname, location.search]);

  // Redirect to login if not authenticated
  if (!isAuthenticated) {
    return null; // Don't render anything if user is not authenticated
  }

  return (
    <nav className="bg-white shadow dark:bg-gray-800">
      <div className="container px-6 py-2 mx-auto">
        {/* Desktop Navigation - No logo, just the navigation items */}
        <div className="flex items-center justify-center">
          <div className="overflow-x-auto pb-1 hide-scrollbar">
            <div className="flex flex-row items-center space-x-1">
              {navigation.map((item) => {
                return (
                  <Link
                    key={item.name}
                    to={item.href}
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
                  </Link>
                );
              })}
            </div>
          </div>
        </div>
      </div>
    </nav>
  );
}
