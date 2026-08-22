import { Link, useNavigate } from "react-router-dom";
import { Bell, ChevronDown, Menu, Moon, Sun, User, Check } from "lucide-react";
import { useEffect, useState } from "react";

import { useAuth } from "@/app/contexts/AuthContext";
import { useTheme } from "@/app/contexts/ThemeContext";
import { Button } from "@/app/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/app/components/ui/dropdown-menu";
import {
  listNotifications,
  markNotificationRead,
  markAllNotificationsRead,
  type Notification,
} from "@/app/lib/api";

interface HeaderProps {
  userRole?: "startup" | "investor" | "advisor" | "admin";
  userName?: string;
}

export function Header({ userRole, userName }: HeaderProps) {
  const navigate = useNavigate();
  const { theme, toggleTheme } = useTheme();
  const { logout, user, session } = useAuth();
  const [showNotifications, setShowNotifications] = useState(false);
  const [notifications, setNotifications] = useState<Notification[]>([]);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  const resolvedUserName = userName ?? user?.fullName ?? "User";
  const resolvedUserRole = user?.isAdmin ? "admin" : user?.currentRole ?? user?.approvedRoles?.[0] ?? userRole;

  useEffect(() => {
    if (!session?.token) return;
    let active = true;
    async function load() {
      try {
        const res = await listNotifications(session!.token);
        if (active) setNotifications(res.notifications);
      } catch {
        // keep defaults
      }
    }
    load();
    // Poll every 30s
    const interval = setInterval(load, 30000);
    return () => { active = false; clearInterval(interval); };
  }, [session?.token]);

  const unreadCount = notifications.filter((n) => !n.read).length;

  const handleMarkRead = async (id: string) => {
    if (!session?.token) return;
    try {
      await markNotificationRead(session.token, id);
      setNotifications((prev) => prev.map((n) => n.id === id ? { ...n, read: true } : n));
    } catch {
      // ignore
    }
  };

  const handleMarkAllRead = async () => {
    if (!session?.token) return;
    try {
      await markAllNotificationsRead(session.token);
      setNotifications((prev) => prev.map((n) => ({ ...n, read: true })));
    } catch {
      // ignore
    }
  };

  const handleLogout = () => {
    logout();
    navigate("/login");
  };

  const navLinks = (() => {
    switch (resolvedUserRole) {
      case "startup":
        return [
          { to: "/startup/dashboard", label: "Dashboard" },
          { to: "/startup/profile", label: "Profile" },
          { to: "/startup/groups", label: "Groups" },
          { to: "/startup/trainings", label: "Trainings" },
          { to: "/startup/find-advisors", label: "Find Advisors" },
        ];
      case "investor":
        return [
          { to: "/investor/dashboard", label: "Dashboard" },
          { to: "/investor/profile", label: "Profile" },
          { to: "/investor/groups", label: "Groups" },
          { to: "/investor/ai-agents", label: "AI Agents" },
          { to: "/investor/trainings", label: "Trainings" },
          { to: "/investor/find-advisors", label: "Find Advisors" },
        ];
      case "advisor":
        return [
          { to: "/advisor/dashboard", label: "Dashboard" },
          { to: "/advisor/profile", label: "Profile" },
          { to: "/advisor/groups", label: "Groups" },
          { to: "/advisor/trainings", label: "Trainings" },
        ];
      case "admin":
        return [
          { to: "/admin/dashboard", label: "Dashboard" },
          { to: "/admin/profile", label: "Profile" },
        ];
      default:
        return [];
    }
  })();

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

          {resolvedUserRole ? (
            <nav className="hidden md:flex items-center gap-6">
              {navLinks.map((link) => (
                <Link
                  key={link.to}
                  to={link.to}
                  className="text-sm text-slate-600 dark:text-slate-300 hover:text-slate-900 dark:hover:text-white transition-colors"
                >
                  {link.label}
                </Link>
              ))}
            </nav>
          ) : null}
        </div>

        <div className="flex items-center gap-2 sm:gap-4">
          <Button
            variant="ghost"
            size="icon"
            onClick={toggleTheme}
            className="hidden sm:inline-flex text-slate-600 dark:text-slate-300 hover:text-slate-900 dark:hover:text-white"
          >
            {theme === "dark" ? <Sun className="h-5 w-5" /> : <Moon className="h-5 w-5" />}
          </Button>

          {resolvedUserRole ? (
            <>
              <DropdownMenu open={showNotifications} onOpenChange={setShowNotifications}>
                <DropdownMenuTrigger asChild>
                  <Button variant="ghost" size="icon" className="relative text-slate-600 dark:text-slate-300 hover:text-slate-900 dark:hover:text-white">
                    <Bell className="h-5 w-5" />
                    {unreadCount > 0 && (
                      <span className="absolute -top-0.5 -right-0.5 h-4 w-4 rounded-full bg-cyan-500 text-white text-[10px] flex items-center justify-center font-bold">
                        {unreadCount > 9 ? "9+" : unreadCount}
                      </span>
                    )}
                  </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent align="end" className="w-80 bg-white dark:bg-slate-900 border-slate-200 dark:border-slate-800">
                  <div className="flex items-center justify-between px-3 py-2">
                    <DropdownMenuLabel className="text-slate-900 dark:text-white p-0">Notifications</DropdownMenuLabel>
                    {unreadCount > 0 && (
                      <Button variant="ghost" size="sm" className="text-xs h-auto py-1" onClick={handleMarkAllRead}>
                        <Check className="h-3 w-3 mr-1" />
                        Mark all read
                      </Button>
                    )}
                  </div>
                  <DropdownMenuSeparator className="bg-slate-200 dark:bg-slate-800" />
                  <div className="max-h-80 overflow-y-auto">
                    {notifications.length > 0 ? (
                      notifications.slice(0, 10).map((notification) => (
                        <DropdownMenuItem
                          key={notification.id}
                          onClick={() => handleMarkRead(notification.id)}
                          className={`flex flex-col items-start gap-1 p-3 cursor-pointer ${
                            !notification.read
                              ? "bg-cyan-50 dark:bg-cyan-950/20"
                              : "hover:bg-slate-50 dark:hover:bg-slate-800/50"
                          }`}
                        >
                          <div className="flex items-start justify-between w-full">
                            <span className="font-medium text-sm text-slate-900 dark:text-white">
                              {notification.title}
                            </span>
                            {!notification.read ? (
                              <span className="h-2 w-2 rounded-full bg-cyan-500 mt-1 flex-shrink-0"></span>
                            ) : null}
                          </div>
                          <span className="text-xs text-slate-600 dark:text-slate-400">
                            {notification.message}
                          </span>
                          <span className="text-xs text-slate-500 dark:text-slate-500">
                            {new Date(notification.createdAt).toLocaleString()}
                          </span>
                        </DropdownMenuItem>
                      ))
                    ) : (
                      <div className="p-4 text-center text-sm text-slate-500">
                        No notifications yet
                      </div>
                    )}
                  </div>
                </DropdownMenuContent>
              </DropdownMenu>

              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <Button variant="ghost" className="gap-2 text-slate-600 dark:text-slate-300 hover:text-slate-900 dark:hover:text-white">
                    <div className="h-8 w-8 rounded-full bg-gradient-to-br from-cyan-500 to-purple-500 flex items-center justify-center">
                      <span className="text-sm font-medium text-white">{resolvedUserName[0] || "U"}</span>
                    </div>
                    <ChevronDown className="h-4 w-4" />
                  </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent align="end" className="w-56 bg-white dark:bg-slate-900 border-slate-200 dark:border-slate-800">
                  <DropdownMenuLabel className="text-slate-900 dark:text-white">
                    <div className="flex flex-col">
                      <span>{resolvedUserName}</span>
                      <span className="text-xs text-slate-500 dark:text-slate-400 capitalize">
                        {resolvedUserRole}
                      </span>
                    </div>
                  </DropdownMenuLabel>
                  <DropdownMenuSeparator className="bg-slate-200 dark:bg-slate-800" />
                  <DropdownMenuItem asChild>
                    <Link
                      to={resolvedUserRole === "admin" ? "/admin/profile" : `/${resolvedUserRole}/profile`}
                      className="cursor-pointer text-slate-700 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800 flex items-center"
                    >
                      <User className="h-4 w-4 mr-2" />
                      View Profile
                    </Link>
                  </DropdownMenuItem>
                  {resolvedUserRole !== "admin" ? (
                    <DropdownMenuItem asChild>
                      <Link
                        to={`/${resolvedUserRole}/edit-profile`}
                        className="cursor-pointer text-slate-700 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800"
                      >
                        Edit Profile
                      </Link>
                    </DropdownMenuItem>
                  ) : null}
                  {!user?.isAdmin && (user?.approvedRoles?.length ?? 0) > 1 ? (
                    <DropdownMenuItem asChild>
                      <Link
                        to="/choose-role"
                        className="cursor-pointer text-slate-700 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800"
                      >
                        Switch Role
                      </Link>
                    </DropdownMenuItem>
                  ) : null}
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
            <div className="hidden sm:flex items-center gap-2">
              <Link to="/login">
                <Button variant="ghost" className="text-slate-600 dark:text-slate-300 hover:text-slate-900 dark:hover:text-white">
                  Login
                </Button>
              </Link>
              <Link to="/apply">
                <Button className="bg-gradient-to-r from-cyan-500 to-purple-500 hover:from-cyan-600 hover:to-purple-600 border-0">
                  Create Profile
                </Button>
              </Link>
            </div>
          )}

          {/* Mobile Menu Toggle */}
          <Button
            variant="ghost"
            size="icon"
            className="md:hidden text-slate-600 dark:text-slate-300 hover:text-slate-900 dark:hover:text-white"
            onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
          >
            <Menu className="h-5 w-5" />
          </Button>
        </div>
      </div>

      {/* Mobile Navigation */}
      {mobileMenuOpen && (
        <div className="md:hidden border-t border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-950 px-6 py-4">
          <nav className="flex flex-col gap-3">
            {navLinks.map((link) => (
              <Link
                key={link.to}
                to={link.to}
                onClick={() => setMobileMenuOpen(false)}
                className="text-sm text-slate-600 dark:text-slate-300 hover:text-slate-900 dark:hover:text-white transition-colors py-2"
              >
                {link.label}
              </Link>
            ))}
            {/* Show Login/Create Profile in mobile menu when not logged in */}
            {!resolvedUserRole && (
              <>
                <Link to="/login" onClick={() => setMobileMenuOpen(false)} className="text-sm text-slate-600 dark:text-slate-300 hover:text-slate-900 dark:hover:text-white transition-colors py-2">
                  Login
                </Link>
                <Link to="/apply" onClick={() => setMobileMenuOpen(false)} className="text-sm font-medium text-cyan-600 dark:text-cyan-400 hover:text-cyan-700 dark:hover:text-cyan-300 transition-colors py-2">
                  Create Profile
                </Link>
              </>
            )}
            {/* Theme toggle in mobile menu */}
            <button
              onClick={() => { toggleTheme(); setMobileMenuOpen(false); }}
              className="sm:hidden text-sm text-slate-600 dark:text-slate-300 hover:text-slate-900 dark:hover:text-white transition-colors py-2 text-left"
            >
              {theme === "dark" ? "Light Mode" : "Dark Mode"}
            </button>
          </nav>
        </div>
      )}
    </header>
  );
}
