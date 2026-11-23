import type { ReactNode } from "react";
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
} from "lucide-react";
import { Header } from "../Header";
import { useAuth } from "@/app/contexts/AuthContext";
import { adminCan } from "../../../../shared/adminPermissions.js";

export type AdminSection = {
  path: string;
  label: string;
  icon: any;
  permission: string;
  children?: { path: string; label: string; icon: any }[];
};

export const adminSections: AdminSection[] = [
  {
    path: "dashboard",
    label: "Overview",
    icon: LayoutDashboard,
    permission: "overview",
  },
  { path: "users", label: "Users", icon: Users, permission: "users.read" },
  {
    path: "reviews",
    label: "Due Diligence",
    icon: ShieldCheck,
    permission: "reviews",
  },
  {
    path: "agents",
    label: "AI Operations",
    icon: Activity,
    permission: "agents",
    children: [
      { path: "agents/verification", label: "Background Checks", icon: ShieldCheck },
      { path: "agents/due-diligence", label: "Due Diligence", icon: Search },
      { path: "agents/documents", label: "Document Verification", icon: FileCheck },
      { path: "agents/signals", label: "Signal Analysis", icon: BarChart3 },
      { path: "agents/predictions", label: "Predictions & Credibility", icon: TrendingUp },
      { path: "agents/research", label: "Research Agents", icon: Microscope },
    ],
  },
  { path: "content", label: "Content", icon: Layers, permission: "content" },
  {
    path: "payments",
    label: "Payments",
    icon: CreditCard,
    permission: "payments",
  },
  {
    path: "reports",
    label: "Reports & Audit",
    icon: ChartNoAxesCombined,
    permission: "reports",
  },
  {
    path: "settings",
    label: "Settings",
    icon: Settings,
    permission: "settings",
  },
  {
    path: "ai-config",
    label: "AI Config",
    icon: Cpu,
    permission: "settings",
  },
  {
    path: "token-report",
    label: "Token Report",
    icon: Flame,
    permission: "reports",
  },
];

export function AdminLayout({ children }: { children: ReactNode }) {
  const { user } = useAuth();
  const location = useLocation();
  const navigate = useNavigate();
  const currentPath = location.pathname.replace("/admin/", "");

  const section = adminSections.find(s => currentPath === s.path || currentPath.startsWith(s.path + "/"));
  const sectionTitle = section?.children?.find(s => currentPath === s.path)?.label || section?.label || "Account & security";

  return (
    <div className="admin-workspace min-h-screen bg-slate-50 dark:bg-[#070b14] text-slate-900 dark:text-slate-100 transition-colors">
      <Header userRole="admin" userName={user?.fullName} adminShell />
      <div className="mx-auto max-w-[1720px] lg:grid lg:grid-cols-[260px_minmax(0,1fr)]">
        <aside className="border-b lg:border-b-0 lg:border-r border-slate-200 dark:border-slate-800/80 bg-white dark:bg-[#070d1a] lg:sticky lg:top-16 lg:h-[calc(100vh-4rem)] flex flex-col shadow-xs transition-colors">
          <div className="hidden lg:block px-6 pt-6 pb-5 border-b border-slate-100 dark:border-slate-800/80 mb-2">
            <div className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-[10px] font-mono font-bold tracking-widest text-cyan-600 dark:text-cyan-400 bg-cyan-50 dark:bg-cyan-950/60 border border-cyan-200 dark:border-cyan-800/60 uppercase">
              <span className="h-1.5 w-1.5 rounded-full bg-cyan-500 animate-pulse" />
              Workspace
            </div>
            <p className="text-xl font-extrabold tracking-tight text-slate-900 dark:text-white mt-2">Administration</p>
            <div className="flex items-center gap-2 mt-1">
              <span className="text-xs text-slate-500 dark:text-slate-400 font-mono capitalize">
                {(user?.adminRole || "super_admin").replace("_", " ")}
              </span>
              <span className="h-1.5 w-1.5 rounded-full bg-emerald-500" />
            </div>
          </div>
          {/* Mobile: select dropdown */}
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
                    <option value={`/admin/${s.path}`}>{s.label}</option>
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
          {/* Desktop: sidebar nav with expandable children */}
          <nav
            aria-label="Admin sections"
            className="hidden lg:flex lg:flex-col gap-1 p-3 lg:px-4 overflow-y-auto"
          >
            {adminSections
              .filter((s) => adminCan(user, s.permission))
              .map(({ path, label, icon: Icon, children: subs }) => {
                const isParentActive = currentPath === path || currentPath.startsWith(path + "/");
                const isExpanded = subs && isParentActive;

                return (
                  <div key={path}>
                    <NavLink
                      to={`/admin/${path}`}
                      end={!!subs}
                      className={({ isActive }) => {
                        const active = isActive || (subs && isParentActive);
                        return `flex shrink-0 items-center gap-3 rounded-xl px-3.5 py-2.5 text-xs sm:text-sm font-semibold transition-all duration-200 ${
                          active
                            ? "bg-gradient-to-r from-cyan-500/15 via-teal-500/10 to-transparent dark:from-cyan-950/70 dark:via-teal-950/40 text-cyan-700 dark:text-cyan-300 border-l-[3px] border-cyan-500 dark:border-cyan-400 shadow-xs"
                            : "text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white hover:bg-slate-100/70 dark:hover:bg-slate-800/50 border-l-[3px] border-transparent"
                        }`;
                      }}
                    >
                      <Icon className={`h-4 w-4 ${isParentActive ? "text-cyan-600 dark:text-cyan-400" : "text-slate-400 dark:text-slate-500"}`} />
                      <span className="flex-1">{label}</span>
                      {subs && (
                        <ChevronDown
                          className={`h-3.5 w-3.5 transition-transform ${isExpanded ? "rotate-180 text-cyan-500" : "text-slate-400"}`}
                        />
                      )}
                    </NavLink>
                    {isExpanded && subs && (
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
                            {subLabel}
                          </NavLink>
                        ))}
                      </div>
                    )}
                  </div>
                );
              })}
          </nav>
          <div className="hidden lg:block mt-auto p-4 border-t border-slate-100 dark:border-slate-800/80">
            <div className="rounded-xl border border-slate-200/90 dark:border-slate-800 bg-slate-50/80 dark:bg-[#0c1424] p-3.5 shadow-sm">
              <div className="flex items-center gap-2.5 mb-2">
                <div className="h-8 w-8 rounded-lg bg-gradient-to-tr from-cyan-500 to-emerald-500 text-slate-950 flex items-center justify-center font-bold text-xs shadow-sm">
                  AD
                </div>
                <div>
                  <p className="text-xs font-bold text-slate-900 dark:text-white leading-tight">
                    {user?.fullName || "Administrator"}
                  </p>
                  <p className="text-[10px] font-mono text-emerald-600 dark:text-emerald-400 font-medium">
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
          </div>
        </aside>
        <div className="min-w-0">
          <div className="flex items-center justify-between gap-4 border-b border-slate-200 dark:border-slate-800/80 bg-white/80 dark:bg-[#070d1a]/90 backdrop-blur-md px-4 py-3 sm:px-7 lg:px-8">
            <nav aria-label="Breadcrumb" className="flex items-center gap-2 text-xs text-slate-500 dark:text-slate-400 font-mono">
              <span className="hover:text-slate-900 dark:hover:text-white transition-colors">Administration</span>
              <span aria-hidden="true" className="text-slate-400">/</span>
              <span aria-current="page" className="font-bold text-cyan-600 dark:text-cyan-400">{sectionTitle}</span>
            </nav>
            <span className="inline-flex items-center gap-2 text-xs font-mono font-medium text-emerald-600 dark:text-emerald-400 bg-emerald-50 dark:bg-emerald-950/40 border border-emerald-200 dark:border-emerald-800/50 px-3 py-1 rounded-full">
              <span className="h-1.5 w-1.5 rounded-full bg-emerald-500 animate-pulse" />
              Restricted Workspace
            </span>
          </div>
          <main id="main-content" className="min-w-0 px-4 py-6 sm:px-7 lg:p-8">
            {children}
          </main>
        </div>
      </div>
    </div>
  );
}
