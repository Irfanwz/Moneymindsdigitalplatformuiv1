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
      <div className="w-full px-4 py-6 sm:px-8 sm:py-8 xl:px-14">
        {children}
      </div>
    </div>
  );
}
