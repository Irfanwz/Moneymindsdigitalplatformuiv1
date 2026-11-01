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
} from "lucide-react";
import { Header } from "../Header";
import { useAuth } from "@/app/contexts/AuthContext";
import { adminCan } from "../../../../shared/adminPermissions.js";

export const adminSections = [
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
];
export function AdminLayout({ children }: { children: ReactNode }) {
  const { user } = useAuth();
  const location = useLocation();
  const navigate = useNavigate();
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
                  <option key={s.path} value={`/admin/${s.path}`}>
                    {s.label}
                  </option>
                ))}
              <option value="/admin/profile">My profile & security</option>
            </select>
          </label>
          <nav
            aria-label="Admin sections"
            className="hidden lg:flex lg:flex-col gap-1 p-3 lg:px-4"
          >
            {adminSections
              .filter((s) => adminCan(user, s.permission))
              .map(({ path, label, icon: Icon }) => (
                <NavLink
                  key={path}
                  to={`/admin/${path}`}
                  className={({ isActive }) =>
                    `flex shrink-0 items-center gap-3 rounded-lg px-3 py-3 text-sm font-medium transition-colors ${isActive ? "bg-indigo-600 text-white shadow-sm" : "text-muted-foreground hover:bg-muted hover:text-foreground"}`
                  }
                >
                  <Icon className="h-4 w-4" />
                  {label}
                </NavLink>
              ))}
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
