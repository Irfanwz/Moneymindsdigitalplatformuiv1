import { useState, useEffect, type ReactNode } from "react";
import { NavLink, Link, useLocation, useNavigate } from "react-router-dom";
import {
  LayoutDashboard,
  Users,
  ShieldCheck,
  Activity,
  Layers,
  CreditCard,
  ChartNoAxesCombined,
  Settings,
  ArrowUpRight,
  Cpu,
  Flame,
  ChevronDown,
  Search,
  FileCheck,
  BarChart3,
  TrendingUp,
  Microscope,
  PanelLeftClose,
  PanelLeftOpen,
  Building2,
} from "lucide-react";
import { Header } from "../Header";
import { useAuth } from "@/app/contexts/AuthContext";
import { adminCan } from "../../../../shared/adminPermissions.js";
import { request } from "@/app/lib/api";
import { AdminCommandPalette } from "./AdminCommandPalette";

export type AdminSection = {
  path: string;
  label: string;
  icon: any;
  permission: string;
  category?: string;
  badgeKey?: "pendingUsers" | "reviewsNeeded" | "failedAgents";
  badgeVariant?: "cyan" | "amber" | "rose";
  children?: { path: string; label: string; icon: any }[];
};

export const adminSections: AdminSection[] = [
  {
    path: "dashboard",
    label: "Executive Overview",
    icon: LayoutDashboard,
    permission: "overview",
    category: "Core Operations",
  },
  {
    path: "users",
    label: "User Directory",
    icon: Users,
    permission: "users.read",
    category: "Core Operations",
    badgeKey: "pendingUsers",
    badgeVariant: "cyan",
  },
  {
    path: "ecosystem",
    label: "Ecosystem Hub",
    icon: Building2,
    permission: "users.read",
    category: "Core Operations",
  },
  {
    path: "reviews",
    label: "Applicant Vetting",
    icon: ShieldCheck,
    permission: "reviews",
    category: "Core Operations",
    badgeKey: "reviewsNeeded",
    badgeVariant: "amber",
  },
  {
    path: "agents",
    label: "AI Diligence Operations",
    icon: Activity,
    permission: "agents",
    category: "AI & Intelligence",
    badgeKey: "failedAgents",
    badgeVariant: "rose",
    children: [
      { path: "agents/verification", label: "Background Check Agents", icon: ShieldCheck },
      { path: "agents/due-diligence", label: "Venture Due Diligence", icon: Search },
      { path: "agents/documents", label: "Document Verification", icon: FileCheck },
      { path: "agents/signals", label: "Market Signal Analysis", icon: BarChart3 },
      { path: "agents/predictions", label: "Prediction & Accuracy Audit", icon: TrendingUp },
      { path: "agents/research", label: "Sector Research Intelligence", icon: Microscope },
    ],
  },
  {
    path: "content",
    label: "Content Moderation",
    icon: Layers,
    permission: "content",
    category: "AI & Intelligence",
  },
  {
    path: "payments",
    label: "Transactions & Escrow",
    icon: CreditCard,
    permission: "payments",
    category: "Finance & Governance",
  },
  {
    path: "reports",
    label: "Audit & Compliance Reports",
    icon: ChartNoAxesCombined,
    permission: "reports",
    category: "Finance & Governance",
  },
  {
    path: "settings",
    label: "Platform Governance",
    icon: Settings,
    permission: "settings",
    category: "Finance & Governance",
  },
  {
    path: "ai-config",
    label: "AI Engine Configuration",
    icon: Cpu,
    permission: "settings",
    category: "Finance & Governance",
  },
  {
    path: "token-report",
    label: "Token Usage & Costs",
    icon: Flame,
    permission: "reports",
    category: "Finance & Governance",
  },
];

interface AdminBadgeCounts {
  pendingUsers: number;
  reviewsNeeded: number;
  failedAgents: number;
}

export function AdminLayout({ children }: { children: ReactNode }) {
  const { user } = useAuth();
  const location = useLocation();
  const navigate = useNavigate();
  const currentPath = location.pathname.replace("/admin/", "");
  const [expandedSections, setExpandedSections] = useState<Record<string, boolean>>({});

  // Collapsible compact sidebar state (persisted)
  const [collapsed, setCollapsed] = useState<boolean>(() => {
    try {
      return localStorage.getItem("mm_admin_sidebar_collapsed") === "true";
    } catch {
      return false;
    }
  });

  const toggleSidebar = () => {
    setCollapsed((prev) => {
      const next = !prev;
      try {
        localStorage.setItem("mm_admin_sidebar_collapsed", String(next));
      } catch {}
      return next;
    });
  };

  // Command palette state & shortcut listener
  const [commandOpen, setCommandOpen] = useState(false);

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if ((e.key === "k" || e.key === "K") && (e.metaKey || e.ctrlKey)) {
        e.preventDefault();
        setCommandOpen((prev) => !prev);
      }
      if ((e.key === "b" || e.key === "B") && (e.metaKey || e.ctrlKey)) {
        e.preventDefault();
        toggleSidebar();
      }
    };
    document.addEventListener("keydown", handleKeyDown);
    return () => document.removeEventListener("keydown", handleKeyDown);
  }, []);

  // Live dynamic badge counts from overview API
  const [counts, setCounts] = useState<AdminBadgeCounts>({
    pendingUsers: 0,
    reviewsNeeded: 0,
    failedAgents: 0,
  });

  useEffect(() => {
    let active = true;
    const loadCounts = async () => {
      try {
        const res = await request<any>("/api/admin/console/overview");
        if (active && res) {
          setCounts({
            pendingUsers: res.users?.pending ?? 0,
            reviewsNeeded: res.backgroundChecks?.review ?? 0,
            failedAgents: res.agents?.failed ?? 0,
          });
        }
      } catch {
        // Fallback silently if overview is restricted
      }
    };

    loadCounts();
    const timer = setInterval(loadCounts, 30000);
    return () => {
      active = false;
      clearInterval(timer);
    };
  }, []);

  const section = adminSections.find(
    (s) => currentPath === s.path || currentPath.startsWith(s.path + "/")
  );
  const sectionTitle =
    section?.children?.find((s) => currentPath === s.path)?.label ||
    section?.label ||
    "Account & security";

  const getBadgeValue = (key?: "pendingUsers" | "reviewsNeeded" | "failedAgents") => {
    if (!key) return 0;
    return counts[key] ?? 0;
  };

  const getBadgeClasses = (variant?: "cyan" | "amber" | "rose") => {
    switch (variant) {
      case "amber":
        return "bg-amber-500/15 text-amber-700 dark:text-amber-400 border border-amber-500/30";
      case "rose":
        return "bg-rose-500/15 text-rose-700 dark:text-rose-400 border border-rose-500/30";
      case "cyan":
      default:
        return "bg-cyan-500/15 text-cyan-700 dark:text-cyan-400 border border-cyan-500/30";
    }
  };

  return (
    <div className="admin-workspace min-h-screen bg-slate-50 dark:bg-[#070b14] text-slate-900 dark:text-slate-100 transition-colors w-full">
      <Header userRole="admin" userName={user?.fullName} adminShell />

      {/* Global Command Palette */}
      <AdminCommandPalette open={commandOpen} onOpenChange={setCommandOpen} />

      <div
        className={`w-full transition-all duration-300 min-h-[calc(100vh-4rem)] lg:grid ${
          collapsed
            ? "lg:grid-cols-[72px_minmax(0,1fr)]"
            : "lg:grid-cols-[265px_minmax(0,1fr)] xl:grid-cols-[280px_minmax(0,1fr)]"
        }`}
      >
        {/* Sidebar */}
        <aside
          className={`border-b lg:border-b-0 lg:border-r border-slate-200 dark:border-slate-800/80 bg-white dark:bg-[#070d1a] lg:sticky lg:top-16 lg:h-[calc(100vh-4rem)] flex flex-col shadow-xs transition-all duration-300 ${
            collapsed ? "lg:w-[72px]" : "w-full"
          }`}
        >
          {/* Sidebar Top Header with Collapse Toggle */}
          <div className="hidden lg:block px-4 pt-5 pb-4 border-b border-slate-100 dark:border-slate-800/80 mb-2">
            <div className="flex items-center justify-between">
              {!collapsed && (
                <div className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-[10px] font-mono font-bold tracking-widest text-cyan-600 dark:text-cyan-400 bg-cyan-50 dark:bg-cyan-950/60 border border-cyan-200 dark:border-cyan-800/60 uppercase">
                  <span className="h-1.5 w-1.5 rounded-full bg-cyan-500 animate-pulse" />
                  Workspace
                </div>
              )}
              <button
                onClick={toggleSidebar}
                className="p-1.5 rounded-none text-slate-400 hover:text-cyan-600 dark:hover:text-cyan-400 hover:bg-slate-100 dark:hover:bg-slate-800/70 transition-all cursor-pointer ml-auto"
                title={collapsed ? "Expand sidebar (⌘B)" : "Collapse sidebar (⌘B)"}
              >
                {collapsed ? (
                  <PanelLeftOpen className="h-4 w-4 text-cyan-500" />
                ) : (
                  <PanelLeftClose className="h-4 w-4" />
                )}
              </button>
            </div>

            {!collapsed ? (
              <div className="mt-2.5">
                <p className="text-xl font-extrabold tracking-tight text-slate-900 dark:text-white leading-tight">
                  Administration
                </p>
                <div className="flex items-center gap-2 mt-1">
                  <span className="text-xs text-slate-500 dark:text-slate-400 font-mono capitalize">
                    {(user?.adminRole || "super_admin").replace("_", " ")}
                  </span>
                  <span className="h-1.5 w-1.5 rounded-full bg-emerald-500" />
                </div>

                {/* Quick Search Trigger in Sidebar */}
                <button
                  onClick={() => setCommandOpen(true)}
                  className="mt-3.5 w-full flex items-center justify-between px-3 py-1.5 text-xs text-slate-400 hover:text-slate-900 dark:hover:text-white bg-slate-50 dark:bg-slate-900/60 border border-slate-200 dark:border-slate-800 rounded-none hover:border-cyan-500/40 transition-all cursor-pointer shadow-2xs group"
                >
                  <span className="flex items-center gap-2">
                    <Search className="h-3.5 w-3.5 text-slate-400 group-hover:text-cyan-500 transition-colors" />
                    <span>Quick search...</span>
                  </span>
                  <kbd className="font-mono text-[10px] text-slate-500 dark:text-slate-400 bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded px-1.5 py-0.5">
                    ⌘K
                  </kbd>
                </button>
              </div>
            ) : (
              <div className="mt-2 flex justify-center">
                <button
                  onClick={() => setCommandOpen(true)}
                  className="p-2 rounded-none text-slate-400 hover:text-cyan-500 hover:bg-slate-100 dark:hover:bg-slate-800/70 transition-all cursor-pointer"
                  title="Quick search (⌘K)"
                >
                  <Search className="h-4 w-4 text-cyan-500" />
                </button>
              </div>
            )}
          </div>

          {/* Mobile: Select dropdown */}
          <label className="lg:hidden p-4 flex items-center gap-3 text-sm text-slate-600 dark:text-slate-400">
            Workspace
            <select
              aria-label="Admin workspace"
              className="flex-1 min-w-0 rounded-xl border border-slate-200 dark:border-slate-800 bg-background p-2 text-foreground font-mono text-xs"
              value={location.pathname}
              onChange={(e) => navigate(e.target.value)}
            >
              {adminSections
                .filter((s) => adminCan(user, s.permission))
                .map((s) => (
                  <optgroup key={s.path} label={s.children ? s.label : undefined}>
                    <option value={`/admin/${s.path}`}>
                      {s.label}
                      {s.badgeKey && counts[s.badgeKey] > 0
                        ? ` (${counts[s.badgeKey]})`
                        : ""}
                    </option>
                    {s.children?.map((c) => (
                      <option key={c.path} value={`/admin/${c.path}`}>
                        {"  "}{c.label}
                      </option>
                    ))}
                  </optgroup>
                ))}
              <option value="/admin/profile">My profile & security</option>
            </select>
          </label>

          {/* Desktop Navigation Links */}
          <nav
            aria-label="Admin sections"
            className={`hidden lg:flex lg:flex-col gap-1 overflow-y-auto ${
              collapsed ? "p-2 items-center" : "p-3 lg:px-4"
            }`}
          >
            {adminSections
              .filter((s) => adminCan(user, s.permission))
              .map(
                (
                  { path, label, icon: Icon, category, badgeKey, badgeVariant, children: subs },
                  index,
                  filteredList
                ) => {
                  const isParentActive =
                    currentPath === path || currentPath.startsWith(path + "/");
                  const isExpanded = expandedSections[path] ?? isParentActive;
                  const isFirstInCategory =
                    index === 0 || filteredList[index - 1].category !== category;
                  const badgeValue = getBadgeValue(badgeKey);

                  return (
                    <div key={path} className={collapsed ? "w-full flex flex-col items-center" : "w-full"}>
                      {/* Section Category Header (when expanded) */}
                      {!collapsed && isFirstInCategory && category && (
                        <div className="text-[10px] font-mono font-bold uppercase tracking-wider text-slate-400 dark:text-slate-500 px-3 pt-3.5 pb-1 select-none">
                          {category}
                        </div>
                      )}

                      <div className="relative">
                        <NavLink
                          to={`/admin/${path}`}
                          end={!!subs}
                          title={collapsed ? `${label}${badgeValue > 0 ? ` (${badgeValue})` : ""}` : undefined}
                          className={({ isActive }) => {
                            const active = isActive || (subs && isParentActive);
                            return `flex items-center transition-all duration-200 group relative ${
                              collapsed
                                ? `justify-center w-11 h-11 rounded-xl mb-1 ${
                                    active
                                      ? "bg-cyan-500/15 text-cyan-600 dark:text-cyan-400 ring-2 ring-cyan-500 shadow-sm"
                                      : "text-slate-500 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white hover:bg-slate-100 dark:hover:bg-slate-800/60"
                                  }`
                                : `shrink-0 gap-3 rounded-xl px-3.5 py-2.5 ${subs ? "pr-12" : ""} text-xs sm:text-sm font-semibold ${
                                    active
                                      ? "bg-gradient-to-r from-cyan-500/15 via-teal-500/10 to-transparent dark:from-cyan-950/70 dark:via-teal-950/40 text-cyan-700 dark:text-cyan-300 border-l-[3px] border-cyan-500 dark:border-cyan-400 shadow-xs"
                                      : "text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white hover:bg-slate-100/70 dark:hover:bg-slate-800/50 border-l-[3px] border-transparent"
                                  }`
                            }`;
                          }}
                        >
                          <div className="relative flex items-center justify-center">
                            <Icon
                              className={`h-4 w-4 ${
                                isParentActive
                                  ? "text-cyan-600 dark:text-cyan-400"
                                  : "text-slate-400 dark:text-slate-500 group-hover:text-slate-700 dark:group-hover:text-slate-300"
                              }`}
                            />
                            {/* Compact mode badge indicator */}
                            {collapsed && badgeValue > 0 && (
                              <span
                                className={`absolute -top-2 -right-2 flex h-4 min-w-4 items-center justify-center rounded-full text-[9px] font-bold font-mono px-1 shadow-sm ring-2 ring-white dark:ring-[#070d1a] ${
                                  badgeVariant === "amber"
                                    ? "bg-amber-500 text-slate-950"
                                    : badgeVariant === "rose"
                                    ? "bg-rose-500 text-white"
                                    : "bg-cyan-500 text-slate-950"
                                }`}
                              >
                                {badgeValue}
                              </span>
                            )}
                          </div>

                          {!collapsed && (
                            <>
                              <span className="flex-1 truncate">{label}</span>

                              {/* Expanded badge pill */}
                              {badgeValue > 0 && (
                                <span
                                  className={`px-2 py-0.5 rounded-full text-[10px] font-mono font-bold tracking-tight ${getBadgeClasses(
                                    badgeVariant
                                  )}`}
                                >
                                  {badgeValue}
                                </span>
                              )}
                            </>
                          )}
                        </NavLink>
                        {!collapsed && subs && (
                          <button
                            type="button"
                            aria-label={`${isExpanded ? "Collapse" : "Expand"} ${label}`}
                            aria-expanded={isExpanded}
                            onClick={() =>
                              setExpandedSections((previous) => ({
                                ...previous,
                                [path]: !(previous[path] ?? isParentActive),
                              }))
                            }
                            className="absolute right-1 top-1/2 flex h-8 w-9 -translate-y-1/2 items-center justify-center rounded-lg text-slate-400 hover:bg-slate-200/70 dark:hover:bg-slate-800"
                          >
                            <ChevronDown
                              aria-hidden="true"
                              className={`h-3.5 w-3.5 transition-transform ${isExpanded ? "rotate-180 text-cyan-500" : ""}`}
                            />
                          </button>
                        )}
                      </div>

                      {/* Expandable sub-pages (when expanded) */}
                      {!collapsed && isExpanded && subs && (
                        <div className="ml-5 mt-1 mb-1.5 flex flex-col gap-1 border-l-2 border-slate-200 dark:border-slate-800 pl-3">
                          {subs.map(({ path: subPath, label: subLabel, icon: SubIcon }) => (
                            <NavLink
                              key={subPath}
                              to={`/admin/${subPath}`}
                              className={({ isActive }) =>
                                `flex items-center gap-2 rounded-lg px-2.5 py-1.5 text-xs font-medium transition-colors ${
                                  isActive
                                    ? "bg-cyan-50 dark:bg-cyan-950/50 text-cyan-700 dark:text-cyan-300 font-semibold"
                                    : "text-slate-500 dark:text-slate-400 hover:bg-slate-100/60 dark:hover:bg-slate-800/50 hover:text-slate-900 dark:hover:text-white"
                                }`
                              }
                            >
                              <SubIcon className="h-3.5 w-3.5 text-cyan-500/80" />
                              <span className="truncate">{subLabel}</span>
                            </NavLink>
                          ))}
                        </div>
                      )}
                    </div>
                  );
                }
              )}
          </nav>

          {/* Sidebar Footer User Card */}
          <div
            className={`hidden lg:block mt-auto border-t border-slate-100 dark:border-slate-800/80 ${
              collapsed ? "p-2" : "p-4"
            }`}
          >
            {!collapsed ? (
              <div className="rounded-xl border border-slate-200/90 dark:border-slate-800 bg-slate-50/80 dark:bg-[#0c1424] p-3.5 shadow-sm">
                <div className="flex items-center gap-2.5 mb-2">
                  <div className="h-8 w-8 rounded-lg bg-gradient-to-tr from-cyan-500 to-emerald-500 text-slate-950 flex items-center justify-center font-bold text-xs shadow-sm">
                    {(user?.fullName || "AD")[0].toUpperCase()}
                  </div>
                  <div className="min-w-0">
                    <p className="text-xs font-bold text-slate-900 dark:text-white leading-tight truncate">
                      {user?.fullName || "Administrator"}
                    </p>
                    <p className="text-[10px] font-mono text-emerald-600 dark:text-emerald-400 font-medium truncate">
                      Restricted Access
                    </p>
                  </div>
                </div>
                <Link
                  to="/admin/profile"
                  className="mt-2 text-xs font-semibold text-cyan-600 dark:text-cyan-400 hover:text-cyan-500 flex items-center justify-between pt-2 border-t border-slate-200/60 dark:border-slate-800/60"
                >
                  <span>Account &amp; Security</span>
                  <ArrowUpRight className="h-3.5 w-3.5" />
                </Link>
              </div>
            ) : (
              <div className="flex justify-center">
                <Link
                  to="/admin/profile"
                  className="h-10 w-10 rounded-xl bg-gradient-to-tr from-cyan-500 to-emerald-500 text-slate-950 flex items-center justify-center font-bold text-xs shadow-sm hover:scale-105 transition-transform"
                  title="Account & Security"
                >
                  {(user?.fullName || "AD")[0].toUpperCase()}
                </Link>
              </div>
            )}
          </div>
        </aside>

        {/* Main Content Area */}
        <div className="min-w-0 w-full flex flex-col">
          {/* Top Header / Breadcrumb Bar with Quick Search Trigger */}
          <div className="flex items-center justify-between gap-4 border-b border-slate-200 dark:border-slate-800/80 bg-white/80 dark:bg-[#070d1a]/90 backdrop-blur-md px-4 py-3 sm:px-6 lg:px-8 xl:px-10">
            <div className="flex items-center gap-3 min-w-0">
              <nav
                aria-label="Breadcrumb"
                className="flex items-center gap-2 text-xs text-slate-500 dark:text-slate-400 font-mono"
              >
                <span className="hover:text-slate-900 dark:hover:text-white transition-colors">
                  Administration
                </span>
                <span aria-hidden="true" className="text-slate-400">
                  /
                </span>
                <span
                  aria-current="page"
                  className="font-bold text-cyan-600 dark:text-cyan-400 truncate"
                >
                  {sectionTitle}
                </span>
              </nav>
            </div>

            <div className="flex items-center gap-3">
              {/* Quick Command Palette Button */}
              <button
                onClick={() => setCommandOpen(true)}
                className="inline-flex items-center gap-2 rounded-none border border-slate-200/90 dark:border-slate-800 bg-slate-100/70 dark:bg-slate-900/60 hover:bg-slate-200/60 dark:hover:bg-slate-800/80 px-3 py-1.5 text-xs text-slate-500 hover:text-slate-900 dark:text-slate-400 dark:hover:text-white transition-all shadow-xs hover:border-cyan-500/40 cursor-pointer"
                title="Open Command Palette (⌘K)"
              >
                <Search className="h-3.5 w-3.5 text-cyan-500" />
                <span className="font-medium hidden md:inline">Quick search &amp; commands...</span>
                <kbd className="pointer-events-none inline-flex h-4.5 select-none items-center gap-0.5 rounded border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 px-1.5 font-mono text-[10px] font-semibold text-slate-600 dark:text-slate-300 shadow-2xs">
                  ⌘K
                </kbd>
              </button>

              <span className="inline-flex items-center gap-2 text-xs font-mono font-medium text-emerald-600 dark:text-emerald-400 bg-emerald-50 dark:bg-emerald-950/40 border border-emerald-200 dark:border-emerald-800/50 px-3 py-1 rounded-full whitespace-nowrap">
                <span className="h-1.5 w-1.5 rounded-full bg-emerald-500 animate-pulse" />
                Restricted Workspace
              </span>
            </div>
          </div>

          <main id="main-content" className="min-w-0 w-full flex-1 px-4 py-6 sm:px-6 lg:px-8 xl:px-10 2xl:px-12">
            {children}
          </main>
        </div>
      </div>
    </div>
  );
}
