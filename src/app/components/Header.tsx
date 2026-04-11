import { Link, useNavigate } from "react-router-dom";
import { Button } from "@/app/components/ui/button";
import { Bell, ChevronDown, Menu, Moon, Sun, User } from "lucide-react";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/app/components/ui/dropdown-menu";
import { useTheme } from "@/app/contexts/ThemeContext";
import { useState } from "react";

interface HeaderProps {
  userRole?: "startup" | "investor" | "advisor" | "admin";
  userName?: string;
}

export function Header({ userRole, userName }: HeaderProps) {
  const { theme, toggleTheme } = useTheme();
  const navigate = useNavigate();
  const [showNotifications, setShowNotifications] = useState(false);

  const notifications = [
    {
      id: 1,
      title: "New Investment Opportunity",
      message: "TechStart AI has updated their pitch deck",
      time: "5m ago",
      unread: true,
    },
    {
      id: 2,
      title: "Advisor Request",
      message: "Sarah Chen wants to connect with you",
      time: "1h ago",
      unread: true,
    },
    {
      id: 3,
      title: "Market Update",
      message: "Crypto market showing positive trends",
      time: "2h ago",
      unread: false,
    },
    {
      id: 4,
      title: "Profile View",
      message: "Your profile was viewed by 12 investors",
      time: "3h ago",
      unread: false,
    },
  ];

  const handleLogout = () => {
    // Add logout logic here
    navigate("/");
  };

  return (
    <header className="sticky top-0 z-50 w-full border-b border-slate-800 dark:border-slate-800 bg-white dark:bg-slate-950/80 backdrop-blur-lg">
      <div className="container mx-auto flex h-16 items-center justify-between px-6">
        <div className="flex items-center gap-8">
          <Link to="/" className="flex items-center gap-2">
            <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-gradient-to-r from-cyan-500 to-purple-500">
              <span className="font-bold text-white text-sm">MM</span>
            </div>
            <span className="text-lg font-bold tracking-tight text-slate-900 dark:text-white">MoneyMinds</span>
          </Link>

          {userRole && (
            <nav className="hidden md:flex items-center gap-6">
              <Link to={`/${userRole}/dashboard`} className="text-sm text-slate-600 dark:text-slate-300 hover:text-slate-900 dark:hover:text-white transition-colors">
                Dashboard
              </Link>
              {userRole === "startup" && (
                <>
                  <Link to={`/${userRole}/profile`} className="text-sm text-slate-600 dark:text-slate-300 hover:text-slate-900 dark:hover:text-white transition-colors">
                    Profile
                  </Link>
                  <Link to={`/${userRole}/advisors`} className="text-sm text-slate-600 dark:text-slate-300 hover:text-slate-900 dark:hover:text-white transition-colors">
                    Find Advisors
                  </Link>
                </>
              )}
              {userRole === "investor" && (
                <>
                  <Link to={`/${userRole}/discover`} className="text-sm text-slate-600 dark:text-slate-300 hover:text-slate-900 dark:hover:text-white transition-colors">
                    Discover
                  </Link>
                  <Link to={`/${userRole}/following`} className="text-sm text-slate-600 dark:text-slate-300 hover:text-slate-900 dark:hover:text-white transition-colors">
                    Following
                  </Link>
                </>
              )}
              {userRole === "advisor" && (
                <>
                  <Link to={`/${userRole}/profile`} className="text-sm text-slate-600 dark:text-slate-300 hover:text-slate-900 dark:hover:text-white transition-colors">
                    Profile
                  </Link>
                  <Link to={`/${userRole}/insights`} className="text-sm text-slate-600 dark:text-slate-300 hover:text-slate-900 dark:hover:text-white transition-colors">
                    Insights
                  </Link>
                </>
              )}
              {userRole === "admin" && (
                <>
                  <Link to={`/${userRole}/moderation`} className="text-sm text-slate-600 dark:text-slate-300 hover:text-slate-900 dark:hover:text-white transition-colors">
                    Moderation
                  </Link>
                  <Link to={`/${userRole}/verification`} className="text-sm text-slate-600 dark:text-slate-300 hover:text-slate-900 dark:hover:text-white transition-colors">
                    Verification
                  </Link>
                </>
              )}
            </nav>
          )}
        </div>

        <div className="flex items-center gap-4">
          {/* Theme Toggle Button */}
          <Button
            variant="ghost"
            size="icon"
            onClick={toggleTheme}
            className="text-slate-600 dark:text-slate-300 hover:text-slate-900 dark:hover:text-white"
          >
            {theme === "dark" ? (
              <Sun className="h-5 w-5" />
            ) : (
              <Moon className="h-5 w-5" />
            )}
          </Button>

          {userRole ? (
            <>
              {/* Notifications Dropdown */}
              <DropdownMenu open={showNotifications} onOpenChange={setShowNotifications}>
                <DropdownMenuTrigger asChild>
                  <Button variant="ghost" size="icon" className="relative text-slate-600 dark:text-slate-300 hover:text-slate-900 dark:hover:text-white">
                    <Bell className="h-5 w-5" />
                    <span className="absolute top-1 right-1 h-2 w-2 rounded-full bg-cyan-400 animate-pulse"></span>
                  </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent align="end" className="w-80 bg-white dark:bg-slate-900 border-slate-200 dark:border-slate-800">
                  <DropdownMenuLabel className="text-slate-900 dark:text-white">Notifications</DropdownMenuLabel>
                  <DropdownMenuSeparator className="bg-slate-200 dark:bg-slate-800" />
                  <div className="max-h-80 overflow-y-auto">
                    {notifications.map((notification) => (
                      <DropdownMenuItem
                        key={notification.id}
                        className={`flex flex-col items-start gap-1 p-3 cursor-pointer ${
                          notification.unread
                            ? "bg-cyan-50 dark:bg-cyan-950/20"
                            : "hover:bg-slate-50 dark:hover:bg-slate-800/50"
                        }`}
                      >
                        <div className="flex items-start justify-between w-full">
                          <span className="font-medium text-sm text-slate-900 dark:text-white">
                            {notification.title}
                          </span>
                          {notification.unread && (
                            <span className="h-2 w-2 rounded-full bg-cyan-500 mt-1"></span>
                          )}
                        </div>
                        <span className="text-xs text-slate-600 dark:text-slate-400">
                          {notification.message}
                        </span>
                        <span className="text-xs text-slate-500 dark:text-slate-500">
                          {notification.time}
                        </span>
                      </DropdownMenuItem>
                    ))}
                  </div>
                  <DropdownMenuSeparator className="bg-slate-200 dark:bg-slate-800" />
                  <DropdownMenuItem className="text-center justify-center text-cyan-600 dark:text-cyan-400 hover:text-cyan-700 dark:hover:text-cyan-300 cursor-pointer">
                    View all notifications
                  </DropdownMenuItem>
                </DropdownMenuContent>
              </DropdownMenu>

              {/* User Profile Dropdown */}
              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <Button variant="ghost" className="gap-2 text-slate-600 dark:text-slate-300 hover:text-slate-900 dark:hover:text-white">
                    <div className="h-8 w-8 rounded-full bg-gradient-to-br from-cyan-500 to-purple-500 flex items-center justify-center">
                      <span className="text-sm font-medium text-white">
                        {userName?.[0] || "U"}
                      </span>
                    </div>
                    <ChevronDown className="h-4 w-4" />
                  </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent align="end" className="w-56 bg-white dark:bg-slate-900 border-slate-200 dark:border-slate-800">
                  <DropdownMenuLabel className="text-slate-900 dark:text-white">
                    <div className="flex flex-col">
                      <span>{userName || "User"}</span>
                      <span className="text-xs text-slate-500 dark:text-slate-400 capitalize">{userRole}</span>
                    </div>
                  </DropdownMenuLabel>
                  <DropdownMenuSeparator className="bg-slate-200 dark:bg-slate-800" />
                  <DropdownMenuItem asChild>
                    <Link
                      to={`/${userRole}/profile`}
                      className="cursor-pointer text-slate-700 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800 flex items-center"
                    >
                      <User className="h-4 w-4 mr-2" />
                      View Profile
                    </Link>
                  </DropdownMenuItem>
                  <DropdownMenuItem asChild>
                    <Link
                      to={`/${userRole}/edit-profile`}
                      className="cursor-pointer text-slate-700 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800"
                    >
                      Edit Profile
                    </Link>
                  </DropdownMenuItem>
                  <DropdownMenuSeparator className="bg-slate-200 dark:bg-slate-800" />
                  <DropdownMenuItem
                    onClick={handleLogout}
                    className="cursor-pointer text-red-600 dark:text-red-400 hover:bg-red-50 dark:hover:bg-red-950/20"
                  >
                    Log out
                  </DropdownMenuItem>
                </DropdownMenuContent>
              </DropdownMenu>
            </>
          ) : (
            <div className="flex items-center gap-2">
              <Link to="/login">
                <Button variant="ghost" className="text-slate-600 dark:text-slate-300 hover:text-slate-900 dark:hover:text-white">Login</Button>
              </Link>
              <Link to="/login">
                <Button className="bg-gradient-to-r from-cyan-500 to-purple-500 hover:from-cyan-600 hover:to-purple-600 border-0">Get Started</Button>
              </Link>
            </div>
          )}

          <Button variant="ghost" size="icon" className="md:hidden text-slate-600 dark:text-slate-300 hover:text-slate-900 dark:hover:text-white">
            <Menu className="h-5 w-5" />
          </Button>
        </div>
      </div>
    </header>
  );
}