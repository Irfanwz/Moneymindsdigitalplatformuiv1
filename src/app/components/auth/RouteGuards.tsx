import { Navigate, Outlet, useLocation } from "react-router-dom";

import { useAuth } from "@/app/contexts/AuthContext";
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

  if (isLoading) {
    return <GuardLoadingScreen />;
  }

  if (!session || !user) {
    return <Navigate to="/login" replace state={{ from: location.pathname }} />;
  }

  if (user.isAdmin) {
    return <Navigate to="/admin/dashboard" replace />;
  }

  if (user.status !== "approved") {
    return <Navigate to="/login" replace />;
  }

  return <Outlet />;
}

export function RequireAdmin() {
  const { isLoading, session, user } = useAuth();
  const location = useLocation();

  if (isLoading) {
    return <GuardLoadingScreen />;
  }

  if (!session || !user) {
    return <Navigate to="/login?mode=admin" replace state={{ from: location.pathname }} />;
  }

  if (!user.isAdmin) {
    return <Navigate to="/choose-role" replace />;
  }

  return <Outlet />;
}

export function RequireRole({ role }: { role: AppRole }) {
  const { isLoading, session, user } = useAuth();
  const location = useLocation();

  if (isLoading) {
    return <GuardLoadingScreen />;
  }

  if (!session || !user) {
    return <Navigate to="/login" replace state={{ from: location.pathname }} />;
  }

  if (user.isAdmin) {
    return <Navigate to="/admin/dashboard" replace />;
  }

  if (!user.approvedRoles.includes(role)) {
    return <Navigate to="/choose-role" replace />;
  }

  return <Outlet />;
}
