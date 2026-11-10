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

  return (
    <div className="min-h-screen bg-slate-50 dark:bg-background">
      <Header userRole="admin" userName={user?.fullName} adminShell />
      <div className="mx-auto max-w-[1600px] lg:grid lg:grid-cols-[232px_minmax(0,1fr)]">
        <aside className="border-b lg:border-b-0 lg:border-r bg-card lg:sticky lg:top-16 lg:h-[calc(100vh-4rem)] flex flex-col">
          <div className="hidden lg:block px-6 pt-8 pb-6">
            <p className="text-xs font-semibold tracking-widest text-muted-foreground uppercase">
              Workspace
            </p>
            <p className="font-semibold mt-2">Administration</p>
            <p className="text-xs text-muted-foreground mt-1 capitalize">
              {(user?.adminRole || "super_admin").replace("_", " ")}
            </p>
          </div>
          {/* Mobile: select dropdown */}
          <label className="lg:hidden p-4 flex items-center gap-3 text-sm text-muted-foreground">
            Workspace
            <select
              aria-label="Admin workspace"
              className="flex-1 min-w-0 rounded-lg border bg-background p-2 text-foreground"
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
                      className={({ isActive }) =>
                        `flex shrink-0 items-center gap-3 rounded-lg px-3 py-3 text-sm font-medium transition-colors ${
                          isActive || (subs && isParentActive)
                            ? "bg-indigo-600 text-white shadow-sm"
                            : "text-muted-foreground hover:bg-muted hover:text-foreground"
                        }`
                      }
                    >
                      <Icon className="h-4 w-4" />
                      <span className="flex-1">{label}</span>
                      {subs && (
                        <ChevronDown
                          className={`h-3.5 w-3.5 transition-transform ${isExpanded ? "rotate-180" : ""}`}
                        />
                      )}
                    </NavLink>
                    {isExpanded && subs && (
                      <div className="ml-4 mt-1 mb-1 flex flex-col gap-0.5 border-l pl-3">
                        {subs.map(({ path: subPath, label: subLabel, icon: SubIcon }) => (
                          <NavLink
                            key={subPath}
                            to={`/admin/${subPath}`}
                            className={({ isActive }) =>
                              `flex items-center gap-2.5 rounded-md px-2.5 py-2 text-xs font-medium transition-colors ${
                                isActive
                                  ? "bg-indigo-50 text-indigo-700 dark:bg-indigo-950/40 dark:text-indigo-300"
                                  : "text-muted-foreground hover:bg-muted hover:text-foreground"
                              }`
                            }
                          >
                            <SubIcon className="h-3.5 w-3.5" />
                            {subLabel}
                          </NavLink>
                        ))}
                      </div>
                    )}
                  </div>
                );
              })}
          </nav>
          <div className="hidden lg:block mt-auto p-5">
            <div className="rounded-xl border p-4">
              <p className="text-sm font-medium">Your administrator account</p>
              <Link
                to="/admin/profile"
                className="mt-3 text-sm text-indigo-600 dark:text-indigo-300 flex items-center gap-2"
              >
                View profile <ArrowUpRight className="h-4 w-4" />
              </Link>
            </div>
          </div>
        </aside>
        <main id="main-content" className="min-w-0 px-4 py-6 sm:px-7 lg:p-8">
          {children}
        </main>
      </div>
    </div>
  );
}
