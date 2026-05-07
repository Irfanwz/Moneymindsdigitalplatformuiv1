import { ReactNode } from "react";
import { Header } from "@/app/components/Header";

interface DashboardLayoutProps {
  userRole: "startup" | "investor" | "advisor" | "admin";
  userName: string;
  children: ReactNode;
}

export function DashboardLayout({ userRole, userName, children }: DashboardLayoutProps) {
  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-slate-100 to-slate-50 dark:from-slate-950 dark:via-slate-900 dark:to-slate-950">
      <Header userRole={userRole} userName={userName} />
      <div className="container mx-auto px-6 py-8">
        {children}
      </div>
    </div>
  );
}
