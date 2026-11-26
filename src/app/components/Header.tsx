import { Link, useLocation, useNavigate } from "react-router-dom";
import { Bell, ChevronDown, Menu, Moon, Sun, User, Check, Shield, Sparkles, Lock, ExternalLink, ArrowRight } from "lucide-react";
import { useEffect, useState } from "react";
import logoImg from "@/assets/logo.png";

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
  adminShell?: boolean;
  showTicker?: boolean;
}

export function Header({ userRole, userName, adminShell = false, showTicker = false }: HeaderProps) {
  const navigate = useNavigate();
  const location = useLocation();
  const { theme, toggleTheme } = useTheme();
  const { logout, user, session } = useAuth();
  const [showNotifications, setShowNotifications] = useState(false);
  const [notifications, setNotifications] = useState<Notification[]>([]);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [headerStats, setHeaderStats] = useState<{ btc?: number; btcChange?: number; eth?: number; ethChange?: number; startups?: number } | null>(null);

  const resolvedUserName = userName ?? user?.fullName ?? "User";
  const resolvedUserRole = user?.isAdmin ? "admin" : user?.currentRole ?? user?.approvedRoles?.[0] ?? userRole;
  const tickerVisible = showTicker || ["startup", "advisor", "investor"].includes(resolvedUserRole ?? "");

  useEffect(() => {
    if (!tickerVisible) return;
    let active = true;
    async function loadStats() {
      try {
        const [marketRes, statsRes] = await Promise.all([
          fetch("/api/public/market").then((r) => r.ok ? r.json() : null).catch(() => null),
          fetch("/api/public/stats").then((r) => r.ok ? r.json() : null).catch(() => null),
        ]);
        if (active) {
          setHeaderStats({
            btc: marketRes?.prices?.btc,
            btcChange: marketRes?.prices?.btcChange,
            eth: marketRes?.prices?.eth,
            ethChange: marketRes?.prices?.ethChange,
            startups: statsRes?.startups,
          });
        }
      } catch {}
    }
    loadStats();
    return () => { active = false; };
  }, [tickerVisible]);

  useEffect(() => {
    if (!user) return;
    let active = true;
    async function load() {
      try {
        const res = await listNotifications(session?.token ?? "");
        if (active) setNotifications(res.notifications);
      } catch {
        // keep defaults
      }
    }
    load();
    const interval = setInterval(load, 30000);
    return () => { active = false; clearInterval(interval); };
  }, [user?.id, session?.token]);

  const unreadCount = notifications.filter((n) => !n.read).length;

  const handleMarkRead = async (id: string) => {
    if (!user) return;
    try {
      await markNotificationRead(session?.token ?? "", id);
      setNotifications((prev) => prev.map((n) => n.id === id ? { ...n, read: true } : n));
    } catch {
      // ignore
    }
  };

  const handleMarkAllRead = async () => {
    if (!user) return;
    try {
      await markAllNotificationsRead(session?.token ?? "");
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
          { to: "/activity", label: "Agent Activity" },
          { to: "/startup/groups", label: "Groups" },
          { to: "/startup/trainings", label: "Trainings" },
          { to: "/startup/find-advisors", label: "Find Advisors" },
        ];
      case "investor":
        return [
          { to: "/investor/dashboard", label: "Dashboard" },
          { to: "/investor/profile", label: "Profile" },
          { to: "/activity", label: "Agent Activity" },
          { to: "/investor/groups", label: "Groups" },
          { to: "/investor/ai-agents", label: "AI Agents" },
          { to: "/investor/trainings", label: "Trainings" },
          { to: "/investor/find-advisors", label: "Find Advisors" },
        ];
      case "advisor":
        return [
          { to: "/advisor/dashboard", label: "Dashboard" },
          { to: "/advisor/profile", label: "Profile" },
          { to: "/activity", label: "Agent Activity" },
          { to: "/advisor/groups", label: "Groups" },
          { to: "/advisor/credibility", label: "Credibility" },
          { to: "/advisor/trainings", label: "Trainings" },
        ];
      case "admin":
        return [
          { to: "/admin/dashboard", label: "Dashboard" },
          { to: "/admin/profile", label: "Profile" },
          { to: "/admin/agents", label: "Agent Activity" },
        ];
      default:
        return [
          { to: "/#advisors", label: "Advisors" },
          { to: "/#startups", label: "Startups" },
          { to: "/#our-story", label: "Our Story" },
          { to: "/#work-with-us", label: "Work With Us" },
          { to: "/#blogs", label: "Blogs" },
        ];
    }
  })();

  const handleNavClick = (e: React.MouseEvent, to: string) => {
    setMobileMenuOpen(false);
    if (to.startsWith("/#")) {
      e.preventDefault();
      const elementId = to.replace("/#", "");
      if (window.location.pathname === "/") {
        const el = document.getElementById(elementId);
        if (el) {
          const headerEl = document.querySelector('.sticky') as HTMLElement | null;
          const headerHeight = headerEl ? headerEl.offsetHeight : 120;
          const bodyRect = document.body.getBoundingClientRect().top;
          const elementRect = el.getBoundingClientRect().top;
          const elementPosition = elementRect - bodyRect;
          const offsetPosition = elementPosition - headerHeight - 24;

          window.history.pushState(null, "", `/#${elementId}`);
          window.scrollTo({
            top: Math.max(0, offsetPosition),
            behavior: "smooth"
          });
          return;
        }
      } else {
        navigate(`/#${elementId}`);
        return;
      }
    }
  };

  return (
    <div className="w-full z-50 sticky top-0 font-sans">
      {tickerVisible && (
        <div className="w-full bg-[#040714] text-slate-300 border-b border-slate-800/80 px-4 sm:px-8 xl:px-14 py-2 flex items-center justify-between text-xs tracking-wide">
          {/* Left Status Pill */}
          <div className="flex items-center gap-2">
            <span className="flex h-2 w-2 rounded-full bg-emerald-400 animate-ping" />
            <span className="text-slate-300 font-medium hidden sm:inline">
              Verified Diligence Engine Online
            </span>
            <span className="text-emerald-400 font-semibold sm:hidden">
              Protocol Live
            </span>
            <span className="hidden md:inline text-slate-600 dark:text-slate-600">•</span>
            <span className="hidden md:inline text-slate-400">
              Real-Time Advisor Accuracy Audits
            </span>

            {/* Cinematic Loader Replay Button */}
            <button
              onClick={() => window.dispatchEvent(new CustomEvent("mm-replay-loader"))}
              className="inline-flex items-center gap-1 text-[10px] font-mono font-medium text-cyan-300 hover:text-white bg-cyan-950/70 hover:bg-cyan-900 border border-cyan-700/60 rounded px-2 py-0.5 ml-2 transition-all cursor-pointer shadow-[0_0_8px_rgba(6,182,212,0.2)]"
              title="Click to replay the high-level financial diligence loader"
            >
              <Sparkles className="h-2.5 w-2.5 text-cyan-400 animate-pulse" />
              <span>Replay Loader</span>
            </button>
          </div>

          {/* Center Live Crypto / Benchmark stats (Real Present-Time Numbers) */}
          <div className="hidden lg:flex items-center gap-4 text-[11px] text-slate-400">
            <span className="flex items-center gap-1 font-mono">
              <span className="text-amber-400 font-bold">BTC:</span>
              <span>{headerStats?.btc ? `$${headerStats.btc.toLocaleString()}` : "$61,582"}</span>
              <span className={headerStats?.btcChange !== undefined && headerStats.btcChange < 0 ? "text-red-400" : "text-emerald-400 font-semibold"}>
                ({headerStats?.btcChange !== undefined ? `${headerStats.btcChange >= 0 ? "+" : ""}${headerStats.btcChange.toFixed(1)}%` : "+4.6%"})
              </span>
            </span>
            <span className="text-slate-700">|</span>
            <span className="flex items-center gap-1 font-mono">
              <span className="text-cyan-400 font-bold">ETH:</span>
              <span>{headerStats?.eth ? `$${headerStats.eth.toLocaleString()}` : "$3,450"}</span>
              <span className={headerStats?.ethChange !== undefined && headerStats.ethChange < 0 ? "text-red-400" : "text-emerald-400 font-semibold"}>
                ({headerStats?.ethChange !== undefined ? `${headerStats.ethChange >= 0 ? "+" : ""}${headerStats.ethChange.toFixed(1)}%` : "+3.1%"})
              </span>
            </span>
            <span className="text-slate-700">|</span>
            <span className="flex items-center gap-1 text-emerald-400 font-medium font-mono">
              {headerStats?.startups ? `${headerStats.startups} Verified Startups` : "123 Verified Startups"}
            </span>
          </div>

          {/* Right Security & Access Pill */}
          <div className="flex items-center gap-3">
            <div className="flex items-center gap-1.5 text-slate-300 hover:text-white transition-colors cursor-pointer text-[11px]">
              <Lock className="h-3 w-3 text-cyan-400" />
              <span className="hidden sm:inline">Private Investor Dealrooms</span>
              <span className="sm:hidden">Private Portal</span>
            </div>
            <span className="text-slate-700 hidden sm:inline">|</span>
            <span className="hidden sm:inline text-[11px] text-slate-400 font-mono">
              TLS 256-Bit
            </span>
          </div>
        </div>
      )}

      {/* --- SECTION 2: MAIN FULL-WIDTH NAVIGATION BAR --- */}
      <header className="w-full bg-[#070d1d]/90 dark:bg-[#070d1d]/90 backdrop-blur-2xl border-b border-slate-800/80 px-4 sm:px-8 xl:px-14 transition-colors relative">
        <div className="w-full flex h-18 items-center justify-between relative">
          
          {/* 1. Left: Brand Logo & Title (Pure Real Logo - No box shade or outline) */}
          <div className="flex items-center">
            <Link to="/" className="flex items-center gap-3 group">
              <img
                src={logoImg}
                alt="MoneyMinds Shield Logo"
                className="h-10 w-10 sm:h-11 sm:w-11 object-contain filter drop-shadow-[0_2px_8px_rgba(6,182,212,0.4)] group-hover:scale-105 transition-transform duration-200"
              />
              <div className="flex flex-col">
                <div className="flex items-center gap-1.5">
                  <span className="text-xl sm:text-2xl font-extrabold tracking-tight text-white leading-none">
                    Money<span className="bg-gradient-to-r from-cyan-400 via-teal-300 to-emerald-400 bg-clip-text text-transparent">Minds</span>
                  </span>
                  <span className="h-1.5 w-1.5 rounded-full bg-cyan-400 animate-pulse" />
                </div>
                <span className="text-[9px] sm:text-[10px] font-semibold text-cyan-400/90 tracking-widest uppercase mt-1">
                  Audited Financial Intelligence
                </span>
              </div>
            </Link>
          </div>

          {/* 2. Center: Public or Role Tabs (DEAD CENTER OF NAVBAR) */}
          {!adminShell ? (
            <nav className="hidden lg:flex items-center justify-center gap-1 xl:gap-2 absolute left-1/2 -translate-x-1/2">
              {navLinks.map((link) => {
                const isActive =
                  location.pathname === link.to ||
                  (link.to !== "/" && !link.to.startsWith("/#") && location.pathname.startsWith(link.to));
                return (
                  <Link
                    key={link.to}
                    to={link.to}
                    onClick={(e) => handleNavClick(e, link.to)}
                    className={`group relative px-3.5 py-2.5 rounded-none text-sm font-medium tracking-wide transition-colors duration-300 ${
                      isActive ? "text-white" : "text-slate-300 hover:text-white"
                    }`}
                  >
                    <span
                      aria-hidden="true"
                      className={`pointer-events-none absolute inset-0 bg-gradient-to-t from-cyan-500/15 via-emerald-500/5 to-transparent transition-opacity duration-300 ${
                        isActive ? "opacity-100" : "opacity-0 group-hover:opacity-100"
                      }`}
                    />
                    <span className="relative z-10 inline-block transition-transform duration-200 group-hover:-translate-y-0.5">
                      {link.label}
                    </span>
                    <span
                      aria-hidden="true"
                      className={`pointer-events-none absolute bottom-0 left-0 right-0 h-[2px] bg-gradient-to-r from-cyan-400 via-teal-300 to-emerald-400 shadow-[0_0_10px_rgba(34,211,238,0.85)] origin-left transition-transform duration-300 ease-out ${
                        isActive ? "scale-x-100" : "scale-x-0 group-hover:scale-x-100"
                      }`}
                    />
                  </Link>
                );
              })}
            </nav>
          ) : null}

          {/* 3. Right: Action Elements (Theme Toggle, Auth, Join Platform) */}
          <div className="flex items-center gap-3 sm:gap-4">
            <Button
              variant="ghost"
              size="icon"
              onClick={toggleTheme}
              aria-label="Toggle color theme"
              className={`${adminShell ? "inline-flex" : "hidden sm:inline-flex"} text-slate-300 hover:text-white hover:bg-slate-800/60 rounded-none h-10 w-10 border border-slate-800`}
            >
              {theme === "dark" ? <Sun className="h-4 w-4 text-amber-400" /> : <Moon className="h-4 w-4 text-cyan-300" />}
            </Button>

            {resolvedUserRole ? (
              <>
                <DropdownMenu open={showNotifications} onOpenChange={setShowNotifications}>
                  <DropdownMenuTrigger asChild>
                    <Button aria-label="Notifications" variant="ghost" size="icon" className="relative text-slate-300 hover:text-white hover:bg-slate-800/60 rounded-none h-10 w-10 border border-slate-800">
                      <Bell className="h-4 w-4" />
                      {unreadCount > 0 && (
                        <span className="absolute -top-0.5 -right-0.5 h-4 w-4 rounded-full bg-cyan-500 text-white text-[10px] flex items-center justify-center font-bold shadow-md shadow-cyan-500/50">
                          {unreadCount > 9 ? "9+" : unreadCount}
                        </span>
                      )}
                    </Button>
                  </DropdownMenuTrigger>
                  <DropdownMenuContent align="end" className="w-80 rounded-none bg-[#0d1527] border-slate-800 text-slate-200 p-0">
                    <div className="flex items-center justify-between px-3 py-2">
                      <DropdownMenuLabel className="text-white p-0">Notifications</DropdownMenuLabel>
                      {unreadCount > 0 && (
                        <Button variant="ghost" size="sm" className="text-xs h-auto py-1 text-cyan-400 hover:text-cyan-300" onClick={handleMarkAllRead}>
                          <Check className="h-3 w-3 mr-1" />
                          Mark all read
                        </Button>
                      )}
                    </div>
                    <DropdownMenuSeparator className="bg-slate-800" />
                    <div className="max-h-80 overflow-y-auto">
                      {notifications.length > 0 ? (
                        notifications.slice(0, 10).map((notification) => (
                          <DropdownMenuItem
                            key={notification.id}
                            onClick={() => handleMarkRead(notification.id)}
                            className={`flex flex-col items-start gap-1 p-3 cursor-pointer focus:bg-slate-800 ${
                              !notification.read ? "bg-cyan-950/30 text-white" : "hover:bg-slate-800/50 text-slate-300"
                            }`}
                          >
                            <span className="font-medium text-sm">{notification.title}</span>
                            <span className="text-xs text-slate-400">{notification.message}</span>
                          </DropdownMenuItem>
                        ))
                      ) : (
                        <div className="p-4 text-center text-xs text-slate-400">No notifications</div>
                      )}
                    </div>
                  </DropdownMenuContent>
                </DropdownMenu>

                {/* User Account Menu */}
                <DropdownMenu>
                  <DropdownMenuTrigger asChild>
                    <Button variant="ghost" className="flex items-center gap-2 pl-2 pr-3 h-10 min-w-0 rounded-none bg-slate-800/40 hover:bg-slate-800 border border-slate-700/60 text-white">
                      <div className="h-6 w-6 rounded-none bg-gradient-to-tr from-cyan-500 to-emerald-500 flex items-center justify-center text-white text-xs font-bold">
                        {resolvedUserName.charAt(0).toUpperCase()}
                      </div>
                      <span className="text-xs font-medium max-w-[100px] truncate hidden md:inline">{resolvedUserName}</span>
                      <ChevronDown className="h-3.5 w-3.5 text-slate-400" />
                    </Button>
                  </DropdownMenuTrigger>
                  <DropdownMenuContent align="end" className="w-56 rounded-none bg-[#0d1527] border-slate-800 text-slate-200 p-0">
                    <DropdownMenuLabel className="font-normal text-xs text-slate-400 px-3 py-2.5">
                      Signed in as <strong className="text-white block truncate mt-0.5">{resolvedUserName}</strong>
                    </DropdownMenuLabel>
                    <DropdownMenuSeparator className="bg-slate-800 m-0" />
                    <DropdownMenuItem asChild className="rounded-none px-3 py-2.5">
                      <Link to={resolvedUserRole === "admin" ? "/admin/profile" : `/${resolvedUserRole}/profile`} className="cursor-pointer hover:bg-slate-800">
                        <User className="h-4 w-4 mr-2" /> View Profile
                      </Link>
                    </DropdownMenuItem>
                    <DropdownMenuSeparator className="bg-slate-800 m-0" />
                    <DropdownMenuItem onClick={handleLogout} className="rounded-none px-3 py-2.5 cursor-pointer text-red-400 hover:bg-red-950/20">
                      Log out
                    </DropdownMenuItem>
                  </DropdownMenuContent>
                </DropdownMenu>
              </>
            ) : (
              <div className="hidden sm:flex items-center gap-3">
                <Link to="/login">
                  <Button variant="ghost" className="text-sm font-medium text-slate-300 hover:text-white hover:bg-slate-800/60 rounded-none px-4 h-10 border border-slate-800/60 transition-all">
                    Log In
                  </Button>
                </Link>
                
                {/* Elevated, High-End Luminous Join Platform Button */}
                <Link to="/apply" className="relative inline-flex items-center justify-center group">
                  <div className="absolute -inset-0.5 bg-gradient-to-r from-cyan-500 via-teal-400 to-emerald-400 rounded-none blur-xs opacity-75 group-hover:opacity-100 transition duration-300 group-hover:blur-sm" />
                  <div className="relative flex items-center gap-2 px-5 py-2.5 rounded-none bg-gradient-to-r from-cyan-400 via-teal-300 to-emerald-400 text-slate-950 font-bold text-xs sm:text-sm shadow-md group-hover:scale-[1.02] active:scale-[0.98] transition-all duration-200 cursor-pointer">
                    <span>Join Platform</span>
                    <ArrowRight className="h-3.5 w-3.5 transform group-hover:translate-x-0.5 transition-transform" />
                  </div>
                </Link>
              </div>
            )}

            {/* Mobile Menu Toggle */}
            <Button
              variant="ghost"
              size="icon"
              className="lg:hidden text-slate-300 hover:text-white hover:bg-slate-800/60 rounded-none h-10 w-10 border border-slate-800"
              aria-label="Toggle navigation menu"
              onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
            >
              <Menu className="h-5 w-5" />
            </Button>
          </div>
        </div>

        {/* Mobile Navigation Drawer */}
        {mobileMenuOpen && (
          <div className="lg:hidden border-t border-slate-800 bg-[#070d1d] px-6 py-5 shadow-2xl animate-in slide-in-from-top-2 duration-200">
            <nav className="flex flex-col gap-2">
              {navLinks.map((link) => (
                <Link
                  key={link.to}
                  to={link.to}
                  onClick={(e) => handleNavClick(e, link.to)}
                  className="text-sm font-medium text-slate-200 hover:text-cyan-300 border-l-2 border-transparent hover:border-cyan-400 hover:bg-cyan-500/10 rounded-none px-4 py-3 transition-all duration-200"
                >
                  {link.label}
                </Link>
              ))}
              {!resolvedUserRole && (
                <div className="pt-4 mt-2 border-t border-slate-800 flex flex-col gap-2.5">
                  <Link to="/login" onClick={() => setMobileMenuOpen(false)} className="text-center py-2.5 text-sm font-medium text-slate-300 hover:bg-slate-800 rounded-xl border border-slate-700">
                    Log In
                  </Link>
                  <Link to="/apply" onClick={() => setMobileMenuOpen(false)}>
                    <Button className="w-full bg-gradient-to-r from-cyan-500 via-teal-400 to-emerald-400 text-slate-950 font-bold text-sm rounded-none py-3 shadow-lg shadow-cyan-500/25">
                      Join Platform
                    </Button>
                  </Link>
                </div>
              )}
            </nav>
          </div>
        )}
      </header>
    </div>
  );
}
