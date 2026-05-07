import { useNavigate } from "react-router-dom";
import { Building2, TrendingUp, Users } from "lucide-react";

import { useAuth } from "@/app/contexts/AuthContext";
import { Button } from "@/app/components/ui/button";
import { Card } from "@/app/components/ui/card";
import type { AppRole } from "@/app/types/auth";

const roleMeta: Record<AppRole, {
  title: string;
  description: string;
  icon: typeof Building2;
  accent: string;
  buttonClassName: string;
}> = {
  startup: {
    title: "Startup",
    description: "Build credibility and find investors",
    icon: Building2,
    accent: "bg-blue-100 text-blue-700",
    buttonClassName: "bg-slate-900 hover:bg-slate-800 text-white",
  },
  investor: {
    title: "Investor",
    description: "Discover verified startups",
    icon: TrendingUp,
    accent: "bg-slate-100 text-slate-800",
    buttonClassName: "bg-slate-900 hover:bg-slate-800 text-white",
  },
  advisor: {
    title: "Financial Advisor",
    description: "Share expertise and build reputation",
    icon: Users,
    accent: "bg-fuchsia-100 text-fuchsia-700",
    buttonClassName: "bg-slate-900 hover:bg-slate-800 text-white",
  },
};

export function RoleSelectionPage() {
  const navigate = useNavigate();
  const { user, selectRole } = useAuth();
  const approvedRoles = user?.approvedRoles ?? [];

  if (!user) {
    return null;
  }

  return (
    <div className="min-h-screen bg-background px-6 py-16">
      <div className="mx-auto max-w-7xl">
        <div className="mb-10 text-center">
          <h1 className="text-4xl font-semibold tracking-tight">Choose how you want to enter</h1>
          <p className="mt-3 text-muted-foreground">
            Your profile has been approved. Select one of your granted roles to continue.
          </p>
        </div>

        <div className="grid gap-6 lg:grid-cols-3">
          {approvedRoles.map((role) => {
            const meta = roleMeta[role];
            const Icon = meta.icon;

            return (
              <Card key={role} className="rounded-[24px] p-10 shadow-sm">
                <div className={`mx-auto mb-14 inline-flex rounded-2xl p-5 ${meta.accent}`}>
                  <Icon className="h-10 w-10" />
                </div>
                <div className="text-center">
                  <h2 className="text-2xl font-semibold">{meta.title}</h2>
                  <p className="mt-5 text-lg text-muted-foreground">{meta.description}</p>
                </div>
                <Button
                  className={`mt-16 h-12 w-full text-lg ${meta.buttonClassName}`}
                  onClick={() => {
                    selectRole(role);
                    navigate(`/${role}/dashboard`);
                  }}
                >
                  Login as {meta.title}
                </Button>
              </Card>
            );
          })}
        </div>
      </div>
    </div>
  );
}
