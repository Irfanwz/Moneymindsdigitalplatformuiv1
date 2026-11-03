import { useEffect, useState } from "react";
import { Navigate, Outlet, useLocation } from "react-router-dom";

import { useAuth } from "@/app/contexts/AuthContext";
import { getAdvisorProfile, getInvestorProfile, getStartupProfile } from "@/app/lib/api";
import { isProfileComplete } from "@/app/lib/profile-complete";
import type { AppRole } from "@/app/types/auth";

function GuardLoadingScreen() {
  return (
    <div className="min-h-screen bg-background flex items-center justify-center p-6">
      <div className="text-center">
        <div className="text-xl font-semibold mb-2">Loading your session</div>
        <p className="text-muted-foreground">Please wait while we verify access.</p>
      </div>
    </div>
  );
}

export function RequireSignedIn() {
  const { isLoading, session, user } = useAuth();
  const location = useLocation();

  if (isLoading) return <GuardLoadingScreen />;
  if (!session || !user) return <Navigate to="/login" replace state={{ from: location.pathname + location.search }} />;
  if (user.isAdmin) return <Navigate to="/admin/dashboard" replace />;
  if (user.status !== "approved") return <Navigate to="/login" replace />;

  return <Outlet />;
}

export function RequireAdmin() {
  const { isLoading, session, user } = useAuth();
  const location = useLocation();

  if (isLoading) return <GuardLoadingScreen />;
  if (!session || !user) return <Navigate to="/login?mode=admin" replace state={{ from: location.pathname }} />;
  if (!user.isAdmin) return <Navigate to="/choose-role" replace />;

  return <Outlet />;
}

export function RequireRole({ role }: { role: AppRole }) {
  const { isLoading, session, user } = useAuth();
  const location = useLocation();
  const [checkState, setCheckState] = useState<"pending" | "complete" | "incomplete">("pending");

  useEffect(() => {
    if (isLoading || !session || !user) return;
    if (!user.approvedRoles.includes(role)) { setCheckState("complete"); return; } // will redirect below

    // Skip profile check if already on the edit-profile page
    if (location.pathname.includes("edit-profile")) { setCheckState("complete"); return; }

    async function checkProfile() {
      try {
        let profile = null;
        if (role === "advisor") {
          const res = await getAdvisorProfile(session!.token ?? "").catch(() => null);
          profile = res?.profile ?? null;
        } else if (role === "startup") {
          const res = await getStartupProfile(session!.token ?? "").catch(() => null);
          profile = res?.profile ?? null;
        } else if (role === "investor") {
          const res = await getInvestorProfile(session!.token ?? "").catch(() => null);
          profile = res?.profile ?? null;
        }
        setCheckState(isProfileComplete(role, profile) ? "complete" : "incomplete");
      } catch {
        setCheckState("complete"); // fail open — don't block on network error
      }
    }

    checkProfile();
  }, [isLoading, session, user, role, location.pathname]);

  if (isLoading || checkState === "pending") return <GuardLoadingScreen />;
  if (!session || !user) return <Navigate to="/login" replace state={{ from: location.pathname }} />;
  if (user.isAdmin) return <Navigate to="/admin/dashboard" replace />;
  if (!user.approvedRoles.includes(role)) return <Navigate to="/choose-role" replace />;

  if (checkState === "incomplete") {
    return <Navigate to={`/${role}/edit-profile?setup=true`} replace />;
  }

  return <Outlet />;
}
