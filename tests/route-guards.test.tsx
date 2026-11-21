import React from "react";
import { renderToStaticMarkup } from "react-dom/server";
import { expect, it, vi } from "vitest";
import { RequireRole } from "../src/app/components/auth/RouteGuards";
const state = vi.hoisted(() => ({ auth: {} as any }));
vi.mock("../src/app/contexts/AuthContext", () => ({ useAuth: () => state.auth }));
vi.mock("react-router-dom", () => ({
  Navigate: ({ to }: { to: string }) => <div>Redirect: {to}</div>,
  Outlet: () => <div>Protected page</div>,
  useLocation: () => ({ pathname: "/advisor/dashboard", search: "" }),
}));
it.each(["advisor", "startup", "investor"] as const)("redirects signed-out %s visitors instead of showing an endless profile spinner", role => {
  state.auth = { isLoading: false, session: null, user: null };
  const result = renderToStaticMarkup(<RequireRole role={role} />);
  expect(result).toContain("Redirect: /login");
  expect(result).not.toContain("Loading your session");
});
it("keeps session hydration loading and redirects a user with the wrong role", () => {
  state.auth = { isLoading: true, session: null, user: null };
  expect(renderToStaticMarkup(<RequireRole role="advisor" />)).toContain("Loading your session");
  state.auth = { isLoading: false, session: {}, user: { approvedRoles: ["investor"] } };
  expect(renderToStaticMarkup(<RequireRole role="advisor" />)).toContain("Redirect: /choose-role");
});
